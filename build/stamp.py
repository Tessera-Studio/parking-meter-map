"""index.html から読み込むファイルに、中身から作った版番号（?v=…）を付ける。

    python3 build/stamp.py

GitHub Pages はファイルを10分間キャッシュさせるので、更新直後は新しい index.html と
古い styles.css / app.js が混ざることがある。中身が変わると番号も変わるようにして、
新しいページが必ず新しいファイルを読むようにする。画面のファイルを変えたらコミット前に実行する。
データ（data/*.json）は app.js が毎回確認して読むので、ここでは扱わない。
"""
import hashlib, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# 画面の HTML（legal.html・privacy.html は公開したら対象になる。docs/pro-ads.md §18.3）
PAGES = [ROOT / n for n in ('index.html', 'legal.html', 'privacy.html')]


def stamp(m):
    attr, path = m.group(1), m.group(2)
    f = ROOT / path
    if not f.exists():
        return m.group(0)
    v = hashlib.sha1(f.read_bytes()).hexdigest()[:8]
    return f'{attr}="{path}?v={v}"'


for page in PAGES:
    if not page.exists():
        continue
    html = page.read_text(encoding='utf-8')
    new = re.sub(r'(href|src)="((?!https?:)[^"?#]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"', stamp, html)
    page.write_text(new, encoding='utf-8')
    print(page.name + ': ' + ' '.join(re.findall(r'(?:href|src)="([^"]+\?v=[^"]+)"', new)))
