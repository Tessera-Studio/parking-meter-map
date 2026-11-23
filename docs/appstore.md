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

■ プレミアム（980円・買い切り）
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

1.0.1（ビルド 4）：

```
・検索で、パーキング・メーターの区間がある地域の地名だけを表示するようにしました。区間のない地域を検索したときは、その旨をお知らせします。
・区間のカードと詳細で、利用時間・最大時間・料金などを見やすくしました。
```

## 3. App 内課金（非消耗型）

| 項目 | 入れる内容 |
|---|---|
| 参照名 | プレミアム |
| 製品 ID | `jp.tesseras.parkingmetermap.pro` |
| 種類 | 非消耗型 |
| 価格 | 980円（2026年11月23日、最初の公開の前に 500円 から変更） |
| 表示名（30文字まで） | プレミアム |
| 説明（45文字まで） | タイマーとお気に入りが使え、広告が出なくなります |
| 審査用のスクリーンショット | プレミアムのシート（タイマーかお気に入りを押したときの画面）を1枚 |
| 審査メモ | 地図の右下のタイマーかお気に入り（★）を押すと、購入のシートが出ます。 |

- ファミリー共有：オフ（`Products.storekit` と同じ）。
- 最初のアプリの審査に出すとき、この App 内課金もいっしょに選んで審査に出す。

## 4. 審査の情報（App Review に伝えること）

- サインイン：不要（アカウントの仕組みはありません）。App Store Connect の「サインインが必要です」は**チェックを外す**（入れたままだと、審査でログイン情報を求められて止まる）
- 連絡先：苔口 穂高（ローマ字で Kokeguchi / Hodaka でもよい）／support@tesseras.jp／電話番号（国番号付き。+81 で始め、先頭の 0 を取る）。審査の担当者だけが見る
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
| ID | デバイス ID（広告の識別子。トラッキングの許可があったときだけ。ほかに、フォームの送りすぎを防ぐ端末ごとの番号） | サードパーティ広告、分析、App の機能 | いいえ | **はい** |
| 使用状況データ | 製品の操作、広告データ | サードパーティ広告、分析 | いいえ | **はい**（どちらも） |
| 診断 | クラッシュデータ、パフォーマンスデータ、その他の診断データ（フォームに付ける端末の情報も） | 分析（その他の診断データは App の機能も） | いいえ | いいえ |
| **ユーザコンテンツ**（追加） | カスタマーサポート（ご意見・不具合のフォームの内容） | App の機能 | **はい** | いいえ |
| **連絡先情報**（追加） | メールアドレス（フォームの返信先。任意） | App の機能 | **はい** | いいえ |

（Apple の「使用目的」には「カスタマーサポート」がなく、問い合わせへの対応は「App の機能」に入る。）

> **ご意見・不具合のフォーム（docs/feedback.md）はビルド 2 から入る。** 審査に出す前に、上の「追加」の2行と、ID・診断の「App の機能」を App Store Connect の「App のプライバシー」に足して公開し直す。tesseras.jp のプライバシーポリシーには、`privacy.html` の「6. ご意見・不具合の報告」と同じ節を2026年11月20日に足した（Tessera-Studio/tesseras-site#3）。

- 広告・診断の4行は、2026年11月18日に App Store Connect の「App のプライバシー」で公開した。フォームの分は、2026年11月20日に足して公開し直した。
- トラッキングは安全側で申告している（アプリはトラッキングの許可（ATT）を求めていて、広告 SDK はこれらを広告のターゲティングに使いうるため）。少なく申告すると審査で指摘されうるが、多く申告してもストアの表示が変わるだけ。
- 「ユーザに紐づく」は、広告・診断の分は「いいえ」（アカウントがなく、個人と結びつける仕組みがない）。フォームの内容とメールアドレスは「はい」（返信先のメールアドレスといっしょに保存されることがあるため。安全側の申告）。

申告しないもの（理由）：
- **正確な位置情報**：現在地は端末の中だけで使い、どこにも送らない（「収集」に当たらない）。
- **購入履歴**：決済は Apple が行い、当社は受け取らない。購入の確認は端末の中。
- **名前・電話番号など**：集めない（アカウントなし）。メールアドレスは、フォームで返信先を入れたときだけ（上の「連絡先情報」）。
- **検索内容**：地名の検索は国土地理院の地名検索に文字を送るが、当社も第三者も利用者と結びつけて保存しない。迷う場合は「検索履歴」を「App の機能・紐づかない・トラッキングなし」で申告してもよい。

## 6. 年齢制限の質問

すべて「なし」→ **4+**。
- 無制限の Web アクセス：なし（アプリの中にブラウザはない。外部のリンクは Safari で開く）
- ギャンブル・コンテストなど：なし

## 7. 輸出コンプライアンス

`Info.plist` に `ITSAppUsesNonExemptEncryption = NO` を入れてある（HTTPS だけを使う）。アップロードのたびの質問は出ない。

## 8. スクリーンショットとストアの画像

画像は `store-assets/` にある（作り直し方と Apple の決まりは [store-assets/README.md](../store-assets/README.md)）。

| App Store Connect の欄 | 入れるもの | 大きさ |
|---|---|---|
| Dynamic Island搭載iPhone（中型ディスプレイ） | `store-assets/iphone-6.3/01_いま使える.png` → `02_時間も料金も` → `03_目的地から` → `04_すぐ案内` → `05_タイマー` → `06_お気に入り`（この順） | 1206 × 2622 |
| プロダクトページのヘッダアセット | `store-assets/header_3840x1646.png` | 3840 × 1646 |
| 検索結果アセット | `store-assets/search_3840x2560.png` | 3840 × 2560 |
| App 内課金「プレミアム」の審査用 | 無料の状態でタイマーか★を押したときの購入シートを1枚（ストアには出ない） | — |

- 2026年11月の App Store Connect では、iPhone の基準の欄が「中型ディスプレイ」（1206 × 2622 か 1179 × 2556）。6.9インチ（1320 × 2868）は、この欄では「サイズが無効」になる。`store-assets/` の一番上にある 6.9インチ版は、大型ディスプレイの欄が出たとき用。
- 「iPhone Duo」の欄（外側 1398 × 2034、内側 2007 × 2853）は、いまは入れなくても提出できる。iOS 27.1 SDK 以降でビルドしたものは、2027年4月から必要になるという解説がある。iPad・Apple Watch の欄は、iPhone だけのアプリなので要らない。
- 画面を撮り直したときは、`store-assets/source/` の同じ名前の画像を置き換えて、スクリプトで作り直す。

## 9. 申請の前に残っていること

- [x] 法人への移行：Apple Developer Program の登録タイプが「組織」（Tessera Studio LLC）になった（2026年11月20日に確かめた。チーム ID は同じ）
- [x] App Store Connect の契約（無料・有料）・銀行口座・税の情報（W-8BEN-E）を会社名義で入れ直し、すべて「有効」になった（2026年11月20日）
- [x] App のプライバシーを App Store Connect で公開（§5）
- [x] App のプライバシーに、ご意見・不具合のフォームの分（§5 の「追加」と「App の機能」）を足して公開し直した（2026年11月20日）
- [x] `SKAdNetworkItems` を Google の一覧（50件）にした
- [x] アプリ内のプライバシーポリシー・サポートのリンクを tesseras.jp にした（`config.js`）
- [x] 本番の AdMob の ID（`Info.plist` の `GADApplicationIdentifier`・`config.js` の `admobBannerId`、`admobTesting: false`）（docs/pro-ads.md §23 の 6）
- [x] `https://tesseras.jp/app-ads.txt` を置いた（Tessera-Studio/tesseras-site）
- [ ] AdMob のアカウントの承認：2026年11月18日の時点で審査中。それまでは「Account not approved yet」で広告が届かない（バナーの枠はアプリが自動で閉じる）
- [ ] AdMob の支払いプロファイルを会社名義（合同会社Tessera Studio）にする
- [x] 手元の iPhone を AdMob の「テストデバイス」に登録した（Xcode の記録に「Ad inspector enabled」が出て、テストデバイスとして認識されていることを確かめた）
- [x] tesseras.jp のプライバシーポリシーの所在地・制定日（Tessera-Studio/tesseras-site）
- [x] tesseras.jp のプライバシーポリシーに「6. ご意見・不具合の報告」を足した（2026年11月20日。Tessera-Studio/tesseras-site#3）
- [x] 審査の連絡先の電話番号を入れた（App Store Connect で必須。公開はされない。§4）
- [x] プライバシーポリシーに所在地を書き足した
- [ ] Sandbox の Apple ID で、実機で購入・復元を試す
- [x] 1.0（ビルド 1）をアップロードした（2026年11月18日、Xcode 26.6・iOS 26.5 SDK）
- [x] 1.0（ビルド 2）をアップロードし、バージョン 1.0 のビルドを 1 から 2 に差し替えた（2026年11月20日、Xcode 26.6・iOS 26.5 SDK）。ご意見・不具合のフォーム、区間情報の訂正のボタン、お気に入りまわりの調整が入っている
  - 届いた警告はビルド 1 と同じ（ITMS-90725 の SDK の予告と、GoogleMobileAds・UserMessagingPlatform の dSYM）。どちらも提出には影響しない
- [ ] 審査に提出する：ビルド 2、App 内課金「プレミアム」、ストアの画像（§8）、審査の情報（§4）、**「手動でリリース」**
- [ ] 公開後：AdMob の管理画面の「アプリストアの詳細」で App Store のアプリとひもづける（AdMob が app-ads.txt を確かめてアプリを承認する）
- [x] 特定商取引法に基づく表記のページ（`https://tesseras.jp/legal`）を作った（2026年11月20日。Tessera-Studio/tesseras-site#4）
- [ ] アプリの購入シート・ヘルプから表記を開けるようにした（`config.js` の `legalUrl`・`legalPublished`。Tessera-Studio/parking-meter-map#53）。ビルド 2 には入っていないので、次のビルドから
- [ ] Web 版（`index.html` の地図）をやめる：`privacy.html`・`support.html` だけを残す

## 10. 公開までの流れ

2026年11月18日に、個人から組織への移行を Apple のデベロッパサポートに申請し、11月20日に完了した。Apple Developer Program の登録タイプは「組織」（Tessera Studio LLC、チーム ID `RS34B9UDRU` は同じ）。契約・銀行口座・税の情報も会社名義で「有効」なので、App Store の販売元は会社名になる。

1. **審査に出す**：ビルド 2 で、リリースの方法を「手動でリリース」にして提出する。
2. **承認されたら**（「デベロッパによるリリース待ち」）：バージョン 1.0 のページで「このバージョンをリリース」を押す。
3. **公開のあと**：AdMob の「アプリストアの詳細」で App Store のアプリとひもづける（§9）。

次のアップデートは、2027年4月より前に Xcode 27 以上に替えてからビルドする（ITMS-90725）。
