/* パーキング・メーター・マップ（画面デザイン v2 / docs/design-v2.md）
   地図が主役。上に検索とチップ、下（広い画面では左）に区間のカードを横に並べる。
   区間は「道路に沿った線＋Pマーク」。緑＝その時刻に使える区間、それ以外（時間外・時間不明）はグレー。 */
const GINZA = [35.6717, 139.7650]; // 現在地が取れないときに最初に見せる場所
const LIST_MAX = 40;   // カードに出す件数
const NEAR_M = 1000;   // カードに出す範囲（起点から区間の線まで）
const SMALL_ZOOM = 14;  // これより引いた地図では、線を細くする
const DETAIL_ZOOM = 17; // ここまで寄ったら、全区間に小さいPマークを出す（それまでは選んだ区間だけ）
const WALK_M_MIN = 80; // 徒歩1分の距離
const DEST_R = 400;    // 行き先のまわりに描く円（徒歩5分）
const CAR_KMH = 20;    // 「ここへ行く」の所要時間の目安（直線距離×1.4 をこの速さで）

// 地図の下地は basemap.js のベクトル地図（ふだんは「シンプル」、切り替えで「詳しい」）。
// WebGL が使えない・地図が読めないときだけ、国土地理院の淡色地図（画像）にする
const GSI_PALE = {
  url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
  attr: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>',
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
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } };
const save = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

/* at：指定した日時（null ならいま）。sel：選んでいる区間。moved：人が地図を動かしたか（動かしたら現在地へ勝手に戻さない）
   green：「緑だけ」。dest：行き先（地名検索で選んだ場所）。detail：詳細を出しているか。rows：いまのカード */
const state = { at: null, sel: null, here: null, moved: false, green: false, dest: null, prevView: null, detail: false, rows: [] };
let zones = [];
let byId = new Map();
let holidays = { years: [], dates: {} }; // data/holidays.json
let map, tiles, layer, marks, hereMark, carMark;
let quiet = false; // カードをめくって地図を動かしたとき、カードを並べ直さない
let hits = [];     // 場所の候補
const addrCache = new Map();

/* ---------- アイコン ---------- */
const svg = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const I = {
  clock: svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
  go: svg('<path d="M20 4L3 11l7 3 3 7z"/>'),
  pin: svg('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  flag: svg('<path d="M6 21V4M6 4h11l-2.5 4L17 12H6"/>'),
  map: svg('<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>'),
  timer: svg('<circle cx="12" cy="13" r="8"/><path d="M12 13l3-3M9.5 2.5h5"/>'),
  yen: svg('<circle cx="12" cy="12" r="9"/><path d="M8.5 7.5L12 12l3.5-4.5M12 12v5M9 12.5h6M9 15h6"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  chev: svg('<path d="M9 6l6 6-6 6"/>'),
  down: svg('<path d="M6 9l6 6 6-6"/>'),
  play: svg('<path d="M8 5l11 7-11 7z" fill="currentColor"/>'),
  stop: svg('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>'),
  car: svg('<path d="M5 16V11l2-5h10l2 5v5M5 16h14M5 16v2M19 16v2M7.5 13h.01M16.5 13h.01"/>'),
};

/* ---------- 言い回し ---------- */
const KIND = { meter: 'パーキング・メーター', ticket: 'パーキング・チケット' };
const hm = t => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
const hmOf = d => hm(d.getHours() * 60 + d.getMinutes());
const fmtLimit = z => (z.limitMin == null ? '' : z.limitMin >= 60 && z.limitMin % 60 === 0 ? `${z.limitMin / 60}時間` : `${z.limitMin}分`);
const fmtFee = z => (z.feeYen == null ? '' : `${z.feeYen.toLocaleString()}円`);
const terms = z => [fmtLimit(z) && `最大${fmtLimit(z)}`, fmtFee(z)].filter(Boolean).join(' · ') || KIND[z.kind];
const kindShort = z => (z.kind === 'ticket' ? 'チケット' : 'メーター');
const zoneName = z => (z.addr ? z.addr.slice(z.ward.length) || z.addr : addrCache.get(z.id) || terms(z));
const kicker = z => [`${z.pref === '北海道' ? '北海道' : z.pref}${z.ward}`, KIND[z.kind]].filter(Boolean).join(' · ');
const vehicles = z => (z.truckOnly ? '貨物車専用'
  : [z.car && '普通車', z.truck && '貨物', z.bike && '二輪'].filter(Boolean).join('・') || '—');
const prefName = p => ({ 北海道: '札幌' }[p] || p.replace(/[都府県]$/, ''));
const fmtDist = m => (m < 1000 ? `${Math.round(m / 10) * 10}m` : `${(m / 1000).toFixed(1)}km`);
const walkMin = m => Math.max(1, Math.ceil(m / WALK_M_MIN));
const fmtMin = m => (m >= 60 ? `${Math.floor(m / 60)}時間${m % 60 ? `${m % 60}分` : ''}` : `${m}分`);

// きょう／あす／◯曜（いまの日付から見て）
function dayWord(t) {
  const a = new Date(); a.setHours(0, 0, 0, 0);
  const b = new Date(t); b.setHours(0, 0, 0, 0);
  const d = Math.round((b - a) / 864e5);
  return d === 0 ? 'きょう' : d === 1 ? 'あす' : `${'日月火水木金土'[t.getDay()]}曜`;
}
const when = () => state.at || new Date();

/* ---------- 使える時間か ---------- */
// ok＝使える／no＝時間外／unk＝時間が公開されていない（神奈川など）
const avail = (z, t = when()) => (z.days === 'unknown' || !z.span ? 'unk' : Zones.openNow(z, t, holidays.dates) ? 'ok' : 'no');

// 次に使えるようになる時刻（8日先まで見る。冬期休止などで見つからなければ null）
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

// バッジの文言。緑は終わりの時刻だけ、時間外は次に使える時刻だけ
function status(z, t = when()) {
  const a = avail(z, t);
  if (a === 'unk') return { a, text: '時間は現地で確認' };
  if (a === 'ok') return { a, text: `${hm(z.span[1])}まで` };
  const n = nextOpen(z, t);
  return { a, text: n ? `${dayWord(n)} ${hmOf(n)}から` : '冬期休止中', next: n };
}
// バッジの色：緑＝使える／赤＝時間外／グレー＝時間不明
const badge = s => (s.a === 'ok'
  ? `<span class="badge ok">${I.clock}${esc(s.text)}</span>`
  : `<span class="badge ${s.a === 'no' ? 'no' : 'off'}">${esc(s.text)}</span>`);

/* ---------- 地図 ---------- */
const darkQ = window.matchMedia('(prefers-color-scheme: dark)');
const narrow = () => window.innerWidth <= 760;

let baseKind = 'simple';
try { baseKind = localStorage.getItem('pmm-base') === 'detail' ? 'detail' : 'simple'; } catch (e) {}

let useVector = true;
function setTiles() {
  if (tiles) map.removeLayer(tiles);
  map.attributionControl.removeAttribution(Basemap.ATTR);
  const dark = darkQ.matches;
  if (useVector && Basemap.supported()) {
    tiles = L.maplibreGL({ style: Basemap.style(dark, baseKind === 'detail'), interactive: false, attributionControl: false });
    tiles.addTo(map);
    map.attributionControl.addAttribution(Basemap.ATTR);
    watchVector(tiles);
  } else {
    tiles = L.tileLayer(GSI_PALE.url, { attribution: GSI_PALE.attr, maxNativeZoom: 18, maxZoom: 21, detectRetina: true }).addTo(map);
  }
  // 画像の地図しかないダークテーマでは、色を反転して暗くする（区間の線は別の層なのでそのまま）
  document.body.classList.toggle('dim-tiles', dark && !(tiles instanceof L.MaplibreGL));
  $('#map').style.background = dark ? '#18191B' : '#F2F1EE';
  const b = $('#baseBtn');
  b.setAttribute('aria-pressed', baseKind === 'detail');
  b.setAttribute('aria-label', `地図の表示を切り替え（いまは${baseKind === 'detail' ? '詳しい地図' : 'シンプル'}）`);
}
// ベクトル地図が1枚も読めないうちに失敗したら（または8秒たっても読めなければ）、画像の地図に切り替える
function watchVector(t) {
  const gl = t.getMaplibreMap();
  if (!gl) return;
  let ok = false;
  const fail = () => { if (!ok && tiles === t && useVector) { useVector = false; setTiles(); } };
  gl.on('sourcedata', e => { if (e.tile) ok = true; });
  gl.on('error', fail);
  setTimeout(fail, 8000);
}
function toggleBase() {
  baseKind = baseKind === 'detail' ? 'simple' : 'detail';
  try { localStorage.setItem('pmm-base', baseKind); } catch (e) {}
  setTiles();
}

// 地図のうち、上の部品・カード・詳細に隠れていない範囲（画面の座標）
function region() {
  const W = window.innerWidth, H = window.innerHeight;
  if (state.detail) {
    if (narrow()) return { l: 0, t: 0, r: W, b: $('#dsheet').getBoundingClientRect().top };
    return { l: $('#detail').offsetWidth, t: 0, r: W, b: H };
  }
  const t = $('.toprow').getBoundingClientRect().bottom;
  if (narrow()) return { l: 0, t, r: W, b: $('#cards').getBoundingClientRect().top };
  return { l: $('#cards').offsetWidth, t, r: W, b: H };
}
// 地図の中心から、見えている範囲の中心までのずれ
function offset() {
  const r = region();
  return L.point(window.innerWidth / 2 - (r.l + r.r) / 2, window.innerHeight / 2 - (r.t + r.b) / 2);
}
function visibleCenter() {
  const ll = map.unproject(map.project(map.getCenter()).subtract(offset()));
  return [ll.lat, ll.lng];
}
function centerOn(ll, zoom = map.getZoom(), animate = false) {
  const c = map.unproject(map.project(ll, zoom).add(offset()), zoom);
  if (animate) map.flyTo(c, zoom, { duration: .4 }); else map.setView(c, zoom, { animate: false });
}
// 区間を見えている範囲に入れるときの余白
function pad() {
  const r = region();
  return { paddingTopLeft: [r.l + 30, r.t + 30], paddingBottomRight: [window.innerWidth - r.r + 30, window.innerHeight - r.b + 30] };
}

function initMap() {
  const start = load('pmm-last', null) || { c: GINZA, z: 16 };
  map = L.map('map', { center: start.c, zoom: start.z, zoomControl: false, minZoom: 6, maxZoom: 21, preferCanvas: true });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  map.attributionControl.setPosition('bottomright');
  map.attributionControl.addAttribution(SRC_ATTR);
  setTiles();
  darkQ.addEventListener?.('change', () => { setTiles(); draw(); drawDest(); });
  layer = L.layerGroup().addTo(map);
  marks = L.layerGroup().addTo(map); // 行き先の印と円
  map.on('dragstart', () => { state.moved = true; quiet = false; });
  map.on('moveend', () => {
    if (quiet || state.detail || state.dest) { quiet = false; draw(); } else renderCards();
    save('pmm-last', { c: visibleCenter(), z: map.getZoom() });
  });
}

const colors = () => {
  const cs = getComputedStyle(document.documentElement);
  const v = k => cs.getPropertyValue(k).trim();
  return { ok: v('--ok'), no: v('--no'), off: v('--off'), pick: v('--pick'), edge: v('--pick-edge') };
};

// 区間の線とPマーク。重なり順は時間不明 → 赤 → 緑 → 選んだ区間
// 線はいつも出す。Pマークは選んだ区間と、DETAIL_ZOOM まで寄った地図だけ。地図の上に時刻の札は出さない
function draw() {
  if (!zones.length) return;
  layer.clearLayers();
  const col = colors();
  const dark = darkQ.matches;
  const t = when();
  const zoom = map.getZoom();
  const small = zoom < SMALL_ZOOM;
  const allP = zoom >= DETAIL_ZOOM;
  const view = map.getBounds().pad(.3);
  const items = [];
  zones.forEach(z => {
    const sel = z.id === state.sel;
    if (!sel && !view.intersects(z.bounds)) return;
    const a = avail(z, t);
    items.push({ z, a, sel, rank: sel ? 3 : a === 'ok' ? 2 : a === 'no' ? 1 : 0 });
  });
  items.sort((p, q) => p.rank - q.rank);

  items.forEach(({ z, a, sel, rank }) => {
    const ok = a === 'ok';
    const c = ok ? col.ok : a === 'no' ? col.no : col.off;
    const parts = [];
    const line = (l, o) => parts.push(L.polyline(l, { opacity: 1, lineCap: 'round', lineJoin: 'round', ...o }));
    z.lines.forEach(l => {
      if (l.length < 2) return;
      if (sel) {
        // 選んだ区間は状態に関係なく --pick。状態はPマークの色とカードのバッジで見せる
        if (!dark) line(l, { color: col.edge, weight: 12 });
        line(l, { color: col.pick, weight: 8 });
      } else if (ok) {
        if (!small && !dark) line(l, { color: '#fff', weight: 10 });
        line(l, { color: c, weight: small ? 4 : 6 });
      } else {
        // 赤（時間外）・グレーの破線（時間不明）は、緑より細く
        line(l, { color: c, weight: small ? 2 : 4, lineCap: 'butt', dashArray: a === 'unk' ? '4 6' : null });
      }
      // 細い線でも押しやすいよう、見えない太い当たり判定を重ねる
      parts.push(L.polyline(l, { color: c, weight: 18, opacity: 0 }));
    });
    if (sel || allP) {
      const html = `<div class="pw${sel ? ' sel' : ''} ${a}" data-id="${esc(z.id)}"><div class="p">P</div></div>`;
      parts.push(L.marker(z.center, {
        icon: L.divIcon({ className: 'pm', html, iconSize: [0, 0] }),
        zIndexOffset: rank * 1000, keyboard: false, title: zoneName(z),
      }));
    }
    parts.forEach(p => { p.on('click', () => pickOnMap(z)); layer.addLayer(p); });
  });
}

/* ---------- カード ---------- */
function meters(a, b) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// 区間のうち、起点にいちばん近い点までの距離
const nearest = (z, o) => Math.min(...z.lines.flat().map(p => meters(o, p)));
// 距離を測る起点：行き先があれば行き先、なければ見えている地図の中心
const origin = () => (state.dest ? [state.dest.lat, state.dest.lng] : visibleCenter());
const distText = d => (state.dest ? `${state.dest.name}まで 徒歩${walkMin(d)}分` : `徒歩 ${walkMin(d)}分`);

// 起点から1km以内の区間。緑を近い順、その後にグレーを近い順。extra は一覧の外でも入れる区間（地図で押したとき）
function computeRows(extra) {
  const o = origin();
  const t = when();
  const rows = zones.filter(z => meters(o, z.center) <= NEAR_M + 1500)
    .map(z => ({ z, d: nearest(z, o) }))
    .filter(r => r.d <= NEAR_M)
    .map(r => ({ ...r, s: status(r.z, t) }));
  const byD = (p, q) => p.d - q.d;
  let ok = rows.filter(r => r.s.a === 'ok').sort(byD);
  let rest = rows.filter(r => r.s.a !== 'ok').sort(byD);
  let list = [...ok, ...rest].slice(0, LIST_MAX);
  if (extra && !list.some(r => r.z.id === extra.id)) {
    const r = { z: extra, d: nearest(extra, o), s: status(extra, t) };
    list.push(r);
    ok = list.filter(x => x.s.a === 'ok').sort(byD);
    rest = list.filter(x => x.s.a !== 'ok').sort(byD);
    list = [...ok, ...rest];
  }
  return list;
}

// カードの3行目：利用時間と除外を1行で。「日曜・休日を除く」「１月１日〜３日を除く」→「日曜・休日、1/1–3 を除く」
function hoursLine(z) {
  if (z.days === 'unknown' || !z.span) return '';
  const md = t => t.replace(/(\d{1,2})月(\d{1,2})日/g, '$1/$2');
  const ex = z.rules.map(r => md(r.replace(/(を除く|は休止)$/, '')).replace(/(\d+)日/g, '$1').replace(/[〜～]/g, '–').replace(/^(\d+)\/(\d+)–\1\/(\d+)$/, '$1/$2–$3')).filter(Boolean);
  return ex.length ? `${z.hours} · ${ex.join('、')} を除く` : `毎日 ${z.hours}`;
}

function cardHtml(r, i, n) {
  const { z, d, s } = r;
  const sub = [kindShort(z), distText(d), fmtLimit(z) && `最大${fmtLimit(z)}`, fmtFee(z)].filter(Boolean).join(' · ');
  const hl = hoursLine(z);
  return `
    <article class="card ${s.a}${z.id === state.sel ? ' sel' : ''}" data-id="${esc(z.id)}" tabindex="0" aria-label="${esc(`${zoneName(z)}、${s.text}`)}">
      <div class="chead"><i class="cp" aria-hidden="true">P</i><span class="cname">${esc(zoneName(z))}</span>${badge(s)}</div>
      <div class="csub"><span>${esc(sub)}</span><span class="cnum">${i + 1}/${n}</span></div>
      ${hl ? `<div class="chours">${esc(hl)}</div>` : ''}
      <div class="cbtns">
        <button class="btn inkbtn" type="button" data-act="go">${I.go}ここへ行く</button>
        <button class="btn sub" type="button" data-act="detail">詳細</button>
      </div>
    </article>`;
}

function renderCards(extra) {
  if (!zones.length || state.detail) return;
  const list = computeRows(extra);
  state.rows = list;
  const tag = $('#destTag');
  tag.hidden = !state.dest;
  if (state.dest) tag.innerHTML = `${esc(state.dest.name)}の近く <b>${list.length}か所</b>（近い順）`;

  if (!list.length) {
    // 1km以内に区間がない：いちばん近い区間を案内する
    const o = origin();
    const near = zones.reduce((b, z) => { const d = meters(o, z.center); return !b || d < b.d ? { z, d } : b; }, null);
    state.sel = null;
    $('#track').innerHTML = `
      <article class="card none">
        <p>この近く（1km以内）には区間がありません${near ? `。いちばん近い区間まで ${esc(fmtDist(near.d))}` : ''}</p>
        ${near ? `<div class="cbtns"><button class="btn dark" type="button" data-act="nearest" data-id="${esc(near.z.id)}">いちばん近い区間へ</button><span></span></div>` : ''}
      </article>`;
    draw();
    return;
  }
  if (!list.some(r => r.z.id === state.sel)) state.sel = list[0].z.id;
  $('#track').innerHTML = list.map((r, i) => cardHtml(r, i, list.length)).join('');
  scrollToCard(state.sel, false);
  draw();
}

const cardEl = id => [...document.querySelectorAll('#track .card')].find(c => c.dataset.id === id);
function scrollToCard(id, smooth) {
  const c = cardEl(id);
  if (!c) return;
  const tr = $('#track');
  const behavior = smooth ? 'smooth' : 'instant';
  autoScroll = smooth ? id : null;
  if (narrow()) tr.scrollTo({ left: c.offsetLeft - 16, behavior });
  else if (c.offsetTop < tr.scrollTop || c.offsetTop + c.offsetHeight > tr.scrollTop + tr.clientHeight) tr.scrollTo({ top: c.offsetTop - 16, behavior });
}

// 区間を選ぶ。pan：見えていなければ地図を少し動かす。scroll：カードの列をその区間まで動かす
function select(id, { pan = false, scroll = false } = {}) {
  const changed = id !== state.sel;
  state.sel = id;
  document.querySelectorAll('#track .card').forEach(c => c.classList.toggle('sel', c.dataset.id === id));
  if (changed) draw();
  if (scroll) scrollToCard(id, true);
  if (pan) panToZone(byId.get(id));
}
// center：見えている範囲のまん中へ動かす（地図で押したとき）。
// そうでなければ、端に近いときだけ少し動かす（カードをめくったとき）
function panToZone(z, center = false) {
  if (!z) return;
  const r = region();
  const p = map.latLngToContainerPoint(z.center);
  if (center) {
    if (Math.hypot(p.x - (r.l + r.r) / 2, p.y - (r.t + r.b) / 2) < 4) return;
  } else {
    const mx = (r.r - r.l) * .2, my = (r.b - r.t) * .2;
    if (p.x > r.l + mx && p.x < r.r - mx && p.y > r.t + my && p.y < r.b - my) return;
  }
  quiet = true;
  map.panTo(map.unproject(map.project(z.center).add(offset())), { animate: true, duration: .35 });
}

// 地図の線やPを押したとき
function pickOnMap(z) {
  if (state.detail) { openDetail(z); return; }
  if (!state.rows.some(r => r.z.id === z.id)) renderCards(z);
  select(z.id, { scroll: true });
  panToZone(z, true);
}

// カードの列を横にめくったら、いちばん左に来たカードを選ぶ
let scrollTimer;
let autoScroll = null; // プログラムでカードの列を動かしている先の区間（途中のカードを選ばないため）
function onTrackScroll() {
  if (!narrow()) return;
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    const tr = $('#track');
    let best = null, bd = Infinity;
    tr.querySelectorAll('.card[data-id]').forEach(c => {
      const d = Math.abs(c.offsetLeft - 16 - tr.scrollLeft);
      if (d < bd) { bd = d; best = c; }
    });
    if (autoScroll) {
      // 自動で動かしている途中なら、目的のカードに着くまで選び直さない
      if (best && best.dataset.id === autoScroll) autoScroll = null;
      return;
    }
    if (best && best.dataset.id !== state.sel) select(best.dataset.id, { pan: true });
  }, 140);
}

function onCardClick(e) {
  const b = e.target.closest('[data-act]');
  const card = e.target.closest('.card');
  if (b) {
    const z = byId.get(b.dataset.id || card?.dataset.id);
    const act = b.dataset.act;
    if (act === 'go') startGo(z);
    else if (act === 'detail') openDetail(z);
    else if (act === 'nearest' && z) { state.moved = true; centerOn(z.center, 16); }
    return;
  }
  if (card?.dataset.id) select(card.dataset.id, { pan: true, scroll: true });
}

/* ---------- 区間の詳細 ---------- */
async function address(z) {
  if (z.addr) return z.addr;
  if (addrCache.has(z.id)) return addrCache.get(z.id);
  const [lat, lng] = z.center;
  const r = (await (await fetch(`${GSI_REVERSE}?lat=${lat}&lon=${lng}`)).json()).results;
  const text = r ? `${MUNI[+r.muniCd] || ''}${r.lv01Nm && r.lv01Nm !== '－' ? r.lv01Nm : ''}` : '';
  addrCache.set(z.id, text);
  return text;
}

// 利用できる時間。曜日ごとの時間が全部同じなら「毎日」の1行、違うときだけ曜日別。
// その下に除外（「日曜・休日を除く」「1月1日〜3日を除く」など）を1行ずつ
function hours(z, t) {
  if (!z.span) return '';
  const r = z.rules.join(' ');
  const dow = t.getDay();
  const hol = !!holidays.dates[Zones.ymd(t)];
  const wk = z.hours;
  const sat = /土/.test(r) ? '' : z.hours;
  const sun = /日曜|休日/.test(r) ? '' : z.hours;
  const isSun = hol || dow === 0, isSat = !isSun && dow === 6;
  let rows;
  if (wk === sat && sat === sun) rows = [['毎日', wk, true]];
  else if (wk === sat) rows = [['月〜土', wk, !isSun], ['日・祝', sun, isSun]];
  else rows = [['月〜金', wk, !isSun && !isSat], ['土', sat, isSat], ['日・祝', sun, isSun]];
  const ex = z.rules.filter(Boolean);
  if (z.months && !ex.some(x => /休止/.test(x))) ex.push(`${z.months[1] % 12 + 1}月〜${(z.months[0] + 10) % 12 + 1}月は利用不可`);
  return `<div class="hours"><h3>利用できる時間</h3>${rows.map(([k, v, on]) =>
    `<div class="${on && v ? 'on' : ''}"><span>${k}</span>${v ? `<b>${esc(v)}</b>` : '<span class="x">利用不可</span>'}</div>`).join('')}${ex.map(x =>
    `<p class="hex">${esc(x)}</p>`).join('')}</div>`;
}

function stateBlock(z, t) {
  const s = status(z, t);
  if (s.a === 'unk') return `<p class="state"><b>時間は現地で確認</b><span>県警の公開情報に時間・曜日がありません</span></p>`;
  if (s.a === 'ok') return `<p class="state ok"><b>${esc(s.text)}</b>${fmtLimit(z) ? `<span>1回 最大${esc(fmtLimit(z))}</span>` : ''}</p>`;
  return `<p class="state no"><b>${esc(s.text)}</b></p>`;
}

function sourceLabel(z) {
  if (z.days === 'unknown' || !z.span) return ['時間は現地で確認', z.pref === '神奈川県' ? '神奈川県警察' : z.source || '県警の公開情報'];
  if (z.pref === '東京都') return ['公式データ', '警視庁 オープンデータ（2026年4月）'];
  if (z.pref === '大阪府') return ['おおよその位置', '大阪府警察の資料から作成'];
  if (z.pref === '北海道') return ['公式データ', '北海道警察の公開情報'];
  if (z.pref === '京都府') return ['公式データ', '京都府警察の公開情報'];
  return ['公式データ', z.source || '各警察の公開情報'];
}

function renderDetail(z) {
  const t = when();
  const [lat, lng] = z.center;
  const r = state.rows.find(x => x.z.id === z.id);
  const d = r ? r.d : nearest(z, origin());
  const row = (k, v) => (v ? `<dt>${k}</dt><dd>${esc(v)}</dd>` : '');
  const [srcTag, srcText] = sourceLabel(z);
  const more = [
    row('車種', vehicles(z)),
    row('路線', z.route),
    row('区間', z.section),
    row('枠数', z.spaces != null ? `${z.spaces}台` + (z.truckSpaces ? `（うち貨物車 ${z.truckSpaces}台）` : '') : ''),
    z.permitOnly ? row('枠', '標章車（障害者等用）専用の枠があります') : '',
    z.pref === '東京都' ? row('区間番号', z.id) : '',
  ].join('');
  $('#dsheet').innerHTML = `
    <div class="dhead">
      <button class="dclose" type="button" data-close aria-label="閉じる">${svg('<path d="M6 6l12 12M18 6L6 18"/>')}</button>
      <p class="dkick">${esc(kicker(z))}</p>
      <div class="dtitle"><h2 id="dtitle">${esc(zoneName(z))}</h2><span>${esc(distText(d))}</span></div>
    </div>
    ${stateBlock(z, t)}
    <div class="dfacts">
      <div>${I.clock}<b>${esc(z.span ? z.hours : '現地で確認')}</b><span>利用時間</span></div>
      <div>${I.timer}<b>${esc(fmtLimit(z) || '—')}</b><span>最大</span></div>
      <div>${I.yen}<b>${esc(fmtFee(z) || '—')}</b><span>料金</span></div>
    </div>
    ${hours(z, t)}
    <p class="note">${I.info}<span>時間外は、ほとんどの区間で駐車禁止です。現地の標識・メーターの表示が優先されます。</span></p>
    ${more ? `<div class="dmore"><h3>区間の情報</h3><dl>${more}</dl></div>` : ''}
    <p class="src"><span class="badge off">${esc(srcTag)}</span><span>${esc(srcText)}</span></p>
    <div class="dacts"><h3>地図アプリで経路を見る</h3>${navRows(z, true)}</div>`;
  if (!z.addr && !addrCache.has(z.id)) {
    address(z).then(a => { if (state.detail && state.sel === z.id && a) $('#dtitle').textContent = a; }).catch(() => {});
  }
}

function openDetail(z) {
  if (!z) return;
  showPanel('');
  // 端末の「戻る」（Android の戻るボタン・iPhone のスワイプ）でも閉じられるよう、履歴を1つ積む
  if (!state.detail) { try { history.pushState({ pmm: 'detail' }, ''); } catch (e) {} }
  state.detail = true;
  state.sel = z.id;
  document.body.classList.add('in-detail');
  $('#detail').hidden = false;
  renderDetail(z);
  $('#dsheet').scrollTop = 0;
  draw();
  map.flyToBounds(z.bounds, { maxZoom: 17, duration: .45, ...pad() });
  $('#dback').focus({ preventScroll: true });
}

// 詳細を閉じる。積んだ履歴が残っていれば「戻る」で閉じる（popstate から closeDetail が呼ばれる）
function leaveDetail() {
  if (history.state && history.state.pmm === 'detail') history.back();
  else closeDetail();
}
function closeDetail() {
  if (!state.detail) return;
  state.detail = false;
  $('#detail').hidden = true;
  document.body.classList.remove('in-detail');
  const id = state.sel;
  if (state.dest) renderCards(); else renderCards(byId.get(id));
  select(id, { scroll: false });
  scrollToCard(id, false);
}

/* ---------- 「ここへ行く」 ---------- */
const isApple = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const navUrl = (kind, z) => {
  const [lat, lng] = z.center;
  return kind === 'apple'
    ? `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
};
// 地図アプリの2行（Apple・Google を同じ大きさで）。「ここへ行く」のシートと詳細で共通。
// link：詳細ではそのまま開くリンクにする（シートではボタンにして、選んだ地図を覚える）
const NAVS = () => (isApple() ? [['apple', 'Apple マップ'], ['google', 'Google マップ']] : [['google', 'Google マップ'], ['apple', 'Apple マップ']]);
const navRows = (z, link) => `<div class="navs">${NAVS().map(([k, label]) => {
  const inner = `${I.map}<span>${label}</span><span class="chev">${I.chev}</span>`;
  return link
    ? `<a class="nav" href="${navUrl(k, z)}" target="_blank" rel="noopener">${inner}</a>`
    : `<button class="nav" type="button" data-nav="${k}">${inner}</button>`;
}).join('')}</div>`;
const openNav = (kind, z) => window.open(navUrl(kind, z), '_blank', 'noopener');

function startGo(z) {
  if (!z) return;
  const saved = load('pmm-nav', null);
  if (saved === 'apple' || saved === 'google') { openNav(saved, z); return; }
  // 所要時間の目安：直線距離×1.4 を時速20kmで
  const from = state.here || origin();
  const min = Math.max(1, Math.ceil(meters(from, z.center) * 1.4 / (CAR_KMH * 1000 / 60)));
  const t = when();
  const arrive = new Date(t.getTime() + min * 60000);
  const s = status(z, t);
  const b = s.a === 'ok' && !Zones.openNow(z, arrive, holidays.dates) ? { a: 'no', text: '着くころには時間外' } : s;
  $('#goSheet').innerHTML = `
    <h2 id="goTitle">${esc(zoneName(z))}へ案内します</h2>
    <div class="goeta"><span>車で約${min}分 · ${esc(hmOf(arrive))}ごろ着</span>${badge(b)}</div>
    <h3>どの地図で案内しますか</h3>
    ${navRows(z, false)}
    <label class="check"><input type="checkbox" id="navRemember" checked>次からはこの地図ですぐ開く</label>
    <button class="cancel" type="button" id="goCancel">やめる</button>`;
  $('#goScrim').hidden = false;
  $('#goSheet').querySelector('.nav').focus();
  $('#goSheet').onclick = e => {
    const n = e.target.closest('[data-nav]');
    if (n) {
      if ($('#navRemember').checked) save('pmm-nav', n.dataset.nav);
      closeGo();
      openNav(n.dataset.nav, z);
    } else if (e.target.closest('#goCancel')) closeGo();
  };
}
function closeGo() { $('#goScrim').hidden = true; }

/* ---------- タイマー ---------- */
let timer = load('pmm-timer', null); // { zoneId, startedAt, limitMin, carLatLng, notified }
let timerZone = null; // 止まっているときに出す区間

const timerZoneOf = () => {
  if (timer) return byId.get(timer.zoneId);
  if (state.sel && byId.get(state.sel)) return byId.get(state.sel);
  const o = state.here || origin();
  return zones.reduce((b, z) => (!b || meters(o, z.center) < meters(o, b.center) ? z : b), null);
};

function openTimer() {
  showPanel('');
  timerZone = timerZoneOf();
  renderTimer();
  $('#timer').hidden = false;
  $('#tclose').focus();
}
function closeTimer() { $('#timer').hidden = true; }

function renderTimer() {
  const z = timer ? byId.get(timer.zoneId) : timerZone;
  const running = !!timer;
  const notify = load('pmm-notify', false);
  $('#timer').innerHTML = `
    <div class="tin">
      <button class="round tclose" id="tclose" type="button" aria-label="閉じる">${I.down}</button>
      <div class="thead">
        <span class="badge ${running ? 'ok' : 'off'}">${running ? '駐車中' : 'タイマー'}</span>
        <h2>${esc(z ? zoneName(z) : '区間を選んでください')}</h2>
        ${z ? `<p>${esc(kicker(z))}</p>` : ''}
      </div>
      <div class="ring" id="ring">
        <svg viewBox="0 0 260 260" aria-hidden="true"><circle class="bg" cx="130" cy="130" r="122"/><circle class="fg" id="ringFg" cx="130" cy="130" r="122"/></svg>
        <div class="rtext" id="rtext" aria-live="polite"></div>
      </div>
      <div class="tfacts">
        <div><span>停めた時刻</span><b>${running ? esc(hmOf(new Date(timer.startedAt))) : '—'}</b></div>
        <div><span>最大 · 料金</span><b>${z ? esc(`${fmtLimit(z) || '—'} · ${fmtFee(z) || '—'}`) : '—'}</b></div>
      </div>
      <div class="tnotify">
        <label class="switch"><span>終わる10分前に知らせる</span><input type="checkbox" id="tnotify" role="switch"${notify ? ' checked' : ''}></label>
        <small>ホーム画面に追加すると、画面を閉じていても届きます</small>
      </div>
      <div class="tbtns">
        <button class="btn go" type="button" id="tstart"${running || !z ? ' disabled' : ''}>${I.play}スタート</button>
        <button class="btn dark" type="button" id="tstop"${running ? '' : ' disabled'}>${I.stop}ストップ</button>
      </div>
      <button class="btn sub big" type="button" id="tcar"${running ? '' : ' disabled'}>${I.pin}車の場所を確認</button>
      <p class="tfoot">メーター・チケットに表示された時刻が優先です</p>
    </div>`;
  updateTimer();
}

// 円と残り時間だけを書き換える（1秒ごと）
function updateTimer() {
  const fg = $('#ringFg');
  if (!fg) return;
  const C = 2 * Math.PI * 122;
  const z = timer ? byId.get(timer.zoneId) : timerZone;
  let frac = 1, html;
  const over = !!timer && Date.now() >= timer.startedAt + timer.limitMin * 60000;
  if (!timer) {
    html = `<small>最大</small><b>${esc(z ? fmtMin(z.limitMin || 60) : '—')}</b>`;
  } else if (over) {
    frac = 0;
    html = '<b>時間です</b>';
  } else {
    const end = timer.startedAt + timer.limitMin * 60000;
    const left = end - Date.now();
    frac = left / (timer.limitMin * 60000);
    const m = fmtMin(Math.ceil(left / 60000));
    html = `<small>あと</small><b class="${m.length > 3 ? 'long' : ''}">${esc(m)}</b><span>${esc(hmOf(new Date(end)))} まで</span>`;
  }
  fg.setAttribute('stroke-dasharray', C);
  fg.setAttribute('stroke-dashoffset', C * (1 - Math.max(0, Math.min(1, frac))));
  $('#ring').classList.toggle('over', over);
  if ($('#rtext').innerHTML !== html) $('#rtext').innerHTML = html;
}

function startTimer() {
  const z = timerZone;
  if (!z) return;
  timer = { zoneId: z.id, startedAt: Date.now(), limitMin: z.limitMin || 60, carLatLng: state.here || z.center, notified: false };
  save('pmm-timer', timer);
  if (load('pmm-notify', false)) askNotify();
  renderTimer();
  showTimerState();
}
function stopTimer() {
  timerZone = timer ? byId.get(timer.zoneId) : timerZone;
  timer = null;
  save('pmm-timer', null);
  renderTimer();
  showTimerState();
}
function checkCar() {
  if (!timer) return;
  closeTimer();
  if (state.detail) leaveDetail();
  state.moved = true;
  showTimerState();
  centerOn(timer.carLatLng, Math.max(map.getZoom(), 18), true);
}
// タイマーが動いているあいだは、ボタンに印を付け、車の場所に印を出す
function showTimerState() {
  $('#timerBtn').classList.toggle('on', !!timer);
  if (carMark) { map.removeLayer(carMark); carMark = null; }
  if (timer) {
    carMark = L.marker(timer.carLatLng, {
      icon: L.divIcon({ className: 'pm', html: `<div class="carm">${I.car}</div>`, iconSize: [0, 0] }),
      zIndexOffset: 5500, keyboard: false, interactive: false,
    }).addTo(map);
  }
}
function askNotify() {
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch?.(() => {});
}
// 終わる10分前に1回だけ知らせる（許可がないときは画面の表示だけ）
function tickTimer() {
  if (!$('#timer').hidden) updateTimer();
  if (!timer || timer.notified || !load('pmm-notify', false)) return;
  const left = timer.startedAt + timer.limitMin * 60000 - Date.now();
  if (left > 10 * 60000 || left <= 0) return;
  timer.notified = true;
  save('pmm-timer', timer);
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const z = byId.get(timer.zoneId);
  try {
    new Notification('パーキング・メーター・マップ', { body: `${z ? zoneName(z) : ''}：あと${Math.ceil(left / 60000)}分で時間です（${hmOf(new Date(timer.startedAt + timer.limitMin * 60000))}まで）`, icon: 'icon.svg' });
  } catch (e) { /* 通知を出せない端末では画面の表示だけ */ }
}

/* ---------- 見直し ---------- */
function refresh() {
  draw();
  if (state.detail) { const z = byId.get(state.sel); if (z) renderDetail(z); } else renderCards();
}

/* ---------- 行き先 ---------- */
const AREA_RE = /^(東京都|大阪府|京都府|北海道|神奈川県)/;
// 行き先の短い名前：都道府県と区市町村を省く（「東京都中央区銀座四丁目」→「銀座四丁目」）
const shortName = title => {
  const t = title.replace(/^(北海道|東京都|(?:大阪|京都)府|.{2,3}県)/, '') || title;
  return t.replace(/^(.{1,6}?市.{1,4}?区|.{1,5}?[区市])(?=.)/, '') || t;
};

const recent = () => load('pmm-recent', []);
function remember(h) {
  save('pmm-recent', [h, ...recent().filter(x => x.title !== h.title)].slice(0, 5));
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
    `<button type="button" class="qrow" data-recent="${i}">${I.clock}<span class="qt"><b>${esc(h.title)}</b></span></button>`).join('');
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
    if (hits.length === 1) { setDest(hits[0]); return; }
    showPanel(hits.map((h, i) => {
      const [, pref, rest] = h.title.match(/^(北海道|東京都|(?:大阪|京都)府|.{2,3}県)?(.*)$/);
      return `<button type="button" class="qrow" data-hit="${i}">${I.pin}<span class="qt"><b>${esc(rest || h.title)}</b>${pref ? `<span>${esc(pref)}</span>` : ''}</span><span class="qn">${nearCount([h.lat, h.lng])}区間</span></button>`;
    }).join(''));
  } catch (e) {
    showPanel('<p class="qmsg">地名検索につながりませんでした</p>');
  }
}

// 行き先モード：行き先の印、半径400mの円、距離は行き先から測る
function setDest(h) {
  remember(h);
  showPanel('');
  if (!state.dest) state.prevView = { c: map.getCenter(), z: map.getZoom() };
  state.dest = { name: shortName(h.title), title: h.title, lat: h.lat, lng: h.lng };
  state.sel = null;
  state.moved = true;
  $('#q').value = state.dest.name;
  $('#q').blur();
  destUi();
  drawDest();
  centerOn([h.lat, h.lng], 16);
  renderCards();
}
function clearDest(back) {
  const prev = state.prevView;
  state.dest = null;
  state.prevView = null;
  state.sel = null;
  $('#q').value = '';
  destUi();
  drawDest();
  if (back && prev) map.setView(prev.c, prev.z, { animate: false });
  renderCards();
}
function destUi() {
  const on = !!state.dest;
  $('#qform').classList.toggle('dest', on);
  $('#qback').hidden = !on;
  $('#qicon').style.display = on ? 'none' : '';
  $('#qclear').hidden = !on;
}
function drawDest() {
  marks.clearLayers();
  const d = state.dest;
  if (!d) return;
  const ink = colors().ink;
  L.circle([d.lat, d.lng], { radius: DEST_R, color: ink, weight: 2, opacity: .7, dashArray: '6 8', fill: true, fillColor: ink, fillOpacity: .04, interactive: false }).addTo(marks);
  // 円の上に「徒歩5分」
  L.marker([d.lat + DEST_R / 111320, d.lng], {
    icon: L.divIcon({ className: 'pm', html: `<span class="rtag">徒歩${walkMin(DEST_R)}分</span>`, iconSize: [0, 0] }),
    interactive: false, keyboard: false, zIndexOffset: 5800,
  }).addTo(marks);
  L.marker([d.lat, d.lng], {
    icon: L.divIcon({ className: 'pm', html: `<div class="destm"><i>${I.flag}</i><span>${esc(d.name)}</span></div>`, iconSize: [0, 0] }),
    interactive: false, keyboard: false, zIndexOffset: 6000,
  }).addTo(marks);
}

function fitPref(pref) {
  showPanel('');
  state.moved = true;
  if (state.dest) clearDest(false);
  const pts = zones.filter(z => z.pref === pref).flatMap(z => z.lines.flat());
  if (pts.length) map.fitBounds(L.latLngBounds(pts), { animate: false, ...pad() });
}

/* ---------- 現在地 ---------- */
function showHere(p) {
  state.here = [p.coords.latitude, p.coords.longitude];
  if (hereMark) hereMark.setLatLng(state.here);
  else {
    hereMark = L.marker(state.here, {
      icon: L.divIcon({ className: 'pm', html: '<div class="here"></div>', iconSize: [0, 0] }),
      zIndexOffset: 5000, keyboard: false, interactive: false,
    }).addTo(map);
  }
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
  $('#q').addEventListener('focus', () => { $('#q').select(); if (!$('#q').value.trim() || state.dest) idlePanel(); });
  $('#q').addEventListener('input', () => { if (!$('#q').value.trim()) idlePanel(); else showPanel(''); });
  $('#qback').addEventListener('click', () => clearDest(true));
  $('#qclear').addEventListener('click', () => clearDest(false));
  $('#qpanel').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.hit) setDest(hits[+b.dataset.hit]);
    else if (b.dataset.recent) setDest(recent()[+b.dataset.recent]);
    else if (b.dataset.pref) fitPref(b.dataset.pref);
  });
  document.addEventListener('click', e => {
    if (e.target.closest('.top')) return;
    if (!$('#qpanel').hidden) showPanel('');
  });

  $('#track').addEventListener('click', onCardClick);
  $('#track').addEventListener('scroll', onTrackScroll, { passive: true });
  // 人がカードの列に触れたら、自動で動かしている途中でもその操作を優先する
  ['touchstart', 'wheel', 'pointerdown'].forEach(ev => $('#track').addEventListener(ev, () => { autoScroll = null; }, { passive: true }));
  $('#track').addEventListener('keydown', e => {
    const c = e.target.closest('.card[data-id]');
    if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(c.dataset.id, { pan: true }); }
  });
  $('#dback').addEventListener('click', leaveDetail);
  $('#dsheet').addEventListener('click', e => { if (e.target.closest('[data-close]')) leaveDetail(); });
  window.addEventListener('popstate', () => { if (state.detail) closeDetail(); });
  $('#goScrim').addEventListener('click', e => { if (e.target === $('#goScrim')) closeGo(); });

  $('#timerBtn').addEventListener('click', openTimer);
  $('#timer').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'tclose') closeTimer();
    else if (b.id === 'tstart') startTimer();
    else if (b.id === 'tstop') stopTimer();
    else if (b.id === 'tcar') checkCar();
  });
  $('#timer').addEventListener('change', e => {
    if (e.target.id !== 'tnotify') return;
    save('pmm-notify', e.target.checked);
    if (e.target.checked) askNotify();
  });

  $('#baseBtn').addEventListener('click', toggleBase);
  $('#locate').addEventListener('click', () => {
    if (!navigator.geolocation) return alert('この端末では現在地を使えません');
    if (state.dest) clearDest(false);
    if (state.here) centerOn(state.here, Math.max(map.getZoom(), 16));
    navigator.geolocation.getCurrentPosition(p => { showHere(p); centerOn(state.here, Math.max(map.getZoom(), 16)); },
      () => alert('現在地を取得できませんでした。位置情報の許可を確かめてください'), { enableHighAccuracy: true, timeout: 15000 });
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('#goScrim').hidden) closeGo();
    else if (!$('#timer').hidden) closeTimer();
    else if (!$('#qpanel').hidden) showPanel('');
    else if (state.detail) leaveDetail();
  });

  // カードの高さに合わせて、右下のボタンの位置を決める
  if (window.ResizeObserver) {
    new ResizeObserver(() => document.documentElement.style.setProperty('--cards-h', `${$('#cards').offsetHeight}px`)).observe($('#cards'));
  }
  // 「いま」は時間が進むと変わるので、1分ごとに見直す
  setInterval(() => { if (!state.at) refresh(); }, 60000);
  setInterval(tickTimer, 1000);
}

async function boot() {
  initMap();
  bind();
  try {
    zones = Zones.normalize(await (await fetch('data/zones.geojson', { cache: 'no-cache' })).json());
  } catch (e) {
    $('#empty').hidden = false;
    return;
  }
  zones.forEach(z => { z.bounds = L.latLngBounds(z.lines.flat()); });
  byId = new Map(zones.map(z => [z.id, z]));
  try {
    holidays = await (await fetch('data/holidays.json', { cache: 'no-cache' })).json();
  } catch (e) { /* 祝日一覧がなくても動く（祝日を判定しないだけ） */ }
  if (timer && !byId.get(timer.zoneId)) { timer = null; save('pmm-timer', null); }
  showTimerState();
  renderCards();
  watchHere();
}

boot();
