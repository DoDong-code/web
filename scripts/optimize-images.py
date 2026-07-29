from pathlib import Path
from PIL import Image
import json
import os

ROOT = Path('public')
OUT = ROOT / 'optimized'
EXTENSIONS = {'.png', '.jpg', '.jpeg'}
WIDTHS = (640, 960, 1280, 1920)
report = {'scanned': 0, 'converted': 0, 'beforeBytes': 0, 'afterBytes': 0, 'files': []}

for source in ROOT.rglob('*'):
    if not source.is_file() or OUT in source.parents or source.suffix.lower() not in EXTENSIONS:
        continue
    report['scanned'] += 1
    report['beforeBytes'] += source.stat().st_size
    relative = source.relative_to(ROOT)
    target_dir = OUT / relative.parent
    target_dir.mkdir(parents=True, exist_ok=True)
    base = target_dir / f'{source.stem}.webp'
    with Image.open(source) as image:
        width, height = image.size
        has_alpha = 'A' in image.getbands() or image.mode in ('P', 'LA')
        image = image.convert('RGBA' if has_alpha else 'RGB')
        targets = [None, *WIDTHS]
        outputs = []
        for target_width in targets:
            suffix = '' if target_width is None else f'-{target_width}'
            output = target_dir / f'{source.stem}{suffix}.webp'
            if not output.exists() or output.stat().st_mtime < source.stat().st_mtime:
                resized = image if target_width is None or target_width >= width else image.resize((target_width, round(height * target_width / width)), Image.Resampling.LANCZOS)
                resized.save(output, 'WEBP', quality=82, method=6, lossless=False)
            outputs.append(str(output.relative_to(ROOT)).replace('\\', '/'))
        report['converted'] += len(outputs)
        report['afterBytes'] += sum((ROOT / item).stat().st_size for item in outputs)
        report['files'].append({'source': str(relative).replace('\\', '/'), 'width': width, 'height': height, 'outputs': outputs})

(OUT / 'optimization-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: v for k, v in report.items() if k != 'files'}, ensure_ascii=False, indent=2))
