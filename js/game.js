// ===============================================
// 付け回しマスター - ゲームロジック
// ===============================================

const State = {
  screen: 'title',      // title | select | play | dayresult
  roster: [],           // 選抜した4人（CAST_POOL からコピー）
  applicants: [],       // 今回の応募者8人（CAST_POOL からランダム選出）
  selectedIds: [],      // キャスト選抜中に選んだID
  swapOutIds: [],       // 翌日に入れ替える（外す）キャストのID（最大2人）
  day: 1,
  today: null,          // その日の実効難易度設定（difficulty(day)）
  customerIndex: 0,     // その日の何組目か
  customers: [],        // その日の来店客リスト（事前生成）
  sales: 0,             // その日の売上
  totalSales: 0,        // 通算売上
  repeaters: 0,         // 獲得リピーター数
  currentCustomer: null,
  timer: null,
  timeLeft: 0,
  log: [],              // その日の接客履歴（振り返り用）
  combo: 0,             // 連続的中コンボ（最適キャストを選び続けた回数）
  maxCombo: 0,          // この run の最大コンボ
  rankUp: null,         // その日に昇格したか（{from,to} or null）
  repeaterPool: [],     // 再来店しうるリピーター（{castId, need, emoji, title, bg, bg2, budget}）
  scoreSaved: false,    // この run のスコアを登録済みか
  lastScoreTs: null,    // 直近に登録したスコアの識別子（ランキング強調用）
  castEarnings: {},     // この run のキャスト別・通算売上（castId → 金額）
  dayEarnings: {},      // その日のキャスト別売上（castId → 金額・毎日リセット）
};

// ---------- コンボ／育成の調整値 ----------
const COMBO = { bonusPerStep: 0.08, maxStep: 5 }; // 2連続以降、1段ごとに+8%（最大+40%）
const LEVEL = {
  expPerLevel: 12,   // このEXPごとに1レベル上昇
  maxLevel: 5,       // レベル上限
  bonusPerLevel: 0.05, // レベルにつき売上+5%（Lv1は+0%）
};
const NOMINATION = {
  chance: 0.35,      // 各来店枠が「指名客」になる確率（プール内に有効な指名先がある時）
  bonusMult: 1.4,    // 指名に正しく応えた時の売上倍率
};

// EXPからレベルを求める（1〜maxLevel）
function levelFromExp(exp) {
  return Math.min(LEVEL.maxLevel, 1 + Math.floor((exp || 0) / LEVEL.expPerLevel));
}
// 連続コンボの売上倍率（2連続から効く）
function comboMult(combo) {
  if (combo < 2) return 1;
  return 1 + Math.min(combo - 1, COMBO.maxStep) * COMBO.bonusPerStep;
}

// ---------- ユーティリティ ----------
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
// 配列から重複なくランダムに n 件抜き出す（Fisher-Yates）
function pickRandom(arr, n) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}
function yen(n) { return '¥' + n.toLocaleString('ja-JP'); }
// 塗り星はゴールド、空き星はほぼ不可視（塗り数が一目で分かる）
function stars(n) {
  return `<span class="s-on">${'★'.repeat(n)}</span><span class="s-off">${'☆'.repeat(5 - n)}</span>`;
}
// キャストの4能力を行表示（ラベル固定幅で星の開始位置を揃える）
function statRows(s) {
  return [['癒し', 'heal'], ['トーク', 'talk'], ['単価', 'price'], ['笑顔', 'smile']]
    .map(([label, key]) => `<div><span class="stat-label">${label}</span>${stars(s[key])}</div>`)
    .join('');
}
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- ハイスコア（localStorage・通算売上のTop5ランキング） ----------
const HS_KEY = 'kurofuku_scores';
const HS_MAX = 5;
function loadScores() {
  try { const v = JSON.parse(localStorage.getItem(HS_KEY)); return Array.isArray(v) ? v : []; }
  catch (e) { return []; }
}
function saveScores(list) {
  try { localStorage.setItem(HS_KEY, JSON.stringify(list)); } catch (e) { /* 非対応環境は無視 */ }
}
// このスコアがランクインするか（0始まりの順位、しなければ -1）
function scoreRank(sales) {
  const higher = loadScores().filter(s => s.sales >= sales).length;
  return higher < HS_MAX ? higher : -1;
}
function registerScore(name, sales, day, ts) {
  const list = loadScores();
  list.push({ name: (name || '名無し').slice(0, 8), sales, day, ts });
  list.sort((a, b) => b.sales - a.sales || b.day - a.day || a.ts - b.ts);
  const top = list.slice(0, HS_MAX);
  saveScores(top);
  return top;
}
// ランキング表のHTML。highlightTs の行を強調表示。
function rankingHTML(highlightTs) {
  const list = loadScores();
  if (!list.length) return '<div class="rank-empty">まだ記録がありません</div>';
  const pos = ['🥇', '🥈', '🥉', '4', '5'];
  return list.map((s, i) => `
    <div class="rank-row ${s.ts === highlightTs ? 'me' : ''}">
      <span class="rank-pos">${pos[i]}</span>
      <span class="rank-name">${escapeHTML(s.name)}</span>
      <span class="rank-sales">${yen(s.sales)}</span>
      <span class="rank-day">DAY${s.day}</span>
    </div>`).join('');
}

// 予算に客単価補正をかけ、1000円単位に丸める
function scaleBudget(n) {
  return Math.round(n * DAY_CONFIG.budgetScale / 1000) * 1000;
}

// ---------- 来店客の生成 ----------
function makeCustomer() {
  if (Math.random() < State.today.eventChance) {
    const ev = rand(EVENTS);
    return {
      isEvent: true,
      name: rand(CUSTOMER_NAMES) + 'さん',
      title: ev.title,
      emoji: ev.emoji,
      iconId: ev.id,
      bg: ev.bg,
      bg2: ev.bg2,
      profile: `${ev.context}`,
      line: ev.lines ? rand(ev.lines) : '',
      desc: ev.desc,
      need: ev.need,
      budget: scaleBudget(ev.budget),
      bonusMult: ev.bonusMult,
    };
  }
  const type = rand(CUSTOMER_TYPES);
  // ニーズはペルソナの傾向を6割、残り4割はランダム（読みの余地を残す）
  const needKey = (type.needBias && Math.random() < 0.6)
    ? type.needBias
    : rand(Object.keys(NEEDS));
  const age = rand(CUSTOMER_AGES);
  const ctx = rand(CUSTOMER_CONTEXTS);
  return {
    isEvent: false,
    name: rand(CUSTOMER_NAMES) + 'さん',
    title: type.title,
    emoji: type.emoji,
    iconId: type.id,
    bg: type.bg,
    bg2: type.bg2,
    age: age,
    profile: `${age}・${ctx}`,
    line: rand(type.lines),
    desc: NEEDS[needKey].label,
    need: NEEDS[needKey].need,
    budget: scaleBudget(rand(type.budgets)),
    bonusMult: 1.0,
  };
}

// リピーターの再来店（指名客）を1組作る。rep は repeaterPool の要素。
function makeNomination(rep) {
  const cast = CAST_POOL.find(c => c.id === rep.castId);
  return {
    isEvent: false,
    isNomination: true,
    nominateId: rep.castId,
    name: rep.name,
    title: 'ご指名',
    emoji: rep.emoji,
    iconId: rep.iconId,
    bg: rep.bg,
    bg2: rep.bg2,
    age: rep.age,
    profile: '常連さん・再来店',
    line: `${cast ? cast.name : ''}ちゃん、いるかな？`,
    desc: `${cast ? cast.name : '？'}ちゃんをご指名`,
    need: rep.need,
    budget: Math.round(rep.budget * 1.1 / 1000) * 1000, // 常連は少し弾む
    bonusMult: NOMINATION.bonusMult,
  };
}

// その日の来店リストを生成。リピーターが居れば一部を指名客に差し替える。
function buildDayCustomers(count) {
  const rosterIds = State.roster.map(c => c.id);
  // ロスターに残っている指名先だけが再来店できる（外した子の客は来ない）
  const validReps = State.repeaterPool.filter(r => rosterIds.includes(r.castId));
  const list = [];
  for (let i = 0; i < count; i++) {
    if (validReps.length && Math.random() < NOMINATION.chance) {
      const idx = Math.floor(Math.random() * validReps.length);
      const rep = validReps.splice(idx, 1)[0];
      // 消費したリピーターは本プールからも取り除く
      const pi = State.repeaterPool.indexOf(rep);
      if (pi >= 0) State.repeaterPool.splice(pi, 1);
      list.push(makeNomination(rep));
    } else {
      list.push(makeCustomer());
    }
  }
  return list;
}

// ---------- 接客の判定 ----------
// キャストの該当ステータス(1〜5)と体力から成功度(1〜5★)を算出
function judge(cast, customer) {
  const stat = cast.stats[customer.need]; // 1〜5
  // 体力が低いと本来の力を出せない（滑らかなカーブ：100→1.0, 0→staminaFloor）
  const t = Math.max(0, Math.min(100, cast.stamina)) / 100;
  const staminaFactor = DAY_CONFIG.staminaFloor + (1 - DAY_CONFIG.staminaFloor) * Math.pow(t, DAY_CONFIG.staminaCurve);
  const effective = stat * staminaFactor;

  // ★判定：effective に少しのランダム性を加える
  const roll = effective + (Math.random() * 1.4 - 0.5); // -0.5〜+0.9 のブレ
  let star;
  if (roll >= 4.3) star = 5;
  else if (roll >= 3.3) star = 4;
  else if (roll >= 2.3) star = 3;
  else if (roll >= 1.3) star = 2;
  else star = 1;

  // 指名客への対応は特別扱い（正しい子なら大成功、違う子ならガッカリ）
  let nominateHit = null;
  if (customer.isNomination) {
    if (cast.id === customer.nominateId) {
      nominateHit = true;
      star = Math.max(star, 4); // お目当ての子なら最低★4
    } else {
      nominateHit = false;
      star = Math.min(star, 2); // 別の子だと満足してもらえない
    }
  }

  // 売上：★に応じた達成率 × 予算 × イベント/指名倍率 × 育成レベル補正
  const rate = { 1: 0.25, 2: 0.5, 3: 0.75, 4: 1.0, 5: 1.3 }[star];
  const levelBonus = 1 + (levelFromExp(cast.exp) - 1) * LEVEL.bonusPerLevel;
  const sales = Math.round(customer.budget * rate * customer.bonusMult * levelBonus / 1000) * 1000;

  // 指名・リピーター獲得は★4以上
  const gotRepeater = star >= 4;

  let comment;
  if (nominateHit === true)       comment = 'ご指名に応えて大満足！常連さんに！';
  else if (nominateHit === false) comment = 'お目当ての子じゃなく不機嫌に…指名を逃した。';
  else if (star === 5)            comment = '大当たり！お客様大満足で指名獲得！';
  else if (star === 4)            comment = 'いい接客！リピーター獲得！';
  else if (star === 3)            comment = 'まずまず。無難に楽しんでもらえた。';
  else if (star === 2)            comment = '会話が今ひとつ盛り上がらず…';
  else                            comment = '30分で帰宅…付け回し失敗。';

  return { star, sales, gotRepeater, comment, nominateHit };
}

// ===============================================
// 画面描画
// ===============================================
const app = document.getElementById('app');

// 画面が切り替わったら先頭までスクロールを戻す（前画面の下部が残るのを防ぐ）。
// 同一画面内の再描画（選抜・編成のタップ更新など）ではスクロールしない。
let _lastScreen = null;
function enterScreen() {
  if (State.screen !== _lastScreen) {
    _lastScreen = State.screen;
    window.scrollTo(0, 0);
  }
  setPhoneBg(currentBgName());
}

// 画面ごとの背景画像（assets/images/backgrounds/<name>.png）。無ければ従来の下地グラデ。
const SCREEN_BG = { title: 'title', select: 'floor', roster: 'floor', play: 'floor' };
function currentBgName() {
  if (State.screen === 'dayresult')
    return (State.today && State.sales >= State.today.goal) ? 'result' : 'gameover';
  return SCREEN_BG[State.screen] || 'title';
}
function setPhoneBg(name) {
  const phone = document.getElementById('phone');
  if (!phone) return;
  const ok = (typeof ASSET_IMG !== 'undefined' && ASSET_IMG.bg.has(name)) ? name : 'none';
  phone.setAttribute('data-bg', ok);
}

function render() {
  if (State.screen === 'title')      renderTitle();
  else if (State.screen === 'select')    renderSelect();
  else if (State.screen === 'roster')    renderRosterEdit();
  else if (State.screen === 'play')      renderPlay();
  else if (State.screen === 'dayresult') renderDayResult();
}

// ---------- タイトル ----------
function renderTitle() {
  enterScreen();
  // 最高役職（ハイスコア1位の通算売上から算出）
  const topSales = (loadScores()[0] || {}).sales || 0;
  const best = rankFor(topSales);
  const bestBadge = topSales > 0
    ? `<div class="best-rank">最高役職 <span class="best-rank-title">${best.emoji} ${best.title}</span></div>`
    : '';

  app.innerHTML = `
    <div class="screen title-screen">
      <button class="mute-btn title-mute" id="muteBtn" title="効果音">${SFX.muted ? '🔇' : '🔊'}</button>
      <div class="logo">付け回し<br><span class="logo-big">マスター</span></div>
      <p class="subtitle">〜キャバクラ黒服 育成シミュレーション〜</p>
      ${bestBadge}
      <button class="btn btn-primary" id="startBtn">ゲームスタート</button>
      <p class="hint">来るお客に合わせて最適なキャストを付け回し、<br>1日の売上目標を目指せ！</p>
      <div class="ranking title-ranking">
        <div class="ranking-head">🏆 ハイスコア（通算売上）</div>
        ${rankingHTML()}
      </div>
      <button class="btn btn-ghost ach-btn" id="achBtn">🏅 実績 <span class="ach-count">${Achieve.count()}/${Achieve.DEFS.length}</span></button>
    </div>`;
  document.getElementById('startBtn').onclick = () => { SFX.tap(); startSelection(); };
  document.getElementById('achBtn').onclick = () => { SFX.tap(); showAchievements(); };
  document.getElementById('muteBtn').onclick = (e) => {
    SFX.toggle();
    e.currentTarget.textContent = SFX.muted ? '🔇' : '🔊';
  };
}

// ---------- 実績一覧（タイトルから開く） ----------
function showAchievements() {
  const items = Achieve.DEFS.map(d => {
    const got = Achieve.has(d.id);
    return `
      <div class="ach-item ${got ? 'got' : 'locked'}">
        <span class="ach-emoji">${got ? d.emoji : '🔒'}</span>
        <span class="ach-title">${d.title}</span>
        <span class="ach-desc">${d.desc}</span>
      </div>`;
  }).join('');

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="result-card ach-card">
      <div class="ach-head">🏅 実績 <span class="ach-count">${Achieve.count()}/${Achieve.DEFS.length}</span></div>
      <div class="ach-grid">${items}</div>
      <button class="btn btn-primary" id="achClose">閉じる</button>
    </div>`;
  app.appendChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  document.getElementById('achClose').onclick = () => { SFX.tap(); overlay.remove(); };
}

// ---------- キャスト選抜 ----------
function startSelection() {
  State.selectedIds = [];
  State.scoreSaved = false;   // 新しい run はスコア未登録から
  State.lastScoreTs = null;
  State.repeaterPool = [];    // リピーターは run ごとにリセット
  State.combo = 0;
  State.maxCombo = 0;
  State.castEarnings = {};    // キャスト別売上も run ごとにリセット
  State.dayEarnings = {};
  SFX.bgmStart();             // BGM開始（スタートボタンのタップが操作許可になる）
  // 全応募プールからランダムで8人を選出（プレイごとに顔ぶれが変わる）
  State.applicants = pickRandom(CAST_POOL, 8);
  State.screen = 'select';
  render();
}

function renderSelect() {
  enterScreen();
  const cards = State.applicants.map(c => {
    const picked = State.selectedIds.includes(c.id);
    return `
      <div class="cast-card ${picked ? 'picked' : ''}" data-id="${c.id}">
        <div class="cast-avatar">${avatarSVG(c.id, 76)}</div>
        <div class="cast-name">${c.name} ${c.rookie ? '<span class="rookie">新人</span>' : ''}</div>
        <div class="cast-tag">${c.tag}</div>
        <div class="cast-stats">
          ${statRows(c.stats)}
        </div>
        ${picked ? '<div class="check">✓</div>' : ''}
      </div>`;
  }).join('');

  app.innerHTML = `
    <div class="screen">
      <h2 class="head">キャストを4人選ぶ <span id="cnt">(${State.selectedIds.length}/4)</span></h2>
      <p class="head-sub">8人の応募者からお店のキャストを選抜しよう<br><span class="warn">⚠️ 本番では星が見えなくなる！ 誰が何が得意かを顔で覚えよう</span></p>
      <div class="cast-grid">${cards}</div>
      <button class="btn btn-primary" id="goBtn" ${State.selectedIds.length === 4 ? '' : 'disabled'}>この4人で開店！</button>
    </div>`;

  document.querySelectorAll('.cast-card').forEach(el => {
    el.onclick = () => toggleCast(el.dataset.id);
  });
  document.getElementById('goBtn').onclick = startDay;
}

function toggleCast(id) {
  const i = State.selectedIds.indexOf(id);
  if (i >= 0) State.selectedIds.splice(i, 1);
  else if (State.selectedIds.length < 4) State.selectedIds.push(id);
  render();
}

// ---------- 1日の開始 ----------
function startDay() {
  // 初日の選抜のみ roster を新規構築。2日目以降の体力は
  // confirmSwap 側で「繰越回復」を適用済みなのでここでは触らない。
  if (State.selectedIds.length === 4) {
    State.roster = State.selectedIds.map(id => {
      const base = CAST_POOL.find(c => c.id === id);
      return { ...base, stats: { ...base.stats }, stamina: 100, carryOver: 0, exp: 0 };
    });
  }

  // その日の難易度を確定（以降 makeCustomer / タイマー / 目標表示で参照）
  State.today = difficulty(State.day);

  State.customerIndex = 0;
  State.sales = 0;
  State.combo = 0;
  State.log = [];
  State.dayEarnings = {};   // その日のキャスト別売上をリセット
  State.customers = buildDayCustomers(State.today.customers);
  State.screen = 'play';
  nextCustomer();
}

// ---------- 次の客 ----------
function nextCustomer() {
  if (State.customerIndex >= State.customers.length) {
    endDay();
    return;
  }
  State.currentCustomer = State.customers[State.customerIndex];
  renderPlay();
  SFX.arrive();
  startTimer();
}

function renderPlay() {
  enterScreen();
  const c = State.currentCustomer;
  const casts = State.roster.map(cast => {
    const low = cast.stamina < 25;
    // 本番中はスキル（星）を見せない。顔と名前で判断する。
    // 体力は接客ごとに変わる状態値なのでバーで表示。
    const stamClass = cast.stamina < 25 ? 'low' : cast.stamina < 50 ? 'mid' : '';
    const lv = levelFromExp(cast.exp);
    const lvBadge = lv > 1 ? `<span class="cc-lv">Lv${lv}</span>` : '';
    return `
      <button class="cast-choice ${low ? 'tired' : ''}" data-id="${cast.id}">
        ${lvBadge}
        <span class="cc-face">${avatarSVG(cast.id, 68)}</span>
        <span class="cc-name">${cast.name}${low ? ' 😪' : ''}</span>
        <span class="cc-stambar ${stamClass}"><i style="width:${cast.stamina}%"></i></span>
      </button>`;
  }).join('');

  const goalPct = Math.min(100, Math.round(State.sales / State.today.goal * 100));
  const comboBadge = State.combo >= 2
    ? `<span class="combo-badge">🔥${State.combo}連続的中 <b>+${Math.round(comboMult(State.combo) * 100 - 100)}%</b></span>`
    : '';
  const custClass = c.isNomination ? 'nomination' : c.isEvent ? 'event' : '';
  const custTitle = c.isNomination ? '💐' + c.title : c.isEvent ? '⚡' + c.title : c.title;

  app.innerHTML = `
    <div class="screen play-screen">
      <div class="hud">
        <span>DAY ${State.day}</span>
        <span>${State.customerIndex + 1}/${State.customers.length}組目</span>
        <span>売上 ${yen(State.sales)}</span>
        <button class="mute-btn" id="muteBtn" title="効果音">${SFX.muted ? '🔇' : '🔊'}</button>
      </div>
      <div class="goalbar"><div class="goalbar-fill" style="width:${goalPct}%"></div><span class="goalbar-txt">目標 ${yen(State.today.goal)}</span></div>

      ${comboBadge}
      <div class="timer" id="timer">${State.timeLeft}</div>

      <div class="customer ${custClass}">
        <div class="cust-emoji">${customerFace(c, 100)}</div>
        ${c.name ? `<div class="cust-name">${c.name}</div>` : ''}
        <div class="cust-title">${custTitle}</div>
        <div class="cust-profile">${c.profile}</div>
        ${c.line ? `<div class="cust-line">“${c.line}”</div>` : ''}
        <div class="cust-need">「${c.desc}」</div>
        <div class="cust-budget">予算 ${yen(c.budget)}</div>
      </div>

      <p class="pick-label">誰を付ける？</p>
      <div class="choice-grid">${casts}</div>
    </div>`;

  document.querySelectorAll('.cast-choice').forEach(el => {
    el.onclick = () => chooseCast(el.dataset.id);
  });
  document.getElementById('muteBtn').onclick = (e) => {
    e.stopPropagation();
    SFX.toggle();
    e.currentTarget.textContent = SFX.muted ? '🔇' : '🔊';
  };
}

// ---------- 制限時間 ----------
function startTimer() {
  clearInterval(State.timer);
  State.timeLeft = State.today.timeLimit;
  const tEl = document.getElementById('timer');
  if (tEl) tEl.textContent = State.timeLeft;
  State.timer = setInterval(() => {
    State.timeLeft--;
    const el = document.getElementById('timer');
    if (el) {
      el.textContent = State.timeLeft;
      el.classList.toggle('urgent', State.timeLeft <= 3);
    }
    if (State.timeLeft > 0 && State.timeLeft <= 3) SFX.tick();
    if (State.timeLeft <= 0) {
      clearInterval(State.timer);
      timeUp();
    }
  }, 1000);
}

function timeUp() {
  // 時間切れ：判断できず機会損失（最低売上）
  const c = State.currentCustomer;
  const lostSales = Math.round(c.budget * 0.1 / 1000) * 1000;
  State.sales += lostSales;
  State.combo = 0; // 迷っている間にコンボが途切れる
  const result = { star: 0, sales: lostSales, gotRepeater: false, comment: '迷っているうちにお客様は帰ってしまった…' };
  SFX.star(1);
  recordLog(null, result, true);
  showResult(null, result);
}

// ---------- キャスト選択 ----------
function chooseCast(id) {
  clearInterval(State.timer);
  const cust = State.currentCustomer;
  const cast = State.roster.find(c => c.id === id);
  const result = judge(cast, cust);

  // 的中判定：指名なら「お目当ての子か」、通常なら「ニーズ最適の子か」
  const need = cust.need;
  const maxStat = Math.max.apply(null, State.roster.map(c => c.stats[need]));
  const hit = cust.isNomination ? result.nominateHit === true : cast.stats[need] === maxStat;

  // 連続的中コンボ（外すとリセット）
  State.combo = hit ? State.combo + 1 : 0;
  if (State.combo > State.maxCombo) State.maxCombo = State.combo;
  const cMult = comboMult(State.combo);
  const comboStep = cMult - 1; // 表示用（0なら非表示）
  if (comboStep > 0) result.sales = Math.round(result.sales * cMult / 1000) * 1000;
  result.combo = State.combo;
  result.comboBonus = comboStep;

  // 育成EXP（★の数だけ加算。指名成功はボーナス）
  const before = levelFromExp(cast.exp);
  cast.exp = (cast.exp || 0) + result.star + (result.nominateHit === true ? 2 : 0);
  const after = levelFromExp(cast.exp);
  result.leveledUp = after > before;
  result.newLevel = after;

  State.sales += result.sales;
  if (result.gotRepeater) State.repeaters++;

  // リピーター管理：★4以上でこの客が「指名先＝この子」として再来店しうる
  if (result.gotRepeater) {
    addRepeater(cast.id, cust);
  } else if (cust.isNomination && result.nominateHit === false) {
    // お目当てを外したので、この常連は二度と来ない（既にプールから消費済み）
  }

  recordLog(cast, result, false);

  // 体力の増減
  State.roster.forEach(c => {
    if (c.id === id) c.stamina = Math.max(0, c.stamina - DAY_CONFIG.staminaCost);
    else c.stamina = Math.min(100, c.stamina + DAY_CONFIG.staminaRecover);
  });

  // 効果音
  SFX.star(result.star);
  if (result.nominateHit === true) SFX.nominate();
  if (comboStep > 0) SFX.combo(State.combo);
  if (result.sales > 0) SFX.cash();
  if (result.leveledUp) SFX.levelup();

  Achieve.onServe({
    star: result.star,
    sales: result.sales,
    combo: State.combo,
    nominateHit: result.nominateHit,
    level: result.newLevel,
  });

  showResult(cast, result);
}

// この客を「castId のリピーター」として再来店プールに登録
function addRepeater(castId, cust) {
  State.repeaterPool.push({
    castId,
    name: cust.name,
    need: cust.need,
    emoji: cust.emoji,
    iconId: cust.iconId,
    title: cust.title,
    bg: cust.bg,
    bg2: cust.bg2,
    age: cust.age,
    budget: cust.budget,
  });
}

// ---------- 接客履歴を記録（振り返り用） ----------
// chosenCast が null なら時間切れ。最適 = 客のニーズstatが最も高いキャスト。
function recordLog(chosenCast, result, timeout) {
  const cust = State.currentCustomer;
  const need = cust.need;
  const maxStat = Math.max.apply(null, State.roster.map(c => c.stats[need]));
  const optimal = State.roster.find(c => c.stats[need] === maxStat);
  const chosenStat = chosenCast ? chosenCast.stats[need] : -1;
  State.log.push({
    custEmoji: cust.emoji,
    custLabel: cust.isEvent ? cust.title : NEEDS[need].label,
    chosenId: chosenCast ? chosenCast.id : null,
    star: result.star,
    sales: result.sales,
    optimalId: optimal.id,
    hit: !timeout && chosenStat === maxStat, // 最高stat帯を選べていれば正解
    timeout: !!timeout,
  });
  // キャスト別売上を蓄積（付けたキャストがいる時のみ）：通算＋その日
  if (chosenCast && result.sales > 0) {
    State.castEarnings[chosenCast.id] = (State.castEarnings[chosenCast.id] || 0) + result.sales;
    State.dayEarnings[chosenCast.id] = (State.dayEarnings[chosenCast.id] || 0) + result.sales;
  }
}

// ---------- 結果ポップアップ ----------
function showResult(cast, result) {
  const starLine = result.star > 0 ? `<div class="res-stars">${stars(result.star)}</div>` : '<div class="res-stars fail">時間切れ</div>';
  const comboLine = result.comboBonus > 0
    ? `<div class="res-combo">🔥 ${result.combo}連続的中ボーナス <b>+${Math.round(result.comboBonus * 100)}%</b></div>`
    : '';
  const levelLine = result.leveledUp && cast
    ? `<div class="res-level">⬆️ ${cast.name} が Lv${result.newLevel} に成長！</div>`
    : '';
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="result-card ${result.star >= 4 ? 'good' : result.star <= 1 ? 'bad' : ''}">
      ${cast ? `<div class="res-cast"><span class="res-face">${avatarSVG(cast.id, 56)}</span>${cast.name}</div>` : ''}
      ${starLine}
      <div class="res-comment">${result.comment}</div>
      ${comboLine}
      <div class="res-sales">売上 +<span id="salesCount">¥0</span></div>
      ${result.gotRepeater ? '<div class="res-repeat">✨ リピーター獲得！</div>' : ''}
      ${levelLine}
      <button class="btn btn-primary" id="nextBtn">次のお客へ</button>
    </div>`;
  app.appendChild(overlay);
  animateCount(document.getElementById('salesCount'), result.sales, 550);
  document.getElementById('nextBtn').onclick = () => {
    SFX.tap();
    overlay.remove();
    State.customerIndex++;
    nextCustomer();
  };
}

// 数値を 0 → to まで滑らかにカウントアップ（¥表記）
function animateCount(el, to, dur) {
  if (!el) return;
  if (to <= 0) { el.textContent = yen(0); return; }
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3); // ease-out
    const v = Math.round(to * eased / 1000) * 1000;
    el.textContent = yen(v);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = yen(to);
  };
  requestAnimationFrame(step);
}

// ---------- 1日の終了 ----------
function endDay() {
  // 役職の昇格判定（今日の売上を加える前後で比較）
  const prevRankIdx = rankFor(State.totalSales).index;
  State.totalSales += State.sales;
  const newRank = rankFor(State.totalSales);
  State.rankUp = newRank.index > prevRankIdx ? { from: RANKS[prevRankIdx], to: RANKS[newRank.index] } : null;

  State.screen = 'dayresult';
  const achieved = State.sales >= State.today.goal;
  if (!achieved) SFX.bgmStop(); // ゲームオーバーはBGMを止めて余韻を消す
  setTimeout(() => achieved ? SFX.fanfare() : SFX.gameover(), 250);
  if (State.rankUp) setTimeout(() => SFX.levelup(), 950); // 昇格ジングル

  const hits = State.log.filter(l => l.hit).length;
  Achieve.onDayEnd({
    day: State.day,
    achieved,
    perfect: State.log.length > 0 && hits === State.log.length,
    repeaters: State.repeaters,
    totalSales: State.totalSales,
    rankIndex: newRank.index,
  });

  renderDayResult();
}

// 稼ぎ頭ランキングのHTML（source: castId→金額。headingで見出しを切替）
function castEarningsHTML(source, heading, open) {
  const entries = Object.keys(source)
    .map(id => ({ id, amount: source[id] }))
    .filter(e => e.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  if (entries.length === 0) return '';
  const medals = ['🥇', '🥈', '🥉'];
  const rows = entries.map((e, i) => {
    const cast = CAST_POOL.find(c => c.id === e.id);
    const name = cast ? cast.name : '？';
    return `
      <div class="earn-row ${i === 0 ? 'top' : ''}">
        <span class="earn-rank">${medals[i] || (i + 1)}</span>
        <span class="earn-face">${avatarSVG(e.id, 34)}</span>
        <span class="earn-name">${name}</span>
        <span class="earn-amount">${yen(e.amount)}</span>
      </div>`;
  }).join('');
  return `
    <details class="rsec cast-earnings" ${open ? 'open' : ''}>
      <summary>${heading}</summary>
      <div class="rsec-body">${rows}</div>
    </details>`;
}

function renderDayResult() {
  enterScreen();
  const achieved = State.sales >= State.today.goal;
  const hits = State.log.filter(l => l.hit).length;

  // 黒服ランク（通算売上ベース）と次の役職までの進捗
  const rk = rankFor(State.totalSales);
  const rankSection = `
    ${State.rankUp ? `<div class="rankup-banner">🎉 昇格！ ${State.rankUp.from.title} → <b>${State.rankUp.to.emoji} ${State.rankUp.to.title}</b></div>` : ''}
    <div class="rank-card">
      <div class="rank-now"><span class="rank-emoji">${rk.emoji}</span><span class="rank-title">${rk.title}</span></div>
      ${rk.next
        ? `<div class="rank-prog"><i style="width:${rk.progress}%"></i></div>
           <div class="rank-next">次の役職「${rk.next.title}」まで あと ${yen(rk.next.min - State.totalSales)}</div>`
        : `<div class="rank-next">最高役職に到達！</div>`}
    </div>`;

  // 接客ふりかえり：客ごとに「あなたの選択」と「最適だった子」を並べる
  const rows = State.log.map(l => {
    const optName = CAST_POOL.find(c => c.id === l.optimalId).name;
    const yourFace = l.chosenId
      ? avatarSVG(l.chosenId, 34)
      : '<span class="rv-timeout">🕒</span>';
    const yourResult = l.timeout ? '時間切れ' : stars(l.star);
    return `
      <div class="rv-row ${l.hit ? 'ok' : 'ng'}">
        <div class="rv-top">
          <span class="rv-cust">${l.custEmoji} ${l.custLabel}</span>
          <span class="rv-mark">${l.hit ? '○ 正解' : '× 惜しい'}</span>
        </div>
        <div class="rv-bottom">
          <div class="rv-c">
            <small>あなた</small>
            ${yourFace}
            <em>${yourResult}</em>
          </div>
          <div class="rv-vs">${l.hit ? '＝' : '→'}</div>
          <div class="rv-c">
            <small>最適</small>
            ${avatarSVG(l.optimalId, 34)}
            <em>${optName}</em>
          </div>
        </div>
      </div>`;
  }).join('');

  // 目標未達はゲームオーバー（翌日には進めない）。スコアはここで登録。
  const rank = achieved ? -1 : scoreRank(State.totalSales);
  const canRegister = rank >= 0 && !State.scoreSaved;

  let scoreArea = '';
  if (!achieved) {
    scoreArea = canRegister
      ? `<div class="score-register">
           <div class="sr-title">🏆 ランキング ${rank + 1}位にランクイン！</div>
           <div class="sr-form">
             <input id="nameInput" class="name-input" type="text" maxlength="8" placeholder="なまえ（8文字まで）" autocomplete="off">
             <button class="btn btn-primary sr-btn" id="regBtn">登録</button>
           </div>
         </div>`
      : `<div class="ranking">
           <div class="ranking-head">🏆 ハイスコア（通算売上）</div>
           ${rankingHTML(State.lastScoreTs)}
         </div>`;
  }

  const buttons = achieved
    ? `<button class="btn btn-primary" id="nextDayBtn">DAY ${State.day + 1} へ</button>
       <button class="btn btn-ghost" id="shareBtn">📣 結果をシェア</button>
       <button class="btn btn-ghost" id="titleBtn">タイトルへ戻る</button>`
    : `<button class="btn btn-primary" id="retryBtn">もう一度プレイ</button>
       <button class="btn btn-ghost" id="shareBtn">📣 結果をシェア</button>`;

  app.innerHTML = `
    <div class="screen result-screen ${achieved ? '' : 'gameover'}">
      <h2 class="day-result-head">${achieved ? '🎉 目標達成！' : '💀 GAME OVER'}</h2>
      ${achieved ? '' : `<p class="gameover-sub">DAY ${State.day} で目標に届かず閉店…</p>`}
      <div class="big-sales" id="bigSales">${yen(State.sales)}</div>
      <p class="day-goal">目標 ${yen(State.today.goal)}</p>
      <div class="result-stats">
        <div>${achieved ? '通算売上' : '通算売上（DAY' + State.day + 'まで）'} <b>${yen(State.totalSales)}</b></div>
        <div>獲得リピーター <b>${State.repeaters}人</b></div>
        <div>付け回し的中 <b>${hits}/${State.log.length}</b></div>
        <div>最大コンボ <b>${State.maxCombo}連続</b></div>
      </div>

      ${rankSection}

      ${castEarningsHTML(State.dayEarnings, '💰 本日の稼ぎ頭', true)}
      ${castEarningsHTML(State.castEarnings, '👑 稼ぎ頭ランキング（通算）', false)}

      ${scoreArea}

      <details class="rsec review">
        <summary>📋 接客ふりかえり<span class="rsec-count">${State.log.length}件</span></summary>
        <div class="rsec-body review-list">${rows}</div>
      </details>

      ${buttons}
    </div>`;

  animateCount(document.getElementById('bigSales'), State.sales, 800);

  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) shareBtn.onclick = () => { SFX.tap(); shareResult(); };

  if (achieved) {
    document.getElementById('nextDayBtn').onclick = () => {
      SFX.tap();
      State.day++;
      State.selectedIds = []; // rosterは維持
      State.swapOutIds = [];
      State.screen = 'roster'; // 翌日はまずメンバー編成へ
      render();
    };
    document.getElementById('titleBtn').onclick = resetToTitle;
  } else {
    document.getElementById('retryBtn').onclick = resetToTitle;
    if (canRegister) {
      document.getElementById('regBtn').onclick = () => {
        const name = document.getElementById('nameInput').value.trim();
        const ts = Date.now();
        registerScore(name, State.totalSales, State.day, ts);
        State.scoreSaved = true;
        State.lastScoreTs = ts;
        renderDayResult(); // 登録フォーム→ランキング表示に切り替え
      };
    }
  }
}

// 結果をシェア（Web Share API。非対応ならクリップボードにコピー）
function shareResult() {
  const text = `『付け回しマスター』DAY${State.day}まで到達！\n通算売上 ${yen(State.totalSales)} / 最大コンボ ${State.maxCombo}連続 / リピーター ${State.repeaters}人\n#付け回しマスター`;
  const data = { title: '付け回しマスター', text, url: location.href };
  if (navigator.share) {
    navigator.share(data).catch(() => { /* キャンセル等は無視 */ });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text + '\n' + location.href)
      .then(() => toast('結果をコピーしました！'))
      .catch(() => toast('コピーに失敗しました'));
  } else {
    toast('この端末ではシェアに未対応です');
  }
}

// 画面下に一瞬だけ出るトースト
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 1800);
}

// 通算成績をリセットしてタイトルへ
function resetToTitle() {
  SFX.bgmStop();
  State.day = 1; State.totalSales = 0; State.repeaters = 0; State.roster = [];
  State.repeaterPool = []; State.combo = 0; State.maxCombo = 0;
  State.screen = 'title';
  render();
}

// ---------- 翌日のメンバー編成（最大2人を入れ替え） ----------
function renderRosterEdit() {
  enterScreen();
  const cards = State.roster.map(c => {
    const out = State.swapOutIds.includes(c.id);
    const carry = c.carryOver || 0;
    // この画面の体力は前日終了時点（繰越回復は開店確定後に適用）
    const stamClass = c.stamina < 25 ? 'low' : c.stamina < 50 ? 'mid' : '';
    // 翌日の想定回復量（多く繰り越したキャストほど回復が鈍る）
    const rec = overnightRecovery(carry);
    const lv = levelFromExp(c.exp);
    return `
      <div class="cast-card ${out ? 'swap-out' : ''}" data-id="${c.id}">
        <button class="cast-info" data-info="${c.id}" title="詳細">ℹ️</button>
        <div class="cast-avatar">${avatarSVG(c.id, 76)}</div>
        <div class="cast-name">${c.name} <span class="lv-tag">Lv${lv}</span> ${c.rookie ? '<span class="rookie">新人</span>' : ''}</div>
        <div class="cast-tag">${c.tag}</div>
        <div class="cast-stats">
          ${statRows(c.stats)}
        </div>
        <div class="edit-stam">
          <span class="edit-stam-label">体力 ${c.stamina}%</span>
          <span class="cc-stambar ${stamClass}"><i style="width:${c.stamina}%"></i></span>
          <span class="edit-carry">繰越${carry + 1}日目 ・ 明日+${rec}</span>
        </div>
        ${out ? '<div class="check swap">交代</div>' : ''}
      </div>`;
  }).join('');

  const n = State.swapOutIds.length;
  const btnLabel = n === 0 ? 'このメンバーで開店！' : `${n}人を入れ替えて開店！`;

  // これから始まる日の難易度（DAYは繰越時に加算済み）
  const diff = difficulty(State.day);
  const prevGoal = difficulty(State.day - 1).goal;
  const harder = diff.goal > prevGoal ? '<span class="diff-up">▲難易度UP</span>' : '';

  // 席数（黒服の成長で増える）。前日より増えていれば開店時に新メンバーが加入。
  const cap = capacity(State.day);
  const newSeats = cap - State.roster.length;
  const seatBanner = newSeats > 0
    ? `<div class="seat-banner">🪑 席が ${newSeats} つ増えた！ 開店時に新メンバーが ${newSeats}人 加入します（席数 ${cap}）</div>`
    : '';

  app.innerHTML = `
    <div class="screen">
      <h2 class="head">メンバー編成 <span id="cnt">DAY ${State.day}</span></h2>
      <div class="day-brief">
        <span>🎯 目標 <b>${yen(diff.goal)}</b></span>
        <span>👥 来店 ${diff.customers}組</span>
        <span>⏱ 制限 ${diff.timeLimit}秒</span>
        <span>🪑 席 ${cap}</span>
        ${harder}
      </div>
      ${seatBanner}
      <p class="head-sub">入れ替えたいキャストを選ぼう（最大2人）<br><span class="warn">🔄 交代要員はランダムに入店！誰が来るかはお楽しみ</span></p>
      <div class="cast-grid">${cards}</div>
      <button class="btn btn-primary" id="goBtn">${btnLabel}</button>
    </div>`;

  document.querySelectorAll('.cast-card').forEach(el => {
    el.onclick = () => toggleSwap(el.dataset.id);
  });
  document.querySelectorAll('.cast-info').forEach(el => {
    el.onclick = (e) => { e.stopPropagation(); SFX.tap(); showCastDetail(el.dataset.info); };
  });
  document.getElementById('goBtn').onclick = confirmSwap;
}

// キャスト詳細（育成の見える化：レベル・EXP・能力・体力）
function showCastDetail(id) {
  const c = State.roster.find(x => x.id === id);
  if (!c) return;
  const lv = levelFromExp(c.exp);
  const bonus = Math.round((lv - 1) * LEVEL.bonusPerLevel * 100);
  const isMax = lv >= LEVEL.maxLevel;
  // 現レベル内でのEXP進捗
  const into = (c.exp || 0) - (lv - 1) * LEVEL.expPerLevel;
  const expPct = isMax ? 100 : Math.round(into / LEVEL.expPerLevel * 100);
  const expLabel = isMax ? 'MAX' : `${into} / ${LEVEL.expPerLevel}`;
  const stamClass = c.stamina < 25 ? 'low' : c.stamina < 50 ? 'mid' : '';

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="result-card detail-card">
      <div class="detail-head">
        <span class="detail-face">${avatarSVG(c.id, 72)}</span>
        <div class="detail-id">
          <div class="detail-name">${c.name} ${c.rookie ? '<span class="rookie">新人</span>' : ''}</div>
          <div class="detail-tag">${c.tag}</div>
        </div>
        <div class="detail-lv">Lv<b>${lv}</b></div>
      </div>
      <div class="detail-exp">
        <div class="detail-exp-top"><span>育成EXP</span><span>${expLabel}</span></div>
        <div class="exp-bar ${isMax ? 'max' : ''}"><i style="width:${expPct}%"></i></div>
        <div class="detail-bonus">売上ボーナス <b>+${bonus}%</b>${isMax ? '（最大）' : ` ・ 次のLvで +${LEVEL.bonusPerLevel * 100}%`}</div>
      </div>
      <div class="detail-stats">${statRows(c.stats)}</div>
      <div class="detail-stam">
        <span>体力 ${c.stamina}%</span>
        <span class="cc-stambar ${stamClass}"><i style="width:${c.stamina}%"></i></span>
      </div>
      <button class="btn btn-primary" id="detailClose">閉じる</button>
    </div>`;
  app.appendChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); } };
  document.getElementById('detailClose').onclick = () => { SFX.tap(); overlay.remove(); };
}

function toggleSwap(id) {
  const i = State.swapOutIds.indexOf(id);
  if (i >= 0) State.swapOutIds.splice(i, 1);
  else if (State.swapOutIds.length < 2) State.swapOutIds.push(id);
  render();
}

// 繰越メンバーが一晩で回復する体力量。繰越回数が多いほど減る。
function overnightRecovery(carryOver) {
  const rec = DAY_CONFIG.overnightRecoverBase - carryOver * DAY_CONFIG.overnightRecoverStep;
  return Math.max(DAY_CONFIG.overnightRecoverMin, rec);
}

function confirmSwap() {
  const outIds = State.swapOutIds;

  // 現メンバー以外からランダムに交代要員を選出
  const currentIds = State.roster.map(c => c.id);
  const available = CAST_POOL.filter(c => !currentIds.includes(c.id));
  const newcomers = pickRandom(available, outIds.length);

  const incoming = [];
  State.roster = State.roster.map(c => {
    if (outIds.includes(c.id) && newcomers.length) {
      // 交代要員はフレッシュ（体力全開・繰越0）で入店
      const base = newcomers.shift();
      const fresh = { ...base, stats: { ...base.stats }, stamina: 100, carryOver: 0, exp: 0 };
      incoming.push(fresh);
      return fresh;
    }
    // 繰越メンバー：全開にはせず、繰越回数に応じた量だけ回復
    const rec = overnightRecovery(c.carryOver || 0);
    return { ...c, stamina: Math.min(100, c.stamina + rec), carryOver: (c.carryOver || 0) + 1 };
  });

  // 席数が増えていれば、空いた席の分だけ新メンバーを追加雇用
  const extraSeats = capacity(State.day) - State.roster.length;
  if (extraSeats > 0) {
    const usedIds = State.roster.map(c => c.id);
    const pool = CAST_POOL.filter(c => !usedIds.includes(c.id));
    pickRandom(pool, extraSeats).forEach(base => {
      const fresh = { ...base, stats: { ...base.stats }, stamina: 100, carryOver: 0, exp: 0 };
      State.roster.push(fresh);
      incoming.push(fresh);
    });
  }

  if (incoming.length) showNewcomers(incoming);
  else startDay();
}

// 交代で入店した新メンバーをお披露目してから1日開始
// 演出: 入店ジングル→カードが1枚ずつ弾んで登場＋キラキラが舞う
function showNewcomers(incoming) {
  SFX.newcomer();
  const cards = incoming.map((c, i) => `
    <div class="newcomer nc-enter" style="animation-delay:${0.25 + i * 0.22}s">
      <div class="cast-avatar">${avatarSVG(c.id, 72)}</div>
      <div class="cast-name">${c.name} ${c.rookie ? '<span class="rookie">新人</span>' : ''}</div>
      <div class="cast-tag">${c.tag}</div>
      <div class="cast-stats">
        ${statRows(c.stats)}
      </div>
    </div>`).join('');

  // カードの周囲に舞うキラキラ（位置・タイミングはランダム）
  const sparks = Array.from({ length: 8 }, () => {
    const left = 5 + Math.random() * 90;
    const delay = Math.random() * 1.4;
    const size = 10 + Math.random() * 10;
    return `<span class="nc-spark" style="left:${left}%;animation-delay:${delay}s;font-size:${size}px">✦</span>`;
  }).join('');

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="result-card good newcomer-card">
      <div class="nc-sparks">${sparks}</div>
      <div class="newcomer-head nc-head">✨ 新しい仲間が入店！</div>
      <div class="newcomer-grid">${cards}</div>
      <button class="btn btn-primary" id="startDayBtn">開店！</button>
    </div>`;
  app.appendChild(overlay);
  document.getElementById('startDayBtn').onclick = () => { SFX.tap(); overlay.remove(); startDay(); };
}

// ---------- 起動 ----------
render();
