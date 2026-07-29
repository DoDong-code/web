from pathlib import Path
from PIL import Image, ImageSequence
import json

root = Path('public/motion-wall')
VIDEO_RATIOS = {
    '报名界面待机': 1600 / 720,
    '赛事转场动画': 1600 / 720,
    '镜头1': 1920 / 640,
}
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
items = []
for source in sorted(root.iterdir(), key=lambda path: path.name.casefold()):
    if not source.is_file() or source.name == 'manifest.json':
        continue
    suffix = source.suffix.lower()
    if suffix == '.gif' and source.with_suffix('.webp').exists():
        continue
    if suffix not in {'.webp', '.png', '.jpg', '.jpeg', '.mp4', '.webm'}:
        continue
    media_type = 'video' if suffix in {'.mp4', '.webm'} else 'image'
    src_path = f'/motion-wall/{source.name}'
    if media_type == 'image' and suffix in {'.png', '.jpg', '.jpeg'}:
        optimized = Path('public/optimized/motion-wall') / f'{source.stem}.webp'
        if optimized.exists():
            src_path = f'/optimized/motion-wall/{source.stem}.webp'
    item = {'id': source.stem, 'src': src_path, 'type': media_type, 'alt': source.stem}
    if media_type == 'video':
        item['poster'] = f'/optimized/posters/{source.stem}.webp'
        if source.stem in VIDEO_RATIOS:
            item['aspectRatio'] = VIDEO_RATIOS[source.stem]
    items.append(item)
manifest_path.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding='utf-8')

print(json.dumps({'converted': converted, 'beforeBytes': before, 'afterBytes': after}, ensure_ascii=False, indent=2))
