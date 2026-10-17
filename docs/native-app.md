# ネイティブアプリ（iOS・Android）

Web 版の画面をそのまま [Capacitor](https://capacitorjs.com/) で包んで、App Store・Google Play に出せるアプリにしています。
**Web 版はこれまでどおりビルドなし**です（GitHub Pages に出しているファイルは変わりません）。

## しくみ

| ファイル | 役目 |
|---|---|
| `package.json` | Capacitor と、通知・現在地のプラグイン |
| `capacitor.config.json` | アプリ ID（`jp.tesseras.parkingmeter`）・アプリ名・背景色 |
| `scripts/build-www.mjs` | 画面のファイルを `www/` に集め、`index.html` に Capacitor と `native.js` を差し込む。`www/` はコミットしない |
| `native.js` | アプリ版でだけ読み込む。Web 版では何もしない |
| `ios/`・`android/` | Xcode・Android Studio のプロジェクト（`npx cap add` で作ったもの） |

`native.js` がしていること：

- **タイマーの通知**：OS に預けます（Local Notifications）。アプリを閉じていても、**終わる10分前と時間切れの2回**届きます。
  タイマーを止めたり通知を切ったりすると取り消します（`app.js` の `scheduleNotify`）。Web 版はこれまでどおり、開いているあいだの1回だけです
- **現在地**：`navigator.geolocation` を Geolocation プラグインにつなぎます。`app.js` の書き方は変えていません
- **外へのリンク**：「ここへ行く」や出典のリンクを、アプリの中ではなく Apple マップ・Google マップ・Safari で開きます

**Pro と広告はアプリ版では出しません**（`build-www.mjs` が `proEnabled: false`・`adsEnabled: false` にします）。
iOS ではデジタルな機能を Stripe では売れず（App Store 審査ガイドライン 3.1.1。アプリ内課金が必要）、アプリの中では AdSense も使えません（AdMob にする）。
アプリ版でも売るときは、RevenueCat などでアプリ内課金にして、広告は AdMob にします。そのときにこの節を書き直します。

## いつもの作業

```bash
npm install          # 初回だけ
npm run ios          # www/ を作る → iOS にコピー → Xcode を開く（Mac のみ）
npm run android      # www/ を作る → Android にコピー → Android Studio を開く
npm run sync         # www/ を作って両方にコピーだけする
```

画面のファイル（`app.js` など）を変えたら、`npm run sync` してからアプリをビルドします。データ（`data/zones.geojson`）もアプリに入るので、データを更新したらアプリも出し直します。

## 初めて出すまで

### 用意するもの

- Mac と Xcode（iOS のビルド・提出に必須）、Android Studio
- Apple Developer Program（年 99ドル。合同会社Tessera Studio の名義なら D-U-N-S 番号が必要）
- Google Play Console（初回 25ドル。法人で登録）

### アイコンとスプラッシュ

`icon.svg` から 1024×1024 の PNG を作って `assets/icon.png` に置き、次を実行します。

```bash
npx @capacitor/assets generate --iconBackgroundColor '#ECEAE4' --splashBackgroundColor '#ECEAE4'
```

### iOS

1. `npm run ios` で Xcode を開く
2. App ターゲット → Signing & Capabilities で Team を選ぶ
3. 実機で確かめる：現在地の許可（文言は `ios/App/App/Info.plist` の `NSLocationWhenInUseUsageDescription`）、タイマーの通知（アプリを閉じて待つ）、「ここへ行く」で地図アプリが開くこと
4. Product → Archive → App Store Connect に上げる。TestFlight で確かめてから審査に出す

### Android

1. `npm run android` で Android Studio を開く
2. 実機で同じことを確かめる。Android 13 以降は通知の許可、Android 12 以降は「アラームとリマインダー」の許可がないと、通知が数分遅れることがあります
3. Build → Generate Signed App Bundle（.aab）→ Play Console の内部テストに上げる

### 審査で聞かれること

- **プライバシー**：位置情報は端末の中でだけ使い、送っていない。行き先の検索・住所の逆引きでは、入力や座標を国土地理院に送る。App Store の「App のプライバシー」と Play の「データ セーフティ」にそう書く
- **最小限の機能（ガイドライン 4.2）**：Web を包んだだけと見られないよう、審査メモに「閉じていても届くタイマー通知」「現在地から近い順」を書く
- **データの出典**：アプリの「？」に出典が出ていることを伝える（警視庁オープンデータは CC BY 4.0）
