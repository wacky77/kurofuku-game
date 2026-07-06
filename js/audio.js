// ===============================================
// 付け回しマスター - 効果音（Web Audio で合成／外部ファイル不要）
// AudioContext はユーザー操作で初めて起こす（自動再生ポリシー対策）。
// ミュート状態は localStorage に保存。
// ===============================================

const SFX = (() => {
  const MUTE_KEY = 'kurofuku_muted';
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { /* 無視 */ }

  // 最初のユーザー操作で AudioContext を用意（以降は使い回す）
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // 単音を鳴らす。freq: Hz / dur: 秒 / type: 波形 / vol: 音量 / at: 開始遅延
  function tone(freq, dur, type = 'sine', vol = 0.2, at = 0) {
    const c = ac();
    if (!c || muted) return;
    const t0 = c.currentTime + at;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // 周波数を滑らせる音（ピッチスライド）
  function slide(f1, f2, dur, type = 'sine', vol = 0.2, at = 0) {
    const c = ac();
    if (!c || muted) return;
    const t0 = c.currentTime + at;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t0);
    osc.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // ドレミ…の音名→周波数（簡易）
  const NOTE = { C:261.63, D:293.66, E:329.63, F:349.23, G:392.0, A:440.0, B:493.88,
                 C5:523.25, D5:587.33, E5:659.25, G5:783.99, A5:880.0, C6:1046.5 };
  function melody(notes, step = 0.1, type = 'triangle', vol = 0.22) {
    notes.forEach((n, i) => tone(NOTE[n] || n, step * 1.6, type, vol, i * step));
  }

  // はじく音（BGMのベース・アルペジオ用）。短い減衰で軽快に。
  function pluck(freq, dur, vol, type = 'triangle', at = 0) {
    const c = ac();
    if (!c || muted) return;
    const t0 = c.currentTime + at;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0006, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // --- BGM：明るいポップな進行を弾むアルペジオでループ ---
  // I–V–vi–IV（C→G→Am→F）。跳ねるベース＋上昇アルペジオで楽しげに。
  const BGM_PROG = [
    { root: 130.81, chord: [261.63, 329.63, 392.00] }, // C  (C4 E4 G4)
    { root: 98.00,  chord: [293.66, 392.00, 493.88] }, // G  (D4 G4 B4)
    { root: 110.00, chord: [329.63, 440.00, 523.25] }, // Am (E4 A4 C5)
    { root: 174.61, chord: [349.23, 440.00, 523.25] }, // F  (F4 A4 C5)
  ];
  const BGM_STEP_MS = 190;   // 1ステップ(8分音符相当)
  const STEPS_PER_CHORD = 8; // 1コード＝8ステップ
  let bgmTimer = null, bgmStep = 0;
  function bgmTick() {
    if (muted) return;
    const ch = BGM_PROG[Math.floor(bgmStep / STEPS_PER_CHORD) % BGM_PROG.length];
    const s = bgmStep % STEPS_PER_CHORD;
    // 跳ねるベース：頭で root、裏拍で 5th
    if (s === 0)      pluck(ch.root, 0.34, 0.09, 'triangle');
    else if (s === 4) pluck(ch.root * 1.5, 0.26, 0.07, 'triangle');
    // 上昇アルペジオ（後半はオクターブ上げてキラッと）
    const note = ch.chord[s % ch.chord.length] * (s >= 6 ? 2 : 1);
    pluck(note, 0.15, s % 2 === 0 ? 0.05 : 0.038, 'square');
    bgmStep++;
  }

  return {
    get muted() { return muted; },
    toggle() {
      muted = !muted;
      try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) { /* 無視 */ }
      if (!muted) this.tap(); // オンにした合図
      return muted;
    },
    // UIタップ
    tap()   { tone(520, 0.07, 'square', 0.12); },
    // 客が来店
    arrive(){ slide(300, 520, 0.16, 'triangle', 0.16); },
    // 秒読み（残り3秒）
    tick()  { tone(880, 0.05, 'square', 0.09); },
    // ★判定（星の数で豪華さが変わる）
    star(n) {
      if (n >= 5)      melody(['G','C5','E5','G5','C6'], 0.075, 'triangle', 0.24);
      else if (n >= 4) melody(['E','G','C5','E5'], 0.08, 'triangle', 0.22);
      else if (n >= 3) melody(['C','E','G'], 0.09, 'triangle', 0.2);
      else if (n >= 2) melody(['C','C'], 0.1, 'sine', 0.16);
      else             slide(300, 150, 0.3, 'sawtooth', 0.16); // 失敗
    },
    // 売上（レジ）
    cash()  { tone(1318, 0.06, 'square', 0.14); tone(1046, 0.12, 'square', 0.12, 0.05); },
    // コンボ加算（連続的中）
    combo(n){ tone(NOTE.C5 + n * 60, 0.09, 'square', 0.16); },
    // 指名（リピーター再来店の成功）
    nominate(){ melody(['G','C5','G','C6'], 0.07, 'triangle', 0.24); },
    // 1日クリア
    fanfare(){ melody(['C5','C5','C5','C5','E5','G5','C6'], 0.11, 'triangle', 0.26); },
    // ゲームオーバー
    gameover(){ melody(['G','F','E','D','C'], 0.16, 'sawtooth', 0.2); },
    // レベルアップ
    levelup(){ melody(['C5','E5','G5'], 0.06, 'square', 0.22); },
    // 新メンバー入店（キラッと駆け上がるお披露目ジングル）
    newcomer(){ melody(['C5','E5','G5','C6', 1568], 0.09, 'triangle', 0.24); slide(600, 1800, 0.5, 'sine', 0.06, 0.15); },
    // BGM 開始／停止（多重起動しない）
    bgmStart() {
      if (bgmTimer) return;
      bgmStep = 0;
      bgmTick();
      bgmTimer = setInterval(bgmTick, BGM_STEP_MS);
    },
    bgmStop() {
      if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
    },
  };
})();
