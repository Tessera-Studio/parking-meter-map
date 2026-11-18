"""MeterMap App Store creative: 5 designed screenshots (1320x2868), product page header (3840x1646),
search results asset (3840x2560). All RGB PNG (no alpha).

usage: python3 make_store_assets.py <shots_dir> <zones.geojson> <font_dir> <out_dir>
"""
import hashlib
import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SHOTS, ZONES, FONTS, OUT = (Path(a) for a in sys.argv[1:5])
OUT.mkdir(parents=True, exist_ok=True)
F_BLACK = str(FONTS / 'NotoSansCJK-Black.ttc')
F_BOLD = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'

# colours (app: splash #006BF4, theme navy #1E4E8C, zone green / red / selected yellow)
BLUE_T, BLUE_B = (0x10, 0x7A, 0xFF), (0x00, 0x56, 0xD6)
WHITE = (255, 255, 255)
YELLOW = (0xFF, 0xD2, 0x3F)
NAVY = (0x12, 0x2B, 0x52)
BRAND_NAVY = (0x1E, 0x4E, 0x8C)
GREEN = (0x1F, 0x7E, 0x4E)
RED = (0xD5, 0x45, 0x3B)
SEL = (0xF2, 0xB4, 0x00)
GRAY = (0x9A, 0x9E, 0xA6)
MAPBG = (0xEE, 0xED, 0xE8)


def font(path, size):
    return ImageFont.truetype(path, size, index=0)


# ---------------------------------------------------------------- phone mockup
def phone(shot, screen_w, angle, ss=2):
    """Return (RGBA phone image rotated by angle, already downsampled)."""
    sw = screen_w * ss
    sh = round(sw * shot.height / shot.width)
    bezel = round(sw * 0.030)
    rim = max(2, round(sw * 0.007))
    r_scr = round(sw * 0.135)
    r_out = r_scr + bezel
    btn = round(rim * 2.2)
    bw, bh = sw + 2 * bezel, sh + 2 * bezel
    im = Image.new('RGBA', (bw + 2 * btn, bh), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    rimc = (0x6B, 0x6F, 0x78, 255)
    # side buttons
    for y0, y1 in [(0.16, 0.20), (0.24, 0.31), (0.33, 0.40)]:
        d.rounded_rectangle([0, bh * y0, btn + rim * 2, bh * y1], btn, fill=rimc)
    d.rounded_rectangle([bw + btn - rim * 2, bh * 0.25, bw + 2 * btn, bh * 0.36], btn, fill=rimc)
    # body
    d.rounded_rectangle([btn, 0, btn + bw - 1, bh - 1], r_out, fill=rimc)
    d.rounded_rectangle([btn + rim, rim, btn + bw - 1 - rim, bh - 1 - rim], r_out - rim, fill=(0x0C, 0x0D, 0x10, 255))
    scr = shot.convert('RGB').resize((sw, sh), Image.LANCZOS)
    mask = Image.new('L', (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw - 1, sh - 1], r_scr, fill=255)
    im.paste(scr, (btn + bezel, bezel), mask)
    im = im.rotate(angle, resample=Image.BICUBIC, expand=True)
    return im.resize((im.width // ss, im.height // ss), Image.LANCZOS)


def drop_shadow(canvas, ph, x, y, offset=(0, 40), blur=50, alpha=0.38):
    a = ph.getchannel('A').point(lambda v: int(v * alpha))
    sh = Image.new('RGBA', ph.size, (0, 0, 0, 0))
    sh.putalpha(a)
    pad = blur * 3
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    layer.paste(sh, (x + offset[0], y + offset[1]), sh)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)
    canvas.alpha_composite(ph, (x, y))


# ---------------------------------------------------------------- text helpers
def draw_runs(d, x, top, runs, align='left', width=None):
    """runs: [(text, font, colour)] on one line sharing a baseline. Returns line height used."""
    big = max(f.size for _, f, _ in runs)
    base = top + round(big * 0.90)
    total = sum(f.getlength(t) for t, f, _ in runs)
    if align == 'center':
        x = x + (width - total) / 2
    for t, f, c in runs:
        d.text((x, base), t, font=f, fill=c, anchor='ls')
        x += f.getlength(t)
    return round(big * 1.16), total


def tag(d, x, y, text, f, fg, bg, pad=(32, 16), r=18):
    w = f.getlength(text)
    h = f.size + 2 * pad[1]
    d.rounded_rectangle([x, y, x + w + 2 * pad[0], y + h], r, fill=bg)
    d.text((x + pad[0], y + h / 2 + 2), text, font=f, fill=fg, anchor='lm')
    return h


def legend(d, x, y, items, f, pad=28, gap=34, sw=58):
    """White pill with coloured line samples: items [(label, colour, dashed)]."""
    h = f.size + 2 * 20
    w = pad * 2 + sum(sw + 16 + f.getlength(l) for l, _, _ in items) + gap * (len(items) - 1)
    d.rounded_rectangle([x, y, x + w, y + h], h / 2, fill=WHITE)
    cx = x + pad
    for label, col, dashed in items:
        cy = y + h / 2
        if dashed:
            for s in range(0, sw, 18):
                d.line([(cx + s, cy), (cx + min(s + 10, sw), cy)], fill=col, width=10)
        else:
            d.line([(cx, cy), (cx + sw, cy)], fill=col, width=12)
        cx += sw + 16
        d.text((cx, cy + 2), label, font=f, fill=NAVY, anchor='lm')
        cx += f.getlength(label) + gap
    return h


def vgrad(w, h, top, bottom):
    g = Image.new('RGB', (1, h))
    for yy in range(h):
        t = yy / (h - 1)
        g.putpixel((0, yy), tuple(round(a + (b - a) * t) for a, b in zip(top, bottom)))
    return g.resize((w, h))


# ---------------------------------------------------------------- 1) screenshots
W, H = 1320, 2868
M = 96
BIG, SMALL = font(F_BLACK, 172), font(F_BLACK, 124)
TAGF, LEGF = font(F_BLACK, 56), font(F_BOLD, 46)

SLIDES = [
    dict(src='11.webp', out='01_いま使える.png', angle=-8,
         lines=[[('いま', SMALL, WHITE), ('使える', BIG, YELLOW)],
                [('路上パーキングが', SMALL, WHITE)],
                [('ひと目で', BIG, WHITE), ('わかる', SMALL, WHITE)]],
         legend=[('いま使える', GREEN, False), ('時間外', RED, False), ('時間不明', GRAY, True)]),
    dict(src='12.webp', out='02_時間も料金も.png', angle=7,
         lines=[[('時間', BIG, YELLOW), ('も', SMALL, WHITE), ('料金', BIG, YELLOW), ('も', SMALL, WHITE)],
                [('すぐ確認', BIG, WHITE)]],
         tag='曜日・祝日・年末年始まで判定'),
    dict(src='13.webp', out='03_目的地から.png', angle=-8,
         lines=[[('目的地', BIG, YELLOW), ('から', SMALL, WHITE)],
                [('探せる', BIG, WHITE)]],
         tag='駅名・地名で、近い順に表示'),
    dict(src='14.webp', out='04_タイマー.png', angle=7, badge='プレミアム',
         lines=[[('残り時間', BIG, YELLOW), ('を', SMALL, WHITE)],
                [('通知', BIG, WHITE), ('でお知らせ', SMALL, WHITE)]],
         tag='終わる10分前と、時間になったとき'),
    dict(src='15.webp', out='05_すぐ案内.png', angle=-8,
         lines=[[('行き方', BIG, YELLOW), ('も', SMALL, WHITE)],
                [('すぐ案内', BIG, WHITE)]],
         tag='地図アプリで、そのまま経路へ'),
]

for s in SLIDES:
    c = vgrad(W, H, BLUE_T, BLUE_B).convert('RGBA')
    d = ImageDraw.Draw(c)
    # faint big "P" sign in the background (parking sign motif)
    deco = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dd = ImageDraw.Draw(deco)
    px, py, ps = (-180, 1480, 760) if s['angle'] < 0 else (W - 580, 1480, 760)
    dd.rounded_rectangle([px, py, px + ps, py + ps], 120, outline=(255, 255, 255, 34), width=26)
    dd.text((px + ps / 2, py + ps / 2 + 20), 'P', font=font(F_BLACK, 560), fill=(255, 255, 255, 30), anchor='mm')
    c.alpha_composite(deco)
    d = ImageDraw.Draw(c)

    y = 150
    if s.get('badge'):
        y += tag(d, M, y, s['badge'], font(F_BLACK, 54), NAVY, YELLOW, pad=(30, 14), r=16) + 34
    for runs in s['lines']:
        lh, lw = draw_runs(d, M, y, runs)
        assert lw <= W - 2 * M, (s['out'], lw)
        y += lh
    y += 30
    if s.get('legend'):
        y += legend(d, M, y, s['legend'], LEGF)
    elif s.get('tag'):
        y += tag(d, M, y, s['tag'], TAGF, BLUE_B, WHITE)

    shot = Image.open(SHOTS / s['src'])
    ph = phone(shot, 860, s['angle'])
    top = max(y + 60, H + 60 - ph.height)
    cx = W // 2 + (60 if s['angle'] < 0 else -60)
    drop_shadow(c, ph, cx - ph.width // 2, top)
    out = c.convert('RGB')
    assert out.size == (W, H)
    out.save(OUT / s['out'], 'PNG', optimize=True)
    print(s['out'], out.size, 'phone top', top, 'bleed', top + ph.height - H)


# ---------------------------------------------------------------- map background from real zones
zones = json.load(open(ZONES, encoding='utf-8'))['features']


def lines_of(f):
    g = f['geometry']
    return [g['coordinates']] if g['type'] == 'LineString' else g['coordinates']


def zone_colour(f):
    h = int(hashlib.md5(str(f['properties'].get('識別id')).encode()).hexdigest(), 16) % 100
    return RED if h < 13 else GREEN


def map_art(w, h, lat0, lng0, span_m, ss=2, sel_at=None, pins=()):
    """Draw zone lines around (lat0, lng0); span_m = metres across the width."""
    W2, H2 = w * ss, h * ss
    ppm = W2 / span_m
    my = 111320 * ppm
    mx = my * math.cos(math.radians(lat0))
    img = Image.new('RGB', (W2, H2), MAPBG)
    d = ImageDraw.Draw(img)

    def P(p):
        return ((p[0] - lng0) * mx + W2 / 2, (lat0 - p[1]) * my + H2 / 2)

    segs = []
    for f in zones:
        for ln in lines_of(f):
            pts = [P(p) for p in ln]
            if all(x < -200 or x > W2 + 200 for x, _ in pts) or all(y < -200 or y > H2 + 200 for _, y in pts):
                continue
            segs.append((f, pts))
    road, zw = round(30 * ss), round(13 * ss)
    for _, pts in segs:
        d.line(pts, fill=WHITE, width=road, joint='curve')
    for f, pts in segs:
        d.line(pts, fill=zone_colour(f), width=zw, joint='curve')
    chosen = None
    if sel_at:
        tx, ty = sel_at[0] * ss, sel_at[1] * ss
        chosen = min(segs, key=lambda fp: min(math.hypot(x - tx, y - ty) for x, y in fp[1]))
        d.line(chosen[1], fill=(0x22, 0x22, 0x22), width=zw + 10 * ss, joint='curve')
        d.line(chosen[1], fill=SEL, width=zw + 2 * ss, joint='curve')
    img = img.resize((w, h), Image.LANCZOS).convert('RGBA')
    pin_targets = list(pins) + ([None] if chosen else [])
    pf = font(F_BLACK, 40)
    for t in pin_targets:
        if t is None:
            pts = chosen[1]
        else:
            tx, ty = t[0] * ss, t[1] * ss
            pts = min(segs, key=lambda fp: min(math.hypot(x - tx, y - ty) for x, y in fp[1]))[1]
        mid = pts[len(pts) // 2]
        x, y = mid[0] / ss, mid[1] / ss
        pd = ImageDraw.Draw(img)
        pd.rounded_rectangle([x - 34, y - 78, x + 34, y - 10], 14, fill=WHITE)
        pd.rounded_rectangle([x - 28, y - 72, x + 28, y - 16], 10, fill=GREEN)
        pd.polygon([(x - 10, y - 12), (x + 10, y - 12), (x, y)], fill=WHITE)
        pd.text((x, y - 43), 'P', font=pf, fill=WHITE, anchor='mm')
    return img


def soften(img, box, strength=0.86, feather=260):
    """Fade the map toward the background colour inside box (x0,y0,x1,y1) so text reads."""
    m = Image.new('L', img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle(box, 120, fill=int(255 * strength))
    m = m.filter(ImageFilter.GaussianBlur(feather))
    veil = Image.new('RGBA', img.size, MAPBG + (255,))
    veil.putalpha(m)
    img.alpha_composite(veil)


# ---------------------------------------------------------------- 2) product page header 3840x1646
HW, HH = 3840, 1646
SAFE_H = (1097, 493, 1097 + 1646, 493 + 661)
hdr = map_art(HW, HH, 35.6970, 139.7710, 5200, sel_at=(3150, 520), pins=[(650, 1200), (3350, 1250)])
soften(hdr, (SAFE_H[0] - 120, SAFE_H[1] - 80, SAFE_H[2] + 120, SAFE_H[3] + 60))
d = ImageDraw.Draw(hdr)
l1 = [('いま使える', font(F_BLACK, 132), GREEN), ('路上パーキングが', font(F_BLACK, 112), NAVY)]
l2 = [('ひと目でわかる', font(F_BLACK, 168), NAVY)]
sw_ = SAFE_H[2] - SAFE_H[0]
h1 = round(132 * 1.16); h2 = round(168 * 1.16)
y0 = SAFE_H[1] + (661 - (h1 + h2 + 10)) / 2
_, w1 = draw_runs(d, SAFE_H[0], y0, l1, align='center', width=sw_)
_, w2 = draw_runs(d, SAFE_H[0], y0 + h1 + 10, l2, align='center', width=sw_)
assert max(w1, w2) <= sw_, (w1, w2)
hdr.convert('RGB').save(OUT / 'header_3840x1646.png', 'PNG', optimize=True)
print('header', hdr.size, 'text widths', round(w1), round(w2), 'safe w', sw_)

# ---------------------------------------------------------------- 3) search results 3840x2560
SW_, SH_ = 3840, 2560
SAFE_S = (836, 765, 836 + 2168, 765 + 1030)
srch = map_art(SW_, SH_, 35.6712, 139.7655, 3600, sel_at=(600, 500), pins=[(3400, 2200)])
soften(srch, (SAFE_S[0] - 100, SAFE_S[1] - 60, SAFE_S[0] + 1250, SAFE_S[3] + 60), strength=0.9)
d = ImageDraw.Draw(srch)
lines = [[('いま使える', font(F_BLACK, 204), GREEN)],
         [('路上パーキングが', font(F_BLACK, 140), NAVY)],
         [('ひと目で', font(F_BLACK, 204), NAVY), ('わかる', font(F_BLACK, 140), NAVY)]]
heights = [round(204 * 1.16), round(140 * 1.16), round(204 * 1.16)]
y = SAFE_S[1] + (1030 - sum(heights)) / 2
for runs in lines:
    lh, lw = draw_runs(d, SAFE_S[0] + 10, y, runs)
    assert lw <= 1250, lw
    y += lh
ph = phone(Image.open(SHOTS / '11.webp'), 820, -9)
px = SAFE_S[2] - ph.width + 120
py = SAFE_S[1] - 230
drop_shadow(srch, ph, px, py, offset=(0, 50), blur=60, alpha=0.32)
srch.convert('RGB').save(OUT / 'search_3840x2560.png', 'PNG', optimize=True)
print('search', srch.size, 'phone box', (px, py, px + ph.width, py + ph.height))
