# 画像生成プロンプト集（ChatGPT / DALL·E / Gemini 向け）

`IMAGE_SPEC.md` の雛形をキャラごとに埋め切った、コピペ用プロンプト。仕様書は「発注表」、これは「実際に投げる文」。

## 使い方
- **1プロンプト＝1画像**。正方形（1:1）で出す。
- ChatGPT / Gemini は会話が続くので、各章の先頭 **STYLE を最初に1回だけ送る** → 以降は各キャラの1行だけ送ると絵柄が揃う。会話をリセット／別チャットにしたら STYLE を貼り直す。
- 出た画像を該当フォルダに **`{id}.png`** で保存（例: `aya.png`）。名前はこのファイルの見出しの `xxx.png` に合わせる。
- 透過が使えるツールなら背景指定を "transparent background" に置き換えてOK。基本は下記の単色ダーク背景でよい（ゲーム内タイルの上に乗る）。
- 顔だけ寄り気味（バストアップ）に。顔が中央に来るように。

---

## A. キャスト（女性・28枚 → `assets/images/cast/`）

**STYLE（最初に1回送る）:**
> You are generating a consistent set of character portraits. Apply this exact style to EVERY image: bust-up portrait of an original Japanese hostess (an upscale cabaret-club "cast" girl), semi-realistic anime illustration, elegant evening dress, warm golden nightclub lighting, gold accents, plain solid dark-charcoal (#14100c) background, subject centered and facing the camera, tasteful, modest and classy (all-ages friendly), square 1:1 composition. I'll send one character at a time — keep this exact style and framing for each. Make every girl clearly distinguishable by face, hairstyle and mood.

**各キャラ（1行ずつ送る）:**
- **aya.png（あや／癒し系）** — a gentle, soothing woman with warm brown long hair and a small flower hair clip, soft caring smile.
- **rei.png（レイ／トーク）** — a bright, talkative woman with dark-purple hair in a high ponytail and a small star clip, confident cheerful look.
- **mina.png（ミナ／新人）** — an innocent rookie girl with soft pink twin-tails and a flower clip, big cheerful grin, youthful.
- **karen.png（カレン／高単価）** — a mature, alluring woman with wine-red wavy hair and gold drop earrings, glossy lips, elegant.
- **yuki.png（ユキ／クール）** — a cool beauty with icy light-blue long hair and a snowflake hair accessory, calm composed expression.
- **momo.png（モモ／元気）** — an energetic gyaru with orange bob hair, bright cheerful grin, lively.
- **sara.png（サラ／バランス）** — a friendly honor-student type with blond bob hair and a small star clip, warm balanced smile.
- **noa.png（ノア／新人）** — a soft healing rookie with navy long hair and a crescent-moon accessory, gentle quiet look.
- **runa.png（ルナ／お姉さん）** — a glamorous elder-sister type with purple wavy hair and gold earrings, sultry mature charm.
- **hina.png（ヒナ／新人）** — a naturally cute rookie with honey twin-tails and a ribbon, sweet grin.
- **sena.png（セナ／ギャル）** — a flashy gyaru with bleached-yellow hair in a ponytail and a star clip, glossy confident look.
- **akari.png（アカリ／癒し系）** — a relaxing, fluffy-vibe woman with brown long hair and a flower clip, soft gentle smile.
- **chisa.png（チサ／高単価）** — a mysterious woman with jet-black bob hair and a silver earring, cool aloof expression.
- **mayu.png（マユ／元気）** — a boyish energetic girl with short green hair and a moon clip, lively friendly smile.
- **emi.png（エミ／癒し系）** — a warm elder-sister type with chestnut-brown long hair and a flower clip, soothing tender smile.
- **riko.png（リコ／トーク）** — a passionate, lively woman with red wavy hair and a star clip, spirited talkative look.
- **nana.png（ナナ／新人）** — a bunny-like soft-cute rookie with pink twin-tails and a ribbon, bright grin.
- **reina.png（レイナ／高単価）** — a bewitching woman with magenta wavy hair and gold earrings, alluring seductive charm.
- **shion.png（シオン／クール）** — an intellectual cool beauty with blue-navy long hair and a snow accessory, calm collected look.
- **kana.png（カナ／元気）** — a cheerful extrovert with bright yellow hair in a ponytail and a star clip, big joyful smile.
- **miku.png（ミク／バランス）** — a fresh, approachable girl with light-blue bob hair and a moon clip, friendly smile.
- **rui.png（ルイ／新人）** — an ethereal, fragile-looking rookie with silver-gray bob hair and a ribbon, gentle delicate look.
- **arisa.png（アリサ／お姉さん）** — a mature, sexy elder-sister with purple wavy hair and gold earrings, sultry sophisticated charm.
- **koharu.png（コハル／新人）** — a natural, wholesome rookie with yellow-green twin-tails and a flower clip, gentle smile.
- **maria.png（マリア／ギャル）** — a dazzling gyaru with glamorous blond long hair and a star clip, radiant confident look.
- **yua.png（ユア／癒し系）** — a pure, healing-type woman with orange-brown long hair and a flower clip, gentle serene smile.
- **rara.png（ララ／高単価）** — a cool, chic woman with black wavy hair and silver earrings, composed elegant look.
- **tsubasa.png（ツバサ／元気）** — a boyish, energetic girl with short blond hair and a moon clip, bright cheerful smile.

---

## B. 来店客（男性・32枚 → `assets/images/customers/`）

**STYLE（最初に1回送る）:**
> You are generating a consistent set of male character portraits for a game. Apply this exact style to EVERY image: bust-up portrait of an original Japanese man visiting a nightclub, semi-realistic anime illustration, warm golden nightclub lighting, plain solid dark-charcoal (#14100c) background, subject centered and facing the camera, friendly approachable mood, square 1:1 composition. I'll send one customer at a time — keep this exact style and framing. Emphasize each man's OCCUPATION with clear visual cues so they're instantly recognizable.

**各キャラ（1行ずつ送る）:**
- **salary.png（サラリーマン）** — a middle-aged office worker in a navy suit with a blue tie, short black hair, a little tired but friendly.
- **young.png（若手社員）** — a young junior employee in a suit, short neat hair, slightly nervous but cheerful.
- **bucho.png（部長さん）** — a jovial middle-aged department chief, balding gray hair, light stubble, suit with a red tie.
- **oyakata.png（建設の親方）** — a hearty construction foreman wearing a yellow hard hat, sun-tanned skin, stubble, work jacket.
- **doctor.png（お医者さん）** — a doctor with slicked-back hair, round glasses, white coat, a bit tired but kind.
- **lawyer.png（弁護士）** — a composed lawyer with slicked hair, rectangular glasses, dark suit.
- **itceo.png（IT社長）** — a relaxed IT startup CEO, messy hair, light stubble, casual hoodie/tee, easy-going.
- **band.png（バンドマン）** — a high-energy band musician with longish hair, stubble, graphic tee.
- **prof.png（大学教授）** — a university professor with gray hair, round glasses, full beard, tweed jacket.
- **chef.png（板前さん）** — a calm sushi chef wearing a bandana, buzz cut, stubble, white work jacket.
- **farmer.png（農家のおやじ）** — a rustic farmer with a towel headband, sun-tanned skin, stubble, hearty smile.
- **comedian.png（お笑い芸人）** — a goofy energetic comedian with spiky hair, colorful tee, playful grin.
- **trader.png（証券マン）** — a confident stockbroker with slicked hair, sharp suit and a gold tie.
- **sensei.png（先生・士業）** — a refined professional consultant with rectangular glasses, a mustache, dark suit.
- **teacher.png（学校の先生）** — a kind school teacher with short hair, rectangular glasses, suit with a green tie.
- **police.png（警察官）** — an upright police officer with a buzz cut, navy uniform-style collar, dutiful look.
- **pilot.png（パイロット）** — a composed airline pilot with neat side-parted hair, dark navy tie, professional.
- **fisher.png（漁師）** — a hearty fisherman with a towel headband, full beard, deeply sun-tanned face.
- **designer.png（デザイナー）** — an artsy creative designer with messy hair, round glasses, light stubble, stylish tee.
- **realtor.png（不動産社長）** — a pushy, confident real-estate boss with slicked hair and a gold tie, big-spender vibe.
- **dentist.png（歯医者さん）** — a calm dentist with short hair, rectangular glasses, white coat.
- **actor.png（俳優）** — a glamorous actor with longish hair, light stubble, wearing a tuxedo.
- **athlete.png（スポーツ選手）** — a cheerful athlete with a buzz cut, athletic tee, tanned and muscular.
- **mayor.png（地元議員）** — a local politician, balding, rectangular glasses, suit with a red tie and a small lapel badge.
- **novelist.png（小説家）** — a pensive novelist with messy gray hair, round glasses, full beard, wearing a coat.
- **barber.png（理容師）** — a dapper barber with slicked hair, a neat mustache, casual tee.
- **driver.png（タクシー運転手）** — a weary taxi driver with short hair, stubble, work uniform, tired but friendly.
- **youtuber.png（ユーチューバー）** — a young energetic YouTuber with spiky hair, flashy colorful tee.
- **birthday.png（誕生日客）** — a cheerful man wearing a party cone hat, celebrating, happy expression. (event)
- **ceo.png（社長来店・VIP大口）** — a distinguished big-spender company president, gray slicked hair, tuxedo, dignified. (event)
- **drunk.png（酔っ払い）** — a tipsy drunk man with messy hair, stubble, flushed red face, suit with a loosened tie. (event)
- **vip.png（VIP指名）** — a luxurious regular VIP guest with a goatee, fine suit, small gold crown motif, in a good mood. (event)

---

## C. アプリアイコン（3サイズ・同じ絵 → `assets/images/icon/`）

同じ1枚を3サイズ書き出す。まず正方形で1枚作り、`icon-512.png` / `icon-192.png` / `apple-touch-icon.png`（180px）にリサイズ保存。

**プロンプト（1枚）:**
> A minimalist app icon: a glowing golden martini glass centered on a dark-charcoal (#14100c) background, luxury nightclub vibe, gold (#d4af37) accents, flat clean vector style, high contrast, generous safe margin (keep the glass within the central 80% so it isn't clipped when rounded), no text. Square 1:1.

---

## D. 背景・内装（4枚・縦長 → `assets/images/backgrounds/`）

すべて **縦長 9:16（1080×1920 目安）**。UIが上に乗るので**中央〜上部は暗め・情報少なめ**に。

- **title.png（タイトル画面）** —
  > Exterior/entrance of a luxurious Japanese nightclub at night, glowing neon and gold signage, moody and gorgeous, dark atmosphere, vertical 9:16 composition, leave the upper-center area darker and empty for a logo, no people, no text.
- **floor.png（プレイ中の店内）** —
  > Interior of an upscale Japanese hostess club, plush velvet sofas, warm gold ambient lighting, bottles on shelves, soft bokeh, dark moody atmosphere, vertical 9:16, keep the center calm and darker for UI overlay, no people, no text.
- **result.png（日次リザルト）** —
  > A calm upscale nightclub interior with a city night view through a window, warm gold lighting, elegant and quiet, dark tones, vertical 9:16, darker empty center for numbers overlay, no people, no text.
- **gameover.png（ゲームオーバー・任意）** —
  > A dim, closed-for-the-night hostess club interior, chairs up, lonely melancholic mood, cold dark lighting, vertical 9:16, no people, no text.

---

## 差し込み
生成画像を上記フォルダに指定名で置いたら「画像を差し込んで」と言えば、コード側を「画像があればそれ／無ければ従来SVG」のフォールバック方式で組み込み、キャッシュ版数を上げます。まず1〜2枚（例: `title.png` か `icon`）で流れを確認するのが安全です。

## ランク紋章（v55・生成済み）
黒服ランク7段階のエンブレム。プロンプトは `asset-gen/prompts/kurofuku-rank.json`（専用プリセット）にある。
納品先は `assets/images/rank/1.png`〜`7.png`（1=見習い黒服 … 7=伝説の黒服）。透過PNG・256px・パレット256色。

    cd ../asset-gen && node generate.js --provider openai --preset kurofuku-rank \
      --out ../kurofuku-game/assets/images/rank/_src

生成後は sharp で `resize(256).png({palette:true})` して 1〜7.png に配置する。
**プロンプトには必ず「文字・ロゴ・banner のリボン文字は一切描かない。」を入れる**
（入れないと盾のリボンに "ASSISTANT MANAGER" 等の英字が焼き込まれる）。
