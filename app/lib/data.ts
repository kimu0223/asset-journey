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

export const INITIAL_MONTHLY: MonthlyRecord[] = [
  { month: "2025/01", income: 420000, expense: 310000, balance: 2100000 },
  { month: "2025/02", income: 420000, expense: 295000, balance: 2225000 },
  { month: "2025/03", income: 450000, expense: 320000, balance: 2355000 },
  { month: "2025/04", income: 420000, expense: 300000, balance: 2475000 },
  { month: "2025/05", income: 420000, expense: 315000, balance: 2580000 },
  { month: "2025/06", income: 500000, expense: 310000, balance: 2770000 },
  { month: "2025/07", income: 420000, expense: 330000, balance: 2860000 },
  { month: "2025/08", income: 420000, expense: 305000, balance: 2975000 },
  { month: "2025/09", income: 420000, expense: 298000, balance: 3097000 },
  { month: "2025/10", income: 420000, expense: 312000, balance: 3205000 },
  { month: "2025/11", income: 420000, expense: 290000, balance: 3335000 },
  { month: "2025/12", income: 550000, expense: 380000, balance: 3505000 },
  { month: "2026/01", income: 420000, expense: 310000, balance: 3615000 },
  { month: "2026/02", income: 420000, expense: 295000, balance: 3740000 },
  { month: "2026/03", income: 420000, expense: 320000, balance: 3840000 },
  { month: "2026/04", income: 420000, expense: 305000, balance: 3955000 },
  { month: "2026/05", income: 420000, expense: 310000, balance: 4065000 },
];

export const INITIAL_YEARLY: YearlyRecord[] = [
  { year: "2022", cash: 800000,  nisa: 200000,  stock: 150000,  trust: 100000, nisaGain: 12000,  stockGain: 8000  },
  { year: "2023", cash: 1100000, nisa: 500000,  stock: 280000,  trust: 200000, nisaGain: 45000,  stockGain: 22000 },
  { year: "2024", cash: 1600000, nisa: 900000,  stock: 450000,  trust: 350000, nisaGain: 102000, stockGain: 58000 },
  { year: "2025", cash: 2200000, nisa: 1400000, stock: 650000,  trust: 520000, nisaGain: 198000, stockGain: 95000 },
  { year: "2026", cash: 2800000, nisa: 1900000, stock: 820000,  trust: 710000, nisaGain: 310000, stockGain: 140000 },
];

export const INITIAL_ACCOUNTS: SbiAccount[] = [
  { name: "生活防衛費",  balance: 500000,  color: "#4ECDC4", icon: "🛡️", owner: "joint" },
  { name: "家購入積立",  balance: 1200000, color: "#FF6B6B", icon: "🏠", target: 7000000, owner: "joint" },
  { name: "教育費",      balance: 300000,  color: "#FFE66D", icon: "🎓", target: 1000000, owner: "joint" },
  { name: "旅行費",      balance: 100000,  color: "#A8E6CF", icon: "✈️", target: 300000, owner: "joint" },
  { name: "車買替",      balance: 200000,  color: "#DDA0DD", icon: "🚗", target: 500000, owner: "joint" },
];

export const INITIAL_NISA: NisaRecord[] = [
  { year: "2024", growthUsed: 120, accumulationUsed: 100 },
  { year: "2025", growthUsed: 180, accumulationUsed: 120 },
  { year: "2026", growthUsed: 80,  accumulationUsed: 60  },
];

export const INITIAL_EVENTS: LifeEvent[] = [
  { id: "e1", year: 2027, title: "第一子 小学校入学", amount: 200000, category: "education", note: "ランドセル・制服等" },
  { id: "e2", year: 2028, title: "車の買い替え", amount: 2500000, category: "vehicle", note: "軽自動車→ミニバン" },
  { id: "e3", year: 2030, title: "住宅購入（予定）", amount: 50000000, category: "housing", note: "頭金1000万+諸費用" },
  { id: "e4", year: 2033, title: "第一子 中学校入学", amount: 300000, category: "education" },
  { id: "e5", year: 2027, title: "家族旅行（ハワイ）", amount: 600000, category: "travel" },
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: "sub1", name: "Netflix", amount: 1490, cycle: "monthly", category: "entertainment", owner: "joint", active: true },
  { id: "sub2", name: "Spotify Family", amount: 1580, cycle: "monthly", category: "music", owner: "joint", active: true },
  { id: "sub3", name: "Amazon Prime", amount: 600, cycle: "monthly", category: "entertainment", owner: "joint", active: true },
  { id: "sub4", name: "iCloud 50GB", amount: 130, cycle: "monthly", category: "software", owner: "self", active: true },
  { id: "sub5", name: "Adobe CC", amount: 3280, cycle: "monthly", category: "software", owner: "self", active: true },
  { id: "sub6", name: "Apple One", amount: 1200, cycle: "monthly", category: "entertainment", owner: "partner", active: true },
  { id: "sub7", name: "ジム会費", amount: 8800, cycle: "monthly", category: "fitness", owner: "self", active: false },
];

export const INITIAL_STOCKS: StockHolding[] = [
  { id: "s1", ticker: "7203.T", name: "トヨタ自動車", shares: 100, avgCost: 2800, category: "dividend", owner: "joint" },
  { id: "s2", ticker: "8306.T", name: "三菱UFJ FG", shares: 500, avgCost: 1100, category: "dividend", owner: "joint" },
  { id: "s3", ticker: "2914.T", name: "JT", shares: 200, avgCost: 2600, category: "dividend", owner: "joint" },
  { id: "s4", ticker: "0331418A.T", name: "eMAXIS Slim全世界株式", shares: 50, avgCost: 18000, category: "nisa", owner: "joint" },
];

export const INITIAL_GOALS: AssetGoal[] = [
  { id: "g1", title: "老後資産 1億円", targetAmount: 100000000, targetAge: 60, currentAge: 35, monthlyInvestment: 50000, expectedReturn: 5, color: "#FF6B6B" },
  { id: "g2", title: "子供の教育費", targetAmount: 10000000, targetAge: 50, currentAge: 35, monthlyInvestment: 30000, expectedReturn: 3, color: "#4ECDC4" },
];

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

export const DEFAULT_MEMBERS: MemberConfig = { selfName: "自分", partnerName: "パートナー" };

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
