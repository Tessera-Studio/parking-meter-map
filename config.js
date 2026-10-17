/* 設定（docs/pro-ads.md）。販売・広告を始めるときにここを書き換える。
   proEnabled：Pro の販売を始めたら true（Cloudflare Pages の API・Stripe の準備ができてから）。false のあいだは、
               お気に入り・鍵・購入シートを出さず、タイマーの通知も無料のまま。確認は ?preview=free ／ ?preview=pro で。
   proShown：販売前でも、有料プランの機能（お気に入りの★・タイマー）を鍵付きで見せる。押すと説明のシート。
             「有料プランを購入」は、販売を始めるまで「準備中」の札を出すだけ。
   proPublicKey：購入証の署名を確かめる公開鍵（JWK）。node scripts/pro-keys.mjs で作る。
   adsEnabled：AdSense の審査が通ったら true。adsenseClient（ca-pub-…）と広告枠の ID も入れる。 */
window.PMM_CONFIG = {
  proEnabled: false,
  proShown: true,
  proPublicKey: null,
  apiBase: '/api',
  adsEnabled: false,
  adsenseClient: '',
  adsenseSlots: { detail: '', timer: '' },
};
