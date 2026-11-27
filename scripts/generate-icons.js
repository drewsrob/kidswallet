// scripts/generate-icons.js – erzeugt PWA-Icons aus public/favicon.svg
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

mkdirSync(publicDir, { recursive: true });

// Basis-SVG einlesen
const svgSrc = readFileSync(join(publicDir, 'favicon.svg'));

// Maskable-SVG: Icon auf ~60% zentriert auf weißem/lila Quadrat (safe zone)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#6c63ff"/>
  <g transform="translate(102,102) scale(12.8)">
    <g transform="translate(7,7) scale(0.75)" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <rect x="2" y="8" width="20" height="13" rx="2"/>
      <path d="M2 13h20"/>
      <path d="M14 16h3"/>
      <rect x="9" y="5" width="6" height="3" rx="1"/>
      <circle cx="12" cy="2.5" r="1.5" fill="#ffffff" stroke="none"/>
      <line x1="12" y1="4" x2="12" y2="5"/>
    </g>
  </g>
</svg>`;

const icons = [
  { file: 'icon-192.png',           size: 192, src: svgSrc },
  { file: 'icon-512.png',           size: 512, src: svgSrc },
  { file: 'icon-maskable-192.png',  size: 192, src: Buffer.from(maskableSvg) },
  { file: 'icon-maskable-512.png',  size: 512, src: Buffer.from(maskableSvg) },
];

for (const { file, size, src } of icons) {
  await sharp(src)
    .resize(size, size)
    .png()
    .toFile(join(publicDir, file));
  console.log(`✔ ${file}`);
}

console.log('Icons generiert!');
