"use client";
import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { AssetGoal, fmt } from "../lib/data";
import { Card, SectionHeader, Modal, Field, Select, Btn } from "./ui";

// ─── 複利計算（毎月積立） ────────────────────────────────────────────────────
function calcFutureValue(
  monthlyInvestment: number,
  annualReturn: number, // %
  years: number,
): number {
  const r = annualReturn / 100 / 12; // 月利
  const n = years * 12;
  if (r === 0) return monthlyInvestment * n;
  return monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r);
}

// ─── グラフ用データ生成 ────────────────────────────────────────────────────
function buildChartData(goals: AssetGoal[]) {
  if (goals.length === 0) return [];
  const maxYears = Math.max(...goals.map(g => g.targetAge - g.currentAge));
  const step = 1;
  const points: Record<string, number | string>[] = [];
  for (let y = 0; y <= maxYears; y += step) {
    const row: Record<string, number | string> = { year: y };
    goals.forEach(g => {
      const years = g.targetAge - g.currentAge;
      if (y <= years) {
        row[g.title] = Math.round(calcFutureValue(g.monthlyInvestment, g.expectedReturn, y));
      }
    });
    points.push(row);
  }
  return points;
}

// ─── カラーオプション ──────────────────────────────────────────────────────
const COLOR_OPTIONS = [
  { value: "#FF6B6B", label: "レッド" },
  { value: "#4ECDC4", label: "ティール" },
  { value: "#FFE66D", label: "イエロー" },
  { value: "#A8E6CF", label: "グリーン" },
  { value: "#DDA0DD", label: "パープル" },
  { value: "#96CEB4", label: "ミント" },
];

// ─── 空フォーム ────────────────────────────────────────────────────────────
const emptyForm = (): Omit<AssetGoal, "id"> => ({
  title: "",
  targetAmount: 10000000,
  targetAge: 60,
  currentAge: 35,
  monthlyInvestment: 30000,
  expectedReturn: 5,
  color: "#FF6B6B",
});

// ─── Props ────────────────────────────────────────────────────────────────
interface Props {
  goals: AssetGoal[];
  setGoals: (fn: (prev: AssetGoal[]) => AssetGoal[]) => void;
}

// ─── GoalsTab ─────────────────────────────────────────────────────────────
export default function GoalsTab({ goals, setGoals }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<AssetGoal, "id">>(emptyForm());

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (g: AssetGoal) => {
    setEditId(g.id);
    setForm({
      title: g.title,
      targetAmount: g.targetAmount,
      targetAge: g.targetAge,
      currentAge: g.currentAge,
      monthlyInvestment: g.monthlyInvestment,
      expectedReturn: g.expectedReturn,
      color: g.color,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (Number(form.targetAge) <= Number(form.currentAge)) {
      alert("目標年齢は現在の年齢より大きく設定してください");
      return;
    }
    if (Number(form.targetAmount) <= 0) {
      alert("目標金額を入力してください");
      return;
    }
    if (editId) {
      setGoals(prev => prev.map(g => g.id === editId ? { ...g, ...form } : g));
    } else {
      setGoals(prev => [...prev, { id: `g${Date.now()}`, ...form }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const setF = <K extends keyof Omit<AssetGoal, "id">>(k: K, v: string) => {
    const numFields: (keyof Omit<AssetGoal, "id">)[] = [
      "targetAmount", "targetAge", "currentAge", "monthlyInvestment", "expectedReturn",
    ];
    setForm(prev => ({
      ...prev,
      [k]: numFields.includes(k) ? (parseFloat(v) || 0) : v,
    }));
  };

  const chartData = useMemo(() => buildChartData(goals), [goals]);

  return (
    <div>
      {/* ヘッダー */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <SectionHeader
          title="資産目標"
          sub="複利シミュレーションで目標達成を可視化"
        />
        <Btn onClick={openAdd} variant="primary" style={{ whiteSpace: "nowrap", marginTop: 2 }}>
          + ゴール追加
        </Btn>
      </div>

      {/* ゴールカード一覧 */}
      {goals.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40, color: "#555" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 14 }}>ゴールがまだありません。「+ ゴール追加」から作成してください。</div>
        </Card>
      ) : (
        <div className="goals-grid">
          {goals.map(g => {
            const years = g.targetAge - g.currentAge;
            const projected = years > 0 ? calcFutureValue(g.monthlyInvestment, g.expectedReturn, years) : 0;
            const rate = Math.min(100, (projected / g.targetAmount) * 100);
            const achieved = projected >= g.targetAmount;
            const shortfall = g.targetAmount - projected;

            return (
              <Card key={g.id} style={{ borderLeft: `3px solid ${g.color}` }}>
                {/* タイトル */}
                <div style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 10 }}>
                  {g.title}
                </div>

                {/* サブ情報 */}
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#888", marginBottom: 14, flexWrap: "wrap" }}>
                  <span>目標: {fmt(g.targetAmount)}</span>
                  <span>目標年齢: {g.targetAge}歳</span>
                  <span>あと {Math.max(0, years)}年</span>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 14 }} />

                {/* 金額比較 */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                  <div>
                    <div style={{ color: "#888", marginBottom: 2 }}>想定到達額</div>
                    <div style={{ color: g.color, fontWeight: 700, fontSize: 15, fontFamily: "monospace" }}>{fmt(Math.round(projected))}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#888", marginBottom: 2 }}>目標</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "monospace" }}>{fmt(g.targetAmount)}</div>
                  </div>
                </div>

                {/* 進捗バー */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888", marginBottom: 4 }}>
                    <span>達成率</span>
                    <span>{rate.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${rate}%`,
                      background: g.color,
                      borderRadius: 3,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>

                {/* 条件 */}
                <div style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>
                  毎月 {fmt(g.monthlyInvestment)} 積立 × {Math.max(0, years)}年 @ {g.expectedReturn}% 年利
                </div>

                {/* バッジ */}
                <div style={{ marginBottom: 14 }}>
                  {achieved ? (
                    <span style={{
                      display: "inline-block", padding: "3px 10px",
                      background: "rgba(78,205,196,0.15)", color: "#4ECDC4",
                      borderRadius: 20, fontSize: 11, fontWeight: 600,
                      border: "1px solid rgba(78,205,196,0.3)",
                    }}>
                      達成可能
                    </span>
                  ) : (
                    <span style={{
                      display: "inline-block", padding: "3px 10px",
                      background: "rgba(248,113,113,0.15)", color: "#f87171",
                      borderRadius: 20, fontSize: 11, fontWeight: 600,
                      border: "1px solid rgba(248,113,113,0.3)",
                    }}>
                      あと {fmt(Math.round(shortfall))} 不足
                    </span>
                  )}
                </div>

                {/* アクション */}
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" onClick={() => openEdit(g)} style={{ fontSize: 12, padding: "6px 14px" }}>編集</Btn>
                  <Btn variant="danger" onClick={() => handleDelete(g.id)} style={{ fontSize: 12, padding: "6px 14px" }}>削除</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 複利シミュレーショングラフ */}
      {goals.length > 0 && (
        <Card style={{ marginTop: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 16, fontFamily: "'Noto Serif JP', serif" }}>
            複利シミュレーション（年次推移）
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="year"
                tickFormatter={(v: number) => `${v}年`}
                tick={{ fill: "#666", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                ticks={chartData.filter((_, i) => i % 5 === 0).map(d => d.year as number)}
              />
              <YAxis
                tickFormatter={(v: number) => fmt(v)}
                tick={{ fill: "#666", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                formatter={(value: unknown) => [fmt(Number(value ?? 0)), ""]}
                labelFormatter={(label: unknown) => `${label}年後`}
                contentStyle={{
                  background: "rgba(10,12,20,0.97)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10, fontSize: 12,
                }}
                labelStyle={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              {goals.map(g => (
                <Line
                  key={g.id}
                  type="monotone"
                  dataKey={g.title}
                  stroke={g.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 追加/編集 Modal */}
      {modalOpen && (
        <Modal
          title={editId ? "ゴールを編集" : "ゴールを追加"}
          onClose={() => setModalOpen(false)}
        >
          <Field
            label="タイトル"
            value={form.title}
            onChange={v => setF("title", v)}
            placeholder="例: 老後資産1億円"
          />
          <Field
            label="目標金額"
            value={form.targetAmount}
            onChange={v => setF("targetAmount", v)}
            type="number"
            prefix="¥"
          />
          <Field
            label="現在の年齢"
            value={form.currentAge}
            onChange={v => setF("currentAge", v)}
            type="number"
          />
          <Field
            label="目標年齢"
            value={form.targetAge}
            onChange={v => setF("targetAge", v)}
            type="number"
          />
          <Field
            label="毎月の投資額"
            value={form.monthlyInvestment}
            onChange={v => setF("monthlyInvestment", v)}
            type="number"
            prefix="¥"
          />
          <Field
            label="想定年利 (%)"
            value={form.expectedReturn}
            onChange={v => setF("expectedReturn", v)}
            type="number"
            placeholder="5"
          />
          <Select
            label="カラー"
            value={form.color}
            onChange={v => setF("color", v)}
            options={COLOR_OPTIONS}
          />
          {/* カラープレビュー */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {COLOR_OPTIONS.map(c => (
              <div
                key={c.value}
                onClick={() => setF("color", c.value)}
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: c.value, cursor: "pointer",
                  border: form.color === c.value ? "2px solid #fff" : "2px solid transparent",
                  transition: "border 0.15s",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModalOpen(false)}>キャンセル</Btn>
            <Btn variant="primary" onClick={handleSave}>
              {editId ? "更新" : "追加"}
            </Btn>
          </div>
        </Modal>
      )}

      <style>{`
        .goals-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          .goals-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
