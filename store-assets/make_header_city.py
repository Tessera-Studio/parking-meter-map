"""プロダクトページのヘッダアセット（3840x1646）を、起動画面の街並みとメーターのイラストから作る。

usage: python3 store-assets/make_header_city.py <font_dir> <out.png> [--flip]

- 右側：起動画面（ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png）の「MeterMap」の文字より下の
  街並みを、できるだけ大きく右端に寄せて置く（ぼかしや継ぎ足しはしない。左の端だけ、背景の青にすっとなじませる）。
  --flip を付けると左右を反転し、メーターを文字の側（Apple の「必ず表示される範囲」の中）に寄せる。
- 左側：駐車場の標識の「P」と見出し。どちらも「必ず表示される範囲」（1646x661、x 1097・y 493）に入れる。
- 背景はスクリーンショットと同じ青のグラデーション。
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS, OUT = Path(sys.argv[1]), Path(sys.argv[2])
FLIP = '--flip' in sys.argv[3:]
F_BLACK = str(FONTS / 'NotoSansCJK-Black.ttc')

W, H = 3840, 1646
SAFE = (1097, 493, 1097 + 1646, 493 + 661)
BLUE_T, BLUE_B = (0x10, 0x7A, 0xFF), (0x00, 0x56, 0xD6)
WHITE, YELLOW = (255, 255, 255), (0xFF, 0xD2, 0x3F)
SIGN_BLUE = (0x0B, 0x5C, 0xD6)


def font(size):
    return ImageFont.truetype(F_BLACK, size, index=0)


# 背景：青のグラデーション
canvas = Image.new('RGB', (1, H))
for y in range(H):
    t = y / (H - 1)
    canvas.putpixel((0, y), tuple(round(a + (b - a) * t) for a, b in zip(BLUE_T, BLUE_B)))
canvas = canvas.resize((W, H)).convert('RGBA')

# 右側：街並み（起動画面の「MeterMap」の文字より下）をできるだけ大きく、右端に寄せる
splash = Image.open(ROOT / 'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png').convert('RGB')
S = splash.width
PW = round(618 * S / 1254)          # 本物の絵の幅（splash-from-design.py と同じ計算）
X0 = (S - PW) // 2
EDGE, TOP = 8, 1420                 # 左右の端の細い線を落とす／文字より下
scene = splash.crop((X0 + EDGE, TOP, X0 + PW - EDGE, S))
if FLIP:
    scene = scene.transpose(Image.FLIP_LEFT_RIGHT)
SX = 1960                           # 絵の左の端（これより左は文字と P）
sw = W - SX
sh = round(scene.height * sw / scene.width)
pic = scene.resize((sw, sh), Image.LANCZOS).crop((0, 0, sw, H))   # 下（手前の道路）を切って高さを合わせる
fade = Image.new('L', (sw, H), 255)
fd = ImageDraw.Draw(fade)
FADE = 140                          # 左の端だけ、背景の青に 140px でなじませる
for x in range(FADE):
    fd.line([(x, 0), (x, H)], fill=round(255 * (x / FADE) ** 1.5))
canvas.paste(pic.convert('RGBA'), (SX, 0), fade)

# 左側：駐車場の標識の「P」と見出し（「必ず表示される範囲」の中）
d = ImageDraw.Draw(canvas)
P = 176
px, py = SAFE[0] + 14, SAFE[1] + 6
d.rounded_rectangle([px, py, px + P, py + P], round(P * 0.2), fill=WHITE)
d.rounded_rectangle([px + 12, py + 12, px + P - 12, py + P - 12], round(P * 0.15), fill=SIGN_BLUE)
d.text((px + P / 2, py + P / 2 + 6), 'P', font=font(round(P * 0.74)), fill=WHITE, anchor='mm')

lines = [[('いま使える', font(150), YELLOW)],
         [('路上パーキングが', font(100), WHITE)],
         [('ひと目でわかる', font(112), WHITE)]]
gap = 10
heights = [round(max(f.size for _, f, _ in r) * 1.12) for r in lines]
tx0 = SAFE[0] + 14
y = py + P + 34
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
y -= gap
assert y <= SAFE[3], ('text bottom', y)
assert tx0 + max(widths) <= SX + 20, ('text width', widths)

out = canvas.convert('RGB')
assert out.size == (W, H)
out.save(OUT, 'PNG', optimize=True)
meter_x = SX + round((1 - 0.764 if FLIP else 0.764) * sw)
print(OUT, out.size, 'flip' if FLIP else 'normal', 'scene', (sw, sh), 'text bottom', y, 'meter x', meter_x,
      'inside safe' if SAFE[0] <= meter_x <= SAFE[2] else 'OUTSIDE safe')
