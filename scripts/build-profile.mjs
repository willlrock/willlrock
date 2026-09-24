import { readFile, writeFile } from 'node:fs/promises';

// The original portrait stays editable in source_ascii.txt. All four banners
// are generated together so their content and layout cannot drift apart.
const root = new URL('../', import.meta.url);
const rows = (await readFile(new URL('source_ascii.txt', root), 'utf8'))
  .replace(/\r/g, '').trimEnd().split('\n');
if (rows.length !== 150 || rows.some((row) => row.length !== 300)) {
  throw new Error('The portrait must contain 150 rows of 300 characters.');
}
// Average 2x2 cells rather than dropping every other line: this preserves
// facial detail while keeping the glyphs visible at GitHub profile widths.
const density = " .',;:clodxkO0KX";
const portraitRows = [];
for (let y = 0; y < rows.length; y += 2) {
  let row = '';
  for (let x = 0; x < rows[y].length; x += 2) {
    const levels = [rows[y][x], rows[y][x + 1], rows[y + 1][x], rows[y + 1][x + 1]]
      .map((char) => density.indexOf(char));
    if (levels.includes(-1)) throw new Error('Unsupported ASCII portrait character.');
    row += density[Math.round(levels.reduce((a, b) => a + b, 0) / 4)];
  }
  portraitRows.push(row);
}

const palettes = {
  dark: {
    bg: '#0d1117', surface: '#111e19', border: '#2d4236',
    ink: '#f0f6fc', muted: '#a5b5ac', accent: '#7ee787',
    art: '#79d99a', project: '#142a1e', red: '#f07878', amber: '#e6bd65',
  },
  light: {
    bg: '#f7faf8', surface: '#edf5ef', border: '#b9cdbf',
    ink: '#172d21', muted: '#496452', accent: '#176c35',
    art: '#24633d', project: '#e4f2e8', red: '#b44747', amber: '#997024',
  },
};

const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function portrait(x, y, size, colors) {
  const step = size / portraitRows.length;
  const lines = portraitRows.map((row, index) =>
    `    <tspan x="${x}" y="${(y + step * (index + 0.8)).toFixed(3)}" textLength="${size}" lengthAdjust="spacingAndGlyphs">${escape(row)}</tspan>`
  ).join('\n');
  return `  <g aria-hidden="true">
  <rect x="${x - 8}" y="${y - 8}" width="${size + 16}" height="${size + 16}" rx="4" fill="${colors.surface}"/>
  <text xml:space="preserve" font-family="Consolas, 'DejaVu Sans Mono', monospace" font-size="${(step * 0.84).toFixed(3)}" font-weight="700" fill="${colors.art}">
${lines}
  </text>
  <path d="M${x - 9} ${y + 13}v-22h22 M${x + size - 13} ${y - 9}h22v22 M${x - 9} ${y + size - 13}v22h22 M${x + size - 13} ${y + size + 9}h22v-22" fill="none" stroke="${colors.accent}" stroke-width="1.5"/>
  </g>`;
}

function banner(theme, mobile) {
  const c = palettes[theme];
  const w = mobile ? 420 : 900;
  const h = mobile ? 740 : 500;
  const text = (x, y, size, value, color = c.ink, weight = 400, extra = '') =>
    `  <text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${escape(value)}</text>`;
  const header = [
    text(24, 33, mobile ? 13 : 15, 'willlrock@tashkent:~', c.muted),
    `  <g aria-hidden="true"><circle cx="${w - 66}" cy="27" r="4" fill="${c.red}"/><circle cx="${w - 48}" cy="27" r="4" fill="${c.amber}"/><circle cx="${w - 30}" cy="27" r="4" fill="${c.accent}"/></g>`,
    `  <path d="M1 53H${w - 1}" stroke="${c.border}"/>`,
  ];
  const content = mobile ? [
    portrait(70, 82, 280, c),
    text(28, 410, 36, 'XURSHID', c.accent, 700),
    text(28, 448, 36, 'MUHAMMADIYEV', c.ink, 700),
    text(28, 486, 19, 'System Administrator'),
    text(28, 514, 19, 'Network Engineer'),
    `  <path d="M28 537H392" stroke="${c.border}"/>`,
    text(28, 565, 16, 'Linux / Docker / MikroTik', c.muted),
    text(28, 591, 16, 'Python / DevOps / AI', c.muted),
    `  <rect x="20" y="614" width="380" height="68" rx="6" fill="${c.project}"/>`,
    text(34, 640, 17, '$ building: SIGAMIZ', c.accent, 700),
    text(34, 665, 14, 'A roommate map for students', c.muted),
    text(28, 716, 13, 'Tashkent, Uzbekistan', c.muted),
  ] : [
    portrait(36, 82, 332, c),
    text(412, 106, 17, '$ whoami', c.accent, 700),
    text(410, 153, 42, 'XURSHID', c.accent, 700),
    text(410, 200, 42, 'MUHAMMADIYEV', c.ink, 700),
    text(412, 242, 22, 'System Administrator'),
    text(412, 273, 22, 'Network Engineer'),
    `  <path d="M412 297H864" stroke="${c.border}"/>`,
    text(412, 330, 17, '$ stack', c.accent, 700),
    text(412, 360, 18, 'Linux / Docker / MikroTik', c.muted),
    text(412, 389, 18, 'Python / DevOps / AI', c.muted),
    `  <rect x="20" y="444" width="860" height="38" rx="6" fill="${c.project}"/>`,
    text(34, 469, 16, '$ building: SIGAMIZ', c.accent, 700),
    text(242, 469, 15, 'A roommate map for students', c.muted),
    text(864, 469, 13, 'Tashkent / UZ', c.muted, 400, 'text-anchor="end"'),
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title description">
  <title id="title">Xurshid Muhammadiyev — systems, networks, and automation</title>
  <desc id="description">ASCII portrait of Xurshid Muhammadiyev, a system administrator and network engineer in Tashkent. Linux, Docker, MikroTik, Python, DevOps, and AI. Building SIGAMIZ, a roommate map for students.</desc>
  <!-- Generated by scripts/build-profile.mjs from source_ascii.txt. -->
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="${c.bg}" stroke="${c.border}"/>
  <g font-family="Consolas, 'DejaVu Sans Mono', monospace">
${[...header, ...content].join('\n')}
  </g>
</svg>
`;
}

for (const theme of Object.keys(palettes)) {
  for (const mobile of [false, true]) {
    const name = `${theme}_${mobile ? 'mobile' : 'mode'}.svg`;
    await writeFile(new URL(name, root), banner(theme, mobile), 'utf8');
    console.log(`Generated ${name}`);
  }
}
