#!/usr/bin/env node
// Android-Entwickler-Workflow ohne Android Studio: Web-Build, Capacitor-Sync, Gradle-Build
// und Update-Installation per ADB.
//
// Aufruf: node scripts/android.mjs <sync|build|release|install|run>

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID_DIR = join(ROOT, 'android');
const APK_DIR = join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk');
const IS_WINDOWS = process.platform === 'win32';

const capConfig = JSON.parse(readFileSync(join(ROOT, 'capacitor.config.json'), 'utf8'));
const APP_ID = capConfig.appId;

const color = (code) => (text) => (process.stdout.isTTY ? `\x1b[${code}m${text}\x1b[0m` : text);
const bold = color('1');
const green = color('32');
const red = color('31');
const yellow = color('33');

class AndroidError extends Error {}

function step(title) {
  console.log(`\n${bold('▶ ' + title)}`);
}

function run(command, args, { cwd = ROOT, env } = {}) {
  console.log(`  $ ${command} ${args.join(' ')}`);
  // shell ist unter Windows für .cmd/.bat (npm, npx, gradlew.bat) erforderlich
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: IS_WINDOWS,
    env: { ...process.env, ...env },
  });
  if (result.error) throw new AndroidError(`${command} konnte nicht gestartet werden: ${result.error.message}`);
  if (result.status !== 0) throw new AndroidError(`${command} ${args.join(' ')} ist fehlgeschlagen (Exit-Code ${result.status}).`);
}

function capture(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8' });
  if (result.error) throw new AndroidError(`${command} konnte nicht gestartet werden: ${result.error.message}`);
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

// ── Voraussetzungen ──────────────────────────────────────────────

function readSdkDirFromLocalProperties() {
  const file = join(ANDROID_DIR, 'local.properties');
  if (!existsSync(file)) return null;
  const match = readFileSync(file, 'utf8').match(/^sdk\.dir=(.+)$/m);
  // local.properties maskiert ':' und '\' (z. B. C\:\\Users\\…)
  return match ? match[1].trim().replace(/\\(.)/g, '$1') : null;
}

function findSdkDir() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    readSdkDirFromLocalProperties(),
    IS_WINDOWS && process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Android', 'Sdk'),
    process.platform === 'darwin' && join(homedir(), 'Library', 'Android', 'sdk'),
    process.platform === 'linux' && join(homedir(), 'Android', 'Sdk'),
  ].filter(Boolean);
  return candidates.find((dir) => existsSync(dir)) ?? null;
}

function findAdb() {
  const exe = IS_WINDOWS ? 'adb.exe' : 'adb';
  const sdkDir = findSdkDir();
  if (sdkDir) {
    const adb = join(sdkDir, 'platform-tools', exe);
    if (existsSync(adb)) return adb;
  }
  const onPath = spawnSync(exe, ['version'], { encoding: 'utf8' });
  if (!onPath.error && onPath.status === 0) return exe;
  throw new AndroidError(
    'ADB wurde nicht gefunden.\n' +
    'Bitte die Android SDK Platform-Tools installieren oder ANDROID_HOME auf das Android-SDK setzen.',
  );
}

// Gradle benötigt ein JDK (Capacitor 8: JDK 21). Fehlt JAVA_HOME, wird das JDK von Android Studio verwendet.
function gradleEnv() {
  if (process.env.JAVA_HOME && existsSync(process.env.JAVA_HOME)) return {};
  const studioJdks = [
    IS_WINDOWS && 'C:\\Program Files\\Android\\Android Studio\\jbr',
    process.platform === 'darwin' && '/Applications/Android Studio.app/Contents/jbr/Contents/Home',
    process.platform === 'linux' && '/opt/android-studio/jbr',
  ].filter(Boolean);
  const jdk = studioJdks.find((dir) => existsSync(dir));
  return jdk ? { JAVA_HOME: jdk } : {};
}

function checkProject() {
  if (!existsSync(join(ANDROID_DIR, IS_WINDOWS ? 'gradlew.bat' : 'gradlew'))) {
    throw new AndroidError(
      'Das Android-Projekt fehlt (android/gradlew nicht gefunden).\n' +
      'Einmalig anlegen mit: npx cap add android',
    );
  }
  if (!findSdkDir()) {
    throw new AndroidError(
      'Das Android-SDK wurde nicht gefunden.\n' +
      'Bitte ANDROID_HOME setzen oder sdk.dir in android/local.properties eintragen.',
    );
  }
}

// ── Gerät ────────────────────────────────────────────────────────

function parseDevices(output) {
  const lines = output.split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith('List of devices'));
  return lines
    .slice(start + 1)
    .map((line) => line.trim().split(/\s+/))
    .filter(([serial, state]) => serial && state && !serial.startsWith('*'))
    .map(([serial, state]) => ({ serial, state }));
}

// Manche USB-Treiber/Geräte verlieren die ADB-Verbindung zwischen Befehlen;
// ein Neustart des ADB-Servers stellt sie wieder her.
function restartAdb(adb, serial) {
  console.log(yellow('  ADB-Verbindung unterbrochen – ADB-Server wird neu gestartet …'));
  capture(adb, ['kill-server']);
  capture(adb, ['start-server']);
  spawnSync(adb, [...(serial ? ['-s', serial] : []), 'wait-for-device'], { timeout: 15000 });
}

function listDevices(adb) {
  const { status, output } = capture(adb, ['devices']);
  if (status !== 0) throw new AndroidError(`adb devices ist fehlgeschlagen:\n${output}`);
  return parseDevices(output);
}

function selectDevice(adb) {
  step('Angeschlossenes Gerät prüfen');
  let devices = listDevices(adb);
  if (!devices.some((d) => d.state === 'device')) {
    restartAdb(adb);
    devices = listDevices(adb);
  }
  const ready = devices.filter((d) => d.state === 'device');

  if (process.env.ANDROID_SERIAL) {
    const wanted = devices.find((d) => d.serial === process.env.ANDROID_SERIAL);
    if (!wanted || wanted.state !== 'device') {
      throw new AndroidError(`Das Gerät ANDROID_SERIAL=${process.env.ANDROID_SERIAL} ist nicht bereit.`);
    }
    console.log(`  Gerät: ${wanted.serial}`);
    return wanted.serial;
  }

  if (ready.length === 0) {
    if (devices.some((d) => d.state === 'unauthorized')) {
      throw new AndroidError(
        'Das Android-Gerät ist nicht autorisiert.\n' +
        'Bitte auf dem Smartphone die Abfrage „USB-Debugging zulassen?“ bestätigen.',
      );
    }
    throw new AndroidError(
      'Kein Android-Gerät gefunden.\n' +
      'Bitte USB-Debugging aktivieren oder ein Gerät verbinden.',
    );
  }
  if (ready.length > 1) {
    throw new AndroidError(
      `Mehrere Geräte verbunden: ${ready.map((d) => d.serial).join(', ')}\n` +
      'Bitte das Zielgerät über die Umgebungsvariable ANDROID_SERIAL festlegen.',
    );
  }
  console.log(`  Gerät: ${ready[0].serial}`);
  return ready[0].serial;
}

// ── Schritte ─────────────────────────────────────────────────────

function sync() {
  step('Web-App für Android bauen');
  // build:android setzt die Basis auf „/“, wie sie die Capacitor-WebView erwartet
  run('npm', ['run', 'build:android']);
  step('Capacitor Android synchronisieren');
  run('npx', ['cap', 'sync', 'android']);
}

function gradle(task) {
  step(`Gradle ${task}`);
  run(IS_WINDOWS ? 'gradlew.bat' : './gradlew', [task], { cwd: ANDROID_DIR, env: gradleEnv() });
}

function findApk(variant) {
  const dir = join(APK_DIR, variant);
  if (!existsSync(dir)) return null;
  const apks = readdirSync(dir)
    .filter((name) => name.endsWith('.apk'))
    .map((name) => join(dir, name))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return apks[0] ?? null;
}

function reportApk(variant) {
  const apk = findApk(variant);
  if (!apk) throw new AndroidError(`Keine APK in ${relative(ROOT, join(APK_DIR, variant))} gefunden.`);
  console.log(`\n${green('✔ APK erstellt:')} ${relative(ROOT, apk)}`);
  console.log(`  Ordner: ${relative(ROOT, dirname(apk))}${IS_WINDOWS ? '\\' : '/'}`);
  if (apk.endsWith('-unsigned.apk')) {
    console.log(yellow(
      '  Hinweis: Die Release-APK ist nicht signiert und lässt sich so nicht installieren.\n' +
      '  Für die Verteilung muss sie mit einem eigenen Keystore signiert werden.',
    ));
  }
  return apk;
}

function install(adb, serial, apk) {
  step('Vorhandene Installation aktualisieren');
  // -r ersetzt die App und behält ihre Daten (localStorage mit Kindern, Buchungen, Einstellungen)
  console.log(`  $ adb -s ${serial} install -r ${relative(ROOT, apk)}`);
  const attempt = () => {
    const result = capture(adb, ['-s', serial, 'install', '-r', apk]);
    process.stdout.write(result.output.replace(/^/gm, '  '));
    return result;
  };
  let { status, output } = attempt();
  if (status === 0 && /Success/.test(output)) return;
  // Ohne INSTALL_FAILED-Code hat Android die APK nicht abgelehnt, sondern die Verbindung ist abgebrochen
  if (!/INSTALL_FAILED|INSTALL_PARSE_FAILED|Failure \[/.test(output)) {
    restartAdb(adb, serial);
    ({ status, output } = attempt());
    if (status === 0 && /Success/.test(output)) return;
  }

  if (/INSTALL_FAILED_UPDATE_INCOMPATIBLE|signatures do not match/i.test(output)) {
    throw new AndroidError(
      'Die installierte App wurde mit einem anderen Schlüssel signiert (z. B. auf einem anderen Rechner gebaut).\n' +
      'Android erlaubt ein Update nur mit demselben Signaturschlüssel. Die vorhandene Installation\n' +
      'und ihre Daten wurden nicht verändert.\n' +
      'Lösung: Mit dem Schlüssel bauen, mit dem die installierte Version signiert wurde. Debug-Builds\n' +
      `verwenden ${join(homedir(), '.android', 'debug.keystore')} – diese Datei vom Rechner übernehmen,\n` +
      'auf dem die installierte Version gebaut wurde, und erneut „npm run android:install“ ausführen.',
    );
  }
  if (/INSTALL_FAILED_VERSION_DOWNGRADE/.test(output)) {
    throw new AndroidError('Auf dem Gerät ist eine neuere versionCode installiert als die gebaute APK.');
  }
  throw new AndroidError('Die Installation ist fehlgeschlagen (siehe Ausgabe oben).');
}

function launch(adb, serial) {
  step('App starten');
  const args = ['-s', serial, 'shell', 'am', 'start', '-n', `${APP_ID}/.MainActivity`];
  if (capture(adb, args).status !== 0) {
    restartAdb(adb, serial);
    if (capture(adb, args).status !== 0) {
      console.log(yellow('  Die App konnte nicht automatisch gestartet werden – bitte auf dem Gerät öffnen.'));
    }
  }
}

// ── Befehle ──────────────────────────────────────────────────────

const commands = {
  sync() {
    sync();
    console.log(`\n${green('✔ Android-Projekt synchronisiert.')}`);
  },
  build() {
    checkProject();
    sync();
    gradle('assembleDebug');
    reportApk('debug');
  },
  release() {
    checkProject();
    sync();
    gradle('assembleRelease');
    reportApk('release');
  },
  install() {
    checkProject();
    const adb = findAdb();
    // Gerät vorab prüfen, damit nicht erst minutenlang umsonst gebaut wird
    selectDevice(adb);
    sync();
    gradle('assembleDebug');
    const apk = reportApk('debug');
    // Erneut prüfen: Das Gerät könnte während des Builds getrennt worden sein
    const serial = selectDevice(adb);
    install(adb, serial, apk);
    launch(adb, serial);
    console.log(`\n${green('✔ KidsWallet wurde auf dem Gerät aktualisiert und gestartet.')}`);
  },
  run() {
    checkProject();
    sync();
    step('Auf Gerät oder Emulator ausführen');
    run('npx', ['cap', 'run', 'android'], { env: gradleEnv() });
  },
};

const name = process.argv[2];
if (!commands[name]) {
  console.error(`Verwendung: node scripts/android.mjs <${Object.keys(commands).join('|')}>`);
  process.exit(1);
}

const started = Date.now();
try {
  commands[name]();
  console.log(`  Dauer: ${Math.round((Date.now() - started) / 1000)} s`);
} catch (error) {
  if (!(error instanceof AndroidError)) throw error;
  console.error(`\n${red('✖ ' + error.message)}`);
  process.exit(1);
}
