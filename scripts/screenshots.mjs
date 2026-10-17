// App Store 用のスクリーンショットを撮る（6.9インチ：1320×2868）。Mac で、通信できる状態で実行する。
//   npm run build && npm run screenshots
// store/screenshots/raw/ に画面だけ、store/screenshots/ja/・en/ に見出し付きを出す（docs/store-listing.md の表のとおり）。
// 画面は www/ のものを iPhone の大きさ（440×956・3倍）で開いて撮る。時刻は平日の昼、現在地は銀座に固定。
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const W = 440, H = 956, SCALE = 3;                 // 1320×2868
const NOW = new Date('2026-11-11T12:30:00+09:00'); // 水曜の昼（使える区間が多い）
const GINZA = { latitude: 35.6717, longitude: 139.7650 };
const OUT = 'store/screenshots';

// 見出し（docs/store-listing.md の「スクリーンショット」と同じ。\n は改行）
const SHOTS = [
  { id: '01-map', ja: 'いま停められる区間が、\nひと目で', en: "See what's open now, at a glance" },
  { id: '02-detail', ja: '時間・料金・\n曜日ごとの決まりまで', en: 'Hours, fees and rules by day' },
  { id: '03-timer', ja: '閉じていても、\n終わる前にお知らせ', en: 'A reminder before time is up' },
  { id: '04-dest', ja: '行き先のまわりで探せる', en: 'Search around your destination' },
  { id: '05-go', ja: 'Apple マップ・\nGoogle マップで案内', en: 'Directions in Apple or Google Maps' },
  { id: '06-area', ja: '東京・大阪・神奈川・\n札幌・京都', en: 'Tokyo, Osaka, Kanagawa, Sapporo, Kyoto' },
];

/* ---------- www/ を配る小さなサーバー ---------- */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.geojson': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join('www', path.endsWith('/') ? `${path}index.html` : path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(body);
  } catch (e) { res.writeHead(404).end(); }
}).listen(0);
const URL_ = `http://localhost:${server.address().port}/`;

/* ---------- 画面を撮る ---------- */
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }); // 入っている Chromium を使うとき：CHROMIUM_PATH=…
async function open(storage = {}) {
  const ctx = await browser.newContext({
    viewport: { width: W, height: H }, deviceScaleFactor: SCALE, isMobile: true, hasTouch: true,
    locale: 'ja-JP', timezoneId: 'Asia/Tokyo', geolocation: GINZA, permissions: ['geolocation'],
    // iPhone として開く（「ここへ行く」で Apple マップが先に並ぶ）
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  });
  await ctx.addInitScript(s => {
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v));
    // アプリ版の文言で撮る（native.js の代わり。通知・課金は動かさない）
    window.Native = { platform: 'ios', askNotify: async () => true, schedule: async () => {}, store: null };
  }, storage);
  const page = await ctx.newPage();
  await page.clock.setFixedTime(NOW);
  await page.goto(URL_);
  await page.waitForSelector('.card[data-id]');
  await settle(page);
  return page;
}
// 地図の画像を読み終えるまで待つ
const settle = async page => { await page.waitForLoadState('networkidle').catch(() => {}); await page.waitForTimeout(1500); };
const firstCard = page => page.locator('.card[data-id]').first();

const steps = {
  '01-map': async () => open(),
  '02-detail': async () => {
    const p = await open();
    await firstCard(p).locator('[data-act="detail"]').click();
    await settle(p);
    return p;
  },
  '03-timer': async () => {
    const p = await open({ 'pmm-notify': true });
    await firstCard(p).locator('[data-act="timer"]').click();
    await p.click('#tstart');
    await p.clock.setFixedTime(new Date(NOW.getTime() + 38 * 60000)); // 38分たったところ
    await p.waitForTimeout(1500);
    return p;
  },
  '04-dest': async () => {
    const p = await open({ 'pmm-recent': [{ title: '東京駅', lat: 35.6812, lng: 139.7671 }] });
    await p.click('#q');
    await p.click('[data-recent="0"]');
    await settle(p);
    return p;
  },
  '05-go': async () => {
    const p = await open();
    await firstCard(p).locator('[data-act="go"]').click();
    await p.waitForTimeout(800);
    return p;
  },
  '06-area': async () => {
    const p = await open();
    await p.click('#q');
    await p.click('[data-pref="大阪府"]');
    await settle(p);
    return p;
  },
};

await mkdir(`${OUT}/raw`, { recursive: true });
for (const s of SHOTS) {
  try {
    const p = await steps[s.id]();
    await p.screenshot({ path: `${OUT}/raw/${s.id}.png` });
    await p.context().close();
    console.log(`撮りました：${s.id}`);
  } catch (e) { console.warn(`撮れませんでした：${s.id}（${e.message.split('\n')[0]}）`); s.skip = true; }
}

/* ---------- 見出しを付ける ---------- */
// 上に見出し、下に角丸の画面。背景はアイコンと同じ青
const frame = (img, text) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@700&display=swap">
<style>
  body{margin:0;width:1320px;height:2868px;background:#1E4E8C;display:flex;flex-direction:column;align-items:center;overflow:hidden;
    font-family:"Zen Kaku Gothic New","Hiragino Sans",sans-serif;color:#fff}
  h1{margin:170px 90px 0;font-size:84px;line-height:1.3;text-align:center;font-weight:700;letter-spacing:.02em}
  img{margin-top:110px;width:1080px;border-radius:72px;box-shadow:0 30px 80px rgba(0,0,0,.35)}
</style></head><body><h1>${text.replace(/\n/g, '<br>')}</h1><img src="data:image/png;base64,${img}"></body></html>`;
for (const lang of ['ja', 'en']) {
  await mkdir(`${OUT}/${lang}`, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1320, height: 2868 } });
  for (const s of SHOTS.filter(s => !s.skip)) {
    const img = (await readFile(`${OUT}/raw/${s.id}.png`)).toString('base64');
    await page.setContent(frame(img, s[lang]), { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}/${lang}/${s.id}.png` });
  }
  await page.close();
}

await browser.close();
server.close();
console.log(`${OUT}/ にできました（ja・en は見出し付き、raw は画面だけ）`);
