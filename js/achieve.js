// ===============================================
// 付け回しマスター - 実績（アチーブメント）
// 解除状況は localStorage に永続化。解除時は自前のトーストで通知する
// （game.js の toast はシェア用の白トーストなので流用しない）。
// ===============================================

const Achieve = (() => {
  const KEY = 'kurofuku_achievements';

  // 実績定義。check は onServe / onDayEnd から渡されるイベントで判定する。
  const DEFS = [
    { id: 'day1',     emoji: '🌅', title: '初日の壁',       desc: 'DAY1の売上目標を達成する' },
    { id: 'day4',     emoji: '🪑', title: '店を広げる男',   desc: 'DAY4に到達する（席が5つに）' },
    { id: 'day7',     emoji: '📅', title: '一週間の激務',   desc: 'DAY7の売上目標を達成する' },
    { id: 'day10',    emoji: '🌃', title: '夜の街の主',     desc: 'DAY10の売上目標を達成する' },
    { id: 'star5',    emoji: '🌟', title: '完璧な付け回し', desc: '★5の接客を出す' },
    { id: 'perfect',  emoji: '💯', title: 'パーフェクト',   desc: '1日の接客をすべて的中させる' },
    { id: 'combo6',   emoji: '🔥', title: 'コンボの鬼',     desc: '6連続で付け回しを的中させる' },
    { id: 'nominate', emoji: '💐', title: '指名御礼',       desc: '指名客をお目当ての子に付ける' },
    { id: 'big1',     emoji: '🍾', title: '太客ゲット',     desc: '1組から15万円以上の売上を上げる' },
    { id: 'rep10',    emoji: '🫶', title: '常連づくりの達人', desc: '1プレイでリピーターを10人獲得する' },
    { id: 'm1',       emoji: '💰', title: 'ミリオン黒服',   desc: '通算売上100万円を突破する' },
    { id: 'm5',       emoji: '💎', title: '五百万の男',     desc: '通算売上500万円を突破する' },
    { id: 'lv5',      emoji: '🎓', title: '育成の名人',     desc: 'キャストを Lv5（最大）まで育てる' },
    { id: 'tencho',   emoji: '👑', title: '店長就任',       desc: '役職「店長」に昇格する' },
    // --- 隠し実績（hidden: true。解除するまで一覧では「？？？」表示） ---
    { id: 'drunk5',   emoji: '🥴', title: '介抱のプロ',     desc: '酔っ払いのお客様に★5の接客をする',             hidden: true },
    { id: 'nolost',   emoji: '⏱️', title: '迷いなき采配',   desc: '一度も時間切れせずに DAY5 の目標を達成する',    hidden: true },
    { id: 'rookies',  emoji: '🌱', title: 'フレッシュ開店', desc: '新人だけの編成で1日の目標を達成する',           hidden: true },
    { id: 'legend',   emoji: '🏆', title: '生きる伝説',     desc: '役職「伝説の黒服」に昇格する',                  hidden: true },
    { id: 'life30m',  emoji: '🌃', title: '夜に生きる男',   desc: '生涯売上3000万円を突破する（全プレイの通算）',  hidden: true },
  ];

  let unlocked = {};
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (v && typeof v === 'object') unlocked = v;
  } catch (e) { /* 非対応環境は無視 */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(unlocked)); } catch (e) { /* 無視 */ }
  }

  // ---- 解除トースト（連続解除は順番に表示） ----
  const queue = [];
  let showing = false;
  function pump() {
    if (showing || !queue.length) return;
    showing = true;
    const def = queue.shift();
    const t = document.createElement('div');
    t.className = 'ach-toast';
    t.innerHTML = `<span class="ach-toast-emoji">${def.emoji}</span><span><small>実績解除！</small><b>${def.title}</b></span>`;
    document.body.appendChild(t);
    if (typeof SFX !== 'undefined') SFX.levelup();
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => { t.remove(); showing = false; pump(); }, 350);
    }, 2200);
  }

  function unlock(id) {
    if (unlocked[id]) return;
    const def = DEFS.find(d => d.id === id);
    if (!def) return;
    unlocked[id] = Date.now();
    save();
    queue.push(def);
    pump();
  }

  // ---- ゲーム側から呼ぶフック ----
  // 接客1回ごと（chooseCast の結果確定後）
  function onServe(ev) {
    if (ev.star >= 5) unlock('star5');
    if (ev.combo >= 6) unlock('combo6');
    if (ev.nominateHit === true) unlock('nominate');
    if (ev.sales >= 150000) unlock('big1');
    if (ev.level >= 5) unlock('lv5');
    if (ev.custId === 'drunk' && ev.star >= 5) unlock('drunk5'); // 隠し：酔っ払いに★5
  }

  // 1日の終了ごと（endDay）
  function onDayEnd(ev) {
    if (ev.achieved) {
      if (ev.day >= 1) unlock('day1');
      if (ev.day >= 4) unlock('day4');
      if (ev.day >= 7) unlock('day7');
      if (ev.day >= 10) unlock('day10');
    }
    if (ev.perfect) unlock('perfect');
    if (ev.repeaters >= 10) unlock('rep10');
    if (ev.totalSales >= 1000000) unlock('m1');
    if (ev.totalSales >= 5000000) unlock('m5');
    if (ev.rankIndex >= 4) unlock('tencho'); // RANKS[4] = 店長
    // --- 隠し実績 ---
    if (ev.achieved && ev.day >= 5 && ev.runTimeouts === 0) unlock('nolost'); // run内 時間切れ0でDAY5達成
    if (ev.achieved && ev.allRookie) unlock('rookies');                       // 編成全員が新人で目標達成
    if (ev.rankIndex >= 6) unlock('legend');                                  // RANKS[6] = 伝説の黒服
    if (ev.lifeSales >= 30000000) unlock('life30m');                          // 生涯売上3000万（全run通算）
  }

  return {
    DEFS,
    onServe,
    onDayEnd,
    has(id) { return !!unlocked[id]; },
    count() { return DEFS.filter(d => unlocked[d.id]).length; },
  };
})();
