/**
 * メーターマップ：ご意見・不具合の受け口（Google スプレッドシートに付ける Apps Script）
 * 使い方は docs/feedback.md。
 *
 * - doPost：アプリのフォームから届いた内容を「フィードバック」シートに1行足す
 * - setup：シートの見出し・選択肢・幅を整える（最初に1回だけ実行）
 * - weeklyReport：未対応の件数などを毎週メールで送る（トリガーで週1回）
 */

const SHEET = 'フィードバック';
const NOTIFY = 'support@tesseras.jp';   // 不具合・区間の誤りが届いたときと、毎週のまとめの送り先
const HEAD = ['受付日時', '状態', '優先度', '入口', '種類', '内容', '返信先', '区間番号', '区間名', '都道府県',
  'アプリの版', 'プラン', '端末', '端末番号', '担当', '対応した版', 'メモ'];
const STATES = ['新規', '確認済み', '対応予定', '対応済み', '対応しない'];
const PRIORITIES = ['P1', 'P2', 'P3'];
const KINDS = { bug: '不具合', zone: '区間の情報が違う', idea: '要望', other: 'その他' };
// 最初の目安の優先度（仕分けのときに直す）
const FIRST_PRIORITY = { bug: 'P2', zone: 'P1', idea: 'P3', other: 'P3' };

function setup() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sh = book.getSheetByName(SHEET) || book.insertSheet(SHEET);
  sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]).setFontWeight('bold').setBackground('#E7EDF6');
  sh.setFrozenRows(1);
  const rows = sh.getMaxRows() - 1;
  const rule = list => SpreadsheetApp.newDataValidation().requireValueInList(list, true).setAllowInvalid(false).build();
  sh.getRange(2, col('状態'), rows, 1).setDataValidation(rule(STATES));
  sh.getRange(2, col('優先度'), rows, 1).setDataValidation(rule(PRIORITIES));
  sh.getRange(2, col('入口'), rows, 1).setDataValidation(rule(['アプリ', 'メール', 'App Store']));
  sh.setColumnWidth(col('内容'), 420);
  sh.getRange(2, col('内容'), rows, 1).setWrap(true);
  sh.setColumnWidths(col('受付日時'), 1, 140);
}

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const kind = KINDS[d.kind] ? d.kind : 'other';
    const text = String(d.text || '').trim().slice(0, 1000);
    if (!text) return done('empty');
    // 送りすぎを防ぐ：1台から10分に5件まで、全体で1分に30件まで
    const cache = CacheService.getScriptCache();
    const dev = 'd:' + String(d.install || 'none').slice(0, 64);
    const n = Number(cache.get(dev) || 0), g = Number(cache.get('g') || 0);
    if (n >= 5 || g >= 30) return done('limit');
    cache.put(dev, String(n + 1), 600);
    cache.put('g', String(g + 1), 60);

    const row = {
      '受付日時': new Date(), '状態': '新規', '優先度': FIRST_PRIORITY[kind], '入口': 'アプリ', '種類': KINDS[kind],
      '内容': clean(text), '返信先': clean(d.mail, 200), '区間番号': clean(d.zoneId, 40), '区間名': clean(d.zoneName, 80),
      '都道府県': clean(d.pref, 10), 'アプリの版': clean(d.version, 20), 'プラン': clean(d.plan, 10),
      '端末': clean(d.device, 200), '端末番号': clean(d.install, 64),
    };
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
    sh.appendRow(HEAD.map(h => (h in row ? row[h] : '')));

    if (kind === 'bug' || kind === 'zone') {
      MailApp.sendEmail(NOTIFY, `【メーターマップ】${KINDS[kind]}が届きました`,
        [row['内容'], '', row['区間番号'] ? `区間：${row['区間名']}（${row['都道府県']}・${row['区間番号']}）` : '',
          `アプリ：${row['アプリの版']}／${row['プラン']}`, `返信先：${row['返信先'] || 'なし'}`, '',
          SpreadsheetApp.getActiveSpreadsheet().getUrl()].filter(String).join('\n'));
    }
    return done('ok');
  } catch (err) {
    return done('error');
  }
}

// 毎週のまとめ：新規の件数、未対応で一番古いもの、種類ごとの件数（未対応だけ）
function weeklyReport() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
  const v = sh.getDataRange().getValues().slice(1);
  const open = v.filter(r => !['対応済み', '対応しない'].includes(r[col('状態') - 1]));
  const fresh = open.filter(r => r[col('状態') - 1] === '新規');
  const oldest = open.reduce((m, r) => (!m || r[0] < m ? r[0] : m), null);
  const days = oldest ? Math.floor((Date.now() - new Date(oldest).getTime()) / 864e5) : 0;
  const byKind = {};
  open.forEach(r => { const k = r[col('種類') - 1] || 'その他'; byKind[k] = (byKind[k] || 0) + 1; });
  const p1 = open.filter(r => r[col('優先度') - 1] === 'P1').length;
  MailApp.sendEmail(NOTIFY, `【メーターマップ】今週のフィードバック：新規 ${fresh.length}件・未対応 ${open.length}件`,
    [`新規（まだ仕分けていないもの）：${fresh.length}件`, `未対応：${open.length}件（うち P1：${p1}件）`,
      `未対応で一番古いもの：${oldest ? days + '日前' : 'なし'}`, '',
      '未対応の種類ごとの件数：', ...Object.keys(byKind).map(k => `・${k}：${byKind[k]}件`), '',
      SpreadsheetApp.getActiveSpreadsheet().getUrl()].join('\n'));
}

function col(name) { return HEAD.indexOf(name) + 1; }
// 表計算の式として読まれないように、先頭の = + - @ を無効にする
function clean(s, max) {
  s = String(s == null ? '' : s).slice(0, max || 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function done(status) { return ContentService.createTextOutput(status).setMimeType(ContentService.MimeType.TEXT); }
