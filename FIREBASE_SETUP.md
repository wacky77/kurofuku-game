# 全国ランキング Firebase 設定

## Firebase コンソール

1. 無料の Spark プランでプロジェクトを作成する。
2. Web アプリを登録し、表示された `firebaseConfig` を `js/firebase-config.js` に設定する。
3. Authentication のログイン方法で「匿名」を有効にする。
4. Cloud Firestore を作成する（本番環境モード、ロケーションは `asia-northeast1` 推奨）。
5. Firestore の「ルール」に `firestore.rules` の内容を貼り付けて公開する。
6. Authentication の承認済みドメインに `wacky77.github.io` が含まれていることを確認する。

設定前や通信失敗時は全国ランキングを使用せず、端末内ランキングだけでゲームを継続できる。

## デイリーチャレンジ用ルールの更新（v59）

v59 で `firestore.rules` にデイリーチャレンジ（📅 本日の営業）用の
`daily/{yyyymmdd}/scores/{uid}` のルールを追記した。**手順5と同じ要領で、
更新後の `firestore.rules` 全文を Firestore の「ルール」タブに貼り直して「公開」すること。**
公開するまでデイリーの全国ランキングは「準備中」と表示され、記録は端末内の自己ベストのみになる
（ゲーム自体は問題なく遊べる）。firebase CLI を使う場合は `firebase deploy --only firestore:rules` でも良い。

## 任意の追加対策

稼働状況を確認した後、Firebase App Check を導入・強制すると機械的な大量投稿を抑制できる。
クライアントだけでゲーム進行を完全検証することはできないため、厳密な不正対策が必要になった場合は
サーバー側でのプレイ検証を追加する。
