/* 設定（docs/pro-ads.md）。販売・広告を始めるときにここを書き換える。
   proEnabled：有料プランを買えるようにする。購入は App Store（アプリの中だけ）。ブラウザでは「アプリから」の札を出す。
               false のあいだは、購入ボタンは「準備中」の札を出すだけ。
   proShown：有料プランの機能（お気に入りの★・タイマー）を鍵付きで見せる。押すと説明のシート。
   storeProductId：App Store Connect（と Xcode の StoreKit 設定ファイル）に登録する商品 ID。買い切り（非消耗型）。
   legalPublished：特定商取引法の表記・プライバシーポリシーのページを公開したら true（シートにリンクを出す）。
   adsEnabled：広告を始めたら true（アプリでは AdSense は使えないので、使うなら AdMob に替える）。 */
window.PMM_CONFIG = {
  proEnabled: true,
  proShown: true,
  storeProductId: 'jp.tesseras.parkingmetermap.pro',
  legalPublished: false,
  adsEnabled: false,
  adsenseClient: '',
  adsenseSlots: { detail: '', timer: '' },
};
