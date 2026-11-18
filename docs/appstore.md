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
| 著作権 | 2026 Tessera Studio LLC（「©」は App Store が付けるので入れない） |
| コンテンツ配信権 | 第三者のコンテンツを含み、必要な権利を持っている（警視庁オープンデータ CC BY 4.0、OpenStreetMap ODbL、国土地理院） |
| 配信国 | **日本だけ**（データが日本の5都市だけ。EU・英国で広告を出すのに要る同意画面（Google の UMP）を入れていない。EU の DSA のトレーダー申告も要らなくなる） |
| サポート URL | https://tesseras.jp/metermap/ |
| プライバシーポリシー URL | https://tesseras.jp/metermap/privacy |
| マーケティング URL | https://tesseras.jp/metermap/（AdMob の `app-ads.txt` を `https://tesseras.jp/app-ads.txt` に置くため、開発者サイトを tesseras.jp にしておく） |

- 名前は、ホーム画面の「メーターマップ」とそろえる。起動画面の英語表記は「MeterMap」。
- サポートとプライバシーポリシーのページは、会社サイト（リポジトリ Tessera-Studio/tesseras-site の `metermap/`）で公開する。リポジトリを Tessera-Studio に移したので、旧 URL（hodakamiwako-art.github.io）は使わない（GitHub Pages は移管後に転送されない）。
- アプリの「？」のメニューのリンクも同じ URL（`config.js` の `privacyUrl`・`supportUrl`）。このリポジトリの `support.html`・`privacy.html` は文面の元として残す。

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

■ プレミアム（500円・買い切り）
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
パーキングメーター,パーキングチケット,路上駐車,駐車場,コインパーキング,時間制限駐車,駐車,タイマー,東京,大阪,横浜,神奈川,京都,札幌
```

### 新機能（最初のバージョンでは入れない）

## 3. App 内課金（非消耗型）

| 項目 | 入れる内容 |
|---|---|
| 参照名 | プレミアム |
| 製品 ID | `jp.tesseras.parkingmetermap.pro` |
| 種類 | 非消耗型 |
| 価格 | 500円 |
| 表示名（30文字まで） | プレミアム |
| 説明（45文字まで） | タイマーとお気に入りが使え、広告が出なくなります |
| 審査用のスクリーンショット | プレミアムのシート（タイマーかお気に入りを押したときの画面）を1枚 |
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
- In-app purchase (non-consumable, "プレミアム"): tap the timer button or the star button at the bottom right. The sheet shows the purchase button and "Restore purchases".
- Location is used only on the device to show nearby zones. Notifications are used only for the parking timer (10 minutes before and at the end).
- App Tracking Transparency is requested once, just before the first banner ad is shown (free users only; the banner is at the bottom of the screen).
- Banner ads may not appear during review because our AdMob account is still pending approval; the App Tracking Transparency prompt is still shown before the first ad request.

The zone data is created by us from public information released by each prefectural police; it is not provided by the police.
```

## 5. App のプライバシー（App Store Connect の「App のプライバシー」）

本アプリ自身はサーバーを持たず、利用者の情報を集めない。申告が必要なのは、**広告（Google AdMob）の SDK が集めるもの**。Google の案内（AdMob の「Apple の App プライバシーに関する開示」）に合わせる。

**データを収集しますか？** → はい

| データの種類 | 集めるもの | 使いみち | ユーザに紐づくか | トラッキングに使うか |
|---|---|---|---|---|
| 位置情報 | おおよその位置（IP アドレスから） | サードパーティ広告、分析 | いいえ | **はい** |
| ID | デバイス ID（広告の識別子。トラッキングの許可があったときだけ） | サードパーティ広告、分析 | いいえ | **はい** |
| 使用状況データ | 製品の操作、広告データ | サードパーティ広告、分析 | いいえ | **はい**（どちらも） |
| 診断 | クラッシュデータ、パフォーマンスデータ、その他の診断データ | 分析 | いいえ | いいえ |

- この表の内容で、2026年11月18日に App Store Connect の「App のプライバシー」を公開した。
- トラッキングは安全側で申告している（アプリはトラッキングの許可（ATT）を求めていて、広告 SDK はこれらを広告のターゲティングに使いうるため）。少なく申告すると審査で指摘されうるが、多く申告してもストアの表示が変わるだけ。
- 「ユーザに紐づく」はすべて「いいえ」（アカウントがなく、個人と結びつける仕組みがない）。

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
5. プレミアムの画面は、Xcode の StoreKit で購入した状態で撮る。広告が写らないように、プレミアムの状態で撮るのがよい（広告はテスト表示になるため）。

**構成案**（上に入れるひとことは、あとで画像に重ねる）：

| # | 画面 | ひとこと |
|---|---|---|
| 1 | メイン：地図とカード（緑の区間が多いところ） | いま使える路上パーキングが、地図でひと目で |
| 2 | 詳細：利用時間・最大時間・料金・利用できる時間 | 利用時間・最大時間・料金を、すぐ確認 |
| 3 | 検索：駅名で探して、近い順のカード | 行き先の近くを、近い順に |
| 4 | タイマー：動いている円と残り時間 | 残り時間を数えて、10分前に通知（プレミアム） |
| 5 | お気に入りの一覧 | よく使う区間を保存（プレミアム） |
| 6 | 「ここへ行く」のシート | Apple マップ・Google マップですぐ案内 |

撮った PNG を送ってもらえれば、ひとことを重ねた App Store 用の画像に仕上げる。

## 9. 申請の前に残っていること

- [ ] 法人情報の変更（Apple Developer Program）：いまの登録タイプは「個人」。個人から組織への切り替えを2026年11月18日に申請済みで、Apple の返事待ち（§10）
- [x] App Store Connect に「有料アプリ契約」・銀行口座・税の情報（いまは個人名義。切り替えのあと会社名義で入れ直す。§10）
- [x] App のプライバシーを App Store Connect で公開（§5）
- [x] `SKAdNetworkItems` を Google の一覧（50件）にした
- [x] アプリ内のプライバシーポリシー・サポートのリンクを tesseras.jp にした（`config.js`）
- [x] 本番の AdMob の ID（`Info.plist` の `GADApplicationIdentifier`・`config.js` の `admobBannerId`、`admobTesting: false`）（docs/pro-ads.md §23 の 6）
- [x] `https://tesseras.jp/app-ads.txt` を置いた（Tessera-Studio/tesseras-site）
- [ ] AdMob のアカウントの承認：2026年11月18日の時点で審査中。それまでは「Account not approved yet」で広告が届かない（バナーの枠はアプリが自動で閉じる）
- [x] 手元の iPhone を AdMob の「テストデバイス」に登録した（Xcode の記録に「Ad inspector enabled」が出て、テストデバイスとして認識されていることを確かめた）
- [x] tesseras.jp のプライバシーポリシーの所在地・制定日（Tessera-Studio/tesseras-site）
- [ ] 審査の連絡先の電話番号（App Store Connect で必須。公開はされない）
- [x] プライバシーポリシーに所在地を書き足した
- [ ] Sandbox の Apple ID で、実機で購入・復元を試す
- [x] `npm ci` → `npm run sync` のあと、Product → Archive → Distribute App で App Store Connect にアップロードした（2026年11月18日、1.0（ビルド 1）、Xcode 26.6・iOS 26.5 SDK）
  - 届いた警告 ITMS-90725：2027年4月からは iOS 27 SDK（Xcode 27 以上）でビルドしたものしかアップロード・提出できない。今回のビルドはそのまま審査に出せる
- [ ] 審査に提出する：ビルドを選ぶ、App 内課金「プレミアム」を追加、審査の情報（§4）、**「手動でリリース」**にする
- [ ] 公開後：AdMob の管理画面の「アプリストアの詳細」で App Store のアプリとひもづける（AdMob が app-ads.txt を確かめてアプリを承認する）
- [ ] Web 版（`index.html` の地図）をやめる：`privacy.html`・`support.html` だけを残す

## 10. 公開までの流れ（法人への切り替え待ち）

いまの Apple Developer Program の登録タイプは「個人」（チーム ID `RS34B9UDRU`）。このまま公開すると、App Store の販売元は個人名になり、売上も個人名義の口座に入る。プライバシーポリシー・サポート・特商法の表記は「合同会社Tessera Studio」なので、**切り替えが終わってから公開する**。

1. **審査には先に出す**：リリースの方法を「手動でリリース」にして提出する。承認されると「デベロッパによるリリース待ち」で止まる。
2. **切り替えが終わったら（Apple から連絡が来たら）**
   - developer.apple.com の「メンバーシップの詳細」で、登録タイプが「組織」、名前が会社名になったことを確かめる。チーム ID は変わらない（アップロードしたビルドや App Store Connect の設定はそのまま）。
   - App Store Connect の「ビジネス」で、有料アプリ契約・銀行口座・税の情報（W-8BEN-E）を会社名義で入れ直す。新しい契約への同意を求められたら同意する。
   - AdMob の支払いプロファイルも会社名義にそろえる。
3. **公開する**：バージョン 1.0 のページで「このバージョンをリリース」を押す。
4. **公開のあと**：AdMob の「アプリストアの詳細」で App Store のアプリとひもづける（§9）。

次のアップデートは、2027年4月より前に Xcode 27 以上に替えてからビルドする（ITMS-90725）。
