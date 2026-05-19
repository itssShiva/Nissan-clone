import re
from collections import Counter

with open('remaining_errors.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

errors = []
for line in lines:
    match = re.search(r'\(([^)]+)\)\s*$', line.strip())
    if match and not line.startswith('Scanned'):
        errors.append(match.group(1))

counter = Counter(errors)
for error, count in counter.most_common():
    print(f'{count}: {error}')
