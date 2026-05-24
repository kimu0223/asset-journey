// Asset Journey — 実データ初期化スクリプト
// DevToolsのConsoleに貼り付けて実行してください
// 2026年5月24日時点の実データ

const realData = {
  members: { selfName: "壮汰", partnerName: "かい" },

  monthly: [],

  yearly: [
    {
      year: "2026",
      cash:      1488590,
      nisa:      247609,
      stock:     0,
      trust:     691875,
      nisaGain:  55763,
      stockGain: 0,
    },
  ],

  accounts: [
    { name: "旅行",               balance: 58749,  color: "#4ECDC4", icon: "✈️",  target: 500000,  owner: "joint" },
    { name: "美容室",             balance: 11561,  color: "#DDA0DD", icon: "💇",  target: 100000,  owner: "self"  },
    { name: "奨学金返済積立",     balance: 293520, color: "#FF6B6B", icon: "🏫",  target: 1000000, owner: "self"  },
    { name: "家の初期費用",       balance: 504580, color: "#FFE66D", icon: "🏠",  target: 500000,  owner: "joint" },
    { name: "特別費",             balance: 333,    color: "#A8E6CF", icon: "⛵",  target: 2000000, owner: "joint" },
    { name: "志樹",               balance: 236431, color: "#96CEB4", icon: "💰",  target: 2000000, owner: "joint" },
    { name: "何か欲しい代",       balance: 4007,   color: "#F7DC6F", icon: "💻",  target: 4000000, owner: "self"  },
    { name: "志樹のミルク・その他", balance: 6532, color: "#85C1E9", icon: "🍼",  target: 500000,  owner: "joint" },
    { name: "お米",               balance: 41051,  color: "#82E0AA", icon: "🍚",  target: 100000,  owner: "joint" },
  ],

  nisa: [
    { year: "2026", growthUsed: 5.2, accumulationUsed: 11.25 },
  ],

  events: [],

  subscriptions: [
    { id: "sub1", name: "Claude.ai",            amount: 3639, cycle: "monthly", category: "software",      owner: "self",  active: true },
    { id: "sub2", name: "Apple (iCloud等)",     amount: 630,  cycle: "monthly", category: "software",      owner: "self",  active: true },
    { id: "sub3", name: "Amazonプライム",       amount: 600,  cycle: "monthly", category: "entertainment", owner: "joint", active: true },
    { id: "sub4", name: "SBI生命保険",          amount: 1540, cycle: "monthly", category: "other",         owner: "self",  active: true },
    { id: "sub5", name: "楽天モバイル",         amount: 5385, cycle: "monthly", category: "other",         owner: "self",  active: true },
    { id: "sub6", name: "Apple (別端末)",       amount: 290,  cycle: "monthly", category: "software",      owner: "self",  active: true },
    { id: "sub7", name: "コミュニティサイクル", amount: 660,  cycle: "monthly", category: "fitness",       owner: "self",  active: true },
  ],

  stocks: [
    // 国内株式(現物) — NISA成長投資枠 (株数は損益額から逆算)
    { id: "s1",  ticker: "1605.T",  name: "INPEX",                    shares: 10, avgCost: 2041,  category: "nisa",     owner: "self" },
    { id: "s2",  ticker: "1802.T",  name: "大林組",                   shares: 2,  avgCost: 1938,  category: "nisa",     owner: "self" },
    { id: "s3",  ticker: "2914.T",  name: "日本たばこ産業(JT)",       shares: 5,  avgCost: 4343,  category: "dividend", owner: "self" },
    { id: "s4",  ticker: "3003.T",  name: "ヒューリック",             shares: 10, avgCost: 1460,  category: "dividend", owner: "self" },
    { id: "s5",  ticker: "4205.T",  name: "日本ゼオン",               shares: 4,  avgCost: 1630,  category: "nisa",     owner: "self" },
    { id: "s6",  ticker: "4248.T",  name: "竹本容器",                 shares: 1,  avgCost: 847,   category: "nisa",     owner: "self" },
    { id: "s7",  ticker: "4503.T",  name: "アステラス製薬",           shares: 5,  avgCost: 1635,  category: "nisa",     owner: "self" },
    { id: "s8",  ticker: "5911.T",  name: "横河ブリッジHD",           shares: 10, avgCost: 2923,  category: "nisa",     owner: "self" },
    { id: "s9",  ticker: "7267.T",  name: "本田技研工業",             shares: 3,  avgCost: 1316,  category: "nisa",     owner: "self" },
    { id: "s10", ticker: "7272.T",  name: "ヤマハ発動機",             shares: 2,  avgCost: 1108,  category: "dividend", owner: "self" },
    { id: "s11", ticker: "8306.T",  name: "三菱UFJ FG",               shares: 4,  avgCost: 1605,  category: "dividend", owner: "self" },
    { id: "s12", ticker: "8593.T",  name: "三菱HCキャピタル",         shares: 7,  avgCost: 975,   category: "dividend", owner: "self" },
    { id: "s13", ticker: "8725.T",  name: "MS&ADインシュアランスG",   shares: 12, avgCost: 3457,  category: "dividend", owner: "self" },
    { id: "s14", ticker: "9368.T",  name: "キムラユニティー",         shares: 4,  avgCost: 824,   category: "nisa",     owner: "self" },
    { id: "s15", ticker: "9433.T",  name: "KDDI",                     shares: 9,  avgCost: 2476,  category: "dividend", owner: "self" },
    // 投資信託 (shares = 万口数, avgCost = 取得単価/万口)
    { id: "t1",  ticker: "0331187",  name: "eMAXIS Slim 米国株式S&P500[成長]",      shares: 0.15, avgCost: 26792, category: "nisa",  owner: "self" },
    { id: "t2",  ticker: "0331187B", name: "eMAXIS Slim 米国株式S&P500[積立]",      shares: 6.61, avgCost: 33159, category: "trust", owner: "self" },
    { id: "t3",  ticker: "0331118B", name: "日経平均高配当利回り株ファンド",        shares: 0.72, avgCost: 19302, category: "trust", owner: "self" },
    { id: "t4",  ticker: "0312175",  name: "eMAXIS Slim バランス(8資産均等型)",     shares: 3.36, avgCost: 17859, category: "trust", owner: "self" },
    { id: "t5",  ticker: "0331418A", name: "eMAXIS Slim 全世界株式[成長]",          shares: 0.09, avgCost: 22574, category: "nisa",  owner: "self" },
    { id: "t6",  ticker: "0331418B", name: "eMAXIS Slim 全世界株式[積立]",          shares: 4.86, avgCost: 27359, category: "trust", owner: "self" },
    { id: "t7",  ticker: "0317172",  name: "eMAXIS Slim 国内株式(TOPIX)",           shares: 0.94, avgCost: 22263, category: "trust", owner: "self" },
    { id: "t8",  ticker: "89311199", name: "SBI・V・S&P500インデックス",            shares: 0.15, avgCost: 27230, category: "nisa",  owner: "self" },
    { id: "t9",  ticker: "8931123C", name: "SBI日本高配当株式(分配)ファンド",       shares: 2.66, avgCost: 13155, category: "nisa",  owner: "self" },
    { id: "t10", ticker: "89314135", name: "SBI iシェアーズ全世界債券インデックス", shares: 0.78, avgCost: 15383, category: "trust", owner: "self" },
    { id: "t11", ticker: "91312179", name: "楽天・全米株式インデックス・ファンド",  shares: 0.82, avgCost: 31747, category: "trust", owner: "self" },
  ],

  goals: [],
};

localStorage.setItem("asset-journey-v1", JSON.stringify(realData));
console.log("✅ Asset Journey — 実データを設定しました。ページをリロードしてください。");
