// 付け回しマスター - Service Worker（オフライン対応）
// アセット更新時は js/assets.js の ASSET_V（と index.html の ?v=N）を上げる。
// キャッシュ名・事前キャッシュ対象URLはすべて assets.js のマニフェストから自動導出するため、
// ここを手で編集する必要はない（二重管理の廃止＝更新忘れによる install 失敗事故を防止）。
// 画像・音声は世代付きの MEDIA_CACHE に分離する。
// activate 時に旧世代を削除し、バージョン付きURLが端末へ蓄積し続けるのを防ぐ。
importScripts('./js/assets.js');

const CACHE = 'kurofuku-v' + ASSET_V;
const MEDIA_CACHE = 'kurofuku-media-v' + ASSET_V;

const ASSETS = [
  './',
  './index.html',
  ...[
    './css/style.css',
    './js/assets.js',
    './js/data.js',
    './js/avatars.js',
    './js/audio.js',
    './js/achieve.js',
    './js/game.js',
  ].map((path) => path + '?v=' + ASSET_V),
  './assets/icon.svg',
  './manifest.webmanifest',
];

// オフライン初回プレイに必要な配信アセットだけを事前キャッシュする。
// _src など制作素材は含めない。js/assets.js の ASSET_IMG / ASSET_AUDIO マニフェストから生成するため、
// 新規キャスト・客・音声を追加した際は assets.js を更新するだけでここに反映される。
const MEDIA_ASSETS = [
  `./assets/images/logo.png?v=${ASSET_V}`,
  `./assets/images/icon/icon-192.png?v=${ASSET_V}`,
  `./assets/images/icon/icon-512.png?v=${ASSET_V}`,
  `./assets/images/icon/apple-touch-icon.png?v=${ASSET_V}`,
  // 背景だけは BG_V（差し替え時のみ上げる据え置き版数）を使う。
  ...[...ASSET_IMG.bg].map((id) => `./assets/images/backgrounds/${id}.jpg?v=${BG_V}`),
  ...[...ASSET_IMG.cast].map((id) => `./assets/images/cast/${id}.jpg?v=${ASSET_V}`),
  ...[...ASSET_IMG.customer].map((id) => `./assets/images/customers/${id}.jpg?v=${ASSET_V}`),
  ...[...ASSET_IMG.rank].map((index) => `./assets/images/rank/${index + 1}.png?v=${ASSET_V}`),
  ...[...ASSET_AUDIO.bgm].map((id) => `./assets/audio/${id}.mp3?v=${ASSET_V}`),
  ...[...ASSET_AUDIO.sfx].map((id) => `./assets/audio/sfx/${id}.mp3?v=${ASSET_V}`),
];

self.addEventListener('install', (e) => {
  e.waitUntil(Promise.all([
    caches.open(CACHE).then((c) => c.addAll(ASSETS)),
    // 画像・音声は1件の欠落で install 全体を失敗させない（失敗許容）。
    // 欠けた分はオンライン時に fetch ハンドラの実行時キャッシュで自己修復される。
    caches.open(MEDIA_CACHE).then((c) => Promise.allSettled(
      MEDIA_ASSETS.map((url) => fetch(url).then((res) => {
        if (res.ok) return c.put(url, res);
        console.warn('[sw] media precache skipped (not ok):', url);
      }).catch((err) => {
        console.warn('[sw] media precache skipped (fetch failed):', url, err);
      }))
    )),
  ]).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE && k !== MEDIA_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// キャッシュ優先・無ければネット取得してキャッシュに追加（同一オリジンのみ）。
// 画像・音声は MEDIA_CACHE へ、それ以外は版数付きの CACHE へ。
// 取得失敗時の index.html フォールバックは「ページ遷移のみ」。
// （旧実装は画像の取得失敗にも index.html を返していたため、オフライン時や
//   サーバー停止中に <img> が壊れて「一部の顔が見えない」症状を起こしていた）
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const path = new URL(req.url).pathname;
  const isMedia = path.includes('/assets/images/') || path.includes('/assets/audio/');
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(isMedia ? MEDIA_CACHE : CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch((err) => {
        if (req.mode === 'navigate') return caches.match('./index.html');
        throw err; // 画像などはエラーのまま返す（HTMLを画像として返さない）
      });
    })
  );
});
