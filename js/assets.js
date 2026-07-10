// ===============================================
// 付け回しマスター - 外部AI生成画像のマニフェスト
// 「存在する画像だけ」を列挙する。ここに載っている id は画像(<img>)を、
// 載っていない id は従来の SVG 似顔絵を表示する（フォールバック）。
//
// 画像を追加したら:
//   1) 該当セット(cast / customer / bg)に id を足す
//   2) ASSET_V を +1（下の index.html / sw.js のキャッシュ版数も揃える）
// ===============================================
const ASSET_V = 53;

// assets/images/logo.png（透過金色ロゴ画像）。true なら画像、false なら logo-wrap 内の
// CSSテキストロゴ（.logo/.logo-big、v42実装）にフォールバック。
const HAS_LOGO = true;

const ASSET_IMG = {
  // assets/images/cast/<id>.jpg（全29人 画像化済み。512px/JPEG圧縮。元PNGは cast/_src/ に退避）
  cast: new Set([
    'akari', 'aya', 'chisa', 'emi', 'hina', 'kana', 'karen', 'mayu', 'mina', 'momo',
    'nana', 'noa', 'rei', 'reina', 'riko', 'runa', 'sara', 'sena', 'shion', 'yuki',
    'miku', 'rui', 'arisa', 'koharu', 'maria', 'yua', 'rara', 'tsubasa', 'tsukasa',
  ]),
  // assets/images/customers/<iconId>.jpg（通常ペルソナ28＋イベント4＝全32種 画像化済み。512px/JPEG圧縮。元PNGは customers/_src/ に退避）
  customer: new Set([
    'salary', 'young', 'bucho', 'oyakata', 'doctor', 'lawyer', 'itceo', 'band',
    'prof', 'chef', 'farmer', 'comedian', 'trader', 'sensei', 'teacher', 'police',
    'pilot', 'fisher', 'designer', 'realtor', 'dentist', 'actor', 'athlete', 'mayor',
    'novelist', 'barber', 'driver', 'youtuber',
    // イベント客
    'birthday', 'ceo', 'drunk', 'vip',
  ]),
  // assets/images/backgrounds/<name>.jpg
  bg: new Set(['title', 'floor', 'result', 'gameover']),
};

// キャスト画像タグ（従来SVGと同じ .avatar クラスで角丸などを継承）
function castImg(id, size) {
  const s = size || 72;
  return `<img class="avatar" src="assets/images/cast/${id}.jpg?v=${ASSET_V}" width="${s}" height="${s}" alt="" loading="lazy">`;
}

// 来店客画像タグ（従来SVGと同じ .cust-svg クラス）
function custImg(iconId, size) {
  const s = size || 92;
  return `<img class="cust-svg" src="assets/images/customers/${iconId}.jpg?v=${ASSET_V}" width="${s}" height="${s}" alt="" loading="lazy">`;
}
