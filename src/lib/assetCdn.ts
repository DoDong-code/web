/// <reference types="vite/client" />
// Single source of truth for remote asset URLs.
//
// Every file under public/ is mirrored 1:1 into the COS bucket under the
// `dist/` prefix, so a remote URL is just the local path behind one base —
// no per-module key translation any more.
const RAW_CDN_BASE = (
  import.meta.env.VITE_ASSET_CDN_BASE_URL ||
  'https://do-studio-1453848501.cos.ap-shanghai.myqcloud.com'
).replace(/\/+$/, '');

export const ASSET_CDN_BASE = `${RAW_CDN_BASE}/dist`;

// Default: `npm run dev` reads from /public (local files), production builds
// go to COS. Set VITE_LOCAL_ASSETS=1 to keep local assets even in a build, or
// VITE_LOCAL_ASSETS=0 to preview against COS while developing.
const localAssetsFlag = import.meta.env.VITE_LOCAL_ASSETS;

export const USE_LOCAL_ASSETS =
  localAssetsFlag === undefined ? Boolean(import.meta.env.DEV) : localAssetsFlag === '1';

const isAbsolute = (path: string) => /^https?:\/\//i.test(path) || path.startsWith('//');

export function cdnAsset(path: string): string;
export function cdnAsset(path?: string): string | undefined;
export function cdnAsset(path?: string): string | undefined {
  if (!path) return path;
  if (USE_LOCAL_ASSETS || isAbsolute(path)) return path;
  return `${ASSET_CDN_BASE}${encodeURI(path)}`;
}
