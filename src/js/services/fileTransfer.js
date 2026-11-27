// services/fileTransfer.js – Dateien speichern und auswählen (Web + Android-App)
//
// Web/PWA: Download über einen temporären Link.
// Android (Capacitor): Die WebView kann keine Downloads speichern. Die Datei wird
// deshalb im App-Cache abgelegt und über das System-Teilen-Menü angeboten
// (z. B. „In Dateien speichern“, Google Drive, E-Mail).

import { Capacitor } from '@capacitor/core';

export class FileTransferCancelled extends Error {
  constructor() { super('cancelled'); this.name = 'FileTransferCancelled'; }
}

/**
 * Textdatei auf dem Gerät speichern.
 * @throws {FileTransferCancelled} wenn der Nutzer das Teilen abbricht
 */
export async function saveTextFile(fileName, text, { mimeType = 'application/json', title } = {}) {
  if (Capacitor.isNativePlatform()) {
    const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([
      import('@capacitor/filesystem'),
      import('@capacitor/share'),
    ]);
    const { uri } = await Filesystem.writeFile({
      path: fileName, data: text, directory: Directory.Cache, encoding: Encoding.UTF8,
    });
    try {
      await Share.share({ title: title ?? fileName, files: [uri], dialogTitle: title ?? fileName });
    } catch (err) {
      if (/cancel/i.test(err?.message ?? '')) throw new FileTransferCancelled();
      throw err;
    }
    return;
  }

  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName, hidden: true });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Datei auswählen und als Text einlesen.
 * @returns {Promise<{ name: string, text: string } | null>} null, wenn nichts ausgewählt wurde
 */
export function pickTextFile({ accept = 'application/json,.json' } = {}) {
  return new Promise((resolve, reject) => {
    const input = Object.assign(document.createElement('input'), { type: 'file', accept, hidden: true });
    let settled = false;
    const done = (fn, value) => {
      if (settled) return;
      settled = true;
      input.remove();
      fn(value);
    };
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return done(resolve, null);
      try { done(resolve, { name: file.name, text: await file.text() }); }
      catch (err) { done(reject, err); }
    });
    input.addEventListener('cancel', () => done(resolve, null));
    // Fallback für Browser ohne „cancel“-Ereignis: nach Rückkehr ins Fenster ohne Auswahl abbrechen
    window.addEventListener('focus', () => {
      setTimeout(() => { if (!input.files?.length) done(resolve, null); }, 1000);
    }, { once: true });
    document.body.appendChild(input);
    input.click();
  });
}
