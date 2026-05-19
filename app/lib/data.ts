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
  { name: "生活防衛費",  balance: 500000,  color: "#4ECDC4", icon: "🛡️" },
  { name: "家購入積立",  balance: 1200000, color: "#FF6B6B", icon: "🏠", target: 7000000 },
  { name: "教育費",      balance: 300000,  color: "#FFE66D", icon: "🎓", target: 1000000 },
  { name: "旅行費",      balance: 100000,  color: "#A8E6CF", icon: "✈️", target: 300000 },
  { name: "車買替",      balance: 200000,  color: "#DDA0DD", icon: "🚗", target: 500000 },
];

export const INITIAL_STOCKS: StockHolding[] = [
  { id: "s1", ticker: "7203.T", name: "トヨタ自動車", shares: 100, avgCost: 2800, category: "dividend" },
  { id: "s2", ticker: "8306.T", name: "三菱UFJ FG", shares: 500, avgCost: 1100, category: "dividend" },
  { id: "s3", ticker: "2914.T", name: "JT", shares: 200, avgCost: 2600, category: "dividend" },
  { id: "s4", ticker: "0331418A.T", name: "eMAXIS Slim全世界株式", shares: 50, avgCost: 18000, category: "nisa" },
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
}

export const loadState = (): AppState => {
  if (typeof window === "undefined") return {
    monthly: INITIAL_MONTHLY,
    yearly: INITIAL_YEARLY,
    accounts: INITIAL_ACCOUNTS,
    stocks: INITIAL_STOCKS,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no data");
    return JSON.parse(raw);
  } catch {
    return {
      monthly: INITIAL_MONTHLY,
      yearly: INITIAL_YEARLY,
      accounts: INITIAL_ACCOUNTS,
      stocks: INITIAL_STOCKS,
    };
  }
};

export const saveState = (state: AppState) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
