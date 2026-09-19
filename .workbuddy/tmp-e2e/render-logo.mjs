// Render the official logo.svg at favicon sizes to verify appearance.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';

const req = createRequire('C:/Users/Administrator/.workbuddy/binaries/node/workspace/node_modules/');
const { chromium } = req('playwright-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const LOGO = 'C:/Users/Administrator/Desktop/logo.svg';
const logoUrl = pathToFileURL(LOGO).href;

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 400, height: 250 } });

// transparen bg
await page.setContent(
  `<body style="margin:0;background:conic-gradient(#ddd,#fff,#ddd);display:flex;gap:10px;align-items:center;padding:10px">
   <img id="t" src="${logoUrl}" style="width:64px;height:64px">
   <img id="d" src="${logoUrl}" style="width:16px;height:16px"></body>`,
  { waitUntil: 'networkidle' }
);
await page.locator('#t').screenshot({ path: 'C:/Users/Administrator/Desktop/Codex 1/Design-main/.workbuddy/tmp-e2e/logo-64.png' });
await page.locator('#d').screenshot({ path: 'C:/Users/Administrator/Desktop/Codex 1/Design-main/.workbuddy/tmp-e2e/logo-16.png' });

// on dark bg (brand navy) to match tab look
await page.setContent(
  `<body style="margin:0;background:#0a121a;display:flex;gap:10px;align-items:center;padding:10px">
   <img id="t2" src="${logoUrl}" style="width:64px;height:64px">
   <img id="d2" src="${logoUrl}" style="width:16px;height:16px"></body>`,
  { waitUntil: 'networkidle' }
);
await page.locator('#t2').screenshot({ path: 'C:/Users/Administrator/Desktop/Codex 1/Design-main/.workbuddy/tmp-e2e/logo-64-dark.png' });

console.log('DONE');
await browser.close();
