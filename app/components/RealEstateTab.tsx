"use client";
import { useState, useMemo } from "react";
import { YearlyRecord, fmt, fmtFull } from "../lib/data";
import { Card, SectionHeader, CustomTooltip } from "./ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props { yearly: YearlyRecord[]; }

export default function RealEstateTab({ yearly }: Props) {
  const latestYear = yearly[yearly.length - 1];
  const currentSavings = latestYear.cash;

  const [price, setPrice]       = useState(45000000);
  const [downPct, setDownPct]   = useState(20);
  const [rate, setRate]         = useState(0.6);
  const [loanYears, setLoanYears] = useState(35);
  const [monthly, setMonthly]   = useState(80000);

  const downPayment = Math.round(price * downPct / 100);
  const loan = price - downPayment;
  const mr = rate / 100 / 12;
  const nP = loanYears * 12;
  const monthlyPayment = mr > 0 ? Math.round(loan * (mr * Math.pow(1 + mr, nP)) / (Math.pow(1 + mr, nP) - 1)) : Math.round(loan / nP);
  const totalPayment = monthlyPayment * nP;
  const totalInterest = totalPayment - loan;

  const gap = downPayment - currentSavings;
  const monthsNeeded = gap > 0 ? Math.ceil(gap / monthly) : 0;
  const targetDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsNeeded);
    return `${d.getFullYear()}年${d.getMonth() + 1}月`;
  }, [monthsNeeded]);

  const projectionData = useMemo(() => {
    const pts: { month: string; 貯蓄残高: number; 目標頭金: number }[] = [];
    const steps = Math.max(monthsNeeded, 12);
    const interval = Math.max(1, Math.floor(steps / 12));
    for (let m = 0; m <= steps; m += interval) {
      pts.push({
        month: `+${m}ヶ月`,
        貯蓄残高: Math.min(currentSavings + monthly * m, downPayment),
        目標頭金: downPayment,
      });
    }
    return pts;
  }, [currentSavings, monthly, downPayment, monthsNeeded]);

  const pct = Math.min(100, Math.round(currentSavings / downPayment * 100));

  const Slider = ({ label, value, set, min, max, step, unit, display }: {
    label: string; value: number; set: (v: number) => void;
    min: number; max: number; step: number; unit: string; display?: string;
  }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa", marginBottom: 6 }}>
        <span>{label}</span>
        <span style={{ color: "#FF6B6B", fontFamily: "monospace", fontWeight: 700 }}>
          {display ?? `${value.toLocaleString()} ${unit}`}
        </span>
      </div>
      <input type="range" value={value} min={min} max={max} step={step}
        onChange={e => set(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#FF6B6B" }} />
    </div>
  );

  return (
    <div>
      <SectionHeader title="不動産購入シミュレーション" sub="頭金達成予測 & ローン試算" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }} className="re-grid">
        <style>{`@media(max-width:640px){.re-grid{grid-template-columns:1fr!important;}}`}</style>

        {/* Sliders */}
        <Card>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 18, fontWeight: 600 }}>条件設定</div>
          <Slider label="物件価格" value={price} set={setPrice} min={10000000} max={100000000} step={500000} unit="円" display={fmt(price)} />
          <Slider label={`頭金割合 (${downPct}%) = ${fmt(downPayment)}`} value={downPct} set={setDownPct} min={5} max={30} step={1} unit="%" />
          <Slider label="金利（年率）" value={rate} set={setRate} min={0.1} max={3.0} step={0.05} unit="%" display={`${rate.toFixed(2)}%`} />
          <Slider label="返済期間" value={loanYears} set={setLoanYears} min={10} max={35} step={1} unit="年" />
          <Slider label="毎月の積立額" value={monthly} set={setMonthly} min={10000} max={300000} step={5000} unit="円" display={`${fmt(monthly)}/月`} />
        </Card>

        {/* Results column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Progress */}
          <Card>
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>頭金達成状況</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: "#888" }}>現在貯蓄（現金）</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#4ECDC4", fontFamily: "monospace" }}>{fmt(currentSavings)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#888" }}>必要頭金</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#FF6B6B", fontFamily: "monospace" }}>{fmt(downPayment)}</div>
              </div>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#4ECDC4,#FF6B6B)", borderRadius: 4, transition: "width 0.4s" }} />
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>{pct}% 達成</div>

            {gap > 0 ? (
              <div style={{ marginTop: 14, padding: "14px 16px", background: "rgba(255,107,107,0.08)", borderRadius: 10, border: "1px solid rgba(255,107,107,0.2)" }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>あと {fmt(gap)} 必要</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#FF6B6B" }}>
                  月{fmt(monthly)}積立 →
                  <span style={{ color: "#FFE66D" }}> {targetDate} 達成</span>
                </div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>約 {monthsNeeded}ヶ月後 / {(monthsNeeded / 12).toFixed(1)}年後</div>
              </div>
            ) : (
              <div style={{ marginTop: 14, padding: "14px 16px", background: "rgba(78,205,196,0.1)", borderRadius: 10, border: "1px solid rgba(78,205,196,0.2)" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#4ECDC4" }}>✅ 頭金達成済み！購入可能です</div>
              </div>
            )}
          </Card>

          {/* Loan breakdown */}
          <Card>
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12, fontWeight: 600 }}>ローン試算</div>
            {[
              { label: "借入額", v: `¥${loan.toLocaleString()}`, color: "#FF6B6B" },
              { label: "月々返済", v: `¥${monthlyPayment.toLocaleString()}`, color: "#4ECDC4" },
              { label: "総返済額", v: `¥${totalPayment.toLocaleString()}`, color: "#FFE66D" },
              { label: "利息合計", v: `¥${totalInterest.toLocaleString()}`, color: "#DDA0DD" },
            ].map(({ label, v, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: 12, color: "#888" }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "monospace" }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Projection chart */}
      <Card>
        <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>積立シミュレーション</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="貯蓄残高" stroke="#4ECDC4" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="目標頭金" stroke="#FF6B6B" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
