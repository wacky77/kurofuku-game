// 全国ランキング（Firebase Authentication 匿名認証 + Cloud Firestore）
// Firebase 未設定・オフライン・SDK取得失敗時は、呼び出し側が端末内ランキングへフォールバックする。
(function () {
  'use strict';

  const SDK_V = '12.15.0';
  const SDK_BASE = `https://www.gstatic.com/firebasejs/${SDK_V}`;
  const COLLECTION = 'scores';
  const MAX_NAME = 8;
  const MAX_SALES = 999999999;
  const MAX_DAY = 999;
  let readyPromise = null;

  function config() {
    const c = window.KUROFUKU_FIREBASE_CONFIG;
    return c && c.apiKey && c.projectId && c.appId ? c : null;
  }

  function normalizeScore(raw) {
    const name = String(raw.name || '名無し').trim().slice(0, MAX_NAME) || '名無し';
    const sales = Math.max(0, Math.min(MAX_SALES, Math.floor(Number(raw.sales) || 0)));
    const day = Math.max(1, Math.min(MAX_DAY, Math.floor(Number(raw.day) || 1)));
    return { name, sales, day };
  }

  function betterThan(a, b) {
    if (!b) return true;
    return a.sales > b.sales || (a.sales === b.sales && a.day > b.day);
  }

  async function ready() {
    if (!config()) throw new Error('firebase-not-configured');
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
      const [appMod, authMod, fsMod] = await Promise.all([
        import(`${SDK_BASE}/firebase-app.js`),
        import(`${SDK_BASE}/firebase-auth.js`),
        import(`${SDK_BASE}/firebase-firestore.js`),
      ]);
      const app = appMod.initializeApp(config());
      const auth = authMod.getAuth(app);
      if (!auth.currentUser) await authMod.signInAnonymously(auth);
      const db = fsMod.getFirestore(app);
      return { auth, db, fs: fsMod };
    })().catch((err) => {
      readyPromise = null;
      throw err;
    });
    return readyPromise;
  }

  async function topScores(max) {
    const { db, fs } = await ready();
    // sales の単一フィールド索引だけで動かし、同額時のDAY順はクライアントで整える。
    const q = fs.query(
      fs.collection(db, COLLECTION),
      fs.orderBy('sales', 'desc'),
      fs.limit(Math.max(10, Math.min(50, (max || 10) * 2)))
    );
    const snap = await fs.getDocs(q);
    return snap.docs
      .map((d) => normalizeScore(d.data()))
      .sort((a, b) => b.sales - a.sales || b.day - a.day)
      .slice(0, max || 10);
  }

  async function submitScore(raw) {
    const score = normalizeScore(raw);
    const { auth, db, fs } = await ready();
    const uid = auth.currentUser && auth.currentUser.uid;
    if (!uid) throw new Error('anonymous-auth-failed');
    const ref = fs.doc(db, COLLECTION, uid);
    const currentSnap = await fs.getDoc(ref);
    const current = currentSnap.exists() ? normalizeScore(currentSnap.data()) : null;
    if (!betterThan(score, current)) return { ok: true, updated: false };
    await fs.setDoc(ref, {
      uid,
      name: score.name,
      sales: score.sales,
      day: score.day,
      createdAt: fs.serverTimestamp(),
    });
    return { ok: true, updated: true };
  }

  window.CloudScores = {
    isConfigured: () => !!config(),
    topScores,
    submitScore,
  };
})();

