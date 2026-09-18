// Uploads the built site to COS under a single prefix.
//
// New rule (2026-09-18): the bucket mirrors dist/ 1:1, so every asset URL is
//   https://<bucket>.cos.<region>.myqcloud.com/dist/<path-inside-dist>
// and nothing else. src/lib/assetCdn.ts relies on exactly this layout.
//
// Usage:
//   COS_BUCKET=do-studio-1453848501 COS_REGION=ap-shanghai \
//   COS_SECRET_ID=... COS_SECRET_KEY=... node scripts/upload-dist-to-cos.mjs
//
// Optional:
//   COS_DIST_PREFIX   remote prefix, defaults to `dist`
//   COS_UPLOAD_CONCURRENCY  parallel uploads, defaults to 8
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import COS from 'cos-nodejs-sdk-v5';

const root = process.cwd();
const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const bucket = required('COS_BUCKET');
const region = required('COS_REGION');
const secretId = required('COS_SECRET_ID');
const secretKey = required('COS_SECRET_KEY');
const prefix = (process.env.COS_DIST_PREFIX || 'dist').replace(/^\/+|\/+$/g, '');
const concurrency = Number(process.env.COS_UPLOAD_CONCURRENCY || 8);
const localDir = 'dist';
// Cache policy per object role. index.html must always revalidate (it is the
// single inlined bundle, so long caching would freeze the whole site), the
// manifest refreshes quickly, and everything else is versioned by content hash
// in its URL, which makes it safe to cache immutably for a year.
const CACHE_POLICY = {
  html: 'no-cache, must-revalidate',
  manifest: 'max-age=60, stale-while-revalidate=86400',
  asset: 'public, max-age=31536000, immutable',
};

function cacheControlFor(relative) {
  const base = relative.split('/').pop() || '';
  if (base === 'index.html') return CACHE_POLICY.html;
  if (base === 'manifest.json') return CACHE_POLICY.manifest;
  return CACHE_POLICY.asset;
}

const cacheControl = 'public, max-age=31536000, immutable';

const contentType = (file) => ({
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.json': 'application/json',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}[path.extname(file).toLowerCase()] || 'application/octet-stream');

const walk = async (dir) => {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
};

const relativeOf = (full) => path.relative(localDir, full).split(path.sep).join('/');

const files = (await walk(localDir)).map((full) => ({
  local: full.split(path.sep).join('/'),
  key: `${prefix}/${relativeOf(full)}`,
  relative: relativeOf(full),
}));

const cos = new COS({ SecretId: secretId, SecretKey: secretKey });
const headObject = (key) => new Promise((resolve) => {
  cos.headObject({ Bucket: bucket, Region: region, Key: key }, (error, data) => resolve(error ? null : data));
});
const putObject = (file, body, control) => new Promise((resolve, reject) => {
  cos.putObject({
    Bucket: bucket,
    Region: region,
    Key: file.key,
    Body: body,
    ContentType: contentType(file.local),
    CacheControl: control,
  }, (error, data) => (error ? reject(error) : resolve(data)));
});

// Rewrites the metadata of an existing object without re-sending its body.
const putObjectCopy = (key, control) => new Promise((resolve, reject) => {
  cos.putObjectCopy({
    Bucket: bucket,
    Region: region,
    Key: key,
    CopySource: `${bucket}.cos.${region}.myqcloud.com/${key.split('/').map(encodeURIComponent).join('/')}`,
    MetadataDirective: 'Replaced',
    CacheControl: control,
  }, (error, data) => (error ? reject(error) : resolve(data)));
});

let uploaded = 0;
let skipped = 0;
let metadataFixed = 0;
let uploadedBytes = 0;
const failures = [];

const run = async (file) => {
  const desired = cacheControlFor(file.relative);
  const body = await fs.readFile(path.resolve(root, file.local));
  const remote = await headObject(file.key);
  // COS returns the MD5 as ETag for simple (non-multipart) uploads, so an
  // unchanged file can be skipped instead of re-sending hundreds of MB.
  const localMd5 = crypto.createHash('md5').update(body).digest('hex');
  if (remote && String(remote.ETag || '').replace(/"/g, '') === localMd5) {
    const current = String(remote.CacheControl ?? remote.headers?.['cache-control'] ?? '').trim();
    if (!current || current === desired) {
      skipped += 1;
      return;
    }
    // Body is already correct, only the cache policy drifted.
    await putObjectCopy(file.key, desired);
    metadataFixed += 1;
    return;
  }
  await putObject(file, body, desired);
  uploaded += 1;
  uploadedBytes += body.byteLength;
};

const queue = [...files];
const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
  while (queue.length) {
    const file = queue.shift();
    try {
      await run(file);
    } catch (error) {
      failures.push(`${file.local}: ${error.message}`);
    }
  }
});
await Promise.all(workers);

// The bucket is publicly readable but does NOT allow anonymous LIST, so keep a
// committed copy of every remote key — `npm run assets:restore` reads it to
// rebuild /public after a fresh clone without needing any credentials.
const assetList = files
  .map((file) => file.key.slice(prefix.length + 1))
  .filter((relative) => relative && relative !== 'index.html')
  .sort();
await fs.writeFile(
  path.join(root, 'scripts', 'remote-asset-manifest.txt'),
  `${assetList.join('\n')}\n`,
);
console.log(`manifest    : ${assetList.length} keys -> scripts/remote-asset-manifest.txt`);

console.log(`bucket      : ${bucket} (${region})`);
console.log(`prefix      : ${prefix}/`);
console.log(`scanned     : ${files.length} files`);
console.log(`uploaded    : ${uploaded} files (${(uploadedBytes / 1024 / 1024).toFixed(2)} MB)`);
console.log(`unchanged   : ${skipped} files`);
if (metadataFixed) console.log(`metadata    : ${metadataFixed} cache-control refresh (no body re-upload)`);
if (failures.length) {
  console.log(`failed      : ${failures.length}`);
  for (const line of failures.slice(0, 20)) console.log(`  ${line}`);
  process.exitCode = 1;
}
