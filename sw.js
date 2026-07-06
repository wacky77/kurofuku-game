// 付け回しマスター - Service Worker（オフライン対応）
// アセット更新時は CACHE のバージョンを上げる。
// 画像は IMG_CACHE に分離し、版数更新をまたいで保持する
// （画像URLは ?v=ASSET_V 付きなので、画像自体を差し替えた時だけ自然に再取得される）。
const CACHE = 'kurofuku-v26';
const IMG_CACHE = 'kurofuku-img';
const ASSETS = [
  './',
  './index.html',
  './css/style.css?v=26',
  './js/assets.js?v=26',
  './js/data.js?v=26',
  './js/avatars.js?v=26',
  './js/audio.js?v=26',
  './js/achieve.js?v=26',
  './js/game.js?v=26',
  './assets/icon.svg',
  './manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE && k !== IMG_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// キャッシュ優先・無ければネット取得してキャッシュに追加（同一オリジンのみ）。
// 画像は永続の IMG_CACHE へ、それ以外は版数付きの CACHE へ。
// 取得失敗時の index.html フォールバックは「ページ遷移のみ」。
// （旧実装は画像の取得失敗にも index.html を返していたため、オフライン時や
//   サーバー停止中に <img> が壊れて「一部の顔が見えない」症状を起こしていた）
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isImage = new URL(req.url).pathname.includes('/assets/images/');
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(isImage ? IMG_CACHE : CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch((err) => {
        if (req.mode === 'navigate') return caches.match('./index.html');
        throw err; // 画像などはエラーのまま返す（HTMLを画像として返さない）
      });
    })
  );
});
