import os
import re
from pathlib import Path
from bs4 import BeautifulSoup
import copy

ROOT = r"c:/Users/Shiva Gupta/Desktop/www.nissan.in"
INDEX_PATH = os.path.join(ROOT, "index.html")

def create_template():
    with open(INDEX_PATH, 'r', encoding='utf-8') as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')
    main_container = soup.find('main', id='container')
    
    if main_container:
        main_container.clear()
        # Add a placeholder div inside main
        placeholder = soup.new_tag('div')
        placeholder['style'] = "padding: 150px 20px; text-align: center; min-height: 60vh; font-family: 'Nissan Brand', sans-serif;"
        
        h1 = soup.new_tag('h1')
        h1['style'] = "font-size: 3rem; margin-bottom: 20px; text-transform: uppercase;"
        h1.string = "{title}"
        
        p = soup.new_tag('p')
        p['style'] = "font-size: 1.2rem; margin-bottom: 30px; color: #666;"
        p.string = "This page was automatically generated for local navigation."
        
        a = soup.new_tag('a')
        a['href'] = "/index.html"
        a['style'] = "display: inline-block; padding: 15px 30px; background-color: #c3002f; color: #fff; text-decoration: none; font-weight: bold; font-size: 1.1rem; border-radius: 4px; transition: background 0.3s;"
        a.string = "RETURN HOME"
        
        placeholder.append(h1)
        placeholder.append(p)
        placeholder.append(a)
        
        main_container.append(placeholder)
        
    return str(soup)

def get_missing_hrefs():
    hrefs = set()
    for dirpath, _, filenames in os.walk(ROOT):
        if 'node_modules' in dirpath or '.git' in dirpath:
            continue
        for name in filenames:
            if name.lower().endswith('.html'):
                path = os.path.join(dirpath, name)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Match local absolute or relative links ending with .html
                # e.g., href="/vehicles/ariya.html" or href="book-a-car.html"
                for match in re.findall(r'href\s*=\s*["\']([^"\']+\.html(?:#[^"\']*)?)["\']', content, re.IGNORECASE):
                    url = match.split('#')[0].split('?')[0]
                    if not url.startswith('http'):
                        if url.startswith('/'):
                            hrefs.add(url)
                        else:
                            # If relative, resolve it relative to dirpath
                            # To keep it simple, assume all are root-relative since our replace script made them start with /
                            # If not, let's just make it root relative
                            if url:
                                rel_to_root = os.path.relpath(dirpath, ROOT).replace('\\', '/')
                                if rel_to_root == '.':
                                    hrefs.add('/' + url)
                                else:
                                    hrefs.add('/' + rel_to_root + '/' + url)
    return hrefs

def main():
    print("Generating template from index.html...")
    template = create_template()
    
    print("Finding missing local links...")
    hrefs = get_missing_hrefs()
    
    created = []
    for href in sorted(hrefs):
        # Resolve to filesystem path
        # Normalize the path (e.g., removing leading slash)
        rel_path = href.strip('/')
        if not rel_path:
            continue
            
        target_path = os.path.join(ROOT, rel_path)
        target_file = Path(target_path)
        
        if not target_file.exists():
            target_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Format title from filename
            title = os.path.splitext(target_file.name)[0].replace('-', ' ').title()
            
            # Note: since the template has {title}, we can use python's .replace
            page_content = template.replace("{title}", title)
            
            with open(target_file, 'w', encoding='utf-8') as f:
                f.write(page_content)
            
            created.append(str(target_file))
            print(f"Created missing page: {rel_path}")

    print(f"\nTotal missing pages created: {len(created)}")

if __name__ == "__main__":
    main()
