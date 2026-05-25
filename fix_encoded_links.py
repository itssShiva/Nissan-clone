import os
import re
from urllib.parse import urlparse

ROOT = r"c:/Users/Shiva Gupta/Desktop/www.nissan.in"
# AEM often puts JSON inside data-compprops="..." where quotes are &quot;
# We need to catch https://...nissan.in... and replace it.
REGEX = re.compile(r'(https?://[^&"\'\\]*(?:nissan\.in|nissan\.com)[^&"\'\\]*)', re.IGNORECASE)
ASSET_EXTS = ('.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.js', '.woff', '.woff2')

def get_local_path(url):
    parsed = urlparse(url)
    path = parsed.path
    if any(path.lower().endswith(ext) for ext in ASSET_EXTS):
        return url
    if not path or path == '/':
        return '/index.html'
    path = path.strip('/')
    if "configurator" in parsed.netloc:
        path = "configurator-" + path.replace('/', '-')
    if not path.endswith('.html'):
        path = path + '.html'
    return '/' + path

def main():
    replacements = 0
    for dirpath, _, filenames in os.walk(ROOT):
        if 'node_modules' in dirpath or '.git' in dirpath: continue
        for name in filenames:
            if name.endswith('.html'):
                filepath = os.path.join(dirpath, name)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                def repl(match):
                    url = match.group(1)
                    local_path = get_local_path(url)
                    if local_path != url:
                        return local_path
                    return url

                new_content, count = REGEX.subn(repl, content)
                
                if count > 0 and new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    replacements += count
                    print(f"Fixed {count} encoded URLs in {filepath}")
    print(f"Total fixes: {replacements}")

if __name__ == "__main__":
    main()
