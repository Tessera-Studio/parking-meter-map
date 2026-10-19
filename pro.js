/* 有料プラン・お気に入り・広告・「このアプリについて」（docs/pro-ads.md）
   設定は config.js の window.PMM_CONFIG。購入は App Store（StoreKit 2。@capgo/native-purchases）。
   買い切りの商品（storeProductId）を持っているかを、起動時とストアからの知らせのたびに端末の中で確かめる（サーバーは使わない）。
   proShown: true なら、お気に入りの★・タイマーを鍵付きで見せる。proEnabled: false のあいだは、購入ボタンは「準備中」の札だけ。
   app.js より先に読み込み、app.js の関数は呼ばれたときに使う。 */
(function () {
  const CFG = Object.assign({
    proEnabled: false,     // 販売を始めたら true（App Store Connect に商品を登録してから）
    proShown: false,       // 販売前でも、有料プランの機能を鍵付きで見せる（購入は「準備中」）
    storeProductId: 'jp.tesseras.parkingmetermap.pro', // App Store の商品 ID（買い切り・非消耗型）
    legalPublished: false, // 特商法の表記・プライバシーポリシーを公開したら true
    privacyUrl: '',        // プライバシーポリシーの URL（ヘルプに出す。App Store の審査で必要）
    supportUrl: '',        // サポートの URL
    adsEnabled: false,     // 広告（AdMob）を出すなら true
    admobBannerId: '',     // AdMob のバナーの広告ユニット ID（ca-app-pub-…/…）
    admobTesting: true,    // テスト広告を出す（本番の ID にしたら false）
  }, window.PMM_CONFIG || {});

  const PRICE = '500円';
  const SELLER = '合同会社Tessera Studio';
  const SELLER_SHORT = 'Tessera Studio';
  const SUPPORT = 'support@tesseras.jp';
  const FAV_MAX = 50, PLACE_MAX = 10;
  const K = { pro: 'pmm.pro.store', favZones: 'pmm.favZones', favPlaces: 'pmm.favPlaces' };

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
    on: preview === 'pro',      // 有料プランを持っているか
    iat: null,                  // 購入日時（秒）
    preview: !!preview,
    shown: CFG.proEnabled || CFG.proShown || !!preview, // お気に入り・鍵・購入シートを出すか
    gated() { return this.shown && !this.on; },
  };

  /* ---------- App Store の購入（StoreKit 2） ---------- */
  // アプリの中だけで使える。ブラウザで開いたときは null（購入ボタンは案内の札を出す）
  const cap = window.Capacitor;
  const store = cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins && cap.Plugins.NativePurchases || null;
  P.store = !!store;
  let busy = false;
  let checked = !store; // App Store で持っているかを1回確かめ終えたか（それまでは広告を出さない）

  // 持っているか：StoreKit の「いま有効な購入」（返金されたものは入らない。署名を確かめたものだけ）に商品があるか
  async function refreshOwned() {
    if (!store || P.preview) return;
    try {
      const { purchases } = await store.getPurchases({ productType: 'inapp', onlyCurrentEntitlements: true });
      const t = (purchases || []).find(x => x.productIdentifier === CFG.storeProductId);
      setOwned(t ? { at: Date.parse(t.purchaseDate) || Date.now() } : null);
    } catch (e) { /* 確かめられないときは、前回の結果のまま */ }
    if (!checked) { checked = true; if (P.syncAds) P.syncAds(); }
  }
  function setOwned(o) {
    const was = P.on;
    P.on = !!o;
    P.iat = o ? Math.floor(o.at / 1000) : null;
    try { o ? localStorage.setItem(K.pro, JSON.stringify(o)) : localStorage.removeItem(K.pro); } catch (e) {}
    if (was !== P.on) afterChange();
  }
  // 値段はストアの表示（端末の国・通貨）に合わせる。取れないときは 500円 のまま
  async function loadPrice() {
    if (!store) return;
    try {
      const { products } = await store.getProducts({ productIdentifiers: [CFG.storeProductId], productType: 'inapp' });
      if (products && products[0] && products[0].priceString) P.PRICE = products[0].priceString;
    } catch (e) {}
  }

  // 起動時：前回の結果ですぐ画面を出し、ストアで確かめ直す。ほかの端末での購入・返金・保護者の承認もここで受け取る
  P.init = async function () {
    if (store && !P.preview) {
      try { const o = JSON.parse(localStorage.getItem(K.pro) || 'null'); if (o) { P.on = true; P.iat = Math.floor(o.at / 1000); } } catch (e) {}
      afterChange();
      try { await store.addListener('transactionUpdated', () => refreshOwned()); } catch (e) {}
      await Promise.all([refreshOwned(), loadPrice()]);
      return;
    }
    afterChange();
  };

  // Pro になった・お気に入りが変わったときに画面を合わせる
  function afterChange() {
    document.body.classList.toggle('pro-shown', P.shown);
    document.body.classList.toggle('pro-on', P.on);
    const fb = document.getElementById('favBtn');
    if (fb) { fb.hidden = !P.shown; fb.classList.toggle('locked', P.gated()); }
    if (typeof updateTimerBtn === 'function') updateTimerBtn();
    if (typeof scheduleNotify === 'function') scheduleNotify(); // 有料プランでなくなったら通知の予約も消す
    if (typeof renderCards === 'function' && zones.length) {
      if (state.detail) { const z = byId.get(state.sel); if (z) renderDetail(z); } else renderCards();
    }
    if (!$('#timer').hidden) renderTimer();
    if (!$('#favSheet').hidden) renderFav();
    if (P.syncAds) P.syncAds();
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
  // ☆ボタン（詳細）。販売前は出さない
  P.starBtn = function (id, cls = '') {
    if (!P.shown) return '';
    const on = P.on && P.isFav(id);
    return `<button class="btn star${on ? ' on' : ''} ${cls}" type="button" data-act="fav" data-id="${esc(id)}" aria-label="お気に入り" aria-pressed="${on}">${STAR}${lockBadge()}</button>`;
  };
  // カードの区間名の右の星（見せるだけ。登録は詳細の☆で）：登録していれば黒い★、していなければ白い☆
  P.starMark = function (id) {
    if (!P.shown) return '';
    const on = P.on && P.isFav(id);
    return `<i class="cstar${on ? ' on' : ''}" data-star="${esc(id)}" role="img" aria-label="${on ? 'お気に入りに登録済み' : 'お気に入りに未登録'}">${STAR}</i>`;
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
    document.querySelectorAll('[data-star]').forEach(b => {
      const on = P.on && P.isFav(b.dataset.star);
      b.classList.toggle('on', on); b.setAttribute('aria-label', on ? 'お気に入りに登録済み' : 'お気に入りに未登録');
    });
    document.querySelectorAll('[data-act="favplace"]').forEach(b => {
      const on = P.on && P.isPlaceFav(state.dest);
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    });
  }

  P.toggleFav = function (id) {
    if (P.gated()) return P.openUpsell('fav');
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
    if (P.gated()) return P.openUpsell('fav');
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

  /* ---------- お気に入りの一覧（右下の★ボタン。タイマーの上） ---------- */
  P.openFav = function () {
    if (P.gated()) return P.openUpsell('fav');
    showPanel('');
    renderFav();
    $('#favSheet').hidden = false;
    P.syncAds();
    $('#favClose').focus({ preventScroll: true });
  };
  P.closeFav = () => { $('#favSheet').hidden = true; P.syncAds(); };

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
      ? '<p class="fempty">詳細の☆を押すと、ここに並びます</p>'
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
  // 特定商取引法の表記・プライバシーポリシーは、ページを公開するまでリンクを出さない（config.js の legalPublished）
  const legalLinks = () => !CFG.legalPublished ? '' : '<p class="blegal"><a href="legal.html" target="_blank" rel="noopener">特定商取引法に基づく表記</a><a href="privacy.html" target="_blank" rel="noopener">プライバシーポリシー</a></p>';
  function openSheet(html) {
    $('#buySheet').classList.remove('prosheet');
    $('#buySheet').innerHTML = html;
    $('#buyScrim').hidden = false;
    P.syncAds();
  }
  P.closeSheet = () => { $('#buyScrim').hidden = true; P.syncAds(); };

  // 有料プランのシート（「？」の購入・広告を消す・鍵の付いた機能から）。紺の帯に機能の見本、機能、値段、購入の順
  const PI = {
    bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4"/></svg>',
    noad: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M4 4l16 16"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  };
  const DEMO = {
    timer: '<i class="udemo" aria-hidden="true"><svg viewBox="0 0 72 72"><circle class="bg" cx="36" cy="36" r="31"/><circle class="fg" cx="36" cy="36" r="31" stroke-dasharray="194.8" stroke-dashoffset="58"/></svg><span><small>あと</small><b>25分</b></span></i>',
    fav: `<i class="udemo star" aria-hidden="true">${STAR}</i>`,
    pro: '<i class="udemo app" aria-hidden="true">P</i>',
  };
  // I（アイコン）は app.js で作るので、開いたときに組み立てる
  const UPSELL = () => ({
    pro: {
      title: 'もっと便利に、<br>戻り遅れなく',
      lead: '1回のお支払いで、ずっと使えます',
      feats: [
        [I.timer, 'タイマー', '残り時間を右下に表示。終わる10分前に通知し、車の場所にも戻れます。'],
        [STAR, 'お気に入り', 'よく使う区間と行き先を保存。いま使えるかも一覧で分かります。'],
        [PI.noad, '広告なし', '詳細・タイマーの広告が出なくなります。'],
      ],
    },
    timer: {
      title: 'タイマー',
      lead: '停めた時刻から、最大時間までの残りを数えます',
      feats: [
        [I.timer, '残り時間がひと目で分かる', '右下のボタンに「あと 25分」。残り10分を切ると赤に変わります。'],
        [PI.bell, '終わる10分前に通知', '画面を閉じていても知らせるので、戻り遅れを防げます。'],
        [I.car, '車の場所にすぐ戻れる', '停めた場所を覚えておき、ボタンひとつで地図を戻します。'],
      ],
    },
    fav: {
      title: 'お気に入り',
      lead: 'よく使う区間と行き先を保存できます',
      feats: [
        [STAR, 'いつもの区間をすぐ呼び出せる', '詳細の☆で保存。右下の★から一覧を開き、押すだけでその区間へ。'],
        [I.clock, 'いまの状態も一覧で分かる', '保存した区間が、いま使えるか・何時までかを一覧に表示します。'],
        [I.pin, '行き先も保存', '職場・取引先など、よく行く場所を10件まで保存できます。'],
      ],
    },
  });
  function proSheet(kind) {
    const u = UPSELL()[kind];
    const incl = [['timer', 'タイマー'], ['fav', 'お気に入り'], ['ads', '広告なし']];
    openSheet(`
      <div class="uhero">
        <button class="uclose" type="button" data-cancel aria-label="閉じる">${PI.x}</button>
        <div>
          <span class="ukick">${PI.lock}有料プラン</span>
          <h2 id="buyTitle">${u.title}</h2>
          <p>${u.lead}</p>
        </div>
        ${DEMO[kind]}
      </div>
      <ul class="ufeat">${u.feats.map(([ic, b, t]) => `<li><i aria-hidden="true">${ic}</i><div><b>${b}</b><span>${t}</span></div></li>`).join('')}</ul>
      <div class="uprice">
        <p><b>${P.PRICE}</b><span>買い切り・月額なし</span></p>
        <ul aria-label="有料プランに含まれるもの">${incl.map(([k, t]) => `<li${k === kind ? ' class="cur"' : ''}>${I.check}${t}</li>`).join('')}</ul>
      </div>
      <button class="btn brand big" type="button" data-buy>${P.PRICE}で購入する</button>
      <p class="bnote">地図と時間の表示は、これまでどおり無料です</p>
      <button class="blink" type="button" data-restore>購入済みの方はこちら（復元）</button>
      ${legalLinks()}`);
    $('#buySheet').classList.add('prosheet');
    $('#buySheet [data-buy]').focus({ preventScroll: true });
  }

  P.openBuy = function () {
    if (!P.shown) return;
    if (P.on) return P.toast('有料プランをご利用中です');
    proSheet('pro');
  };

  // 無料のときにタイマー・お気に入りを押したら：その機能とよいところを説明して、購入へ
  P.openUpsell = function (kind) {
    if (!P.shown || P.on) return;
    proSheet(kind);
  };

  const READY = '有料プランの購入は準備中です。もうしばらくお待ちください';
  async function checkout() {
    if (!CFG.proEnabled) return P.toast(READY);
    if (!store) return P.toast('購入は iPhone のアプリから行えます');
    if (busy) return;
    busy = true;
    try {
      await store.purchaseProduct({ productIdentifier: CFG.storeProductId, productType: 'inapp', quantity: 1 });
      await refreshOwned();
      if (P.on) { P.closeSheet(); P.toast('有料プランになりました。ありがとうございます'); }
    } catch (e) {
      const m = String(e && (e.message || e) || '');
      if (/cancel/i.test(m)) { /* 自分でやめたときは何も出さない */ }
      else if (/pending/i.test(m)) P.toast('承認待ちです。承認されると、自動で使えるようになります', { ms: 5000 });
      else P.toast('購入できませんでした。通信状態を確かめて、もう一度お試しください', { ms: 5000 });
    } finally { busy = false; }
  }

  // 購入の復元：App Store の購入履歴と同期して、持っているか確かめ直す（同じ Apple ID なら機種変更のあとも使える）
  async function restore() {
    if (!CFG.proEnabled) return P.toast(READY);
    if (!store) return P.toast('復元は iPhone のアプリから行えます');
    if (busy) return;
    busy = true;
    P.toast('App Store に確認しています…', { ms: 8000 });
    try {
      await store.restorePurchases();
      await refreshOwned();
      if (P.on) { P.closeSheet(); P.toast('有料プランを復元しました'); }
      else P.toast('この Apple ID での購入は見つかりませんでした', { ms: 5000 });
    } catch (e) { P.toast('App Store に接続できませんでした。もう一度お試しください', { ms: 5000 }); }
    finally { busy = false; }
  }

  function onSheetClick(e) {
    if (e.target === $('#buyScrim')) return P.closeSheet();
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-cancel')) P.closeSheet();
    else if (b.hasAttribute('data-buy')) checkout();
    else if (b.hasAttribute('data-restore')) restore();
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
    ['タイマーの使い方は？', '右下（現在地ボタンの上）のストップウォッチのボタンを押し、「スタート」を押します。動いているあいだは、そのボタンに残り時間が出ます（10分を切ると赤）。「車の場所を確認」で、停めた場所に地図を戻せます。'],
    ['終わる前に通知を受け取るには？', 'タイマーの「終わる10分前に知らせる」をオンにし、通知を許可してください。10分前と、時間になったときに、画面を閉じていても届きます。届かないときは、設定アプリの「通知」→「メーターマップ」で許可してください。'],
    ['パーキング・メーターとパーキング・チケットの違いは？', 'メーターは区間ごとの機械に、チケットは近くの発給機で買った券を車内に表示します。どちらも料金と時間は現地の表示に従ってください。'],
    ['グレーの破線の区間（神奈川など）は？', '県警の公開情報に利用時間・曜日が載っていない区間です。時間は現地の標識で確かめてください。'],
    ['どの地域に対応していますか？', '東京・大阪・神奈川・札幌・京都です。地図を動かすか、上の検索欄に地名・駅名を入れてください。'],
    ['現在地が出ないときは？', '設定アプリの「メーターマップ」→「位置情報」で、「このAppの使用中」を選んでください。'],
  ];

  // 右上の「？」のメニュー：よくある質問・このアプリについて（データと地図の出典・お問い合わせ）
  P.openAbout = function () {
    const proRow = !P.shown ? ''
      : P.on ? `<div class="arow"><b>有料プランをご利用中です</b>${P.iat ? `<small>購入日 ${new Date(P.iat * 1000).toLocaleDateString('ja-JP')}</small>` : ''}</div>`
      : `<button class="arow btnrow" type="button" data-gopro><b>有料プランを購入（${P.PRICE}）</b><small>タイマー・お気に入り・広告なし</small></button>`;
    const credit = typeof mapCredit === 'function' ? mapCredit() : '';
    openSheet(`
      <h2 id="buyTitle">ヘルプ</h2>
      ${proRow}
      ${P.shown ? '<button class="arow btnrow" type="button" data-restore><b>購入の復元</b></button>' : ''}
      <h3>よくある質問</h3>
      <div class="faq">${(P.shown ? [['有料プランでは何ができますか？', `タイマーとお気に入りが使えるようになり、広告も出なくなります。${P.PRICE}の買い切りです。地図と時間の表示は、これまでどおり無料です。`], ...P.FAQ] : P.FAQ).map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
      <h3>このアプリについて</h3>
      <ul class="asrc">${P.SOURCES.map(([k, t, l, u]) => `<li><b>${k}</b>${esc(t)}${u ? ` <a href="${u}" target="_blank" rel="noopener">${l}</a>` : ''}</li>`).join('')}
        <li><b>地図</b>${credit}。区間の線は OpenStreetMap から作成。表示に <a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>・<a href="https://maplibre.org" target="_blank" rel="noopener">MapLibre</a> を使っています。</li>
        <li><b>検索</b>地名の検索・住所は<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a>の仕組みを使っています。</li></ul>
      <p class="anote">現地の標識・メーターの表示が優先されます。</p>
      ${P.shown ? legalLinks() : ''}
      ${CFG.privacyUrl ? `<p class="blegal"><a href="${CFG.privacyUrl}" target="_blank" rel="noopener">プライバシーポリシー</a>${CFG.supportUrl ? `<a href="${CFG.supportUrl}" target="_blank" rel="noopener">サポート</a>` : ''}</p>` : ''}
      <p class="acontact">お問い合わせ：<a href="mailto:${SUPPORT}">${SUPPORT}</a><br>運営：${SELLER}</p>
      <button class="cancel" type="button" data-cancel>閉じる</button>`);
  };

  /* ---------- 広告（AdMob のバナー。無料のときは画面の一番下にいつも。上にシートが開いたら隠す） ---------- */
  // バナーはネイティブの表示で、画面のいちばん下に重なる。高さは --ad-h に入れ、カード・右下のボタン・タイマー・詳細をその分上げる
  const admob = cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins && cap.Plugins.AdMob || null;
  const adsOn = () => !!(CFG.adsEnabled && admob && CFG.admobBannerId && !P.on && checked);
  let adState = 'none'; // none（まだ出していない）・shown・hidden
  let adInit = null;
  function setAdH(h) { document.documentElement.style.setProperty('--ad-h', `${Math.max(0, Math.round(h || 0))}px`); }
  async function initAds() {
    if (!adInit) adInit = (async () => {
      // トラッキングの許可（App Tracking Transparency）：起動時ではなく、初めて広告を出す前に1回だけ聞く
      try {
        const { status } = await admob.trackingAuthorizationStatus();
        if (status === 'notDetermined') await admob.requestTrackingAuthorization();
      } catch (e) {}
      await admob.initialize({ initializeForTesting: !!CFG.admobTesting });
      try {
        await admob.addListener('bannerAdSizeChanged', info => setAdH(adState === 'shown' ? info && info.height : 0));
        await admob.addListener('bannerAdFailedToLoad', () => setAdH(0));
      } catch (e) {}
    })();
    return adInit;
  }
  // いま広告を出してよいか：メイン画面・詳細・タイマーで出す。ほかのシート（購入・「ここへ行く」・お気に入り）が上にあるときは隠す
  function wantAd() {
    if (!adsOn()) return false;
    const open = id => { const e = document.getElementById(id); return e && !e.hidden; };
    return !(open('buyScrim') || open('goScrim') || open('favSheet'));
  }
  let adBusy = Promise.resolve();
  P.syncAds = function () {
    if (!admob) return;
    adBusy = adBusy.then(async () => {
      try {
        const want = wantAd();
        if (want && adState !== 'shown') {
          await initAds();
          const first = adState === 'none';
          adState = 'shown'; // 高さの知らせが表示の途中で届くので、先に切り替える
          if (first) await admob.showBanner({ adId: CFG.admobBannerId, adSize: 'ADAPTIVE_BANNER', position: 'BOTTOM_CENTER', margin: 0, isTesting: !!CFG.admobTesting });
          else await admob.resumeBanner();
        } else if (!want && adState === 'shown') {
          await admob.hideBanner();
          adState = 'hidden';
          setAdH(0);
        }
      } catch (e) { setAdH(0); }
    });
  };

  /* ---------- 組み立て ---------- */
  P.bind = function () {
    $('#favBtn').addEventListener('click', P.openFav);
    $('#favSheet').addEventListener('click', onFavClick);
    $('#buyScrim').addEventListener('click', onSheetClick);
    $('#destTag').addEventListener('click', e => { if (e.target.closest('[data-act="favplace"]')) P.togglePlace(); });
  };

  window.Pro = P;
})();
