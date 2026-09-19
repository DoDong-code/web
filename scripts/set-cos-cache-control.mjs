// Sets the correct Cache-Control on objects that are already in the bucket.
//
// Nothing is re-uploaded: each object is copied onto itself with
// MetadataDirective=Replaced, which only rewrites the metadata. Bodies, keys
// and directory layout are untouched.
//
// Policy:
//   index.html                 -> no-cache, must-revalidate
//   */manifest.json            -> max-age=60, stale-while-revalidate=86400
//   everything else            -> public, max-age=31536000, immutable
//
// Usage:
//   COS_SECRET_ID=... COS_SECRET_KEY=... node scripts/set-cos-cache-control.mjs
//
// Flags:
//   --apply          actually write (default is a dry run)
//   --limit <n>      only touch the first n objects that need a change
//
// Optional env:
//   COS_BUCKET, COS_REGION, COS_DIST_PREFIX, COS_CACHE_CONCURRENCY
import process from 'node:process';
import COS from 'cos-nodejs-sdk-v5';

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const bucket = process.env.COS_BUCKET || 'do-studio-1453848501';
const region = process.env.COS_REGION || 'ap-shanghai';
const secretId = required('COS_SECRET_ID');
const secretKey = required('COS_SECRET_KEY');
const prefix = (process.env.COS_DIST_PREFIX || 'dist').replace(/^\/+|\/+$/g, '');
const concurrency = Number(process.env.COS_CACHE_CONCURRENCY || 4);
const apply = process.argv.includes('--apply');
const limitFlag = process.argv.indexOf('--limit');
const limit = limitFlag >= 0 ? Number(process.argv[limitFlag + 1]) : Number.POSITIVE_INFINITY;

const CACHE_POLICY = {
  html: 'no-cache, must-revalidate',
  manifest: 'max-age=60, stale-while-revalidate=86400',
  asset: 'public, max-age=31536000, immutable',
};

const desiredFor = (key) => {
  const base = key.split('/').pop() || '';
  if (base === 'index.html') return CACHE_POLICY.html;
  if (base === 'manifest.json') return CACHE_POLICY.manifest;
  return CACHE_POLICY.asset;
};

const cos = new COS({SecretId: secretId, SecretKey: secretKey});

async function listAll() {
  const keys = [];
  let marker = '';
  for (;;) {
    const data = await new Promise((resolve, reject) => {
      cos.getBucket(
        {Bucket: bucket, Region: region, Prefix: `${prefix}/`, MaxKeys: 1000, Marker: marker},
        (error, result) => (error ? reject(error) : resolve(result)),
      );
    });
    if (data && Array.isArray(data.Contents)) {
      for (const item of data.Contents) if (item.Key) keys.push(item.Key);
    }
    if (!data || !data.IsTruncated) break;
    marker = data.NextMarker || '';
    if (!marker) break;
  }
  return keys;
}

const headMetadata = (key) => new Promise((resolve) => {
  cos.headObject({Bucket: bucket, Region: region, Key: key}, (error, data) => resolve(error ? null : data));
});

const typeOf = (head) => String(
  head?.ContentType ?? head?.headers?.['content-type'] ?? '',
).trim();

// MetadataDirective=Replaced rewrites the whole metadata set, so anything we
// do not restate here falls back to the server default. Re-send the current
// Content-Type to keep <video>/<img> handling byte-identical after the copy.
const rewriteMetadata = (key, control, contentType) => new Promise((resolve, reject) => {
  cos.putObjectCopy({
    Bucket: bucket,
    Region: region,
    Key: key,
    CopySource: `${bucket}.cos.${region}.myqcloud.com/${key.split('/').map(encodeURIComponent).join('/')}`,
    MetadataDirective: 'Replaced',
    CacheControl: control,
    ...(contentType ? {ContentType: contentType} : {}),
  }, (error, data) => (error ? reject(error) : resolve(data)));
});

const keys = await listAll();
console.log(`bucket      : ${bucket} (${region})`);
console.log(`prefix      : ${prefix}/`);
console.log(`scanned     : ${keys.length} objects`);
console.log(`mode        : ${apply ? 'APPLY' : 'dry run (add --apply to write)'}`);

const toFix = [];
let already = 0;
const queue = keys.slice();
const workers = Array.from({length: Math.max(1, Math.min(concurrency, queue.length))}, async () => {
  for (;;) {
    const key = queue.shift();
    if (!key) return;
    const desired = desiredFor(key);
    const head = await headMetadata(key);
    const current = String(head?.CacheControl ?? head?.headers?.['cache-control'] ?? '').trim();
    if (current === desired) already += 1;
    else toFix.push({key, current: current || '(none)', desired, contentType: typeOf(head)});
  }
});
await Promise.all(workers);

console.log(`already ok  : ${already}`);
console.log(`need change : ${toFix.length}`);
for (const item of toFix.slice(0, 20)) {
  console.log(`  ${item.key}\n    ${item.current}  ->  ${item.desired}`);
}
if (toFix.length > 20) console.log(`  ... ${toFix.length - 20} more`);

if (!apply) {
  console.log('\nDry run complete, nothing was written.');
  process.exit(0);
}

const targets = toFix.slice(0, Number.isFinite(limit) ? limit : toFix.length);
let fixed = 0;
const failures = [];
const writeQueue = targets.slice();
const writers = Array.from({length: Math.max(1, Math.min(concurrency, writeQueue.length))}, async () => {
  for (;;) {
    const item = writeQueue.shift();
    if (!item) return;
    try {
      await rewriteMetadata(item.key, item.desired, item.contentType);
      fixed += 1;
    } catch (error) {
      failures.push(`${item.key}: ${error.message}`);
    }
  }
});
await Promise.all(writers);

console.log(`\nupdated     : ${fixed} objects (metadata only)`);
console.log(`failed      : ${failures.length}`);
for (const line of failures.slice(0, 20)) console.error(`  ${line}`);
if (failures.length) process.exitCode = 1;
