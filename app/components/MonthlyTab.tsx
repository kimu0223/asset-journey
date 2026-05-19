"use client";
import { useState } from "react";
import { MonthlyRecord, fmt, fmtFull, fmtPlain } from "../lib/data";
import { Card, SectionHeader, Modal, Field, Btn, CustomTooltip } from "./ui";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Props {
  monthly: MonthlyRecord[];
  setMonthly: (fn: (prev: MonthlyRecord[]) => MonthlyRecord[]) => void;
}

export default function MonthlyTab({ monthly, setMonthly }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ month: "", income: "", expense: "", balance: "" });
  const [editMonth, setEditMonth] = useState<string | null>(null);
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => {
    setEditMonth(null);
    setForm({ month: "", income: "", expense: "", balance: "" });
    setShowModal(true);
  };

  const openEdit = (r: MonthlyRecord) => {
    setEditMonth(r.month);
    setForm({ month: r.month, income: String(r.income), expense: String(r.expense), balance: String(r.balance) });
    setShowModal(true);
  };

  const save = () => {
    if (!form.month) return;
    const entry: MonthlyRecord = {
      month: form.month,
      income: Number(form.income) || 0,
      expense: Number(form.expense) || 0,
      balance: Number(form.balance) || 0,
    };
    setMonthly(prev =>
      [...prev.filter(r => r.month !== form.month), entry]
        .sort((a, b) => a.month.localeCompare(b.month))
    );
    setShowModal(false);
  };

  const del = (month: string) => {
    if (!confirm(`${month} のデータを削除しますか？`)) return;
    setMonthly(prev => prev.filter(r => r.month !== month));
  };

  const recent = [...monthly].reverse();
  const barData = monthly.slice(-6).map(m => ({
    month: m.month.slice(5),
    収入: m.income,
    支出: m.expense,
  }));

  const totalIncome = monthly.slice(-12).reduce((s, m) => s + m.income, 0);
  const totalExpense = monthly.slice(-12).reduce((s, m) => s + m.expense, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <SectionHeader title="月次収支" sub="月1回の更新でOK" />
        <Btn onClick={openAdd}>+ 月を追加</Btn>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }} className="sum-grid">
        <style>{`@media(max-width:480px){.sum-grid{grid-template-columns:1fr!important;}}`}</style>
        {[
          { label: "年間収入（直近12ヶ月）", v: fmtPlain(totalIncome), color: "#4ECDC4" },
          { label: "年間支出", v: fmtPlain(totalExpense), color: "#FF6B6B" },
          { label: "年間貯蓄", v: fmtFull(totalIncome - totalExpense), color: "#FFE66D" },
        ].map((c, i) => (
          <Card key={i} style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.color, fontFamily: "monospace" }}>{c.v}</div>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>直近6ヶ月 収支</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="収入" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="支出" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Table - scroll on mobile */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 460 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                {["月", "収入", "支出", "収支", "月末残高", ""].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "right", color: "#888", fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => {
                const cf = r.income - r.expense;
                return (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "11px 14px", color: "#ccc", fontFamily: "monospace" }}>{r.month}</td>
                    <td style={{ padding: "11px 14px", textAlign: "right", color: "#4ECDC4", fontFamily: "monospace" }}>{fmtPlain(r.income)}</td>
                    <td style={{ padding: "11px 14px", textAlign: "right", color: "#FF6B6B", fontFamily: "monospace" }}>{fmtPlain(r.expense)}</td>
                    <td style={{ padding: "11px 14px", textAlign: "right", color: cf >= 0 ? "#4ECDC4" : "#FF6B6B", fontFamily: "monospace", fontWeight: 700 }}>
                      {cf >= 0 ? "+" : ""}{fmtPlain(cf)}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right", color: "#fff", fontFamily: "monospace" }}>{fmtPlain(r.balance)}</td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}>
                      <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", marginRight: 8, fontSize: 13 }}>✎</button>
                      <button onClick={() => del(r.month)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 13 }}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <Modal title={editMonth ? `${editMonth} を編集` : "月次データ追加"} onClose={() => setShowModal(false)}>
          <Field label="月 (例: 2026/06)" value={form.month} onChange={f("month")} placeholder="2026/06" />
          <Field label="収入" value={form.income} onChange={f("income")} prefix="¥" type="number" placeholder="420000" />
          <Field label="支出" value={form.expense} onChange={f("expense")} prefix="¥" type="number" placeholder="310000" />
          <Field label="月末残高（全口座合計）" value={form.balance} onChange={f("balance")} prefix="¥" type="number" />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>キャンセル</Btn>
            <Btn onClick={save}>保存</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
