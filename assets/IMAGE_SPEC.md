# 画像アセット発注仕様（外部AI生成用）

外部の画像生成AI（Midjourney / DALL·E / NanoBanana / Stable Diffusion 等）で作る画像の**ファイル名・サイズ・スタイル・プロンプト雛形**をここに集約する。生成した画像は指定パスに置くだけでゲームに反映できるよう、名前を**コード内のIDと一致**させること。

---

## 0. 共通スタイルガイド
- **世界観**: 高級キャバクラ／ラウンジ。ダーク背景 × ゴールドの差し色。夜・上品・少し華やか。
- **配色の軸**: 背景 `#14100c`〜`#1c1712`、ゴールド `#d4af37 / #e8c96a`、アクセント赤 `#b23a48`。
- **トーン**: リアル寄りのイラスト or 半リアルCG。過度に写実的な実在人物風は避ける（オリジナルキャラとして）。露出は控えめ・上品に（全年齢〜一般向け）。
- **背景**: キャラ画像は**透過PNG**（背景なし）を基本にする。難しければ単色 `#14100c` 塗り。
- **フォーマット**: PNG（透過）優先。容量が気になる箇所は WebP 可。
- **命名**: 半角英小文字、IDそのまま。例 `aya.png`。バリエーションは `_表情`。

---

## 1. アプリアイコン（PWA） — `assets/images/icon/`
現状 `assets/icon.svg`（マティーニグラス）を PNG 化して差し替え。

| ファイル名 | サイズ | 用途 |
|---|---|---|
| `icon-192.png` | 192×192 | PWA maskable/any |
| `icon-512.png` | 512×512 | PWA スプラッシュ/ストア |
| `apple-touch-icon.png` | 180×180 | iOS ホーム画面 |

- **安全余白**: 中央80%内に主役を収める（maskable 対応。角丸/丸で切られても欠けないように）。
- **絵柄**: ダーク背景にゴールドのマティーニグラス（または蝶ネクタイ＋グラス）。ミニマルでアプリアイコンとして映えるもの。
- **プロンプト雛形**:
  > A minimalist app icon, dark charcoal background (#14100c), a glowing golden martini glass in the center, luxury nightclub vibe, gold (#d4af37) accents, flat vector style, centered, safe margin, high contrast, no text.

導入後は `manifest.webmanifest` の icons と `index.html` の apple-touch-icon を PNG パスに差し替え、`?v` とSWの版数を上げる。

---

## 2. キャスト似顔絵（女性28人） — `assets/images/cast/`
**バストアップ・正面〜やや斜め・透過PNG・512×512 正方形**。ゲーム内は円形/角丸で表示されるので**顔が中央**に来るように。

各キャストの `id` / 名前 / タグ / ステータス傾向（heal癒し・talk話・price高単価・smile笑顔、5が高い）:

| id | 名前 | タグ | 個性の目安 |
|---|---|---|---|
| `aya` | あや | 癒し系 | heal5/price4。おっとり・優しい・清楚 |
| `rei` | レイ | トーク | talk5。明るく喋る・華やか |
| `mina` | ミナ | 新人 | smile5。あどけない笑顔・初々しい |
| `karen` | カレン | 高単価 | price5。色っぽい・大人・きれいめ |
| `yuki` | ユキ | クール | heal4/price4。クール美人・落ち着き |
| `momo` | モモ | 元気 | smile5/talk4。元気いっぱい・ギャル寄り |
| `sara` | サラ | バランス | オール3。優等生・親しみやすい |
| `noa` | ノア | 新人 | heal4/smile4。ふんわり・癒し新人 |
| `runa` | ルナ | お姉さん | heal4/price5。艶やかなお姉さん |
| `hina` | ヒナ | 新人 | smile5。天然・かわいい系新人 |
| `sena` | セナ | ギャル | talk5/smile4。派手ギャル・盛れてる |
| `akari` | アカリ | 癒し系 | heal5。ゆるふわ・癒し特化 |
| `chisa` | チサ | 高単価 | price5。ミステリアス・黒基調 |
| `mayu` | マユ | 元気 | smile4/talk4。ボーイッシュ元気 |
| `emi` | エミ | 癒し系 | heal5。温かいお姉さん系・栗茶ロング・花飾り |
| `riko` | リコ | トーク | talk5/price4。情熱的・赤髪ウェーブ・グイグイ喋る |
| `nana` | ナナ | 新人 | smile5。うさぎ系ゆるかわ・ピンクツインテ・リボン |
| `reina` | レイナ | 高単価 | price5/smile4。妖艶・マゼンタ髪ウェーブ・金ピアス |
| `shion` | シオン | クール | heal4/talk4。知的クール・青紺ロング・雪飾り |
| `kana` | カナ | 元気 | talk5/smile5。陽キャ・黄髪ポニテ・星飾り |
| `miku` | ミク | バランス | smile4。爽やか・水色ボブ・月飾り |
| `rui` | ルイ | 新人 | heal4/smile4。儚げ・銀灰ボブ・リボン |
| `arisa` | アリサ | お姉さん | heal5/price5。大人色っぽい・紫髪ウェーブ・ピアス |
| `koharu` | コハル | 新人 | heal4/smile4。ナチュラル・黄緑ツインテ・花飾り |
| `maria` | マリア | ギャル | talk5/price5。華やか・金髪ロング・星飾り |
| `yua` | ユア | 癒し系 | heal5。癒し特化・オレンジ茶ロング・花飾り |
| `rara` | ララ | 高単価 | price5/talk4。クール・黒髪ウェーブ・銀ピアス |
| `tsubasa` | ツバサ | 元気 | smile5/talk4。ボーイッシュ・金髪ショート・月飾り |

> ※ゲーム内の髪色/飾りは目安。同じタグ（癒し系・高単価・新人 等）が複数いるので、**顔立ち・髪型・雰囲気で必ず描き分ける**こと。ファイル名は全28人分 `aya.png` … `tsubasa.png`。

- **共通プロンプト雛形**（`{}` を上表で置換）:
  > Bust-up portrait of an original Japanese hostess character, {個性の目安}, elegant evening dress, upscale nightclub, soft warm lighting, transparent background, semi-realistic anime style, gold accents, facing camera, centered face, tasteful and classy. 512x512.
- 14人が**服/髪型/雰囲気で見分けられる**ように差別化する。ファイル名は `aya.png` … `mayu.png`。
- （任意）育成レベル演出用に `aya_lv2.png` 等のバリエーションを後から足せる。

---

## 3. 来店客の顔（男性・全32アイコン） — `assets/images/customers/`
**バストアップ・透過PNG・512×512**。年齢帯は 20〜60代で来店ごとに変わるので、**顔は「その職業らしさ」を優先**（年齢差はコード側の演出で吸収）。来店客はランダムで名字（「〇〇さん」）が割り当たるが、**顔は職業ペルソナ単位**（名前ごとの絵は不要）。

通常ペルソナ28種（`id` / 職業 / 求めがちなニーズ）:

| id | 職業 | needBias |
|---|---|---|
| `salary` | サラリーマン | talk |
| `young` | 若手社員 | smile |
| `bucho` | 部長さん | price |
| `oyakata` | 建設の親方 | price |
| `doctor` | お医者さん | heal |
| `lawyer` | 弁護士 | talk |
| `itceo` | IT社長 | price |
| `band` | バンドマン | smile |
| `prof` | 大学教授 | talk |
| `chef` | 板前さん | heal |
| `farmer` | 農家のおやじ | heal |
| `comedian` | お笑い芸人 | smile |
| `trader` | 証券マン | price |
| `sensei` | 先生（士業） | talk |
| `teacher` | 学校の先生 | heal |
| `police` | 警察官 | talk |
| `pilot` | パイロット | price |
| `fisher` | 漁師 | price |
| `designer` | デザイナー | smile |
| `realtor` | 不動産社長 | price |
| `dentist` | 歯医者さん | heal |
| `actor` | 俳優 | talk |
| `athlete` | スポーツ選手 | smile |
| `mayor` | 地元議員 | talk |
| `novelist` | 小説家 | heal |
| `barber` | 理容師 | smile |
| `driver` | タクシー運転手 | heal |
| `youtuber` | ユーチューバー | smile |

新ペルソナの小道具ヒント（似顔絵SVGと揃える）: 学校の先生=角眼鏡＋緑ネクタイ / 警察官=坊主＋制服調の紺 / パイロット=きっちり七三＋紺ネクタイ / 漁師=手ぬぐい＋フル髭・日焼け / デザイナー=くせ毛＋丸眼鏡＋無精髭・Tシャツ / 不動産社長=七三＋金ネクタイ・押し強め / 歯医者=角眼鏡＋白衣(coat) / 俳優=ロングヘア＋無精髭＋タキシード・華やか / スポーツ選手=坊主＋Tシャツ・日焼け筋肉質 / 地元議員=薄毛＋角眼鏡＋赤ネクタイ・議員バッジ / 小説家=くせ毛＋丸眼鏡＋フル髭＋コート・文学的 / 理容師=七三＋口髭・粋 / タクシー運転手=無精髭・疲れ気味の作業着調 / ユーチューバー=ツンツン頭＋派手Tシャツ・若い。

イベント客4種（`id` / 内容）:

| id | 客 | 目印 |
|---|---|---|
| `birthday` | 誕生日客 | パーティ帽・嬉しそう |
| `ceo` | 社長来店(VIP大口) | 高級スーツ・貫禄 |
| `drunk` | 酔っ払い | 赤ら顔・とろん |
| `vip` | VIP指名(常連上客) | 王冠/貫禄・上機嫌 |

- **職業が一目で分かる小道具**を入れる（親方=ヘルメット, 板前=バンダナ/白衣, 農家=手ぬぐい, 教授=丸眼鏡+ヒゲ, IT社長=パーカー/スマート, バンドマン=個性的な髪, 証券=スーツ+ネクタイ, 誕生日=パーティ帽, 社長/VIP=高級感・王冠 等）。
- **共通プロンプト雛形**:
  > Bust-up portrait of an original male Japanese nightclub customer, a {職業}, clear occupation cues ({小道具}), friendly expression, transparent background, semi-realistic anime style, warm nightclub lighting, centered face. 512x512.
- ファイル名は各 `id`＋`.png`（通常28＋イベント4＝**全32枚**、`salary.png` … `youtuber.png` ＋ `birthday/ceo/drunk/vip`）。

---

## 4. 背景・内装 — `assets/images/backgrounds/`
**スマホ縦向き（9:16 目安、1080×1920 推奨）**。UIが上に乗るので**中央〜上部は要素が少なめ・暗め**にして文字が読めるように。

| ファイル名 | 用途 | 内容 |
|---|---|---|
| `title.png` | タイトル画面 | 店の外観 or ネオン看板・ゴージャス。ロゴを乗せる余白を上部に |
| `floor.png` | プレイ中の店内 | キャバのフロア（ソファ席・間接照明・ボトル棚）。ぼかし気味で情報量控えめ |
| `result.png` | 日次リザルト | 落ち着いた店内 or 夜景。売上表示が乗るので中央は暗め |
| `gameover.png`（任意） | ゲームオーバー | 閉店後の暗い店内・寂しげ |

- **プロンプト雛形（floor 例）**:
  > Interior of an upscale Japanese hostess club, plush velvet sofas, warm gold ambient lighting, bottles on shelves, bokeh, dark moody atmosphere, vertical composition 9:16, empty center for UI overlay, no people, no text.

---

## 5. 差し替えの進め方（実装メモ）
1. 画像を上記パスに置く（IDと一致した名前）。
2. コード側は「画像があれば `<img>`、無ければ従来SVG」にフォールバックさせる（一気に全部置き換えず段階導入）。
   - キャスト/客: `avatars.js` の顔生成箇所に画像パス解決を追加。
   - 背景: `css/style.css` の各画面に `background-image`。
   - アイコン: `manifest.webmanifest` / `index.html` を PNG パスに。
3. **キャッシュ版数を上げる**（`index.html` の `?v=N` と `sw.js` の `CACHE`/`ASSETS`）。SWの `ASSETS` に新規画像を追加すればオフラインでも出る。
4. まず1枚（例 `icon` か `title.png`）で流れを確立してから量産するのが安全。
