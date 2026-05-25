import os
import re
from urllib.parse import urlparse

ROOT = r"c:/Users/Shiva Gupta/Desktop/www.nissan.in"

# We want to replace URLs that point to nissan.in or nissan.com
# But NOT if they end with image/asset extensions
ASSET_EXTS = ('.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.js', '.woff', '.woff2')
URL_REGEX = re.compile(r'(https?://[^"\'\\]*(?:nissan\.in|nissan\.com)[^"\'\\]*)', re.IGNORECASE)

def get_local_path(url):
    parsed = urlparse(url)
    path = parsed.path
    
    if any(path.lower().endswith(ext) for ext in ASSET_EXTS):
        # Return the original URL for assets to prevent breaking images
        return url
        
    if not path or path == '/':
        return '/index.html'
    
    # Clean up the path
    path = path.strip('/')
    
    # Special cases handling for configurators
    if "configurator" in parsed.netloc:
        path = "configurator-" + path.replace('/', '-')
        if parsed.fragment:
            path += "-" + parsed.fragment.strip('/').replace('/', '-')
    
    # Convert path to a clean filename
    if not path.endswith('.html'):
        path = path + '.html'
        
    return '/' + path

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = 0
    def replacer(match):
        nonlocal replacements
        url = match.group(1)
        local_path = get_local_path(url)
        if local_path != url:
            replacements += 1
            return local_path
        return url

    new_content = URL_REGEX.sub(replacer, content)

    if replacements > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath} ({replacements} replacements)")
        return replacements
    return 0

def main():
    total_reps = 0
    for dirpath, _, filenames in os.walk(ROOT):
        if 'node_modules' in dirpath or '.git' in dirpath:
            continue
        for name in filenames:
            if name.lower().endswith('.html') or name.lower().endswith('.js'):
                total_reps += process_file(os.path.join(dirpath, name))
                
    print(f"\nTotal replacements: {total_reps}")

if __name__ == "__main__":
    main()
