"""docs/store-listing.md の掲載文が、各ストアの文字数の上限に収まっているか確かめる。

    python3 build/listing_check.py
"""
import re
from pathlib import Path

DOC = Path(__file__).resolve().parent.parent / 'docs' / 'store-listing.md'
# 見出しの書き出し → 上限（App Store・Google Play の小さいほう）
LIMITS = [
    ('アプリ名', 30), ('サブタイトル', 30), ('プロモーション用テキスト', 170), ('短い説明', 80),
    ('キーワード', 100), ('説明', 4000),
    ('App name', 30), ('Subtitle', 30), ('Promotional text', 170), ('Short description', 80),
    ('Keywords', 100), ('Description', 4000),
]

text = DOC.read_text()
ok = True
for m in re.finditer(r'\*\*([^*\n]+)\*\*[^\n]*\n\n```\n(.*?)\n```', text, re.S):
    head, body = m.group(1), m.group(2)
    limit = next((n for k, n in LIMITS if head.startswith(k)), None)
    if limit is None:
        continue
    n = len(body)
    flag = 'OK ' if n <= limit else 'NG '
    ok &= n <= limit
    print(f'{flag}{head}: {n}/{limit}')
raise SystemExit(0 if ok else 1)
