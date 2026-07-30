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
const publicBase = (process.env.COS_PUBLIC_BASE_URL || '').replace(/\/$/, '');

const assets = [
  {
    local: 'public/optimized/posters/home-hero.webp',
    key: 'portfolio/home/hero/home-hero.webp',
    cacheControl: 'public, max-age=31536000, immutable',
  },
  ...[
    ['reference-project1-640.webp', 'reference-project1-640.webp'],
    ['project2-cover-640.webp', 'project2-cover-640.webp'],
    ['project3-cover-640.webp', 'project3-cover-640.webp'],
    ['project4-cover-640.webp', 'project4-cover-640.webp'],
    ['project5-cover-640.webp', 'project5-cover-640.webp'],
    ['project6-cover-640.webp', 'project6-cover-640.webp'],
    ['project7-cover-640.webp', 'project7-cover-640.webp'],
  ].map(([file, key]) => ({
    local: `public/optimized/portfolio/${file}`,
    key: `portfolio/home/gallery/${key}`,
    cacheControl: 'public, max-age=31536000, immutable',
  })),
  ...[
    'board-28.gif',
    'ui_motion_2.gif',
    'ui_motion_6.gif',
    'gift-extra-2.gif',
  ].map((file) => ({
    local: file === 'board-28.gif'
      ? 'public/portfolio/project1-detail/board-28.gif'
      : file === 'ui_motion_2.gif'
        ? 'public/portfolio/project2-detail/ui_motion_2.gif'
        : file === 'ui_motion_6.gif'
          ? 'public/portfolio/project6-detail/ui_motion_6.gif'
          : 'public/portfolio/project7-detail/gift-extra-2.gif',
    key: `portfolio/home/hover-motion/${file}`,
    cacheControl: 'public, max-age=31536000, immutable',
  })),
];

const contentType = (file) => ({
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}[path.extname(file).toLowerCase()] || 'application/octet-stream');

const cos = new COS({ SecretId: secretId, SecretKey: secretKey });
const putObject = (asset) => new Promise((resolve, reject) => {
  cos.putObject({
    Bucket: bucket,
    Region: region,
    Key: asset.key,
    Body: asset.body,
    ContentType: contentType(asset.local),
    CacheControl: asset.cacheControl,
  }, (error, data) => error ? reject(error) : resolve(data));
});

for (const asset of assets) {
  const absolute = path.resolve(root, asset.local);
  try {
    asset.body = await fs.readFile(absolute);
  } catch {
    throw new Error(`Missing local asset: ${asset.local}`);
  }
}

for (const asset of assets) {
  const result = await putObject(asset);
  const url = publicBase ? `${publicBase}/${asset.key}` : `cos://${bucket}/${asset.key}`;
  console.log(`${asset.local}\t${asset.body.byteLength} bytes\t${result.ETag || 'uploaded'}\t${url}`);
}

console.log(`Uploaded ${assets.length} homepage assets to ${bucket}/${region}.`);
console.log('The homepage hero MP4 is remote in App.tsx and has no local file to upload; it was intentionally not replaced.');
