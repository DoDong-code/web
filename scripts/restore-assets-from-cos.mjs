// Pulls every asset back from COS into /public so `npm run dev` can render
// locally after a fresh clone (public/ is git-ignored, see .gitignore).
//
// Remote layout is the bucket's `dist/` prefix and maps 1:1 onto public/:
//   dist/hero/hero.webp                  -> public/hero/hero.webp
//   dist/motion-archive/manifest.json    -> public/motion-archive/manifest.json
//
// Objects are publicly readable, so no credentials are required. The bucket
// does NOT allow anonymous LIST though, so the object list comes either from
// the committed scripts/remote-asset-manifest.txt (default) or from a signed
// LIST when COS_SECRET_ID / COS_SECRET_KEY are present.
//
// Usage:
//   node scripts/restore-assets-from-cos.mjs
//
// Optional:
//   COS_BUCKET                  defaults to do-studio-1453848501
//   COS_REGION                  defaults to ap-shanghai
//   COS_DIST_PREFIX             defaults to dist
//   COS_SECRET_ID / COS_SECRET_KEY  enables authoritative LIST instead of the
//                                   committed manifest
//   COS_RESTORE_CONCURRENCY     parallel downloads, defaults to 8
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const bucket = process.env.COS_BUCKET || 'do-studio-1453848501';
const region = process.env.COS_REGION || 'ap-shanghai';
const secretId = process.env.COS_SECRET_ID;
const secretKey = process.env.COS_SECRET_KEY;
const prefix = (process.env.COS_DIST_PREFIX || 'dist').replace(/^\/+|\/+$/g, '');
const concurrency = Number(process.env.COS_RESTORE_CONCURRENCY || 8);
const base = `https://${bucket}.cos.${region}.myqcloud.com`;
const root = process.cwd();
const publicDir = path.join(root, 'public');
const manifestFile = path.join(root, 'scripts', 'remote-asset-manifest.txt');

async function listWithCredentials() {
  const COS = (await import('cos-nodejs-sdk-v5')).default;
  const cos = new COS({SecretId: secretId, SecretKey: secretKey});
  const relative = [];
  let marker = '';
  for (;;) {
    const data = await new Promise((resolve, reject) => {
      cos.getBucket(
        {Bucket: bucket, Region: region, Prefix: `${prefix}/`, MaxKeys: 1000, Marker: marker},
        (error, result) => (error ? reject(error) : resolve(result)),
      );
    });
    if (data && Array.isArray(data.Contents)) {
      for (const item of data.Contents) {
        if (typeof item.Key === 'string') relative.push(item.Key.slice(prefix.length + 1));
      }
    }
    if (!data || !data.IsTruncated) break;
    marker = data.NextMarker || '';
    if (!marker) break;
  }
  return relative.filter((value) => value && value !== 'index.html');
}

async function listAll() {
  if (secretId && secretKey) {
    const remote = await listWithCredentials();
    console.log(`Source      : signed LIST (${remote.length} objects)`);
    return remote;
  }
  const raw = await fs.readFile(manifestFile, 'utf8').catch(() => null);
  if (!raw) {
    throw new Error(
      `Missing ${path.relative(root, manifestFile)} and no COS_SECRET_ID / COS_SECRET_KEY to list the bucket. ` +
        'Run scripts/upload-dist-to-cos.mjs once to (re)generate the manifest.',
    );
  }
  const relative = raw.split('\n').map((line) => line.trim()).filter(Boolean);
  console.log(`Source      : committed manifest (${relative.length} objects)`);
  return relative;
}

async function download(relative) {
  const target = path.join(publicDir, relative);
  const url = `${base}/${prefix}/${relative.split('/').map(encodeURIComponent).join('/')}`;
  const head = await fetch(url, {method: 'HEAD'});
  if (!head.ok) return {relative, status: `error ${head.status}`};
  const remoteSize = Number(head.headers.get('content-length') || 0);
  const existing = await fs.stat(target).catch(() => null);
  if (existing && remoteSize > 0 && existing.size === remoteSize) {
    return {relative, status: 'cached'};
  }
  const res = await fetch(url);
  if (!res.ok) return {relative, status: `error ${res.status}`};
  await fs.mkdir(path.dirname(target), {recursive: true});
  await fs.writeFile(target, Buffer.from(await res.arrayBuffer()));
  return {relative, status: 'downloaded'};
}

const objects = await listAll();

let downloaded = 0;
let cached = 0;
const failures = [];
const queue = objects.slice();
const workers = Array.from({length: Math.max(1, Math.min(concurrency, queue.length))}, async () => {
  for (;;) {
    const relative = queue.shift();
    if (!relative) return;
    const result = await download(relative).catch((error) => ({
      relative,
      status: `error ${error.message}`,
    }));
    if (result.status === 'downloaded') downloaded += 1;
    else if (result.status === 'cached') cached += 1;
    else failures.push(`${result.relative} -> ${result.status}`);
  }
});
await Promise.all(workers);

console.log(`Target      : ${path.relative(root, publicDir)}/`);
console.log(`Downloaded  : ${downloaded}`);
console.log(`Cached      : ${cached}`);
console.log(`Failed      : ${failures.length}`);
if (failures.length) {
  for (const line of failures.slice(0, 20)) console.error(`  ${line}`);
  process.exitCode = 1;
}
