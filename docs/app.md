# iPhone・Android アプリ（Capacitor）

パーキング・メーター・マップは **iPhone・Android のアプリだけ**で提供する（Web 版はやめる。2026-10-17 に決定）。
画面と判定のロジックは今までの Web の作り（`index.html`・`app.js` など）をそのまま使い、[Capacitor](https://capacitorjs.com/) でアプリに包む。

| 項目 | 値 |
|---|---|
| アプリ名 | パーキング・メーター・マップ |
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

## 画面を変えたとき

画面のファイル（`app.js`・`styles.css` など）を変えたら、`npm run sync` で `www/` を作り直して `ios/`・`android/` に写す（`npm run ios` / `npm run android` は sync まで含む）。

## 位置情報

- iOS：`ios/App/App/Info.plist` の `NSLocationWhenInUseUsageDescription`（「現在地の近くのパーキング・メーターを地図に出すために使います。」）
- Android：`android/app/src/main/AndroidManifest.xml` の `ACCESS_COARSE_LOCATION`・`ACCESS_FINE_LOCATION`

## これから（順番）

1. **いまの段階**：雛形。Web の画面がそのままアプリで動く
2. 有料プランをストアの購入に（RevenueCat。App Store / Google Play）。Stripe・Cloudflare の仕組み（`functions/`・`lib/`・`scripts/pro-keys.mjs`）と、メールでの復元はやめる。仕様は docs/pro-ads.md を書き直す
3. タイマーの通知を、アプリの通知（@capacitor/local-notifications）に
4. 「ここへ行く」で地図アプリを確実に開く（@capacitor/app-launcher など）
5. アイコン・起動画面（@capacitor/assets）
6. Web 版をやめる：GitHub の **Settings → Pages** で公開を止める
7. App Store・Google Play への申請（ストアの説明文・スクリーンショット・プライバシーの申告）
