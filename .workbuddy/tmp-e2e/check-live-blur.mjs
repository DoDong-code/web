// Live-site nav blur verification (read-only).
// Opens the production index.html from COS in headless Chrome and reports
// computed backdrop-filter state for nav-ish elements, plus screenshots.
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';

const workspaceRequire = createRequire('C:/Users/Administrator/.workbuddy/binaries/node/workspace/node_modules/');
const { chromium } = workspaceRequire('playwright-core');

const PAGE_URL = process.env.TARGET_URL || 'https://do-studio-1453848501.cos.ap-shanghai.myqcloud.com/dist/index.html';
const OUT = process.cwd().replaceAll('\\', '/') + '/.workbuddy/tmp-e2e/';

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 836, height: 826 } });
await page.goto(PAGE_URL, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(4000); // let entry animations settle

const report = await page.evaluate(() => {
  const out = { found: [] };
  const sels = ['.nav', '.nav-links', 'header', 'nav'];
  for (const sel of sels) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const cs = getComputedStyle(el);
    out.found.push({
      sel,
      backdropFilter: cs.backdropFilter,
      webkitBackdropFilter: cs.webkitBackdropFilter || null,
      background: cs.backgroundColor,
      position: cs.position,
      zIndex: cs.zIndex,
      isolation: cs.isolation,
      rect: el.getBoundingClientRect().toJSON(),
    });
  }
  // any element actually carrying a backdrop-filter in computed style
  let carrying = 0;
  const samples = [];
  for (const el of document.querySelectorAll('*')) {
    const bf = getComputedStyle(el).backdropFilter;
    if (bf && bf !== 'none') {
      carrying += 1;
      if (samples.length < 8) samples.push({ tag: el.tagName, cls: String(el.className).slice(0, 80), bf });
    }
  }
  out.elementsCarryingBackdropFilter = carrying;
  out.samples = samples;
  out.scrollHeight = document.documentElement.scrollHeight;
  return out;
});

console.log(JSON.stringify(report, null, 2));
await page.screenshot({ path: OUT + 'live-top.png' });

// scroll so content sits behind the nav, then re-shoot (matches user's 2nd screenshot)
await page.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight * 0.9)));
await page.waitForTimeout(1500);
await page.screenshot({ path: OUT + 'live-scrolled.png' });

const scrolledBf = await page.evaluate(() => {
  const el = document.querySelector('.nav-links');
  return el ? getComputedStyle(el).backdropFilter : 'NO .nav-links';
});
console.log('scrolled .nav-links backdropFilter =', scrolledBf);

await browser.close();
await fs.writeFile(OUT + 'live-report.json', JSON.stringify(report, null, 2));
console.log('done ->', OUT);
