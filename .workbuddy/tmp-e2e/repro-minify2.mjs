// Test which source ordering / trick preserves the standard property.
import { createRequire } from 'node:module';
const req = createRequire('C:/Users/Administrator/Desktop/Codex 1/Design-main/node_modules/.pnpm/lightningcss@1.32.0/node_modules/lightningcss/package.json');
const lightningcss = req('lightningcss');

const cases = {
  'webkit-first': `.nav-links{-webkit-backdrop-filter:blur(18px) saturate(1.18);backdrop-filter:blur(18px) saturate(1.18);color:#fff}`,
  'standard-only': `.nav-links{backdrop-filter:blur(18px) saturate(1.18);color:#fff}`,
  'different-values': `.nav-links{backdrop-filter:blur(18px) saturate(1.18);-webkit-backdrop-filter:blur(18px) saturate(1.181);color:#fff}`,
};

for (const [name, code] of Object.entries(cases)) {
  const out = lightningcss.transform({ filename: 't.css', code: Buffer.from(code), minify: true, targets: { chrome: 90 << 16, safari: (14 << 16) } });
  console.log(`--- ${name} ---`);
  console.log(out.code.toString());
}
