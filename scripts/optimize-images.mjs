import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('public');
const rasterExtensions = new Set(['.png', '.jpg', '.jpeg']);
const generatedSuffix = /-(640|960|1280|1920)\.webp$/i;
let scanned = 0;
let converted = 0;
let beforeBytes = 0;
let afterBytes = 0;

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'optimized') await walk(filePath);
      continue;
    }
    const extension = path.extname(entry.name).toLowerCase();
    if (!rasterExtensions.has(extension) || generatedSuffix.test(entry.name)) continue;
    await optimize(filePath);
  }
}

async function optimize(filePath) {
  scanned += 1;
  const sourceStat = await fs.stat(filePath);
  beforeBytes += sourceStat.size;
  const metadata = await sharp(filePath).metadata();
  const directory = path.dirname(filePath);
  const baseName = path.basename(filePath, path.extname(filePath));
  const baseOutput = path.join(directory, `${baseName}.webp`);
  const widths = metadata.width && metadata.width > 960 ? [640, 960, 1280, 1920] : [null];

  for (const width of widths) {
    const output = width ? path.join(directory, `${baseName}-${width}.webp`) : baseOutput;
    const outputStat = await fs.stat(output).catch(() => null);
    if (outputStat && outputStat.mtimeMs >= sourceStat.mtimeMs) {
      afterBytes += outputStat.size;
      continue;
    }
    let pipeline = sharp(filePath, { animated: false });
    if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
    await pipeline.webp({ quality: 82, alphaQuality: 90, effort: 4 }).toFile(output);
    const resultStat = await fs.stat(output);
    afterBytes += resultStat.size;
    converted += 1;
  }
}

await walk(root);
console.log(JSON.stringify({ scanned, converted, beforeBytes, afterBytes }, null, 2));
