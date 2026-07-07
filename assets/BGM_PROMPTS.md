# BGM生成プロンプト集（Suno / Udio / Stable Audio 向け）

画面ごとのBGMを外部AIに発注するためのコピペ用プロンプト。画像の `PROMPTS.md` のBGM版。

## 使い方
- **1プロンプト＝1曲**。英語プロンプトをそのまま Style / Description 欄に貼る。
- **必ずインストゥルメンタル（歌なし）で出す**。Suno は「Instrumental」トグンをON、Udio/Stable Audio はプロンプト内の "instrumental, no vocals" が効く。
- 出た曲は該当ファイル名で `assets/audio/` に保存（例: `floor.mp3`）。ファイル名＝画面id（背景画像と同じ命名）。
- **ループ用途**なので、曲の頭と終わりが自然につながるかを確認。つながらない場合は Audacity 等で「イントロを切って周期の切れ目でトリム」すると馴染む。
- 容量目安: **MP3 128kbps / モノラル可**。スマホPWAなので1曲1MB前後に抑えたい（60秒ループで十分）。
- 世界観キーワード（全曲共通）: 高級キャバクラ / 夜 / ゴールド×ダークの内装 / 遊び心のあるコメディ寄りシミュレーションゲーム。生々しさより「デフォルメされた夜のお店」感。

---

## 1. floor.mp3 — プレイ中（メイン・最優先）

現行のWeb Audio版BGM（C→G→Am→F・約158BPM・跳ねるアルペジオ）の置き換え。テンポ感と「忙しいけど楽しい」空気を引き継ぐ。

> Upbeat playful instrumental loop for a comedic night-club management mini game. Funky disco-pop with a bouncy walking bassline, bright staccato electric piano arpeggios, tight drums with shakers, occasional brass stabs. Around 155-160 BPM, major key, simple 4-chord pop progression (like C-G-Am-F). Busy, cheerful, slightly frantic "time is running out" energy but always fun, never stressful. Seamless loop, no intro, no outro, no vocals, instrumental only, 60-90 seconds, game background music.

## 2. title.mp3 — タイトル画面

「これから夜のお店が開く」ワクワク感。ゴージャスだが気取りすぎない。

> Classy lounge jazz instrumental for a game title screen set in a luxurious Japanese hostess club at night. Smooth jazz trio: soft piano, upright bass, brushed drums, with a touch of vibraphone and warm saxophone. Mid-slow tempo around 95-105 BPM, sophisticated but lighthearted and inviting, gold-and-velvet nightclub atmosphere, a hint of playful showtime anticipation. Seamless loop, no vocals, instrumental only, 45-60 seconds, game background music.

## 3. result.mp3 — 日次リザルト（目標達成）

1日を乗り切った達成感。短いお祝いループ。

> Triumphant cheerful instrumental loop for a daily-results screen in a night-club management game. Uplifting jazzy big-band pop: bright brass fanfare feel, swing piano, walking bass, light applause-like energy (no actual crowd sounds). Around 120-130 BPM, major key, celebratory "we hit today's sales target!" mood, victorious but cute and comedic, not epic. Seamless loop, no vocals, instrumental only, 30-45 seconds, game background music.

## 4. gameover.mp3 — GAME OVER

目標未達で閉店。哀愁はあるが重すぎず、「もう一回やろう」と思える余韻。

> Melancholic but gentle lounge instrumental for a game-over screen. Late-night closing-time mood in an empty nightclub: slow solo piano with soft upright bass, sparse and wistful, a faint muted trumpet phrase. Around 70-80 BPM, minor key but ending each phrase with a warm hopeful turn, bittersweet "the shop is closing, try again tomorrow" feeling. Not tragic, slightly comedic sigh. Seamless loop, no vocals, instrumental only, 30-45 seconds, game background music.

---

## 組み込みメモ（v28で実装済み）
- 4曲とも `assets/audio/` に配置済み。再生は `js/audio.js` の `SFX.bgm(name)`、切替は `game.js` の
  `enterScreen()` が背景名と同じ id で自動実行。詳細は `CLAUDE.md` の「音声アセット」参照。
- **曲を差し替える時**: 同名で上書き → `js/assets.js` の `ASSET_V` を上げる（音声URLは `?v=ASSET_V` 付き）。
  ボツ候補は `assets/audio/_src/` へ。
