# パーキング・メーター・マップ / Tokyo Parking Meter Map

東京・大阪・神奈川・札幌・京都のパーキング・メーター／パーキング・チケットの設置区間 **915区間**（東京752・神奈川107・大阪41・札幌10・京都5）を、地図と「近い順」の一覧で探せるアプリです。

**iPhone・Android のアプリ**として出します（Capacitor。Web 版はやめる予定）。動かし方は [docs/app.md](docs/app.md)。

## できること

地図が主役の1画面です。「この辺で、いま使える区間はどこか」に答えます。画面の詳しい決まりは [docs/design-v2.md](docs/design-v2.md)。

- **地図**：色を抑えた明るいベクトル地図（OpenFreeMap）。端末がダークテーマでも、地図・カードとも明るいままです
- **開いたとき**：すぐ現在地のまわりを出します（位置情報が使えないときは前回見ていた場所、なければ銀座）
- **区間の線**：**緑＝いま使える／赤＝時間外／グレーの破線＝時間が公開されていない（神奈川など）**。選んだ区間は黄色の線と大きなPマーク。寄った地図（縮尺17以上）では全区間に小さなPマークを出します。曜日・祝日・正月・札幌の冬期休止まで見て、1分ごとに見直します（祝日は `data/holidays.json`）
- **カード**（スマホは下で横にめくる、広い画面は左）：地図の中心から1km以内の区間を、緑を近い順、その後に時間外を近い順で。区間名（Pの色で状態）と右に料金、利用時間・最大時間・除外日（アイコン付き・同じ幅）、「ここへ行く」「詳細」のボタン
- **詳細**：利用時間・最大・料金、曜日ごとの時間と除外、車種、出典、Apple／Google マップで経路を開くボタン。スクロールせずに収まる高さで、右上の「×」で閉じる
- **ここへ行く**：初回だけ Apple マップか Google マップかを選び、次からはすぐその地図で案内します
- **行き先**：地名・駅名を入れると、その場所のまわり400mの円を出し、距離を行き先から測ります。空欄のときは「エリアへ移動」（札幌・東京・神奈川・京都・大阪）と最近探した場所
- **タイマー**：右下（現在地の上）のストップウォッチのボタンから。停めた区間の最大時間で残り時間を数え、ボタンにも残り時間を出します。残り10分で赤、時間を過ぎたら「時間切れ」と超えた時間（−12分など）。終わる10分前と時間になったときに iPhone の通知で知らせ、車の場所に地図を戻せます
- **「？」**：よくある質問、データ・地図の出典、お問い合わせ

見た目は白い角丸のカードに薄い影。色は緑（使える）・赤（時間外）・グレー（時間不明）・黄（選んだ区間）だけです。

**広告**：無料のときは、画面の一番下に AdMob のバナー（いまはテスト用の ID）。

**有料プラン（500円・買い切り）**：タイマー・お気に入り・広告なし。購入は App Store のアプリ内課金（StoreKit 2）で、サーバーは使いません。無料のときはボタンが鍵付きで見え、押すと説明と購入のシートが出ます（[docs/pro-ads.md](docs/pro-ads.md)）。シミュレーターでの試し方は [docs/app.md](docs/app.md)、販売までの手順は docs/pro-ads.md §23。

## データ

### 東京（752区間）

警視庁「[時間制限駐車区間案内地図](https://parking-meter.jp/)」の[オープンデータ](https://parking-meter.jp/open-data)を使っています（[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)）。

| 項目 | 内容 |
|---|---|
| 区間数 | 752（メーター634・チケット118） |
| 属性 | 利用時間・制限時間・手数料・制限事項・種別・車種 |
| 属性の更新日 | 2026年4月1日（CSV） |
| 線の形 | 2025年10月1日版（KML） |

**区間の名前や住所は元データに入っていません。** そこで `build/build.py --geocode` で各区間の線のまん中の点を
国土地理院の逆引きにかけ、「区市町村」「町名」「町丁目」を足しています（結果は `build/source/geocode.json` に保存）。
住所のない区間は、詳細を開いたときにその場で逆引きします。

⚠️ 現地の標識・メーターの表示が優先されます。利用時間外は駐車できないことがあり、工事や行事で使えない場合もあります。

### 大阪（41区間）

大阪府警察「[パーキング・チケット発給設備設置状況](https://www.police.pref.osaka.lg.jp/kotsu/tyusya/1/1/index.html)」（12警察署）の表を使っています。
大阪はすべてパーキング・チケットで、手数料300円・同じ場所に続けて1時間までです（府警の案内による）。

府警は座標を公開しておらず、区間は「深里橋交差点から京町堀1丁目交差点まで」のように言葉で書かれています。
そこで `build/osaka.py` で、両端を OpenStreetMap の交差点名・橋・国土地理院の住所検索から求め、
その間を OSM の道路網でたどって線にしました。自動で決まらない・ずれる17区間の端点は、各署の設置地図（画像）と
OSM の道路を見比べて `MANUAL` に書いています。

⚠️ 大阪の線は府警の地図から起こしたもので、**枠の正確な位置（道路のどちら側か、交差点付近の切れ目など）までは表していません**。
現地の標識と枠線で確かめてください。大阪の線は OpenStreetMap から作っているため、© OpenStreetMap contributors（ODbL）です。

```bash
python3 build/osaka.py fetch                   # 府警のページから表を取り直す
python3 build/osaka.py geometry osaka.osm.pbf  # 線を作り直す（osaka.osm.pbf の作り方は osaka.py の冒頭）
python3 build/build.py --geocode               # 東京と合わせて data/zones.geojson を作る（新しい区間の住所も逆引き）
```

### 札幌（10か所）・京都（5か所）

北海道警察「[パーキング・チケット](https://www.police.pref.hokkaido.lg.jp/info/koutuu/p-ticket/p-ticket.html)」と
京都府警察「[パーキング・メーター、パーキング・チケット](https://www.pref.kyoto.jp/fukei/site/chutai_c/tiket_meter/)」の一覧を使っています。
どちらも「南1条西13丁目（札幌南一条病院西側）」「紫明通（烏丸通西入る南側）」のように目印で書かれているので、
`build/landmarks.py` で、OSM の建物の輪郭の指定の辺に面した道路（または交差点から指定の向き）に、枠数×6m の線を引いています。
一覧は `landmarks.py` の `REGIONS` に写してあり、県警のページが変わったら手で直します。

- 札幌の一般用8か所は **4月1日〜11月30日のみ**（冬期休止）。「いま使える」は冬期には外れます。丸井今井・三越の2か所は通年の**貨物車（積載量5トン未満）専用**です
- 札幌の「場所」は道警の住所をそのまま出しています
- ⚠️ 県警の地図がないため、線の中ほどは合っていても**端の位置は数十mずれうる**目安です

```bash
python3 build/landmarks.py sapporo sapporo.osm.pbf
python3 build/landmarks.py kyoto kyoto.osm.pbf
python3 build/build.py --geocode
```

### 神奈川（107区間）

神奈川県警察「[パーキング・メーター等の設置場所](https://www.police.pref.kanagawa.jp/kotsu/ihochusha/mesf1080.html)」は地区ごとの地図（画像）だけで、
通り名・交差点名・時間帯・曜日が書かれていません。地図は複製禁止なので、`build/kanagawa.py` では
地図を「どの通りのどこからどこまでか」を知るためだけに使い、線はすべて OpenStreetMap の道路から作っています
。
区間の少ない地区は地図の建物・駅・交差点と OSM を見比べて両端を座標で書き、区間の多い関内・伊勢佐木は
**地図の色付きの線の画素が OSM の道路に最もよく重なる変換（拡大・回転・平行移動）を自動で求めて**（平均のずれ 7m 前後）、
地図上の両端をその変換で経度・緯度に直しています。

- 鶴見2・横浜駅5・港南台6・天王町1・本郷台2・鷺沼2・平塚7・藤沢1・山下町／元町4・関内46・伊勢佐木／南31
- 時間帯・曜日が不明なので**灰色の線**で表示し、「いま使える」「曜日」「時間帯」の絞り込みでは外れます
- ⚠️ 端の位置は数十mずれうる目安です

```bash
python3 build/kanagawa.py kanagawa.osm.pbf
python3 build/build.py --geocode
```

### データの更新

```bash
python3 build/build.py --fetch --geocode   # 取り直して、新しい区間の住所を逆引きしてから作る
python3 build/build.py --fetch   # parking-meter.jp から取り直して data/zones.geojson を作る
python3 build/build.py           # build/source/ の手元の元データから作り直す
python3 build/build.py --holidays   # 内閣府の祝日一覧から data/holidays.json を作り直す（年に一度）
```

線の形は KML、属性は CSV から取ります（同じ識別idでは更新が新しい CSV を優先）。
ダウンロードページには GeoJSON 版もありますが、2026年9月時点でリンク切れのため KML を使っています。

## 構成

```
package.json      アプリ（Capacitor）のコマンド。npm run ios / npm run android
capacitor.config.json  アプリの ID・名前
ios/ android/     アプリのプロジェクト（docs/app.md）
scripts/build-www.mjs  画面のファイルを www/ にまとめる
index.html        画面
app.js            アプリ本体（Leaflet）
zones.js          GeoJSON をアプリの形にそろえる
styles.css        スタイル（いつも明るい配色）
config.js         設定（有料プランの販売・App Store の商品 ID・広告）
basemap.js        地図の下地（ベクトル地図）の配色とラベル
pro.js            有料プラン（App Store の購入）・お気に入り・広告・「このアプリについて」
docs/drafts/      特定商取引法に基づく表記・プライバシーポリシーの下書き（公開前）
data/zones.geojson  752区間（build/build.py が作る）
data/holidays.json  祝日一覧（「いま使える」の判定に使う）
build/            データを作るスクリプトと元データ
vendor/           Leaflet 1.9.4
```

画面のファイル（`*.css` / `*.js`）を変えたら、コミット前に `python3 build/stamp.py` を実行してください。
`index.html` の読み込み先に中身から作った版番号（`?v=…`）が付き、公開後に古いファイルが混ざらなくなります。
（GitHub Pages はファイルを10分間キャッシュさせるので、更新直後は再読み込みが必要なことがあります）

画面だけを確かめるときは、`python3 -m http.server 4173` を実行し、http://localhost:4173/ を開きます。アプリとして動かすときは [docs/app.md](docs/app.md)。

## 地図の下地について

下地は [OpenFreeMap](https://openfreemap.org/)（OpenMapTiles／OpenStreetMap）のベクトル地図を、
[MapLibre GL JS](https://maplibre.org/) で描いています（`vendor/` に同梱）。鍵は不要です。
配色とラベルは `basemap.js` で決めています（いつも明るい配色）。

地図は1種類で、地名・駅名・大きな道の名前だけを出します（区間の線とPマークが目立つように）。出典は地図の上に出さず、右上の「？」のメニューにまとめています。

WebGL が使えない端末や、地図の配信につながらないときは、国土地理院の淡色地図（画像）に切り替わります。

## 出典

- 区間データ（東京） — 警視庁 時間制限駐車区間案内地図 オープンデータ（CC BY 4.0）
- 区間データ（大阪） — 大阪府警察 パーキング・チケット発給設備設置状況。線は OpenStreetMap（ODbL）から作成
- 区間データ（札幌・京都） — 北海道警察・京都府警察の設置場所一覧。線は OpenStreetMap（ODbL）から作成
- 区間データ（神奈川） — 神奈川県警察 パーキング・メーター等の設置場所。線は OpenStreetMap（ODbL）から作成
- 地名検索・住所の逆引き — [国土地理院](https://www.gsi.go.jp/)
- 祝日 — [内閣府「国民の祝日」](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html)
- 地図タイル — 国土地理院（地理院タイル）／ OpenStreetMap contributors ／ CARTO

## ライセンス

コードは MIT。東京の区間データは CC BY 4.0（警視庁）、大阪・神奈川・札幌・京都の区間の線と地図データは ODbL（OpenStreetMap）に従います。
