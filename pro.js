/* Pro・お気に入り・広告・「このアプリについて」（docs/pro-ads.md）
   設定は config.js の window.PMM_CONFIG。販売前（proEnabled: false）は、お気に入り・鍵・購入シート・広告を一切出さず、
   これまでどおりの画面（タイマーの通知も無料）のまま。app.js より先に読み込み、app.js の関数は呼ばれたときに使う。 */
(function () {
  const CFG = Object.assign({
    proEnabled: false,     // 販売を始めたら true（Stripe・Cloudflare の準備ができてから）
    adsEnabled: false,     // AdSense の審査が通ったら true
    proPublicKey: null,    // 購入証の署名を確かめる公開鍵（JWK）。scripts/pro-keys.mjs で作る
    apiBase: '/api',
    adsenseClient: '',     // ca-pub-…
    adsenseSlots: { detail: '', timer: '' },
    siteUrl: '',           // アプリ版で、特商法の表記・プライバシーポリシーを開くときの Web 版の URL（末尾は /）
    revenuecat: { ios: '', android: '' }, // アプリ版のアプリ内課金（docs/native-app.md）
  }, window.PMM_CONFIG || {});
  // アプリ版（native.js）では、Pro を App Store・Google Play のアプリ内課金で売る
  const STORE = window.Native ? window.Native.store : null;

  const PRICE = '480円';
  const SELLER = '合同会社Tessera Studio';
  const SELLER_SHORT = 'Tessera Studio';
  const SUPPORT = 'support@tesseras.jp';
  const FAV_MAX = 50, PLACE_MAX = 10;
  const K = { pro: 'pmm.pro', favZones: 'pmm.favZones', favPlaces: 'pmm.favPlaces' };

  // 販売前の確認用：?preview=free（無料の人の見え方）／?preview=pro（Pro の見え方）。販売を始めたら効かない
  let preview = null;
  try {
    const q = new URLSearchParams(location.search).get('preview');
    if (q === 'free' || q === 'pro' || q === 'off') sessionStorage.setItem('pmm.preview', q);
    preview = sessionStorage.getItem('pmm.preview');
    if (preview === 'off') preview = null;
  } catch (e) {}
  if (CFG.proEnabled) preview = null;

  const P = {
    cfg: CFG, PRICE, SELLER, SELLER_SHORT, SUPPORT,
    on: preview === 'pro',      // Pro か
    iat: null,                  // 購入証の発行日時（秒）
    shown: CFG.proEnabled || !!preview, // お気に入り・鍵・購入シートを出すか
    gated() { return this.shown && !this.on; },
    price: () => (STORE && STORE.price()) || PRICE,
  };

  /* ---------- 購入証（ライセンス）：base64url(JSON) + "." + base64url(ECDSA P-256 署名) ---------- */
  const b64u = {
    dec(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); },
  };
  async function checkLicense(lic) {
    try {
      if (!lic || !CFG.proPublicKey || !crypto.subtle) return null;
      const [p, s] = String(lic).split('.');
      if (!p || !s) return null;
      const key = await crypto.subtle.importKey('jwk', CFG.proPublicKey, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64u.dec(s), new TextEncoder().encode(p));
      if (!ok) return null;
      const body = JSON.parse(new TextDecoder().decode(b64u.dec(p)));
      return body && body.v === 1 && body.pid ? body : null;
    } catch (e) { return null; }
  }
  // 購入証を保存して確かめる。正しければ Pro にする
  async function adopt(lic) {
    const body = await checkLicense(lic);
    if (!body) return false;
    try { localStorage.setItem(K.pro, lic); } catch (e) {}
    P.on = true; P.iat = body.iat;
    afterChange();
    return true;
  }

  // 起動時：保存してある購入証を確かめる（壊れている・消えているときは黙って無料に戻す）。購入から戻ってきたときの処理も
  P.init = async function () {
    if (CFG.proEnabled && STORE) {
      // アプリ版：ストアの購入を確かめる（RevenueCat が前回の結果を持っているので、通信できなくても Pro のまま）
      if (!await STORE.init(CFG.revenuecat)) P.shown = false;
      else {
        try { const r = await STORE.status(); P.on = r.on; P.iat = r.since && r.since / 1000; } catch (e) {}
      }
    } else if (CFG.proEnabled) {
      let lic = null;
      try { lic = localStorage.getItem(K.pro); } catch (e) {}
      const body = await checkLicense(lic);
      if (body) { P.on = true; P.iat = body.iat; }
      const q = new URLSearchParams(location.search);
      if (q.get('pro') === 'success' && q.get('sid')) {
        try {
          const r = await fetch(`${CFG.apiBase}/verify?sid=${encodeURIComponent(q.get('sid'))}`);
          const j = await r.json();
          if (r.ok && j.license && await adopt(j.license)) P.toast('Pro になりました。ありがとうございます');
          else if (j.error === 'limit') P.toast(`発行できる台数の上限に達しました。${SUPPORT} までお問い合わせください`, { ms: 6000 });
        } catch (e) { P.toast('購入の確認ができませんでした。「このアプリについて」の「購入の復元」からお試しください', { ms: 6000 }); }
        try { history.replaceState(history.state, '', location.pathname); } catch (e) {}
      }
    }
    afterChange();
  };

  // Pro になった・お気に入りが変わったときに画面を合わせる
  function afterChange() {
    document.body.classList.toggle('pro-shown', P.shown);
    document.body.classList.toggle('pro-on', P.on);
    const fb = document.getElementById('favBtn');
    if (fb) { fb.hidden = !P.shown; fb.classList.toggle('locked', P.gated()); }
    if (typeof renderCards === 'function' && zones.length) {
      if (state.detail) { const z = byId.get(state.sel); if (z) renderDetail(z); } else renderCards();
    }
    if (!$('#timer').hidden) renderTimer();
    if (!$('#favSheet').hidden) renderFav();
  }

  /* ---------- 小さな札（トースト） ---------- */
  let toastTimer;
  P.toast = function (msg, { undo, ms = 3000 } = {}) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button" id="toastUndo">元に戻す</button>' : ''}`;
    el.hidden = false;
    if (undo) $('#toastUndo').onclick = () => { undo(); el.hidden = true; };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, ms);
  };

  /* ---------- お気に入り（区間・行き先） ---------- */
  const favZones = () => { const ids = load(K.favZones, []); return Array.isArray(ids) ? ids.filter(id => byId.has(String(id))).map(String) : []; };
  const favPlaces = () => { const l = load(K.favPlaces, []); return Array.isArray(l) ? l.filter(p => p && p.name && isFinite(p.lat) && isFinite(p.lng)) : []; };
  const samePlace = (a, b) => a.name === b.name && Math.abs(a.lat - b.lat) < 1e-5 && Math.abs(a.lng - b.lng) < 1e-5;
  P.isFav = id => favZones().includes(String(id));
  P.isPlaceFav = d => !!d && favPlaces().some(p => samePlace(p, d));
  P.favPlaces = () => favPlaces();

  // pro.js は app.js より先に読み込むので、アイコンはここで直接書く
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>';
  const LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const lockBadge = () => (P.gated() ? `<i class="lock" aria-hidden="true">${LOCK}</i>` : '');
  // ☆ボタン（カード・詳細）。販売前は出さない
  P.starBtn = function (id, cls = '') {
    if (!P.shown) return '';
    const on = P.on && P.isFav(id);
    return `<button class="btn star${on ? ' on' : ''} ${cls}" type="button" data-act="fav" data-id="${esc(id)}" aria-label="お気に入り" aria-pressed="${on}">${STAR}${lockBadge()}</button>`;
  };
  P.placeStar = function () {
    if (!P.shown || !state.dest) return '';
    const on = P.on && P.isPlaceFav(state.dest);
    return `<button class="pstar${on ? ' on' : ''}" type="button" data-act="favplace" aria-label="行き先を保存" aria-pressed="${on}">${STAR}${lockBadge()}</button>`;
  };
  // ☆・★の見た目だけを合わせる（カードを作り直さない）
  function syncStars() {
    document.querySelectorAll('[data-act="fav"]').forEach(b => {
      const on = P.on && P.isFav(b.dataset.id);
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    });
    document.querySelectorAll('[data-act="favplace"]').forEach(b => {
      const on = P.on && P.isPlaceFav(state.dest);
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    });
  }

  P.toggleFav = function (id) {
    if (P.gated()) return P.openBuy();
    id = String(id);
    const list = favZones();
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1);
    else if (list.length >= FAV_MAX) return P.toast(`お気に入りは${FAV_MAX}件までです`);
    else list.push(id);
    save(K.favZones, list);
    syncStars();
    if (!$('#favSheet').hidden) renderFav();
  };
  P.togglePlace = function () {
    if (P.gated()) return P.openBuy();
    const d = state.dest;
    if (!d) return;
    const list = favPlaces();
    const i = list.findIndex(p => samePlace(p, d));
    if (i >= 0) list.splice(i, 1);
    else if (list.length >= PLACE_MAX) return P.toast(`保存できる行き先は${PLACE_MAX}件までです`);
    else list.push({ name: d.name, title: d.title, lat: d.lat, lng: d.lng });
    save(K.favPlaces, list);
    syncStars();
  };

  /* ---------- お気に入りの一覧（右上の★ボタン） ---------- */
  P.openFav = function () {
    if (P.gated()) return P.openBuy();
    showPanel('');
    renderFav();
    $('#favSheet').hidden = false;
    $('#favClose').focus({ preventScroll: true });
  };
  P.closeFav = () => { $('#favSheet').hidden = true; };

  function renderFav() {
    const from = state.here || visibleCenter();
    const fromWord = state.here ? '現在地から' : '地図の中心から';
    const t = when();
    const rows = favZones().map(id => byId.get(id)).map(z => ({ z, s: status(z, t), d: nearest(z, from) }));
    const byD = (a, b) => a.d - b.d;
    const sorted = [...rows.filter(r => r.s.a === 'ok').sort(byD), ...rows.filter(r => r.s.a !== 'ok').sort(byD)];
    const places = favPlaces();
    const zoneRow = ({ z, s, d }) => `
      <div class="frow ${s.a}">
        <button class="fgo" type="button" data-zone="${esc(z.id)}">
          <i class="cp" aria-hidden="true">P</i>
          <span class="ft"><span class="fn"><b>${esc(zoneName(z))}</b>${badge(s)}</span><small>${esc(kindShort(z))} · ${fromWord} ${esc(fmtDist(d))}</small></span>
        </button>
        <button class="funfav" type="button" data-unfav="${esc(z.id)}" aria-label="お気に入りから外す">${STAR}</button>
      </div>`;
    const placeRow = (p, i) => `
      <div class="frow place">
        <button class="fgo" type="button" data-place="${i}"><i class="fp" aria-hidden="true">${I.flag}</i><span class="ft"><span class="fn"><b>${esc(p.name)}</b></span></span></button>
        <button class="funfav" type="button" data-unplace="${i}" aria-label="保存した行き先から外す">${STAR}</button>
      </div>`;
    $('#favBody').innerHTML = !sorted.length && !places.length
      ? '<p class="fempty">カードの☆を押すと、ここに並びます</p>'
      : `${sorted.map(zoneRow).join('')}${places.length ? `<h3>保存した行き先</h3>${places.map(placeRow).join('')}` : ''}`;
  }

  // 一覧の区間を押したとき：その区間を選び、地図を寄せ、カードの列をその区間にする
  function goToZone(z) {
    P.closeFav();
    if (state.detail) closeDetail();
    state.moved = true;
    state.sel = z.id;
    centerOn(z.center, Math.max(map.getZoom(), 16));
    renderCards(z);
    select(z.id, { scroll: true });
  }

  function onFavClick(e) {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'favClose') return P.closeFav();
    if (b.dataset.zone) return goToZone(byId.get(b.dataset.zone));
    if (b.dataset.place) { const p = favPlaces()[+b.dataset.place]; P.closeFav(); if (p) setDest({ title: p.title || p.name, lat: p.lat, lng: p.lng }); return; }
    if (b.dataset.unfav) {
      const before = favZones();
      save(K.favZones, before.filter(id => id !== b.dataset.unfav));
      renderFav(); syncStars();
      P.toast('お気に入りから外しました', { undo: () => { save(K.favZones, before); renderFav(); syncStars(); } });
      return;
    }
    if (b.dataset.unplace) {
      const before = favPlaces();
      save(K.favPlaces, before.filter((_, i) => i !== +b.dataset.unplace));
      renderFav(); syncStars();
      P.toast('保存した行き先から外しました', { undo: () => { save(K.favPlaces, before); renderFav(); syncStars(); } });
    }
  }

  /* ---------- 購入シート・復元 ---------- */
  // アプリ版は Web 版のページを開く（siteUrl がないときは出さない）
  const legalLinks = () => {
    const base = STORE ? CFG.siteUrl : '';
    if (STORE && !base) return '';
    return `<p class="blegal"><a href="${esc(base)}legal.html" target="_blank" rel="noopener">特定商取引法に基づく表記</a><a href="${esc(base)}privacy.html" target="_blank" rel="noopener">プライバシーポリシー</a></p>`;
  };
  // Pro でできること（広告を出していないときは「広告なし」を言わない）
  const FEATS = () => [CFG.adsEnabled && '広告が出なくなります', 'タイマーが終わる10分前に通知します', 'よく使う区間・行き先を保存できます'].filter(Boolean);
  const FEATS_SHORT = () => [CFG.adsEnabled && '広告なし', 'タイマーの通知', 'お気に入り'].filter(Boolean).join('・');
  function openSheet(html) {
    $('#buySheet').innerHTML = html;
    $('#buyScrim').hidden = false;
  }
  P.closeSheet = () => { $('#buyScrim').hidden = true; };

  P.openBuy = function () {
    if (!P.shown) return;
    if (P.on) return P.toast('Pro をご利用中です');
    openSheet(`
      <h2 id="buyTitle">パーキング・メーター・マップ Pro</h2>
      <p class="blead">1回のお支払いで、ずっと使えます</p>
      <ul class="bfeat">${FEATS().map(f => `<li>${I.check}${f}</li>`).join('')}</ul>
      <button class="btn go big" type="button" data-buy>${esc(P.price())}で購入する</button>
      <button class="blink" type="button" data-restore>購入済みの方はこちら（復元）</button>
      <button class="cancel" type="button" data-cancel>やめる</button>
      <p class="bnote">地図と時間の表示は、これまでどおり無料です。</p>
      ${legalLinks()}`);
    $('#buySheet [data-buy]').focus({ preventScroll: true });
  };

  P.openRestore = function () {
    if (STORE) return restoreStore();
    openSheet(`
      <h2 id="buyTitle">購入の復元</h2>
      <form class="rform" id="restoreForm">
        <label for="restoreEmail">購入のときに入力したメールアドレス</label>
        <input id="restoreEmail" type="email" inputmode="email" autocomplete="email" required>
        <button class="btn dark big" type="submit">復元する</button>
        <p class="rmsg" id="restoreMsg" aria-live="polite"></p>
      </form>
      <button class="cancel" type="button" data-cancel>閉じる</button>`);
    $('#restoreEmail').focus();
  };

  // アプリ版：ストアで買う・復元する
  const becomePro = (r, msg) => { P.on = true; P.iat = r.since && r.since / 1000; P.closeSheet(); afterChange(); P.toast(msg); };
  async function buyStore() {
    const btn = $('#buySheet [data-buy]');
    if (btn) btn.disabled = true;
    try {
      const r = await STORE.buy();
      if (r && r.on) becomePro(r, 'Pro になりました。ありがとうございます');
    } catch (e) { P.toast('購入できませんでした。通信状態を確かめて、もう一度お試しください', { ms: 5000 }); }
    if (btn) btn.disabled = false;
  }
  async function restoreStore() {
    P.toast('購入を確認しています…', { ms: 10000 });
    const who = window.Native.platform === 'ios' ? 'この Apple アカウント' : 'この Google アカウント';
    try {
      const r = await STORE.restore();
      if (r.on) becomePro(r, 'Pro を復元しました');
      else P.toast(`${who}での購入が見つかりませんでした`, { ms: 5000 });
    } catch (e) { P.toast('通信できませんでした。通信状態を確かめてください', { ms: 5000 }); }
  }

  async function checkout() {
    if (STORE) return buyStore();
    if (!CFG.proEnabled) return P.toast('（確認用の画面です）販売の開始前のため、購入できません');
    try {
      const r = await fetch(`${CFG.apiBase}/checkout`, { method: 'POST' });
      const j = await r.json();
      if (r.ok && j.url) location.href = j.url;
      else throw new Error();
    } catch (e) { P.toast('購入の画面を開けませんでした。通信状態を確かめてください'); }
  }

  async function restore(email) {
    const msg = $('#restoreMsg');
    if (!CFG.proEnabled) { msg.textContent = '（確認用の画面です）販売の開始前のため、復元できません'; return; }
    msg.textContent = '確認しています…';
    try {
      const r = await fetch(`${CFG.apiBase}/restore`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.license && await adopt(j.license)) { P.closeSheet(); P.toast('Pro を復元しました'); return; }
      msg.textContent = j.error === 'limit' ? `発行できる台数の上限に達しました。${SUPPORT} までお問い合わせください`
        : j.error === 'rate' ? 'しばらく待ってから、もう一度お試しください'
        : 'このメールアドレスでの購入が見つかりませんでした';
    } catch (e) { msg.textContent = '通信できませんでした。通信状態を確かめてください'; }
  }

  function onSheetClick(e) {
    if (e.target === $('#buyScrim')) return P.closeSheet();
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-cancel')) P.closeSheet();
    else if (b.hasAttribute('data-buy')) checkout();
    else if (b.hasAttribute('data-restore')) P.openRestore();
    else if (b.hasAttribute('data-gopro')) P.openBuy();
  }

  /* ---------- 「このアプリについて」 ---------- */
  // 区間データの出典（§22）。警察が作ったように見せず、「もとに作成」と書く
  P.SOURCES = [
    ['東京', '警視庁のオープンデータ（東京都オープンデータカタログ）をもとに Tessera Studio が作成。', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/deed.ja'],
    ['京都', '京都府警察ホームページの情報をもとに Tessera Studio が作成。', '元のページ', 'https://www.pref.kyoto.jp/fukei/site/chutai_c/tiket_meter/'],
    ['大阪', '大阪府警察の資料をもとに作成（おおよその位置）。', '', ''],
    ['神奈川', '神奈川県警察の情報をもとに作成。', '', ''],
    ['札幌', '北海道警察の情報をもとに作成。', '', ''],
  ];
  // よくある質問（「？」のメニュー）。文言のルール（design-v2.md §2）に従う
  P.FAQ = [
    ['線の色は何を表していますか？', '緑はいま使える区間、赤は時間外の区間、グレーの破線は時間が公開されていない区間です。黄色は選んでいる区間です。'],
    ['「21:00まで」「あす 9:00から」は何の時刻ですか？', '緑の区間は使える時間の終わり、赤の区間は次に使えるようになる時刻です。曜日・祝日・年末年始・冬期の休止も見ています。'],
    ['時間外の区間はどうなりますか？', '時間外は、ほとんどの区間で駐車禁止です。必ず現地の標識・メーターの表示を確かめてください。'],
    ['アプリの表示と現地の標識が違うときは？', '現地の標識・メーター・チケットの表示が優先です。工事や行事で使えない日もあります。'],
    ['最大時間を過ぎたらどうなりますか？', '制限時間を過ぎての駐車はできません。タイマーは残り10分で赤くなり、時間を過ぎると超えた時間をマイナスで表示します。'],
    ['タイマーの使い方は？', 'カードの時計のボタンを押し、「スタート」を押します。動いているあいだは、カードの時計のボタンに残り時間が出ます。「車の場所を確認」で、停めた場所に地図を戻せます。'],
    ['終わる前に通知を受け取るには？', 'タイマーの「終わる10分前に知らせる」をオンにし、通知を許可してください。ホーム画面に追加すると、画面を閉じていても届きます。'],
    ['パーキング・メーターとパーキング・チケットの違いは？', 'メーターは区間ごとの機械に、チケットは近くの発給機で買った券を車内に表示します。どちらも料金と時間は現地の表示に従ってください。'],
    ['グレーの破線の区間（神奈川など）は？', '県警の公開情報に利用時間・曜日が載っていない区間です。時間は現地の標識で確かめてください。'],
    ['どの地域に対応していますか？', '東京・大阪・神奈川・札幌・京都です。地図を動かすか、上の検索欄に地名・駅名を入れてください。'],
    ['現在地が出ないときは？', '端末の設定で、ブラウザ（またはホーム画面のアイコン）に位置情報の利用を許可してください。iPhone は「設定」→「Safari」→「位置情報」です。'],
    ['ホーム画面に追加するには？', 'iPhone は Safari の共有ボタンから「ホーム画面に追加」、Android は Chrome のメニューから「ホーム画面に追加」を選んでください。'],
  ];

  // アプリ版：ホーム画面への追加・ブラウザの話をアプリの話にする
  if (window.Native) {
    const APP_FAQ = {
      '終わる前に通知を受け取るには？': 'タイマーの「終わる10分前に知らせる」をオンにし、通知を許可してください。アプリを閉じていても、終わる10分前と時間になったときに届きます。',
      '現在地が出ないときは？': '端末の「設定」で、このアプリに位置情報の利用を許可してください。',
    };
    P.FAQ = P.FAQ.filter(([q]) => q !== 'ホーム画面に追加するには？').map(([q, a]) => [q, APP_FAQ[q] || a]);
  }

  // 右上の「？」のメニュー：よくある質問・このアプリについて（データと地図の出典・お問い合わせ）
  P.openAbout = function () {
    const proRow = !P.shown ? ''
      : P.on ? `<div class="arow"><b>Pro をご利用中です</b>${P.iat ? `<small>購入日 ${new Date(P.iat * 1000).toLocaleDateString('ja-JP')}</small>` : ''}</div>`
      : `<button class="arow btnrow" type="button" data-gopro><b>Pro にする（${esc(P.price())}）</b><small>${FEATS_SHORT()}</small></button>`;
    const credit = typeof mapCredit === 'function' ? mapCredit() : '';
    openSheet(`
      <h2 id="buyTitle">ヘルプ</h2>
      ${proRow}
      ${P.shown ? '<button class="arow btnrow" type="button" data-restore><b>購入の復元</b></button>' : ''}
      <h3>よくある質問</h3>
      <div class="faq">${P.FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      <h3>このアプリについて</h3>
      <ul class="asrc">${P.SOURCES.map(([k, t, l, u]) => `<li><b>${k}</b>${esc(t)}${u ? ` <a href="${u}" target="_blank" rel="noopener">${l}</a>` : ''}</li>`).join('')}
        <li><b>地図</b>${credit}。区間の線は OpenStreetMap から作成。表示に <a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>・<a href="https://maplibre.org" target="_blank" rel="noopener">MapLibre</a> を使っています。</li>
        <li><b>検索</b>地名の検索・住所は<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a>の仕組みを使っています。</li></ul>
      <p class="anote">現地の標識・メーターの表示が優先されます。</p>
      ${P.shown ? legalLinks() : ''}
      <p class="acontact">お問い合わせ：<a href="mailto:${SUPPORT}">${SUPPORT}</a><br>運営：${SELLER}</p>
      <button class="cancel" type="button" data-cancel>閉じる</button>`);
  };

  /* ---------- 広告（詳細の一番下・タイマーの一番下だけ） ---------- */
  let adsLoaded = false;
  P.adSlot = function (kind) {
    if (!CFG.adsEnabled || P.on || !CFG.adsenseClient) return '';
    return `<div class="adbox"><span class="adlabel">広告</span>
      <ins class="adsbygoogle" style="display:block;width:100%;height:100px" data-ad-client="${esc(CFG.adsenseClient)}" data-ad-slot="${esc(CFG.adsenseSlots[kind] || '')}"></ins></div>
      ${P.shown ? '<button class="adoff" type="button" data-gopro>広告を消す（Pro）</button>' : ''}`;
  };
  // 詳細かタイマーを初めて開いたときに広告のスクリプトを読み込む（Pro のときは読み込まない）
  P.fillAds = function (root) {
    if (!CFG.adsEnabled || P.on || !CFG.adsenseClient || !root) return;
    if (!adsLoaded) {
      adsLoaded = true;
      const s = document.createElement('script');
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(CFG.adsenseClient)}`;
      document.head.appendChild(s);
    }
    root.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])').forEach(() => {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  };

  /* ---------- 組み立て ---------- */
  P.bind = function () {
    $('#favBtn').addEventListener('click', P.openFav);
    $('#favSheet').addEventListener('click', onFavClick);
    $('#buyScrim').addEventListener('click', onSheetClick);
    $('#buyScrim').addEventListener('submit', e => { if (e.target.id === 'restoreForm') { e.preventDefault(); restore($('#restoreEmail').value.trim()); } });
    // 「広告を消す（Pro）」（詳細・タイマーの中）
    document.addEventListener('click', e => { if (e.target.closest('.adoff[data-gopro]')) P.openBuy(); });
    $('#destTag').addEventListener('click', e => { if (e.target.closest('[data-act="favplace"]')) P.togglePlace(); });
  };

  window.Pro = P;
})();
