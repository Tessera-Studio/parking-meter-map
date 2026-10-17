/* ネイティブアプリ（Capacitor）でだけ読み込む。Web 版の index.html には入れない（scripts/build-www.mjs が差し込む）。
   ・現在地を、WebView ではなく OS の位置情報で取る（許可の確認が1回で済む）
   ・タイマーの通知を OS に預け、アプリを閉じていても届くようにする（終わる10分前と時間切れ）
   ・外のページ・地図アプリへのリンクを、アプリの中ではなく Safari／Apple マップ／Google マップで開く */
(() => {
  const cap = window.Capacitor;
  if (!cap || !cap.isNativePlatform()) return;
  const LN = window.capacitorLocalNotifications && window.capacitorLocalNotifications.LocalNotifications;
  const IDS = [1, 2];

  async function askNotify() {
    if (!LN) return false;
    try {
      let p = await LN.checkPermissions();
      if (p.display !== 'granted' && p.display !== 'denied') p = await LN.requestPermissions();
      return p.display === 'granted';
    } catch (e) { return false; }
  }
  // 前に預けた通知を消してから、これからの分だけ預け直す。list：[{ at: ミリ秒, body }]
  async function schedule(list) {
    if (!LN) return;
    try {
      await LN.cancel({ notifications: IDS.map(id => ({ id })) });
      const now = Date.now();
      const notifications = list.map((n, i) => ({ id: IDS[i], title: 'パーキング・メーター・マップ', body: n.body, schedule: { at: new Date(n.at), allowWhileIdle: true } }))
        .filter(n => n.schedule.at.getTime() > now);
      if (notifications.length && await askNotify()) await LN.schedule({ notifications });
    } catch (e) { /* 通知を出せない端末では画面の表示だけ */ }
  }
  // アプリ内課金（RevenueCat）。Pro は買い切りの商品1つ（PRODUCT）と、それで有効になる権利（ENTITLEMENT）
  const PRODUCT = 'pmm_pro', ENTITLEMENT = 'pro';
  const RC = window.capacitorExports && window.capacitorExports.registerPlugin('Purchases');
  const cancelled = e => !!e && (e.userCancelled || String(e.code) === '1' || (!!e.data && (e.data.userCancelled || String(e.data.code) === '1')));
  // { on, since（購入日時・ミリ秒） }
  const proOf = info => {
    const ent = info && info.entitlements && info.entitlements.active && info.entitlements.active[ENTITLEMENT];
    return { on: !!ent, since: ent ? ent.originalPurchaseDateMillis || Date.parse(ent.originalPurchaseDate) || null : null };
  };
  let product = null;
  // 値段の表示と購入に使う商品。通信できないときは、買うときにもう一度取りにいく
  async function loadProduct() {
    try {
      const { products } = await RC.getProducts({ productIdentifiers: [PRODUCT], type: 'NON_SUBSCRIPTION' });
      product = (products || [])[0] || product;
    } catch (e) {}
    return product;
  }
  const store = {
    // config.js の revenuecat の鍵で始める。鍵がない・始められないときは false（Pro を出さない）
    async init(keys) {
      const apiKey = keys && keys[cap.getPlatform()];
      if (!RC || !apiKey) return false;
      try { await RC.configure({ apiKey }); } catch (e) { return false; }
      await loadProduct();
      return true;
    },
    price: () => (product ? product.priceString : null),
    async status() { const { customerInfo } = await RC.getCustomerInfo(); return proOf(customerInfo); },
    // 買う。やめたときは null
    async buy() {
      if (!product && !await loadProduct()) throw new Error('no product');
      try { const { customerInfo } = await RC.purchaseStoreProduct({ product }); return proOf(customerInfo); }
      catch (e) { if (cancelled(e)) return null; throw e; }
    },
    async restore() { const { customerInfo } = await RC.restorePurchases(); return proOf(customerInfo); },
  };

  window.Native = { platform: cap.getPlatform(), askNotify, schedule, store };

  // 現在地：app.js の navigator.geolocation の呼び方のまま、Geolocation プラグインにつなぐ
  const GEO = window.capacitorGeolocationPluginCapacitor && window.capacitorGeolocationPluginCapacitor.Geolocation;
  if (GEO) {
    const opts = (o = {}) => ({ enableHighAccuracy: !!o.enableHighAccuracy, timeout: o.timeout, maximumAge: o.maximumAge });
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
      getCurrentPosition(ok, ng, o) { GEO.getCurrentPosition(opts(o)).then(ok, e => ng && ng(e)); },
      watchPosition(ok, ng, o) {
        const id = GEO.watchPosition(opts(o), (p, e) => { if (e) { if (ng) ng(e); } else if (p) ok(p); });
        id.catch(e => ng && ng(e));
        return id;
      },
      clearWatch(id) { Promise.resolve(id).then(i => i && GEO.clearWatch({ id: i }), () => {}); },
    } });
  }

  // 外へのリンク：Capacitor はアプリの外の URL への移動を OS に渡すので、同じ画面で移動させる
  const external = url => { try { return new URL(url, location.href).origin !== location.origin; } catch (e) { return false; } };
  const webOpen = window.open.bind(window);
  window.open = (url, ...rest) => { if (url && external(url)) { location.href = url; return null; } return webOpen(url, ...rest); };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target !== '_blank' || !external(a.href)) return;
    e.preventDefault();
    location.href = a.href;
  }, true);
})();
