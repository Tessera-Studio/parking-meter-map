# App Store の画像（メーターマップ）

App Store Connect に入れる画像です。2026年11月18日に作りました。

| ファイル | 使う場所 | 大きさ |
|---|---|---|
| `iphone-6.3/01_いま使える.png` 〜 `06_お気に入り.png` | **スクリーンショット（App Store Connect の「Dynamic Island搭載iPhone（中型ディスプレイ）」に入れる。この順に並べる）** | 1206 × 2622 |
| `01_いま使える.png` 〜 `06_お気に入り.png` | 同じスクリーンショットの 6.9インチ版（大型ディスプレイの欄が出たとき用） | 1320 × 2868 |
| `header_3840x1646.png` | プロダクトページのヘッダアセット（起動画面の街並みとメーターのイラスト。`make_header_city.py` で作る） | 3840 × 1646 |
| `search_3840x2560.png` | 検索結果アセット | 3840 × 2560 |

- どれも透過のない PNG です（App Store Connect は透過のある画像を受け付けない）。
- 2026年11月の App Store Connect では、iPhone の基準のスクリーンショットは「中型ディスプレイ」（1206 × 2622 か 1179 × 2556）。6.9インチ（1320 × 2868）はその欄では「サイズが無効」になる。
- 「iPhone Duo」の欄（外側 1398 × 2034、内側 2007 × 2853）は、2026年11月の時点では入れなくても提出できる（iOS 27.1 SDK 以降でビルドしたものは2027年4月から必要になる、とする解説がある）。iPad・Apple Watch の欄は、iPhone だけのアプリなので要らない。
- ヘッダと検索結果の文字は、Apple の決めた「必ず表示される範囲」に入れています。ヘッダは 1646 × 661（x 1097, y 493）、検索結果は 2168 × 1030（x 836, y 765）です（[Creative assets specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/creative-assets-specifications/)）。
- スクリーンショットと検索結果アセットの背景は、起動画面の色に近い青のグラデーションに、駐車場の標識の「P」を薄く重ねています。
- ヘッダアセットは、右側に起動画面の街並みとメーターのイラスト（`ios/App/App/Assets.xcassets/Splash.imageset/`）をできるだけ大きく置き、左側に駐車場の標識の「P」と見出しを置いています。イラストは左右を反転して、メーターを Apple の「必ず表示される範囲」の中（文字の側）に寄せています（反転しない版は `--flip` を付けずに作る）。ぼかしや継ぎ足しはしていません。
- 価格・URL・ほかのサービスのロゴ・裏付けのない表現（「No.1」など）は入れません（[App Store Asset Best Practices](https://developer.apple.com/app-store/asset-best-practices/)）。

並び順：01 いま使える → 02 時間も料金も → 03 目的地から → 04 すぐ案内 → 05 タイマー（プレミアム） → 06 お気に入り（プレミアム）。無料で使える機能を先に、プレミアムの機能を最後に並べています。

## 作り直し方

ヘッダアセットだけは別のスクリプトです。

```sh
python3 store-assets/make_header_city.py /usr/share/fonts/opentype/noto store-assets/header_3840x1646.png --flip
```

そのほか（スクリーンショット・検索結果アセット）：

文言・色・端末の傾きは `make_store_assets.py` の上のほう（`SLIDES`、ヘッダ・検索結果の `l1`・`l2`・`lines`）で変えます。

用意するもの：Python 3 と Pillow、フォント Noto Sans CJK JP の Black と Bold（Debian・Ubuntu なら `fonts-noto-cjk` と `fonts-noto-cjk-extra`）。

```sh
python3 store-assets/make_store_assets.py \
  store-assets/source \
  /usr/share/fonts/opentype/noto \
  store-assets
```

- 2つ目の引数は `NotoSansCJK-Black.ttc` のあるフォルダ。Bold は `/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc` を読みます。
- `source/` の `11.webp`〜`15.webp` は、実機で撮った画面（地図・詳細・検索・タイマー・「ここへ行く」）を 921 × 2000 に縮めたものです。撮り直したときは、同じ名前で置き換えます。
