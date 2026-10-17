/* 設定（docs/pro-ads.md）。販売・広告を始めるときにここを書き換える。
   proEnabled：有料プランを買えるようにする。購入は App Store（アプリの中だけ）。ブラウザでは「アプリから」の札を出す。
               false のあいだは、購入ボタンは「準備中」の札を出すだけ。
   proShown：有料プランの機能（お気に入りの★・タイマー）を鍵付きで見せる。押すと説明のシート。
   storeProductId：App Store Connect（と Xcode の StoreKit 設定ファイル）に登録する商品 ID。買い切り（非消耗型）。
   legalPublished：特定商取引法の表記のページを公開したら true（シートにリンクを出す）。
   privacyUrl・supportUrl：ヘルプに出すプライバシーポリシーとサポートのページ（App Store Connect にも同じ URL を入れる）。
   adsEnabled：広告（AdMob のバナー）を出す。詳細・タイマーを開いているあいだだけ、画面の一番下に出る。有料プランでは出ない。
   admobBannerId：AdMob のバナーの広告ユニット ID。いまは Google のテスト用（本番は AdMob の管理画面で作った ID に替える）。
   admobTesting：テスト広告として出す。本番の ID に替えたら false。
   ※ AdMob のアプリ ID は ios/App/App/Info.plist の GADApplicationIdentifier（いまはテスト用）。 */
window.PMM_CONFIG = {
  proEnabled: true,
  proShown: true,
  storeProductId: 'jp.tesseras.parkingmetermap.pro',
  legalPublished: false,
  privacyUrl: 'https://hodakamiwako-art.github.io/parking-meter-map/privacy.html',
  supportUrl: 'https://hodakamiwako-art.github.io/parking-meter-map/support.html',
  adsEnabled: true,
  admobBannerId: 'ca-app-pub-3940256099942544/2435281174',
  admobTesting: true,
};
