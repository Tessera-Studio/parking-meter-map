// アプリに入れる画面のファイルを www/ にまとめる（Capacitor の webDir）。
// 使い方：npm run build（先に build/stamp.py で ?v= を付け直してから呼ばれる）
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');
const FILES = ['index.html', 'styles.css', 'config.js', 'basemap.js', 'zones.js', 'pro.js', 'app.js', 'icon.svg'];
const DIRS = ['vendor', 'data'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const f of FILES) cpSync(join(root, f), join(out, f));
for (const d of DIRS) cpSync(join(root, d), join(out, d), { recursive: true });
console.log(`www/ に ${FILES.length} 個のファイルと ${DIRS.join('・')} をコピーしました`);
