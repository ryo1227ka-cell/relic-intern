import { useState, useEffect, useMemo, useRef, useId, Fragment } from "react";
import {
  Plane, Search, SlidersHorizontal, ChevronLeft, Check, X, Star, MapPin, Building2, GraduationCap,
  MessageCircle, Send, Users, User, Clock, FileText, Scale, Trash2, CalendarDays, Sparkles, Languages, Lightbulb,
  Heart, Home, Compass, ChevronRight, CheckCircle2, Circle,
} from "lucide-react";

/* ============================================================
   データ（本番では src/data/ と Supabase に置き換える想定）
   ============================================================ */

const FORMATS = ["語学留学", "大学留学"];

const COUNTRY = {
  フィリピン: {
    lon: 121.0, lat: 14.6, flag: "🇵🇭", alias: "ふぃりぴん philippines", flight: 70000,
    limitWeeks: 4,
    visaShort: "30日以内なら観光ビザは不要です。31日以上は現地で延長手続きが必要で、学校が代行します",
    visaLong: "長期の就学には学生ビザが必要です。入学許可が出たあと、専門家と一緒に申請します",
  },
  オーストラリア: {
    lon: 151.2, lat: -33.9, flag: "🇦🇺", alias: "おーすとらりあ ごう australia", flight: 150000,
    limitWeeks: 12,
    visaShort: "12週までなら観光ビザ（ETA）で学べます",
    visaLong: "13週以上は学生ビザが必要です。専門家と一緒にオンラインで申請します",
  },
  カナダ: {
    lon: -123.1, lat: 49.3, flag: "🇨🇦", alias: "かなだ canada", flight: 140000,
    limitWeeks: 24,
    visaShort: "6か月以内の就学ならeTA（電子渡航認証）で学べます。オンラインで一緒に申請します",
    visaLong: "6か月を超える就学には学習許可証が必要です。専門家と一緒に申請します",
  },
  マルタ: {
    lon: 14.5, lat: 35.9, flag: "🇲🇹", alias: "まるた malta", flight: 200000,
    limitWeeks: 12,
    visaShort: "90日以内ならビザは不要です",
    visaLong: "91日以上は現地で滞在許可の手続きが必要です。専門家と一緒に準備します",
  },
};
const COUNTRIES = Object.keys(COUNTRY);

const SCHOOLS = [
  // フィリピン
  { id: "cebu", format: "語学留学", name: "セブ・オーシャン語学アカデミー", sign: "OCEAN ACADEMY", country: "フィリピン", city: "セブ", alias: "せぶ cebu", scene: "sea", rating: 4.5, reviewCount: 128, tags: ["海が近い", "初心者が多い"],
    region: "物価が安く、日本から約5時間。週末は島めぐりや海へ。", atmosphere: "マンツーマン中心。日本人は約3割で、英語初心者も多め。",
    hours: "1日6〜8コマで、うち4コマはマンツーマン", commute: "寮は校舎と同じ敷地内なので、通学は徒歩0分です", safety: "校内は24時間警備で、夜の外出には門限があります" },
  { id: "baguio", format: "語学留学", name: "バギオ・ハイランド英語学院", sign: "HIGHLAND", country: "フィリピン", city: "バギオ", alias: "ばぎお baguio", scene: "mountain", rating: 4.4, reviewCount: 87, tags: ["スパルタ", "自然が近い"],
    region: "標高1500mの高原都市。一年中涼しく、勉強に集中しやすい。", atmosphere: "平日は外出制限のあるスパルタ式。台湾や韓国の学生も多い。",
    hours: "1日10コマ（マンツーマン6コマと自習）", commute: "寮は校舎の隣で、徒歩2分です", safety: "外出は週末のみで、校内は24時間警備です" },
  { id: "clark", format: "語学留学", name: "クラーク・ブリッジ英語学校", sign: "BRIDGE", country: "フィリピン", city: "クラーク", alias: "くらーく clark", scene: "city", rating: 4.3, reviewCount: 64, tags: ["ネイティブ講師", "都会"],
    region: "旧米軍基地の街で、整った街並みと治安の良さが特徴。", atmosphere: "フィリピン人講師に加えてネイティブ講師が在籍。社会人も多い。",
    hours: "1日7コマ（マンツーマン4コマとネイティブのグループ授業）", commute: "ホテル型の寮から、シャトルバスで10分です", safety: "経済特区内は警備が厳しく、フィリピンの中でも安全なエリアです" },
  { id: "manila-u", format: "大学留学", name: "フィリピン・パシフィック大学", sign: "PACIFIC UNIV.", country: "フィリピン", city: "マニラ", alias: "まにら manila", scene: "city", rating: 4.1, reviewCount: 42, tags: ["都会", "日本人少なめ"],
    region: "首都マニラ。授業はすべて英語で、学費を抑えて海外の大学に通える。", atmosphere: "アジア各国からの留学生が多く、日本人は少数。",
    hours: "1学期に4〜5科目を履修（週15時間前後）", commute: "大学寮からキャンパスまで徒歩5分です", safety: "キャンパス周辺は警備員が常駐しています。夜の移動は配車アプリが安心です" },

  // オーストラリア
  { id: "sydney", format: "語学留学", name: "シドニー・コーストライン英語学校", sign: "COASTLINE", country: "オーストラリア", city: "シドニー", alias: "しどにー sydney", scene: "sea", rating: 4.3, reviewCount: 96, tags: ["都会", "海が近い", "日本人少なめ"],
    region: "都会とビーチが近い。南半球なので季節は日本と逆。", atmosphere: "南米やヨーロッパからの学生が多く、日本人は約15%。",
    hours: "1日4.5時間のグループ授業", commute: "ホームステイ先から学校まで、電車とバスで30〜45分が目安です", safety: "比較的安全な都市ですが、夜の繁華街では荷物に注意が必要です" },
  { id: "melbourne", format: "語学留学", name: "メルボルン・レーンウェイ語学院", sign: "LANEWAY", country: "オーストラリア", city: "メルボルン", alias: "めるぼるん melbourne", scene: "city", rating: 4.5, reviewCount: 88, tags: ["都会", "日本人少なめ"],
    region: "カフェと路地裏アートの街。住みやすい都市としてよく名前が挙がる。", atmosphere: "1クラス最大12人の少人数制。ヨーロッパの学生が多い。",
    hours: "1日5時間（午前は文法、午後は会話）", commute: "ホームステイ先からトラムで25〜40分です", safety: "治安は良好です。夜のトラムは人の多い車両がおすすめです" },
  { id: "goldcoast", format: "語学留学", name: "ゴールドコースト・サーフ英語カレッジ", sign: "SURF COLLEGE", country: "オーストラリア", city: "ゴールドコースト", alias: "ごーるどこーすと gold coast", scene: "sea", rating: 4.4, reviewCount: 73, tags: ["海が近い", "アクティビティ充実"],
    region: "一年中温暖なビーチリゾート。放課後にサーフィンができる。", atmosphere: "陽気でフレンドリー。日本人は約2割。",
    hours: "1日4時間（午前のみ）。午後はアクティビティ", commute: "ホームステイ先からバスで20分です", safety: "治安は良好です。海では必ず監視員の旗の間で泳いでください" },
  { id: "brisbane-u", format: "大学留学", name: "ブリスベン・リバーサイド大学", sign: "RIVERSIDE UNIV.", country: "オーストラリア", city: "ブリスベン", alias: "ぶりすべん brisbane", scene: "city", rating: 4.4, reviewCount: 51, tags: ["都会"],
    region: "温暖で落ち着いた州都。学生の街で、生活費も比較的抑えめ。", atmosphere: "留学生は全体の約3割。留学生サポートセンターが手厚い。",
    hours: "1学期に4科目を履修（週12時間前後）", commute: "学生寮からキャンパスまでバスで15分です", safety: "治安は良好です。キャンパス内には夜間の送迎サービスがあります" },

  // カナダ
  { id: "vancouver", format: "語学留学", name: "パシフィック・メープル語学院", sign: "MAPLE", country: "カナダ", city: "バンクーバー", alias: "ばんくーばー vancouver", scene: "mountain", rating: 4.6, reviewCount: 142, tags: ["自然が近い", "都会"],
    region: "自然と街のバランスが良く、訛りの少ない英語。", atmosphere: "ワーホリ準備の学生が多く、授業後の交流イベントが盛ん。",
    hours: "1日5時間。午後は選択授業（ビジネス英語・発音など）", commute: "ホームステイ先から学校まで、スカイトレインで20〜40分が目安です", safety: "治安は比較的良好です。一部のエリアは夜の一人歩きを避けるよう案内しています" },
  { id: "toronto", format: "語学留学", name: "トロント・レイクショア英語学校", sign: "LAKESHORE", country: "カナダ", city: "トロント", alias: "とろんと toronto", scene: "city", rating: 4.4, reviewCount: 90, tags: ["都会", "日本人少なめ"],
    region: "カナダ最大の都市。多文化で、世界中の人と出会える。", atmosphere: "国籍のバランスが良く、日本人は1割未満。",
    hours: "1日5時間（ビジネス英語コースあり）", commute: "ホームステイ先から地下鉄で30〜45分です", safety: "治安は比較的良好です。冬は路面の凍結に注意してください" },
  { id: "victoria", format: "語学留学", name: "ビクトリア・ガーデン語学院", sign: "GARDEN", country: "カナダ", city: "ビクトリア", alias: "びくとりあ victoria", scene: "sea", rating: 4.5, reviewCount: 58, tags: ["自然が近い", "日本人少なめ"],
    region: "庭園の街と呼ばれる小さな州都。落ち着いて勉強したい人向け。", atmosphere: "1クラス最大10人のアットホームな学校。",
    hours: "1日4.5時間のグループ授業", commute: "ホームステイ先から徒歩またはバスで15〜25分です", safety: "カナダでも治安の良い街として知られています" },
  { id: "vancouver-u", format: "大学留学", name: "ノースウェスト・コースト大学", sign: "NW COAST UNIV.", country: "カナダ", city: "バンクーバー", alias: "ばんくーばー vancouver", scene: "mountain", rating: 4.5, reviewCount: 63, tags: ["自然が近い"],
    region: "海と山に囲まれたキャンパス。研究にも力を入れる総合大学。", atmosphere: "留学生は約3割。アジア出身の学生も多い。",
    hours: "1学期に4〜5科目（週15時間前後）", commute: "キャンパス内の学生寮に住めます（徒歩5分）", safety: "キャンパス内は安全で、夜間の送迎サービスがあります" },

  // マルタ
  { id: "malta", format: "語学留学", name: "メディテラニアン・サン英語アカデミー", sign: "MED SUN", country: "マルタ", city: "セントジュリアン", alias: "せんとじゅりあん st julian", scene: "sea", rating: 4.2, reviewCount: 71, tags: ["海が近い", "日本人少なめ"],
    region: "地中海の島国。ヨーロッパ旅行の拠点にもなる。", atmosphere: "ヨーロッパ各国からの学生が中心で、日本人は1割未満。",
    hours: "1日4コマのグループ授業（週20レッスン）", commute: "学生レジデンスから学校まで、徒歩10分です", safety: "治安は良好です。夏は観光客が多いのでスリに注意してください" },
  { id: "sliema", format: "語学留学", name: "スリーマ・ハーバー語学院", sign: "HARBOUR", country: "マルタ", city: "スリーマ", alias: "すりーま sliema", scene: "sea", rating: 4.4, reviewCount: 55, tags: ["海が近い", "都会"],
    region: "首都バレッタを望む港町。カフェや買い物に便利。", atmosphere: "30歳以上のクラスもあり、年齢層が幅広い。",
    hours: "1日5コマ（週30レッスン）", commute: "学生アパートから徒歩5分です", safety: "治安は良好です。夜も人通りが多いエリアです" },
  { id: "gozo", format: "語学留学", name: "ゴゾ・アイランド英語スクール", sign: "GOZO", country: "マルタ", city: "ゴゾ島", alias: "ごぞ gozo", scene: "sea", rating: 4.6, reviewCount: 34, tags: ["自然が近い", "日本人少なめ"],
    region: "本島からフェリーで25分の静かな島。ダイビングの名所。", atmosphere: "生徒は全体で60人ほど。先生との距離が近い。",
    hours: "1日4コマと午後の会話クラブ", commute: "ホームステイ先から徒歩10分です", safety: "とても治安の良い島です" },
  { id: "valletta-u", format: "大学留学", name: "バレッタ国際大学", sign: "VALLETTA UNIV.", country: "マルタ", city: "バレッタ", alias: "ばれった valletta", scene: "city", rating: 4.0, reviewCount: 29, tags: ["日本人少なめ"],
    region: "世界遺産の首都。EU圏の大学で、ヨーロッパ各国の学生と学べる。", atmosphere: "授業は英語。EU出身の学生が多数。",
    hours: "1学期に5科目（週15時間前後）", commute: "学生寮からバスで15分です", safety: "治安は良好です。夏は観光客が多いのでスリに注意してください" },
];

// id, 学校, コース, 種類, 週数, 学費, 滞在先, 滞在費, 諸費用, アクティビティ, 出願条件
const P = (id, schoolId, course, type, weeks, tuition, stayType, stay, fees, activities, requirement = null) =>
  ({ id, schoolId, course, type, weeks, tuition, stayType, stay, fees, activities, requirement });

const PLANS = [
  P("cebu-1", "cebu", "マンツーマン集中", "マンツーマン", 4, 150000, "学内寮（1人部屋・3食付き）", 70000, 35000, ["週末アクティビティ"]),
  P("cebu-2", "cebu", "IELTS対策", "試験対策", 12, 420000, "学内寮（2人部屋・3食付き）", 180000, 60000, ["週末アクティビティ", "現地ボランティア"]),
  P("baguio-1", "baguio", "スパルタ集中", "マンツーマン", 4, 140000, "学内寮（2人部屋・3食付き）", 60000, 35000, ["週末アクティビティ"]),
  P("baguio-2", "baguio", "スパルタ集中", "マンツーマン", 12, 400000, "学内寮（2人部屋・3食付き）", 170000, 55000, ["週末アクティビティ"]),
  P("clark-1", "clark", "ネイティブ講師つき一般英語", "一般英語", 8, 300000, "ホテル型寮（1人部屋・3食付き）", 160000, 45000, ["週末アクティビティ"]),
  P("clark-2", "clark", "ビジネス英語", "ビジネス英語", 4, 170000, "ホテル型寮（1人部屋・3食付き）", 85000, 35000, ["インターン紹介"]),
  P("manila-u-1", "manila-u", "1学期だけ留学（ビジネス学部）", "1学期だけ留学", 16, 400000, "大学寮（2人部屋）", 150000, 50000, ["現地ボランティア"], "IELTS 5.5以上"),
  P("manila-u-2", "manila-u", "学部正規入学（経営学）", "学部正規入学", 52, 900000, "大学寮（2人部屋）", 450000, 80000, ["現地ボランティア", "インターン紹介"], "IELTS 6.0以上・高校の成績証明書"),

  P("sydney-1", "sydney", "一般英語", "一般英語", 8, 380000, "ホームステイ（朝夕食付き）", 320000, 45000, ["週末アクティビティ"]),
  P("sydney-2", "sydney", "ケンブリッジ英検対策", "試験対策", 12, 580000, "ホームステイ（朝夕食付き）", 480000, 45000, ["週末アクティビティ", "インターン紹介"]),
  P("melbourne-1", "melbourne", "一般英語", "一般英語", 4, 190000, "ホームステイ（朝夕食付き）", 160000, 45000, ["週末アクティビティ"]),
  P("melbourne-2", "melbourne", "英語とカフェ実習", "ワーホリ準備", 12, 560000, "ホームステイ（朝夕食付き）", 470000, 45000, ["インターン紹介", "週末アクティビティ"]),
  P("goldcoast-1", "goldcoast", "英語とサーフィン", "一般英語", 4, 200000, "ホームステイ（朝夕食付き）", 150000, 45000, ["週末アクティビティ"]),
  P("goldcoast-2", "goldcoast", "一般英語（長期）", "一般英語", 24, 980000, "ホームステイ（朝夕食付き）", 900000, 45000, ["週末アクティビティ", "現地ボランティア"]),
  P("brisbane-u-1", "brisbane-u", "1学期だけ留学（観光学）", "1学期だけ留学", 16, 1600000, "学生寮（1人部屋）", 700000, 100000, ["インターン紹介"], "IELTS 6.0以上"),
  P("brisbane-u-2", "brisbane-u", "学部正規入学（観光・ホスピタリティ）", "学部正規入学", 52, 3800000, "学生寮（1人部屋）", 2000000, 150000, ["インターン紹介", "現地ボランティア"], "IELTS 6.5以上・高校の成績証明書"),

  P("vancouver-1", "vancouver", "一般英語", "一般英語", 4, 170000, "ホームステイ（3食付き）", 130000, 40000, ["週末アクティビティ"]),
  P("vancouver-2", "vancouver", "ワーホリ準備英語", "ワーホリ準備", 8, 340000, "ホームステイ（3食付き）", 260000, 40000, ["現地ボランティア", "インターン紹介"]),
  P("toronto-1", "toronto", "ビジネス英語", "ビジネス英語", 8, 360000, "ホームステイ（3食付き）", 270000, 40000, ["インターン紹介"]),
  P("toronto-2", "toronto", "IELTS対策", "試験対策", 12, 520000, "ホームステイ（3食付き）", 400000, 40000, ["週末アクティビティ"]),
  P("victoria-1", "victoria", "一般英語", "一般英語", 4, 160000, "ホームステイ（3食付き）", 125000, 40000, ["週末アクティビティ"]),
  P("victoria-2", "victoria", "一般英語とボランティア", "一般英語", 12, 470000, "ホームステイ（3食付き）", 370000, 40000, ["現地ボランティア"]),
  P("vancouver-u-1", "vancouver-u", "1学期だけ留学（環境学）", "1学期だけ留学", 16, 1500000, "学生寮（1人部屋）", 650000, 100000, ["現地ボランティア"], "IELTS 6.0以上"),
  P("vancouver-u-2", "vancouver-u", "学部正規入学（コンピュータ科学）", "学部正規入学", 52, 3500000, "学生寮（1人部屋）", 1900000, 150000, ["インターン紹介"], "IELTS 6.5以上・高校の成績証明書"),

  P("malta-1", "malta", "一般英語", "一般英語", 4, 160000, "学生レジデンス（相部屋）", 180000, 40000, ["週末アクティビティ"]),
  P("malta-2", "malta", "一般英語", "一般英語", 8, 300000, "学生レジデンス（相部屋）", 340000, 40000, ["週末アクティビティ", "現地ボランティア"]),
  P("sliema-1", "sliema", "集中英語", "一般英語", 4, 190000, "学生アパート（相部屋）", 170000, 40000, ["週末アクティビティ"]),
  P("sliema-2", "sliema", "ケンブリッジ英検対策", "試験対策", 12, 560000, "学生アパート（相部屋）", 480000, 40000, ["週末アクティビティ"]),
  P("gozo-1", "gozo", "英語とダイビング", "一般英語", 4, 180000, "ホームステイ（朝夕食付き）", 150000, 40000, ["週末アクティビティ"]),
  P("gozo-2", "gozo", "一般英語", "一般英語", 8, 330000, "ホームステイ（朝夕食付き）", 290000, 40000, ["現地ボランティア"]),
  P("valletta-u-1", "valletta-u", "1学期だけ留学（地中海学）", "1学期だけ留学", 16, 700000, "学生寮（相部屋）", 500000, 80000, ["週末アクティビティ"], "IELTS 5.5以上"),
  P("valletta-u-2", "valletta-u", "学部正規入学（国際関係）", "学部正規入学", 52, 1500000, "学生寮（相部屋）", 1400000, 100000, ["インターン紹介"], "IELTS 6.0以上・高校の成績証明書"),
];

const REVIEWS = {
  cebu: [
    { rating: 5, body: "マンツーマンで話す量が圧倒的。最初の1週間で英語への怖さが消えました。", author: "大学2年・4週間" },
    { rating: 4, body: "寮のご飯は日本人向けの味付けで助かった。Wi-Fiは夜に遅くなることも。", author: "大学3年・12週間" },
  ],
  baguio: [
    { rating: 5, body: "平日は外に出られないぶん、勉強しかすることがない。伸びたのは間違いない。", author: "大学3年・12週間" },
    { rating: 4, body: "涼しくて過ごしやすい。週末の山歩きが気分転換になった。", author: "大学1年・4週間" },
  ],
  clark: [
    { rating: 4, body: "ネイティブの先生の授業があるのが決め手。街もきれいで安心だった。", author: "社会人2年目・8週間" },
    { rating: 4, body: "寮がホテルみたいで快適。シャトルバスの時間だけは要確認。", author: "大学4年・4週間" },
  ],
  "manila-u": [
    { rating: 4, body: "授業は全部英語で最初は大変。でも学費を考えるとコスパはすごく良い。", author: "大学2年・1学期" },
    { rating: 4, body: "アジアの友達がたくさんできた。課題の量は日本の大学の倍くらい。", author: "大学3年・1学期" },
  ],
  sydney: [
    { rating: 4, body: "クラスに日本人が少なく、英語を使うしかない環境だった。", author: "大学3年・12週間" },
    { rating: 5, body: "ホストファミリーが本当に優しくて、週末はビーチに連れて行ってくれた。", author: "大学2年・8週間" },
  ],
  melbourne: [
    { rating: 5, body: "少人数で先生がよく見てくれる。放課後のカフェ巡りが日課でした。", author: "大学3年・4週間" },
    { rating: 4, body: "天気が1日の中でころころ変わるので、羽織るものは必須。", author: "大学2年・12週間" },
  ],
  goldcoast: [
    { rating: 5, body: "午前は授業、午後はサーフィン。こんな生活は一生できないと思う。", author: "大学1年・4週間" },
    { rating: 4, body: "楽しいぶん、自分で勉強時間を作らないと流されがち。", author: "大学4年・24週間" },
  ],
  "brisbane-u": [
    { rating: 5, body: "留学生向けのサポートが手厚くて、最初の不安がすぐ消えた。", author: "大学3年・1学期" },
    { rating: 4, body: "インターンの紹介で現地のホテルで働けたのが一番の経験。", author: "大学2年・1学期" },
  ],
  vancouver: [
    { rating: 5, body: "放課後のイベントが多くて、友達作りに困らなかった。", author: "大学3年・8週間" },
    { rating: 5, body: "発音クラスがよかった。先生の説明がとにかくわかりやすい。", author: "大学1年・4週間" },
  ],
  toronto: [
    { rating: 4, body: "本当にいろんな国の人がいて、日本人とほとんど会わなかった。", author: "大学4年・12週間" },
    { rating: 4, body: "冬は寒いけど、地下街が便利で意外と困らない。", author: "社会人1年目・8週間" },
  ],
  victoria: [
    { rating: 5, body: "街が小さくて落ち着いていて、勉強に集中できた。", author: "大学2年・12週間" },
    { rating: 4, body: "先生とクラスメイトの距離が近く、家族みたいな雰囲気。", author: "大学1年・4週間" },
  ],
  "vancouver-u": [
    { rating: 5, body: "キャンパスから海と山が見える。図書館の環境が最高。", author: "大学3年・1学期" },
    { rating: 4, body: "授業の議論についていくのは大変。事前にIELTSで準備しておいてよかった。", author: "大学2年・1学期" },
  ],
  malta: [
    { rating: 4, body: "ヨーロッパの学生ばかりで、世界が一気に広がった。", author: "大学2年・4週間" },
    { rating: 4, body: "週末にイタリアへ格安で行けたのが一番の思い出。", author: "大学4年・8週間" },
  ],
  sliema: [
    { rating: 5, body: "港の景色を見ながら通学できる。カフェも多くて楽しい。", author: "大学3年・4週間" },
    { rating: 4, body: "年上のクラスメイトが多くて、いろんな働き方の話が聞けた。", author: "社会人3年目・12週間" },
  ],
  gozo: [
    { rating: 5, body: "静かな島で、先生がみんなの名前を覚えてくれている。", author: "大学2年・8週間" },
    { rating: 5, body: "ダイビングのライセンスまで取れた。海の透明度がすごい。", author: "大学1年・4週間" },
  ],
  "valletta-u": [
    { rating: 4, body: "街全体が世界遺産。歴史の授業を現地で受けられるのは特別。", author: "大学3年・1学期" },
    { rating: 4, body: "EUの学生との議論は刺激的。寮は古めだけど住めば都。", author: "大学2年・1学期" },
  ],
};

const ALL_PLANS = PLANS.map((p) => {
  const school = SCHOOLS.find((s) => s.id === p.schoolId);
  const flight = COUNTRY[school.country].flight;
  const total = p.tuition + p.stay + p.fees + flight;
  const hay = [school.name, school.city, school.alias, school.country, COUNTRY[school.country].alias, p.course, p.type, school.format, school.tags.join(" "), p.stayType]
    .join(" ").toLowerCase();
  return { ...p, school, flight, total, hay };
});

const OPTIONS = {
  語学留学: {
    weeks: [4, 8, 12, 24],
    types: ["一般英語", "マンツーマン", "試験対策", "ビジネス英語", "ワーホリ準備"],
    budget: { min: 300000, max: 2000000, step: 50000, chips: [500000, 800000, 1000000] },
    presets: [
      { label: "はじめての短期（4週間・50万円以内）", f: { weeks: [4], maxTotal: 500000 } },
      { label: "とにかく話す量を増やしたい", f: { types: ["マンツーマン"] } },
      { label: "日本人が少ない環境で学びたい", f: { tags: ["日本人少なめ"] } },
      { label: "ワーホリの準備をしたい", f: { types: ["ワーホリ準備"] } },
      { label: "海の近くで過ごしたい", f: { tags: ["海が近い"] } },
    ],
  },
  大学留学: {
    weeks: [16, 52],
    types: ["1学期だけ留学", "学部正規入学"],
    budget: { min: 1000000, max: 7000000, step: 250000, chips: [2000000, 3000000, 5000000] },
    presets: [
      { label: "まずは1学期だけ通ってみたい", f: { types: ["1学期だけ留学"] } },
      { label: "海外の大学で学位をとりたい", f: { types: ["学部正規入学"] } },
      { label: "学費を抑えて大学へ（総額300万円以内）", f: { maxTotal: 3000000 } },
      { label: "日本人が少ない大学で学びたい", f: { tags: ["日本人少なめ"] } },
    ],
  },
};
const ACTIVITY_OPTIONS = ["週末アクティビティ", "現地ボランティア", "インターン紹介"];
const TAG_OPTIONS = ["日本人少なめ", "海が近い", "自然が近い", "都会"];

const STEPS = [
  { title: "行き先を探す", expert: false, time: "5分", needs: "行ってみたい国のイメージだけ" },
  { title: "学校を比べる", expert: false, time: "10分", needs: "気になる学校を2〜3校" },
  { title: "総額を確かめる", expert: false, time: "3分", needs: "なし（航空券の目安まで込みで出ます）" },
  { title: "申し込む", expert: false, time: "3分", needs: "名前・メール・相談したい日時" },
  { title: "契約・書類を書く", expert: true, time: "約60分", needs: "パスポート" },
  { title: "ビザを申請する", expert: true, time: "約60分＋審査期間", needs: "パスポート・証明写真・残高証明" },
  { title: "入金して渡航準備", expert: false, time: "1〜2週間", needs: "学費の入金・航空券の手配" },
  { title: "出発", expert: false, time: "当日", needs: "パスポートとスーツケース" },
];

/* ============================================================
   保存（localStorage に保存。本番では repository.ts → Supabase に差し替える想定）
   ============================================================ */

const STORE_KEY = "ryugaku-ota-state-v2";
const INITIAL = { reached: 0, compare: [], favorites: [], checklist: {}, application: null, events: {} };

async function loadState() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
async function saveState(state) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("保存に失敗しました", e);
  }
}

/* ============================================================
   ユーティリティ
   ============================================================ */

const pad = (n) => String(n).padStart(2, "0");
const WD = ["日", "月", "火", "水", "木", "金", "土"];
function hash(s) {
  let h = 7;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
function yen(n) {
  return n.toLocaleString("ja-JP") + "円";
}
function man(n) {
  return (Math.round(n / 1000) / 10).toString() + "万円";
}
function weekLabel(w) {
  if (w === 16) return "1学期（約16週）";
  if (w === 52) return "1年";
  return `${w}週間`;
}
function toggle(list, v) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}
function visaFor(plan) {
  const c = COUNTRY[plan.school.country];
  return plan.weeks <= c.limitWeeks ? c.visaShort : c.visaLong;
}
function emptyFilters(format) {
  return { format, q: "", maxTotal: null, countries: [], weeks: [], types: [], acts: [], tags: [], minRating: 0 };
}
function parseQuery(q) {
  const tokens = q.trim().toLowerCase().split(/[\s　]+/).filter(Boolean);
  const words = [], weeks = [];
  let budget = null;
  for (const t of tokens) {
    let m;
    if ((m = t.match(/^(\d+)\s*週/))) weeks.push(Number(m[1]));
    else if ((m = t.match(/^(\d+(?:\.\d+)?)\s*万/))) budget = Number(m[1]) * 10000;
    else if (/^1?年/.test(t)) weeks.push(52);
    else words.push(t);
  }
  return { words, weeks, budget };
}
function filterPlans(f) {
  const { words, weeks: qWeeks, budget } = parseQuery(f.q);
  const cap = Math.min(f.maxTotal ?? Infinity, budget ?? Infinity);
  const weeks = [...f.weeks, ...qWeeks];
  return ALL_PLANS.filter((p) => {
    if (p.school.format !== f.format) return false;
    if (!words.every((w) => p.hay.includes(w))) return false;
    if (p.total > cap) return false;
    if (weeks.length && !weeks.includes(p.weeks)) return false;
    if (f.countries.length && !f.countries.includes(p.school.country)) return false;
    if (f.types.length && !f.types.includes(p.type)) return false;
    if (f.acts.length && !f.acts.every((a) => p.activities.includes(a))) return false;
    if (f.tags.length && !f.tags.every((t) => p.school.tags.includes(t))) return false;
    if (p.school.rating < f.minRating) return false;
    return true;
  });
}
function getSuggestions(format, q) {
  const t = q.trim().toLowerCase();
  const schools = SCHOOLS.filter((s) => s.format === format);
  if (!t) {
    return [
      { group: "おすすめの探し方", items: OPTIONS[format].presets.map((p) => ({ kind: "preset", label: p.label, value: p.f, icon: "spark" })) },
      {
        group: "国から探す",
        items: COUNTRIES.map((c) => ({ kind: "country", label: c, value: c, sub: `${schools.filter((s) => s.country === c).length}校`, icon: "pin" })),
      },
    ];
  }
  const groups = [];
  const { weeks, budget, words } = parseQuery(q);
  const hint = [weeks.length ? `期間 ${weeks.map(weekLabel).join("・")}` : null, budget ? `総額 ${man(budget)}以内` : null].filter(Boolean).join("、");
  groups.push({ group: "キーワード", items: [{ kind: "free", label: `「${q.trim()}」で探す`, value: q.trim(), sub: hint, icon: "search" }] });
  if (words.length) {
    const w = words[0];
    const countries = COUNTRIES.filter((c) => c.includes(w) || COUNTRY[c].alias.includes(w));
    const cities = [...new Set(schools.filter((s) => s.city.includes(w) || s.alias.includes(w)).map((s) => s.city))];
    const names = schools.filter((s) => s.name.toLowerCase().includes(w));
    const types = OPTIONS[format].types.filter((x) => x.includes(w));
    const tags = TAG_OPTIONS.filter((x) => x.includes(w));
    if (countries.length) groups.push({ group: "国", items: countries.map((c) => ({ kind: "country", label: c, value: c, icon: "pin" })) });
    if (cities.length) groups.push({ group: "都市", items: cities.map((c) => ({ kind: "city", label: c, value: c, icon: "pin" })) });
    if (names.length) groups.push({ group: "学校", items: names.slice(0, 4).map((s) => ({ kind: "school", label: s.name, value: s.id, sub: s.city, icon: "school" })) });
    if (types.length) groups.push({ group: "コース", items: types.map((x) => ({ kind: "type", label: x, value: x, icon: "spark" })) });
    if (tags.length) groups.push({ group: "環境", items: tags.map((x) => ({ kind: "tag", label: x, value: x, icon: "spark" })) });
  }
  return groups;
}

const C = { ink: "#152238", blue: "#1E56C8", green: "#17A673", ocean: "#E8F0FB", land: "#CBD8EA", heart: "#F0567A", sun: "#FFD45C", sunBg: "#FFF6D9" };

/* ============================================================
   アプリ本体
   ============================================================ */

export default function App() {
  const [st, setSt] = useState(INITIAL);
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState({ name: "home" });
  const [hist, setHist] = useState([]);
  const [filters, setFilters] = useState(emptyFilters("語学留学"));
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [highlight, setHighlight] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [chat, setChat] = useState(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [pulse, setPulse] = useState(0);
  const prevReached = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const s = await loadState();
      if (s) {
        const valid = new Set(PLANS.map((p) => p.id));
        setSt({ ...INITIAL, ...s, compare: (s.compare || []).filter((id) => valid.has(id)) });
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) saveState(st);
  }, [st, ready]);

  useEffect(() => {
    if (!ready) return;
    if (prevReached.current === null) {
      prevReached.current = st.reached;
      return;
    }
    if (st.reached > prevReached.current) {
      showToast(`「${STEPS[st.reached - 1].title}」が完了。渡航まであと${STEPS.length - st.reached}ステップ`);
      setPulse((k) => k + 1);
    }
    prevReached.current = st.reached;
  }, [st.reached, ready]);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }
  const track = (name) => setSt((s) => ({ ...s, events: { ...s.events, [name]: (s.events[name] || 0) + 1 } }));
  const advance = (n) => setSt((s) => (n > s.reached ? { ...s, reached: n } : s));

  function go(r) {
    setHist((h) => [...h, route]);
    setRoute(r);
    window.scrollTo(0, 0);
  }
  function back() {
    setHist((h) => {
      if (!h.length) return h;
      setRoute(h[h.length - 1]);
      return h.slice(0, -1);
    });
    window.scrollTo(0, 0);
  }
  function openJourney(hl = null) {
    setHighlight(hl);
    setJourneyOpen(true);
    track("ステップ一覧を開いた");
  }
  function toggleCompare(planId) {
    setSt((s) => {
      if (s.compare.includes(planId)) return { ...s, compare: s.compare.filter((x) => x !== planId) };
      if (s.compare.length >= 3) {
        showToast("比較できるのは3つまでです。どれかを外してください");
        return s;
      }
      return { ...s, compare: [...s.compare, planId] };
    });
  }
  function toggleFavorite(planId) {
    setSt((s) => {
      const on = s.favorites.includes(planId);
      if (!on) track("お気に入りに追加した");
      return { ...s, favorites: on ? s.favorites.filter((x) => x !== planId) : [...s.favorites, planId] };
    });
  }
  function toggleCheck(key) {
    setSt((s) => ({ ...s, checklist: { ...s.checklist, [key]: !s.checklist[key] } }));
  }
  function tab(name) {
    setHist([]);
    setRoute({ name });
    window.scrollTo(0, 0);
  }
  function finishQuiz(f) {
    setQuizOpen(false);
    track("行き先診断を使った");
    setFilters(f);
    showToast(`診断の結果、${filterPlans(f).length}件のプランが見つかりました`);
    if (route.name !== "search") go({ name: "search" });
  }
  function setFormat(fmt) {
    setFilters(emptyFilters(fmt));
  }
  function applySuggestion(item) {
    const base = emptyFilters(filters.format);
    if (item.kind === "school") {
      track("検索候補を選んだ");
      go({ name: "school", schoolId: item.value });
      return;
    }
    if (item.kind === "preset") track("おすすめ条件を使った");
    else track("検索候補を選んだ");
    if (item.kind === "country") setFilters({ ...base, countries: [item.value] });
    if (item.kind === "city" || item.kind === "free") setFilters({ ...base, q: item.value });
    if (item.kind === "type") setFilters({ ...base, types: [item.value] });
    if (item.kind === "tag") setFilters({ ...base, tags: [item.value] });
    if (item.kind === "preset") setFilters({ ...base, ...item.value });
    if (route.name !== "search") go({ name: "search" });
  }

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-slate-500">読み込み中…</div>;

  const page = (() => {
    switch (route.name) {
      case "search":
        return (
          <SearchPage filters={filters} setFilters={setFilters} setFormat={setFormat} compare={st.compare} toggleCompare={toggleCompare}
            favorites={st.favorites} toggleFavorite={toggleFavorite}
            onOpenFilter={() => setFilterOpen(true)} go={go} advance={advance} track={track} applySuggestion={applySuggestion} />
        );
      case "compare":
        return <ComparePage compare={st.compare} toggleCompare={toggleCompare} go={go} advance={advance} track={track} tab={tab} />;
      case "school":
        return (
          <SchoolPage key={route.schoolId} schoolId={route.schoolId} initialPlanId={route.planId} go={go} advance={advance}
            onChat={(planId) => setChat({ schoolId: route.schoolId, planId })} favorites={st.favorites} toggleFavorite={toggleFavorite} />
        );
      case "apply":
        return (
          <ApplyPage planId={route.planId} onSubmit={(app) => {
            setSt((s) => ({ ...s, application: app }));
            track("申し込みを送信した");
            advance(4);
            go({ name: "done" });
          }} />
        );
      case "done":
        return <DonePage application={st.application} reached={st.reached} openJourney={openJourney} go={go} />;
      case "favorites":
        return <FavoritesPage favorites={st.favorites} toggleFavorite={toggleFavorite} compare={st.compare} toggleCompare={toggleCompare} go={go} tab={tab} />;
      case "mypage":
        return <MyPage st={st} openJourney={openJourney} toggleCheck={toggleCheck} go={go} tab={tab} />;
      case "debug":
        return <DebugPage st={st} onReset={() => { setSt(INITIAL); prevReached.current = 0; showToast("記録をリセットしました"); }} />;
      default:
        return <HomePage filters={filters} setFormat={setFormat} go={go} applySuggestion={applySuggestion} onOpenFilter={() => setFilterOpen(true)} onQuiz={() => setQuizOpen(true)} />;
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50" style={{ color: C.ink, fontFamily: "'M PLUS Rounded 1c', 'Noto Sans JP', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800;900&display=swap');
        @keyframes pop { 0% { transform: scale(.5) } 60% { transform: scale(1.3) } 100% { transform: scale(1) } }
        @keyframes rise { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }
        .pop { animation: pop .6s ease-out }
        .rise { animation: rise .25s ease-out }
        .noscroll::-webkit-scrollbar { display: none }
        @media (prefers-reduced-motion: reduce) { .pop, .rise { animation: none } }
        button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid ${C.blue}; outline-offset: 2px }
      `}</style>

      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center h-11">
            {hist.length > 0 ? (
              <button onClick={back} className="flex items-center gap-1 -ml-2 px-2 h-11 text-sm text-slate-600" aria-label="戻る">
                <ChevronLeft size={18} />戻る
              </button>
            ) : (
              <span className="text-sm font-black tracking-wide">留学OTA</span>
            )}
          </div>
          <JourneyBar reached={st.reached} pulse={pulse} onOpen={() => openJourney()} />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-48">{page}</main>

      {["home", "search", "compare", "favorites", "mypage", "done", "debug"].includes(route.name) && (
        <TabBar current={route.name === "done" ? "mypage" : route.name} onTab={tab} favCount={st.favorites.length} compareCount={st.compare.length} />
      )}
      <QuizSheet open={quizOpen} onClose={() => setQuizOpen(false)} format={filters.format} onFinish={finishQuiz} />

      <JourneySheet open={journeyOpen} onClose={() => setJourneyOpen(false)} reached={st.reached} highlight={highlight} />
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} setFilters={setFilters}
        onApply={() => { setFilterOpen(false); if (route.name !== "search") go({ name: "search" }); }} />
      {chat && <ChatSheet chat={chat} onClose={() => setChat(null)} track={track} onStep={(i) => { setChat(null); openJourney(i); }} />}
      {toast && (
        <div className="fixed left-0 right-0 top-32 z-50 flex justify-center px-4 pointer-events-none">
          <div className="rise bg-slate-900 text-white text-sm rounded-xl px-4 py-3 shadow-lg max-w-sm">{toast}</div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   渡航までのステップ表示
   ============================================================ */

function JourneyBar({ reached, pulse, onOpen }) {
  const remaining = STEPS.length - reached;
  const current = Math.min(reached, STEPS.length - 1);
  return (
    <button onClick={onOpen} className="w-full text-left pb-3 pt-1" aria-label={`渡航まであと${remaining}ステップ。タップで全ステップを表示`}>
      <div className="flex items-end gap-4">
        <div className="shrink-0 leading-none">
          <div className="text-xs text-slate-500 mb-1">渡航まで</div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold">あと</span>
            <span key={pulse} className="pop inline-block text-3xl font-black" style={{ color: C.blue }}>{remaining}</span>
            <span className="text-sm font-bold">ステップ</span>
          </div>
        </div>
        <div className="flex-1 min-w-0 pb-1">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <Fragment key={i}>
                {i > 0 && <div className="h-0.5 flex-1" style={{ background: i <= reached ? C.green : "#D7DEE8" }} />}
                {i < reached ? (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: C.green }}><Check size={10} strokeWidth={3} /></div>
                ) : i === reached ? (
                  <div key={pulse} className="pop w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 ring-4 ring-blue-100" style={{ background: C.blue }}><Plane size={14} /></div>
                ) : (
                  <div className="w-3 h-3 rounded-full border-2 border-slate-300 bg-white shrink-0" />
                )}
              </Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span className="truncate">いま：<span className="font-bold text-slate-700">{STEPS[current].title}</span></span>
            <span className="shrink-0 underline">全部見る</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function JourneySheet({ open, onClose, reached, highlight }) {
  const refs = useRef([]);
  useEffect(() => {
    if (open && highlight !== null && refs.current[highlight]) refs.current[highlight].scrollIntoView({ block: "center" });
  }, [open, highlight]);
  const expertCount = STEPS.filter((s) => s.expert).length;
  return (
    <Sheet open={open} onClose={onClose} title="渡航までの全ステップ">
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        全部で{STEPS.length}ステップです。そのうち契約とビザの{expertCount}つは、専門家がオンラインで一緒に進めます。
      </p>
      <ol className="space-y-2">
        {STEPS.map((s, i) => {
          const done = i < reached;
          const now = i === reached;
          return (
            <li key={i} ref={(el) => (refs.current[i] = el)}
              className={`rounded-xl border p-3 flex gap-3 ${highlight === i ? "border-blue-400 bg-blue-50" : now ? "border-blue-200 bg-white" : "border-slate-200 bg-white"}`}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={done ? { background: C.green, color: "white" } : now ? { background: C.blue, color: "white" } : { background: "#EEF2F7", color: "#64748B" }}>
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-bold ${done ? "text-slate-400 line-through" : ""}`}>{s.title}</span>
                  {now && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">いまここ</span>}
                </div>
                <div className="mt-1 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1">{s.expert ? <Users size={13} /> : <User size={13} />}{s.expert ? "専門家と一緒に（オンライン）" : "あなたがやること"}</div>
                  <div className="flex items-center gap-1"><Clock size={13} />目安 {s.time}</div>
                  <div className="flex items-center gap-1"><FileText size={13} />必要なもの：{s.needs}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Sheet>
  );
}

/* ============================================================
   留学形式の切り替え
   ============================================================ */

function FormatSwitch({ value, onChange, size = "lg" }) {
  const info = {
    語学留学: { icon: <Languages size={18} />, sub: "4週間から・英語を学ぶ" },
    大学留学: { icon: <GraduationCap size={18} />, sub: "1学期から・専門を英語で学ぶ" },
  };
  return (
    <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="留学の形式">
      {FORMATS.map((f) => {
        const on = value === f;
        return (
          <button key={f} role="tab" aria-selected={on} onClick={() => onChange(f)}
            className={`rounded-xl border text-left px-3 ${size === "lg" ? "py-3" : "py-2"} ${on ? "border-transparent text-white" : "bg-white border-slate-300"}`}
            style={on ? { background: C.ink } : {}}>
            <div className="flex items-center gap-2 font-bold">{info[f].icon}{f}</div>
            {size === "lg" && <div className={`text-xs mt-1 ${on ? "text-slate-300" : "text-slate-500"}`}>{info[f].sub}</div>}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   検索ボックス（候補・おすすめ条件つき）
   ============================================================ */

function SearchBox({ format, value, onChange, onPick, onOpenFilter, filterCount = 0 }) {
  const [open, setOpen] = useState(false);
  const groups = useMemo(() => getSuggestions(format, value), [format, value]);
  const icons = { spark: <Sparkles size={16} />, pin: <MapPin size={16} />, school: <Building2 size={16} />, search: <Search size={16} /> };
  function pick(item) {
    setOpen(false);
    onPick(item);
  }
  return (
    <div className="relative">
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (value.trim()) pick({ kind: "free", value: value.trim() }); }}>
        <label className="flex-1 flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 h-12">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input value={value} onChange={(e) => { onChange(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder={format === "語学留学" ? "例：セブ 4週 50万" : "例：カナダ 1学期"}
            className="flex-1 min-w-0 bg-transparent outline-none text-base" enterKeyHint="search" aria-label="国・都市・学校・コースで探す" />
          {value && (
            <button type="button" onClick={() => onChange("")} className="w-8 h-8 flex items-center justify-center text-slate-400" aria-label="入力を消す"><X size={16} /></button>
          )}
        </label>
        <button type="button" onClick={onOpenFilter} className="relative w-12 h-12 rounded-xl border border-slate-300 bg-white flex items-center justify-center shrink-0" aria-label="条件で絞り込む">
          <SlidersHorizontal size={18} />
          {filterCount > 0 && <span className="absolute -top-1 -right-1 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center" style={{ background: C.blue }}>{filterCount}</span>}
        </button>
      </form>
      {open && groups.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-white border border-slate-100 shadow-sm rounded-3xl shadow-lg overflow-y-auto" style={{ maxHeight: 360 }}
          onMouseDown={(e) => e.preventDefault()}>
          {groups.map((g) => (
            <div key={g.group} className="py-2">
              <div className="px-4 pb-1 text-xs font-bold text-slate-500">{g.group}</div>
              {g.items.map((it, i) => (
                <button key={i} onClick={() => pick(it)} className="w-full min-h-11 px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-50">
                  <span className="text-slate-400 shrink-0">{icons[it.icon]}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm">{it.label}</span>
                    {it.sub && <span className="block text-xs text-slate-500">{it.sub}</span>}
                  </span>
                </button>
              ))}
            </div>
          ))}
          <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-100">「4週」「50万」のように書くと、期間や予算として探します</div>
        </div>
      )}
    </div>
  );
}

function countActive(f) {
  return f.countries.length + f.weeks.length + f.types.length + f.acts.length + f.tags.length + (f.maxTotal ? 1 : 0) + (f.minRating > 0 ? 1 : 0);
}

/* ============================================================
   画面：ホーム
   ============================================================ */

function HomePage({ filters, setFormat, go, applySuggestion, onOpenFilter, onQuiz }) {
  const [q, setQ] = useState("");
  const format = filters.format;
  const stats = useMemo(() => {
    const m = {};
    COUNTRIES.forEach((c) => {
      const plans = ALL_PLANS.filter((p) => p.school.country === c && p.school.format === format);
      m[c] = { min: Math.min(...plans.map((p) => p.total)), schools: new Set(plans.map((p) => p.schoolId)).size, cities: [...new Set(plans.map((p) => p.school.city))] };
    });
    return m;
  }, [format]);
  const pickCountry = (c) => applySuggestion({ kind: "country", value: c });

  return (
    <div className="pt-6">
      <h1 className="text-2xl font-black leading-snug">どこで学んでみたい？ ✈️</h1>
      <p className="text-sm text-slate-600 mt-2 leading-relaxed">学費・滞在費・航空券まで込みの総額で、世界の学校をくらべられます。</p>

      <button onClick={onQuiz} className="mt-5 w-full text-left rounded-3xl p-4 flex items-center gap-3 border-2" style={{ background: C.sunBg, borderColor: C.sun }}>
        <span className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shrink-0" aria-hidden="true">🧭</span>
        <span className="flex-1 min-w-0">
          <span className="block font-black">30秒で行き先診断</span>
          <span className="block text-sm text-slate-600 mt-0.5">3つの質問に答えるだけで、合いそうなプランを出します</span>
        </span>
        <ChevronRight size={20} className="shrink-0 text-slate-500" />
      </button>

      <div className="mt-5"><FormatSwitch value={format} onChange={(f) => { setFormat(f); setQ(""); }} /></div>
      <div className="mt-3"><SearchBox format={format} value={q} onChange={setQ} onPick={applySuggestion} onOpenFilter={onOpenFilter} /></div>

      <div className="mt-5">
        <div className="text-sm font-bold mb-2">こんな探し方はどう？</div>
        <div className="flex gap-2 overflow-x-auto noscroll -mx-4 px-4">
          {OPTIONS[format].presets.map((p) => (
            <button key={p.label} onClick={() => applySuggestion({ kind: "preset", value: p.f })}
              className="shrink-0 h-11 px-4 rounded-full bg-white border border-slate-300 text-sm inline-flex items-center gap-1">
              <Sparkles size={14} style={{ color: C.blue }} />{p.label}
            </button>
          ))}
        </div>
      </div>

      <WorldMap stats={stats} onPick={pickCountry} />

      <div className="mt-6">
        <div className="text-sm font-bold mb-2">国から探す</div>
        <div className="grid grid-cols-2 gap-2">
          {COUNTRIES.map((c) => (
            <button key={c} onClick={() => pickCountry(c)} className="text-left bg-white border border-slate-200 rounded-xl p-3">
              <div className="flex items-baseline justify-between">
                <span className="font-bold">{COUNTRY[c].flag} {c}</span>
                <span className="text-xs text-slate-500">{stats[c].schools}校</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 truncate">{stats[c].cities.join("、")}</div>
              <div className="text-sm mt-1">総額 {man(stats[c].min)}〜</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

const LAND = [
  [[-168, 65], [-140, 70], [-95, 72], [-75, 62], [-55, 50], [-70, 42], [-80, 30], [-82, 25], [-97, 18], [-88, 15], [-80, 8], [-105, 20], [-117, 32], [-125, 42], [-130, 55], [-150, 60]],
  [[-80, 8], [-60, 10], [-50, 0], [-35, -7], [-40, -22], [-55, -35], [-68, -55], [-75, -45], [-72, -20], [-80, -5]],
  [[-10, 36], [-9, 44], [-2, 48], [-5, 58], [5, 62], [15, 70], [40, 68], [70, 73], [100, 77], [140, 72], [170, 68], [160, 58], [140, 52], [135, 40], [122, 30], [110, 20], [105, 10], [100, 2], [98, 15], [90, 22], [78, 8], [72, 20], [60, 25], [50, 30], [35, 30], [28, 41], [20, 38], [12, 38], [3, 42]],
  [[-17, 15], [-10, 30], [10, 37], [33, 31], [43, 12], [51, 11], [40, -5], [40, -15], [32, -28], [20, -35], [12, -18], [9, -2], [5, 5], [-8, 5]],
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -28], [150, -37], [140, -38], [132, -32], [115, -34]],
  [[130, 31], [136, 34], [140, 35], [142, 40], [141, 45], [144, 43], [140, 38], [136, 36], [131, 34]],
  [[-5, 50], [1, 51], [0, 53], [-3, 58], [-6, 56]],
  [[120, 18], [122, 14], [126, 8], [125, 6], [122, 10], [119, 14]],
];
const VB = { x: 20, w: 330, h: 135 };
const px = (lon) => lon + 180;
const py = (lat) => 80 - lat;
const pct = (lon, lat) => ({ left: `${((px(lon) - VB.x) / VB.w) * 100}%`, top: `${(py(lat) / VB.h) * 100}%` });

function WorldMap({ stats, onPick }) {
  const tokyo = { lon: 139.7, lat: 35.7 };
  return (
    <div className="relative mt-6 rounded-2xl overflow-hidden border border-slate-200" style={{ background: C.ocean }}>
      <svg viewBox={`${VB.x} 0 ${VB.w} ${VB.h}`} className="w-full block" role="img" aria-label="提携校のある国の地図">
        {LAND.map((poly, i) => <path key={i} d={"M" + poly.map(([lo, la]) => `${px(lo)},${py(la)}`).join("L") + "Z"} fill={C.land} />)}
        {COUNTRIES.map((c) => {
          const { lon, lat } = COUNTRY[c];
          const x1 = px(tokyo.lon), y1 = py(tokyo.lat), x2 = px(lon), y2 = py(lat);
          return <path key={c} d={`M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 18} ${x2},${y2}`} fill="none" stroke={C.blue} strokeWidth="0.6" strokeDasharray="2 2" opacity="0.6" />;
        })}
        <circle cx={px(tokyo.lon)} cy={py(tokyo.lat)} r="1.8" fill={C.ink} />
      </svg>
      <div className="absolute text-xs font-bold" style={{ ...pct(tokyo.lon, tokyo.lat), transform: "translate(-50%, -150%)" }}>東京</div>
      {COUNTRIES.map((c) => {
        const p = pct(COUNTRY[c].lon, COUNTRY[c].lat);
        const right = parseFloat(p.left) > 70;
        return (
          <button key={c} onClick={() => onPick(c)} className="absolute flex items-center gap-1"
            style={{ ...p, transform: right ? "translate(-100%, -50%)" : "translate(-6px, -50%)", flexDirection: right ? "row-reverse" : "row" }} aria-label={`${c}で探す`}>
            <span className="w-3 h-3 rounded-full border-2 border-white shrink-0" style={{ background: C.blue }} />
            <span className="bg-white rounded-lg px-2 py-1 text-xs shadow-sm whitespace-nowrap"><span className="font-bold">{COUNTRY[c].flag} {c}</span> {man(stats[c].min)}〜</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   画面：検索結果
   ============================================================ */

function SearchPage({ filters, setFilters, setFormat, compare, toggleCompare, favorites, toggleFavorite, onOpenFilter, go, advance, track, applySuggestion }) {
  const [sort, setSort] = useState("total");
  useEffect(() => { advance(1); track("検索結果を見た"); }, []);
  const results = useMemo(() => {
    const r = filterPlans(filters);
    if (sort === "total") r.sort((a, b) => a.total - b.total);
    if (sort === "rating") r.sort((a, b) => b.school.rating - a.school.rating);
    if (sort === "weeks") r.sort((a, b) => a.weeks - b.weeks);
    return r;
  }, [filters, sort]);
  const parsed = parseQuery(filters.q);
  const opt = OPTIONS[filters.format];

  return (
    <div className="pt-4">
      <FormatSwitch value={filters.format} onChange={setFormat} size="sm" />
      <div className="mt-3">
        <SearchBox format={filters.format} value={filters.q} onChange={(q) => setFilters({ ...filters, q })}
          onPick={applySuggestion} onOpenFilter={onOpenFilter} filterCount={countActive(filters)} />
      </div>
      {(parsed.weeks.length > 0 || parsed.budget) && (
        <p className="text-xs text-slate-500 mt-2">
          {[parsed.weeks.length ? `期間は${parsed.weeks.map(weekLabel).join("・")}` : null, parsed.budget ? `総額は${man(parsed.budget)}以内` : null].filter(Boolean).join("、")}として探しています
        </p>
      )}
      <ActiveChips filters={filters} setFilters={setFilters} />

      <div className="flex items-center justify-between mt-3">
        <div className="text-sm"><span className="font-bold">{results.length}件</span>のプラン</div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 text-sm bg-transparent">
          <option value="total">総額が安い順</option>
          <option value="rating">口コミ評価が高い順</option>
          <option value="weeks">期間が短い順</option>
        </select>
      </div>

      <NextSuggestion filters={filters} setFilters={setFilters} count={results.length} opt={opt} track={track} />

      {results.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          {results.map((p) => (
            <PlanCard key={p.id} plan={p} inCompare={compare.includes(p.id)} onToggle={() => toggleCompare(p.id)}
              fav={favorites.includes(p.id)} onFav={() => toggleFavorite(p.id)}
              onOpen={() => go({ name: "school", schoolId: p.schoolId, planId: p.id })} />
          ))}
        </div>
      )}

      {compare.length > 0 && (
        <div className="fixed left-0 right-0 z-40 bg-white border-t border-slate-200" style={{ bottom: 64 }}>
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex-1 text-sm">比較リスト <span className="font-bold">{compare.length}</span>/3</div>
            <button onClick={() => go({ name: "compare" })} disabled={compare.length < 2}
              className="h-12 px-5 rounded-xl text-white font-bold disabled:opacity-40" style={{ background: C.blue }}>
              {compare.length < 2 ? "あと1つ選ぶと比較できます" : "比較する"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveChips({ filters: f, setFilters }) {
  const chips = [
    ...f.countries.map((v) => ({ label: v, remove: () => setFilters({ ...f, countries: f.countries.filter((x) => x !== v) }) })),
    ...f.weeks.map((v) => ({ label: weekLabel(v), remove: () => setFilters({ ...f, weeks: f.weeks.filter((x) => x !== v) }) })),
    ...f.types.map((v) => ({ label: v, remove: () => setFilters({ ...f, types: f.types.filter((x) => x !== v) }) })),
    ...f.tags.map((v) => ({ label: v, remove: () => setFilters({ ...f, tags: f.tags.filter((x) => x !== v) }) })),
    ...f.acts.map((v) => ({ label: v, remove: () => setFilters({ ...f, acts: f.acts.filter((x) => x !== v) }) })),
    ...(f.maxTotal ? [{ label: `総額${man(f.maxTotal)}以内`, remove: () => setFilters({ ...f, maxTotal: null }) }] : []),
    ...(f.minRating ? [{ label: `★${f.minRating}以上`, remove: () => setFilters({ ...f, minRating: 0 }) }] : []),
  ];
  if (!chips.length) return null;
  return (
    <div className="flex gap-2 overflow-x-auto noscroll mt-3 -mx-4 px-4">
      {chips.map((c) => (
        <button key={c.label} onClick={c.remove} className="shrink-0 h-9 pl-3 pr-2 rounded-full text-sm text-white inline-flex items-center gap-1" style={{ background: C.ink }} aria-label={`${c.label}の条件を外す`}>
          {c.label}<X size={14} />
        </button>
      ))}
    </div>
  );
}

function NextSuggestion({ filters: f, setFilters, count, opt, track }) {
  const use = (next) => { track("おすすめ条件を使った"); setFilters(next); };
  let title = null, chips = [];
  if (count === 0) {
    title = "この条件に合うプランはありません。条件を1つ外すと見つかります";
    if (f.maxTotal) chips.push({ label: "予算の上限を外す", next: { ...f, maxTotal: null } });
    if (f.weeks.length) chips.push({ label: "期間の条件を外す", next: { ...f, weeks: [] } });
    if (f.types.length) chips.push({ label: "コースの条件を外す", next: { ...f, types: [] } });
    if (f.tags.length) chips.push({ label: "環境の条件を外す", next: { ...f, tags: [] } });
    if (f.countries.length) chips.push({ label: "国の条件を外す", next: { ...f, countries: [] } });
    if (f.q) chips.push({ label: "キーワードを消す", next: { ...f, q: "" } });
    if (!chips.length) chips.push({ label: "条件をすべて外す", next: emptyFilters(f.format) });
  } else if (count > 3) {
    if (!f.weeks.length && !parseQuery(f.q).weeks.length) {
      title = "期間を決めると選びやすくなります";
      chips = opt.weeks.map((w) => ({ label: weekLabel(w), next: { ...f, weeks: [w] } }));
    } else if (!f.maxTotal && !parseQuery(f.q).budget) {
      title = "予算を決めると、さらに絞れます";
      chips = opt.budget.chips.map((b) => ({ label: `総額${man(b)}以内`, next: { ...f, maxTotal: b } }));
    } else if (!f.types.length) {
      title = "何を学びたいかで選ぶなら";
      chips = opt.types.map((t) => ({ label: t, next: { ...f, types: [t] } }));
    } else if (!f.tags.length) {
      title = "過ごし方で選ぶなら";
      chips = TAG_OPTIONS.map((t) => ({ label: t, next: { ...f, tags: [t] } }));
    }
  }
  if (!title) return null;
  return (
    <div className="mt-2 rounded-2xl p-3 border border-blue-100" style={{ background: "#F2F6FD" }}>
      <div className="flex items-center gap-2 text-sm font-bold"><Lightbulb size={16} style={{ color: C.blue }} />{title}</div>
      <div className="flex gap-2 overflow-x-auto noscroll mt-2">
        {chips.map((c) => (
          <button key={c.label} onClick={() => use(c.next)} className="shrink-0 h-10 px-4 rounded-full bg-white border border-blue-200 text-sm">{c.label}</button>
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan: p, inCompare, onToggle, onOpen, fav, onFav }) {
  return (
    <div className="relative bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
      {onFav && (
        <button onClick={onFav} className="absolute top-2 right-2 z-10 w-11 h-11 rounded-full bg-white shadow flex items-center justify-center"
          aria-label={fav ? "お気に入りから外す" : "お気に入りに追加"} aria-pressed={fav}>
          <Heart key={String(fav)} size={20} className={fav ? "pop" : ""} fill={fav ? C.heart : "none"} stroke={fav ? C.heart : "#64748B"} />
        </button>
      )}
      <button onClick={onOpen} className="w-full text-left">
        <div className="relative">
          <SchoolArt school={p.school} plan={p} kind="campus" />
          <span className="absolute top-2 left-2 text-xs bg-white bg-opacity-90 rounded px-1.5 py-0.5 text-slate-600">イメージ</span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs text-slate-500">{COUNTRY[p.school.country].flag} {p.school.country}　{p.school.city}</div>
              <div className="font-bold leading-snug mt-0.5">{p.school.name}</div>
            </div>
            <div className="flex items-center gap-1 text-sm shrink-0"><Star size={14} fill="#F5B301" stroke="#F5B301" />{p.school.rating}</div>
          </div>
          <div className="text-sm mt-2">{p.course}・{weekLabel(p.weeks)}</div>
          {p.requirement && <div className="text-xs text-slate-500 mt-1">出願条件：{p.requirement}</div>}
          <div className="mt-3">
            <div className="text-xs text-slate-500">総額の目安（航空券込み）</div>
            <div className="text-2xl font-black tracking-tight">{yen(p.total)}</div>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-2 text-xs text-slate-600">
            <div>学費<br /><span className="text-slate-800">{man(p.tuition)}</span></div>
            <div>滞在費<br /><span className="text-slate-800">{man(p.stay)}</span></div>
            <div>諸費用<br /><span className="text-slate-800">{man(p.fees)}</span></div>
            <div>航空券<br /><span className="text-slate-800">{man(p.flight)}</span></div>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {[...p.school.tags.slice(0, 2), ...p.activities].map((a) => <span key={a} className="text-xs bg-slate-100 rounded-full px-2 py-1">{a}</span>)}
          </div>
        </div>
      </button>
      <div className="px-4 pb-4">
        <button onClick={onToggle} className={`w-full h-11 rounded-xl text-sm font-bold border ${inCompare ? "text-white border-transparent" : "bg-white border-slate-300"}`}
          style={inCompare ? { background: C.green } : {}}>
          {inCompare ? <span className="inline-flex items-center gap-1"><Check size={16} />比較リストに追加済み</span> : <span className="inline-flex items-center gap-1"><Scale size={16} />比較リストに追加</span>}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   学校のイメージイラスト（実写真の代わり）
   ============================================================ */

const PALETTE = {
  フィリピン: { sky: "#7CCBEF", sea: "#1E9BC4", sand: "#F3D9A4", leaf: "#2E9E5B" },
  オーストラリア: { sky: "#8EC8F2", sea: "#2F7FD0", sand: "#F0D49A", leaf: "#5C9A4A" },
  カナダ: { sky: "#B3D3EE", sea: "#3B6E9E", sand: "#C9D6C2", leaf: "#2F6B4F" },
  マルタ: { sky: "#9FD5F2", sea: "#1F6FB0", sand: "#E9D2A2", leaf: "#7F9A55" },
};
const WALLS = ["#F5EEE3", "#E8EEF6", "#F6E4D8", "#E3F0E8", "#EFE6F2", "#FFF4D6"];
const ROOFS = ["#C2563B", "#3D5A80", "#6B5B4B", "#2F6F5E", "#8A3B5C"];

function SchoolArt({ school, plan, kind = "campus" }) {
  const uid = useId().replace(/:/g, "");
  const pal = PALETTE[school.country];
  const h = hash(school.id + kind);
  const wall = WALLS[h % WALLS.length];
  const roof = ROOFS[(h >> 3) % ROOFS.length];
  const univ = school.format === "大学留学";
  const tropical = school.country === "フィリピン" || school.id === "goldcoast";
  const label = { campus: "校舎", class: "教室", stay: "滞在先" }[kind];

  const Backdrop = () => (
    <>
      <rect width="320" height="180" fill={`url(#sky${uid})`} />
      <circle cx={40 + (h % 220)} cy="34" r="13" fill="#FFE59A" />
      {school.scene === "sea" && (<><rect y="118" width="320" height="62" fill={pal.sea} /><rect y="150" width="320" height="30" fill={pal.sand} /></>)}
      {school.scene === "mountain" && (
        <>
          <polygon points="0,140 60,62 120,140" fill="#7F96AE" /><polygon points="45,82 60,62 75,82 66,78 58,84" fill="#FFFFFF" />
          <polygon points="90,140 170,48 250,140" fill="#6C84A0" /><polygon points="152,70 170,48 188,70 176,66 166,72" fill="#FFFFFF" />
          <polygon points="210,140 275,75 340,140" fill="#8BA1B8" />
          <rect y="138" width="320" height="42" fill="#8DB580" />
        </>
      )}
      {school.scene === "city" && (
        <>
          {Array.from({ length: 9 }).map((_, i) => {
            const bh = 40 + ((h >> i) % 50);
            return <rect key={i} x={i * 36 - 4} y={140 - bh} width="30" height={bh} fill="#9FB0C6" opacity="0.55" />;
          })}
          <rect y="138" width="320" height="42" fill="#C9CFD8" />
        </>
      )}
    </>
  );

  const Palm = ({ x }) => (
    <g>
      <path d={`M${x},160 Q${x + 4},130 ${x - 2},104`} stroke="#8A5A2B" strokeWidth="4" fill="none" />
      {[-60, -20, 20, 60, 180].map((a, i) => (
        <ellipse key={i} cx={x - 2} cy="104" rx="20" ry="5" fill={pal.leaf} transform={`rotate(${a} ${x - 2} 104) translate(14 0)`} />
      ))}
    </g>
  );
  const Tree = ({ x }) => (<g><rect x={x - 2} y="132" width="4" height="22" fill="#7A5534" /><circle cx={x} cy="126" r="14" fill={pal.leaf} /></g>);

  let content;
  if (kind === "campus") {
    content = (
      <>
        <Backdrop />
        {univ ? (
          <g>
            <rect x="70" y="72" width="180" height="82" fill={wall} />
            <polygon points="62,74 160,40 258,74" fill={roof} />
            {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={84 + i * 29} y="84" width="8" height="70" fill="#FFFFFF" opacity="0.9" />)}
            <circle cx="160" cy="58" r="8" fill="#FFFFFF" /><path d="M160,58 L160,53 M160,58 L164,60" stroke={C.ink} strokeWidth="1.2" />
            <rect x="148" y="128" width="24" height="26" fill="#5A4636" />
          </g>
        ) : (
          <g>
            <rect x="88" y="70" width="144" height="84" fill={wall} />
            <rect x="82" y="62" width="156" height="10" fill={roof} />
            {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={100 + (i % 4) * 32} y={82 + Math.floor(i / 4) * 24} width="18" height="14" fill="#A9D3F0" stroke="#FFFFFF" strokeWidth="1.5" />)}
            <rect x="148" y="128" width="24" height="26" fill="#5A4636" />
          </g>
        )}
        <rect x="104" y={univ ? 26 : 46} width="112" height="14" rx="3" fill={roof} />
        <text x="160" y={univ ? 36 : 56} textAnchor="middle" fontSize="8" fontWeight="700" fill="#FFFFFF" fontFamily="sans-serif">{school.sign}</text>
        {tropical ? (<><Palm x={52} /><Palm x={272} /></>) : (<><Tree x={52} /><Tree x={270} /></>)}
      </>
    );
  } else if (kind === "class") {
    content = (
      <>
        <rect width="320" height="180" fill={wall} />
        <rect y="132" width="320" height="48" fill="#D8C2A2" />
        <rect x="226" y="26" width="76" height="62" fill={pal.sky} stroke="#FFFFFF" strokeWidth="5" />
        {school.scene === "sea" && <rect x="228" y="64" width="72" height="22" fill={pal.sea} />}
        {school.scene === "mountain" && <polygon points="228,86 258,48 290,86" fill="#7F96AE" />}
        <rect x="26" y="22" width="176" height="78" fill="#FFFFFF" stroke="#9AA5B1" strokeWidth="3" />
        <text x="40" y="48" fontSize="14" fontWeight="700" fill={C.blue} fontFamily="sans-serif">{univ ? "Lecture 3" : "Hello!"}</text>
        <path d="M40,62 H150 M40,74 H170 M40,86 H128" stroke="#B5BEC9" strokeWidth="3" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={30 + i * 96} y="120" width="74" height="10" rx="2" fill="#B98A5B" />
            <rect x={36 + i * 96} y="130" width="5" height="22" fill="#8C6A47" /><rect x={92 + i * 96} y="130" width="5" height="22" fill="#8C6A47" />
            <circle cx={66 + i * 96} cy="106" r="9" fill={["#F2C9A0", "#C98E62", "#E8B48C"][i]} />
            <rect x={56 + i * 96} y="114" width="20" height="8" rx="3" fill={ROOFS[(h + i) % ROOFS.length]} />
          </g>
        ))}
      </>
    );
  } else {
    const dorm = /寮|レジデンス|アパート/.test(plan?.stayType || "");
    content = (
      <>
        <Backdrop />
        {dorm ? (
          <g>
            <rect x="96" y="54" width="128" height="100" fill={wall} />
            <rect x="92" y="48" width="136" height="8" fill={roof} />
            {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={108 + (i % 4) * 28} y={64 + Math.floor(i / 4) * 26} width="14" height="16" fill={i % 5 === 0 ? "#FFE59A" : "#A9D3F0"} />)}
            <rect x="150" y="132" width="20" height="22" fill="#5A4636" />
          </g>
        ) : (
          <g>
            <rect x="110" y="96" width="104" height="58" fill={wall} />
            <polygon points="100,98 162,58 224,98" fill={roof} />
            <rect x="124" y="108" width="20" height="18" fill="#FFE59A" stroke="#FFFFFF" strokeWidth="2" />
            <rect x="180" y="108" width="20" height="18" fill="#A9D3F0" stroke="#FFFFFF" strokeWidth="2" />
            <rect x="152" y="126" width="18" height="28" fill="#5A4636" />
            {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={20 + i * 8} y="142" width="3" height="14" fill="#FFFFFF" />)}
            <rect x="18" y="146" width="80" height="2.5" fill="#FFFFFF" />
          </g>
        )}
        {tropical ? <Palm x={268} /> : <Tree x={268} />}
      </>
    );
  }

  return (
    <svg viewBox="0 0 320 180" className="w-full block" role="img" aria-label={`${school.name}の${label}（イメージ）`}>
      <defs>
        <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.sky} /><stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      {content}
    </svg>
  );
}

/* ============================================================
   画面：比較
   ============================================================ */

function ComparePage({ compare, toggleCompare, go, advance, track, tab }) {
  const plans = compare.map((id) => ALL_PLANS.find((p) => p.id === id)).filter(Boolean);
  useEffect(() => { if (plans.length >= 2) { advance(2); track("比較した"); } }, []);
  if (plans.length < 2) {
    return (
      <div className="pt-8 text-center">
        <div className="text-5xl" aria-hidden="true">⚖️</div>
        <div className="font-black mt-3">くらべるプランを2つ選ぼう</div>
        <p className="text-sm text-slate-600 mt-2">検索結果の「比較リストに追加」を押すと、ここで横に並べてくらべられます。</p>
        <button onClick={() => tab("search")} className="mt-5 h-12 px-6 rounded-xl text-white font-bold" style={{ background: C.blue }}>プランをさがす</button>
      </div>
    );
  }
  const cheapest = Math.min(...plans.map((p) => p.total));
  const anyReq = plans.some((p) => p.requirement);
  const rows = [
    ["写真", (p) => (
      <div className="space-y-1">
        <div className="rounded-lg overflow-hidden"><SchoolArt school={p.school} plan={p} kind="campus" /></div>
        <div className="grid grid-cols-2 gap-1">
          <div className="rounded-md overflow-hidden"><SchoolArt school={p.school} plan={p} kind="class" /></div>
          <div className="rounded-md overflow-hidden"><SchoolArt school={p.school} plan={p} kind="stay" /></div>
        </div>
        <div className="text-xs text-slate-400">校舎・教室・滞在先（イメージ）</div>
      </div>
    )],
    ["総額（航空券込み）", (p) => (
      <div>
        <div className="text-lg font-black">{yen(p.total)}</div>
        {p.total === cheapest && <div className="text-xs font-bold mt-0.5" style={{ color: C.green }}>いちばん安い</div>}
        <div className="text-xs text-slate-500 mt-1 leading-relaxed">学費 {man(p.tuition)}<br />滞在費 {man(p.stay)}<br />諸費用 {man(p.fees)}<br />航空券 {man(p.flight)}</div>
      </div>
    )],
    ["留学形式", (p) => <span className="text-sm">{p.school.format}</span>],
    ["国・地域", (p) => <div><div className="font-bold">{p.school.country}　{p.school.city}</div><div className="text-xs text-slate-600 mt-1">{p.school.region}</div></div>],
    ["学校の雰囲気", (p) => <span className="text-sm">{p.school.atmosphere}</span>],
    ["期間", (p) => <span className="font-bold">{weekLabel(p.weeks)}</span>],
    ["コース", (p) => <span className="text-sm">{p.course}</span>],
    ...(anyReq ? [["出願条件", (p) => <span className="text-sm">{p.requirement || "なし"}</span>]] : []),
    ["滞在先", (p) => <span className="text-sm">{p.stayType}</span>],
    ["アクティビティ", (p) => <span className="text-sm">{p.activities.join("、")}</span>],
    ["口コミ", (p) => <span className="inline-flex items-center gap-1 text-sm"><Star size={14} fill="#F5B301" stroke="#F5B301" />{p.school.rating}（{p.school.reviewCount}件）</span>],
  ];
  return (
    <div className="pt-4">
      <h1 className="text-xl font-black">{plans.length}つのプランを比較</h1>
      <div className="mt-4 overflow-x-auto -mx-4 px-4">
        <table className="border-separate" style={{ borderSpacing: 0 }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50" style={{ minWidth: 80 }} />
              {plans.map((p) => (
                <th key={p.id} className="text-left align-top p-3 bg-white border-t border-l border-slate-200" style={{ minWidth: 200, width: 200 }}>
                  <div className="text-sm font-bold leading-snug">{p.school.name}</div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => go({ name: "school", schoolId: p.schoolId, planId: p.id })} className="h-9 px-3 rounded-lg text-xs font-bold text-white" style={{ background: C.blue }}>詳細</button>
                    <button onClick={() => toggleCompare(p.id)} className="h-9 px-2 rounded-lg text-xs border border-slate-300 inline-flex items-center gap-1" aria-label="比較から外す"><Trash2 size={13} />外す</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, render]) => (
              <tr key={label}>
                <th className="sticky left-0 z-10 bg-slate-50 text-left align-top text-xs font-bold text-slate-600 py-3 pr-2 border-t border-slate-200">{label}</th>
                {plans.map((p) => <td key={p.id} className="align-top p-3 bg-white border-t border-l border-slate-200">{render(p)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   画面：学校詳細
   ============================================================ */

function SchoolPage({ schoolId, initialPlanId, go, advance, onChat, favorites, toggleFavorite }) {
  const school = SCHOOLS.find((s) => s.id === schoolId);
  const plans = ALL_PLANS.filter((p) => p.schoolId === schoolId);
  const [planId, setPlanId] = useState(initialPlanId || plans[0].id);
  const plan = plans.find((p) => p.id === planId);
  useEffect(() => { advance(3); }, []);
  const parts = [
    { label: "学費", v: plan.tuition, color: C.blue },
    { label: `滞在費（${plan.stayType}）`, v: plan.stay, color: "#5B8DEF" },
    { label: "諸費用（入学金など）", v: plan.fees, color: "#9DB8F2" },
    { label: "航空券（成田発往復の目安）", v: plan.flight, color: C.green },
  ];
  return (
    <div className="pt-4">
      <div className="flex gap-2 overflow-x-auto noscroll -mx-4 px-4" style={{ scrollSnapType: "x mandatory" }}>
        {["campus", "class", "stay"].map((k) => (
          <figure key={k} className="shrink-0 w-11/12 md:w-2/5" style={{ scrollSnapAlign: "start" }}>
            <div className="rounded-2xl overflow-hidden border border-slate-200"><SchoolArt school={school} plan={plan} kind={k} /></div>
            <figcaption className="text-xs text-slate-500 mt-1">{{ campus: "校舎", class: "教室", stay: `滞在先：${plan.stayType}` }[k]}（イメージ）</figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500">{school.format}　{COUNTRY[school.country].flag} {school.country}　{school.city}</div>
          <h1 className="text-xl font-black leading-snug mt-1">{school.name}</h1>
        </div>
        <button onClick={() => toggleFavorite(plan.id)} className="w-11 h-11 rounded-full bg-white shadow flex items-center justify-center shrink-0"
          aria-label={favorites.includes(plan.id) ? "お気に入りから外す" : "お気に入りに追加"} aria-pressed={favorites.includes(plan.id)}>
          <Heart key={String(favorites.includes(plan.id))} size={20} className={favorites.includes(plan.id) ? "pop" : ""}
            fill={favorites.includes(plan.id) ? C.heart : "none"} stroke={favorites.includes(plan.id) ? C.heart : "#64748B"} />
        </button>
      </div>
      <div className="flex items-center gap-1 text-sm mt-1"><Star size={14} fill="#F5B301" stroke="#F5B301" />{school.rating}<span className="text-slate-500">（口コミ{school.reviewCount}件）</span></div>

      <div className="flex gap-2 mt-4 overflow-x-auto noscroll">
        {plans.map((p) => (
          <button key={p.id} onClick={() => setPlanId(p.id)}
            className={`shrink-0 h-11 px-4 rounded-full text-sm border ${p.id === planId ? "text-white border-transparent font-bold" : "bg-white border-slate-300"}`}
            style={p.id === planId ? { background: C.ink } : {}}>
            {p.course}・{weekLabel(p.weeks)}
          </button>
        ))}
      </div>

      <section className="mt-4 bg-white border border-slate-100 shadow-sm rounded-3xl p-4">
        <div className="text-xs text-slate-500">総額の目安（航空券込み）</div>
        <div className="text-3xl font-black tracking-tight mt-1">{yen(plan.total)}</div>
        <div className="flex h-3 rounded-full overflow-hidden mt-3" aria-hidden="true">
          {parts.map((x) => <div key={x.label} style={{ width: `${(x.v / plan.total) * 100}%`, background: x.color }} />)}
        </div>
        <dl className="mt-3 space-y-2 text-sm">
          {parts.map((x) => (
            <div key={x.label} className="flex justify-between gap-3">
              <dt className="flex items-center gap-2 text-slate-600"><span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: x.color }} />{x.label}</dt>
              <dd className="font-bold shrink-0">{yen(x.v)}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">航空券は時期で変わります。このサイトの利用に追加の手数料はかかりません。</p>
      </section>

      <section className="mt-4 bg-white border border-slate-100 shadow-sm rounded-3xl p-4 space-y-4 text-sm leading-relaxed">
        {plan.requirement && <Info title="出願条件">{plan.requirement}</Info>}
        <Info title="土地柄">{school.region}</Info>
        <Info title="学校の雰囲気">{school.atmosphere}</Info>
        <Info title="授業">{school.hours}</Info>
        <Info title="滞在先">{plan.stayType}。{school.commute}。</Info>
        <Info title="ビザ">{visaFor(plan)}。</Info>
        <Info title="アクティビティ">{plan.activities.join("、")}</Info>
      </section>

      <section className="mt-4 bg-white border border-slate-100 shadow-sm rounded-3xl p-4">
        <h2 className="font-bold">1日の過ごし方（例）</h2>
        <ol className="mt-3 relative">
          {daySchedule(school, plan).map(([t, what, emoji], i, arr) => (
            <li key={t} className="flex gap-3 pb-3 relative">
              {i < arr.length - 1 && <span className="absolute w-0.5 bg-slate-200" style={{ left: 18, top: 36, bottom: 0 }} aria-hidden="true" />}
              <span className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-lg shrink-0" aria-hidden="true">{emoji}</span>
              <span className="pt-1.5"><span className="text-xs font-bold text-slate-500 mr-2">{t}</span><span className="text-sm">{what}</span></span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-4">
        <h2 className="font-bold">先輩の口コミ</h2>
        <div className="space-y-2 mt-2">
          {REVIEWS[school.id].map((r, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, k) => <Star key={k} size={12} fill={k < r.rating ? "#F5B301" : "none"} stroke="#F5B301" />)}</div>
              <p className="text-sm mt-1 leading-relaxed">{r.body}</p>
              <div className="text-xs text-slate-500 mt-1">{r.author}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed left-0 right-0 bottom-0 z-40 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-2">
          <button onClick={() => onChat(plan.id)} className="h-12 px-4 rounded-xl border border-slate-300 font-bold text-sm inline-flex items-center gap-1"><MessageCircle size={16} />AIに質問</button>
          <button onClick={() => go({ name: "apply", planId: plan.id })} className="flex-1 h-12 rounded-xl text-white font-bold" style={{ background: C.blue }}>このプランで申し込む</button>
        </div>
      </div>
    </div>
  );
}

function Info({ title, children }) {
  return (
    <div>
      <div className="text-xs font-bold text-slate-500">{title}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

/* ============================================================
   AIチャット（本番では assistant.ts → LLM に差し替える想定）
   ============================================================ */

function askAssistant(school, plan, q) {
  const s = school;
  if (/条件|ielts|英語力|入学|出願/i.test(q))
    return { text: plan.requirement ? `このプランの出願条件は「${plan.requirement}」です。書類の準備は、申し込み後に専門家と一緒に進めます。` : "このプランに英語力の条件はありません。初心者でも申し込めます。" };
  if (/授業|時間|コマ|レッスン|科目/.test(q)) return { text: `${s.name}の授業は、${s.hours}です。` };
  if (/寮|ホームステイ|滞在|距離|通学|何分/.test(q)) return { text: `${s.commute}。滞在先は「${plan.stayType}」です。` };
  if (/ビザ|査証|eta/i.test(q)) return { text: `${visaFor(plan)}。`, step: 5 };
  if (/治安|安全|危/.test(q)) return { text: `${s.safety}。` };
  if (/費用|総額|いくら|お金|値段|高い|安い|内訳/.test(q))
    return { text: `「${plan.course}（${weekLabel(plan.weeks)}）」の総額の目安は${yen(plan.total)}です。内訳は学費${yen(plan.tuition)}、滞在費${yen(plan.stay)}、諸費用${yen(plan.fees)}、航空券${yen(plan.flight)}です。`, step: 2 };
  if (/日本人|割合|雰囲気|国籍/.test(q)) return { text: s.atmosphere };
  if (/申し込|手続|流れ|ステップ|何をすれば/.test(q))
    return { text: "申し込みは3分で終わります。そのあとの契約とビザは、専門家がオンラインで画面を見ながら一緒に進めます。", step: 3 };
  return { text: "その質問は、申し込み後のオンライン相談で専門家が詳しく答えます。いまは授業、滞在先、ビザ、治安、費用、出願条件について答えられます。" };
}

function ChatSheet({ chat, onClose, track, onStep }) {
  const school = SCHOOLS.find((s) => s.id === chat.schoolId);
  const plan = ALL_PLANS.find((p) => p.id === chat.planId);
  const [msgs, setMsgs] = useState([{ from: "ai", text: `${school.name}について、なんでも聞いてください。` }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs, typing]);

  function send(q) {
    if (!q.trim() || typing) return;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setInput("");
    setTyping(true);
    track("AIに質問した");
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "ai", ...askAssistant(school, plan, q) }]);
      setTyping(false);
    }, 600);
  }
  const chips = school.format === "大学留学"
    ? ["出願条件は？", "1学期に何科目？", "ビザはいつまでに必要？", "総額の内訳は？"]
    : ["授業は1日何時間？", "寮から学校まで何分？", "ビザはいつまでに必要？", "総額の内訳は？"];

  return (
    <Sheet open onClose={onClose} title="AIに質問" tall>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-3 pb-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.from === "me" ? "text-white" : "bg-slate-100"}`} style={m.from === "me" ? { background: C.blue } : {}}>
                {m.text}
                {m.step !== undefined && (
                  <button onClick={() => onStep(m.step)} className="mt-2 block text-xs font-bold underline" style={{ color: C.blue }}>ステップ{m.step + 1}「{STEPS[m.step].title}」を見る</button>
                )}
              </div>
            </div>
          ))}
          {typing && <div className="text-xs text-slate-500">入力中…</div>}
          <div ref={endRef} />
        </div>
        <div className="flex gap-2 overflow-x-auto noscroll pb-2">
          {chips.map((c) => <button key={c} onClick={() => send(c)} className="shrink-0 h-9 px-3 rounded-full border border-slate-300 text-xs bg-white">{c}</button>)}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="質問を入力" className="flex-1 h-12 border border-slate-300 rounded-xl px-3 text-base outline-none" />
          <button type="submit" className="w-12 h-12 rounded-xl text-white flex items-center justify-center" style={{ background: C.blue }} aria-label="送信"><Send size={18} /></button>
        </form>
      </div>
    </Sheet>
  );
}

/* ============================================================
   画面：申し込み（相談日時は1時間単位）
   ============================================================ */

function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function slotLabel(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return `${d.getMonth() + 1}月${d.getDate()}日（${WD[d.getDay()]}）${d.getHours()}:00〜${d.getHours() + 1}:00`;
}

function SlotPicker({ value, onChange }) {
  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i + 1); return d; }), []);
  const [day, setDay] = useState(dateKey(days[0]));
  const hours = Array.from({ length: 10 }).map((_, i) => 10 + i);
  const booked = (dk, hr) => hash(dk + hr) % 4 === 0;
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto noscroll -mx-4 px-4">
        {days.map((d) => {
          const k = dateKey(d);
          const on = k === day;
          return (
            <button type="button" key={k} onClick={() => setDay(k)} aria-pressed={on}
              className={`shrink-0 w-14 h-16 rounded-xl border flex flex-col items-center justify-center ${on ? "text-white border-transparent" : "bg-white border-slate-300"}`} style={on ? { background: C.ink } : {}}>
              <span className="text-xs">{d.getMonth() + 1}/{d.getDate()}</span>
              <span className={`text-sm font-bold ${!on && d.getDay() === 0 ? "text-red-500" : ""} ${!on && d.getDay() === 6 ? "text-blue-600" : ""}`}>{WD[d.getDay()]}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {hours.map((hr) => {
          const iso = `${day}T${pad(hr)}:00`;
          const full = booked(day, hr);
          const on = value === iso;
          return (
            <button type="button" key={hr} disabled={full} onClick={() => onChange(iso)} aria-pressed={on}
              className={`h-11 rounded-xl border text-sm ${on ? "text-white border-transparent font-bold" : full ? "bg-slate-100 border-slate-200 text-slate-400 line-through" : "bg-white border-slate-300"}`}
              style={on ? { background: C.blue } : {}}>
              {hr}:00〜{hr + 1}:00{full && <span className="sr-only">（満席）</span>}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-2">相談は1回60分です。線が引かれている時間は埋まっています。</p>
    </div>
  );
}

function ApplyPage({ planId, onSubmit }) {
  const plan = ALL_PLANS.find((p) => p.id === planId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [when, setWhen] = useState("");
  const valid = name.trim() && /\S+@\S+\.\S+/.test(email) && when;
  return (
    <div className="pt-4">
      <h1 className="text-xl font-black">申し込む</h1>
      <div className="mt-3 bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden flex">
        <div className="w-28 shrink-0"><SchoolArt school={plan.school} plan={plan} kind="campus" /></div>
        <div className="p-3 min-w-0">
          <div className="text-sm font-bold leading-snug">{plan.school.name}</div>
          <div className="text-xs text-slate-600">{plan.course}・{weekLabel(plan.weeks)}</div>
          <div className="font-black mt-1">総額の目安 {yen(plan.total)}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl p-4 text-sm leading-relaxed" style={{ background: "#EAF7F1" }}>
        <div className="font-bold">ここで入力するのは3つだけです</div>
        <p className="mt-1">ここから先の契約・書類・ビザは、専門家がオンラインで画面を見ながら一緒に進めます。</p>
        <ol className="mt-3 space-y-1">
          {STEPS.slice(4).map((s, i) => (
            <li key={s.title} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-xs font-bold flex items-center justify-center">{i + 5}</span>
              <span>{s.title}</span>
              <span className="text-xs text-slate-600">{s.expert ? "専門家と一緒に" : "あなた"}</span>
            </li>
          ))}
        </ol>
      </div>

      <form className="mt-4 space-y-5" onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({ id: crypto.randomUUID(), user_id: null, plan_id: plan.id, name, email, preferred_datetime: when, status: "requested", created_at: new Date().toISOString() });
      }}>
        <Field label="お名前"><input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 border border-slate-300 rounded-xl px-3 text-base bg-white" autoComplete="name" /></Field>
        <Field label="メールアドレス"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 border border-slate-300 rounded-xl px-3 text-base bg-white" autoComplete="email" /></Field>
        <div>
          <div className="text-sm font-bold mb-2">オンライン相談の日時（1時間）</div>
          <SlotPicker value={when} onChange={setWhen} />
          {when && <div className="mt-2 text-sm font-bold" style={{ color: C.blue }}>{slotLabel(when)}を選んでいます</div>}
        </div>
        <button type="submit" disabled={!valid} className="w-full h-12 rounded-xl text-white font-bold disabled:opacity-40" style={{ background: C.blue }}>申し込む</button>
        <p className="text-xs text-slate-500 leading-relaxed">この時点ではお金はかかりません。契約内容とプライバシーポリシーは、オンライン相談で専門家と一緒に確認します。</p>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-bold mb-1">{label}</div>
      {children}
    </label>
  );
}

/* ============================================================
   画面：申し込み完了
   ============================================================ */

function DonePage({ application, reached, openJourney, go }) {
  if (!application) {
    return (
      <div className="pt-8 text-center">
        <div className="font-bold">まだ申し込みはありません</div>
        <button onClick={() => go({ name: "home" })} className="mt-4 h-11 px-4 rounded-xl text-white font-bold" style={{ background: C.blue }}>プランを探す</button>
      </div>
    );
  }
  const plan = ALL_PLANS.find((p) => p.id === application.plan_id);
  const remaining = STEPS.length - reached;
  return (
    <div className="pt-8">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white" style={{ background: C.green }}><Check size={28} strokeWidth={3} /></div>
        <h1 className="text-xl font-black mt-4">申し込みました</h1>
        <div className="mt-3 flex items-baseline justify-center gap-1">
          <span className="font-bold">渡航まであと</span>
          <span className="text-5xl font-black" style={{ color: C.blue }}>{remaining}</span>
          <span className="font-bold">ステップ</span>
        </div>
        <p className="text-sm text-slate-600 mt-2">{plan?.school.city}の{plan?.school.name}</p>
      </div>
      <div className="mt-6 bg-white border border-slate-100 shadow-sm rounded-3xl p-4">
        <div className="text-xs font-bold text-slate-500">次にやること</div>
        <div className="flex items-start gap-3 mt-2">
          <CalendarDays size={20} className="shrink-0 mt-0.5" style={{ color: C.blue }} />
          <div>
            <div className="font-bold">オンライン相談を待つだけ</div>
            <div className="text-sm text-slate-600 mt-1">{slotLabel(application.preferred_datetime)}に、専門家と一緒に契約・書類を進めます。パスポートを手元に用意しておいてください。</div>
          </div>
        </div>
      </div>
      <button onClick={() => openJourney()} className="mt-4 w-full h-12 rounded-xl border border-slate-300 bg-white font-bold">残りのステップを見る</button>
    </div>
  );
}

/* ============================================================
   画面：検証用の記録
   ============================================================ */

function DebugPage({ st, onReset }) {
  const entries = Object.entries(st.events);
  return (
    <div className="pt-4">
      <h1 className="text-xl font-black">検証用の記録</h1>
      <p className="text-sm text-slate-600 mt-1">この端末で記録された行動の回数です。</p>
      <div className="mt-4 bg-white border border-slate-100 shadow-sm rounded-3xl divide-y divide-slate-100">
        <Row k="完了したステップ" v={`${st.reached} / ${STEPS.length}`} />
        <Row k="申し込み" v={st.application ? "あり" : "なし"} />
        {entries.length === 0 ? <div className="p-3 text-sm text-slate-500">まだ記録はありません</div> : entries.map(([k, v]) => <Row key={k} k={k} v={`${v}回`} />)}
      </div>
      <button onClick={onReset} className="mt-4 h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm font-bold">記録をリセットする</button>
    </div>
  );
}
function Row({ k, v }) {
  return <div className="flex justify-between p-3 text-sm"><span>{k}</span><span className="font-bold">{v}</span></div>;
}

/* ============================================================
   絞り込みシート
   ============================================================ */

function FilterSheet({ open, onClose, filters: f, setFilters, onApply }) {
  const count = filterPlans(f).length;
  const opt = OPTIONS[f.format];
  const b = opt.budget;
  const sliderValue = f.maxTotal ?? b.max;
  return (
    <Sheet open={open} onClose={onClose} title="条件で絞り込む">
      <div className="space-y-5">
        <div>
          <div className="text-sm font-bold mb-2">留学の形式</div>
          <FormatSwitch value={f.format} onChange={(fmt) => setFilters({ ...emptyFilters(fmt), q: f.q })} size="sm" />
        </div>
        <div>
          <div className="flex justify-between text-sm font-bold"><span>総額の上限（航空券込み）</span><span>{f.maxTotal ? man(f.maxTotal) : "上限なし"}</span></div>
          <input type="range" min={b.min} max={b.max} step={b.step} value={sliderValue}
            onChange={(e) => { const v = Number(e.target.value); setFilters({ ...f, maxTotal: v >= b.max ? null : v }); }}
            className="w-full mt-2" style={{ accentColor: C.blue }} aria-label="総額の上限" />
          <div className="flex gap-2 mt-2">
            {b.chips.map((v) => (
              <button key={v} onClick={() => setFilters({ ...f, maxTotal: f.maxTotal === v ? null : v })}
                className={`h-9 px-3 rounded-full text-xs border ${f.maxTotal === v ? "text-white border-transparent" : "bg-white border-slate-300"}`} style={f.maxTotal === v ? { background: C.ink } : {}}>
                {man(v)}以内
              </button>
            ))}
          </div>
        </div>
        <ChipGroup label="国・地域" options={COUNTRIES} values={f.countries} onToggle={(v) => setFilters({ ...f, countries: toggle(f.countries, v) })} />
        <ChipGroup label="期間" options={opt.weeks} render={weekLabel} values={f.weeks} onToggle={(v) => setFilters({ ...f, weeks: toggle(f.weeks, v) })} />
        <ChipGroup label="コース" options={opt.types} values={f.types} onToggle={(v) => setFilters({ ...f, types: toggle(f.types, v) })} />
        <ChipGroup label="環境" options={TAG_OPTIONS} values={f.tags} onToggle={(v) => setFilters({ ...f, tags: toggle(f.tags, v) })} />
        <ChipGroup label="アクティビティ" options={ACTIVITY_OPTIONS} values={f.acts} onToggle={(v) => setFilters({ ...f, acts: toggle(f.acts, v) })} />
        <ChipGroup label="口コミ評価" options={[4.5, 4.3]} render={(r) => `★${r}以上`} values={f.minRating ? [f.minRating] : []}
          onToggle={(v) => setFilters({ ...f, minRating: f.minRating === v ? 0 : v })} />
        <div className="flex gap-2 pt-2">
          <button onClick={() => setFilters({ ...emptyFilters(f.format), q: f.q })} className="h-12 px-4 rounded-xl border border-slate-300 bg-white text-sm font-bold">クリア</button>
          <button onClick={onApply} className="flex-1 h-12 rounded-xl text-white font-bold" style={{ background: C.blue }}>{count}件のプランを見る</button>
        </div>
      </div>
    </Sheet>
  );
}

function ChipGroup({ label, options, values, onToggle, render = (x) => x }) {
  return (
    <div>
      <div className="text-sm font-bold mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = values.includes(o);
          return (
            <button key={o} onClick={() => onToggle(o)} aria-pressed={on}
              className={`h-11 px-4 rounded-full text-sm border ${on ? "text-white border-transparent font-bold" : "bg-white border-slate-300"}`} style={on ? { background: C.ink } : {}}>
              {render(o)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   共通：下から出るシート
   ============================================================ */

function Sheet({ open, onClose, title, children, tall }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900 bg-opacity-40" onClick={onClose} />
      <div className={`rise relative bg-white w-full max-w-xl rounded-t-3xl p-4 pb-6 flex flex-col ${tall ? "h-5/6" : ""}`} style={{ maxHeight: "85vh" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-lg">{title}</h2>
          <button onClick={onClose} className="w-11 h-11 -mr-2 flex items-center justify-center" aria-label="閉じる"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
      </div>
    </div>
  );
}


/* ============================================================
   1日の過ごし方（例）
   ============================================================ */

function daySchedule(school, plan) {
  const homestay = plan.stayType.includes("ホームステイ");
  const afternoon = school.tags.includes("海が近い") ? ["ビーチでのんびり", "🏖️"] : school.tags.includes("自然が近い") ? ["公園や山をお散歩", "🌲"] : ["カフェや街歩き", "☕"];
  if (school.format === "大学留学") {
    return [
      ["8:30", "キャンパスのカフェで朝ごはん", "🥐"],
      ["10:00", "講義（英語で受ける専門の授業）", "🎓"],
      ["12:30", "友だちとランチ", "🍝"],
      ["14:00", "ゼミ・グループワーク", "💬"],
      ["17:00", school.tags.includes("自然が近い") ? "海辺や公園をお散歩" : "図書館で課題", school.tags.includes("自然が近い") ? "🌲" : "📚"],
      ["19:00", "寮で友だちと夕ごはん", "🍽️"],
    ];
  }
  return [
    ["7:30", homestay ? "ホストファミリーと朝ごはん" : "寮で朝ごはん", "🍳"],
    ["9:00", "午前の授業", "📖"],
    ["12:00", "クラスメイトとランチ", "🥪"],
    ["13:00", plan.type === "マンツーマン" ? "マンツーマン授業" : "午後の授業・選択クラス", "🗣️"],
    ["16:00", afternoon[0], afternoon[1]],
    ["19:00", homestay ? "ホストファミリーと夕ごはん" : "友だちと夕ごはん", "🍽️"],
  ];
}

/* ============================================================
   下のタブメニュー
   ============================================================ */

function TabBar({ current, onTab, favCount, compareCount }) {
  const tabs = [
    { id: "home", label: "ホーム", Icon: Home },
    { id: "search", label: "さがす", Icon: Search },
    { id: "compare", label: "くらべる", Icon: Scale, badge: compareCount },
    { id: "favorites", label: "お気に入り", Icon: Heart, badge: favCount },
    { id: "mypage", label: "マイ留学", Icon: Plane },
  ];
  return (
    <nav className="fixed left-0 right-0 bottom-0 z-40 bg-white border-t border-slate-200" aria-label="メインメニュー">
      <div className="max-w-3xl mx-auto grid grid-cols-5">
        {tabs.map(({ id, label, Icon, badge }) => {
          const on = current === id;
          return (
            <button key={id} onClick={() => onTab(id)} aria-current={on ? "page" : undefined}
              className="relative h-16 flex flex-col items-center justify-center gap-1 text-xs font-bold" style={{ color: on ? C.blue : "#7A8699" }}>
              <Icon size={22} strokeWidth={on ? 2.5 : 2} />
              {label}
              {badge > 0 && (
                <span className="absolute top-1.5 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center" style={{ background: C.heart, left: "56%" }}>{badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ============================================================
   画面：お気に入り
   ============================================================ */

function FavoritesPage({ favorites, toggleFavorite, compare, toggleCompare, go, tab }) {
  const plans = favorites.map((id) => ALL_PLANS.find((p) => p.id === id)).filter(Boolean);
  if (!plans.length) {
    return (
      <div className="pt-12 text-center">
        <div className="text-5xl" aria-hidden="true">💗</div>
        <div className="font-black mt-3">気になるプランをためておこう</div>
        <p className="text-sm text-slate-600 mt-2">プランの♡を押すと、ここに集まります。</p>
        <button onClick={() => tab("search")} className="mt-5 h-12 px-6 rounded-xl text-white font-bold" style={{ background: C.blue }}>プランをさがす</button>
      </div>
    );
  }
  return (
    <div className="pt-4">
      <h1 className="text-xl font-black">お気に入り</h1>
      <p className="text-sm text-slate-600 mt-1">{plans.length}件。2つ以上を比較リストに入れると、横に並べてくらべられます。</p>
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} inCompare={compare.includes(p.id)} onToggle={() => toggleCompare(p.id)}
            fav onFav={() => toggleFavorite(p.id)} onOpen={() => go({ name: "school", schoolId: p.schoolId, planId: p.id })} />
        ))}
      </div>
      {compare.length >= 2 && (
        <button onClick={() => tab("compare")} className="mt-4 w-full h-12 rounded-xl text-white font-bold" style={{ background: C.blue }}>比較リストの{compare.length}件をくらべる</button>
      )}
    </div>
  );
}

/* ============================================================
   画面：マイ留学
   ============================================================ */

const PREP = [
  { key: "passport", label: "パスポートの有効期限を確かめる", emoji: "🛂" },
  { key: "photo", label: "証明写真を用意する", emoji: "📷" },
  { key: "intro", label: "英語の自己紹介を1分で言えるようにする", emoji: "🗣️" },
  { key: "card", label: "海外で使えるカードを用意する", emoji: "💳" },
];

function MyPage({ st, openJourney, toggleCheck, go, tab }) {
  const remaining = STEPS.length - st.reached;
  const current = Math.min(st.reached, STEPS.length - 1);
  const app = st.application;
  const appPlan = app ? ALL_PLANS.find((p) => p.id === app.plan_id) : null;
  const next = [
    { text: "行ってみたい国をさがしてみよう", cta: "さがす", act: () => tab("search") },
    { text: "気になる学校を2つ、くらべてみよう", cta: "くらべる", act: () => tab(st.compare.length >= 2 ? "compare" : "search") },
    { text: "学校の詳細で、総額の内訳を見てみよう", cta: "さがす", act: () => tab("search") },
    { text: "気に入ったプランに申し込もう（3分）", cta: st.favorites.length ? "お気に入りから選ぶ" : "さがす", act: () => tab(st.favorites.length ? "favorites" : "search") },
  ][st.reached];
  const doneCount = PREP.filter((p) => st.checklist[p.key]).length;

  return (
    <div className="pt-4">
      <h1 className="text-xl font-black">マイ留学</h1>

      <section className="mt-4 rounded-3xl p-5 text-white" style={{ background: C.blue }}>
        <div className="text-sm opacity-80">渡航まで</div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="font-bold">あと</span><span className="text-5xl font-black">{remaining}</span><span className="font-bold">ステップ</span>
        </div>
        <div className="mt-3 text-sm">いまは「{STEPS[current].title}」</div>
        <div className="mt-3 h-2 rounded-full bg-white bg-opacity-25 overflow-hidden">
          <div className="h-full rounded-full bg-white" style={{ width: `${(st.reached / STEPS.length) * 100}%` }} />
        </div>
      </section>

      {next && (
        <section className="mt-3 bg-white border border-slate-100 shadow-sm rounded-3xl p-4 flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">👉</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-500">次にやること</div>
            <div className="text-sm font-bold mt-0.5">{next.text}</div>
          </div>
          <button onClick={next.act} className="h-11 px-4 rounded-xl text-white text-sm font-bold shrink-0" style={{ background: C.blue }}>{next.cta}</button>
        </section>
      )}

      {app && appPlan && (
        <section className="mt-3 bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
          <div className="flex">
            <div className="w-28 shrink-0"><SchoolArt school={appPlan.school} plan={appPlan} kind="campus" /></div>
            <div className="p-3 min-w-0">
              <div className="text-xs font-bold" style={{ color: C.green }}>申し込み済み</div>
              <div className="text-sm font-bold leading-snug">{appPlan.school.name}</div>
              <div className="text-xs text-slate-600">{appPlan.course}・{weekLabel(appPlan.weeks)}</div>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-sm flex items-center gap-2">
            <CalendarDays size={16} style={{ color: C.blue }} />オンライン相談：{slotLabel(app.preferred_datetime)}
          </div>
        </section>
      )}

      <section className="mt-3 bg-white border border-slate-100 shadow-sm rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">渡航までの道のり</h2>
          <button onClick={() => openJourney()} className="text-xs underline text-slate-500 h-11">くわしく見る</button>
        </div>
        <ol className="mt-1">
          {STEPS.map((s, i) => {
            const done = i < st.reached, now = i === st.reached;
            return (
              <li key={s.title} className="flex items-center gap-3 py-1.5">
                {done ? <CheckCircle2 size={20} style={{ color: C.green }} /> : now ? <Plane size={20} style={{ color: C.blue }} /> : <Circle size={20} className="text-slate-300" />}
                <span className={`text-sm ${done ? "text-slate-400 line-through" : now ? "font-bold" : ""}`}>{s.title}</span>
                {s.expert && <span className="text-xs rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 inline-flex items-center gap-1"><Users size={12} />専門家と一緒</span>}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-3 bg-white border border-slate-100 shadow-sm rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">今からできる準備</h2>
          <span className="text-xs font-bold text-slate-500">{doneCount}/{PREP.length}</span>
        </div>
        <ul className="mt-2 space-y-2">
          {PREP.map((p) => {
            const on = !!st.checklist[p.key];
            return (
              <li key={p.key}>
                <button onClick={() => toggleCheck(p.key)} aria-pressed={on}
                  className={`w-full min-h-12 rounded-2xl px-3 flex items-center gap-3 text-left border ${on ? "border-transparent" : "border-slate-200"}`} style={on ? { background: "#EAF7F1" } : {}}>
                  <span className="text-xl" aria-hidden="true">{p.emoji}</span>
                  <span className={`flex-1 text-sm ${on ? "text-slate-500 line-through" : ""}`}>{p.label}</span>
                  {on ? <CheckCircle2 size={20} style={{ color: C.green }} /> : <Circle size={20} className="text-slate-300" />}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <button onClick={() => go({ name: "debug" })} className="mt-8 text-xs text-slate-400 underline">検証用の記録を見る</button>
    </div>
  );
}

/* ============================================================
   30秒の行き先診断
   ============================================================ */

function quizQuestions(format) {
  const univ = format === "大学留学";
  return [
    {
      q: "どれくらい行ってみたい？",
      options: [
        { emoji: "🌱", label: "まずはお試し（1か月）", f: { format: "語学留学", weeks: [4] } },
        { emoji: "📚", label: "しっかり2〜3か月", f: { format: "語学留学", weeks: [8, 12] } },
        { emoji: "🌏", label: "半年くらい", f: { format: "語学留学", weeks: [24] } },
        { emoji: "🎓", label: "海外の大学で学びたい", f: { format: "大学留学" } },
      ],
    },
    {
      q: "予算はどれくらい？（航空券込み）",
      dependsOnFormat: true,
      options: (fmt) => fmt === "大学留学"
        ? [
          { emoji: "🪙", label: "200万円くらいまで", f: { maxTotal: 2000000 } },
          { emoji: "💰", label: "500万円くらいまで", f: { maxTotal: 5000000 } },
          { emoji: "🤔", label: "まだわからない", f: {} },
        ]
        : [
          { emoji: "🪙", label: "50万円くらいまで", f: { maxTotal: 500000 } },
          { emoji: "💰", label: "100万円くらいまで", f: { maxTotal: 1000000 } },
          { emoji: "🤔", label: "まだわからない", f: {} },
        ],
    },
    {
      q: "留学でいちばんしたいことは？",
      dependsOnFormat: true,
      options: (fmt) => fmt === "大学留学"
        ? [
          { emoji: "🧪", label: "まずは1学期だけ通ってみたい", f: { types: ["1学期だけ留学"] } },
          { emoji: "🎓", label: "学位をとりたい", f: { types: ["学部正規入学"] } },
          { emoji: "🌍", label: "日本人が少ない環境がいい", f: { tags: ["日本人少なめ"] } },
        ]
        : [
          { emoji: "🗣️", label: "とにかく英語を話したい", f: { types: ["マンツーマン"] } },
          { emoji: "🏖️", label: "海や自然も楽しみたい", f: { tags: ["海が近い"] } },
          { emoji: "🌍", label: "日本人が少ない環境がいい", f: { tags: ["日本人少なめ"] } },
          { emoji: "💼", label: "将来の仕事に活かしたい", f: { acts: ["インターン紹介"] } },
        ],
    },
  ];
}

function QuizSheet({ open, onClose, format, onFinish }) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState([]);
  useEffect(() => { if (open) { setStep(0); setPicked([]); } }, [open]);
  const qs = quizQuestions(format);
  const fmt = picked[0]?.format || format;
  const current = qs[step];
  const options = typeof current.options === "function" ? current.options(fmt) : current.options;

  function choose(f) {
    const next = [...picked, f];
    if (step < qs.length - 1) {
      setPicked(next);
      setStep(step + 1);
      return;
    }
    let result = emptyFilters(next[0].format || format);
    next.forEach((x) => { result = { ...result, ...x }; });
    if (filterPlans(result).length === 0) result = { ...result, types: [], tags: [], acts: [] };
    if (filterPlans(result).length === 0) result = { ...result, maxTotal: null };
    onFinish(result);
  }

  return (
    <Sheet open={open} onClose={onClose} title="30秒で行き先診断">
      <div className="flex gap-1.5 mb-4" aria-label={`${qs.length}問中${step + 1}問目`}>
        {qs.map((_, i) => <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= step ? C.blue : "#E2E8F0" }} />)}
      </div>
      <div className="text-xs font-bold text-slate-500">質問 {step + 1}/{qs.length}</div>
      <h3 key={step} className="rise text-xl font-black mt-1">{current.q}</h3>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {options.map((o) => (
          <button key={o.label} onClick={() => choose(o.f)} className="rise min-h-24 rounded-2xl border-2 border-slate-200 bg-white p-3 text-left hover:border-blue-300">
            <span className="block text-3xl" aria-hidden="true">{o.emoji}</span>
            <span className="block text-sm font-bold mt-2 leading-snug">{o.label}</span>
          </button>
        ))}
      </div>
      {step > 0 && (
        <button onClick={() => { setStep(step - 1); setPicked(picked.slice(0, -1)); }} className="mt-4 h-11 text-sm text-slate-500 underline">ひとつ前に戻る</button>
      )}
    </Sheet>
  );
}
