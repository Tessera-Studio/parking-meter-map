# ネイティブアプリ（iOS・Android）

Web 版の画面をそのまま [Capacitor](https://capacitorjs.com/) で包んで、App Store・Google Play に出せるアプリにしています。
**Web 版はこれまでどおりビルドなし**です（GitHub Pages に出しているファイルは変わりません）。

## しくみ

| ファイル | 役目 |
|---|---|
| `package.json` | Capacitor と、通知・現在地・アプリ内課金（RevenueCat）のプラグイン |
| `capacitor.config.json` | アプリ ID（`jp.tesseras.parkingmeter`）・アプリ名・背景色 |
| `scripts/build-www.mjs` | 画面のファイルを `www/` に集め、`index.html` に Capacitor と `native.js` を差し込む。`www/` はコミットしない |
| `native.js` | アプリ版でだけ読み込む。Web 版では何もしない |
| `ios/`・`android/` | Xcode・Android Studio のプロジェクト（`npx cap add` で作ったもの） |
| `assets/` | アイコン・起動画面の元の画像（下の「アイコンと起動画面」） |
| `docs/store-listing.md` | ストアの掲載文（日本語・英語）・スクリーンショット・プライバシーの申告・審査メモ |

`native.js` がしていること：

- **タイマーの通知**：OS に預けます（Local Notifications）。アプリを閉じていても、**終わる10分前と時間切れの2回**届きます。
  タイマーを止めたり通知を切ったりすると取り消します（`app.js` の `scheduleNotify`）。Web 版はこれまでどおり、開いているあいだの1回だけです
- **現在地**：`navigator.geolocation` を Geolocation プラグインにつなぎます。`app.js` の書き方は変えていません
- **外へのリンク**：「ここへ行く」や出典のリンクを、アプリの中ではなく Apple マップ・Google マップ・Safari で開きます
- **アプリ内課金**：Pro を App Store・Google Play で売ります（`Native.store`。`pro.js` が使う）。下の「Pro をアプリ内課金で売る」

アプリ版では Stripe と AdSense は使いません。iOS ではデジタルな機能を Stripe では売れず（App Store 審査ガイドライン 3.1.1）、アプリの中では AdSense も使えないためです。
`build-www.mjs` が、アプリ版の `proEnabled` を `config.js` の `nativeProEnabled` にし、`adsEnabled` を `false` にします。広告をアプリにも出すときは AdMob を足します。

## いつもの作業

```bash
npm install          # 初回だけ
npm run ios          # www/ を作る → iOS にコピー → Xcode を開く（Mac のみ）
npm run android      # www/ を作る → Android にコピー → Android Studio を開く
npm run sync         # www/ を作って両方にコピーだけする
```

画面のファイル（`app.js` など）を変えたら、`npm run sync` してからアプリをビルドします。データ（`data/zones.geojson`）もアプリに入るので、データを更新したらアプリも出し直します。

## 初めて出すまで

App Store に出す順番（商号変更のあいだにできること・公開の時期）は [app-store-plan.md](app-store-plan.md)。

### 用意するもの

- Mac と Xcode（iOS のビルド・提出に必須）、Android Studio
- Apple Developer Program（年 99ドル。合同会社Tessera Studio の名義なら D-U-N-S 番号が必要）
- Google Play Console（初回 25ドル。法人で登録）

### アイコンと起動画面

作ってあります（`icon.svg` と同じ青地に白い P）。元の画像は `assets/` にあり、iOS・Android の全サイズを生成済みです。

| ファイル | 中身 |
|---|---|
| `assets/icon-only.png` | 1024×1024。iOS と App Store 用（透明なし・角丸なし。角丸は OS が付ける） |
| `assets/icon-foreground.png`・`icon-background.png` | Android のアダプティブアイコン（P は中央の安全な範囲に収める） |
| `assets/splash.png`・`splash-dark.png` | 起動画面。地図と同じ明るい背景に角丸のアイコン（ダークテーマでも明るいまま） |

画像を変えたら、生成し直します。

```bash
npx @capacitor/assets generate --iconBackgroundColor '#1E4E8C' --iconBackgroundColorDark '#1E4E8C' \
  --splashBackgroundColor '#ECEAE4' --splashBackgroundColorDark '#ECEAE4'
rm -rf icons   # Web 用のアイコンもできるが、使わない
```

Google Play には、別に 512×512 のアイコン（`assets/icon-only.png` を縮小）と 1024×500 のフィーチャー グラフィックが要ります。

### iOS

1. `npm run ios` で Xcode を開く
2. App ターゲット → Signing & Capabilities で Team を選ぶ
3. 実機で確かめる：現在地の許可（文言は `ios/App/App/Info.plist` の `NSLocationWhenInUseUsageDescription`）、タイマーの通知（アプリを閉じて待つ）、「ここへ行く」で地図アプリが開くこと
4. Product → Archive → App Store Connect に上げる。TestFlight で確かめてから審査に出す

### Android

1. `npm run android` で Android Studio を開く
2. 実機で同じことを確かめる。Android 13 以降は通知の許可、Android 12 以降は「アラームとリマインダー」の許可がないと、通知が数分遅れることがあります
3. Build → Generate Signed App Bundle（.aab）→ Play Console の内部テストに上げる

## Pro をアプリ内課金で売る

アプリの中の動きはできています（購入・復元・起動時の確認）。ストアと RevenueCat の準備ができたら `config.js` を書き換えるだけです。

- 商品は**買い切り1つ**：商品 ID `pmm_pro`（iOS は「非消耗型」、Google Play は「アプリ内アイテム」）。RevenueCat の権利（Entitlement）の ID は `pro`
- 値段はストアから取って出します（「¥480で購入する」）。`pro.js` の `PRICE`（480円）は Web 版だけで使います
- 復元：「？」→「購入の復元」で、その Apple アカウント／Google アカウントの購入を戻します（メールアドレスは使いません）
- 起動時は RevenueCat が前回の結果を持っているので、通信できなくても Pro のままです
- Web 版（Stripe）で買った人の Pro はアプリでは引き継ぎません（ストアの決まりで、アプリの外の購入をアプリの中で案内できないため）

**手順**

1. **App Store Connect**：「契約／税金／口座情報」で有料 App の契約を結ぶ → アプリを作る → アプリ内課金に `pmm_pro`（非消耗型）を作り、価格を 480円（ない場合は近い価格）にする。
   App Store Small Business Program に申し込むと、手数料が 15% になります
2. **Play Console**：販売者アカウント（お支払いプロファイル）を作る → アプリを作り、内部テストに一度 .aab を上げる（上げないと商品を作れない）→ アプリ内アイテム `pmm_pro` を 480円で作る
3. **RevenueCat**（無料で始められる。売上が月 2,500ドルを超えると手数料あり）：プロジェクトを作り、iOS アプリ（App Store Connect の App 内課金キーを登録）と Android アプリ（Play のサービス アカウントを登録）を足す →
   商品 `pmm_pro` を取り込み、権利 `pro` に紐付ける → 公開用 API キー（`appl_…`・`goog_…`）を控える
4. **`config.js`**：`revenuecat: { ios: 'appl_…', android: 'goog_…' }` と `siteUrl`（特商法の表記・プライバシーポリシーを置いた Web 版の URL）を入れ、`nativeProEnabled: true`
5. **確かめる**：iOS は Sandbox のテスト用アカウント、Android はライセンス テスターで、購入 → アプリを消して入れ直す → 復元、まで
6. 審査に出すときは、アプリ内課金もいっしょに提出します（App Store Connect のバージョンの画面で選ぶ）

### 審査で聞かれること

- **プライバシー**：位置情報は端末の中でだけ使い、送っていない。行き先の検索・住所の逆引きでは、入力や座標を国土地理院に送る。App Store の「App のプライバシー」と Play の「データ セーフティ」にそう書く
- **最小限の機能（ガイドライン 4.2）**：Web を包んだだけと見られないよう、審査メモに「閉じていても届くタイマー通知」「現在地から近い順」を書く
- **データの出典**：アプリの「？」に出典が出ていることを伝える（警視庁オープンデータは CC BY 4.0）
