"""One-shot directory reorg for public/ assets.

- Renames FOLDERS only (file names untouched).
- Removes the optimized/ mirror layer: variants live next to their source.
- Orphan/zero-reference files are moved to a backup dir, never deleted.
- Writes an explicit old->new map so the operation is fully reversible.
"""
import json
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')
BK = os.path.join(os.path.dirname(ROOT), '.workbuddy', 'backup-assets-20260918-reorg')

# (relative old path under public/, relative new path under public/)
MOVES = []

# --- hero ---
MOVES.append(('optimized/posters/home-hero.webp', 'hero/home-hero.webp'))

# --- about ---
for w in ('640', '1280'):
    MOVES.append((f'optimized/about-avatar-{w}.webp', f'about/about-avatar-{w}.webp'))

# --- contact ---
for w in ('640', '1280'):
    MOVES.append((f'optimized/contact-wechat-{w}.webp', f'contact/contact-wechat-{w}.webp'))

# --- work/covers (only the 14 referenced ones; orphans handled separately) ---
COVERS = [
    'project2-cover', 'project3-cover', 'project4-cover',
    'project5-cover', 'project6-cover', 'project7-cover',
    'reference-project1',
]
for name in COVERS:
    for w in ('640', '1280'):
        MOVES.append((f'optimized/portfolio/{name}-{w}.webp', f'work/covers/{name}-{w}.webp'))

# --- work/posters (video posters for project detail videos) ---
for name in ('dog-demo', 'gift-collection', 'live-gift-2020', 'ui-motion'):
    MOVES.append((f'optimized/posters/{name}.webp', f'work/posters/{name}.webp'))

# --- work/projects/project-0N (source + variants in one folder) ---
for n in range(1, 8):
    old_dir = f'project{n}-detail'
    new_dir = f'work/projects/project-{n:02d}'
    for base, sub in ((f'portfolio/{old_dir}', new_dir),
                      (f'optimized/portfolio/{old_dir}', new_dir)):
        p = os.path.join(PUB, base.replace('/', os.sep))
        if not os.path.isdir(p):
            continue
        for f in sorted(os.listdir(p)):
            MOVES.append((f'{base}/{f}', f'{new_dir}/{f}'))

# --- motion-archive ---
mw = os.path.join(PUB, 'motion-wall')
for f in sorted(os.listdir(mw)):
    if f == 'posters' or f == 'manifest.json':
        continue
    MOVES.append((f'motion-wall/{f}', f'motion-archive/animated/{f}'))
for f in sorted(os.listdir(os.path.join(mw, 'posters'))):
    MOVES.append((f'motion-wall/posters/{f}', f'motion-archive/posters/{f}'))
MOVES.append(('motion-wall/manifest.json', 'motion-archive/manifest.json'))
for f in sorted(os.listdir(os.path.join(PUB, 'optimized', 'motion-wall'))):
    MOVES.append((f'optimized/motion-wall/{f}', f'motion-archive/stills/{f}'))
for f in ('报名界面待机.webp', '赛事转场动画.webp', '镜头1.webp'):
    MOVES.append((f'optimized/posters/{f}', f'motion-archive/video-posters/{f}'))

# --- local-assets (local-preview-only heavy media) ---
la = 'local-assets'
lm = os.path.join(PUB, la, 'motion-wall')
for f in sorted(os.listdir(lm)):
    MOVES.append((f'{la}/motion-wall/{f}', f'{la}/motion-archive/{f}'))
for f in sorted(os.listdir(os.path.join(PUB, la, 'portfolio', 'hover-motion'))):
    MOVES.append((f'{la}/portfolio/hover-motion/{f}', f'{la}/work/hover-motion/{f}'))
for n in range(1, 8):
    old_dir = f'{la}/portfolio/project{n}-detail'
    p = os.path.join(PUB, old_dir.replace('/', os.sep))
    if not os.path.isdir(p):
        continue
    for f in sorted(os.listdir(p)):
        MOVES.append((f'{old_dir}/{f}', f'{la}/work/projects/project-{n:02d}/{f}'))

# --- zero-reference orphans (8 groups x 2 widths) -> backup ---
ORPHANS = [
    'ai-design-19', 'dragon-model-27', 'gift-system-22', 'growth-ui-08',
    'h5-visual-30', 'live-header-31', 'motion-principles-03', 'quiz-growth-18',
]
ORPHAN_MOVES = []
for name in ORPHANS:
    for w in ('640', '1280'):
        ORPHAN_MOVES.append(f'optimized/portfolio/{name}-{w}.webp')
ORPHAN_MOVES.append('optimized/optimization-report.json')


def main():
    os.makedirs(BK, exist_ok=True)
    moved, skipped, failed = [], [], []

    for old, new in MOVES:
        src = os.path.join(PUB, old.replace('/', os.sep))
        dst = os.path.join(PUB, new.replace('/', os.sep))
        if not os.path.exists(src):
            skipped.append(old)
            continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.move(src, dst)
        moved.append((old, new))

    for old in ORPHAN_MOVES:
        src = os.path.join(PUB, old.replace('/', os.sep))
        if not os.path.exists(src):
            skipped.append(old)
            continue
        dst = os.path.join(BK, old.replace('/', os.sep))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.move(src, dst)
        moved.append((old, 'BACKUP:' + old))

    # drop now-empty directories
    removed = []
    for dirpath, dirnames, filenames in os.walk(PUB, topdown=False):
        if dirpath == PUB:
            continue
        try:
            if not os.listdir(dirpath):
                os.rmdir(dirpath)
                removed.append(os.path.relpath(dirpath, PUB).replace(os.sep, '/'))
        except OSError:
            pass

    with open(os.path.join(BK, 'reorg-map.json'), 'w', encoding='utf-8') as fh:
        json.dump({'moved': moved, 'skipped': skipped, 'removedDirs': removed},
                  fh, ensure_ascii=False, indent=2)

    print(f'moved   : {len(moved)}')
    print(f'skipped : {len(skipped)}')
    for s in skipped[:10]:
        print('   SKIP', s)
    print(f'failed  : {len(failed)}')
    print(f'empty dirs removed: {len(removed)} -> {removed}')
    print(f'map -> {os.path.join(BK, "reorg-map.json")}')


if __name__ == '__main__':
    main()
