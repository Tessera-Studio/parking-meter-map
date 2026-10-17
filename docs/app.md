# iPhone・Android アプリ（Capacitor）

パーキング・メーター・マップは **iPhone・Android のアプリだけ**で提供する（Web 版はやめる。2026-10-17 に決定）。
画面と判定のロジックは今までの Web の作り（`index.html`・`app.js` など）をそのまま使い、[Capacitor](https://capacitorjs.com/) でアプリに包む。

| 項目 | 値 |
|---|---|
| アプリ名（ホーム画面） | メーターマップ（`capacitor.config.json` の appName、iOS の `CFBundleDisplayName`、Android の `app_name`） |
| アプリの ID（Bundle ID / applicationId） | `jp.tesseras.parkingmetermap` |
| Capacitor | 8 |
| iOS の依存の管理 | Swift Package Manager（CocoaPods は使わない） |
| 画面のファイルの置き場 | `www/`（`npm run build` が作る。Git には入れない） |

## フォルダ

```
package.json            Capacitor と、build・sync などのコマンド
capacitor.config.json   アプリの ID・名前・webDir
scripts/build-www.mjs   画面のファイルを www/ にまとめる
ios/                    Xcode のプロジェクト（ios/App/App.xcodeproj）
android/                Android Studio のプロジェクト
```

## iPhone のシミュレーターで動かす（Mac）

用意するもの：Mac、**Xcode 16 以上**（App Store から）、**Node.js 22**（https://nodejs.org/）。

```sh
git clone https://github.com/hodakamiwako-art/parking-meter-map.git
cd parking-meter-map
npm install
npm run ios        # 画面のファイルをまとめ（www/）、ios/ に写し、Xcode を開く
```

Xcode が開いたら：

1. 上の真ん中の機種の選び方で **iPhone 16**（など好きなシミュレーター）を選ぶ
2. 左上の **▶（Run）** を押す。初回は Swift Package の取得に数分かかる
3. シミュレーターでアプリが開く。現在地の許可を聞かれたら「アプリの使用中は許可」
   - シミュレーターの現在地は、メニューの **Features → Location → Custom Location…** で決められる（例：緯度 35.6717、経度 139.7650 で銀座）

実機（自分の iPhone）で動かすときは、Xcode の **Signing & Capabilities** で Team（Apple ID）を選ぶ。App Store に出すには Apple Developer Program（年99ドル）が必要。

## Android のエミュレーターで動かす

用意するもの：**Android Studio**（https://developer.android.com/studio）、Node.js 22。

```sh
npm install
npm run android    # www/ を作り、android/ に写し、Android Studio を開く
```

Android Studio で、右上のエミュレーター（Pixel など）を選んで ▶ を押す。

## 有料プランの購入を試す（シミュレーター・StoreKit）

購入は App Store のアプリ内課金（StoreKit 2。プラグイン @capgo/native-purchases）。Xcode の **StoreKit 設定ファイル**を使うと、App Store Connect に商品を登録する前でも、シミュレーターで購入・復元・返金を試せる（お金はかからない）。商品は `ios/App/Products.storekit` に入れてある（商品 ID `jp.tesseras.parkingmetermap.pro`・非消耗型・480円）。

初回だけ、Xcode で次の2つを行う：

1. **ファイルをプロジェクトに入れる**：左の一覧の一番上の「App」（青いアイコン）を右クリック →「Add Files to "App"…」→ `ios/App/Products.storekit` を選ぶ →「Add」（Targets のチェックは外してよい）
2. **スキームに設定する**：メニューの **Product → Scheme → Edit Scheme…** → 左の「Run」→ 上の「Options」タブ →「StoreKit Configuration」で **Products.storekit** を選ぶ →「Close」

そのあと ▶ で起動し、タイマーか★を押す →「¥480で購入する」→ 購入の確認が出る →「購入」。鍵が外れれば成功。

- **返金を試す**：メニューの **Debug → StoreKit → Manage Transactions…** で購入を選び、右クリック →「Refund Purchases」。アプリに戻ると鍵が付き直す
- **最初からやり直す**：同じ画面で購入を選んで削除（ゴミ箱）。アプリを消して入れ直すと、前回の記録も消える
- **承認待ちを試す**：Products.storekit を開き、メニューの **Editor → Enable Ask To Buy**

## 画面を変えたとき

画面のファイル（`app.js`・`styles.css` など）を変えたら、`npm run sync` で `www/` を作り直して `ios/`・`android/` に写す（`npm run ios` / `npm run android` は sync まで含む）。

## 位置情報

- iOS：`ios/App/App/Info.plist` の `NSLocationWhenInUseUsageDescription`（「現在地の近くのパーキング・メーターを地図に出すために使います。」）
- Android：`android/app/src/main/AndroidManifest.xml` の `ACCESS_COARSE_LOCATION`・`ACCESS_FINE_LOCATION`

## これから（順番）

**まずは iPhone 版から**仕上げる（2026-10-17 に決定）。Android はそのあと。

1. **いまの段階**：雛形。Web の画面がそのままアプリで動く（有料プランの★・タイマーは鍵付きで見え、購入は「準備中」。`config.js` の `proShown: true`）
2. ~~有料プランをストアの購入に~~（済み：StoreKit 2・@capgo/native-purchases。Stripe・Cloudflare の仕組みとメールでの復元はやめた。docs/pro-ads.md §15.6）。残り：App Store Connect に商品を登録して、Sandbox の Apple ID で実機で試す（docs/pro-ads.md §23）
3. タイマーの通知を、アプリの通知（@capacitor/local-notifications）に
4. 「ここへ行く」で地図アプリを確実に開く（@capacitor/app-launcher など）
5. アイコン・起動画面（@capacitor/assets）
6. Web 版をやめる：GitHub の **Settings → Pages** で公開を止める
7. App Store・Google Play への申請（ストアの説明文・スクリーンショット・プライバシーの申告）
