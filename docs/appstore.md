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
- サポート・プライバシーポリシー・特定商取引法に基づく表記のページと `app-ads.txt` は、会社サイト tesseras.jp で公開する（`/metermap/`・`/metermap/privacy`・`/legal`・`/app-ads.txt`）。
  - 2026年11月26日から、tesseras.jp は別の Claude のセッションで作った新しいサイトで公開している（リポジトリ Tessera-Studio/tesseras-site は元の文面として残しているが、表には出ていない）。
  - 新しいサイトに切り替えたとき、この4つの URL がすべてトップページになり、App Store・AdMob・アプリ内のリンクが開けなくなった。同じ日に新しいサイトの側で足して直した。**直すときは新しいサイトの側を直し、4つの URL を消さない。**
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

1.0 は公開しないまま 1.0.1（ビルド 5）が最初の公開版になったので、次の文面は使っていない（次のアップデートの参考）：

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
| 審査用のスクリーンショット | 購入シート（タイマーかお気に入りを押したときの画面。¥980 の表示）を1枚。**必須**（ないと App 内課金を審査に出せない） |
| 審査メモ | 下の英文 |

- ファミリー共有：オフ（`Products.storekit` と同じ）。
- 最初のアプリの審査に出すとき、この App 内課金もいっしょに選んで審査に出す。バージョンのページの「App 内課金とサブスクリプション」で選び、「提出物の下書き」にアプリのバージョンと App 内課金の**両方**が並んでから「審査へ提出」を押す。
- 1.0（ビルド 3）は、App 内課金を審査に出していなかったためリジェクトされた（ガイドライン 2.1(b)、2026年11月23日）。

審査メモ（App 内課金）：

```
Non-consumable purchase that unlocks the parking timer, favorites, and removes ads.
To find it: tap the timer button or the star button at the bottom right of the map. The purchase sheet opens with the price (¥980) and the purchase button. "Restore purchases" is in the same sheet and in Help (ⓘ at the top right).
```

## 4. 審査の情報（App Review に伝えること）

- サインイン：不要（アカウントの仕組みはありません）。App Store Connect の「サインインが必要です」は**チェックを外す**（入れたままだと、審査でログイン情報を求められて止まる）
- 連絡先：苔口 穂高（ローマ字で Kokeguchi / Hodaka でもよい）／support@tesseras.jp／電話番号（国番号付き。+81 で始め、先頭の 0 を取る）。審査の担当者だけが見る
- メモ（英語。2026年11月24日に 1.0.1（ビルド 5）で出し直したときのもの）：

```
Thank you for your previous review. In this submission:
- We have submitted the In-App Purchase "プレミアム" (product ID: jp.tesseras.parkingmetermap.pro, non-consumable, ¥980) for review together with the app, including the App Review screenshot.
- We have uploaded a new build, version 1.0.1 (5).

About the app:
MeterMap shows on-street parking meter / parking ticket zones in Tokyo, Osaka, Kanagawa, Sapporo and Kyoto on a map, with their hours, time limits and fees. No account or sign-in is needed.

How to review:
- The map opens at the current location. If the device is outside Japan, type "Ginza" in the search field at the top and select a result to see zones.
- In-App Purchase: tap the timer button or the star button at the bottom right of the map. The purchase sheet shows the price, the purchase button and "Restore purchases". "Restore purchases" is also available from the ⓘ button (Help) at the top right.
- Premium unlocks the parking timer (with notifications 10 minutes before and at the end), favorites, and removes ads.
- Location is used only on the device to show nearby zones. Notifications are used only for the parking timer.
- App Tracking Transparency is requested once, just before the first banner ad is shown (free users only). Banner ads are served by Google AdMob; until the app is published and linked in AdMob, ads may not always be filled.
- "Send feedback" in Help sends the message to our support spreadsheet (Google Sheets). The reply email address is optional.

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
- 位置情報の共有（ほかの利用者に位置を知らせられるか）：いいえ（現在地は端末の中だけで使う）
- 出会い系（知らない人と出会う・交流する機能）：いいえ
  - この2つは2026年11月に足された質問。2027年1月15日までは任意だが、新しいアプリを出すときは答える必要がある

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

## 9. 公開までの作業

- [x] 法人への移行：Apple Developer Program の登録タイプが「組織」（Tessera Studio LLC）になった（2026年11月20日に確かめた。チーム ID は同じ）
- [x] App Store Connect の契約（無料・有料）・銀行口座・税の情報（W-8BEN-E）を会社名義で入れ直し、すべて「有効」になった（2026年11月20日）
- [x] App のプライバシーを App Store Connect で公開（§5）。ご意見・不具合のフォームの分も足して公開し直した（2026年11月20日）
- [x] `SKAdNetworkItems` を Google の一覧（50件）にした
- [x] アプリ内のプライバシーポリシー・サポート・特定商取引法に基づく表記のリンクを tesseras.jp にした（`config.js`）
- [x] AdMob：会社のアカウント（`pub-4938846991161247`）の ID にした（2026年11月20日。docs/pro-ads.md §16）。アカウントは承認済み
  - 前のアカウント（`pub-8846614684110251`）の ID は、公開しなかった 1.0 のビルド 1〜3 にだけ入っていた
- [x] `https://tesseras.jp/app-ads.txt` を会社のアカウントの行だけにした（Tessera-Studio/tesseras-site）
- [x] 手元の iPhone を、会社の AdMob アカウントの「テストデバイス」に登録した（広告に「Test mode」と出ることを確かめた）
- [ ] AdMob の支払いプロファイルが会社名義（合同会社Tessera Studio）になっているか確かめる
- [x] tesseras.jp のプライバシーポリシー（所在地・制定日・「6. ご意見・不具合の報告」）
- [x] 特定商取引法に基づく表記のページ（`https://tesseras.jp/legal`。Tessera-Studio/tesseras-site#4）。アプリの購入シート・ヘルプから開ける（1.0.1 から）
- [x] プレミアムの価格を 980円 にした（App Store Connect・アプリの予備の表示・サイト。2026年11月23日）
- [x] 審査の連絡先の電話番号を入れた（§4）
- [x] 年齢制限の追加の質問（位置情報の共有・出会い系）に答えた（§6）
- [ ] Sandbox の Apple ID で、実機で購入・復元を試す
- ビルドの記録（どれも Xcode 26.6・iOS 26.5 SDK。届く警告は ITMS-90725 の SDK の予告と、GoogleMobileAds・UserMessagingPlatform の dSYM で、提出には影響しない）
  - [x] 1.0（ビルド 1〜3）：アップロード。ビルド 3 で審査に出したが、App 内課金を出していなかったためリジェクト（2026年11月23日）。取り下げて、公開はしていない
  - [x] 1.0.1（ビルド 4）：検索の改善、カード・詳細の見た目の調整
  - [x] 1.0.1（ビルド 5）：プレミアムの予備の価格表示を 980円 に
- [x] バージョンの番号を 1.0 から 1.0.1 に変え、ビルド 5 と App 内課金「プレミアム」をいっしょに審査に出した（2026年11月24日）
- [x] 承認され、公開した。2026年11月26日に App Store Connect で「配信準備完了」（配信中）を確かめた。ストアのページ：https://apps.apple.com/jp/app/id6824193037
- [x] AdMob：会社のアカウント（`pub-4938846991161247`）のメーターマップを App Store のアプリとひもづけた（Store ID 6824193037。2026年11月26日）
- [ ] AdMob の app-ads.txt の確認（Verify app）を通す：2026年11月26日に一度失敗（tesseras.jp が新しいサイトに変わり、`/app-ads.txt` もトップページを返していたため）。新しいサイトに足したあと「Check for updates」で確かめ直す。通ると AdMob の審査が始まり、配信の制限（Limited ad serving）が外れる
  - 前のアカウント（`pub-8846614684110251`）のメーターマップは使わない（App visibility で非表示にしておく）
- [ ] Web 版（`index.html` の地図）をやめる：`privacy.html`・`support.html` だけを残す

## 10. 公開までの流れ（2026年11月に公開済み）

2026年11月18日に、個人から組織への移行を Apple のデベロッパサポートに申請し、11月20日に完了した。Apple Developer Program の登録タイプは「組織」（Tessera Studio LLC、チーム ID `RS34B9UDRU` は同じ）。契約・銀行口座・税の情報も会社名義で「有効」なので、App Store の販売元は会社名になる。

最初の公開版は **1.0.1（ビルド 5）**。1.0 は審査でリジェクトされ、取り下げたまま公開していない。

1. **審査**：1.0.1（ビルド 5）と App 内課金「プレミアム」を、2026年11月24日に審査に出し、承認された。
2. **公開**：バージョン 1.0.1 を公開した。2026年11月26日に「配信準備完了」（配信中）を確かめた。ストアのページは https://apps.apple.com/jp/app/id6824193037（App Apple ID 6824193037）。tesseras.jp/metermap からもリンクしている。
3. **公開のあと**：AdMob の「Add store」で App Store のアプリとひもづける（§9）。ストアのページで、販売元・画像・説明文・価格（980円）を確かめる。

次のアップデートは、バージョンを 1.0.2 などに上げ、「このバージョンの新機能」を書いて出す。2027年4月より前に Xcode 27 以上に替えてからビルドする（ITMS-90725）。
