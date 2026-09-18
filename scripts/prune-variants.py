"""Prune unneeded image variants.

Rules (confirmed by the user):
  public/contact      -> keep -640 only
  public/work/covers  -> keep -640 only
  public/work/projects-> keep -1280 only (the 40 animated .webp originals stay)

Files are MOVED to a backup directory, never deleted.
"""
import json
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKUP = os.path.join(
    ROOT, '..', '.workbuddy', 'backup-assets-20260918-variants'
)


def collect():
    """Return list of (abs_path, rel_path) scheduled for removal."""
    out = []

    def add(rel):
        p = os.path.join(ROOT, 'public', rel)
        if os.path.isfile(p):
            out.append(rel)

    # 1. contact: drop 1280
    for f in sorted(os.listdir(os.path.join(ROOT, 'public', 'contact'))):
        if f.endswith('-1280.webp'):
            add('contact/' + f)

    # 2. work/covers: drop 1280
    for f in sorted(os.listdir(os.path.join(ROOT, 'public', 'work', 'covers'))):
        if f.endswith('-1280.webp'):
            add('work/covers/' + f)

    # 3. work/projects: drop 640 (animated .webp originals are never touched)
    proj = os.path.join(ROOT, 'public', 'work', 'projects')
    for d in sorted(os.listdir(proj)):
        sd = os.path.join(proj, d)
        if not os.path.isdir(sd):
            continue
        for f in sorted(os.listdir(sd)):
            if f.endswith('-640.webp'):
                add('work/projects/' + d + '/' + f)
    return out


def main():
    rels = collect()
    os.makedirs(BACKUP, exist_ok=True)
    moved, missing, total = [], [], 0
    for rel in rels:
        for base in ('public', 'dist'):
            src = os.path.join(ROOT, base, rel)
            if not os.path.isfile(src):
                if base == 'public':
                    missing.append(rel)
                continue
            dst = os.path.join(BACKUP, base, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            size = os.path.getsize(src)
            shutil.move(src, dst)
            if base == 'public':
                total += size
            moved.append(base + '/' + rel)
    manifest = {
        'rule': {
            'contact': 'keep -640',
            'work/covers': 'keep -640',
            'work/projects': 'keep -1280 + animated .webp originals',
        },
        'moved': moved,
        'count': len(moved),
        'public_bytes': total,
    }
    with open(os.path.join(BACKUP, 'prune-manifest.json'), 'w', encoding='utf-8') as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2)
    print('moved files :', len(moved))
    print('public bytes:', round(total / 1024 / 1024, 2), 'MB')
    print('missing     :', missing or 'none')
    print('backup      :', os.path.abspath(BACKUP))


if __name__ == '__main__':
    main()
