import os, re

project_root = r"C:\\Users\\Shiva Gupta\\Desktop\\www.nissan.in"
modern_link = '<link href="/assets/css/modern.css" rel="stylesheet">'

for root, _, files in os.walk(project_root):
    for fname in files:
        if fname.lower().endswith('.html'):
            path = os.path.join(root, fname)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'modern.css' not in content:
                # Insert after <head> tag
                new_content = re.sub(r'(?i)(<head[^>]*>)', r"\1\n" + modern_link, content, count=1)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {path}")
