# App Store への申請の準備（iPhone）

App Store Connect に入れる文章・申告・画像の下書きです。法人情報の変更が終わったら、この順に入れていきます。
文字数は App Store Connect の上限に合わせてあります（全角も1文字）。

---

## 1. アプリの基本

| 項目 | 入れる内容 |
|---|---|
| 名前（30文字まで） | **メーターマップ** |
| サブタイトル（30文字まで） | **いま使える路上パーキングを地図で** |
| バンドル ID | `jp.tesseras.parkingmetermap` |
| SKU | `parkingmetermap-ios` |
| 主言語 | 日本語 |
| カテゴリ | プライマリ：**ナビゲーション**／セカンダリ：**ユーティリティ** |
| 価格 | 無料（App 内課金あり） |
| 対応機種 | iPhone だけ（縦向きだけ）。iPad の画面は作らない |
| 著作権 | © 2026 Tessera Studio LLC |
| サポート URL | https://hodakamiwako-art.github.io/parking-meter-map/support.html |
| プライバシーポリシー URL | https://hodakamiwako-art.github.io/parking-meter-map/privacy.html |
| マーケティング URL | （なし） |

- 名前は、ホーム画面の「メーターマップ」とそろえる。起動画面の英語表記は「MeterMap」。
- サポートとプライバシーポリシーのページは、このリポジトリの一番上の `support.html`・`privacy.html`（GitHub Pages で公開）。Web 版をやめるときも、この2つのページは残す。

## 2. 説明文

### プロモーション用テキスト（170文字まで。審査なしでいつでも変えられる）

```
いま使える路上パーキングが、地図でひと目で分かります。パーキング・メーター／チケットの区間を、利用時間・最大時間・料金といっしょに。東京・大阪・神奈川・札幌・京都に対応。
```

### 説明（4000文字まで）

```
メーターマップは、パーキング・メーター／パーキング・チケットの区間を地図で探せるアプリです。
「この辺で、いま使える区間はどこか」が、開いてすぐ分かります。

■ いま使える区間が、色でひと目で
・緑：いま使える区間
・赤：時間外の区間（次に使える時刻も表示）
・グレー：時間が公開されていない区間
曜日・祝日・年末年始・冬期の休止も見て判定します。

■ 区間ごとの決まりを、すぐ確認
利用時間・最大時間・料金・除外日（日曜・祝日など）を、カードと詳細で確認できます。

■ 目的地の近くを探す
駅名や地名で検索すると、その周りの区間を近い順に並べます。

■ 地図アプリで案内
「ここへ行く」から、Apple マップ・Google マップで経路を開けます。

■ 有料プラン（480円・買い切り）
・タイマー：停めた時刻から最大時間までの残りを数え、終わる10分前と時間になったときに通知します。車の場所にもすぐ戻れます。
・お気に入り：よく使う区間と行き先を保存できます。
・広告が出なくなります。
月額ではなく、1回のお支払いでずっと使えます。地図と時間の表示は無料です。

■ 対応地域
東京・大阪・神奈川・札幌・京都の915区間（2026年10月時点）

■ ご注意
・現地の標識・メーター・チケットの表示が優先です。工事や行事で使えない日もあります。
・時間外は、ほとんどの区間で駐車禁止です。
・区間の情報は、各警察の公開情報をもとに当社が作成したもので、警察が提供するものではありません。

お問い合わせ：support@tesseras.jp
```

### キーワード（100文字まで。カンマ区切り・空白なし。名前とカテゴリの語は入れない）

```
パーキングメーター,パーキングチケット,路上駐車,駐車場,コインパーキング,時間制限駐車,駐車,タイマー,東京,大阪
```

### 新機能（最初のバージョンでは入れない）

## 3. App 内課金（非消耗型）

| 項目 | 入れる内容 |
|---|---|
| 参照名 | 有料プラン |
| 製品 ID | `jp.tesseras.parkingmetermap.pro` |
| 種類 | 非消耗型 |
| 価格 | 480円（Tier に相当する価格） |
| 表示名（30文字まで） | 有料プラン |
| 説明（45文字まで） | タイマーとお気に入りが使え、広告が出なくなります |
| 審査用のスクリーンショット | 有料プランのシート（タイマーかお気に入りを押したときの画面）を1枚 |
| 審査メモ | 地図の右下のタイマーかお気に入り（★）を押すと、購入のシートが出ます。 |

- ファミリー共有：オフ（`Products.storekit` と同じ）。
- 最初のアプリの審査に出すとき、この App 内課金もいっしょに選んで審査に出す。

## 4. 審査の情報（App Review に伝えること）

- サインイン：不要（アカウントの仕組みはありません）
- 連絡先：苔口 穂高／support@tesseras.jp／電話番号（決まったら）
- メモ（英語）：

```
MeterMap shows on-street parking meter / parking ticket zones in Tokyo, Osaka, Kanagawa, Sapporo and Kyoto on a map, with their hours, time limits and fees. No account is needed.

How to review:
- The map opens at the current location. If the device is outside Japan, search "Ginza" in the search field to see zones.
- In-app purchase (non-consumable, "有料プラン"): tap the timer button or the star button at the bottom right. The sheet shows the purchase button and "Restore purchases".
- Location is used only on the device to show nearby zones. Notifications are used only for the parking timer (10 minutes before and at the end).
- App Tracking Transparency is requested once, just before the first banner ad is shown (free users only).

The zone data is created by us from public information released by each prefectural police; it is not provided by the police.
```

## 5. App のプライバシー（App Store Connect の「App のプライバシー」）

本アプリ自身はサーバーを持たず、利用者の情報を集めない。申告が必要なのは、**広告（Google AdMob）の SDK が集めるもの**。Google の案内（AdMob の「Apple の App プライバシーに関する開示」）に合わせる。

**データを収集しますか？** → はい

| データの種類 | 集めるもの | 使いみち | ユーザに紐づくか | トラッキングに使うか |
|---|---|---|---|---|
| 位置情報 | おおよその位置（IP アドレスから） | サードパーティ広告、分析 | いいえ | いいえ |
| ID | デバイス ID（広告の識別子。トラッキングの許可があったときだけ） | サードパーティ広告 | いいえ | **はい** |
| 使用状況データ | 製品の操作、広告データ | サードパーティ広告、分析 | いいえ | **はい**（広告データ） |
| 診断 | クラッシュデータ、パフォーマンスデータ、その他の診断データ | 分析 | いいえ | いいえ |

申告しないもの（理由）：
- **正確な位置情報**：現在地は端末の中だけで使い、どこにも送らない（「収集」に当たらない）。
- **購入履歴**：決済は Apple が行い、当社は受け取らない。購入の確認は端末の中。
- **連絡先・名前・メールアドレス**：集めない（アカウントなし）。
- **検索内容**：地名の検索は国土地理院の地名検索に文字を送るが、当社も第三者も利用者と結びつけて保存しない。迷う場合は「検索履歴」を「App の機能・紐づかない・トラッキングなし」で申告してもよい。

## 6. 年齢制限の質問

すべて「なし」→ **4+**。
- 無制限の Web アクセス：なし（アプリの中にブラウザはない。外部のリンクは Safari で開く）
- ギャンブル・コンテストなど：なし

## 7. 輸出コンプライアンス

`Info.plist` に `ITSAppUsesNonExemptEncryption = NO` を入れてある（HTTPS だけを使う）。アップロードのたびの質問は出ない。

## 8. スクリーンショット

**必要なサイズ**：iPhone 6.9インチ（1320 × 2868 px、縦）。これを入れれば、ほかの iPhone のサイズは自動で使われる。3〜10枚。

**撮り方**（Mac）：
1. Xcode の機種の選び方で **iPhone 16 Pro Max**（6.9インチ）を選び、▶ で起動する。
2. シミュレーターの現在地を銀座にする（Features → Location → Custom Location…、緯度 35.6717・経度 139.7650）。
3. 時刻は平日の昼に撮る（緑の区間が多く見える）。
4. 撮りたい画面を出して、**⌘S**（File → Save Screen）。デスクトップに 1320 × 2868 の PNG ができる。
5. 有料プランの画面は、Xcode の StoreKit で購入した状態で撮る。広告が写らないように、有料プランの状態で撮るのがよい（広告はテスト表示になるため）。

**構成案**（上に入れるひとことは、あとで画像に重ねる）：

| # | 画面 | ひとこと |
|---|---|---|
| 1 | メイン：地図とカード（緑の区間が多いところ） | いま使える路上パーキングが、地図でひと目で |
| 2 | 詳細：利用時間・最大時間・料金・利用できる時間 | 利用時間・最大時間・料金を、すぐ確認 |
| 3 | 検索：駅名で探して、近い順のカード | 行き先の近くを、近い順に |
| 4 | タイマー：動いている円と残り時間 | 残り時間を数えて、10分前に通知（有料プラン） |
| 5 | お気に入りの一覧 | よく使う区間を保存（有料プラン） |
| 6 | 「ここへ行く」のシート | Apple マップ・Google マップですぐ案内 |

撮った PNG を送ってもらえれば、ひとことを重ねた App Store 用の画像に仕上げる。

## 9. 申請の前に残っていること

- [ ] 法人情報の変更（Apple Developer Program）の完了
- [ ] App Store Connect に「有料アプリ契約」・銀行口座・税の情報
- [ ] 本番の AdMob の ID（`Info.plist` の `GADApplicationIdentifier`・`config.js` の `admobBannerId`、`admobTesting: false`）と `SKAdNetworkItems` の一覧（docs/pro-ads.md §23 の 6）
- [ ] プライバシーポリシーに所在地を書き足す（変更登記の完了後）
- [ ] Sandbox の Apple ID で、実機で購入・復元を試す
- [ ] Xcode の Product → Archive → Distribute App で App Store Connect にアップロード
- [ ] Web 版（`index.html` の地図）をやめる：`privacy.html`・`support.html` だけを残す
