import os
import re
from urllib.parse import urlparse

ROOT = r"c:/Users/Shiva Gupta/Desktop/www.nissan.in"

# Regex to match href or action pointing to nissan.in or nissan.com
URL_REGEX = re.compile(r'(href|action)=["\'](https?://[^"\']*(?:nissan\.in|nissan\.com)[^"\']*)["\']', re.IGNORECASE)

def get_local_path(url):
    parsed = urlparse(url)
    path = parsed.path
    if not path or path == '/':
        return '/index.html'
    
    # Clean up the path
    path = path.strip('/')
    
    # Special cases handling for fragments or configurators
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
        attr = match.group(1)
        url = match.group(2)
        local_path = get_local_path(url)
        replacements += 1
        return f'{attr}="{local_path}"'

    new_content = URL_REGEX.sub(replacer, content)

    if replacements > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath} ({replacements} replacements)")

def main():
    for dirpath, _, filenames in os.walk(ROOT):
        # Skip node_modules or .git
        if 'node_modules' in dirpath or '.git' in dirpath:
            continue
        for name in filenames:
            if name.lower().endswith('.html'):
                process_file(os.path.join(dirpath, name))

if __name__ == "__main__":
    main()
