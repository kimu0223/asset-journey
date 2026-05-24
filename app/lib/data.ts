// ─── Types ───────────────────────────────────────────────────────────────────

export interface MonthlyRecord {
  month: string;      // "2026/05"
  income: number;
  expense: number;
  balance: number;
}

export interface YearlyRecord {
  year: string;
  cash: number;
  nisa: number;
  stock: number;
  trust: number;
  nisaGain: number;
  stockGain: number;
}

export interface SbiAccount {
  name: string;
  balance: number;
  color: string;
  icon: string;
  target?: number;
  owner?: "self" | "partner" | "joint";
}

export interface StockHolding {
  id: string;
  ticker: string;      // e.g. "7203.T" or "AAPL"
  name: string;
  shares: number;
  avgCost: number;     // 平均取得単価
  category: "nisa" | "dividend" | "trust" | "other";
  currentPrice?: number;
  lastUpdated?: string;
  owner?: "self" | "partner" | "joint";
}

export interface NisaRecord {
  year: string;           // "2024", "2025", "2026"
  growthUsed: number;     // 成長投資枠 使用額（万円）
  accumulationUsed: number; // 積立枠 使用額（万円）
}

export interface LifeEvent {
  id: string;
  year: number;        // 発生年（例: 2027）
  title: string;       // イベント名
  amount: number;      // 費用（正の整数、円）
  category: "education" | "housing" | "vehicle" | "travel" | "wedding" | "other";
  note?: string;       // メモ（任意）
}

export interface MemberConfig {
  selfName: string;    // デフォルト "自分"
  partnerName: string; // デフォルト "パートナー"
}

export interface Subscription {
  id: string;
  name: string;             // サービス名（例: "Netflix"）
  amount: number;           // 金額（円）
  cycle: "monthly" | "yearly"; // 請求サイクル
  category: "entertainment" | "music" | "software" | "fitness" | "education" | "other";
  owner?: "self" | "partner" | "joint";
  note?: string;            // メモ（任意）
  active: boolean;          // 有効/無効切り替え
}

export interface AssetGoal {
  id: string;
  title: string;             // 例: "老後資産1億円"
  targetAmount: number;      // 目標金額（円）
  targetAge: number;         // 達成目標年齢
  currentAge: number;        // 現在の年齢
  monthlyInvestment: number; // 毎月の投資額（円）
  expectedReturn: number;    // 想定年利（%）
  color: string;             // カラー（カードの差別化）
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

// 2026年5月時点の実データ
export const INITIAL_MONTHLY: MonthlyRecord[] = [];

export const INITIAL_YEARLY: YearlyRecord[] = [
  {
    year: "2026",
    cash:      1488590,  // SMBC(Olive普通52139+定期90000+りぽん10000+豊洲普通68514) + 住信SBI(1267937)
    nisa:      247609,   // SBI証券 NISA成長 国内株式(現物)
    stock:     0,        // 非NISA個別株 なし
    trust:     691875,   // SBI証券 投資信託合計
    nisaGain:  55763,    // NISA成長株式 含み益
    stockGain: 0,
  },
];

export const INITIAL_ACCOUNTS: SbiAccount[] = [
  { name: "旅行",               balance: 58749,  color: "#4ECDC4", icon: "✈️",  target: 500000,  owner: "joint" },
  { name: "美容室",             balance: 11561,  color: "#DDA0DD", icon: "💇",  target: 100000,  owner: "self"  },
  { name: "奨学金返済積立",     balance: 293520, color: "#FF6B6B", icon: "🏫",  target: 1000000, owner: "self"  },
  { name: "家の初期費用",       balance: 504580, color: "#FFE66D", icon: "🏠",  target: 500000,  owner: "joint" },
  { name: "特別費",             balance: 333,    color: "#A8E6CF", icon: "⛵",  target: 2000000, owner: "joint" },
  { name: "志樹",               balance: 236431, color: "#96CEB4", icon: "💰",  target: 2000000, owner: "joint" },
  { name: "何か欲しい代",       balance: 4007,   color: "#F7DC6F", icon: "💻",  target: 4000000, owner: "self"  },
  { name: "志樹のミルク・その他", balance: 6532, color: "#85C1E9", icon: "🍼",  target: 500000,  owner: "joint" },
  { name: "お米",               balance: 41051,  color: "#82E0AA", icon: "🍚",  target: 100000,  owner: "joint" },
];

export const INITIAL_NISA: NisaRecord[] = [
  { year: "2026", growthUsed: 5.2, accumulationUsed: 11.25 },
];

export const INITIAL_EVENTS: LifeEvent[] = [];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: "sub1", name: "Claude.ai",             amount: 3639, cycle: "monthly", category: "software",      owner: "self",  active: true },
  { id: "sub2", name: "Apple (iCloud等)",      amount: 630,  cycle: "monthly", category: "software",      owner: "self",  active: true },
  { id: "sub3", name: "Amazonプライム",        amount: 600,  cycle: "monthly", category: "entertainment", owner: "joint", active: true },
  { id: "sub4", name: "SBI生命保険",           amount: 1540, cycle: "monthly", category: "other",         owner: "self",  active: true },
  { id: "sub5", name: "楽天モバイル",          amount: 5385, cycle: "monthly", category: "other",         owner: "self",  active: true },
  { id: "sub6", name: "Apple (別端末)",        amount: 290,  cycle: "monthly", category: "software",      owner: "self",  active: true },
  { id: "sub7", name: "コミュニティサイクル",  amount: 660,  cycle: "monthly", category: "fitness",       owner: "self",  active: true },
];

export const INITIAL_STOCKS: StockHolding[] = [
  // ── 国内株式(現物) NISA成長投資枠 ──────────────────────────────────────────
  // 株数は評価損益額 ÷ 1株あたり損益で逆算
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

  // ── 投資信託 (shares = 万口数, avgCost = 取得単価/万口) ────────────────────
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
];

export const INITIAL_GOALS: AssetGoal[] = [];

// ─── Chart Colors ─────────────────────────────────────────────────────────────
export const CHART_COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF", "#DDA0DD", "#96CEB4"];

// ─── Formatters ───────────────────────────────────────────────────────────────
export const fmt = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 100000000) return `${sign}¥${(abs / 100000000).toFixed(1)}億`;
  if (abs >= 10000) return `${sign}¥${Math.floor(abs / 10000).toLocaleString()}万`;
  return `${sign}¥${abs.toLocaleString()}`;
};

export const fmtFull = (n: number): string => {
  const sign = n < 0 ? "-" : n > 0 ? "+" : "";
  return `${sign}¥${Math.abs(n).toLocaleString()}`;
};

export const fmtPlain = (n: number): string => `¥${n.toLocaleString()}`;

// ─── Storage Key ──────────────────────────────────────────────────────────────
export const STORAGE_KEY = "asset-journey-v1";

export interface AppState {
  monthly: MonthlyRecord[];
  yearly: YearlyRecord[];
  accounts: SbiAccount[];
  stocks: StockHolding[];
  nisa: NisaRecord[];
  events: LifeEvent[];
  members: MemberConfig;
  subscriptions: Subscription[];
  goals: AssetGoal[];
}

export const DEFAULT_MEMBERS: MemberConfig = { selfName: "壮汰", partnerName: "パートナー" };

export const loadState = (): AppState => {
  const defaults: AppState = {
    monthly: INITIAL_MONTHLY,
    yearly: INITIAL_YEARLY,
    accounts: INITIAL_ACCOUNTS,
    stocks: INITIAL_STOCKS,
    nisa: INITIAL_NISA,
    events: INITIAL_EVENTS,
    members: DEFAULT_MEMBERS,
    subscriptions: INITIAL_SUBSCRIPTIONS,
    goals: INITIAL_GOALS,
  };
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no data");
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // 既存データに各フィールドが存在しない場合にフォールバック
    return {
      ...defaults,
      ...parsed,
      nisa: parsed.nisa ?? INITIAL_NISA,
      events: parsed.events ?? INITIAL_EVENTS,
      members: parsed.members ?? DEFAULT_MEMBERS,
      subscriptions: parsed.subscriptions ?? INITIAL_SUBSCRIPTIONS,
      goals: parsed.goals ?? INITIAL_GOALS,
    };
  } catch {
    return defaults;
  }
};

export const saveState = (state: AppState) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
