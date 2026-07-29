from pathlib import Path
import shutil
import subprocess

root = Path('public')
output = root / 'optimized' / 'posters'
output.mkdir(parents=True, exist_ok=True)
ffmpeg = shutil.which('ffmpeg')
if not ffmpeg:
    candidate = Path(r'C:\Program Files\ffmpeg\bin\ffmpeg.exe')
    if candidate.exists():
        ffmpeg = str(candidate)
if not ffmpeg:
    raise SystemExit('ffmpeg is required to generate video posters')

created = 0
for source in root.rglob('*'):
    if not source.is_file() or source.suffix.lower() not in {'.mp4', '.webm'}:
        continue
    target = output / f'{source.stem}.webp'
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        continue
    subprocess.run([
        ffmpeg, '-hide_banner', '-loglevel', 'error', '-ss', '0.5', '-i', str(source),
        '-frames:v', '1', '-vf', "scale='min(1280,iw)':-2", '-c:v', 'libwebp', '-quality', '78', str(target), '-y'
    ], check=True)
    created += 1
print({'created': created, 'posters': len(list(output.glob('*.webp')))})
