# 付け回しマスター — プロジェクト文脈

このフォルダは **kurofuku-game** の独立作業スペース。**Claude Code はこの `kurofuku-game/` フォルダを作業ディレクトリとして起動する**こと（親の `claudeAI/` で起動すると他プロジェクトのコンテキストまで載りトークンを浪費するため）。

## 概要
キャバクラの黒服（フロアスタッフ）を題材にした **スマホ向け・一人用** シミュレーションゲーム。次々来店する客に制限時間内で最適なキャストを「付け回し」、1日の売上目標を目指す。1プレイ2〜3分。

## 技術・構成
- **サーバー不要の静的Webアプリ**（HTML / CSS / Vanilla JS、ビルド不要）
- ファイル:
  - `index.html` — エントリ（PWAメタ・SW登録込み）
  - `css/style.css` — ダーク×ゴールドのキャバ内装、スマホ縦（max-width 420px）
  - `js/data.js` — キャスト/客/イベント/ニーズ/ランク等のデータ
  - `js/avatars.js` — SVG似顔絵の動的生成（キャスト顔・客顔 `customerFace()`）
  - `js/audio.js` — Web Audio 合成の効果音＋外部音源BGM（`assets/audio/`、下記「音声アセット」参照）
  - `js/achieve.js` — 実績（アチーブメント14種、localStorage永続化＋解除トースト）
  - `js/game.js` — ゲームロジック＆画面描画
  - `manifest.webmanifest` + `sw.js` + `assets/icon.svg` — PWA
  - `assets/images/` — **外部AI生成画像の置き場**（下記「画像アセット」参照）
  - `tools/sim.js` — **ヘッドレス・バランスsim**（非配信）。`node tools/sim.js [回数] [key=value...]` で
    DOM/SFXをスタブ化して data.js/game.js を実行し、最適/現実的(7割最適)/ランダムの3ポリシー×
    時間切れ確率モデル込みで各DAYの到達率を計測。`dailyGoal=xxx` 等で DAY_CONFIG を上書き探索できる。

## 起動 / プレビュー
- `.claude/launch.json` に `kurofuku`（python3 http.server 5501）を登録済み。preview_start で起動。
- （親フォルダ側には 5500/5599 の設定もあるが、この独立ワークスペースでは 5501 を使う）

## 公開（GitHub Pages）
- **公開URL: https://wacky77.github.io/kurofuku-game/**（iPhoneはSafariで開き「ホーム画面に追加」でPWA化）
- リポジトリ: https://github.com/wacky77/kurofuku-game （public / branch main / path root）
- 認証はmacキーチェーンに保存済み（username wacky77）。**更新の反映は `git add -A && git commit && git push origin main` だけ**。Pagesが自動再ビルド（1〜2分）。
- PWAキャッシュがあるため、更新時は下記のキャッシュ規約どおり版数を上げないとiPhone側に反映されない。

## キャッシュ規約（重要）
`index.html` の `<script>`/`<link>` は `?v=N` 付き。**アセット更新時は index.html の `?v=N`・`sw.js` の `CACHE`/`ASSETS`・`js/assets.js` の `ASSET_V` の版数を揃えて上げる**（でないと旧版が配信される）。**現在 v49**（v28: BGM外部音源化／v29: BGM曲別音量／v30: 新人特性〈伸びしろ〉／v31: 客の見極め・来店演出・振り返り強化／v32: 高単価ナーフ＝イベント重み付け＋目標再調整／v33: UI整理＝文字削減・レイアウト圧縮／v34: 交代の後任を候補2名から選択／v35: 交代画面に「残留」選択肢／v36: 交代を枠の紐付けなしのプール選択に＝現メンバーN人＋候補2N人から残るN人を自由に組み合わせ／v37: ふりかえりに指名バッジ＝💐本指名（指名で来店）・🎀場内指名（★4以上でその場獲得）／v38: 新キャスト「つかさ」追加＝ギャル+語尾「ござる」の新voiceタイプ gal_gozaru／v39: 交代を1画面に統合（swappick画面廃止）＝現メンバーカードのタップで交代指定⇄残留トグル、下段に常時表示の候補プールから空き枠分だけ選択／v40: 接客結果を★の数で5段階に演出差別化＝★0-1は暗め・光らず地味、★2-3は標準、★4は金枠グロー、★5は強い金色グロー+脈動+入場シェイク+キラキラパーティクルで特大成功を演出／v41: タイムリミットに円環ゲージを追加＝残り時間が視覚的に減っていくSVGリング表示、残り3秒以下でリングも赤化／v42: タイトルロゴをCSSだけで金色豪華スタイルに強化＝グラデーション+エンボス影+装飾ライン、画像アセットなし／v43: タイトルロゴを実画像化＝ユーザー提供の透過金色ロゴ画像(assets/images/logo.png)をタイトル画面に表示（v42のCSSテキストロゴはフォールバックとして保持）／v44: タイトルロゴ画像を再アップロード版に差し替え＝今度は正規の透過PNG（チェッカー柄の焼き込みなし）だったためトリミング・圧縮のみで反映／v45: タイトルロゴの光沢エフェクトを差し替え＝斜めの矩形光沢バーが走る `logoShine`（ユーザー指摘「四角で違和感がある」）を撤去し、`.nc-spark`と同系統のキラキラ星（`.logo-spark`、ロゴ周囲にランダム配置で明滅する`logoTwinkle`）に変更。ロゴ自体の画像は変更なし）／v46: 「本音を隠す客」のヒントをキャラ立てて強化＝ユーザー指摘「同じニーズなら医者もお笑い芸人も同じ4文の使い回しで厚みがない」。`CUSTOMER_TYPES`28人ぶんに`hints`（heal/talk/price/smile各1文・計112文、職業ペルソナに寄せた本音ヒント）を追加し`makeCustomer()`で優先使用（無ければ`NEEDS[].hints`にフォールバック）。表示も「🤔 本音を察して…」というメタなラベル文言を撤去し、ヒント文中の決め手の語句（`**語句**`マーカー→`formatHint()`が`<b class="hint-key hint-{need}">`に変換）だけをニーズ別4色（heal/talk/price/smile）で強調する表現に変更。背景画像は CSS(`#phone[data-bg]`) から参照するので、背景差し替え時は `css/style.css` の url(...) 版数も忘れず揃える。／v47: v46のヒントをユーザー指摘3点で全面書き直し＝①「」会話文だと"接客後に喋った"体になり初対面感がない、②ニーズのラベル文言（癒されたい／盛り上がりたい等）をほぼそのまま使っていた文が混在、③文章が長く時間制限のあるゲーム中に読みにくい、の3点。`CUSTOMER_TYPES`112文＋`NEEDS[].hints`16文＝計128文すべてを、セリフを一切使わず**入店した瞬間・見た目だけで分かる情報**（服装・小物・表情・姿勢・肌ツヤ等）に限定した8〜16文字程度の短文に差し替え。ラベル文言・直接的な言い換えは排除。職業キャラ性は聴診器・和帽子・万年筆等の持ち物描写で表現。`.cust-need.vague`（css/style.css）はセリフでなく地の文の観察描写になったため非イタリックに変更。／v48: 「本音を隠す客」の出現率を引き上げ＝ユーザー指摘「客のコメント（観察ヒント）を書き換えたのに一部の客は変わって見えない」。原因は仕様どおりで、ヒントは`vague`（本音を隠す客）のときだけ表示され、それ以外は`「癒されたい」`とニーズを直接表示するため、v46/v47で書き換えたヒントが出る頻度が低かった。`DAY_CONFIG.vagueChance` を 0.25→**0.40**（DAY1基準）、`vagueChanceMax` を 0.6→**0.75** に引き上げ（`vagueChancePerDay 0.04` は据え置き）。judge/chooseCastロジックは不変＝simへの影響なし（表示頻度のみの変更）。／v49: UI改善6件（見やすさ＋ジュース演出。ロジック不変＝sim影響なし）＝①ニーズ4色統一: `:root`に`--need-{heal|talk|price|smile}`を定義し、ヒント強調（.hint-*）・通常客のニーズ表示（.cust-need.need-*、nominationは従来のクリーム色を維持）・結果ポップの答え合わせ（.res-reveal b）・選抜カードのステータス行ドット（statRows の .ndot、.stat-label幅3.6→4.7em）・振り返りラベル（State.logに`need`追加→.rv-cust small.need-*）で共通化。②組数ピップ: HUDの「n / N組」を .hud-pips（●=済/現在=金グロー/未=灰）＋小さい数字に。イベント位置は事前に見せない。③前回★バッジ: play画面のキャストカード左上に今夜の直近★（.cc-last、State.logから逆引き、★4以上は金グロー.hi。logは日次リセット＝自動で「今夜」限定）。④売上バー演出: 結果ポップ「次のお客へ」で`flySalesToGoal()`＝「+¥N」金色フロート(.sales-fly)がWAAPIで目標バーへ吸い込まれ→バー伸長＋.flashキラッ→100%初回のみ.celebrate大glow＋SFX.vip（State.goalCelebrated、日次リセット）。バーは進捗50/80/100%で.t50/.t80/.done段階グロー。時間切れ（★0）や¥1000未満は演出スキップ。⑤コンボ段階演出: .combo-badge.c3（3連続〜脈動）/.c5（5連続〜強グロー＋.combo-vignette画面縁金）＋途切れ時`breakComboBadge()`で.break砕け演出（chooseCastの!hit時とtimeUp時）。⑥焦り演出: 残3秒で.customerに.sowasowa（transform微振動、custIn完了後にanimation差し替え）。

## ゲームのコアループ
8人の応募からキャスト4人選抜 → 客来店（ニーズ: 癒し/トーク/高単価/笑顔）→ 制限時間内に付けるキャスト選択 → マッチ度で★1〜5・売上変動・★4以上でリピーター獲得 → 日次売上目標達成でDAY継続、未達でGAME OVER。

主要データID（画像ファイル名と対応・`assets/IMAGE_SPEC.md` 参照）:
- **ニーズ**: `heal`(癒し) / `talk`(トーク) / `price`(高単価) / `smile`(笑顔)
- **キャスト29人**: aya, rei, mina, karen, yuki, momo, sara, noa, runa, hina, sena, akari, chisa, mayu, emi, riko, nana, reina, shion, kana, miku, rui, arisa, koharu, maria, yua, rara, tsubasa, tsukasa
- **客ペルソナ28種**: salary, young, bucho, oyakata, doctor, lawyer, itceo, band, prof, chef, farmer, comedian, trader, sensei, teacher, police, pilot, fisher, designer, realtor, dentist, actor, athlete, mayor, novelist, barber, driver, youtuber ＋イベント birthday, ceo, drunk, vip（計32アイコン）
- **客の名前**: 来店ごとに `CUSTOMER_NAMES`(名字40種)からランダム割当→「〇〇さん」表示。リピーター(指名客)は同名で再来店（addRepeater/makeNomination で name を引継ぎ）

## 実装済み（主要）
ハイスコア(localStorage Top5)・難易度カーブ・翌日編成(最大2人入替、v39〜1画面完結＝現メンバーカードのタップで交代指定⇄残留トグル、下段に常時表示の候補プール（Math.min(4, CAST_POOL.length - roster.length)人、State.day単位で1回だけ抽選しState.swapPoolに保持＝再描画で引き直し不可）から交代指定した人数ぶんだけ State.swapSel に選択。交代指定を取り消すと選択済み候補も上限に合わせて自動で切り詰め。simは候補プールから能力合計上位N人を自動選択で対応済み・到達率への影響は誤差範囲)・連続的中コンボ(最大+40%)・リピーター再来店(指名客)・キャスト育成(EXP/Lv)・効果音(Web Audio)＋画面別BGM(外部音源・v28)・PWA・結果シェア・黒服ランク(通算売上で昇格)・席数拡大(DAY4で5席/DAY7で6席)・キャスト＆客のSVG似顔絵。
- 目標: `dailyGoal = 300000 + (DAY-1)*55000`
- ランク: 見習い黒服→黒服→主任→副店長→店長→エリアマネージャー→伝説の黒服（通算売上 0/80万/200万/350万/550万/800万/1200万）
- **実績14種**（js/achieve.js）: DAY到達系/★5/パーフェクト/コンボ6/指名/太客/リピーター10/通算100万・500万/Lv5/店長昇格。
  解除は `Achieve.onServe`（chooseCast内）と `Achieve.onDayEnd`（endDay内）のフックで判定→金色トーストをキュー表示。
  タイトルの「🏅 実績 n/14」ボタン→ `showAchievements()` で一覧（未解除は🔒グレー表示）。
- **バランス（v23・sim再調整）**: `dailyGoal = 220000 + (DAY-1)*45000`。v21単価0.72×v22体力カーブ強化の収益ダウンに
  合わせ tools/sim.js（時間切れモデル込み）で再計測して 300k+55k から引き下げ。計測値: 最適プレイ DAY1 96%/DAY6 75%/DAY12 46%、
  現実的(7割最適) DAY4 50%/DAY6 29%、ランダムは DAY3 で全滅＝「初日即死しないが旧バランスより難しい」。
- **新メンバー入店演出**: showNewcomers で SFX.newcomer ジングル＋カードが1枚ずつ弾んで登場（.nc-enter, delayインライン付与）＋
  金のキラキラ8個（.nc-spark）が舞い上がる。結果ポップの★も starPop アニメで弾む。
- **キャラ付け（v25）**: data.js の `CAST_PERSONA`（28人分の一言 `profile`＋性格タイプ `voice`、CAST_POOL に merge）と
  `CAST_VOICES`（9タイプ: iyashi/talk/rookie/pro/cool/genki/balance/onee/gal × 6場面: hello/great/ok/bad/nominate/levelup）＋
  `castLine(cast, kind)`。表示: 選抜カード（.cast-profile）・結果ポップのキャストの一言（.res-say、★4-5=great/★3=ok/★1-2=bad/指名成功=nominate、
  時間切れは非表示）・Lvアップ時のセリフ（.res-level-say）・新加入の挨拶（.nc-say）・詳細モーダル（.detail-profile）。
  客のセリフは従来から `CUSTOMER_TYPES[].lines`→play画面の .cust-line で表示済み。
- **5人以上のコンパクト表示（v26）**: renderPlay で roster が5人以上なら `.choice-grid.compact`（3列・顔52px・余白圧縮）に切替。
  DAY4の5席/DAY7の6席でも選択ボタンが2行に収まり、iPhone縦(812px)でスクロール不要。4人以下は従来の2列のまま。
- **UI整理（v33・ユーザー要望「情報量が多く見辛い。不要な文字をなくしスタイリッシュに」）**:
  - **play画面の圧縮**: 売上表示をHUDから目標バー内へ統合（.goalbar-txt「¥85,000 / ¥215,000」）。HUDは DAYチップ(.hud-day)＋
    組数(.hud-count)＋ミュートのみ。タイマー(52px円・1行占有)を40px円にして客カード右上に absolute 配置（縦1行分削減）。
    客カードの肩書と年代・状況を1行に統合（.cust-title＋.cust-sep「小説家 ・ 60代・同伴後」）。予算はピル型チップ(.cust-budget)。
    「誰を付ける？」ラベル削除。次客予告は「次 🎓 大学教授」形式に短縮。iPhone縦で全要素がスクロールなしで収まる。
  - **リザルトの成績を2×2チップ化**: .result-stats を縦4行→グリッド（ラベルsmall＋値b）。
  - **説明文の短縮**: 選抜「⚠️ 本番中は星が見えない！顔と得意を覚えよう」・編成「🔄 入れ替えは最大2人・交代要員はランダムに入店」
    と各1行に。新人特性行は「🌱 成長2倍・Lvアップで能力+1」に短縮（詳細モーダルはフル説明のまま）。
  - ロジック変更なし（表示のみ）＝simへの影響なし。
- **高単価ナーフ（v32・ユーザー指摘「高単価キャラが強すぎる」）**: イベント抽選を均等25%→ `EVENTS[].weight`（誕生日30/社長15/
  酔っ払い30/VIP25、game.js `randWeighted()`）に。社長来店（¥101k×1.6＝最大ジャックポット・need price）が原因で高単価の
  期待売上シェアが38%（癒し13%）まで膨らんでいたのを、4ニーズほぼ均等（15/31/28/25%）に是正。客単価EVが5〜8%下がるため
  `dailyGoal 220k→215k`・`goalPerDay 45k→42k` に同時再調整（sim: 最適D6 77%・現実的D4 51%＝v23基準の難度を維持）。
  ニーズ別EVの計測はscratchpadスクリプト（makeCustomer相当をN=30万で回して budget×bonusMult をニーズ別集計）で実施。
- **客の見極め・来店演出・振り返り強化（v31）**:
  - **本音を隠す客**: 通常客の一部（`vagueChance` 25%+4%/日・上限60%、data.js の DAY_CONFIG→difficulty()）はニーズ名を出さず
    `NEEDS[].hints`（各ニーズ4種の様子ヒント文）を「🤔 本音を察して…」(.cust-need.vague) で表示。ペルソナの needBias(6割)との
    合わせ読みが攻略になる。結果ポップで「🤔 本音は『◯◯』だった」(.res-reveal) と答え合わせ。イベント客・指名客は対象外。
    判定ロジック(judge/chooseCast)は不変＝simへの影響なし（表示だけの変更）。
  - **次のお客の予告**: play画面下部 .next-cust に次客のemoji＋肩書を表示（エース温存など体力配分の計画用）。
    イベントは「⚡何かが起きそうな気配…」・指名は「💐常連さんの予感…」とぼかしてサプライズは残す。最終組は「🌙ラスト」。
  - **来店演出**: .customer に custIn スライドイン＋.cust-emoji の custFace ポップ（1組ごと再生）。イベント客・指名客は
    金色フラッシュ(::after custFlash)＋上昇ジングル `SFX.vip()`（audio.js、nextCustomer から）。
  - **振り返り強化**: State.log に custName 追加。接客ふりかえり各行に客名（🤵 林さん 社長来店）と売上（.rv-right/.rv-sales）を表示。
    v37〜指名バッジ（.rv-nom）: 本指名（log.nomination＝isNominationの客・ピンク）が優先、通常客は場内指名（log.gotRepeater＝★4以上・金）を表示。
- **新人特性〈伸びしろ〉（v30）**: `rookie: true` のキャスト（6人）は **EXP獲得2倍＋Lvアップのたび一番低い能力+1**（上限5・同率は
  ランダム。game.js の `ROOKIE` / `rookieStatUp()`、成長はrun内のみ＝rosterのstatsコピーに加算）。初期ステが低い新人を「場数を踏むと
  育つ」投資枠にした（ユーザー発案）。表示: 選抜カード・加入お披露目の `.rookie-trait` 行「🌱 伸びしろ：成長2倍・Lvアップで能力UP」、
  詳細モーダルの特性説明、結果ポップのLvアップ行に「単価+1！」等（`.res-statup`、result.statUp = {stat: 上昇量}）。
  sim確認済み: 到達率への影響は誤差範囲（最適D6 77%不変）＝新人を選んだ時だけ効くバフで全体難度は不変。
- **店長以上GAME OVERの祝福（v27）**: 通算売上が店長(rank index 4)以上でのゲームオーバー時、renderDayResult が
  `State.castEarnings` の通算No.1キャストからのねぎらいカード（.gm-celebrate、GAME OVER見出し直下）を表示。
  セリフは CAST_VOICES の `gm_tencho`/`gm_area`/`gm_legend`（9性格タイプ×3ランク×各2本）から castLine で抽選。副店長以下は非表示。

## 画像アセット（外部AI化・差し替え機構は実装済み）
外部AI生成のラスタ画像（PNG）とコード内SVGを、**`js/assets.js` の `ASSET_IMG`（存在する画像のidを列挙したマニフェスト）**で切替。avatarSVG/customerFace は id がセットにあれば `<img>`（castImg/custImg）、無ければ従来SVGを返す。背景は enterScreen が `#phone` に `data-bg`（title/floor/result/gameover/none）を付与→CSS がスクリム付きで表示。**背景は `#phone[data-bg]::before`（position:sticky・height:100vh固定・margin-bottom:-100vh）に描画**＝コンテンツが縦に伸びても背景の描画サイズが100vh固定で変わらず、cover由来の「開くとズーム」を防止（#appはz-index:1で上に重なる）。**画像を追加したら: ①assets.js の該当セットにid追加 ②ASSET_V＋index.html/sw.js の版数を揃えて上げる**。
- 発注表: `assets/IMAGE_SPEC.md`、コピペ用プロンプト: `assets/PROMPTS.md`
- 置き場: `assets/images/{icon,cast,customers,backgrounds}/`（ファイル名＝id）
- **現状**: 背景4枚・アイコン3枚・**キャスト全28人**・**来店客全32種**・ロゴ1枚、すべて画像化済み＝**全て圧縮済み**。SVG似顔絵は完全フォールバック扱い。
  - ロゴ: **900×672px/PNG（透過・パレット256色）**（`assets/images/logo.png`、約126KB。`js/assets.js` の `HAS_LOGO` フラグで表示切替、`renderTitle()` から参照。元の高解像度PNGは `_src/logo_raw.png` に退避。**注意**: 当初納品されたPNGはチェッカー柄が透過処理されておらず画像内に実ピクセルとして焼き込まれていた（RGB・アルファチャンネルなし）ため、彩度/明度ベースのアルファマスク生成で再処理して透過化した）。
  - キャスト: **512px/JPEG(q80)**（castImg が `.jpg` 参照。1枚≈60KB／28枚計≈1.9MB）
  - 来店客: **512px/JPEG(q80)**（custImg が `.jpg` 参照。通常28＋イベント4＝32枚、1枚≈50-82KB／計≈2.0MB。透過なし）。ファイル名＝iconId（＝ペルソナの `id`）。**注意: 理容師のiconIdは `barber`**（納品時 `barbar.png` だったのを `barber.jpg` にリネーム済み）。
  - 背景: **941×1672/JPEG(q70)**（CSS が `.jpg` 参照。1枚≈230-300KB／4枚計≈1.0MB。濃いスクリム下なので低品質でも劣化不可視）
  - 元の高解像度PNGは各 `_src/` サブフォルダに退避（`cast/_src/`・`customers/_src/`・`backgrounds/_src/`＝非配信）。以前の旧キャストアートは `cast/旧画像/`。

## 音声アセット（BGM外部音源化・v28）
- 置き場: `assets/audio/{title,floor,result,gameover}.mp3`（**ファイル名＝画面id＝背景画像と同じ命名**。外部AI生成、発注プロンプトは `assets/BGM_PROMPTS.md`。ボツ候補・元素材は `assets/audio/_src/` に退避＝非配信）。
- 再生: `js/audio.js` の `SFX.bgm(name)`。fetch + decodeAudioData + AudioBufferSourceNode(loop) で**ギャップレスループ**（`<audio>` 非使用＝iOSのRange要求とSWの相性問題を回避）。MP3頭尾のエンコーダ無音は `loopRange()` が自動スキップ。読み込み失敗時は floor のみ旧・合成BGM（synthStart）にフォールバック。
- 切替: `game.js` の `enterScreen()` が背景名と同じ id で `SFX.bgm(bg)` を呼ぶだけ（title/floor/result/gameover が自動で切替。個別の bgmStart/bgmStop 呼び出しは撤去済み）。タイトル表示中に floor を先読み。
- ミュート: 既存トグルと共通（`muted`）。BGMは停止せず GainNode の音量を0にするだけ（復帰時に曲が途切れない）。
- キャッシュ: 音声URLは `?v=ASSET_V` 付き・sw.js は `/assets/audio/` を画像と同じ**永続 IMG_CACHE** に保存（版数更新をまたいで保持）。**曲を差し替えたら ASSET_V を上げる**（画像も再取得になる点に注意）。
- 音量バランス: `BGM_VOL` は**曲別テーブル**（audio.js、v29〜）: title/result/gameover 0.35・**floor 0.22**。
  実測RMSは floor が最も低い(-20dB)が、プレイ中は効果音と常時重なり体感が大きいためユーザー指摘で下げた経緯。

## 残課題
なし（2026-07-07: 加入演出強化・時間切れのsim反映・バランス再調整・実績システムを実装済み。画像は全アセット外部AI化・圧縮完了）。
次にやるなら: 実績の追加（隠し実績など）、デイリーチャレンジ、キャストのボイス的なセリフ演出 等。
