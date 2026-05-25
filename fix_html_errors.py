# fix_html_errors.py
import os, re, sys
from bs4 import BeautifulSoup

# Directory containing HTML files
ROOT = r"c:/Users/Shiva Gupta/Desktop/www.nissan.in"

# Track used IDs to ensure uniqueness
used_ids = set()

def normalize_attrs(tag):
    # lowercase attribute names and ensure double quotes
    attrs = {}
    for k, v in tag.attrs.items():
        new_key = k.lower()
        # BeautifulSoup may already have list for class etc.
        attrs[new_key] = v
    tag.attrs = attrs
    # fix id uniqueness
    if tag.has_attr('id'):
        original = tag['id']
        new_id = original
        counter = 1
        while new_id in used_ids:
            new_id = f"{original}_{counter}"
            counter += 1
        if new_id != original:
            tag['id'] = new_id
        used_ids.add(new_id)

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    soup = BeautifulSoup(content, 'html.parser')
    for tag in soup.find_all(True):
        normalize_attrs(tag)
    # write back
    with open(path, 'w', encoding='utf-8') as f:
        f.write(str(soup))

for dirpath, _, filenames in os.walk(ROOT):
    for name in filenames:
        if name.lower().endswith('.html'):
            fp = os.path.join(dirpath, name)
            try:
                fix_file(fp)
                print(f"Fixed {fp}")
            except Exception as e:
                print(f"Error fixing {fp}: {e}", file=sys.stderr)
