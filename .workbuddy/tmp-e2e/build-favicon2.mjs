import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const req = createRequire('C:/Users/Administrator/.workbuddy/binaries/node/workspace/node_modules/');
const { chromium } = req('playwright-core');

const ROOT = 'C:/Users/Administrator/Desktop/Codex 1/Design-main';
const SRC = 'C:/Users/Administrator/Desktop/logo1.svg';

// 1. read official logo, strip xml decl
let svg = (await fs.readFile(SRC, 'utf8')).replace(/<\?xml[^>]*\?>\s*/, '').trim();

// 2. minify: round every number in path/rect attribute values to 1 decimal
const roundNums = (s) => s.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, (num) => {
  const v = parseFloat(num);
  if (!isFinite(v)) return num;
  return String(Math.round(v * 10) / 10);
});
svg = svg.replace(/<(path|rect)\b[^>]*>/g, (m) => m.replace(/(d|width|height|x|y)="[^"]*"/g, (a) => a.slice(0, a.indexOf('"') + 1) + roundNums(a.slice(a.indexOf('"') + 1, -1)) + '"'));

const outBytes = Buffer.byteLength(svg, 'ascii');
console.log('minified svg bytes:', outBytes);

// 3. write public/favicon.svg
await fs.writeFile(`${ROOT}/public/favicon.svg`, svg + '\n');

// 4. base64 data URI
const b64 = Buffer.from(svg, 'ascii').toString('base64');
console.log('b64 len:', b64.length);
await fs.writeFile(`${ROOT}/.workbuddy/tmp-e2e/favicon-svg-b64.txt`, 'data:image/svg+xml;base64,' + b64);

// 5. render verification: big preview + 16/32/64 strip + 32px PNG for fallback
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 300, height: 300 } });

const bigHtml = `<!doctype html><body style="margin:0;background:rgb(120,120,120);display:flex;justify-content:center;padding:20px">${svg.replace('<svg ', '<svg style="width:256px;height:256px" ')}</body>`;
await fs.writeFile(`${ROOT}/.workbuddy/tmp-e2e/favicon-big.html`, bigHtml);
await page.goto(pathToFileURL(`${ROOT}/.workbuddy/tmp-e2e/favicon-big.html`).href, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${ROOT}/.workbuddy/tmp-e2e/favicon-big.png` });

// small-size strip using <img> of the standalone svg file
const svgFileUrl = pathToFileURL(`${ROOT}/public/favicon.svg`).href;
const stripHtml = `<!doctype html><body style="margin:0;background:rgb(200,200,200);display:flex;gap:8px;align-items:center;padding:8px">${[64, 32, 16].map((s) => `<img src="${svgFileUrl}" style="width:${s}px;height:${s}px">`).join('')}</body>`;
await fs.writeFile(`${ROOT}/.workbuddy/tmp-e2e/favicon-strip.html`, stripHtml);
await page.setViewportSize({ width: 260, height: 110 });
await page.goto(pathToFileURL(`${ROOT}/.workbuddy/tmp-e2e/favicon-strip.html`).href, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${ROOT}/.workbuddy/tmp-e2e/favicon-strip.png` });

// 32px PNG for the Safari fallback data-URI
await fs.writeFile(`${ROOT}/.workbuddy/tmp-e2e/favicon-render32.html`, `<!doctype html><body style="margin:0"><img id="p" src="${svgFileUrl}" style="width:32px;height:32px;display:block"></body>`);
await page.setViewportSize({ width: 60, height: 60 });
await page.goto(pathToFileURL(`${ROOT}/.workbuddy/tmp-e2e/favicon-render32.html`).href, { waitUntil: 'networkidle' });
const pngBuf = await page.locator('#p').screenshot({ omitBackground: true });
await fs.writeFile(`${ROOT}/.workbuddy/tmp-e2e/favicon-32-raw.txt`, pngBuf.toString('base64'));
console.log('png32 bytes:', pngBuf.length);

await browser.close();
console.log('ALL DONE');
