// アプリのアイコン（1024px）と起動画面（2732px）を作る。
// 形：明るい青の地に、白い地図のピンと、その中のパーキング・メーター。起動画面は名前とひとこと、下に街の通りのイラスト。
// 使い方：PLAYWRIGHT=<playwright のパス> FONTS=<@fontsource を展開したフォルダ> node build/app-icons/render.js
//   文字は Zen Kaku Gothic New（アプリと同じ書体）。FONTS がないときは端末の書体で描く
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');
const out = path.join(__dirname, '..', '..', 'ios', 'App', 'App', 'Assets.xcassets');
const BLUE = '#0A6CE8';
const FONTS = process.env.FONTS || '';

// ピン＋メーター（1024 の枠。中心 512）。pin：ピンの色、meter：メーターの色
const mark = (pin = '#fff', meter = BLUE) => `
  <path d="M512 905 L293.4 598.5 A270 270 0 1 1 730.6 598.5 Z" fill="${pin}" stroke="${pin}" stroke-width="24" stroke-linejoin="round"/>
  <g fill="${meter}">
    <path d="M352 404 A160 160 0 0 1 672 404 Z"/>
    <rect x="332" y="398" width="360" height="44" rx="22"/>
    <path d="M372 456 H652 L612 618 Q606 640 584 640 H440 Q418 640 412 618 Z"/>
    <rect x="484" y="630" width="56" height="112" rx="16"/>
  </g>
  <path d="M398 392 A114 114 0 0 1 626 392 Z" fill="${pin}"/>
  <g stroke="${meter}" stroke-width="16" stroke-linecap="round">
    <path d="M512 296 V318 M444 316 L456 336 M580 316 L568 336 M410 360 L430 368 M614 360 L594 368"/>
    <path d="M512 388 L466 344" stroke-width="18"/>
  </g>
  <circle cx="512" cy="390" r="22" fill="${meter}"/>
  <rect x="380" y="420" width="264" height="10" rx="5" fill="${pin}"/>`;

// 街の通り（起動画面の下。2732 の枠。地平線 y=2150、消える点は x=1366）。縦長の画面では x=736〜1996 が見える
const street = () => {
  const VX = 1366, HY = 2150, BOT = 2732;
  const at = (x0, t) => VX + (x0 - VX) * t; // 下の端の x0 から、地平線に向かって t（0〜1）のところの x
  const yAt = t => HY + (BOT - HY) * t;
  let s = '';
  // ビル（奥：うすい、手前：少し濃い）。屋上の高さをそろえすぎない
  const row = (list, c, wc) => list.map(([x, w, h]) => {
    let r = `<rect x="${x}" y="${HY - h}" width="${w}" height="${h}" fill="${c}"/>`;
    for (let yy = HY - h + 36; yy < HY - 40; yy += 56) r += `<rect x="${x + 22}" y="${yy}" width="${w - 44}" height="14" rx="4" fill="${wc}"/>`;
    return r;
  }).join('');
  s += row([[560, 150, 300], [720, 120, 420], [850, 170, 340], [1030, 130, 470], [1170, 110, 360], [1480, 120, 380], [1610, 150, 480], [1770, 120, 330], [1900, 170, 420], [2080, 130, 300]], '#4F98F3', 'rgba(255,255,255,.18)');
  s += row([[380, 230, 380], [620, 170, 250], [1890, 190, 270], [2090, 240, 400]], '#3B89EF', 'rgba(255,255,255,.16)');
  // 歩道と道
  s += `<rect x="0" y="${HY}" width="2732" height="${BOT - HY}" fill="#2F7FEC"/>`;
  s += `<path d="M${VX - 40} ${HY} H${VX + 40} L2450 ${BOT} H282 Z" fill="#76AEF6"/>`;
  s += `<path d="M${VX - 24} ${HY} H${VX + 24} L2250 ${BOT} H482 Z" fill="#0B5ED0"/>`;
  for (let k = 0; k < 7; k++) {
    const t0 = (k + 0.15) / 7, t1 = (k + 0.6) / 7, q0 = t0 ** 1.8, q1 = t1 ** 1.8;
    const w0 = 3 + 20 * q0, w1 = 3 + 20 * q1;
    s += `<path d="M${VX - w0} ${yAt(q0)} H${VX + w0} L${VX + w1} ${yAt(q1)} H${VX - w1} Z" fill="#fff" opacity=".7"/>`;
  }
  // 並木（道の両側。手前ほど大きい）
  [0.12, 0.25, 0.42, 0.65, 0.95].forEach(t => {
    const r = 18 + 120 * t, y = yAt(t * 0.55);
    [380, 2352].forEach(x0 => { const x = at(x0, t); s += `<rect x="${x - r * 0.08}" y="${y - r * 1.5}" width="${r * 0.16}" height="${r * 1.5}" fill="#1B63D2"/><circle cx="${x}" cy="${y - r * 1.9}" r="${r}" fill="#1B63D2"/>`; });
  });
  // 右の歩道のパーキング・メーター（白い柱と白い頭。目盛りの窓は青）
  s += `<g transform="translate(1560 1900) scale(0.40)"><rect x="492" y="700" width="40" height="1060" rx="12" fill="#fff"/>${mark('#2F7FEC', '#fff').replace(/<path d="M512 905[^>]*>/, '')}</g>`;
  return s;
};

const FONT = "'Zen Kaku Gothic New','IPAGothic',sans-serif";
const pages = {
  // アイコン：地いっぱいの青にピンとメーター。角丸なし・透明なし（iPhone が角を丸める）
  'AppIcon.appiconset/AppIcon-512@2x.png': [1024, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <rect width="1024" height="1024" fill="${BLUE}"/><g transform="translate(512 512) scale(0.86) translate(-512 -540)">${mark()}</g></svg>`],
  // 起動画面：青の地に、マーク・名前・ひとこと、下に街の通り。縦長の画面で左右が切れても、まん中は残る
  'Splash.imageset/splash-2732x2732.png': [2732, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732" width="2732" height="2732">
    <rect width="2732" height="2732" fill="${BLUE}"/>
    <g transform="translate(1366 880) scale(0.42) translate(-512 -600)">${mark()}</g>
    <text x="1366" y="1330" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="150" letter-spacing="6" fill="#fff">メーターマップ</text>
    <text x="1366" y="1450" text-anchor="middle" font-family="${FONT}" font-weight="500" font-size="58" letter-spacing="4" fill="#fff" opacity=".92">路上パーキングを、もっとかんたんに。</text>
    ${street()}</svg>`],
};
(async () => {
  const b = await chromium.launch();
  const css = FONTS ? ['700', '500'].map(w => `<link rel="stylesheet" href="file://${path.join(FONTS, 'fontsource-zen-kaku-gothic-new-5.3.1', w + '.css')}">`).join('') : '';
  for (const [file, [size, svg]] of Object.entries(pages)) {
    const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const html = path.join(os.tmpdir(), 'pmm-icon.html');
    fs.writeFileSync(html, `<html><head>${css}</head><body style="margin:0">${svg}</body></html>`);
    await p.goto('file://' + html);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(out, file) });
    await p.close();
  }
  await b.close();
})();
