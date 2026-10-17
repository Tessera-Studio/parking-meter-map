# ストア掲載文（App Store・Google Play）

App Store Connect と Play Console にそのまま貼れる形にしています。文字数は各ストアの上限に収めています（`python3 build/listing_check.py` で確認）。
区間数などの数字はデータを更新したら合わせます（README の「データ」）。

**基本情報**

| 項目 | App Store | Google Play |
|---|---|---|
| カテゴリ | ナビゲーション（サブ：旅行） | 地図＆ナビ |
| 年齢 | 4+ | 全ユーザー対象（IARC） |
| 価格 | 無料（Pro はアプリ内課金） | 無料（アプリ内課金あり） |
| サポート URL | Web 版の support.html | 同じ |
| サポートのメール | support@tesseras.jp | support@tesseras.jp |
| プライバシーポリシー | Web 版の privacy.html（docs/pro-ads.md §18） | 同じ |
| 著作権表示 | © 2026 Tessera Studio | — |

---

## 日本語

**アプリ名**（30字まで）

```
パーキング・メーター・マップ
```

**サブタイトル**（App Store・30字まで）

```
いま停められる路上の区間がすぐ分かる
```

**プロモーション用テキスト**（App Store・170字まで。審査なしで書き換えられる）

```
東京・大阪・神奈川・札幌・京都のパーキング・メーター／チケット915区間に対応。緑の線が「いま使える」区間です。停めたらタイマーをスタート。アプリを閉じていても、終わる10分前にお知らせします。
```

**短い説明**（Google Play・80字まで）

```
いま使えるパーキング・メーターを地図で。東京・大阪など915区間、閉じても届くタイマー通知つき
```

**キーワード**（App Store・100字まで。カンマ区切り、空白なし。アプリ名にある語は入れない）

```
パーキングチケット,駐車,路上駐車,時間制限駐車,駐車場,駐禁,東京,大阪,京都,札幌,横浜,神奈川,警視庁,タイマー,車,ドライブ
```

**説明**（4000字まで。App Store・Google Play 共通）

```
「この辺で、いま使えるパーキング・メーターはどこ？」にすぐ答える地図アプリです。

東京・大阪・神奈川・札幌・京都のパーキング・メーターとパーキング・チケットの設置区間 915区間を、地図と「近い順」のカードで探せます。

■ 線の色で、いま使えるかがひと目で分かる
・緑：いま使える区間
・赤：時間外の区間
・グレーの破線：利用時間が公開されていない区間
曜日・祝日・年末年始・札幌の冬期休止まで見て、1分ごとに見直します。

■ 近い順のカード
地図の中心から1km以内の区間を、使える区間から近い順に並べます。「21:00まで」「あす 9:00から」のバッジ、徒歩◯分、最大時間、料金、利用時間をまとめて表示します。

■ 行き先から探す
地名・駅名を入れると、その場所のまわりの区間を出します。

■ ここへ行く
Apple マップ・Google マップで、区間までの経路をすぐ開けます。

■ タイマーと通知
停めたらタイマーをスタート。区間の最大時間で残り時間を数えます。アプリを閉じていても、終わる10分前と時間になったときに通知が届きます。地図で車を停めた場所にも戻れます。

■ 対応地域と区間数
東京 752・神奈川 107・大阪 41・札幌 10・京都 5

■ データの出典
東京：警視庁のオープンデータ（CC BY 4.0）をもとに作成
大阪・神奈川・札幌・京都：各府県警察の公開情報をもとに作成
地図：OpenFreeMap・OpenStreetMap、地名の検索：国土地理院

■ ご注意
現地の標識・メーター・チケットの表示が優先されます。工事や行事で使えない日もあります。時間外は、ほとんどの区間で駐車禁止です。
このアプリは警察・自治体が提供するものではありません。

お問い合わせ：support@tesseras.jp
運営：合同会社Tessera Studio
```

Pro をアプリ内課金で売り始めたら、説明の「■ 対応地域と区間数」の前に次を足します。

```
■ Pro（買い切り）
・タイマーが終わる前の通知
・よく使う区間・行き先のお気に入り
1回のお支払いで、ずっと使えます。地図と時間の表示は無料です。
```

**このバージョンの新機能**（初回）

```
アプリ版を公開しました。アプリを閉じていても、タイマーの通知が届きます。
```

---

## English

The app's screens are in Japanese only. Add the English listing only for visitors who drive in Japan, and keep the first line of the description saying the app is in Japanese.

**App name** (max 30)

```
Japan Parking Meter Map
```

**Subtitle** (App Store, max 30)

```
Street parking open right now
```

**Promotional text** (App Store, max 170)

```
915 parking meter and ticket zones in Tokyo, Osaka, Kanagawa, Sapporo and Kyoto. Green lines are open now. Start the timer for a reminder before time is up.
```

**Short description** (Google Play, max 80)

```
Find on-street parking meters open now in Tokyo, Osaka and more. Timer alerts.
```

**Keywords** (App Store, max 100)

```
parking,meter,ticket,street parking,Tokyo,Osaka,Kyoto,Sapporo,Yokohama,Japan,car,drive,timer
```

**Description** (max 4000)

```
Where can I park on the street right now? This map answers that at a glance.
Note: the app's screens are in Japanese.

Find 915 parking meter and parking ticket zones in Tokyo, Osaka, Kanagawa, Sapporo and Kyoto on a map, with cards sorted by distance.

- Line colors show what's open now
  Green: open now / Red: outside hours / Gray dashed: hours not published
  Weekdays, national holidays, the New Year break and Sapporo's winter closure are all taken into account, and the map refreshes every minute.

- Nearest first
  Zones within 1 km are listed with open zones first, showing until when they're open, walking time, maximum stay, fee and hours.

- Search by place or station
  Enter a place or station name to see the zones around it.

- Directions
  Open the route in Apple Maps or Google Maps.

- Timer and reminders
  Start the timer when you park. It counts down the zone's maximum stay and reminds you 10 minutes before time is up and when it's up — even when the app is closed. Jump back to where you parked.

- Coverage
  Tokyo 752, Kanagawa 107, Osaka 41, Sapporo 10, Kyoto 5

- Data sources
  Tokyo: based on Tokyo Metropolitan Police Department open data (CC BY 4.0)
  Osaka, Kanagawa, Sapporo, Kyoto: based on information published by each prefectural police
  Maps: OpenFreeMap / OpenStreetMap. Place search: Geospatial Information Authority of Japan

- Please note
  Signs and meters on site always take priority. Zones may be closed for roadworks or events. Parking outside the posted hours is prohibited in most zones.
  This app is not provided by the police or any local government.

Contact: support@tesseras.jp
Tessera Studio LLC
```

When Pro goes on sale in the app, add before "Coverage":

```
- Pro (one-time purchase)
  Timer reminders and favorite zones and places. Pay once, use forever. The map and hours stay free.
```

---

## スクリーンショット

App Store は 6.9インチ（1320×2868）があれば、ほかの iPhone の大きさに使われます（アプリは iPhone 専用なので iPad 用は要りません）。Google Play はスマホ用を2〜8枚（9:16 など）。

Mac で次を実行すると、下の6枚を撮って見出しを付けます（`store/screenshots/ja/`・`en/`。見出しなしは `raw/`）。時刻は平日の昼、現在地は銀座に固定しています。

```bash
npx playwright install chromium   # 初回だけ
npm run build && npm run screenshots
```

シミュレーター（iPhone 17 Pro Max など）で撮ってもかまいません。

| # | 画面 | 見出し（日本語） | Caption (English) |
|---|---|---|---|
| 1 | 銀座あたり、緑と赤の線とカード | いま停められる区間が、ひと目で | See what's open now, at a glance |
| 2 | 区間の詳細（利用時間・曜日・料金） | 時間・料金・曜日ごとの決まりまで | Hours, fees and rules by day |
| 3 | タイマー（残り時間のリング） | 閉じていても、終わる前にお知らせ | A reminder before time is up |
| 4 | 行き先を入れたところ（400mの円） | 行き先のまわりで探せる | Search around your destination |
| 5 | 「ここへ行く」のシート | Apple マップ・Google マップで案内 | Directions in Apple or Google Maps |
| 6 | 大阪または札幌を引いたところ | 東京・大阪・神奈川・札幌・京都 | Tokyo, Osaka, Kanagawa, Sapporo, Kyoto |

シミュレーターで撮るときは：時刻を平日の昼（使える区間が多い）にし、通知・電波の表示をきれいにする（`xcrun simctl status_bar booted override --time 9:41 --batteryLevel 100`）。

---

## プライバシーの申告

**App Store「App のプライバシー」**

| データ | 集めるか | 説明 |
|---|---|---|
| 位置情報 | 集めない | 端末の中だけで、近い順の並べ替えと地図の表示に使う。運営者には送らない |
| 検索した語・地図の座標 | 集めない | 地名の検索・住所の逆引きのため国土地理院に送るが、運営者は受け取らない |
| 購入（Pro を売り始めたら） | 集める：購入履歴（App の機能。ユーザーに紐付けない・トラッキングなし） | RevenueCat が、匿名の ID と購入の記録を持つ |

Pro を売るまでは「データの収集なし」で申告できます。

**Google Play「データ セーフティ」**：上と同じ内容。「データは転送時に暗号化される」「削除をリクエストできる（メールで受付）」にチェックします。

---

## 審査メモ（App Review への注記）

```
This app shows on-street parking meter and parking ticket zones in Japan and whether each zone can be used right now.

Native features:
- Local notifications: the parking timer schedules reminders 10 minutes before time is up and when it is up, delivered even when the app is closed.
- Location: used on device only, to sort nearby zones and show your position.
- Directions open in Apple Maps / Google Maps.

How to test: allow location (or search "銀座" in the top search field), tap the clock button on a card, then tap "スタート". Turn on "終わる10分前に知らせる" to see notifications.
No account or login is required.
```

Pro を売り始めたら、次を足します：`Pro is a non-consumable in-app purchase (product ID: pmm_pro). Restore Purchases is in the "?" menu.`
