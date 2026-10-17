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

// 街の通り（起動画面の下。2732 の枠）。消える点（x=1366, y=2150）に向かう遠近で、ビルは正面と道側の側面を描き、
// 遠いものほど空の色に溶けるようにして奥行きを出す。縦長の画面では x=736〜1996 が見える
const street = () => {
  const VX = 1366, HY = 2150, H0 = 640;          // H0：目の高さ（s=1 のとき地面は HY+H0）
  const X = (x, sc) => VX + x * sc, Y = (h, sc) => HY + (H0 - h) * sc; // 横 x・高さ h の点を、縮み sc で画面に
  const hex = c => c.match(/\w\w/g).map(v => parseInt(v, 16));
  const mix = (a, b, t) => '#' + hex(a).map((v, k) => Math.round(v + (hex(b)[k] - v) * t).toString(16).padStart(2, '0')).join('');
  const HAZE = '#9CC7FA', SMAX = 0.62;
  const haze = sc => Math.min(1, Math.max(0, 1 - sc / SMAX)) ** 0.8;
  const items = []; // [縮み, svg]
  // ビル：横 x0〜x1（道側が x0）、手前 z1・奥 z2、高さ h
  const building = (x0, x1, z1, z2, h, base) => {
    const s1 = 1 / z1, s2 = 1 / z2, k = haze(s1);
    const front = mix(base, HAZE, k), side = mix(mix(base, '#0A3F9E', 0.28), HAZE, k), win = mix('#D6E8FF', HAZE, k);
    const fx0 = X(x0, s1), fx1 = X(x1, s1), ft = Y(h, s1), fb = Y(0, s1), sx = X(x0, s2), st = Y(h, s2), sb = Y(0, s2);
    let g = `<path d="M${fx0} ${ft} L${sx} ${st} L${sx} ${sb} L${fx0} ${fb} Z" fill="${side}"/>`;
    g += `<rect x="${Math.min(fx0, fx1)}" y="${ft}" width="${Math.abs(fx1 - fx0)}" height="${fb - ft}" fill="${front}"/>`;
    g += `<rect x="${Math.min(fx0, fx1)}" y="${ft}" width="${Math.abs(fx1 - fx0)}" height="${(fb - ft) * 0.5}" fill="url(#lit)"/>`;
    for (let f = 0.1; f < 0.9; f += 0.11) { // 窓の帯（正面と側面）
      const a = ft + (fb - ft) * f, b = st + (sb - st) * f, th = (fb - ft) * 0.035, tb = (sb - st) * 0.035;
      g += `<path d="M${fx0} ${a} L${sx} ${b} L${sx} ${b + tb} L${fx0} ${a + th} Z" fill="${win}" opacity=".35"/>`;
      g += `<rect x="${Math.min(fx0, fx1) + Math.abs(fx1 - fx0) * 0.12}" y="${a}" width="${Math.abs(fx1 - fx0) * 0.76}" height="${th}" rx="${th / 2}" fill="${win}" opacity=".45"/>`;
    }
    items.push([s1, g]);
  };
  const tree = (x, z) => {
    const sc = 1 / z, k = haze(sc), cx = X(x, sc), by = Y(0, sc), r = 150 * sc, th = 230 * sc;
    const c1 = mix('#1F6FDC', HAZE, k), c2 = mix('#5FA5F6', HAZE, k), tr = mix('#1559BF', HAZE, k);
    items.push([sc, `<ellipse cx="${cx}" cy="${by}" rx="${r * 0.9}" ry="${r * 0.18}" fill="#0A4FB8" opacity="${0.25 * (1 - k)}"/>
      <rect x="${cx - r * 0.07}" y="${by - th}" width="${r * 0.14}" height="${th}" fill="${tr}"/>
      <circle cx="${cx}" cy="${by - th - r * 0.6}" r="${r}" fill="${c1}"/>
      <circle cx="${cx - r * 0.28}" cy="${by - th - r * 0.86}" r="${r * 0.62}" fill="${c2}" opacity=".55"/>`]);
  };
  // 左右の街並み（道側の面は x=±1150）
  const L = [[3.2, 4.4, 1500], [4.6, 5.6, 1050], [5.8, 7.4, 1750], [7.6, 9.0, 1250], [9.2, 11.5, 1900], [11.8, 14, 1350], [14.3, 18, 1700], [18.4, 24, 1400]];
  const R = [[3.0, 4.0, 1250], [4.2, 5.9, 1800], [6.1, 7.2, 1100], [7.4, 9.4, 1600], [9.6, 11.2, 1200], [11.5, 14.5, 1850], [14.8, 18.5, 1300], [18.9, 24, 1650]];
  L.forEach(([z1, z2, h], n) => building(-1150, -2300, z1, z2, h, n % 2 ? '#4A93F2' : '#3F8AF0'));
  R.forEach(([z1, z2, h], n) => building(1150, 2300, z1, z2, h, n % 2 ? '#3F8AF0' : '#4A93F2'));
  [2.2, 3.4, 4.8, 6.6, 9, 12.5, 17].forEach(z => { tree(-930, z); if (z > 3) tree(930, z + 0.6); });
  // 右の歩道のパーキング・メーター（白・影付き）
  { const z = 2.3, sc = 1 / z, cx = X(960, sc), by = Y(0, sc), m = 0.78 * sc; // 道の端（760）とビル（1150）のあいだの歩道に立てる。縦長の画面でも切れない位置
    items.push([sc, `<ellipse cx="${cx + 30 * m}" cy="${by}" rx="${120 * m}" ry="${22 * m}" fill="#083F96" opacity=".35"/>
      <g transform="translate(${cx - 512 * m} ${by - 1760 * m}) scale(${m})"><rect x="492" y="700" width="40" height="1060" rx="12" fill="url(#pole)"/>
      ${mark('#2F7FEC', '#fff').replace(/<path d="M512 905[^>]*>/, '')}</g>`]); }
  // 空・地面・道
  let out = `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BLUE}"/><stop offset=".62" stop-color="#1E7BEE"/><stop offset=".79" stop-color="#5FA5F6"/><stop offset="1" stop-color="#2F7FEC"/></linearGradient>
    <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5D9EF0"/><stop offset=".25" stop-color="#2173E0"/><stop offset="1" stop-color="#0750BE"/></linearGradient>
    <linearGradient id="walk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8BBDF8"/><stop offset="1" stop-color="#3D8BF0"/></linearGradient>
    <linearGradient id="lit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="pole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#C9DDF8"/></linearGradient>
  </defs>`;
  out += `<rect x="0" y="1500" width="2732" height="1232" fill="url(#sky)"/>`;
  out += `<ellipse cx="${VX}" cy="${HY}" rx="900" ry="260" fill="url(#glow)"/>`;
  out += `<path d="M0 ${HY} H2732 V2732 H0 Z" fill="url(#walk)"/>`;
  out += `<path d="M${VX} ${HY} L${X(-760, 1.3)} ${Y(0, 1.3)} H${X(760, 1.3)} Z" fill="url(#road)"/>`;
  [-760, 760].forEach(x => { out += `<path d="M${VX} ${HY} L${X(x - 40, 1.3)} ${Y(0, 1.3)} L${X(x, 1.3)} ${Y(0, 1.3)} Z" fill="#E4F0FF" opacity=".75"/>`; });
  for (let z = 1.1; z < 30; z *= 1.45) { const a = 1 / z, b = 1 / (z * 1.2), w = 18; out += `<path d="M${X(-w, a)} ${Y(0, a)} L${X(w, a)} ${Y(0, a)} L${X(w, b)} ${Y(0, b)} L${X(-w, b)} ${Y(0, b)} Z" fill="#fff" opacity=".8"/>`; }
  items.sort((p, q) => p[0] - q[0]).forEach(([, g]) => { out += g; });
  return out;
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
