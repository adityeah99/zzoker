import sharp from 'sharp';
import { writeFileSync } from 'fs';

// SVG icon: black background, red music note
const svgIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#000000"/>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#grad)"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Music note -->
  <g transform="translate(${size * 0.5}, ${size * 0.5})">
    <!-- Note head -->
    <ellipse cx="${-size * 0.08}" cy="${size * 0.18}" rx="${size * 0.12}" ry="${size * 0.085}" fill="#fc3c44" transform="rotate(-15, ${-size * 0.08}, ${size * 0.18})"/>
    <!-- Note stem -->
    <rect x="${size * 0.038}" y="${-size * 0.22}" width="${size * 0.045}" height="${size * 0.38}" fill="#fc3c44" rx="${size * 0.02}"/>
    <!-- Note flag -->
    <path d="M${size * 0.083} ${-size * 0.22} Q${size * 0.25} ${-size * 0.12} ${size * 0.083} ${-size * 0.04}" stroke="#fc3c44" stroke-width="${size * 0.042}" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  const svg = Buffer.from(svgIcon(size));
  await sharp(svg)
    .png()
    .toFile(`public/icons/${name}`);
  console.log(`✅ Generated public/icons/${name}`);
}
