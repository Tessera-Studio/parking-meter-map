"""プロダクトページのヘッダアセット（3840x1646）を、起動画面の街並みとメーターのイラストから作る。

usage: python3 store-assets/make_header_city.py <font_dir> <out.png>

- 起動画面（ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png）の本物の絵は、まん中の幅 1346px だけ。
  ロゴと文字（MeterMap）より下の街並みを切り出して、まん中にそのまま置く。
- 左右の足りないところは、街並みを鏡に映してつなぎ、外へ行くほどぼかす（ヘッダの外側は端末によって切れる「背景」の部分）。
- 文字は Apple の「必ず表示される範囲」（1646x661、x 1097・y 493）に入れる。
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS, OUT = Path(sys.argv[1]), Path(sys.argv[2])
F_BLACK = str(FONTS / 'NotoSansCJK-Black.ttc')

W, H = 3840, 1646
SAFE = (1097, 493, 1097 + 1646, 493 + 661)
WHITE, YELLOW, SHADOW = (255, 255, 255), (0xFF, 0xD2, 0x3F), (0x05, 0x2A, 0x6E)

splash = Image.open(ROOT / 'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png').convert('RGB')
S = splash.width
PW = round(618 * S / 1254)          # 本物の絵の幅（splash-from-design.py と同じ計算）
X0 = (S - PW) // 2
TOP = 1420                          # 「MeterMap」の文字より下
EDGE = 8                            # 絵の左右の端の細い線を落とす
scene = splash.crop((X0 + EDGE, TOP, X0 + PW - EDGE, S))
sw, sh = scene.size

# 1) 横につなぐ：まん中に本物、左右は鏡に映した街並み
strip = Image.new('RGB', (W, sh))
cx = (W - sw) // 2
strip.paste(scene, (cx, 0))
left_w, right_w = cx, W - cx - sw
mir = scene.transpose(Image.FLIP_LEFT_RIGHT)
strip.paste(mir.crop((sw - left_w, 0, sw, sh)), (0, 0))      # 左の端の外側に、左の端を映す
strip.paste(mir.crop((0, 0, right_w, sh)), (cx + sw, 0))     # 右の端の外側に、右の端を映す

# 2) 外へ行くほどぼかし、少し明るくして奥へ下げる。
#    地面（地平線より下）は、鏡に映した道の白線が目立たないよう、つなぎ目のすぐ外から強くぼかす
HORIZON = 800                       # 切り出した絵の中での地平線の高さ（道が消える所）
tint = Image.new('RGB', strip.size, (120, 180, 255))
soft = Image.blend(strip.filter(ImageFilter.GaussianBlur(9)), tint, 0.18)
hard = Image.blend(strip.filter(ImageFilter.GaussianBlur(36)), tint, 0.22)

def ramp_mask(ramp):
    m = Image.new('L', strip.size, 0)
    d = ImageDraw.Draw(m)
    for x in range(W):
        dist = cx - x if x < cx else (x - (cx + sw) if x >= cx + sw else -1)
        d.line([(x, 0), (x, sh)], fill=0 if dist < 0 else min(255, int(255 * dist / ramp)))
    return m

upper = Image.composite(soft, strip, ramp_mask(360))
lower = Image.composite(hard, strip, ramp_mask(90))
vmask = Image.new('L', strip.size, 0)
vd = ImageDraw.Draw(vmask)
for y in range(sh):
    vd.line([(0, y), (W, y)], fill=max(0, min(255, int(255 * (y - (HORIZON - 60)) / 120))))
strip = Image.composite(lower, upper, vmask)

# 3) 空：上の色から地平線の色へ。街並みの上の端は空になじませる
sky_top, sky_low = splash.getpixel((S // 2, 40)), splash.getpixel((X0 + 20, TOP))
canvas = Image.new('RGB', (W, H))
cd = ImageDraw.Draw(canvas)
y_scene = H - sh
for y in range(H):
    t = min(1, y / max(1, y_scene))
    cd.line([(0, y), (W, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(sky_top, sky_low)))
fade = Image.new('L', strip.size, 255)
fd = ImageDraw.Draw(fade)
for y in range(80):
    fd.line([(0, y), (W, y)], fill=int(255 * y / 80))
canvas.paste(strip, (0, y_scene), fade)

# 4) 文字（白と黄。読みやすいように、紺の影を付ける）
def font(size):
    return ImageFont.truetype(F_BLACK, size, index=0)

lines = [[('いま使える', font(116), YELLOW), ('路上パーキングが', font(100), WHITE)],
         [('ひと目でわかる', font(150), WHITE)]]
heights = [round(116 * 1.18), round(150 * 1.18)]
text = Image.new('RGBA', (W, H), (0, 0, 0, 0))
shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
td, sd = ImageDraw.Draw(text), ImageDraw.Draw(shadow)
y = SAFE[1] + 10
widths = []
for runs, lh in zip(lines, heights):
    big = max(f.size for _, f, _ in runs)
    total = sum(f.getlength(t) for t, f, _ in runs)
    widths.append(total)
    x = SAFE[0] + (SAFE[2] - SAFE[0] - total) / 2
    base = y + round(big * 0.9)
    for t, f, c in runs:
        td.text((x, base), t, font=f, fill=c, anchor='ls')
        sd.text((x, base + 6), t, font=f, fill=SHADOW + (200,), anchor='ls')
        x += f.getlength(t)
    y += lh
assert max(widths) <= SAFE[2] - SAFE[0] and y <= SAFE[3], (widths, y)
shadow = shadow.filter(ImageFilter.GaussianBlur(16))
out = canvas.convert('RGBA')
out.alpha_composite(shadow)
out.alpha_composite(shadow)
out.alpha_composite(text)
out = out.convert('RGB')
assert out.size == (W, H)
out.save(OUT, 'PNG', optimize=True)
print(OUT, out.size, 'scene', scene.size, 'at x', cx, 'text bottom', y, 'widths', [round(w) for w in widths])
