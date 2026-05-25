# check_missing_pages.py
import os, re
ROOT = r"c:/Users/Shiva Gupta/Desktop/www.nissan.in"
missing = []
for dirpath, _, filenames in os.walk(ROOT):
    for name in filenames:
        if name.lower().endswith('.html'):
            path = os.path.join(dirpath, name)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            for match in re.findall(r'href\s*=\s*["\']([^"\']+\.html)["\']', content, re.IGNORECASE):
                if match.startswith('http'):
                    continue
                target = os.path.join(ROOT, match.lstrip('/'))
                if not os.path.isfile(target):
                    missing.append((path, match))
if missing:
    print('Missing pages:')
    for src, href in missing:
        print(f"{src} -> {href}")
else:
    print('No missing pages found.')
