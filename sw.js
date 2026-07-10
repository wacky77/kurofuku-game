// 付け回しマスター - Service Worker（オフライン対応）
// アセット更新時は CACHE のバージョンを上げる。
// 画像・音声は世代付きの MEDIA_CACHE に分離する。
// activate 時に旧世代を削除し、バージョン付きURLが端末へ蓄積し続けるのを防ぐ。
const CACHE = 'kurofuku-v56';
const MEDIA_CACHE = 'kurofuku-media-v56';
const MEDIA_V = 56;
const ASSETS = [
  './',
  './index.html',
  './css/style.css?v=56',
  './js/assets.js?v=56',
  './js/data.js?v=56',
  './js/avatars.js?v=56',
  './js/audio.js?v=56',
  './js/achieve.js?v=56',
  './js/game.js?v=56',
  './assets/icon.svg',
  './manifest.webmanifest',
];

// オフライン初回プレイに必要な配信アセットだけを事前キャッシュする。
// _src など制作素材は含めない。
const CAST_IDS = [
  'akari', 'aya', 'chisa', 'emi', 'hina', 'kana', 'karen', 'mayu', 'mina', 'momo',
  'nana', 'noa', 'rei', 'reina', 'riko', 'runa', 'sara', 'sena', 'shion', 'yuki',
  'miku', 'rui', 'arisa', 'koharu', 'maria', 'yua', 'rara', 'tsubasa', 'tsukasa',
];
const CUSTOMER_IDS = [
  'salary', 'young', 'bucho', 'oyakata', 'doctor', 'lawyer', 'itceo', 'band',
  'prof', 'chef', 'farmer', 'comedian', 'trader', 'sensei', 'teacher', 'police',
  'pilot', 'fisher', 'designer', 'realtor', 'dentist', 'actor', 'athlete', 'mayor',
  'novelist', 'barber', 'driver', 'youtuber', 'birthday', 'ceo', 'drunk', 'vip',
];
const MEDIA_ASSETS = [
  `./assets/images/logo.png?v=${MEDIA_V}`,
  `./assets/images/icon/icon-192.png?v=${MEDIA_V}`,
  `./assets/images/icon/icon-512.png?v=${MEDIA_V}`,
  `./assets/images/icon/apple-touch-icon.png?v=${MEDIA_V}`,
  // CSSの背景URLは背景ファイルを差し替えた時だけ版数を上げる運用。
  ...['title', 'floor', 'result', 'gameover']
    .map((id) => `./assets/images/backgrounds/${id}.jpg?v=23`),
  ...CAST_IDS.map((id) => `./assets/images/cast/${id}.jpg?v=${MEDIA_V}`),
  ...CUSTOMER_IDS.map((id) => `./assets/images/customers/${id}.jpg?v=${MEDIA_V}`),
  ...Array.from({ length: 7 }, (_, i) => `./assets/images/rank/${i + 1}.png?v=${MEDIA_V}`),
  ...['title', 'floor', 'result', 'gameover']
    .map((id) => `./assets/audio/${id}.mp3?v=${MEDIA_V}`),
  ...['button-tap', 'cash-register', 'champagne-pop', 'coin-get', 'fail-buzzer', 'level-up']
    .map((id) => `./assets/audio/sfx/${id}.mp3?v=${MEDIA_V}`),
];

self.addEventListener('install', (e) => {
  e.waitUntil(Promise.all([
    caches.open(CACHE).then((c) => c.addAll(ASSETS)),
    caches.open(MEDIA_CACHE).then((c) => c.addAll(MEDIA_ASSETS)),
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
