// ===============================================
// 付け回しマスター - ヘッドレス・バランスシミュレータ
// 使い方: node tools/sim.js [試行回数]
//
// data.js / game.js を DOM・SFX をスタブ化して実行し、
// 実際の judge / chooseCast / difficulty で1日をまわす。
// v22 で追加された滑らかな体力カーブ・客単価0.72 に加え、
// 「制限時間切れ」（残課題だった要素）を確率でモデル化する。
// ===============================================
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RUNS = parseInt(process.argv[2], 10) || 2000;
const MAXDAY = 15;
// 追加引数 key=value で DAY_CONFIG を上書きしてバランス探索できる
// 例: node tools/sim.js 2000 dailyGoal=240000 goalPerDay=45000
const OVERRIDE = {};
for (const a of process.argv.slice(3)) {
  const [k, v] = a.split('=');
  if (k && v !== undefined) OVERRIDE[k] = Number(v);
}

// ---------- DOM / SFX スタブ ----------
const STUBS = `
function __mkEl() {
  return {
    innerHTML: '', textContent: '', style: {}, value: '', className: '',
    classList: { toggle(){}, add(){}, remove(){}, contains(){ return false; } },
    setAttribute(){}, getAttribute(){ return null; },
    appendChild(){}, remove(){}, onclick: null, addEventListener(){},
    querySelectorAll(){ return []; }, querySelector(){ return null; },
  };
}
var document = {
  getElementById: () => __mkEl(),
  createElement: () => __mkEl(),
  querySelectorAll: () => [],
  body: __mkEl(),
};
var window = { scrollTo(){} };
var location = { href: 'sim://' };
var navigator = {};
var localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
var performance = { now: () => Date.now() };
var requestAnimationFrame = () => {};
var setInterval = () => 0, clearInterval = () => {};
var setTimeout = () => 0, clearTimeout = () => {};
var SFX = new Proxy({}, { get: () => () => {} });
var Achieve = { onServe(){}, onDayEnd(){}, has(){ return false; }, count(){ return 0; }, DEFS: [] };
var avatarSVG = () => '';
var customerFace = () => '';
`;

const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

// ---------- シミュレーション本体（vm 内で実行） ----------
const HARNESS = `
// 加入お披露目はクリック待ちなので、simでは即開店に差し替える
showNewcomers = () => startDay();

// 応募8人から4人選抜：4ニーズそれぞれの最高スタッツを1人ずつ確保
function chooseSquad(apps) {
  const ids = [];
  for (const need of ['heal', 'talk', 'price', 'smile']) {
    let best = null;
    for (const a of apps) {
      if (ids.includes(a.id)) continue;
      if (!best || a.stats[need] > best.stats[need]) best = a;
    }
    ids.push(best.id);
  }
  return ids;
}

// judge と同じ体力係数で「実効値が最大の子」を選ぶ（指名は最優先）
function pickOptimal(c) {
  if (c.isNomination) {
    const nom = State.roster.find(x => x.id === c.nominateId);
    if (nom) return nom;
  }
  let best = null, bs = -1;
  for (const cast of State.roster) {
    const t = Math.max(0, Math.min(100, cast.stamina)) / 100;
    const f = DAY_CONFIG.staminaFloor + (1 - DAY_CONFIG.staminaFloor) * Math.pow(t, DAY_CONFIG.staminaCurve);
    const s = cast.stats[c.need] * f;
    if (s > bs) { bs = s; best = cast; }
  }
  return best;
}

// 翌日の編成：一晩の回復を織り込んでも体力が低い子を最大2人入替
function pickSwaps(roster) {
  return roster
    .map(c => ({ c, rec: Math.min(100, c.stamina + overnightRecovery(c.carryOver || 0)) }))
    .filter(x => x.rec < 55)
    .sort((a, b) => a.rec - b.rec)
    .slice(0, 2)
    .map(x => x.c.id);
}

// 制限時間が短いほど時間切れしやすい（timeLimit: 8→4秒）
function timeoutChance(base, perSec) {
  return Math.min(0.5, base + perSec * (DAY_CONFIG.timeLimitSec - State.today.timeLimit));
}

const POLICIES = {
  optimal:   { label: '最適プレイ',        pick: pickOptimal, pT: () => timeoutChance(0.01, 0.015) },
  realistic: { label: '現実的(7割最適)',   pick: (c) => Math.random() < 0.7 ? pickOptimal(c) : State.roster[Math.floor(Math.random() * State.roster.length)], pT: () => timeoutChance(0.03, 0.03) },
  random:    { label: 'ランダム',          pick: () => State.roster[Math.floor(Math.random() * State.roster.length)], pT: () => timeoutChance(0.05, 0.04) },
};

// 1回プレイして「クリアできた最終DAY」を返す（DAY1未達なら0）
function runOnce(policy) {
  resetToTitle();
  startSelection();
  State.selectedIds = chooseSquad(State.applicants);
  startDay();
  while (true) {
    let guard = 0;
    while (State.screen === 'play' && guard++ < 200) {
      if (Math.random() < policy.pT()) timeUp();
      else chooseCast(policy.pick(State.currentCustomer).id);
      State.customerIndex++;
      nextCustomer();
    }
    const achieved = State.sales >= State.today.goal;
    if (!achieved) return State.day - 1;
    if (State.day >= SIM_MAXDAY) return State.day;
    State.day++;
    State.selectedIds = [];
    State.swapOutIds = pickSwaps(State.roster);
    State.screen = 'roster';
    ensureSwapPool();
    // 候補プールから能力合計が高い順にN人選ぶ（実プレイヤー相当）で即確定する
    if (State.swapOutIds.length > 0) {
      const total = (c) => Object.values(c.stats).reduce((a, b) => a + b, 0);
      const pool = [...State.swapPool].sort((a, b) => total(b) - total(a));
      State.swapSel = pool.slice(0, State.swapOutIds.length).map(c => c.id);
    }
    applySwap();
  }
}

function simulate(runs) {
  const out = {};
  for (const key of Object.keys(POLICIES)) {
    const p = POLICIES[key];
    const cleared = [];
    for (let i = 0; i < runs; i++) cleared.push(runOnce(p));
    // 生存曲線: DAY d をクリアできた割合
    const surv = [];
    for (let d = 1; d <= SIM_MAXDAY; d++) surv.push(cleared.filter(x => x >= d).length / runs);
    out[key] = { label: p.label, mean: cleared.reduce((a, b) => a + b, 0) / runs, surv };
  }
  return out;
}
// const 宣言は vm コンテキスト外から見えないので、設定値も結果に同梱する
Object.assign(DAY_CONFIG, SIM_OVERRIDE);
SIM_RESULT = { config: DAY_CONFIG, res: simulate(SIM_RUNS) };
`;

const sandbox = { console, SIM_RUNS: RUNS, SIM_MAXDAY: MAXDAY, SIM_OVERRIDE: OVERRIDE, SIM_RESULT: null };
vm.createContext(sandbox);
vm.runInContext(STUBS + read('js/data.js') + '\n' + read('js/game.js') + '\n' + HARNESS, sandbox);

// ---------- レポート ----------
const { config: cfg, res } = sandbox.SIM_RESULT;
console.log(`付け回しマスター バランスsim（${RUNS}回/ポリシー・時間切れモデル込み）`);
console.log(`goal=${cfg.dailyGoal / 1000}k+${cfg.goalPerDay / 1000}k/日, budgetScale=${cfg.budgetScale}, staminaFloor=${cfg.staminaFloor}, curve=${cfg.staminaCurve}\n`);
const days = [1, 2, 3, 4, 5, 6, 8, 10, 12];
console.log('ポリシー            平均DAY  ' + days.map(d => `D${d}`.padStart(5)).join(''));
for (const key of Object.keys(res)) {
  const r = res[key];
  const cells = days.map(d => (Math.round(r.surv[d - 1] * 100) + '%').padStart(5)).join('');
  console.log(`${r.label.padEnd(12, '　')} ${r.mean.toFixed(1).padStart(6)}  ${cells}`);
}
