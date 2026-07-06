// ===============================================
// 付け回しマスター - SVGアバター生成
// 各キャストの face 設定（data.js）から似顔絵SVGを組み立てる。
// 外部画像不要。後から本物のイラストに差し替えも可能。
// ===============================================

// 来店客のアイコン（色付きタイル＋絵文字）。ペルソナ/イベントごとに色が変わり見分けやすい。
function customerIcon(c, size) {
  const s = size || 92;
  const bg = c.bg || '#3a2836';
  const bg2 = c.bg2 || bg;
  const id = 'ci-' + (c.iconId || 'x');
  return `<svg class="cust-svg" viewBox="0 0 100 100" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="${id}" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="${bg2}"/><stop offset="100%" stop-color="${bg}"/>
    </radialGradient></defs>
    <rect width="100" height="100" rx="24" fill="url(#${id})"/>
    <text x="50" y="55" font-size="50" text-anchor="middle" dominant-baseline="central">${c.emoji}</text>
  </svg>`;
}

// ===============================================
// 来店客の似顔絵（属性＝職業ペルソナ／年齢／ニーズ から男性中心の顔を組む）
// customerIcon（絵文字タイル）の代わりに使う。iconId で見た目を引く。
// ===============================================

// 色を t(0〜1) だけ b に近づける（白/黒混ぜで陰影・白髪化に使う）
function mixColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ra = pa >> 16, ga = (pa >> 8) & 255, ba = pa & 255;
  const rb = pb >> 16, gb = (pb >> 8) & 255, bb = pb & 255;
  const r = Math.round(ra + (rb - ra) * t);
  const g = Math.round(ga + (gb - ga) * t);
  const bl = Math.round(ba + (bb - ba) * t);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
}

// ニーズ → 表情の気分
const CUST_MOOD = { heal: 'tired', talk: 'talk', price: 'jolly', smile: 'warm' };

// ペルソナ／イベントごとの顔パーツ設定
// skin肌 / hair髪色 / top髪型 / glasses眼鏡 / beardヒゲ / collar襟元 / tieネクタイ色 / hat被り物 / mood(強制表情)
const CUSTOMER_FACES = {
  salary:   { skin: '#f4c6a0', hair: '#2c2b33', top: 'short',   glasses: 'none',  beard: 'none',     collar: 'suit', tie: '#5b7fbf' },
  young:    { skin: '#ffd3b0', hair: '#3f3730', top: 'short',   glasses: 'none',  beard: 'none',     collar: 'suit', tie: '#7fb0a0' },
  bucho:    { skin: '#eec39c', hair: '#9a9aa6', top: 'balding', glasses: 'none',  beard: 'stubble',  collar: 'suit', tie: '#b06060' },
  oyakata:  { skin: '#d69a68', hair: '#2c2b33', top: 'short',   glasses: 'none',  beard: 'stubble',  collar: 'work', hat: 'hardhat' },
  doctor:   { skin: '#f4c6a0', hair: '#4a4650', top: 'slick',   glasses: 'round', beard: 'none',     collar: 'coat' },
  lawyer:   { skin: '#f0c39c', hair: '#33303a', top: 'slick',   glasses: 'rect',  beard: 'none',     collar: 'suit', tie: '#6a6ab0' },
  itceo:    { skin: '#f4c6a0', hair: '#2c2b33', top: 'messy',   glasses: 'none',  beard: 'stubble',  collar: 'tee',  tee: '#3a4250' },
  band:     { skin: '#f0c19a', hair: '#26242c', top: 'longM',   glasses: 'none',  beard: 'stubble',  collar: 'tee',  tee: '#4a2e42' },
  prof:     { skin: '#eec39c', hair: '#c9c6cf', top: 'short',   glasses: 'round', beard: 'full',     collar: 'coat' },
  chef:     { skin: '#e8b085', hair: '#2c2b33', top: 'buzz',    glasses: 'none',  beard: 'stubble',  collar: 'work', hat: 'bandana' },
  farmer:   { skin: '#d69a68', hair: '#5a4a3a', top: 'short',   glasses: 'none',  beard: 'stubble',  collar: 'work', hat: 'towel' },
  comedian: { skin: '#f4c6a0', hair: '#2c2b33', top: 'spiky',   glasses: 'none',  beard: 'none',     collar: 'tee',  tee: '#5a3a2e' },
  trader:   { skin: '#f0c39c', hair: '#33303a', top: 'slick',   glasses: 'none',  beard: 'none',     collar: 'suit', tie: '#c0a050' },
  sensei:   { skin: '#eec39c', hair: '#6a6470', top: 'short',   glasses: 'rect',  beard: 'mustache', collar: 'suit', tie: '#7a7a86' },
  // --- イベント客 ---
  birthday: { skin: '#f4c6a0', hair: '#3a342e', top: 'short',   glasses: 'none',  beard: 'none',     collar: 'tee',  tee: '#c0507a', hat: 'party' },
  ceo:      { skin: '#eec39c', hair: '#b9b6bf', top: 'slick',   glasses: 'none',  beard: 'none',     collar: 'tux' },
  drunk:    { skin: '#f6b096', hair: '#3a342e', top: 'messy',   glasses: 'none',  beard: 'stubble',  collar: 'suit', tie: '#8a8a90', mood: 'drunk' },
  vip:      { skin: '#f0c39c', hair: '#4a4650', top: 'slick',   glasses: 'none',  beard: 'goatee',   collar: 'suit', tie: '#7a5aa0', hat: 'crown' },
  // --- 増枠ペルソナ ---
  teacher:  { skin: '#f0c39c', hair: '#3a3640', top: 'short',   glasses: 'rect',  beard: 'none',     collar: 'suit', tie: '#4a8a70' },
  police:   { skin: '#e8b085', hair: '#2c2b33', top: 'buzz',    glasses: 'none',  beard: 'none',     collar: 'suit', tie: '#2e3a66' },
  pilot:    { skin: '#f4c6a0', hair: '#4a4650', top: 'slick',   glasses: 'none',  beard: 'none',     collar: 'suit', tie: '#2e4a86' },
  fisher:   { skin: '#c88a58', hair: '#2c2b33', top: 'short',   glasses: 'none',  beard: 'full',     collar: 'work', hat: 'towel' },
  designer: { skin: '#f4c6a0', hair: '#33303a', top: 'messy',   glasses: 'round', beard: 'stubble',  collar: 'tee',  tee: '#3a2e4a' },
  realtor:  { skin: '#eec39c', hair: '#3a342e', top: 'slick',   glasses: 'none',  beard: 'none',     collar: 'suit', tie: '#c0a050' },
  dentist:  { skin: '#f4c6a0', hair: '#4a4650', top: 'short',   glasses: 'rect',  beard: 'none',     collar: 'coat' },
  actor:    { skin: '#f0c39c', hair: '#26242c', top: 'longM',   glasses: 'none',  beard: 'stubble',  collar: 'tux' },
  athlete:  { skin: '#d69a68', hair: '#2c2b33', top: 'buzz',    glasses: 'none',  beard: 'none',     collar: 'tee',  tee: '#2e5038' },
  mayor:    { skin: '#eec39c', hair: '#9a9aa6', top: 'balding', glasses: 'rect',  beard: 'none',     collar: 'suit', tie: '#b04848' },
  novelist: { skin: '#eec39c', hair: '#5a5460', top: 'messy',   glasses: 'round', beard: 'full',     collar: 'coat' },
  barber:   { skin: '#f0c39c', hair: '#2c2b33', top: 'slick',   glasses: 'none',  beard: 'mustache', collar: 'tee',  tee: '#503a3a' },
  driver:   { skin: '#e8b085', hair: '#4a4650', top: 'short',   glasses: 'none',  beard: 'stubble',  collar: 'work' },
  youtuber: { skin: '#f4c6a0', hair: '#2c2b33', top: 'spiky',   glasses: 'none',  beard: 'none',     collar: 'tee',  tee: '#503046' },
};
const CUSTOMER_FACE_DEFAULT = { skin: '#f4c6a0', hair: '#33303a', top: 'short', glasses: 'none', beard: 'none', collar: 'suit', tie: '#6a6a7a' };

function customerFace(c, size) {
  const s = size || 92;
  // 外部AI画像があればそれを優先（無ければ従来SVG）
  if (typeof ASSET_IMG !== 'undefined' && c && c.iconId && ASSET_IMG.customer.has(c.iconId)) return custImg(c.iconId, s);
  const base = (c && c.iconId && CUSTOMER_FACES[c.iconId]) || CUSTOMER_FACE_DEFAULT;
  const skin = base.skin;
  const skinShade = mixColor(skin, '#000000', 0.16);
  // 年齢による白髪化（50代/60代は髪をグレー寄りに）
  const old = c && (c.age === '50代' || c.age === '60代');
  const hair = old ? mixColor(base.hair, '#c9c6cf', 0.5) : base.hair;
  const brow = mixColor(hair, '#000000', 0.15);
  const mood = base.mood || (c && CUST_MOOD[c.need]) || 'warm';
  const id = 'cf-' + (c && c.iconId ? c.iconId : 'x');
  const bg = (c && c.bg) || '#3a2836';
  const bg2 = (c && c.bg2) || bg;

  const defs = `<defs><radialGradient id="${id}" cx="50%" cy="32%" r="80%">
    <stop offset="0%" stop-color="${bg2}"/><stop offset="100%" stop-color="${bg}"/></radialGradient></defs>`;
  const tile = `<rect width="100" height="100" rx="24" fill="url(#${id})"/>`;

  // ---- 襟元・肩（顔の下・最背面に） ----
  const tie = base.tie || '#6a6a7a';
  const tee = base.tee || mixColor(bg2, '#ffffff', 0.18);
  let collar = '';
  const shoulders = (col) => `<path d="M18,100 Q19,83 40,79 L60,79 Q81,83 82,100 Z" fill="${col}"/>`;
  switch (base.collar) {
    case 'suit':
      collar = shoulders('#2a2f3a')
        + `<path d="M41,79 L50,93 L59,79 Z" fill="#f2f2f5"/>`
        + `<path d="M47.5,80 L52.5,80 L51,84 L49,84 Z" fill="${mixColor(tie, '#000000', 0.2)}"/>`
        + `<path d="M48.2,84 L51.8,84 L53.5,98 L50,100 L46.5,98 Z" fill="${tie}"/>`;
      break;
    case 'tux':
      collar = shoulders('#17171c')
        + `<path d="M41,79 L50,94 L59,79 Z" fill="#f4f4f7"/>`
        + `<path d="M44,85 L50,88 L44,91 Z" fill="#17171c"/><path d="M56,85 L50,88 L56,91 Z" fill="#17171c"/>`;
      break;
    case 'coat':
      collar = shoulders('#eaeef2')
        + `<path d="M41,79 L50,92 L59,79 Z" fill="${mixColor(bg2, '#ffffff', 0.35)}"/>`
        + `<path d="M42,80 L50,92 M58,80 L50,92" stroke="#c9d0d8" stroke-width="1.2" fill="none"/>`;
      break;
    case 'work':
      collar = shoulders('#4a4a52')
        + `<path d="M40,80 Q50,86 60,80 L63,100 L37,100 Z" fill="#e7ebe4"/>`;
      break;
    default: // tee
      collar = shoulders(tee)
        + `<path d="M42,80 Q50,87 58,80" fill="${skin}"/>`;
  }
  const neck = `<path d="M44.5,70 L44.5,80 Q50,84 55.5,80 L55.5,70 Z" fill="${skinShade}"/>`;

  // ---- 後ろ髪（ロングのみ・頭の背面） ----
  let backHair = '';
  if (base.top === 'longM') {
    backHair = `<path d="M26,44 C24,64 28,78 33,80 L67,80 C72,78 76,64 74,44 C74,30 62,26 50,26 C38,26 26,30 26,44 Z" fill="${hair}"/>`;
  }

  // ---- 顔・耳・鼻 ----
  const head = `<path d="M29,49 C29,34 39,28 50,28 C61,28 71,34 71,49 C71,63 63,74 50,74 C37,74 29,63 29,49 Z" fill="${skin}"/>`;
  const ears = `<circle cx="29.5" cy="52" r="4.2" fill="${skin}"/><circle cx="70.5" cy="52" r="4.2" fill="${skin}"/>`
    + `<path d="M50,52 Q48.5,58 49,60 Q50,61 51,60" stroke="${skinShade}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  const wrinkle = old ? `<path d="M35,45 Q37,44.2 39,45" stroke="${skinShade}" stroke-width="0.9" fill="none" opacity="0.6"/>
    <path d="M61,45 Q63,44.2 65,45" stroke="${skinShade}" stroke-width="0.9" fill="none" opacity="0.6"/>` : '';

  // ---- ヒゲ（顎まわり・口の背面に） ----
  let beardBack = '';
  const jaw = `M33,57 Q50,75 67,57 Q66,71 50,73 Q34,71 33,57 Z`;
  if (base.beard === 'stubble') beardBack = `<path d="${jaw}" fill="${hair}" opacity="0.25"/>`;
  else if (base.beard === 'full') beardBack = `<path d="${jaw}" fill="${hair}"/>`;

  // ---- 眉 ----
  let brows;
  switch (mood) {
    case 'tired':
      brows = `<path d="M36,46.5 Q40,45.5 45,47" stroke="${brow}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M55,47 Q60,45.5 64,46.5" stroke="${brow}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`; break;
    case 'talk':
      brows = `<path d="M36,44 Q40.5,42.6 45,44" stroke="${brow}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M55,44 Q59.5,42.6 64,44" stroke="${brow}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`; break;
    case 'jolly':
      brows = `<path d="M36,44.5 Q40.5,42.8 45,44.5" stroke="${brow}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <path d="M55,44.5 Q59.5,42.8 64,44.5" stroke="${brow}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`; break;
    case 'drunk':
      brows = `<path d="M36,46 Q40,44.5 45,46" stroke="${brow}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M55,46 Q60,44.5 64,46" stroke="${brow}" stroke-width="2" fill="none" stroke-linecap="round"/>`; break;
    default: // warm
      brows = `<path d="M36,45.5 Q40.5,44.5 45,45.5" stroke="${brow}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M55,45.5 Q59.5,44.5 64,45.5" stroke="${brow}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  }

  // ---- 目 ----
  function eyeAt(x) {
    switch (mood) {
      case 'tired':
      case 'drunk':
        return `<path d="M${x - 3.6},52.5 Q${x},54.3 ${x + 3.6},52.5" stroke="#2f2a30" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <ellipse cx="${x}" cy="53.6" rx="2.3" ry="1.5" fill="#3a3038"/>
          <path d="M${x - 3},56 Q${x},56.7 ${x + 3},56" stroke="${skinShade}" stroke-width="0.8" fill="none" opacity="0.6"/>`;
      case 'jolly':
        return `<path d="M${x - 3.6},53.6 Q${x},50.6 ${x + 3.6},53.6" stroke="#2f2a30" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
      case 'talk':
        return `<ellipse cx="${x}" cy="53" rx="3.4" ry="3.8" fill="#fff"/>
          <circle cx="${x}" cy="53.4" r="2.2" fill="#2e2a30"/><circle cx="${x + 1}" cy="52" r="0.9" fill="#fff"/>`;
      default: // warm
        return `<ellipse cx="${x}" cy="53" rx="3.1" ry="3.5" fill="#fff"/>
          <circle cx="${x}" cy="53.3" r="2" fill="#2e2a30"/><circle cx="${x + 0.9}" cy="52" r="0.8" fill="#fff"/>`;
    }
  }
  const eyes = eyeAt(41) + eyeAt(59);

  // ---- ほお（陽気・酔いは強め） ----
  let blush = '';
  if (mood === 'jolly' || mood === 'drunk') {
    const op = mood === 'drunk' ? 0.55 : 0.4;
    blush = `<ellipse cx="37" cy="60" rx="4.5" ry="2.6" fill="#ff7a6a" opacity="${op}"/>
      <ellipse cx="63" cy="60" rx="4.5" ry="2.6" fill="#ff7a6a" opacity="${op}"/>`;
  }

  // ---- 口 ----
  let mouth;
  switch (mood) {
    case 'tired':
      mouth = `<path d="M46,65 Q50,66.4 54,65" stroke="#9a5560" stroke-width="1.8" fill="none" stroke-linecap="round"/>`; break;
    case 'talk':
      mouth = `<ellipse cx="50" cy="65.5" rx="4" ry="3" fill="#7a2f37"/><path d="M46.5,64.6 Q50,66 53.5,64.6" stroke="#e79aa0" stroke-width="1" fill="none"/>`; break;
    case 'jolly':
      mouth = `<path d="M42,63 Q50,73 58,63 Z" fill="#7a2f37"/><path d="M44,63.5 Q50,65.5 56,63.5" stroke="#fff" stroke-width="1.6" fill="none"/>`; break;
    case 'drunk':
      mouth = `<path d="M44,64.5 Q47,67 50,65 Q53,63 56,65.5" stroke="#9a5560" stroke-width="1.9" fill="none" stroke-linecap="round"/>`; break;
    default: // warm
      mouth = `<path d="M44,64 Q50,68.5 56,64" stroke="#9a5560" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
  }

  // ---- ヒゲ（口ヒゲ・顎ヒゲ・前面） ----
  let beardFront = '';
  if (base.beard === 'mustache' || base.beard === 'full') {
    beardFront += `<path d="M43,62 Q50,59.8 57,62 Q54,63.6 50,63.2 Q46,63.6 43,62 Z" fill="${hair}"/>`;
  }
  if (base.beard === 'goatee') {
    beardFront += `<path d="M43,62 Q50,60.2 57,62 Q54,63.4 50,63 Q46,63.4 43,62 Z" fill="${hair}"/>`
      + `<path d="M46,68 Q50,73 54,68 Q50,70.5 46,68 Z" fill="${hair}"/>`;
  }

  // ---- 前髪・髪型（頭の上に） ----
  let hairTop = '';
  const sheen = mixColor(hair, '#ffffff', 0.22);
  switch (base.top) {
    case 'buzz':
      hairTop = `<path d="M30,46 C31,34 40,29 50,29 C60,29 69,34 70,46 C67,40 60,37.5 50,37.5 C40,37.5 33,40 30,46 Z" fill="${hair}" opacity="0.85"/>`; break;
    case 'balding':
      hairTop = `<path d="M30,55 C27,45 29,38 34,34 C33,42 33,49 34,55 Z" fill="${hair}"/>`
        + `<path d="M70,55 C73,45 71,38 66,34 C67,42 67,49 66,55 Z" fill="${hair}"/>`
        + `<path d="M34,35 Q50,30 66,35 Q50,33 34,35 Z" fill="${hair}" opacity="0.85"/>`; break;
    case 'slick':
      hairTop = `<path d="M28,48 C28,32 39,27 50,27 C61,27 72,32 72,48 C70,39 63,35 50,35 C37,35 30,40 28,48 Z" fill="${hair}"/>`
        + `<path d="M43,30 Q52,29 62,34" stroke="${sheen}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`; break;
    case 'messy':
      hairTop = `<path d="M27,49 C27,33 39,25 50,27 C55,23 60,29 63,26 C67,30 71,34 73,49 C70,39 62,35 55,37 C52,32 47,36 45,34 C38,34 30,40 27,49 Z" fill="${hair}"/>`; break;
    case 'spiky':
      hairTop = `<path d="M29,42 L33,27 L39,38 L44,25 L49,38 L53,25 L58,38 L63,27 L67,42 C64,35 57,33 50,33 C43,33 33,35 29,42 Z" fill="${hair}"/>`; break;
    case 'longM':
      hairTop = `<path d="M28,48 C28,31 40,26 50,26 C60,26 72,31 72,48 C70,38 62,34 50,34 C38,34 30,39 28,48 Z" fill="${hair}"/>`; break;
    default: // short
      hairTop = `<path d="M28,48 C28,32 39,27 50,27 C61,27 72,32 72,48 C70,39 62,35.5 50,35.5 C38,35.5 30,39 28,48 Z" fill="${hair}"/>`;
  }

  // ---- 眼鏡（髪の後） ----
  let glasses = '';
  if (base.glasses === 'rect') {
    glasses = `<g stroke="#2a2a30" stroke-width="1.6" fill="rgba(255,255,255,0.12)">
      <rect x="35" y="49" width="11" height="8" rx="2"/><rect x="54" y="49" width="11" height="8" rx="2"/></g>
      <line x1="46" y1="52.5" x2="54" y2="52.5" stroke="#2a2a30" stroke-width="1.6"/>`;
  } else if (base.glasses === 'round') {
    glasses = `<g stroke="#2a2a30" stroke-width="1.6" fill="rgba(255,255,255,0.12)">
      <circle cx="41" cy="53" r="5.2"/><circle cx="59" cy="53" r="5.2"/></g>
      <line x1="46.2" y1="53" x2="53.8" y2="53" stroke="#2a2a30" stroke-width="1.6"/>`;
  }

  // ---- 被り物（最前面） ----
  let hat = '';
  switch (base.hat) {
    case 'hardhat':
      hat = `<path d="M26,42 Q50,20 74,42 Z" fill="#f2c200"/><rect x="23" y="40.5" width="54" height="5" rx="2.5" fill="#e0ab00"/>
        <rect x="48.5" y="23" width="3" height="17" rx="1.5" fill="#e0ab00"/>`; break;
    case 'bandana':
      hat = `<path d="M27,40 Q50,31 73,40 L73,45 Q50,41 27,45 Z" fill="#eef2f7"/>
        <path d="M27,43 Q50,39.5 73,43" stroke="#5a7fc0" stroke-width="1.6" fill="none"/>
        <path d="M71,42 l7,-2 -1,5 z" fill="#eef2f7"/>`; break;
    case 'towel':
      hat = `<path d="M26,41 Q50,32 74,41 L74,46 Q50,42 26,46 Z" fill="#efe9db"/>
        <path d="M72,43 l8,-3 -2,6 z" fill="#efe9db"/>`; break;
    case 'party':
      hat = `<path d="M50,9 L40,33 L60,33 Z" fill="#e05a8a"/>
        <path d="M45,21 L55,21 M42.5,27 L57.5,27" stroke="#ffd84d" stroke-width="2" stroke-linecap="round"/>
        <circle cx="50" cy="9" r="3" fill="#ffd84d"/>`; break;
    case 'crown':
      hat = `<path d="M35,33 L39,21 L46,29 L50,18 L54,29 L61,21 L65,33 Z" fill="#ffd24a" stroke="#d9a71f" stroke-width="1"/>
        <rect x="35" y="32" width="30" height="4.5" rx="1" fill="#e8b62f"/>
        <circle cx="50" cy="20" r="1.6" fill="#ff5a7a"/>`; break;
  }

  return `<svg class="cust-svg" viewBox="0 0 100 100" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">`
    + defs + tile + collar + neck + backHair + head + ears + wrinkle + beardBack
    + brows + eyes + blush + mouth + beardFront + hairTop + glasses + hat
    + `</svg>`;
}

function avatarSVG(id, size) {
  // 外部AI画像があればそれを優先（無ければ従来SVG）
  if (typeof ASSET_IMG !== 'undefined' && ASSET_IMG.cast.has(id)) return castImg(id, size);
  const cast = CAST_POOL.find(c => c.id === id);
  if (!cast || !cast.face) return `<span style="font-size:${size * 0.6}px">${cast ? cast.emoji : '❓'}</span>`;
  const f = cast.face;
  const s = size || 72;
  const skin = f.skin || '#ffe0cf';
  const hair = f.hair;
  const hair2 = f.hair2 || hair;
  const eye = f.eye || '#5a4a3a';
  const p = 'av-' + id; // グラデーションID衝突防止

  // ---- 背景 ----
  const defs = `<defs>
    <radialGradient id="${p}-bg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="${f.bg2 || f.bg}"/>
      <stop offset="100%" stop-color="${f.bg}"/>
    </radialGradient></defs>`;
  const bg = `<rect width="100" height="100" rx="16" fill="url(#${p}-bg)"/>`;

  // ---- 髪型ごとの後ろ髪／サイド ----
  let backHair = '';
  const style = f.hairStyle;
  if (style === 'long' || style === 'wavy') {
    backHair += `<path d="M21,58 C20,86 26,98 30,98 L70,98 C74,98 80,86 79,58 Z" fill="${hair}"/>`;
    if (style === 'wavy') {
      backHair += `<circle cx="26" cy="90" r="7" fill="${hair}"/><circle cx="74" cy="90" r="7" fill="${hair}"/>`;
    }
  } else if (style === 'bob') {
    backHair += `<path d="M24,56 Q23,80 34,82 L66,82 Q77,80 76,56 Z" fill="${hair}"/>`;
  } else if (style === 'ponytail') {
    backHair += `<path d="M22,58 Q22,74 30,78 L70,78 Q78,74 78,58 Z" fill="${hair}"/>`;
    backHair += `<ellipse cx="84" cy="52" rx="7" ry="16" fill="${hair}" transform="rotate(18 84 52)"/>`;
    backHair += `<ellipse cx="80" cy="40" rx="4" ry="3" fill="${hair2}"/>`;
  } else if (style === 'twin') {
    backHair += `<ellipse cx="18" cy="66" rx="8" ry="15" fill="${hair}"/>`;
    backHair += `<ellipse cx="82" cy="66" rx="8" ry="15" fill="${hair}"/>`;
    backHair += `<circle cx="24" cy="52" r="3.5" fill="${hair2}"/><circle cx="76" cy="52" r="3.5" fill="${hair2}"/>`;
  } else { // short
    backHair += `<path d="M27,52 Q27,66 34,70 L66,70 Q73,66 73,52 Z" fill="${hair}"/>`;
  }

  // 後ろ髪のベース（顔の後ろに広がる髪の毛の塊）
  const hairMass = `<ellipse cx="50" cy="55" rx="30" ry="32" fill="${hair}"/>`;

  // ---- 顔・耳 ----
  const ears = `<circle cx="28" cy="60" r="4" fill="${skin}"/><circle cx="72" cy="60" r="4" fill="${skin}"/>`;
  const face = `<ellipse cx="50" cy="57" rx="21.5" ry="24.5" fill="${skin}"/>`;

  // ---- 前髪 ----
  const bangs = `<path d="M26,47 C25,31 38,23 50,23 C62,23 75,31 74,47 C69,37 60,33 55,39 C52,42 48,42 45,39 C40,33 31,37 26,47 Z" fill="${hair}"/>`;

  // ---- 眉 ----
  const brows = `<path d="M35,49 Q40,47 45,49" stroke="${hair2}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M55,49 Q60,47 65,49" stroke="${hair2}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;

  // ---- 目 ----
  function eyeAt(x, cool) {
    if (cool) { // クールは半目
      return `<path d="M${x - 5},58 Q${x},60 ${x + 5},58" stroke="#3a3340" stroke-width="2" fill="none" stroke-linecap="round"/>
        <ellipse cx="${x}" cy="59.5" rx="3.5" ry="2.4" fill="${eye}"/>`;
    }
    return `<ellipse cx="${x}" cy="58.5" rx="5" ry="6.5" fill="#fff"/>
      <circle cx="${x}" cy="59" r="4" fill="${eye}"/>
      <circle cx="${x}" cy="59" r="1.9" fill="#2a2530"/>
      <circle cx="${x + 1.5}" cy="57" r="1.3" fill="#fff"/>`;
  }
  const cool = f.mouth === 'cool';
  const eyes = eyeAt(40, cool) + eyeAt(60, cool);

  // ---- ほお ----
  const blush = `<ellipse cx="34" cy="66" rx="4" ry="2.4" fill="#ff8fa3" opacity="0.5"/>
    <ellipse cx="66" cy="66" rx="4" ry="2.4" fill="#ff8fa3" opacity="0.5"/>`;

  // ---- 口 ----
  let mouth;
  switch (f.mouth) {
    case 'grin':   mouth = `<path d="M43,69 Q50,78 57,69 Z" fill="#c85068"/><path d="M45,70 Q50,72 55,70" stroke="#fff" stroke-width="1.5" fill="none"/>`; break;
    case 'gentle': mouth = `<path d="M46,70 Q50,72.5 54,70" stroke="#c0506a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`; break;
    case 'cool':   mouth = `<path d="M46,71 L54,71" stroke="#b0506a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`; break;
    case 'lips':   mouth = `<path d="M44,70 Q50,75 56,70 Q50,72 44,70 Z" fill="#d63a5a"/>`; break;
    default:       mouth = `<path d="M45,70 Q50,74 55,70" stroke="#c0506a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`; // smile
  }

  // ---- アクセサリ（髪の左上に配置） ----
  const acc = f.acc, ac = f.accColor || '#fff';
  let accessory = '';
  const T = 'translate(32,29)';
  if (acc === 'flower') {
    accessory = `<g transform="${T}">
      <circle cx="0" cy="-4" r="3" fill="${ac}"/><circle cx="3.8" cy="-1.2" r="3" fill="${ac}"/>
      <circle cx="2.3" cy="3.2" r="3" fill="${ac}"/><circle cx="-2.3" cy="3.2" r="3" fill="${ac}"/>
      <circle cx="-3.8" cy="-1.2" r="3" fill="${ac}"/><circle r="2.2" fill="#ffd84d"/></g>`;
  } else if (acc === 'star') {
    accessory = `<path transform="${T}" d="M0,-5 L1.4,-1.6 L5,-1.6 L2.1,0.6 L3.2,4.2 L0,2 L-3.2,4.2 L-2.1,0.6 L-5,-1.6 L-1.4,-1.6 Z" fill="${ac}"/>`;
  } else if (acc === 'moon') {
    accessory = `<g transform="${T}"><circle r="5" fill="${ac}"/><circle cx="2.4" cy="-1.2" r="4.2" fill="${hair}"/></g>`;
  } else if (acc === 'ribbon') {
    accessory = `<g transform="${T}"><path d="M0,0 L-6,-4 L-6,4 Z" fill="${ac}"/><path d="M0,0 L6,-4 L6,4 Z" fill="${ac}"/><circle r="1.8" fill="${ac}"/></g>`;
  } else if (acc === 'snow') {
    accessory = `<g transform="${T}" stroke="${ac}" stroke-width="1.2" stroke-linecap="round">
      <line x1="0" y1="-5" x2="0" y2="5"/><line x1="-4.3" y1="-2.5" x2="4.3" y2="2.5"/><line x1="-4.3" y1="2.5" x2="4.3" y2="-2.5"/></g>`;
  }

  // ---- イヤリング（任意） ----
  const earring = f.earring ? `<circle cx="72" cy="67" r="2.2" fill="${f.earring}"/>` : '';

  return `<svg class="avatar" viewBox="0 0 100 100" width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">`
    + defs + bg + backHair + hairMass + ears + face + bangs + brows + eyes + blush + mouth + accessory + earring
    + `</svg>`;
}
