import { supabase } from "./client";
import type {
  MonthlyRecord, YearlyRecord, SbiAccount, StockHolding,
  NisaRecord, LifeEvent, Subscription, AssetGoal, MemberConfig, AppState
} from "@/app/lib/data";

// ─── Fetch All ─────────────────────────────────────────────────────────────────

export async function fetchAppState(householdId: string): Promise<Partial<AppState>> {
  const [
    { data: monthly },
    { data: yearly },
    { data: accounts },
    { data: stocks },
    { data: nisa },
    { data: events },
    { data: subscriptions },
    { data: goals },
    { data: memberRow },
  ] = await Promise.all([
    supabase.from("monthly_records").select("*").eq("household_id", householdId).order("year").order("month"),
    supabase.from("yearly_records").select("*").eq("household_id", householdId).order("year"),
    supabase.from("sbi_accounts").select("*").eq("household_id", householdId).order("sort_order"),
    supabase.from("stock_holdings").select("*").eq("household_id", householdId),
    supabase.from("nisa_records").select("*").eq("household_id", householdId).order("year"),
    supabase.from("life_events").select("*").eq("household_id", householdId).order("year"),
    supabase.from("subscriptions").select("*").eq("household_id", householdId),
    supabase.from("asset_goals").select("*").eq("household_id", householdId),
    supabase.from("member_config").select("*").eq("household_id", householdId).single(),
  ]);

  return {
    monthly: (monthly ?? []).map(r => ({
      month: `${r.year}/${String(r.month).padStart(2, "0")}`,
      income: r.income, expense: r.expense, balance: r.balance,
    })) as MonthlyRecord[],

    yearly: (yearly ?? []).map(r => ({
      year: String(r.year),
      cash: r.cash, nisa: r.nisa, stock: r.stock, trust: r.trust,
      nisaGain: r.nisa_gain, stockGain: r.stock_gain,
    })) as YearlyRecord[],

    accounts: (accounts ?? []).map(r => ({
      name: r.name, balance: r.balance, color: r.color, icon: r.icon,
      target: r.target, owner: r.owner,
    })) as SbiAccount[],

    stocks: (stocks ?? []).map(r => ({
      id: r.id, ticker: r.ticker, name: r.name, shares: r.shares,
      avgCost: r.avg_cost, category: r.category, owner: r.owner,
      currentPrice: r.current_price, lastUpdated: r.last_updated,
    })) as StockHolding[],

    nisa: (nisa ?? []).map(r => ({
      year: String(r.year),
      growthUsed: r.growth_used, accumulationUsed: r.accumulation_used,
    })) as NisaRecord[],

    events: (events ?? []).map(r => ({
      id: r.id, year: r.year, title: r.title, amount: r.amount,
      category: r.category, note: r.note,
    })) as LifeEvent[],

    subscriptions: (subscriptions ?? []).map(r => ({
      id: r.id, name: r.name, amount: r.amount, cycle: r.cycle,
      category: r.category, owner: r.owner, note: r.note, active: r.active,
    })) as Subscription[],

    goals: (goals ?? []).map(r => ({
      id: r.id, title: r.title, targetAmount: r.target_amount,
      targetAge: r.target_age, currentAge: r.current_age,
      monthlyInvestment: r.monthly_investment, expectedReturn: r.expected_return,
      color: r.color,
    })) as AssetGoal[],

    members: memberRow
      ? { selfName: memberRow.self_name, partnerName: memberRow.partner_name }
      : { selfName: "壮汰", partnerName: "かい" },
  };
}

// ─── Sync helpers (full-replace per table) ─────────────────────────────────────

export async function syncMonthly(householdId: string, records: MonthlyRecord[]) {
  await supabase.from("monthly_records").delete().eq("household_id", householdId);
  if (records.length === 0) return;
  const rows = records.map(r => {
    const [year, month] = r.month.split("/").map(Number);
    return { household_id: householdId, year, month, income: r.income, expense: r.expense, balance: r.balance };
  });
  await supabase.from("monthly_records").insert(rows);
}

export async function syncYearly(householdId: string, records: YearlyRecord[]) {
  await supabase.from("yearly_records").delete().eq("household_id", householdId);
  if (records.length === 0) return;
  const rows = records.map(r => ({
    household_id: householdId, year: Number(r.year),
    cash: r.cash, nisa: r.nisa, stock: r.stock, trust: r.trust,
    nisa_gain: r.nisaGain, stock_gain: r.stockGain,
  }));
  await supabase.from("yearly_records").insert(rows);
}

export async function syncAccounts(householdId: string, accounts: SbiAccount[]) {
  await supabase.from("sbi_accounts").delete().eq("household_id", householdId);
  if (accounts.length === 0) return;
  const rows = accounts.map((a, i) => ({
    household_id: householdId, name: a.name, balance: a.balance,
    target: a.target ?? 0, color: a.color, icon: a.icon,
    owner: a.owner ?? "joint", sort_order: i,
  }));
  await supabase.from("sbi_accounts").insert(rows);
}

export async function syncStocks(householdId: string, stocks: StockHolding[]) {
  await supabase.from("stock_holdings").delete().eq("household_id", householdId);
  if (stocks.length === 0) return;
  const rows = stocks.map(s => ({
    id: s.id, household_id: householdId, ticker: s.ticker, name: s.name,
    shares: s.shares, avg_cost: s.avgCost, category: s.category,
    owner: s.owner ?? "self", current_price: s.currentPrice ?? null,
    last_updated: s.lastUpdated ?? null,
  }));
  await supabase.from("stock_holdings").insert(rows);
}

export async function syncNisa(householdId: string, records: NisaRecord[]) {
  await supabase.from("nisa_records").delete().eq("household_id", householdId);
  if (records.length === 0) return;
  const rows = records.map(r => ({
    household_id: householdId, year: Number(r.year),
    growth_used: r.growthUsed, accumulation_used: r.accumulationUsed,
  }));
  await supabase.from("nisa_records").insert(rows);
}

export async function syncEvents(householdId: string, events: LifeEvent[]) {
  await supabase.from("life_events").delete().eq("household_id", householdId);
  if (events.length === 0) return;
  const rows = events.map(e => ({
    id: e.id, household_id: householdId, year: e.year, title: e.title,
    amount: e.amount, category: e.category, note: e.note ?? null,
  }));
  await supabase.from("life_events").insert(rows);
}

export async function syncSubscriptions(householdId: string, subs: Subscription[]) {
  await supabase.from("subscriptions").delete().eq("household_id", householdId);
  if (subs.length === 0) return;
  const rows = subs.map(s => ({
    id: s.id, household_id: householdId, name: s.name, amount: s.amount,
    cycle: s.cycle, category: s.category, owner: s.owner ?? "self",
    note: s.note ?? null, active: s.active,
  }));
  await supabase.from("subscriptions").insert(rows);
}

export async function syncGoals(householdId: string, goals: AssetGoal[]) {
  await supabase.from("asset_goals").delete().eq("household_id", householdId);
  if (goals.length === 0) return;
  const rows = goals.map(g => ({
    id: g.id, household_id: householdId, title: g.title,
    target_amount: g.targetAmount, target_age: g.targetAge,
    current_age: g.currentAge, monthly_investment: g.monthlyInvestment,
    expected_return: g.expectedReturn, color: g.color,
  }));
  await supabase.from("asset_goals").insert(rows);
}

export async function syncMembers(householdId: string, members: MemberConfig) {
  await supabase.from("member_config").upsert({
    household_id: householdId,
    self_name: members.selfName,
    partner_name: members.partnerName,
    updated_at: new Date().toISOString(),
  }, { onConflict: "household_id" });
}

// ─── Dispatch sync by key ──────────────────────────────────────────────────────

export async function syncKey(
  key: keyof import("@/app/lib/data").AppState,
  householdId: string,
  value: unknown
) {
  switch (key) {
    case "monthly":     return syncMonthly(householdId, value as MonthlyRecord[]);
    case "yearly":      return syncYearly(householdId, value as YearlyRecord[]);
    case "accounts":    return syncAccounts(householdId, value as SbiAccount[]);
    case "stocks":      return syncStocks(householdId, value as StockHolding[]);
    case "nisa":        return syncNisa(householdId, value as NisaRecord[]);
    case "events":      return syncEvents(householdId, value as LifeEvent[]);
    case "subscriptions": return syncSubscriptions(householdId, value as Subscription[]);
    case "goals":       return syncGoals(householdId, value as AssetGoal[]);
    case "members":     return syncMembers(householdId, value as MemberConfig);
  }
}
