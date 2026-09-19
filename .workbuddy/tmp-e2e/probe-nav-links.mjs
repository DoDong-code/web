// Decisive probe: what does the browser actually see for .nav-links?
import { createRequire } from 'node:module';
const workspaceRequire = createRequire('C:/Users/Administrator/.workbuddy/binaries/node/workspace/node_modules/');
const { chromium } = workspaceRequire('playwright-core');

const PAGE_URL = process.env.TARGET_URL || 'http://localhost:4173/';
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 836, height: 826 } });
await page.goto(PAGE_URL, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(2500);

const result = await page.evaluate(() => {
  const out = { sheetRules: [], aliasTest: {}, standardTest: {} };

  // 1. every CSS rule that mentions nav-links, verbatim from the CSSOM
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) {
      if (rule.cssText && rule.cssText.includes('nav-links')) {
        out.sheetRules.push(rule.cssText);
      }
    }
  }

  const el = document.querySelector('.nav-links');

  // 2. does Chrome honor inline -webkit-backdrop-filter?
  el.style.setProperty('-webkit-backdrop-filter', 'blur(6px)');
  out.aliasTest.webkitInline = getComputedStyle(el).backdropFilter;
  out.aliasTest.webkitInlineWebkit = getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter') || '(empty)';
  el.style.removeProperty('-webkit-backdrop-filter');

  // 3. sanity: inline standard property
  el.style.backdropFilter = 'blur(6px)';
  out.standardTest.standardInline = getComputedStyle(el).backdropFilter;
  el.style.backdropFilter = '';
  return out;
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
