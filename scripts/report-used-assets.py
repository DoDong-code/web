from pathlib import Path
import json
import re

root = Path('.')
app = (root / 'src/App.tsx').read_text(encoding='utf-8')
manifest = json.loads((root / 'public/motion-wall/manifest.json').read_text(encoding='utf-8'))

def size(path):
    return path.stat().st_size if path.exists() else 0

motion = [root / 'public' / item['src'].lstrip('/') for item in manifest]
motion_existing = [p for p in motion if p.exists()]
posters = list((root / 'public/optimized/posters').glob('*.webp'))
optimized = root / 'public/optimized'
app_sources = sorted(set(re.findall(r"/[^\"']+\.(?:png|jpe?g|gif|mp4|webm)", app, re.I)))
app_original = [root / 'public' / p.lstrip('/') for p in app_sources if (root / 'public' / p.lstrip('/')).exists()]
app_optimized = []
for source in app_original:
    if source.suffix.lower() in {'.png', '.jpg', '.jpeg'}:
        candidate = root / 'public/optimized' / source.relative_to(root / 'public')
        candidate = candidate.with_suffix('.webp')
        if candidate.exists():
            app_optimized.append(candidate)
        continue
    app_optimized.append(source)
app_images = [p for p in app_original if p.suffix.lower() in {'.png', '.jpg', '.jpeg'}]
app_other = [p for p in app_original if p not in app_images]
app_image_optimized = [p for p in app_optimized if p.suffix.lower() == '.webp']

print(json.dumps({
    'motionCount': len(motion_existing),
    'motionBytes': sum(size(p) for p in motion_existing),
    'motionVideos': sum(1 for item in manifest if item['type'] == 'video'),
    'motionPostersCount': len(posters),
    'motionPostersBytes': sum(size(p) for p in posters),
    'appLiteralSourcesCount': len(app_original),
    'appLiteralSourcesBytes': sum(size(p) for p in app_original),
    'appOptimizedBaseCount': len(app_optimized),
    'appOptimizedBaseBytes': sum(size(p) for p in app_optimized),
    'appImageCount': len(app_images),
    'appImageOriginalBytes': sum(size(p) for p in app_images),
    'appImageOptimizedBytes': sum(size(p) for p in app_image_optimized),
    'appVideoGifCount': len(app_other),
    'appVideoGifBytes': sum(size(p) for p in app_other),
    'optimizedWebpCount': len(list(optimized.rglob('*.webp'))),
    'optimizedWebpBytes': sum(size(p) for p in optimized.rglob('*.webp')),
}, ensure_ascii=False, indent=2))
