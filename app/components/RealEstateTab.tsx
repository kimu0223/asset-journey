"use client";
import { useState, useMemo } from "react";
import { YearlyRecord, fmt } from "../lib/data";
import { Card, SectionHeader, CustomTooltip } from "./ui";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Props { yearly: YearlyRecord[]; }

// ─── Local Slider component ────────────────────────────────────────────────────
function Slider({
  label, value, set, min, max, step, unit, display,
}: {
  label: string; value: number; set: (v: number) => void;
  min: number; max: number; step: number; unit: string; display?: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa", marginBottom: 6 }}>
        <span>{label}</span>
        <span style={{ color: "#FF6B6B", fontFamily: "monospace", fontWeight: 700 }}>
          {display ?? `${value.toLocaleString()} ${unit}`}
        </span>
      </div>
      <input
        type="range" value={value} min={min} max={max} step={step}
        onChange={e => set(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#FF6B6B" }}
      />
    </div>
  );
}

// ─── Section toggle button ────────────────────────────────────────────────────
function SectionBtn({
  id, active, label, onClick,
}: {
  id: string; active: boolean; label: string; onClick: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        flexShrink: 0,
        padding: "8px 16px",
        borderRadius: 8,
        border: active ? "1.5px solid #FF6B6B" : "1.5px solid rgba(255,255,255,0.1)",
        background: active ? "rgba(255,107,107,0.12)" : "rgba(255,255,255,0.04)",
        color: active ? "#FF6B6B" : "#888",
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "'Noto Sans JP', sans-serif",
        transition: "all 0.2s",
      }}
    >
      {label}
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function RealEstateTab({ yearly }: Props) {
  const latestYear = yearly[yearly.length - 1];
  if (!latestYear) return <div style={{color:"#555",padding:40,textAlign:"center"}}>年次資産データを追加してください</div>;
  const currentSavings = latestYear.cash;

  // ── Section state
  type SectionId = "basic" | "costs" | "comparison" | "tax";
  const [activeSection, setActiveSection] = useState<SectionId>("basic");

  // ── Section 1: Basic
  const [price, setPrice]           = useState(45000000);
  const [downPct, setDownPct]       = useState(20);
  const [rate, setRate]             = useState(0.6);
  const [loanYears, setLoanYears]   = useState(35);
  const [monthlySave, setMonthlySave] = useState(80000);
  const [rateType, setRateType]     = useState<"fixed" | "variable">("fixed");

  // ── Section 2: Running costs
  const [mgmtFee, setMgmtFee]       = useState(15000);
  const [repairFee, setRepairFee]   = useState(10000);
  const [propTax, setPropTax]       = useState(150000);
  const [insurance, setInsurance]   = useState(30000);

  // ── Section 3: Rent vs Buy
  const [rentMonthly, setRentMonthly]   = useState(100000);
  const [rentRiseRate, setRentRiseRate] = useState(0);

  // ── Section 4: Tax deduction
  const [annualIncome, setAnnualIncome] = useState(600);
  const [houseType, setHouseType]       = useState<"新築" | "中古">("新築");

  // ── Derived: loan basics (shared across sections)
  const downPayment     = Math.round(price * downPct / 100);
  const loan            = price - downPayment;
  const mr              = rate / 100 / 12;
  const nP              = loanYears * 12;
  const monthlyPayment  = mr > 0
    ? Math.round(loan * (mr * Math.pow(1 + mr, nP)) / (Math.pow(1 + mr, nP) - 1))
    : Math.round(loan / nP);
  const totalPayment    = monthlyPayment * nP;
  const totalInterest   = totalPayment - loan;

  // ── Section 1: progress
  const gap          = downPayment - currentSavings;
  const monthsNeeded = gap > 0 ? Math.ceil(gap / monthlySave) : 0;
  const targetDate   = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsNeeded);
    return `${d.getFullYear()}年${d.getMonth() + 1}月`;
  }, [monthsNeeded]);

  const projectionData = useMemo(() => {
    const pts: { month: string; 貯蓄残高: number; 目標頭金: number }[] = [];
    const steps    = Math.max(monthsNeeded, 12);
    const interval = Math.max(1, Math.floor(steps / 12));
    for (let m = 0; m <= steps; m += interval) {
      pts.push({
        month: `+${m}ヶ月`,
        貯蓄残高: Math.min(currentSavings + monthlySave * m, downPayment),
        目標頭金: downPayment,
      });
    }
    return pts;
  }, [currentSavings, monthlySave, downPayment, monthsNeeded]);

  const pct = downPayment === 0 ? 0 : Math.min(100, Math.round(currentSavings / downPayment * 100));

  // ── Section 2: running cost totals
  const runningMonthly = mgmtFee + repairFee + Math.round((propTax + insurance) / 12);
  const runningYearly  = (mgmtFee + repairFee) * 12 + propTax + insurance;
  const totalMonthly   = monthlyPayment + mgmtFee + repairFee + Math.round((propTax + insurance) / 12);

  // ── Section 3: 35-year comparison
  const comparisonData = useMemo(() => {
    const pts: { year: string; 購入累積: number; 賃貸累積: number }[] = [];
    const annualLoan     = monthlyPayment * 12;
    const annualRunning  = (mgmtFee + repairFee) * 12 + propTax + insurance;

    let rentCumul = 0;
    let buyUpfront = downPayment;

    for (let y = 1; y <= 35; y++) {
      buyUpfront += annualLoan + annualRunning;
      const rentThisYear = rentMonthly * 12 * Math.pow(1 + rentRiseRate / 100, y - 1);
      rentCumul += rentThisYear;
      pts.push({
        year: `${y}年`,
        購入累積: Math.round(buyUpfront),
        賃貸累積: Math.round(rentCumul),
      });
    }
    return pts;
  }, [downPayment, monthlyPayment, mgmtFee, repairFee, propTax, insurance, rentMonthly, rentRiseRate]);

  const buy35  = comparisonData[34]?.購入累積 ?? 0;
  const rent35 = comparisonData[34]?.賃貸累積 ?? 0;
  const diff35 = rent35 - buy35;

  // ── Section 4: mortgage tax deduction
  const taxRows = useMemo(() => {
    const maxDeductionPerYear = houseType === "新築" ? 350000 : 210000;
    // annualIncome による実効税率上限（簡易計算）
    const incomeLimit = annualIncome <= 500
      ? annualIncome * 10000 * 0.05
      : annualIncome <= 800
        ? annualIncome * 10000 * 0.10
        : annualIncome * 10000 * 0.20;
    const rows: { year: number; balance: number; deduction: number }[] = [];
    let balance = loan;
    let total   = 0;
    for (let y = 1; y <= 13; y++) {
      if (balance <= 0) break;
      const raw       = Math.round(balance * 0.007);
      const deduction = Math.min(raw, maxDeductionPerYear, incomeLimit);
      total += deduction;
      rows.push({ year: y, balance: Math.round(balance), deduction });
      // Approximate annual principal repayment
      const annualPrincipal = (loan / nP) * 12;
      balance -= annualPrincipal;
    }
    return { rows, total };
  }, [loan, houseType, nP, annualIncome]);

  const effectivePrice = price - taxRows.total;

  // ── Section labels
  const sections: { id: SectionId; label: string }[] = [
    { id: "basic",      label: "基本試算" },
    { id: "costs",      label: "ランニングコスト" },
    { id: "comparison", label: "賃貸vs購入" },
    { id: "tax",        label: "住宅ローン控除" },
  ];

  return (
    <div>
      <SectionHeader title="不動産購入シミュレーション" sub="基本試算 / ランニングコスト / 賃貸比較 / ローン控除" />

      {/* Section selector */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 24, paddingBottom: 4 }}>
        {sections.map(s => (
          <SectionBtn
            key={s.id}
            id={s.id}
            active={activeSection === s.id}
            label={s.label}
            onClick={id => setActiveSection(id as SectionId)}
          />
        ))}
      </div>

      {/* ════════════════════════════════════════════
          Section 1: Basic
      ════════════════════════════════════════════ */}
      {activeSection === "basic" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }} className="re-grid">
            <style>{`@media(max-width:640px){.re-grid{grid-template-columns:1fr!important;}}`}</style>

            {/* Sliders */}
            <Card>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 18, fontWeight: 600 }}>条件設定</div>

              {/* Rate type toggle */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>金利タイプ</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["fixed", "variable"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setRateType(t)}
                      style={{
                        padding: "6px 14px", borderRadius: 6, fontSize: 12,
                        border: rateType === t ? "1.5px solid #FF6B6B" : "1.5px solid rgba(255,255,255,0.1)",
                        background: rateType === t ? "rgba(255,107,107,0.12)" : "rgba(255,255,255,0.04)",
                        color: rateType === t ? "#FF6B6B" : "#888",
                        cursor: "pointer",
                        fontFamily: "'Noto Sans JP', sans-serif",
                      }}
                    >
                      {t === "fixed" ? "固定金利" : "変動金利"}
                    </button>
                  ))}
                </div>
                {rateType === "variable" && (
                  <div style={{
                    marginTop: 10, padding: "8px 12px",
                    background: "rgba(255,230,109,0.08)",
                    border: "1px solid rgba(255,230,109,0.2)",
                    borderRadius: 8, fontSize: 11, color: "#FFE66D",
                  }}>
                    変動金利は5年ルール・125%ルール適用。金利上昇時は未払い利息が発生する場合があります。
                  </div>
                )}
              </div>

              <Slider label="物件価格" value={price} set={setPrice} min={10000000} max={100000000} step={500000} unit="円" display={fmt(price)} />
              <Slider label={`頭金割合 (${downPct}%) = ${fmt(downPayment)}`} value={downPct} set={setDownPct} min={5} max={30} step={1} unit="%" />
              <Slider label="金利（年率）" value={rate} set={setRate} min={0.1} max={3.0} step={0.05} unit="%" display={`${rate.toFixed(2)}%`} />
              <Slider label="返済期間" value={loanYears} set={setLoanYears} min={10} max={35} step={1} unit="年" />
              <Slider label="毎月の積立額" value={monthlySave} set={setMonthlySave} min={10000} max={300000} step={5000} unit="円" display={`${fmt(monthlySave)}/月`} />
            </Card>

            {/* Results */}
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
                      月{fmt(monthlySave)}積立 →
                      <span style={{ color: "#FFE66D" }}> {targetDate} 達成</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>約 {monthsNeeded}ヶ月後 / {(monthsNeeded / 12).toFixed(1)}年後</div>
                  </div>
                ) : (
                  <div style={{ marginTop: 14, padding: "14px 16px", background: "rgba(78,205,196,0.1)", borderRadius: 10, border: "1px solid rgba(78,205,196,0.2)" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#4ECDC4" }}>頭金達成済み！購入可能です</div>
                  </div>
                )}
              </Card>

              {/* Loan breakdown */}
              <Card>
                <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12, fontWeight: 600 }}>ローン試算</div>
                {[
                  { label: "借入額",   v: `¥${loan.toLocaleString()}`,           color: "#FF6B6B" },
                  { label: "月々返済", v: `¥${monthlyPayment.toLocaleString()}`,  color: "#4ECDC4" },
                  { label: "総返済額", v: `¥${totalPayment.toLocaleString()}`,    color: "#FFE66D" },
                  { label: "利息合計", v: `¥${totalInterest.toLocaleString()}`,   color: "#DDA0DD" },
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
      )}

      {/* ════════════════════════════════════════════
          Section 2: Running costs
      ════════════════════════════════════════════ */}
      {activeSection === "costs" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="re-grid">
            <style>{`@media(max-width:640px){.re-grid{grid-template-columns:1fr!important;}}`}</style>

            <Card>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 18, fontWeight: 600 }}>ランニングコスト設定</div>
              <Slider label="管理費（月額）"        value={mgmtFee}    set={setMgmtFee}    min={0} max={50000}  step={1000} unit="円" display={`¥${mgmtFee.toLocaleString()}/月`} />
              <Slider label="修繕積立金（月額）"    value={repairFee}  set={setRepairFee}  min={0} max={30000}  step={1000} unit="円" display={`¥${repairFee.toLocaleString()}/月`} />
              <Slider label="固定資産税（年額）"    value={propTax}    set={setPropTax}    min={0} max={500000} step={5000} unit="円" display={`¥${propTax.toLocaleString()}/年`} />
              <Slider label="火災/地震保険（年額）" value={insurance}  set={setInsurance}  min={0} max={100000} step={1000} unit="円" display={`¥${insurance.toLocaleString()}/年`} />
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Card>
                <div style={{ fontSize: 13, color: "#aaa", marginBottom: 16, fontWeight: 600 }}>コスト集計</div>
                {[
                  { label: "ランニングコスト 月額合計",              v: `¥${runningMonthly.toLocaleString()}`, color: "#FFE66D" },
                  { label: "ランニングコスト 年額合計",              v: `¥${runningYearly.toLocaleString()}`,  color: "#FFE66D" },
                  { label: "ローン返済（月額）",                     v: `¥${monthlyPayment.toLocaleString()}`, color: "#4ECDC4" },
                  { label: "実質月額負担（ローン + ランニング）",    v: `¥${totalMonthly.toLocaleString()}`,   color: "#FF6B6B" },
                ].map(({ label, v, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 12, color: "#888" }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "monospace" }}>{v}</span>
                  </div>
                ))}
              </Card>

              <Card style={{ background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.18)" }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>実質月額負担</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#FF6B6B", fontFamily: "monospace" }}>
                  ¥{totalMonthly.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>年額: ¥{(totalMonthly * 12).toLocaleString()}</div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          Section 3: Rent vs Buy
      ════════════════════════════════════════════ */}
      {activeSection === "comparison" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }} className="re-grid">
            <style>{`@media(max-width:640px){.re-grid{grid-template-columns:1fr!important;}}`}</style>

            <Card>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 18, fontWeight: 600 }}>賃貸条件設定</div>
              <Slider
                label="現在の家賃（月額）" value={rentMonthly} set={setRentMonthly}
                min={50000} max={300000} step={5000} unit="円"
                display={`¥${rentMonthly.toLocaleString()}/月`}
              />
              <Slider
                label="家賃上昇率（年率）" value={rentRiseRate} set={setRentRiseRate}
                min={0} max={3} step={0.1} unit="%"
                display={`${rentRiseRate.toFixed(1)}%`}
              />
              <div style={{ marginTop: 20, padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 10, fontSize: 11, color: "#888" }}>
                <div style={{ marginBottom: 4, color: "#aaa", fontWeight: 600 }}>購入コスト内訳（35年）</div>
                <div style={{ marginBottom: 2 }}>頭金: ¥{downPayment.toLocaleString()}</div>
                <div style={{ marginBottom: 2 }}>ローン総返済: ¥{totalPayment.toLocaleString()}</div>
                <div>ランニングコスト: ¥{((mgmtFee + repairFee) * 12 * 35 + (propTax + insurance) * 35).toLocaleString()}</div>
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 16, fontWeight: 600 }}>35年後の比較</div>
              {[
                { label: "購入 総コスト（35年）", v: buy35,  color: "#FF6B6B" },
                { label: "賃貸 総コスト（35年）", v: rent35, color: "#4ECDC4" },
              ].map(({ label, v, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 12, color: "#888" }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "monospace" }}>{fmt(v)}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: "14px 16px", background: diff35 >= 0 ? "rgba(78,205,196,0.08)" : "rgba(255,107,107,0.08)", borderRadius: 10, border: `1px solid ${diff35 >= 0 ? "rgba(78,205,196,0.2)" : "rgba(255,107,107,0.2)"}` }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>差額（賃貸 - 購入）</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: diff35 >= 0 ? "#4ECDC4" : "#FF6B6B", fontFamily: "monospace" }}>
                  {diff35 >= 0 ? "+" : ""}{fmt(diff35)}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                  {diff35 >= 0 ? "購入の方が35年で得です" : "賃貸の方が35年で得です"}
                </div>
              </div>
            </Card>
          </div>

          {/* Comparison chart */}
          <Card>
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>35年間 累積コスト推移</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="購入累積" stroke="#FF6B6B" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="賃貸累積" stroke="#4ECDC4" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#FF6B6B" }}>
                <div style={{ width: 20, height: 2, background: "#FF6B6B", borderRadius: 1 }} />
                購入累積コスト
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#4ECDC4" }}>
                <div style={{ width: 20, height: 2, background: "#4ECDC4", borderRadius: 1 }} />
                賃貸累積コスト
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════
          Section 4: Tax deduction
      ════════════════════════════════════════════ */}
      {activeSection === "tax" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }} className="re-grid">
            <style>{`@media(max-width:640px){.re-grid{grid-template-columns:1fr!important;}}`}</style>

            <Card>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 18, fontWeight: 600 }}>控除シミュレーション設定</div>

              <Slider
                label="年収（万円）" value={annualIncome} set={setAnnualIncome}
                min={200} max={2000} step={50} unit="万円"
                display={`${annualIncome.toLocaleString()}万円`}
              />

              {/* House type select */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>物件種別</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["新築", "中古"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setHouseType(t)}
                      style={{
                        padding: "6px 18px", borderRadius: 6, fontSize: 12,
                        border: houseType === t ? "1.5px solid #FF6B6B" : "1.5px solid rgba(255,255,255,0.1)",
                        background: houseType === t ? "rgba(255,107,107,0.12)" : "rgba(255,255,255,0.04)",
                        color: houseType === t ? "#FF6B6B" : "#888",
                        cursor: "pointer",
                        fontFamily: "'Noto Sans JP', sans-serif",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 10, fontSize: 11, color: "#888" }}>
                <div style={{ color: "#aaa", fontWeight: 600, marginBottom: 6 }}>2024年制度</div>
                <div style={{ marginBottom: 2 }}>控除率: 借入残高の 0.7%</div>
                <div style={{ marginBottom: 2 }}>控除期間: 最大13年間</div>
                <div>年間上限: {houseType === "新築" ? "35万円（5,000万×0.7%）" : "21万円（3,000万×0.7%）"}</div>
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 13, color: "#aaa", marginBottom: 16, fontWeight: 600 }}>控除額サマリー</div>
              {[
                { label: "借入額",          v: `¥${loan.toLocaleString()}`,          color: "#4ECDC4" },
                { label: "13年間 控除合計", v: `¥${taxRows.total.toLocaleString()}`, color: "#FFE66D" },
              ].map(({ label, v, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 12, color: "#888" }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "monospace" }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: "16px", background: "rgba(78,205,196,0.08)", borderRadius: 12, border: "1px solid rgba(78,205,196,0.2)" }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>実質購入コスト（物件価格 - 控除合計）</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#4ECDC4", fontFamily: "monospace" }}>
                  {fmt(effectivePrice)}
                </div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                  控除により {fmt(taxRows.total)} の節税効果
                </div>
              </div>
            </Card>
          </div>

          {/* Year-by-year table */}
          <Card>
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>年別 控除額明細（最大8年表示）</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 360, fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    {["控除年", "借入残債", "控除額（0.7%）"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "right", color: "#666", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {taxRows.rows.slice(0, 8).map((row) => (
                    <tr key={row.year} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "#aaa" }}>{row.year}年目</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "#4ECDC4", fontFamily: "monospace" }}>
                        ¥{row.balance.toLocaleString()}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: "#FFE66D", fontFamily: "monospace" }}>
                        ¥{row.deduction.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <td colSpan={2} style={{ padding: "8px 12px", textAlign: "right", color: "#888", fontSize: 11 }}>13年合計</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "#FF6B6B", fontFamily: "monospace", fontWeight: 700 }}>
                      ¥{taxRows.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
