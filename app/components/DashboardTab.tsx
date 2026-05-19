"use client";
import { MonthlyRecord, YearlyRecord, SbiAccount, StockHolding, fmt, fmtFull, CHART_COLORS } from "../lib/data";
import { Card, CustomTooltip } from "./ui";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  monthly: MonthlyRecord[];
  yearly: YearlyRecord[];
  accounts: SbiAccount[];
  stocks: StockHolding[];
}

export default function DashboardTab({ monthly, yearly, accounts, stocks }: Props) {
  const latest = monthly[monthly.length - 1];
  const latestYear = yearly[yearly.length - 1];
  const prevYear = yearly[yearly.length - 2];

  const totalInvested = latestYear.cash + latestYear.nisa + latestYear.stock + latestYear.trust;
  const totalGain = latestYear.nisaGain + latestYear.stockGain;
  const totalAssets = totalInvested + totalGain;
  const prevTotal = prevYear.cash + prevYear.nisa + prevYear.stock + prevYear.trust + prevYear.nisaGain + prevYear.stockGain;
  const yoyDiff = totalAssets - prevTotal;

  // Stock portfolio live gain
  const stockGainLive = stocks.reduce((sum, s) => {
    if (!s.currentPrice) return sum;
    return sum + (s.currentPrice - s.avgCost) * s.shares;
  }, 0);

  const lineData = yearly.map(y => ({
    year: y.year,
    総資産: y.cash + y.nisa + y.stock + y.trust + y.nisaGain + y.stockGain,
    元金合計: y.cash + y.nisa + y.stock + y.trust,
  }));

  const pieData = [
    { name: "現金", value: latestYear.cash },
    { name: "NISA", value: latestYear.nisa },
    { name: "高配当株", value: latestYear.stock },
    { name: "投資信託", value: latestYear.trust },
  ];

  const cf = latest ? latest.income - latest.expense : 0;

  const kpis = [
    { label: "総資産（推計）", value: fmt(totalAssets), sub: `前年比 ${yoyDiff >= 0 ? "+" : ""}${fmt(yoyDiff)}`, color: "#FF6B6B" },
    { label: "含み益合計", value: fmt(totalGain), sub: stockGainLive !== 0 ? `株価連動: ${fmtFull(stockGainLive)}` : "NISA + 高配当株", color: "#4ECDC4" },
    { label: latest ? `${latest.month} 収支` : "最新収支", value: fmtFull(cf), sub: latest ? `残高 ${fmt(latest.balance)}` : "-", color: "#FFE66D" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }} className="kpi-grid">
        <style>{`@media(max-width:640px){.kpi-grid{grid-template-columns:1fr!important;}}`}</style>
        {kpis.map((c, i) => (
          <Card key={i}>
            <div style={{ fontSize: 10, color: "#888", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, fontFamily: "monospace", letterSpacing: "-0.02em" }}>{c.value}</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>{c.sub}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }} className="chart-grid">
        <style>{`@media(max-width:768px){.chart-grid{grid-template-columns:1fr!important;}}`}</style>
        <Card>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 16, fontWeight: 600 }}>総資産推移</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="総資産" stroke="#FF6B6B" strokeWidth={2.5} dot={{ fill: "#FF6B6B", r: 4 }} />
              <Line type="monotone" dataKey="元金合計" stroke="#4ECDC4" strokeWidth={2} strokeDasharray="5 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 16, fontWeight: 600 }}>資産配分</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={75} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#888" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* SBI Accounts */}
      <Card>
        <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>SBI住信 目的別口座</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {accounts.map((a, i) => (
            <div key={i} style={{
              flex: "1 1 130px", background: "rgba(255,255,255,0.04)",
              borderRadius: 10, border: `1px solid ${a.color}44`, padding: "14px 14px 12px",
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{a.icon}</div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: a.color, fontFamily: "monospace" }}>{fmt(a.balance)}</div>
              {a.target && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, Math.round(a.balance / a.target * 100))}%`,
                      background: a.color, borderRadius: 2,
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>
                    {Math.min(100, Math.round(a.balance / a.target * 100))}% / 目標{fmt(a.target)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
