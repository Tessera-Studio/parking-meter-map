/* パーキング・メーター・マップ
   1画面だけ。上で「場所」と「いつ（いま／日時を指定）」を決めると、
   地図の線が「停められる＝緑／停められない＝灰」になり、下（広い画面では左）に近い順の一覧が出る。 */
const GINZA = [35.6717, 139.7650]; // 現在地が取れないときに最初に見せる場所
const LIST_MAX = 40;   // 一覧に出す件数
const NEAR_M = 1000;   // 「停められる ◯区間」と数える範囲
const SMALL_ZOOM = 14; // これより引いた地図では、線の代わりに点で出す（線が短すぎて見えないため）

// 地図の下地は2つ。ふだんは色の少ない「シンプル」（国土地理院の淡色地図）、切り替えで「詳しい」（OpenStreetMap）
// config.js に CARTO の鍵があれば、シンプルは CARTO（ダークテーマにも合わせる）にする
const CARTO_KEY = (window.PAWMAP_CONFIG || {}).cartoApiKey || '';
const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const BASES = {
  simple: CARTO_KEY ? {
    light: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
    dark:  `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`,
    attr: `${OSM_ATTR} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    subdomains: 'abcd', maxNativeZoom: 20,
  } : {
    light: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
    dark:  'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
    attr: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>',
    subdomains: 'abc', maxNativeZoom: 18,
  },
  detail: {
    light: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark:  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: OSM_ATTR,
    subdomains: 'abc', maxNativeZoom: 19,
  },
};
const SRC_ATTR = '区間データ：<a href="https://parking-meter.jp/" target="_blank" rel="noopener">警視庁</a>（<a href="https://creativecommons.org/licenses/by/4.0/deed.ja" target="_blank" rel="noopener">CC BY 4.0</a>）・<a href="https://www.police.pref.osaka.lg.jp/kotsu/tyusya/1/1/index.html" target="_blank" rel="noopener">大阪府警察</a>・神奈川県警察・北海道警察・京都府警察（線は OpenStreetMap から作成）';
const PREFS = ['北海道', '東京都', '神奈川県', '京都府', '大阪府'];

// 国土地理院の地名検索・住所の逆引き（鍵不要）
const GSI_SEARCH = 'https://msearch.gsi.go.jp/address-search/AddressSearch?q=';
const GSI_REVERSE = 'https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress';
// 逆引きは市区町村コードで返るので、都内の区市の名前を引けるようにしておく
const MUNI = {
  13101: '千代田区', 13102: '中央区', 13103: '港区', 13104: '新宿区', 13105: '文京区', 13106: '台東区',
  13107: '墨田区', 13108: '江東区', 13109: '品川区', 13110: '目黒区', 13111: '大田区', 13112: '世田谷区',
  13113: '渋谷区', 13114: '中野区', 13115: '杉並区', 13116: '豊島区', 13117: '北区', 13118: '荒川区',
  13119: '板橋区', 13120: '練馬区', 13121: '足立区', 13122: '葛飾区', 13123: '江戸川区',
  13201: '八王子市', 13202: '立川市', 13203: '武蔵野市', 13204: '三鷹市', 13205: '青梅市', 13206: '府中市',
  13207: '昭島市', 13208: '調布市', 13209: '町田市', 13210: '小金井市', 13211: '小平市', 13212: '日野市',
  13213: '東村山市', 13214: '国分寺市', 13215: '国立市', 13218: '福生市', 13219: '狛江市', 13220: '東大和市',
  13221: '清瀬市', 13222: '東久留米市', 13223: '武蔵村山市', 13224: '多摩市', 13225: '稲城市', 13227: '羽村市',
  13228: 'あきる野市', 13229: '西東京市',
};

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// at：指定した日時（null ならいま）。sel：開いている区間。moved：人が地図を動かしたか（動かしたら現在地へ勝手に戻さない）
const state = { at: null, sel: null, here: null, moved: false };
let zones = [];
let holidays = { years: [], dates: {} }; // data/holidays.json
let map, tiles, layer, hereMark, placeMark;
let hits = []; // 場所の候補
const addrCache = new Map();

/* ---------- 言い回し ---------- */
const KIND = { meter: 'パーキング・メーター', ticket: 'パーキング・チケット' };
const hm = t => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
const fmtLimit = z => (z.limitMin == null ? '' : z.limitMin >= 60 && z.limitMin % 60 === 0 ? `${z.limitMin / 60}時間` : `${z.limitMin}分`);
const fmtFee = z => (z.feeYen == null ? '' : `${z.feeYen.toLocaleString()}円`);
const terms = z => [fmtLimit(z), fmtFee(z)].filter(Boolean).join('・') || KIND[z.kind];
const place = z => z.addr || terms(z);
const vehicles = z => (z.truckOnly ? '貨物車専用（積載量5トン未満）'
  : [z.car && '普通車', z.truck && '貨物用あり', z.bike && '二輪車'].filter(Boolean).join('・'));
const prefName = p => ({ 北海道: '札幌' }[p] || p.replace(/[都府県]$/, ''));
const fmtDist = m => (m < 1000 ? `${Math.round(m / 10) * 10}m` : `${(m / 1000).toFixed(1)}km`);

// きょう／あす／◯曜（いまの日付から見て）
function dayWord(t) {
  const a = new Date(); a.setHours(0, 0, 0, 0);
  const b = new Date(t); b.setHours(0, 0, 0, 0);
  const d = Math.round((b - a) / 864e5);
  return d === 0 ? 'きょう' : d === 1 ? 'あす' : `${'日月火水木金土'[t.getDay()]}曜`;
}
const when = () => state.at || new Date();
const whenText = () => (state.at ? `${dayWord(state.at)} ${state.at.getHours()}:00` : 'いま');

/* ---------- 停められるか ---------- */
// ok＝停められる／no＝時間外／unk＝時間が公開されていない（神奈川など）
const avail = (z, t = when()) => (z.days === 'unknown' || !z.span ? 'unk' : Zones.openNow(z, t, holidays.dates) ? 'ok' : 'no');

// 次に停められるようになる時刻（8日先まで見る。冬期休止などで見つからなければ null）
function nextOpen(z, from) {
  if (!z.span) return null;
  for (let d = 0; d < 8; d++) {
    const t = new Date(from);
    t.setDate(t.getDate() + d);
    t.setHours(Math.floor(z.span[0] / 60), z.span[0] % 60, 0, 0);
    if (t > from && Zones.openNow(z, t, holidays.dates)) return t;
  }
  return null;
}

function status(z, t = when()) {
  const a = avail(z, t);
  if (a === 'unk') return { a, text: '時間は現地の標識で確認' };
  if (a === 'ok') {
    const left = z.span[1] - (t.getHours() * 60 + t.getMinutes());
    return { a, text: `停められる・${hm(z.span[1])}まで`, soon: !state.at && left <= 60 ? `あと${left}分` : '' };
  }
  const n = nextOpen(z, t);
  return { a, text: n ? `時間外・${dayWord(n)} ${hm(z.span[0])}から` : '時間外（冬期は休止）', next: n };
}
const stHtml = s => `<span class="st ${s.a}">${esc(s.text)}${s.soon ? `<span class="soon">${esc(s.soon)}</span>` : ''}</span>`;

/* ---------- 地図 ---------- */
const darkQ = window.matchMedia('(prefers-color-scheme: dark)');
const narrow = () => window.innerWidth <= 760;

let baseKind = 'simple';
try { baseKind = localStorage.getItem('pmm-base') === 'detail' ? 'detail' : 'simple'; } catch (e) {}

function setTiles() {
  const base = BASES[baseKind];
  if (tiles) map.removeLayer(tiles);
  tiles = L.tileLayer(darkQ.matches ? base.dark : base.light, {
    attribution: base.attr, subdomains: base.subdomains,
    maxNativeZoom: base.maxNativeZoom, maxZoom: 21, detectRetina: true,
  }).addTo(map);
  // ダークテーマで明るい下地しかないときは、色を反転して暗くする（区間の線は別の層なのでそのまま）
  document.body.classList.toggle('dim-tiles', darkQ.matches && !(baseKind === 'simple' && CARTO_KEY));
  const b = $('#baseBtn');
  b.setAttribute('aria-pressed', baseKind === 'detail');
  b.querySelector('span').textContent = baseKind === 'detail' ? '地図：詳しい' : '地図：シンプル';
}
function toggleBase() {
  baseKind = baseKind === 'detail' ? 'simple' : 'detail';
  try { localStorage.setItem('pmm-base', baseKind); } catch (e) {}
  setTiles();
}

// 一覧が地図の下（スマホ）または左（広い画面）を隠すので、見えている範囲の中央を出すためのずれ
function offset() {
  const sh = $('#sheet');
  return narrow() ? L.point(0, (sh.offsetHeight - 110) / 2) : L.point(-sh.offsetWidth / 2, 0);
}
function visibleCenter() {
  const c = map.project(map.getCenter()).subtract(offset());
  const ll = map.unproject(c);
  return [ll.lat, ll.lng];
}
function centerOn(ll, zoom) {
  map.setView(map.unproject(map.project(ll, zoom).add(offset()), zoom), zoom, { animate: false });
}
// 区間が見えるように寄せるときの余白（スマホで詳細を開くときは、広がったあとの一覧の高さで見る）
function pad() {
  const sh = $('#sheet');
  const h = sh.classList.contains('mid') ? window.innerHeight * .62 : sh.offsetHeight;
  return narrow()
    ? { paddingTopLeft: [30, 130], paddingBottomRight: [30, h + 20] }
    : { paddingTopLeft: [sh.offsetWidth + 40, 120], paddingBottomRight: [40, 40] };
}

function initMap() {
  let start = { c: GINZA, z: 15 };
  try { start = JSON.parse(localStorage.getItem('pmm-last')) || start; } catch (e) {}
  map = L.map('map', { center: start.c, zoom: start.z, zoomControl: false, minZoom: 6, maxZoom: 21, preferCanvas: true });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  map.attributionControl.addAttribution(SRC_ATTR);
  setTiles();
  darkQ.addEventListener?.('change', () => { setTiles(); draw(); });
  layer = L.layerGroup().addTo(map);
  // 現在地・探した場所の印は、線を描き直しても隠れないよう別の層に置く
  map.createPane('marks').style.zIndex = 450;
  map.on('dragstart', () => { state.moved = true; });
  map.on('zoomend', draw);
  map.on('moveend', () => {
    renderList();
    try { localStorage.setItem('pmm-last', JSON.stringify({ c: visibleCenter(), z: map.getZoom() })); } catch (e) {}
  });
}

const colors = () => {
  const cs = getComputedStyle(document.documentElement);
  return { ok: cs.getPropertyValue('--ok').trim(), no: cs.getPropertyValue('--no').trim(), ink: cs.getPropertyValue('--ink').trim(), halo: cs.getPropertyValue('--surface').trim() };
};
const weight = () => Math.max(4, Math.min(10, map.getZoom() - 8));

function draw() {
  if (!zones.length) return;
  layer.clearLayers();
  const col = colors();
  const t = when();
  const small = map.getZoom() < SMALL_ZOOM;
  const order = { no: 0, unk: 1, ok: 2 }; // 停められる区間をいちばん上に
  zones.map(z => ({ z, a: avail(z, t) })).sort((p, q) => order[p.a] - order[q.a]).forEach(({ z, a }) => {
    const c = a === 'ok' ? col.ok : col.no;
    const on = z.id === state.sel;
    const w = weight();
    const parts = [];
    // 停められる区間は太い緑に白い縁。時間外・時間不明は細く薄い灰色にして、場所だけ分かるようにする（グレーアウト）
    const ok = a === 'ok';
    const dot = ll => L.circleMarker(ll, { radius: on ? 8 : ok ? 5 : 3, color: on ? col.ink : ok ? col.halo : c, weight: on ? 3 : ok ? 2 : 0, fillColor: c, fillOpacity: ok ? 1 : .45 });
    if (small) parts.push(dot(z.center));
    else {
      z.lines.forEach(l => {
        if (l.length === 1) { parts.push(dot(l[0])); return; }
        const lw = on ? w + 2 : ok ? w : Math.max(3, Math.round(w * .5));
        if (on) parts.push(L.polyline(l, { color: col.ink, weight: lw + 6, opacity: 1, lineCap: 'butt' }));
        else if (ok) parts.push(L.polyline(l, { color: col.halo, weight: lw + 4, opacity: 1, lineCap: 'butt' }));
        parts.push(L.polyline(l, { color: c, weight: lw, opacity: ok || on ? 1 : .45, lineCap: 'butt', dashArray: a === 'unk' ? '4 6' : null }));
        // 細い線でも押しやすいよう、見えない太い当たり判定を重ねる
        if (!ok && !on) parts.push(L.polyline(l, { color: c, weight: 18, opacity: 0, lineCap: 'butt' }));
      });
    }
    parts.forEach(p => { p.on('click', () => openDetail(z, false)); layer.addLayer(p); });
  });
}

/* ---------- 一覧 ---------- */
function meters(a, b) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// 区間のうち、起点にいちばん近い点までの距離
const nearest = (z, o) => Math.min(...z.lines.flat().map(p => meters(o, p)));

function rowHtml({ z, d, s }) {
  const [, num, unit] = fmtDist(d).match(/^([\d.]+)(.*)$/);
  const meta = [terms(z), z.kind === 'ticket' ? 'チケット' : 'メーター'].join('・');
  return `
    <button class="row ${s.a}" type="button" data-id="${esc(z.id)}">
      <span class="dist">${num}<small>${unit}</small></span>
      <span class="body"><span class="nm">${esc(place(z))}</span>${stHtml(s)}<span class="meta">${esc(meta)}</span></span>
    </button>`;
}

function renderList() {
  if (state.sel || !zones.length) return; // 詳細を出しているあいだはそのまま
  const o = visibleCenter();
  const t = when();
  // 先に中心からの距離でざっと絞り、近いものだけ線の端まで測る
  const rows = zones.map(z => ({ z, c: meters(o, z.center) })).sort((a, b) => a.c - b.c).slice(0, LIST_MAX + 20)
    .map(({ z }) => ({ z, d: nearest(z, o), s: status(z, t) })).sort((a, b) => a.d - b.d).slice(0, LIST_MAX);
  const ok = rows.filter(r => r.s.a === 'ok');
  const rest = rows.filter(r => r.s.a !== 'ok');
  const nOk = zones.filter(z => meters(o, z.center) <= NEAR_M && avail(z, t) === 'ok').length;
  const w = whenText();

  let notice = '';
  if (!rows.length || rows[0].d > 3000) {
    notice = `<p class="notice">この近くには区間がありません${rows.length ? `（いちばん近くて ${fmtDist(rows[0].d)}）` : ''}。地図を動かすか、上に場所を入れてください。</p>`;
  } else if (!nOk) {
    const soonest = rest.map(r => r.s.next).filter(Boolean).sort((a, b) => a - b)[0];
    notice = `<p class="notice"><b>${esc(w)}、この近くで停められる区間はありません。</b>${soonest ? `<br>${esc(dayWord(soonest))} ${esc(hm(soonest.getHours() * 60 + soonest.getMinutes()))}から停められます。` : ''}</p>`;
  }

  $('#sheetBody').innerHTML = `
    <p class="sum"><b>${esc(w)}停められる</b><span class="n">${nOk}</span><span>区間</span><small>地図の中心から1km以内</small></p>
    <p class="key"><span><i class="sw"></i>停められる</span><span><i class="sw no"></i>時間外</span><span><i class="sw unk"></i>時間は現地で確認</span></p>
    ${notice}
    <div class="rows">
      ${ok.length ? `<h3>停められる（近い順）</h3>${ok.map(rowHtml).join('')}` : ''}
      ${rest.length ? `<h3>${state.at ? 'その時間は' : 'いまは'}停められない</h3>${rest.map(rowHtml).join('')}` : ''}
    </div>
    <p class="foot">${SRC_ATTR}。現地の標識・メーターの表示が優先されます。</p>`;
}

/* ---------- 詳細 ---------- */
async function address(z) {
  if (z.addr) return z.addr;
  if (addrCache.has(z.id)) return addrCache.get(z.id);
  const [lat, lng] = z.center;
  const r = (await (await fetch(`${GSI_REVERSE}?lat=${lat}&lon=${lng}`)).json()).results;
  const text = r ? `${MUNI[+r.muniCd] || ''}${r.lv01Nm && r.lv01Nm !== '－' ? r.lv01Nm : ''}` : '';
  addrCache.set(z.id, text);
  return text;
}

// 曜日ごとの利用時間。指定した日（いまならきょう）の行に色を付ける
function week(z, t) {
  if (!z.span) return '';
  const r = z.rules.join(' ');
  const dow = t.getDay();
  const hol = !!holidays.dates[Zones.ymd(t)];
  const rows = [
    ['月〜金', z.hours, !hol && dow >= 1 && dow <= 5],
    ['土', /土/.test(r) ? '' : z.hours, !hol && dow === 6],
    ['日・祝', /日曜|休日/.test(r) ? '' : z.hours, hol || dow === 0],
  ];
  if (z.months) rows.push([`${z.months[1] % 12 + 1}月〜${(z.months[0] + 10) % 12 + 1}月`, '', false]);
  if (/1月1日/.test(r)) rows.push(['1月1日〜3日', '', false]);
  return `<div class="week"><h3>停められる時間</h3>${rows.map(([k, v, on]) =>
    `<div class="${on ? 'on' : ''}"><span>${k}</span><span class="${v ? '' : 'x'}">${v ? esc(v) : '停められない'}</span></div>`).join('')}</div>`;
}

function verdict(z, t) {
  const s = status(z, t);
  const w = state.at ? `${whenText()}は` : 'いま';
  if (s.a === 'unk') return `<p class="verdict"><b>時間は現地の標識で確認してください</b><span>県警の公開情報に時間・曜日がありません</span></p>`;
  if (s.a === 'ok') {
    return `<p class="verdict ok"><b>${esc(w)}停められます</b><span>${esc([`${hm(z.span[1])}まで`, fmtLimit(z) && `最大${fmtLimit(z)}`, fmtFee(z)].filter(Boolean).join('・'))}${s.soon ? ` <span class="soon">${esc(s.soon)}で時間外</span>` : ''}</span></p>`;
  }
  return `<p class="verdict"><b>${esc(w)}${state.at ? '' : 'は'}停められません</b><span>${s.next ? `${esc(dayWord(s.next))} ${esc(hm(z.span[0]))}から停められます` : '冬期は休止しています'}</span></p>`;
}

function openDetail(z, fly = true) {
  state.sel = z.id;
  draw();
  setSheet(narrow() ? 'mid' : '');
  const t = when();
  const [lat, lng] = z.center;
  const row = (k, v) => (v ? `<dt>${k}</dt><dd>${esc(v)}</dd>` : '');
  $('#sheetBody').innerHTML = `
    <button class="back" type="button" id="back"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>一覧に戻る</button>
    <div class="detail">
      <p class="dkick">${esc([prefName(z.pref), z.ward, KIND[z.kind]].filter(Boolean).join('・'))}</p>
      <h2 id="dtitle">${esc(z.addr ? z.addr.slice(z.ward.length) || z.addr : '住所を調べています…')}</h2>
      ${verdict(z, t)}
      <div class="facts">
        <div><span>最大</span><b>${esc(fmtLimit(z) || '—')}</b></div>
        <div><span>料金</span><b>${esc(fmtFee(z) || '—')}</b></div>
        <div><span>種類</span><b>${z.kind === 'ticket' ? 'チケット' : 'メーター'}</b></div>
      </div>
      ${week(z, t)}
      <dl>
        ${row('車種', vehicles(z))}
        ${z.permitOnly ? row('注意', '標章車（障害者等用）専用の枠があります') : ''}
        ${row('路線', z.route)}
        ${row('区間', z.section)}
        ${row('枠数', z.spaces != null ? `${z.spaces}台` + (z.truckSpaces ? `（うち貨物車 ${z.truckSpaces}台）` : '') : '')}
        ${z.pref === '東京都' ? row('区間番号', z.id) : ''}
        ${row('出典', z.source)}
      </dl>
      <div class="acts">
        <a class="btn primary" href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener">Googleマップで開く</a>
        <p class="route">経路：<a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving" target="_blank" rel="noopener">Google</a><a href="https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d" target="_blank" rel="noopener">Apple</a></p>
      </div>
      <p class="warn">現地の標識・メーターの表示が優先されます。工事や行事で使えない場合もあります。</p>
    </div>`;
  $('#sheetBody').scrollTop = 0;
  $('#back').onclick = closeDetail;
  if (fly) map.flyToBounds(L.latLngBounds(z.lines.flat()), { maxZoom: 17, duration: .5, ...pad() });
  if (!z.addr) {
    address(z)
      .then(a => { if (state.sel === z.id) $('#dtitle').textContent = a || terms(z); })
      .catch(() => { if (state.sel === z.id) $('#dtitle').textContent = terms(z); });
  }
}

function closeDetail() {
  state.sel = null;
  setSheet('');
  draw();
  renderList();
}

// スマホの一覧の高さ：''＝半分、'mid'＝詳細用、'full'＝ほぼ全部
function setSheet(size) {
  const sh = $('#sheet');
  sh.classList.toggle('full', size === 'full');
  sh.classList.toggle('mid', size === 'mid');
  $('#grip').setAttribute('aria-expanded', size === 'full');
}

/* ---------- いつ ---------- */
function fillWhen() {
  const today = new Date();
  const opts = [[0, 'きょう'], [1, 'あす']];
  // 次の土曜・日曜（きょう・あすと重なるときは出さない）
  [6, 0].forEach(dow => {
    const d = (dow - today.getDay() + 7) % 7;
    if (d > 1) {
      const t = new Date(today); t.setDate(t.getDate() + d);
      opts.push([d, `${'日月火水木金土'[dow]}曜（${t.getMonth() + 1}/${t.getDate()}）`]);
    }
  });
  $('#whenDay').innerHTML = opts.map(([v, k]) => `<option value="${v}">${k}</option>`).join('');
  let hours = '';
  for (let h = 0; h < 24; h++) hours += `<option value="${h}">${h}:00</option>`;
  $('#whenHour').innerHTML = hours;
  $('#whenHour').value = String((today.getHours() + 1) % 24);
}

function setWhen(pick) {
  $('#whenNow').setAttribute('aria-pressed', !pick);
  $('#whenPick').setAttribute('aria-pressed', pick);
  $('#whenSet').hidden = !pick;
  if (pick) {
    const t = new Date();
    t.setDate(t.getDate() + +$('#whenDay').value);
    t.setHours(+$('#whenHour').value, 0, 0, 0);
    state.at = t;
  } else state.at = null;
  refresh();
}

function refresh() {
  draw();
  const z = state.sel && zones.find(x => x.id === state.sel);
  if (z) openDetail(z, false);
  else renderList();
}

/* ---------- 場所 ---------- */
const PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
const CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>';
const AREA_RE = /^(東京都|大阪府|京都府|北海道|神奈川県)/;

function recent() {
  try { return JSON.parse(localStorage.getItem('pmm-recent')) || []; } catch (e) { return []; }
}
function remember(h) {
  const list = [h, ...recent().filter(x => x.title !== h.title)].slice(0, 5);
  try { localStorage.setItem('pmm-recent', JSON.stringify(list)); } catch (e) {}
}
const nearCount = p => zones.filter(z => meters(p, z.center) < NEAR_M).length;
function count(list, k) {
  const n = {};
  list.forEach(z => { if (z[k]) n[z[k]] = (n[z[k]] || 0) + 1; });
  return n;
}

function showPanel(html) {
  $('#qpanel').innerHTML = html;
  $('#qpanel').hidden = !html;
}
// 何も入れていないとき：エリアへの移動と、最近探した場所
function idlePanel() {
  const n = count(zones, 'pref');
  const areas = PREFS.filter(p => n[p]).map(p => `<button class="chip" type="button" data-pref="${p}">${prefName(p)}</button>`).join('');
  const rec = recent().map((h, i) =>
    `<button type="button" class="qrow recent" data-recent="${i}">${CLOCK}<span class="qt"><b>${esc(h.title)}</b></span></button>`).join('');
  showPanel(`<h3>エリアへ移動</h3><div class="areas">${areas}</div>${rec ? `<h3>最近</h3>${rec}` : ''}`);
}

async function search(q) {
  q = q.trim();
  if (!q) return;
  showPanel('<p class="qmsg">探しています…</p>');
  try {
    const res = await fetch(GSI_SEARCH + encodeURIComponent(q));
    // 区間のある都道府県の地名を先に（同名の地名が全国にあるため）
    const all = (await res.json()).slice(0, 30)
      .map(h => ({ title: h.properties.title, lat: h.geometry.coordinates[1], lng: h.geometry.coordinates[0] }));
    hits = [...all.filter(h => AREA_RE.test(h.title)), ...all.filter(h => !AREA_RE.test(h.title))].slice(0, 6);
    if (!hits.length) { showPanel(`<p class="qmsg">「${esc(q)}」は見つかりませんでした</p>`); return; }
    if (hits.length === 1) { goTo(hits[0]); return; }
    showPanel(hits.map((h, i) => {
      const [, pref, rest] = h.title.match(/^(北海道|東京都|(?:大阪|京都)府|.{2,3}県)?(.*)$/);
      return `<button type="button" class="qrow" data-hit="${i}">${PIN}<span class="qt"><b>${esc(rest || h.title)}</b>${pref ? `<span>${esc(pref)}</span>` : ''}</span><span class="qn">${nearCount([h.lat, h.lng])}区間</span></button>`;
    }).join(''));
  } catch (e) {
    showPanel('<p class="qmsg">地名検索につながりませんでした</p>');
  }
}

function goTo(h) {
  remember(h);
  showPanel('');
  $('#q').value = h.title;
  $('#q').blur();
  state.moved = true;
  if (state.sel) { state.sel = null; setSheet(''); }
  if (placeMark) map.removeLayer(placeMark);
  placeMark = L.circleMarker([h.lat, h.lng], { pane: 'marks', radius: 7, color: '#fff', weight: 3, fillColor: '#D1452E', fillOpacity: 1 })
    .bindTooltip(esc(h.title)).addTo(map);
  centerOn([h.lat, h.lng], 16);
  draw();
}

function fitPref(pref) {
  showPanel('');
  state.moved = true;
  const pts = zones.filter(z => z.pref === pref).flatMap(z => z.lines.flat());
  if (pts.length) map.fitBounds(L.latLngBounds(pts), { animate: false, ...pad() });
}

/* ---------- 現在地 ---------- */
function showHere(p) {
  state.here = [p.coords.latitude, p.coords.longitude];
  if (hereMark) hereMark.setLatLng(state.here);
  else hereMark = L.circleMarker(state.here, { pane: 'marks', radius: 9, color: '#fff', weight: 3, fillColor: '#1F63C6', fillOpacity: 1 }).addTo(map);
}
function watchHere() {
  if (!navigator.geolocation) return;
  navigator.geolocation.watchPosition(p => {
    const first = !state.here;
    showHere(p);
    // 最初の1回だけ、まだ地図を触っていなければ現在地の周りを見せる
    if (first && !state.moved) centerOn(state.here, 16);
  }, () => {}, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
}

/* ---------- 組み立て ---------- */
function bind() {
  $('#qform').addEventListener('submit', e => { e.preventDefault(); $('#q').blur(); search($('#q').value); });
  $('#q').addEventListener('focus', () => { $('#q').select(); if (!$('#q').value.trim()) idlePanel(); });
  $('#q').addEventListener('input', () => { if (!$('#q').value.trim()) idlePanel(); else showPanel(''); });
  $('#qpanel').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.hit) goTo(hits[+b.dataset.hit]);
    else if (b.dataset.recent) goTo(recent()[+b.dataset.recent]);
    else if (b.dataset.pref) fitPref(b.dataset.pref);
  });
  document.addEventListener('click', e => {
    if (!$('#qpanel').hidden && !e.target.closest('.topbar')) showPanel('');
  });

  $('#whenNow').addEventListener('click', () => setWhen(false));
  $('#whenPick').addEventListener('click', () => setWhen(true));
  $('#whenDay').addEventListener('change', () => setWhen(true));
  $('#whenHour').addEventListener('change', () => setWhen(true));

  $('#sheetBody').addEventListener('click', e => {
    const b = e.target.closest('.row');
    if (b) openDetail(zones.find(z => z.id === b.dataset.id));
  });
  $('#grip').addEventListener('click', () => setSheet($('#sheet').classList.contains('full') ? (state.sel ? 'mid' : '') : 'full'));

  $('#baseBtn').addEventListener('click', toggleBase);
  $('#locate').addEventListener('click', () => {
    if (!navigator.geolocation) return alert('この端末では現在地を使えません');
    if (state.here) centerOn(state.here, Math.max(map.getZoom(), 16));
    navigator.geolocation.getCurrentPosition(p => { showHere(p); centerOn(state.here, Math.max(map.getZoom(), 16)); },
      () => alert('現在地を取得できませんでした。位置情報の許可を確かめてください'), { enableHighAccuracy: true, timeout: 15000 });
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('#qpanel').hidden) showPanel('');
    else if (state.sel) closeDetail();
  });
  // 「いま」は時間が進むと変わるので、1分ごとに見直す
  setInterval(() => { if (!state.at) refresh(); }, 60000);
}

async function boot() {
  initMap();
  bind();
  fillWhen();
  try {
    zones = Zones.normalize(await (await fetch('data/zones.geojson', { cache: 'no-cache' })).json());
  } catch (e) {
    $('#empty').hidden = false;
    return;
  }
  try {
    holidays = await (await fetch('data/holidays.json', { cache: 'no-cache' })).json();
  } catch (e) { /* 祝日一覧がなくても動く（祝日を判定しないだけ） */ }
  draw();
  renderList();
  watchHere();
}

boot();
