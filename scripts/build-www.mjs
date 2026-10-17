// ネイティブアプリ（Capacitor）に入れる画面のファイルを www/ に集める。Web 版はこれまでどおりビルドなし。
// 使い方：npm run build（npm run ios / npm run android はこれのあと cap sync まで行う）
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const OUT = 'www';
const FILES = ['index.html', 'config.js', 'app.js', 'basemap.js', 'zones.js', 'pro.js', 'native.js', 'styles.css', 'icon.svg'];
const DIRS = ['data', 'vendor'];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/vendor/capacitor`, { recursive: true });
for (const f of FILES) cpSync(f, `${OUT}/${f}`);
for (const d of DIRS) cpSync(d, `${OUT}/${d}`, { recursive: true });

// Capacitor の本体と、通知・現在地のプラグイン（バンドラなしで読めるファイル）
const NM = 'node_modules/@capacitor';
cpSync(`${NM}/core/dist/capacitor.js`, `${OUT}/vendor/capacitor/capacitor.js`);
cpSync(`${NM}/local-notifications/dist/plugin.js`, `${OUT}/vendor/capacitor/local-notifications.js`);
// 現在地のプラグインは synapse という名前のグローバルを使うので、つないで1つにする
writeFileSync(`${OUT}/vendor/capacitor/geolocation.js`, readFileSync(`${NM}/synapse/dist/synapse.js`, 'utf8') +
  '\nvar synapse = outsystemsSynapse;\n' + readFileSync(`${NM}/geolocation/dist/plugin.js`, 'utf8'));

// アプリ版では Pro の販売（Stripe）と広告（AdSense）を出さない。App Store・Google Play の決まりで使えないため（docs/native-app.md）
writeFileSync(`${OUT}/config.js`, readFileSync('config.js', 'utf8') +
  '\n/* アプリ版（scripts/build-www.mjs が足す） */\nObject.assign(window.PMM_CONFIG, { proEnabled: false, adsEnabled: false });\n');

// config.js の前に Capacitor と native.js を差し込む
const html = readFileSync('index.html', 'utf8');
const tags = ['vendor/capacitor/capacitor.js', 'vendor/capacitor/local-notifications.js', 'vendor/capacitor/geolocation.js', 'native.js']
  .map(s => `<script src="${s}"></script>`).join('\n');
const at = html.indexOf('<script src="config.js');
if (at < 0) throw new Error('index.html に config.js の script が見つかりません');
writeFileSync(`${OUT}/index.html`, html.slice(0, at) + tags + '\n' + html.slice(at));

console.log(`${OUT}/ を作りました`);
