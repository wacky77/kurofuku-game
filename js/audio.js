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
      preloadSamples(); // 初回のユーザー操作でSEサンプル(mp3)を先読み
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // --- 効果音サンプル（外部mp3：assets/audio/sfx/<name>.mp3）---
  // 合成音の上位互換。読み込み前・デコード失敗時は各メソッドが合成音にフォールバックする。
  const SFX_FILES = ['button-tap', 'cash-register', 'coin-get', 'champagne-pop', 'level-up', 'fail-buzzer'];
  const samples = {};          // name -> AudioBuffer | 'loading' | 'error'
  let samplesRequested = false;

  function sampleLoad(name) {
    if (samples[name]) return;
    samples[name] = 'loading';
    const v = typeof ASSET_V !== 'undefined' ? ASSET_V : 0;
    fetch(`assets/audio/sfx/${name}.mp3?v=${v}`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then((ab) => new Promise((res, rej) => {
        const c = ac();
        if (!c) rej(new Error('no AudioContext'));
        else c.decodeAudioData(ab, res, rej);
      }))
      .then((buf) => { samples[name] = buf; })
      .catch(() => { samples[name] = 'error'; });
  }

  function preloadSamples() {
    if (samplesRequested) return;
    samplesRequested = true;
    SFX_FILES.forEach(sampleLoad);
  }

  // サンプルを鳴らす。鳴らせたら true（＝合成音フォールバック不要）を返す。
  function playSample(name, vol = 0.8) {
    const c = ac();
    if (!c || muted) return false;
    const e = samples[name];
    if (!e || typeof e !== 'object') return false; // 未読込 / エラー
    const src = c.createBufferSource();
    src.buffer = e;
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(g).connect(c.destination);
    src.start();
    return true;
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

  // --- BGM：外部音源（assets/audio/<画面id>.mp3）を Web Audio でループ再生 ---
  // 画面id（title/floor/result/gameover）＝ファイル名。<audio> ではなく
  // fetch + decodeAudioData + AudioBufferSourceNode なのは、①ループの継ぎ目が出ない
  // ②iOS Safari の Range 要求と Service Worker の相性問題を踏まない ③既存のミュートと
  // 同じ AudioContext に乗る、ため。読み込み失敗時は floor のみ従来の合成BGMで代替。
  // 曲別の再生音量。実測RMSは floor が最も低い(-20dB)が、プレイ中は効果音と
  // 常時重なって体感が大きくなるため floor だけ下げている。
  const BGM_VOL = { title: 0.35, floor: 0.22, result: 0.35, gameover: 0.35 };
  const bgmBufs = {};                 // name -> {buf, ls, le} | 'loading' | 'error'
  let bgmName = null, bgmSrc = null, bgmGain = null;
  function bgmVol() { return BGM_VOL[bgmName] || 0.3; }

  // MP3はエンコーダ由来の無音が頭尾に付くため、無音を除いた区間をループ範囲にする
  function loopRange(buf) {
    const d = buf.getChannelData(0), th = 0.001;
    let a = 0, b = d.length - 1;
    while (a < b && Math.abs(d[a]) < th) a++;
    while (b > a && Math.abs(d[b]) < th) b--;
    return [a / buf.sampleRate, (b + 1) / buf.sampleRate];
  }

  function bgmLoad(name) {
    if (bgmBufs[name]) return;
    bgmBufs[name] = 'loading';
    const v = typeof ASSET_V !== 'undefined' ? ASSET_V : 0;
    fetch(`assets/audio/${name}.mp3?v=${v}`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then((ab) => new Promise((res, rej) => {
        const c = ac();
        if (!c) rej(new Error('no AudioContext'));
        else c.decodeAudioData(ab, res, rej);
      }))
      .then((buf) => {
        const [ls, le] = loopRange(buf);
        bgmBufs[name] = { buf, ls, le };
        if (bgmName === name) bgmPlay(name); // 読み込み中に画面が来ていたら開始
      })
      .catch(() => {
        bgmBufs[name] = 'error';
        if (bgmName === name && name === 'floor') synthStart();
      });
  }

  function bgmPlay(name) {
    const c = ac(), e = bgmBufs[name];
    if (!c || !e || typeof e !== 'object' || bgmSrc) return;
    const src = c.createBufferSource();
    src.buffer = e.buf;
    src.loop = true;
    src.loopStart = e.ls;
    src.loopEnd = e.le;
    const g = c.createGain();
    g.gain.value = muted ? 0 : bgmVol();
    src.connect(g).connect(c.destination);
    src.start(0, e.ls);
    bgmSrc = src; bgmGain = g;
  }

  // --- 合成BGM（外部音源が読めない時の floor 用フォールバック） ---
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
  function synthStart() {
    if (bgmTimer) return;
    bgmStep = 0;
    bgmTick();
    bgmTimer = setInterval(bgmTick, BGM_STEP_MS);
  }
  function synthStop() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
  }

  return {
    get muted() { return muted; },
    toggle() {
      muted = !muted;
      try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) { /* 無視 */ }
      if (bgmGain) bgmGain.gain.value = muted ? 0 : bgmVol(); // BGMは止めず音量だけ絞る
      if (!muted) this.tap(); // オンにした合図
      return muted;
    },
    // UIタップ
    tap()   { if (!playSample('button-tap', 0.5)) tone(520, 0.07, 'square', 0.12); },
    // 客が来店
    arrive(){ slide(300, 520, 0.16, 'triangle', 0.16); },
    // イベント客・指名客の来店（シャンパンが弾ける華やかな音）
    vip()   { if (!playSample('champagne-pop', 0.8)) melody(['E5', 'G5', 'C6'], 0.07, 'triangle', 0.2); },
    // 秒読み（残り3秒）
    tick()  { tone(880, 0.05, 'square', 0.09); },
    // ★判定（星の数で豪華さが変わる）
    star(n) {
      if (n >= 5)      melody(['G','C5','E5','G5','C6'], 0.075, 'triangle', 0.24);
      else if (n >= 4) melody(['E','G','C5','E5'], 0.08, 'triangle', 0.22);
      else if (n >= 3) melody(['C','E','G'], 0.09, 'triangle', 0.2);
      else if (n >= 2) melody(['C','C'], 0.1, 'sine', 0.16);
      else if (!playSample('fail-buzzer', 0.7)) slide(300, 150, 0.3, 'sawtooth', 0.16); // 失敗
    },
    // 売上（レジのチャリン）
    cash()  { if (!playSample('cash-register', 0.8)) { tone(1318, 0.06, 'square', 0.14); tone(1046, 0.12, 'square', 0.12, 0.05); } },
    // コンボ加算（連続的中＝コインを稼ぐ音）
    combo(n){ if (!playSample('coin-get', 0.6)) tone(NOTE.C5 + n * 60, 0.09, 'square', 0.16); },
    // 指名（リピーター再来店の成功）
    nominate(){ melody(['G','C5','G','C6'], 0.07, 'triangle', 0.24); },
    // 1日クリア
    fanfare(){ melody(['C5','C5','C5','C5','E5','G5','C6'], 0.11, 'triangle', 0.26); },
    // ゲームオーバー
    gameover(){ melody(['G','F','E','D','C'], 0.16, 'sawtooth', 0.2); },
    // レベルアップ
    levelup(){ if (!playSample('level-up', 0.8)) melody(['C5','E5','G5'], 0.06, 'square', 0.22); },
    // 新メンバー入店（キラッと駆け上がるお披露目ジングル）
    newcomer(){ melody(['C5','E5','G5','C6', 1568], 0.09, 'triangle', 0.24); slide(600, 1800, 0.5, 'sine', 0.06, 0.15); },
    // BGM 切替（name: title/floor/result/gameover。null/未知の名前で停止）
    // enterScreen から背景名と同じ id で呼ばれる。同じ曲なら何もしない（画面内再描画対策）。
    bgm(name) {
      if (name === bgmName) return;
      bgmName = name || null;
      if (bgmSrc) { try { bgmSrc.stop(); } catch (e) { /* 無視 */ } bgmSrc = null; bgmGain = null; }
      synthStop();
      if (!bgmName) return;
      const e = bgmBufs[bgmName];
      if (e && typeof e === 'object') bgmPlay(bgmName);
      else if (e === 'error') { if (bgmName === 'floor') synthStart(); }
      else bgmLoad(bgmName);
      if (bgmName === 'title') bgmLoad('floor'); // タイトル中に本編曲を先読み
    },
    bgmStop() { this.bgm(null); },
  };
})();
