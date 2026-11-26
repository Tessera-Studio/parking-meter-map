"""プロダクトページのヘッダアセット（3840x1646）を、起動画面の街並みとメーターのイラストから作る。

usage: python3 store-assets/make_header_city.py <font_dir> <out.png>

- 起動画面（ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png）の本物の絵は、まん中の幅 1346px だけ。
  「MeterMap」の文字より下の街並みを切り出し、ぼかしたり継ぎ足したりせず、角の丸い枠に入れてそのまま見せる。
- 背景はスクリーンショットと同じ青のグラデーションに、駐車場の標識の「P」を薄く重ねる（make_store_assets.py と同じ色）。
- 見出しと街並みの枠は、Apple の「必ず表示される範囲」（1646x661、x 1097・y 493）に入れる。
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS, OUT = Path(sys.argv[1]), Path(sys.argv[2])
F_BLACK = str(FONTS / 'NotoSansCJK-Black.ttc')

W, H = 3840, 1646
SAFE = (1097, 493, 1097 + 1646, 493 + 661)
BLUE_T, BLUE_B = (0x10, 0x7A, 0xFF), (0x00, 0x56, 0xD6)
WHITE, YELLOW = (255, 255, 255), (0xFF, 0xD2, 0x3F)


def font(size):
    return ImageFont.truetype(F_BLACK, size, index=0)


# 背景：青のグラデーションと、薄い「P」の標識（表示範囲の外）
canvas = Image.new('RGB', (1, H))
for y in range(H):
    t = y / (H - 1)
    canvas.putpixel((0, y), tuple(round(a + (b - a) * t) for a, b in zip(BLUE_T, BLUE_B)))
canvas = canvas.resize((W, H)).convert('RGBA')
deco = Image.new('RGBA', (W, H), (0, 0, 0, 0))
dd = ImageDraw.Draw(deco)
for x, y, size in [(140, 330, 860), (2840, 330, 860)]:
    dd.rounded_rectangle([x, y, x + size, y + size], size * 0.17, outline=(255, 255, 255, 34), width=round(size * 0.037))
    dd.text((x + size / 2, y + size / 2 + size * 0.03), 'P', font=font(round(size * 0.8)), fill=(255, 255, 255, 30), anchor='mm')
canvas.alpha_composite(deco)

# 街並み：起動画面の「MeterMap」の文字より下を、そのまま切り出す
splash = Image.open(ROOT / 'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png').convert('RGB')
S = splash.width
PW = round(618 * S / 1254)          # 本物の絵の幅（splash-from-design.py と同じ計算）
X0 = (S - PW) // 2
EDGE, TOP = 8, 1420                 # 左右の端の細い線を落とす／文字より下
scene = splash.crop((X0 + EDGE, TOP, X0 + PW - EDGE, S))

# 枠の大きさと置き場所（表示範囲の右側）
FH = 630                            # 枠の高さ（白い縁を足して、表示範囲の高さ 661 に収める）
FW = round(scene.width * FH / scene.height)
BORDER, R = 12, 56
fx = SAFE[2] - FW - 2 * BORDER - 6
fy = SAFE[1] + (SAFE[3] - SAFE[1] - FH - 2 * BORDER) // 2
pic = scene.resize((FW, FH), Image.LANCZOS)
frame = Image.new('RGBA', (FW + 2 * BORDER, FH + 2 * BORDER), (0, 0, 0, 0))
ImageDraw.Draw(frame).rounded_rectangle([0, 0, frame.width - 1, frame.height - 1], R + BORDER, fill=WHITE + (255,))
mask = Image.new('L', (FW, FH), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, FW - 1, FH - 1], R, fill=255)
frame.paste(pic, (BORDER, BORDER), mask)
shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(shadow).rounded_rectangle([fx, fy + 24, fx + frame.width, fy + frame.height + 24], R + BORDER, fill=(0, 20, 70, 90))
canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(30)))
canvas.alpha_composite(frame, (fx, fy))

# 見出し：表示範囲の左側（枠の左まで）
lines = [[('いま使える', font(176), YELLOW)],
         [('路上パーキングが', font(110), WHITE)],
         [('ひと目でわかる', font(126), WHITE)]]
gap = 14
heights = [round(max(f.size for _, f, _ in r) * 1.12) for r in lines]
block = sum(heights) + gap * (len(lines) - 1)
tx0, tx1 = SAFE[0] + 10, fx - 50
y = SAFE[1] + (SAFE[3] - SAFE[1] - block) // 2
d = ImageDraw.Draw(canvas)
widths = []
for runs, lh in zip(lines, heights):
    big = max(f.size for _, f, _ in runs)
    total = sum(f.getlength(t) for t, f, _ in runs)
    widths.append(total)
    x, base = tx0, y + round(big * 0.9)
    for t, f, c in runs:
        d.text((x, base), t, font=f, fill=c, anchor='ls')
        x += f.getlength(t)
    y += lh + gap
assert max(widths) <= tx1 - tx0, (widths, tx1 - tx0)
assert fx >= SAFE[0] and fx + frame.width <= SAFE[2] and fy >= SAFE[1] and fy + frame.height <= SAFE[3]

out = canvas.convert('RGB')
assert out.size == (W, H)
out.save(OUT, 'PNG', optimize=True)
print(OUT, out.size, 'frame', (fx, fy, frame.width, frame.height), 'text widths', [round(w) for w in widths], 'room', tx1 - tx0)
