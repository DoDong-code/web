// Reproduce the minifier behavior on the .nav-links declaration.
import { createRequire } from 'node:module';
const req = createRequire('C:/Users/Administrator/Desktop/Codex 1/Design-main/node_modules/.pnpm/lightningcss@1.32.0/node_modules/lightningcss/package.json');
let lightningcss;
try { lightningcss = req('lightningcss'); } catch (e) { console.log('no lightningcss in project:', e.message); process.exit(0); }

const src = `.nav-links{backdrop-filter:blur(18px) saturate(1.18);-webkit-backdrop-filter:blur(18px) saturate(1.18);color:#fff}`;

console.log('=== default targets (no targets option) ===');
console.log(lightningcss.transform({ filename: 't.css', code: Buffer.from(src), minify: true }).code.toString());

console.log('=== targets: chrome 90, safari 14 ===');
console.log(lightningcss.transform({ filename: 't.css', code: Buffer.from(src), minify: true, targets: { chrome: 90 << 16, safari: (14 << 16) } }).code.toString());
