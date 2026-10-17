"""渡されたデザイン画像（右半分が起動画面）から、起動画面の 2732×2732 PNG を作る。
使い方：python3 build/app-icons/splash-from-design.py [デザイン画像]
縦長の iPhone では、まん中の幅 1180px ほどだけが見える。デザインの起動画面を高さ 2732px に拡大してまん中に置き、
左右の外（iPad などでしか見えないところ）は、デザインの左右の端をのばしてぼかして埋める。"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter

root = Path(__file__).resolve().parents[2]
src = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'build/app-icons/source/design-2026-10-18.webp'
out = root / 'ios/App/App/Assets.xcassets/Splash.imageset'

im = Image.open(src).convert('RGB')
w, h = im.size
panel = im.crop((636, 0, w, h))                     # 右半分（起動画面）
S = 2732
pw = round(panel.width * S / panel.height)
big = panel.resize((pw, S), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
canvas = Image.new('RGB', (S, S))
x0 = (S - pw) // 2
side = x0 + 2
left = big.crop((0, 0, 6, S)).resize((side, S), Image.BILINEAR).filter(ImageFilter.GaussianBlur(18))
right = big.crop((pw - 6, 0, pw, S)).resize((side, S), Image.BILINEAR).filter(ImageFilter.GaussianBlur(18))
canvas.paste(left, (0, 0))
canvas.paste(right, (S - side, 0))
canvas.paste(big, (x0, 0))
for name in ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']:
    canvas.save(out / name, optimize=True)
print('ok', panel.size, '->', big.size)
