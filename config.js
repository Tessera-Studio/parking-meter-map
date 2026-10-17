/* 設定（docs/pro-ads.md）。販売・広告を始めるときにここを書き換える。
   proEnabled：Pro の販売を始めたら true（Cloudflare Pages の API・Stripe の準備ができてから）。false のあいだは、
               お気に入り・鍵・購入シートを出さず、タイマーの通知も無料のまま。確認は ?preview=free ／ ?preview=pro で。
   proPublicKey：購入証の署名を確かめる公開鍵（JWK）。node scripts/pro-keys.mjs で作る。
   adsEnabled：AdSense の審査が通ったら true。adsenseClient（ca-pub-…）と広告枠の ID も入れる。
   アプリ版では proEnabled・adsEnabled を使わず、nativeProEnabled で決める（scripts/build-www.mjs）。 */
window.PMM_CONFIG = {
  proEnabled: false,
  proPublicKey: null,
  apiBase: '/api',
  adsEnabled: false,
  adsenseClient: '',
  adsenseSlots: { detail: '', timer: '' },
  // アプリ版（docs/native-app.md）。nativeProEnabled：アプリ内課金で Pro を売り始めたら true。
  // revenuecat：RevenueCat の公開用 API キー（appl_… ／ goog_…）。siteUrl：特商法の表記などを開く Web 版の URL（末尾は /）
  nativeProEnabled: false,
  revenuecat: { ios: '', android: '' },
  siteUrl: '',
};
