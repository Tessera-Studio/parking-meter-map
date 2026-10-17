// アプリのアイコン（1024px）と起動画面（2732px）を icon.svg の形から作る。
// 使い方：node build/app-icons/render.js（Playwright の Chromium を使う）。できた PNG は ios/App/App/Assets.xcassets に入れる
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const out = path.join(__dirname, '..', '..', 'ios', 'App', 'App', 'Assets.xcassets');
const BRAND = '#1E4E8C', GROUND = '#ECEAE4';
// 「P」の形は icon.svg と同じ（64 の枠の中の線）
const P = '<path d="M22 50V14h12a11 11 0 0 1 0 22H22" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>';
const pages = {
  // アイコン：角丸なし・透明なし（iPhone が角を丸める）。地いっぱいの紺に白い P
  'AppIcon.appiconset/AppIcon-512@2x.png': [1024, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="1024" height="1024"><rect width="64" height="64" fill="${BRAND}"/>${P}</svg>`],
  // 起動画面：アプリの地の色に、まん中にアイコン（角丸）。縦長の画面で左右が切れても、まん中は残る
  'Splash.imageset/splash-2732x2732.png': [2732, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2732 2732" width="2732" height="2732"><rect width="2732" height="2732" fill="${GROUND}"/><g transform="translate(1186 1186) scale(5.625)"><rect width="64" height="64" rx="14" fill="${BRAND}"/>${P}</g></svg>`],
};
(async () => {
  const b = await chromium.launch();
  for (const [file, [size, svg]] of Object.entries(pages)) {
    const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    await p.screenshot({ path: path.join(out, file), omitBackground: false });
    await p.close();
  }
  await b.close();
})();
