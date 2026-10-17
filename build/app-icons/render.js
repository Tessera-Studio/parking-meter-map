// アプリのアイコン（1024px）を作る。形は渡されたデザイン（build/app-icons/source/design-2026-10-18.webp の左）をなぞったもの：
// 明るい青の地に、白い地図のピンと、その中のパーキング・メーター。線で描くので、拡大してもぼやけない。
// 起動画面は、同じデザイン画像の右半分から build/app-icons/splash-from-design.py で作る。
// 使い方：PLAYWRIGHT=<playwright のパス> node build/app-icons/render.js
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');
const out = path.join(__dirname, '..', '..', 'ios', 'App', 'App', 'Assets.xcassets');
const BLUE = '#006BF4';

const pages = {
  // アイコン：地いっぱいの青にピンとメーター。角丸なし・透明なし（iPhone が角を丸める）
  // 渡されたデザイン（2026-10-18）の形と比率をなぞる：丸みの大きいピン、太い縁の頭・中央の山と目盛り・白い線・台形の胴・短い柱
  'AppIcon.appiconset/AppIcon-512@2x.png': [1024, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <rect width="1024" height="1024" fill="${BLUE}"/>
    <path d="M512 950 L277.8 714.7 A330 330 0 1 1 746.2 714.7 Z" fill="#fff" stroke="#fff" stroke-width="24" stroke-linejoin="round"/>
    <g fill="${BLUE}">
      <path d="M310 452 A202 202 0 0 1 714 452 Z"/>
      <rect x="296" y="428" width="432" height="50" rx="25"/>
      <path d="M336 470 H688 L636 686 Q630 708 608 708 H416 Q394 708 388 686 Z"/>
      <rect x="463" y="696" width="98" height="140" rx="22"/>
    </g>
    <path d="M362 424 A150 150 0 0 1 662 424 Z" fill="#fff"/>
    <path d="M470 424 A42 42 0 0 1 554 424 Z" fill="${BLUE}"/>
    <g stroke="${BLUE}" stroke-width="18" stroke-linecap="round">
      ${[160, 125, 90, 55, 20].map(a => { const r = Math.PI * a / 180, c = Math.cos(r), n = Math.sin(r); return `<path d="M${512 + 74 * c} ${424 - 74 * n} L${512 + 110 * c} ${424 - 110 * n}"/>`; }).join('')}
    </g>
    <rect x="372" y="490" width="280" height="14" rx="7" fill="#fff"/></svg>`],
};
(async () => {
  const b = await chromium.launch();
  const css = '';
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
