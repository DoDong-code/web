from pathlib import Path
from PIL import Image, ImageSequence
import json

root = Path('public/motion-wall')
converted = 0
before = 0
after = 0

for source in root.glob('*.gif'):
    target = source.with_suffix('.webp')
    before += source.stat().st_size
    if not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
        with Image.open(source) as image:
            frames = []
            durations = []
            for frame in ImageSequence.Iterator(image):
                frames.append(frame.convert('RGBA'))
                durations.append(frame.info.get('duration', image.info.get('duration', 100)))
            if frames:
                frames[0].save(target, 'WEBP', save_all=True, append_images=frames[1:], duration=durations, loop=0, quality=78, method=4)
                converted += 1
    if target.exists():
        after += target.stat().st_size

manifest_path = root / 'manifest.json'
if manifest_path.exists():
    manifest = json.loads(manifest_path.read_text(encoding='utf-8-sig'))
    for item in manifest:
        if item.get('type') == 'image' and item.get('src', '').lower().endswith('.gif'):
            candidate = root / Path(item['src']).name
            webp = candidate.with_suffix('.webp')
            if webp.exists():
                item['src'] = item['src'][:-4] + '.webp'
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')

print(json.dumps({'converted': converted, 'beforeBytes': before, 'afterBytes': after}, ensure_ascii=False, indent=2))
