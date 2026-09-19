// Build favicon.svg = brand navy rounded square + official logo mark,
// render it at multiple sizes, and emit base64 payloads for index.html.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';

const req = createRequire('C:/Users/Administrator/.workbuddy/binaries/node/workspace/node_modules/');
const { chromium } = req('playwright-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = 'C:/Users/Administrator/Desktop/Codex 1/Design-main';

// --- 1. compose favicon.svg ---
const raw = readFileSync('C:/Users/Administrator/Desktop/logo.svg', 'utf8')
  .replace(/<\?xml[^>]*\?>\s*/, '')
  // strip the no-op full-canvas clipPath wrapper
  .replace(/<defs>[\s\S]*?<\/defs>/, '')
  .replace(/<g clip-path="url\(#clip_path_1\)">/, '')
  .replace(/\n\s*<\/g>\s*<\/svg>\s*$/, '\n</svg>');

// mark canvas bbox (after internal translate(41 53)): x 65..528, y 36..459
// scale 557-canvas into 64 viewBox with ~6.4 margin; center the mark bbox
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0a121a"/>
  <g transform="translate(4.72 9.24) scale(0.092)" fill="none">
    ${raw.replace(/<svg[^>]*>/, '').replace('</svg>', '')}
  </g>
</svg>
`;
writeFileSync(`${ROOT}/public/favicon.svg`, faviconSvg);
console.log('favicon.svg bytes:', faviconSvg.length);

// --- 2. render check ---
const svgUrl = pathToFileURL(`${ROOT}/public/favicon.svg`).href;
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 400, height: 130 } });

const html = `<!doctype html><html><body style="margin:0;background:rgb(235,235,235);display:flex;gap:10px;align-items:center;padding:10px">
${[16, 32, 64].map((s) => `<img id="s${s}" src="${svgUrl}" style="width:${s}px;height:${s}px">`).join('\n')}
</body></html>`;
writeFileSync(`${ROOT}/.workbuddy/tmp-e2e/favicon-preview.html`, html);
await page.goto(pathToFileURL(`${ROOT}/.workbuddy/tmp-e2e/favicon-preview.html`).href, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${ROOT}/.workbuddy/tmp-e2e/favicon-preview.png` });

// --- 3. 32px PNG on transparent bg for data-URI ---
const html2 = `<!doctype html><img id="p" src="${svgUrl}" style="width:32px;height:32px">`;
writeFileSync(`${ROOT}/.workbuddy/tmp-e2e/favicon-render32.html`, html2);
await page.goto(pathToFileURL(`${ROOT}/.workbuddy/tmp-e2e/favicon-render32.html`).href, { waitUntil: 'networkidle' });
const buf = await page.locator('#p').screenshot({ omitBackground: true });
writeFileSync(`${ROOT}/.workbuddy/tmp-e2e/favicon-32-raw.txt`, buf.toString('base64'));
console.log('png32 base64 length:', buf.toString('base64').length);

await browser.close();
console.log('DONE');
