# App Store の画像（メーターマップ）

App Store Connect に入れる画像です。2026年11月18日に作りました。

| ファイル | 使う場所 | 大きさ |
|---|---|---|
| `01_いま使える.png` 〜 `05_すぐ案内.png` | スクリーンショット（iPhone 6.9インチ。この順に並べる） | 1320 × 2868 |
| `header_3840x1646.png` | プロダクトページのヘッダアセット | 3840 × 1646 |
| `search_3840x2560.png` | 検索結果アセット | 3840 × 2560 |

- どれも透過のない PNG です（App Store Connect は透過のある画像を受け付けない）。
- ヘッダと検索結果の文字は、Apple の決めた「必ず表示される範囲」に入れています。ヘッダは 1646 × 661（x 1097, y 493）、検索結果は 2168 × 1030（x 836, y 765）です（[Creative assets specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/creative-assets-specifications/)）。
- ヘッダと検索結果の背景の地図は `data/zones.geojson` の区間（東京）から描いています。赤と緑の色分けは見た目のための見本で、ある時刻の状態ではありません。
- 価格・URL・ほかのサービスのロゴ・裏付けのない表現（「No.1」など）は入れません（[App Store Asset Best Practices](https://developer.apple.com/app-store/asset-best-practices/)）。

## 作り直し方

文言・色・端末の傾きは `make_store_assets.py` の上のほう（`SLIDES`、ヘッダ・検索結果の `l1`・`l2`・`lines`）で変えます。

用意するもの：Python 3 と Pillow、フォント Noto Sans CJK JP の Black と Bold（Debian・Ubuntu なら `fonts-noto-cjk` と `fonts-noto-cjk-extra`）。

```sh
python3 store-assets/make_store_assets.py \
  store-assets/source \
  data/zones.geojson \
  /usr/share/fonts/opentype/noto \
  store-assets
```

- 3つ目の引数は `NotoSansCJK-Black.ttc` のあるフォルダ。Bold は `/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc` を読みます。
- `source/` の `11.webp`〜`15.webp` は、実機で撮った画面（地図・詳細・検索・タイマー・「ここへ行く」）を 921 × 2000 に縮めたものです。撮り直したときは、同じ名前で置き換えます。
