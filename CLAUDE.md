# 付け回しマスター — 常時コンテキスト

> このファイルが運用の正（常時ロードされるプロジェクトメモリ）。過去の全変更履歴・
> 実装詳細は `docs/project/IMPLEMENTATION.md`（旧CLAUDE.md完全版）に退避済み。必要なときだけ読む。

## 作業場所

- 必ず `kurofuku-game/` を作業ディレクトリにする。
- 親の `claudeAI/` から起動しない。他プロジェクトの文脈を読み込ませない。

## プロジェクト概要

- スマホ向け・一人用の黒服シミュレーションゲーム。
- 静的Webアプリ。HTML / CSS / Vanilla JS、サーバー・ビルド不要。
- 主要ファイルは `index.html`、`css/style.css`、`js/*.js`、`sw.js`。
- バランス検証は `node tools/sim.js [回数] [key=value...]`。

## 作業原則

- 依頼に関係するファイルだけを読む。全コード・全資料の先読みはしない。
- 小さな単一作業はメインエージェントで完結する。
- 独立した調査・検証が複数ある場合だけサブエージェントを使う。
- サブエージェントには対象ファイル、確認項目、返答形式だけを渡す。
- 既存のユーザー変更を保持し、無関係な変更を混ぜない。
- 変更規模に合った検証だけを行う。

## 更新・キャッシュ規約（必須）

- 現在の版数は `index.html` の `?v=` と `js/assets.js` の `ASSET_V` が唯一の正（このmdに実数を書かない＝腐るため）。
- アセット更新時は `index.html` の `?v=N` と `js/assets.js` の `ASSET_V` を同じ値に上げる。
- `sw.js` は `js/assets.js` からキャッシュ名と事前キャッシュ対象を自動生成する。
- 画像・音声追加時は `js/assets.js` の対応マニフェストにも追加する。
- 背景画像を差し替えた場合だけ `js/assets.js` の `BG_V` を上げる。
- 背景を変更していない更新では約1MBの再取得を避けるため `BG_V` を据え置く。

## 公開

- 公開先: `https://wacky77.github.io/kurofuku-game/`
- リポジトリ: `https://github.com/wacky77/kurofuku-game`
- 公開はユーザーが明示的に依頼した場合のみ行う。
- GitHub Pagesは `main` へのpush後、通常1〜2分で更新される。

## 詳細資料の読み分け

以下は常時読み込まず、該当作業で必要な部分だけ読む。

- ゲーム仕様・実装履歴・過去の全変更履歴（v28〜）: `docs/project/IMPLEMENTATION.md`
- 画像規約: `assets/IMAGE_SPEC.md`、`assets/PROMPTS.md`
- 音声規約: `assets/BGM_PROMPTS.md`
- Firebase: `FIREBASE_SETUP.md`、`firestore.rules`、`js/firebase-config.js`、`js/cloud-scores.js`
- ゲームバランス: `tools/sim.js` と `js/data.js` の `DAY_CONFIG`

## 維持上の注意

- 上の詳細資料への参照には Claude Code の `@path` importを使わない。
  `@path` は参照先を自動ロードするため、この軽量版の省トークン効果が消える。通常のパス表記で所在だけ案内する。
- 新しい実装・変更履歴はこの `CLAUDE.md` に肥大化させず、`docs/project/IMPLEMENTATION.md` 側に追記する。
