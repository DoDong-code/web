// Render public/favicon.svg to PNGs at multiple sizes with headless Chrome,
// and emit the base64 payloads needed for inline data-URI favicons.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';

const req = createRequire('C:/Users/Administrator/.workbuddy/binaries/node/workspace/node_modules/');
const { chromium } = req('playwright-core');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SVG = 'C:/Users/Administrator/Desktop/Codex 1/Design-main/public/favicon.svg';
const svgUrl = pathToFileURL(SVG).href;

const sizes = [16, 32, 64, 180];
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 400, height: 250 } });

const html = `<!doctype html><html><body style="margin:0;background:#888;display:flex;gap:8px;align-items:center;padding:8px">
${sizes.map((s) => `<img id="s${s}" src="${svgUrl}" style="width:${s}px;height:${s}px">`).join('\n')}
</body></html>`;
const tmpHtml = 'C:/Users/Administrator/Desktop/Codex 1/Design-main/.workbuddy/tmp-e2e/favicon-page.html';
writeFileSync(tmpHtml, html);
await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: 'networkidle' });

for (const s of sizes) {
  const el = page.locator(`#s${s}`);
  await el.screenshot({ path: `C:/Users/Administrator/Desktop/Codex 1/Design-main/.workbuddy/tmp-e2e/favicon-${s}.png`, omitBackground: false });
}

// 32px standalone render on transparent bg for the data-URI fallback
const tmpHtml2 = 'C:/Users/Administrator/Desktop/Codex 1/Design-main/.workbuddy/tmp-e2e/favicon-page2.html';
writeFileSync(tmpHtml2, `<img id="p" src="${svgUrl}" style="width:32px;height:32px">`);
await page.goto(pathToFileURL(tmpHtml2).href, { waitUntil: 'networkidle' });
const buf = await page.locator('#p').screenshot({ omitBackground: true });
writeFileSync('C:/Users/Administrator/Desktop/Codex 1/Design-main/.workbuddy/tmp-e2e/favicon-32-raw.txt', buf.toString('base64'));
console.log('png32 base64 length:', buf.toString('base64').length);

await browser.close();
console.log('DONE');
