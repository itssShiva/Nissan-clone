import os
import re

ROOT = r"c:/Users/Shiva Gupta/Desktop/www.nissan.in"
# Fix URLs that look like /configurator-features-features?utm_source=Interior.html
# to /configurator-features-features.html?utm_source=Interior
REGEX = re.compile(r'(/configurator[^"\'?]*)\?([^"\']*)\.html')

def main():
    replacements = 0
    for dirpath, _, filenames in os.walk(ROOT):
        if 'node_modules' in dirpath or '.git' in dirpath: continue
        for name in filenames:
            if name.endswith('.html'):
                filepath = os.path.join(dirpath, name)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content, count = REGEX.subn(r'\1.html?\2', content)
                
                # Also fix the prevPage=homepage.html ones
                new_content2, count2 = re.subn(r'(/configurator[^"\'?]*)\?prevPage=homepage\.html', r'\1.html?prevPage=homepage', new_content)
                
                if count > 0 or count2 > 0:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content2)
                    replacements += (count + count2)
                    print(f"Fixed {count + count2} URLs in {filepath}")
    print(f"Total fixes: {replacements}")

if __name__ == "__main__":
    main()
