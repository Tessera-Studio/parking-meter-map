/* 設定（docs/pro-ads.md）。販売・広告を始めるときにここを書き換える。
   proEnabled：有料プランを買えるようにする。購入は App Store（アプリの中だけ）。ブラウザでは「アプリから」の札を出す。
               false のあいだは、購入ボタンは「準備中」の札を出すだけ。
   proShown：有料プランの機能（お気に入りの★・タイマー）を鍵付きで見せる。押すと説明のシート。
   storeProductId：App Store Connect（と Xcode の StoreKit 設定ファイル）に登録する商品 ID。買い切り（非消耗型）。
   legalPublished・legalUrl：特定商取引法に基づく表記のページ（tesseras.jp）。true のあいだ、購入シートとヘルプにリンクを出す。
   privacyUrl・supportUrl：ヘルプに出すプライバシーポリシーとサポートのページ（App Store Connect にも同じ URL を入れる）。
   adsEnabled：広告（AdMob のバナー）を出す。詳細・タイマーを開いているあいだだけ、画面の一番下に出る。有料プランでは出ない。
   admobBannerId：AdMob のバナーの広告ユニット ID（本番。iOS アプリ「メーターマップ」のバナー）。Android は別の ID になる。
   admobTesting：テスト広告として出す。本番では false。手元の iPhone は AdMob の「テストデバイス」に登録して、本番の広告を押さないようにする。
   feedbackUrl：ご意見・不具合のフォームの送り先（Google スプレッドシートに付けた Apps Script の Web アプリの URL。docs/feedback.md）。
               空のあいだは、送るボタンでメールアプリを開く（support@tesseras.jp あて）。
   appVersion：フォームに付けて送るアプリの版（Xcode の MARKETING_VERSION と合わせる）。
   ※ AdMob のアプリ ID は ios/App/App/Info.plist の GADApplicationIdentifier（本番）。 */
window.PMM_CONFIG = {
  proEnabled: true,
  proShown: true,
  storeProductId: 'jp.tesseras.parkingmetermap.pro',
  legalPublished: true,
  legalUrl: 'https://tesseras.jp/legal',
  privacyUrl: 'https://tesseras.jp/metermap/privacy',
  supportUrl: 'https://tesseras.jp/metermap/',
  adsEnabled: true,
  admobBannerId: 'ca-app-pub-4938846991161247/8726644504',
  admobTesting: false,
  feedbackUrl: 'https://script.google.com/macros/s/AKfycbzX8HPeJtnXykQuMyKskc4gQP4o1duKhzvC_w1mdzAZ_28lMdyp5n5MqjjZfCTGonxn/exec',
  appVersion: '1.0',
};
