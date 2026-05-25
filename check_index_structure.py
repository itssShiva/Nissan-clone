import os
from bs4 import BeautifulSoup

ROOT = r"c:/Users/Shiva Gupta/Desktop/www.nissan.in"
index_path = os.path.join(ROOT, "index.html")

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

body = soup.find('body')
if body:
    print("Body classes:", body.get('class'))
    print("Top level tags in body:")
    for child in body.find_all(recursive=False):
        id_str = f" id='{child.get('id')}'" if child.get('id') else ""
        class_str = f" class='{child.get('class')}'" if child.get('class') else ""
        print(f" - {child.name}{id_str}{class_str}")
else:
    print("No body tag found")
