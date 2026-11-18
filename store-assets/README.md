# App Store の画像（メーターマップ）

App Store Connect に入れる画像です。2026年11月18日に作りました。

| ファイル | 使う場所 | 大きさ |
|---|---|---|
| `iphone-6.3/01_いま使える.png` 〜 `05_すぐ案内.png` | **スクリーンショット（App Store Connect の「Dynamic Island搭載iPhone（中型ディスプレイ）」に入れる。この順に並べる）** | 1206 × 2622 |
| `01_いま使える.png` 〜 `05_すぐ案内.png` | 同じスクリーンショットの 6.9インチ版（大型ディスプレイの欄が出たとき用） | 1320 × 2868 |
| `header_3840x1646.png` | プロダクトページのヘッダアセット | 3840 × 1646 |
| `search_3840x2560.png` | 検索結果アセット | 3840 × 2560 |

- どれも透過のない PNG です（App Store Connect は透過のある画像を受け付けない）。
- 2026年11月の App Store Connect では、iPhone の基準のスクリーンショットは「中型ディスプレイ」（1206 × 2622 か 1179 × 2556）。6.9インチ（1320 × 2868）はその欄では「サイズが無効」になる。
- 「iPhone Duo」の欄（外側 1398 × 2034、内側 2007 × 2853）は、2026年11月の時点では入れなくても提出できる（iOS 27.1 SDK 以降でビルドしたものは2027年4月から必要になる、とする解説がある）。iPad・Apple Watch の欄は、iPhone だけのアプリなので要らない。
- ヘッダと検索結果の文字は、Apple の決めた「必ず表示される範囲」に入れています。ヘッダは 1646 × 661（x 1097, y 493）、検索結果は 2168 × 1030（x 836, y 765）です（[Creative assets specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/creative-assets-specifications/)）。
- 背景は、どれもスクリーンショットと同じ青（起動画面の色に近い青のグラデーション）に、駐車場の標識の「P」を薄く重ねています。
- 価格・URL・ほかのサービスのロゴ・裏付けのない表現（「No.1」など）は入れません（[App Store Asset Best Practices](https://developer.apple.com/app-store/asset-best-practices/)）。

## 作り直し方

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
