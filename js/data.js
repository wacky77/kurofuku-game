// ===============================================
// 付け回しマスター - ゲームデータ定義
// ===============================================

// --- キャスト応募者（この中から4人を選抜） ---
// stats は 1〜5 の5段階。stamina は 0〜100。
const CAST_POOL = [
  { id: 'aya',   name: 'あや',   emoji: '😊', tag: '癒し系',   stats: { heal: 5, talk: 2, price: 4, smile: 3 }, rookie: false,
    face: { bg: '#3a2630', bg2: '#5a3a48', skin: '#ffe0cf', hair: '#8a5a3c', hair2: '#6e442c', eye: '#7a4a2c', hairStyle: 'long',     mouth: 'gentle', acc: 'ribbon', accColor: '#f2a6c0' } },
  { id: 'rei',   name: 'レイ',   emoji: '😎', tag: 'トーク',   stats: { heal: 2, talk: 5, price: 3, smile: 3 }, rookie: false,
    face: { bg: '#25243a', bg2: '#3c3a5c', skin: '#ffdcc8', hair: '#3a3550', hair2: '#282540', eye: '#7a6ad0', hairStyle: 'ponytail', mouth: 'cool',   acc: 'star',   accColor: '#e6c14b' } },
  { id: 'mina',  name: 'ミナ',   emoji: '🌸', tag: '新人',     stats: { heal: 3, talk: 2, price: 2, smile: 5 }, rookie: true,
    face: { bg: '#3a2632', bg2: '#5c3a4c', skin: '#ffe4d4', hair: '#ff9ec4', hair2: '#e87aa8', eye: '#ff6fa3', hairStyle: 'twin',     mouth: 'grin',   acc: 'flower', accColor: '#ff7ab0' } },
  { id: 'karen', name: 'カレン', emoji: '💋', tag: '高単価',   stats: { heal: 3, talk: 4, price: 5, smile: 3 }, rookie: false,
    face: { bg: '#2e1a2a', bg2: '#4e2a44', skin: '#ffdcc8', hair: '#a83250', hair2: '#822640', eye: '#c04868', hairStyle: 'wavy',     mouth: 'lips',   acc: 'none',   earring: '#e6c14b' } },
  { id: 'yuki',  name: 'ユキ',   emoji: '❄️', tag: 'クール',   stats: { heal: 4, talk: 3, price: 4, smile: 2 }, rookie: false,
    face: { bg: '#1e2c3a', bg2: '#33506e', skin: '#ffe4d8', hair: '#bcd8f0', hair2: '#93b8d8', eye: '#5aa0d0', hairStyle: 'long',     mouth: 'cool',   acc: 'snow',   accColor: '#eaf6ff' } },
  { id: 'momo',  name: 'モモ',   emoji: '🍑', tag: '元気',     stats: { heal: 2, talk: 4, price: 2, smile: 5 }, rookie: false,
    face: { bg: '#3a2c22', bg2: '#5c4230', skin: '#ffe0cf', hair: '#ffb27a', hair2: '#e88f52', eye: '#d2691e', hairStyle: 'bob',      mouth: 'grin',   acc: 'none' } },
  { id: 'sara',  name: 'サラ',   emoji: '✨', tag: 'バランス', stats: { heal: 3, talk: 3, price: 3, smile: 3 }, rookie: false,
    face: { bg: '#33302a', bg2: '#54503f', skin: '#ffe4d4', hair: '#f0d68a', hair2: '#d0b45a', eye: '#b0904a', hairStyle: 'bob',      mouth: 'smile',  acc: 'star',   accColor: '#fff2b8' } },
  { id: 'noa',   name: 'ノア',   emoji: '🌙', tag: '新人',     stats: { heal: 4, talk: 2, price: 3, smile: 4 }, rookie: true,
    face: { bg: '#20243c', bg2: '#333a60', skin: '#ffe0cf', hair: '#4a5a8a', hair2: '#374472', eye: '#6a7ab0', hairStyle: 'long',     mouth: 'gentle', acc: 'moon',   accColor: '#f0e68c' } },
  { id: 'runa',  name: 'ルナ',   emoji: '🍷', tag: 'お姉さん', stats: { heal: 4, talk: 3, price: 5, smile: 3 }, rookie: false,
    face: { bg: '#2a1e30', bg2: '#46304e', skin: '#ffdcc8', hair: '#6a3a6c', hair2: '#502a52', eye: '#9a5ab0', hairStyle: 'wavy',     mouth: 'lips',   acc: 'none',   earring: '#e6c14b' } },
  { id: 'hina',  name: 'ヒナ',   emoji: '🎀', tag: '新人',     stats: { heal: 3, talk: 2, price: 1, smile: 5 }, rookie: true,
    face: { bg: '#3a2a26', bg2: '#5c4232', skin: '#ffe4d4', hair: '#ffcf8a', hair2: '#e8b05a', eye: '#c98a3a', hairStyle: 'twin',     mouth: 'grin',   acc: 'ribbon', accColor: '#ff9ec4' } },
  { id: 'sena',  name: 'セナ',   emoji: '⭐', tag: 'ギャル',   stats: { heal: 2, talk: 5, price: 4, smile: 4 }, rookie: false,
    face: { bg: '#2e2a1e', bg2: '#4e4630', skin: '#f0c8a0', hair: '#f5d24a', hair2: '#d0ad2a', eye: '#a0782a', hairStyle: 'ponytail', mouth: 'grin',   acc: 'star',   accColor: '#ffec8a' } },
  { id: 'akari', name: 'アカリ', emoji: '🌷', tag: '癒し系',   stats: { heal: 5, talk: 2, price: 4, smile: 2 }, rookie: false,
    face: { bg: '#2e2622', bg2: '#4a3a2e', skin: '#ffe0cf', hair: '#7a4a30', hair2: '#5e3822', eye: '#8a5a34', hairStyle: 'long',     mouth: 'gentle', acc: 'flower', accColor: '#ffb0c8' } },
  { id: 'chisa', name: 'チサ',   emoji: '🖤', tag: '高単価',   stats: { heal: 2, talk: 3, price: 5, smile: 3 }, rookie: false,
    face: { bg: '#1e1e26', bg2: '#34343f', skin: '#ffe4d8', hair: '#2a2735', hair2: '#1a1822', eye: '#6a6a80', hairStyle: 'bob',      mouth: 'cool',   acc: 'none',   earring: '#d8d8e0' } },
  { id: 'mayu',  name: 'マユ',   emoji: '🌿', tag: '元気',     stats: { heal: 3, talk: 4, price: 2, smile: 4 }, rookie: false,
    face: { bg: '#1e2e2c', bg2: '#305048', skin: '#ffe0cf', hair: '#4aa890', hair2: '#2e8470', eye: '#3a9a84', hairStyle: 'short',    mouth: 'smile',  acc: 'moon',   accColor: '#eaf6ff' } },
  // --- 増員（第2期メンバー） ---
  { id: 'emi',   name: 'エミ',   emoji: '🌼', tag: '癒し系',   stats: { heal: 5, talk: 3, price: 3, smile: 3 }, rookie: false,
    face: { bg: '#33291e', bg2: '#544230', skin: '#ffe0cf', hair: '#a06a3e', hair2: '#805028', eye: '#8a5a34', hairStyle: 'long',     mouth: 'gentle', acc: 'flower', accColor: '#ffd08a' } },
  { id: 'riko',  name: 'リコ',   emoji: '🔥', tag: 'トーク',   stats: { heal: 2, talk: 5, price: 4, smile: 3 }, rookie: false,
    face: { bg: '#3a1e22', bg2: '#5c303a', skin: '#ffdcc8', hair: '#c04030', hair2: '#983026', eye: '#c0503a', hairStyle: 'wavy',     mouth: 'grin',   acc: 'star',   accColor: '#ffb07a' } },
  { id: 'nana',  name: 'ナナ',   emoji: '🐰', tag: '新人',     stats: { heal: 3, talk: 3, price: 2, smile: 5 }, rookie: true,
    face: { bg: '#3a2e34', bg2: '#5c4a54', skin: '#ffe4d4', hair: '#e8b0d0', hair2: '#c888b0', eye: '#e07ab0', hairStyle: 'twin',     mouth: 'grin',   acc: 'ribbon', accColor: '#ffa8d0' } },
  { id: 'reina', name: 'レイナ', emoji: '👠', tag: '高単価',   stats: { heal: 3, talk: 3, price: 5, smile: 4 }, rookie: false,
    face: { bg: '#2c1a2c', bg2: '#4c2a4c', skin: '#ffdcc8', hair: '#8a2a5a', hair2: '#6a2046', eye: '#b0507a', hairStyle: 'wavy',     mouth: 'lips',   acc: 'none',   earring: '#e6c14b' } },
  { id: 'shion', name: 'シオン', emoji: '🌌', tag: 'クール',   stats: { heal: 4, talk: 4, price: 4, smile: 2 }, rookie: false,
    face: { bg: '#1e2438', bg2: '#333c5e', skin: '#ffe4d8', hair: '#3a4a86', hair2: '#2a3868', eye: '#5a6ac0', hairStyle: 'long',     mouth: 'cool',   acc: 'snow',   accColor: '#dfeaff' } },
  { id: 'kana',  name: 'カナ',   emoji: '🎉', tag: '元気',     stats: { heal: 2, talk: 5, price: 3, smile: 5 }, rookie: false,
    face: { bg: '#3a2a1a', bg2: '#5c4628', skin: '#f4cca4', hair: '#f0a838', hair2: '#d0862a', eye: '#b07830', hairStyle: 'ponytail', mouth: 'grin',   acc: 'star',   accColor: '#ffe08a' } },
  { id: 'miku',  name: 'ミク',   emoji: '💠', tag: 'バランス', stats: { heal: 3, talk: 3, price: 3, smile: 4 }, rookie: false,
    face: { bg: '#1e2e34', bg2: '#305058', skin: '#ffe4d4', hair: '#4aa0c0', hair2: '#2e80a0', eye: '#3a9ac0', hairStyle: 'bob',      mouth: 'smile',  acc: 'moon',   accColor: '#d0f0ff' } },
  { id: 'rui',   name: 'ルイ',   emoji: '🕊️', tag: '新人',     stats: { heal: 4, talk: 2, price: 2, smile: 4 }, rookie: true,
    face: { bg: '#2e2e34', bg2: '#4a4a56', skin: '#ffe0cf', hair: '#b0a8b8', hair2: '#8e8698', eye: '#8a86a0', hairStyle: 'bob',      mouth: 'gentle', acc: 'ribbon', accColor: '#e8d0f0' } },
  { id: 'arisa', name: 'アリサ', emoji: '🍸', tag: 'お姉さん', stats: { heal: 5, talk: 3, price: 5, smile: 2 }, rookie: false,
    face: { bg: '#2a1e2e', bg2: '#46304c', skin: '#ffdcc8', hair: '#5a3a68', hair2: '#442a50', eye: '#9a5ab0', hairStyle: 'wavy',     mouth: 'lips',   acc: 'none',   earring: '#e6c14b' } },
  { id: 'koharu',name: 'コハル', emoji: '🍃', tag: '新人',     stats: { heal: 4, talk: 2, price: 3, smile: 4 }, rookie: true,
    face: { bg: '#26301e', bg2: '#405030', skin: '#ffe4d4', hair: '#8aa858', hair2: '#6a883e', eye: '#7a9040', hairStyle: 'twin',     mouth: 'gentle', acc: 'flower', accColor: '#d0e89a' } },
  { id: 'maria', name: 'マリア', emoji: '💃', tag: 'ギャル',   stats: { heal: 2, talk: 5, price: 5, smile: 4 }, rookie: false,
    face: { bg: '#301e2a', bg2: '#503046', skin: '#f0c8a0', hair: '#d8b040', hair2: '#b8902a', eye: '#a0782a', hairStyle: 'long',     mouth: 'grin',   acc: 'star',   accColor: '#ffe89a' } },
  { id: 'yua',   name: 'ユア',   emoji: '🌸', tag: '癒し系',   stats: { heal: 5, talk: 2, price: 3, smile: 3 }, rookie: false,
    face: { bg: '#3a2630', bg2: '#5a3a4a', skin: '#ffe4d4', hair: '#c07a5a', hair2: '#a05e40', eye: '#9a6040', hairStyle: 'long',     mouth: 'gentle', acc: 'flower', accColor: '#ffc0c8' } },
  { id: 'rara',  name: 'ララ',   emoji: '💎', tag: '高単価',   stats: { heal: 2, talk: 4, price: 5, smile: 3 }, rookie: false,
    face: { bg: '#1e2632', bg2: '#324058', skin: '#ffdcc8', hair: '#2a3040', hair2: '#1a2030', eye: '#6a7a9a', hairStyle: 'wavy',     mouth: 'lips',   acc: 'none',   earring: '#d8d8e0' } },
  { id: 'tsubasa',name:'ツバサ', emoji: '⚡', tag: '元気',     stats: { heal: 3, talk: 4, price: 2, smile: 5 }, rookie: false,
    face: { bg: '#2e2a1e', bg2: '#4c4630', skin: '#ffe0cf', hair: '#d0a030', hair2: '#b08020', eye: '#a07830', hairStyle: 'short',    mouth: 'smile',  acc: 'moon',   accColor: '#ffe89a' } },
];

// --- お客のニーズ種別 ---
// key: 内部キー / label: 表示 / need: 重視するキャストのステータス
const NEEDS = {
  heal:  { label: '癒されたい',       need: 'heal'  },
  talk:  { label: '盛り上がりたい',   need: 'talk'  },
  price: { label: 'とことん飲みたい', need: 'price' },
  smile: { label: '元気をもらいたい', need: 'smile' },
};

// --- お客の名字（来店客ごとにランダムで割り当て。表示は「〇〇さん」）---
const CUSTOMER_NAMES = [
  '田中', '佐藤', '鈴木', '高橋', '渡辺', '伊藤', '山本', '中村', '小林', '加藤',
  '吉田', '山田', '佐々木', '松本', '井上', '木村', '林', '清水', '山口', '森',
  '池田', '橋本', '阿部', '石川', '中島', '前田', '藤田', '後藤', '岡田', '長谷川',
  '村上', '近藤', '石井', '斉藤', '坂本', '遠藤', '青木', '藤井', '西村', '福田',
];

// --- お客のプロフィール断片（来店客をランダム生成する材料） ---
const CUSTOMER_AGES = ['20代', '30代', '40代', '50代', '60代'];
const CUSTOMER_CONTEXTS = [
  '接待帰り', '仕事終わり', '記念日', '常連さん', '初来店', '二次会', 'ひとり飲み',
  '出張中', '週末の夜', '同伴後', '祝勝会', 'なじみの店',
];

// --- 一般客のペルソナ（職業タイプ）---
// emoji＋色付きアイコンで一人ひとり見分けられる。budgets からランダムに予算決定。
// bg/bg2 はアイコンタイルの背景グラデーション。
// needBias: そのペルソナが求めがちなニーズ（6割の確率で採用、4割はランダム）。
// lines: 口ぐせ（来店時にランダムで1つ喋る）。
const CUSTOMER_TYPES = [
  { id: 'salary',   title: 'サラリーマン', emoji: '🧑‍💼', bg: '#1e2740', bg2: '#33436e', budgets: [35000, 40000, 55000], needBias: 'talk',
    lines: ['今日も一日疲れたよ〜', 'ちょっと飲んでいこうかな'] },
  { id: 'young',    title: '若手社員',     emoji: '👔',   bg: '#24303a', bg2: '#3a4e5e', budgets: [20000, 35000],        needBias: 'smile',
    lines: ['先輩に連れられて来ました！', 'こういうお店、緊張しますね…'] },
  { id: 'bucho',    title: '部長さん',     emoji: '🕴️',   bg: '#26242e', bg2: '#403c50', budgets: [55000, 70000],        needBias: 'price',
    lines: ['今日は無礼講だ！パーッといこう', 'いいボトル入れちゃおうか'] },
  { id: 'oyakata',  title: '建設の親方',   emoji: '👷',   bg: '#3a2a1e', bg2: '#5c4230', budgets: [35000, 40000, 55000], needBias: 'price',
    lines: ['今日は現場がうまくいってな！', 'パーッと飲むぞ〜！'] },
  { id: 'doctor',   title: 'お医者さん',   emoji: '🧑‍⚕️', bg: '#1e3236', bg2: '#335056', budgets: [55000, 70000],        needBias: 'heal',
    lines: ['オペ続きで疲れててね…', 'ゆっくりさせてもらうよ'] },
  { id: 'lawyer',   title: '弁護士',       emoji: '⚖️',   bg: '#22203c', bg2: '#39366a', budgets: [55000, 70000],        needBias: 'talk',
    lines: ['久々に息抜きに来たよ', '君と話すと落ち着くね'] },
  { id: 'itceo',    title: 'IT社長',       emoji: '🧑‍💻', bg: '#1e3038', bg2: '#2e5866', budgets: [55000, 70000],        needBias: 'price',
    lines: ['最近IPOしてね、景気いいよ', '細かいことは気にしない主義でね'] },
  { id: 'band',     title: 'バンドマン',   emoji: '🎸',   bg: '#2a1e34', bg2: '#463056', budgets: [20000, 35000],        needBias: 'smile',
    lines: ['ライブ終わりでテンション高いっす！', '盛り上がっていこうぜ！'] },
  { id: 'prof',     title: '大学教授',     emoji: '🎓',   bg: '#2e2620', bg2: '#4a3a2e', budgets: [35000, 40000, 55000], needBias: 'talk',
    lines: ['面白い話を聞かせてくれるかい？', 'たまには俗世で息抜きだ'] },
  { id: 'chef',     title: '板前さん',     emoji: '🍣',   bg: '#301e22', bg2: '#54303a', budgets: [35000, 40000, 55000], needBias: 'heal',
    lines: ['店じまい後の一杯が効くね', '静かに飲ませてもらうよ'] },
  { id: 'farmer',   title: '農家のおやじ', emoji: '👨‍🌾', bg: '#1e2e22', bg2: '#305038', budgets: [20000, 35000],        needBias: 'heal',
    lines: ['たまの贅沢だでな〜', '都会は落ち着かんわい'] },
  { id: 'comedian', title: 'お笑い芸人',   emoji: '🎤',   bg: '#331e2a', bg2: '#5c3048', budgets: [35000, 40000, 55000], needBias: 'smile',
    lines: ['どう、オレ面白い？', '笑わせてくれる子がいいなァ'] },
  { id: 'trader',   title: '証券マン',     emoji: '📈',   bg: '#1e2e2a', bg2: '#2e5048', budgets: [40000, 55000, 70000], needBias: 'price',
    lines: ['今日は相場で勝ったからな！', 'パーッと使わせてもらうよ'] },
  { id: 'sensei',   title: '先生（士業）', emoji: '🖋️',   bg: '#2a2620', bg2: '#4a4230', budgets: [40000, 55000],        needBias: 'talk',
    lines: ['顧問先の接待でね', 'ま、一杯やりましょう'] },
  // --- 増枠ペルソナ ---
  { id: 'teacher',  title: '学校の先生',   emoji: '📚',   bg: '#1e2a34', bg2: '#324a5c', budgets: [35000, 40000, 55000], needBias: 'heal',
    lines: ['たまには羽を伸ばさないとね', '生徒には内緒だよ？'] },
  { id: 'police',   title: '警察官',       emoji: '👮',   bg: '#1e2438', bg2: '#2e3a66', budgets: [35000, 40000, 55000], needBias: 'talk',
    lines: ['非番の日くらいはな', '固い仕事だから息抜きさ'] },
  { id: 'pilot',    title: 'パイロット',   emoji: '✈️',   bg: '#1e2e38', bg2: '#2e5066', budgets: [55000, 70000],        needBias: 'price',
    lines: ['フライト明けでね', '世界を飛び回ってるよ'] },
  { id: 'fisher',   title: '漁師',         emoji: '🎣',   bg: '#1e2e30', bg2: '#2e5054', budgets: [35000, 40000, 55000], needBias: 'price',
    lines: ['今日は大漁だったぞ！', '海の男は豪快でな！'] },
  { id: 'designer', title: 'デザイナー',   emoji: '🎨',   bg: '#2e1e34', bg2: '#4a3056', budgets: [35000, 40000, 55000], needBias: 'smile',
    lines: ['締切あがってスッキリだよ', 'センスいい子が好みでね'] },
  { id: 'realtor',  title: '不動産社長',   emoji: '🏠',   bg: '#332818', bg2: '#5c4a1e', budgets: [55000, 70000],        needBias: 'price',
    lines: ['物件がポンと売れてね', '景気のいい話をしようや'] },
  { id: 'dentist',  title: '歯医者さん',   emoji: '🦷',   bg: '#1e3234', bg2: '#335254', budgets: [55000, 70000],        needBias: 'heal',
    lines: ['細かい仕事で肩が凝ってね', 'のんびりさせてもらうよ'] },
  { id: 'actor',    title: '俳優',         emoji: '🎬',   bg: '#301e2c', bg2: '#54304c', budgets: [55000, 70000],        needBias: 'talk',
    lines: ['撮影あがりで来たんだ', '面白い話、聞かせてよ'] },
  { id: 'athlete',  title: 'スポーツ選手', emoji: '⚾',    bg: '#1e2e22', bg2: '#2e5038', budgets: [40000, 55000, 70000], needBias: 'smile',
    lines: ['シーズンオフだからな！', '元気な子と飲みたいね'] },
  { id: 'mayor',    title: '地元議員',     emoji: '🎗️',   bg: '#2a2018', bg2: '#4a3a22', budgets: [55000, 70000],        needBias: 'talk',
    lines: ['地元の皆さんのおかげでね', 'ま、堅い話は抜きで'] },
  { id: 'novelist', title: '小説家',       emoji: '✍️',   bg: '#241e2e', bg2: '#3c3050', budgets: [35000, 40000, 55000], needBias: 'heal',
    lines: ['筆が進まなくてね…', '静かに一杯やりたいんだ'] },
  { id: 'barber',   title: '理容師',       emoji: '💈',   bg: '#2e2222', bg2: '#503a3a', budgets: [20000, 35000],        needBias: 'smile',
    lines: ['店じまいして来たよ', '賑やかなのが好きでね'] },
  { id: 'driver',   title: 'タクシー運転手',emoji: '🚕',  bg: '#2e2a18', bg2: '#4e461e', budgets: [20000, 35000],        needBias: 'heal',
    lines: ['夜勤明けでクタクタさ', 'ちょっと休ませてくれ'] },
  { id: 'youtuber', title: 'ユーチューバー',emoji: '📱',  bg: '#2e1e28', bg2: '#503046', budgets: [35000, 40000, 55000], needBias: 'smile',
    lines: ['バズって景気いいっす！', '楽しい子と盛り上がりたい！'] },
];

// --- ランダムイベント（通常客より発生率は低い） ---
// bonusMult: 成功時の売上倍率 / need: 求められるステータス
const EVENTS = [
  { id: 'birthday', title: '誕生日客', emoji: '🎂', context: '今日が誕生日', need: 'smile', budget: 70000,  bonusMult: 1.5, desc: '盛大に祝って喜ばせたい！',       bg: '#3a1e2e', bg2: '#5c3050', lines: ['今日オレの誕生日なんだ！', 'パーッと祝ってほしいな'] },
  { id: 'ceo',      title: '社長来店', emoji: '🤵', context: 'VIP・大口',    need: 'price', budget: 140000, bonusMult: 1.6, desc: '太い客。高単価キャストで攻めたい。', bg: '#322a12', bg2: '#5c4a14', lines: ['うちの連中も連れて来たよ', '今日はいくら使ってもいい'] },
  { id: 'drunk',    title: '酔っ払い', emoji: '🥴', context: 'かなり酔ってる', need: 'heal',  budget: 35000,  bonusMult: 1.2, desc: '落ち着かせられるキャストを。',     bg: '#2a2e1e', bg2: '#464e30', lines: ['もう…けっこう飲んでるぅ…', 'ちょっと落ち着きたいなァ…'] },
  { id: 'vip',      title: 'VIP指名',  emoji: '👑', context: '常連の上客',    need: 'talk',  budget: 105000, bonusMult: 1.5, desc: '会話で満足させればリピート確実。', bg: '#2a1e3a', bg2: '#463066', lines: ['いつもの子はいるかい？', '今日も楽しませてくれよ'] },
];

// --- 難易度／日ごとの設定 ---
// customersPerDay 等は「DAY1相当の基準値」。実際の値は difficulty(day) が
// 後半ほど厳しくなるよう補正して返す（下の *PerDay / *Max などで調整）。
const DAY_CONFIG = {
  customersPerDay: 6,     // 1日の来店数（基準）
  eventChance: 0.25,      // 各客がイベント客になる確率（基準）
  dailyGoal: 220000,      // 1日の目標売上（基準＝DAY1）。v21/v22の収益ダウン（単価0.72・体力カーブ強化）
                          // に合わせて tools/sim.js で再計測し 300k→220k に調整（時間切れモデル込みで
                          // 最適プレイ DAY6到達75%・現実的プレイ48%@DAY4。初日即死をなくしつつ難度は維持）
  timeLimitSec: 8,        // 1組あたりの選択制限時間・秒（基準＝DAY1）
  staminaCost: 20,        // 接客1回で消費する体力
  staminaRecover: 5,      // 接客されなかったキャストが回復する体力
  // 体力→実効係数の滑らかなカーブ（旧: 50/25の階段状 1.0/0.7/0.4）。
  // factor = floor + (1-floor) * (stamina/100)^curve  （100→1.0, 0→floor）
  staminaFloor: 0.25,     // 体力0での係数の下限（旧0.4→0.25でペナルティ強化）
  staminaCurve: 1.4,      // カーブの指数（>1で体力が減るほど急落＝中〜低体力を強く罰する）
  budgetScale: 0.72,      // 客単価の一括補正（0.9→0.72、従来比さらに2割ダウンで難度UP）。予算は1000円単位に丸める

  // --- 後半ほど難しくする難易度カーブ ---
  goalPerDay: 45000,      // 1日ごとに上乗せする売上目標（55k→45k・dailyGoalと同時にsim再調整）
  timeStepDays: 2,        // 何日ごとに制限時間を1秒縮めるか
  timeLimitMin: 4,        // 制限時間の下限（秒）
  custStepDays: 2,        // 何日ごとに来店数を+1するか
  customersMax: 10,       // 来店数の上限
  eventChancePerDay: 0.03,// 1日ごとに上がるイベント発生率
  eventChanceMax: 0.5,    // イベント発生率の上限
  // --- 翌日への繰越（連投で疲弊させる）---
  // 繰越メンバーは一晩でこの量だけ体力回復（100上限）。全開はしない。
  overnightRecoverBase: 40, // 繰越1回目の夜の回復量
  overnightRecoverStep: 10, // 繰越が1回増えるごとに回復量を減らす
  overnightRecoverMin: 5,   // 回復量の下限（連投しすぎでもこれだけは回復）
  // --- 席数拡大（黒服の成長で雇えるキャストが増える）---
  seatBase: 4,        // 開店時の席数（＝初日の選抜人数）
  seatStepDays: 3,    // 何日ごとに席が1つ増えるか（DAY4で5席、DAY7で6席…）
  seatMax: 6,         // 席数の上限
};

// その日に使える席数（雇えるキャスト数）。DAYが進むほど増える。
function capacity(day) {
  const d = DAY_CONFIG;
  const n = Math.max(0, day - 1);
  return Math.min(d.seatMax, d.seatBase + Math.floor(n / d.seatStepDays));
}

// --- 黒服ランク（通算売上で昇格していくマネージャーの役職）---
const RANKS = [
  { min: 0,        title: '見習い黒服',           emoji: '🔰' },
  { min: 800000,   title: '黒服',                 emoji: '🕴️' },
  { min: 2000000,  title: '主任',                 emoji: '🎩' },
  { min: 3500000,  title: '副店長',               emoji: '🥂' },
  { min: 5500000,  title: '店長',                 emoji: '👑' },
  { min: 8000000,  title: 'エリアマネージャー',   emoji: '💎' },
  { min: 12000000, title: '伝説の黒服',           emoji: '🏆' },
];

// 通算売上から現在の役職・次の役職・進捗(%)を返す
function rankFor(totalSales) {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) { if (totalSales >= RANKS[k].min) i = k; }
  const cur = RANKS[i];
  const next = RANKS[i + 1] || null;
  const progress = next ? Math.min(100, Math.round((totalSales - cur.min) / (next.min - cur.min) * 100)) : 100;
  return { index: i, title: cur.title, emoji: cur.emoji, next, progress };
}

// その日の実効設定を返す（DAYが進むほど厳しくなる）
function difficulty(day) {
  const d = DAY_CONFIG;
  const n = Math.max(0, day - 1); // DAY1 = 0
  return {
    goal:        d.dailyGoal + n * d.goalPerDay,
    timeLimit:   Math.max(d.timeLimitMin, d.timeLimitSec - Math.floor(n / d.timeStepDays)),
    customers:   Math.min(d.customersMax, d.customersPerDay + Math.floor(n / d.custStepDays)),
    eventChance: Math.min(d.eventChanceMax, d.eventChance + n * d.eventChancePerDay),
  };
}
