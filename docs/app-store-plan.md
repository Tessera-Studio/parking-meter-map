# App Store に出すまで（商号変更のあいだの進め方）

**状況**：Apple Developer Program は法人で登録済み。商号・本店の変更登記を申請中（2026-10-12）。変更後の名前は「合同会社Tessera Studio」、アプリ ID は `jp.tesseras.parkingmeter`。

**方針**

- 同じ会社の商号変更なので、**いまのアカウントのまま進めてよい**。名前が変わってもアカウント・アプリ・アプリ ID・審査の履歴はそのまま引き継がれる
- App Store の「販売元」には、Apple に登録してある会社名が出る。**公開（審査に出すこと）だけは、Apple 側の名前が変わってから**にする
- 最初の版（1.0）は **Pro なしの無料**で出す。Pro（アプリ内課金）は、有料 App の契約に口座の名義が関わるので、名前が変わってから 1.1 で足す

```
いま ───────────────► 登記完了 ──► D-U-N-S 更新 ──► Apple の名前変更 ──► 1.0 を審査へ ──► 1.1（Pro）
 A. Mac で動かす                                                     （privacy.html を公開）
 B. App Store Connect に登録・TestFlight
```

---

## A. いますぐ：Mac で動かす

```bash
git pull && npm install
npm run ios        # www/ を作って Xcode を開く
```

1. Xcode の上のバーで、シミュレーター（iPhone 17 Pro Max など）を選んで ▶。アカウントがなくても動く
2. 自分の iPhone で動かす：App ターゲット → Signing & Capabilities → Team にいまのチームを選ぶ（「Automatically manage signing」はオンのまま）。iPhone を USB でつなぎ、デベロッパモードをオンにして ▶
3. 確かめること

| # | 確かめること | 期待すること |
|---|---|---|
| 1 | 初めて開く | 位置情報の許可を1回だけ聞かれ、現在地のまわりが出る |
| 2 | ホーム画面 | アイコンが青地に白い P、名前が「メーターマップ」 |
| 3 | カードの時計 → 「終わる10分前に知らせる」をオン → スタート | 通知の許可を聞かれる |
| 4 | 最大時間の短い区間（または端末の時刻を進めて）でアプリを閉じて待つ | 10分前と時間切れに通知が届く |
| 5 | タイマーを止める | 予約した通知が消える（届かない） |
| 6 | 「ここへ行く」→ Apple マップ | マップのアプリが開き、経路が出る |
| 7 | 「？」→ 出典のリンク | Safari が開く（アプリの中では開かない） |
| 8 | 機内モードで開き直す | 区間・タイマーは出る（地図の画像は前に見た範囲だけ） |

4. スクリーンショット：`npx playwright install chromium`（初回だけ）→ `npm run build && npm run screenshots`。`store/screenshots/ja/` に6枚できる（docs/store-listing.md）

**Xcode の設定（済み）**

| 項目 | 値 | 理由 |
|---|---|---|
| 対応機種 | iPhone のみ | iPad 用のスクリーンショットと iPad での審査が要らなくなる |
| 画面の向き | 縦のみ | 横向きの iPhone では地図とカードが窮屈になる |
| ホーム画面の名前 | メーターマップ | 「パーキング・メーター・マップ」はホーム画面で途中が切れる。App Store での名前は別に付ける |
| 暗号化の申告 | 使っていない（`ITSAppUsesNonExemptEncryption = NO`） | 上げるたびの輸出コンプライアンスの質問が出なくなる。通信の HTTPS は対象外 |
| バージョン | 1.0（ビルド 1） | 上げ直すたびにビルド番号を1つ増やす |
| 対応 iOS | 15.0 以上 | Capacitor 8 の最低 |

## B. いますぐ：App Store Connect に登録して TestFlight で試す（公開はしない）

1. **アプリを作る**：App Store Connect →「アプリ」→ ＋ → 新規 App
   - プラットフォーム iOS、名前「パーキング・メーター・マップ」、プライマリ言語「日本語」、バンドル ID `jp.tesseras.parkingmeter`（A-2 で Xcode が登録したもの）、SKU `pmm-ios`
   - **アプリ名はここで押さえられる**（ほかの人が同じ名前を使えなくなる）。名前が使われていたら、docs/store-listing.md の候補を変える
2. **ビルドを上げる**：Xcode で「Any iOS Device (arm64)」を選ぶ → Product → Archive → Distribute App → App Store Connect
3. **TestFlight**：上げたビルドが処理されたら、「内部テスト」に自分と社内の人を足す。審査なしで、TestFlight アプリから入れられる
4. **掲載情報を入れておく**（審査には出さない）：docs/store-listing.md から
   - 説明・キーワード・サブタイトル・プロモーション用テキスト・スクリーンショット
   - カテゴリ（ナビゲーション／旅行）、年齢制限（質問にはすべて「なし」→ 4+）、価格（無料）、配信地域（日本。英語の説明を出すなら全地域でもよい）
   - App のプライバシー：1.0 は「データを収集していない」
   - サポート URL：Web 版の `support.html`（このブランチで作成。main にマージすると GitHub Pages で公開される）
   - プライバシーポリシー URL：まだ入れられない（下の C-4）

外部テスト（社外の人に TestFlight で配る）は審査があり、テスターに会社名が見えるので、名前が変わってからにする。

## C. 商号変更の手続き（Apple まわり）

1. **登記の完了**を待ち、履歴事項全部証明書を取る
2. **D-U-N-S 番号の情報を更新**：日本の窓口は東京商工リサーチ（TSR）。Apple の [D-U-N-S 番号の検索](https://developer.apple.com/enroll/duns-lookup/)で、新しい商号・所在地で出るか確かめ、古いままなら TSR に変更を届け出る。反映まで数日〜数週間かかることがある
3. **Apple に名前の変更を頼む**：[Apple Developer のお問い合わせ](https://developer.apple.com/contact/)から「メンバーシップとアカウント」→ 組織名の変更。D-U-N-S 番号の情報が新しくなってから。証明書の提出を求められることがある
4. **公開するページ**：`docs/drafts/privacy.html` の所在地を埋めて一番上に移し、公開する（docs/pro-ads.md §18）。その URL を App Store Connect の「プライバシーポリシー URL」に入れる。`support.html` からもリンクする
5. 銀行口座の名義変更が済んだら、App Store Connect の「ビジネス」（契約・税金・口座）の口座も新しい名義にする（Pro を売るときに必要）

## D. 名前が変わったら：1.0 を審査に出す

1. App Store Connect の画面右上・アカウントの表示で、新しい会社名になっていることを確かめる
2. 最新のビルドを選び、審査メモ（docs/store-listing.md）を貼って「審査へ提出」
3. 審査はふつう1〜2日。リリースは「手動でリリース」にしておくと、通ったあとに日を選べる
4. Web 版（GitHub Pages）の「？」に App Store へのリンクを足す

## E. 1.1：Pro（アプリ内課金）

docs/native-app.md の「Pro をアプリ内課金で売る」。有料 App の契約（口座・税金）→ 商品 `pmm_pro` → RevenueCat → `config.js` の `nativeProEnabled: true` → 審査に商品といっしょに出す。
App Store Small Business Program（手数料 15%）にも申し込む。

---

## 名前が変わるまでに決めておくこと

- [ ] App Store での名前（「パーキング・メーター・マップ」で取れるか、B-1 で確かめる）
- [ ] ホーム画面の名前（いまは「メーターマップ」。変えるなら `ios/App/App/Info.plist` の `CFBundleDisplayName`）
- [ ] 本店の所在地（privacy.html・legal.html に書く）
- [ ] 公開する Web 版の URL（GitHub Pages のままか、独自ドメインに移すか。サポート URL とプライバシーポリシー URL がこれになる）
