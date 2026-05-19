"use client";
import { useState } from "react";
import { YearlyRecord, fmt, fmtPlain, CHART_COLORS } from "../lib/data";
import { Card, SectionHeader, Modal, Field, Btn, CustomTooltip } from "./ui";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  yearly: YearlyRecord[];
  setYearly: (fn: (prev: YearlyRecord[]) => YearlyRecord[]) => void;
}

export default function YearlyTab({ yearly, setYearly }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ year: "", cash: "", nisa: "", stock: "", trust: "", nisaGain: "", stockGain: "" });
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const save = () => {
    if (!form.year) return;
    const entry: YearlyRecord = {
      year: form.year, cash: Number(form.cash) || 0,
      nisa: Number(form.nisa) || 0, stock: Number(form.stock) || 0,
      trust: Number(form.trust) || 0, nisaGain: Number(form.nisaGain) || 0,
      stockGain: Number(form.stockGain) || 0,
    };
    setYearly(prev =>
      [...prev.filter(r => r.year !== form.year), entry].sort((a, b) => a.year.localeCompare(b.year))
    );
    setShowModal(false);
  };

  const del = (year: string) => {
    if (!confirm(`${year}年のデータを削除しますか？`)) return;
    setYearly(prev => prev.filter(r => r.year !== year));
  };

  const openEdit = (r: YearlyRecord) => {
    setForm({ year: r.year, cash: String(r.cash), nisa: String(r.nisa), stock: String(r.stock), trust: String(r.trust), nisaGain: String(r.nisaGain), stockGain: String(r.stockGain) });
    setShowModal(true);
  };

  const stackedData = yearly.map(y => ({
    year: y.year, 現金: y.cash, NISA: y.nisa, 高配当株: y.stock, 投資信託: y.trust,
  }));

  const gainData = yearly.map(y => ({
    year: y.year, NISA含み益: y.nisaGain, 株式含み益: y.stockGain,
  }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <SectionHeader title="年次資産推移" sub="元金・含み益の成長記録" />
        <Btn onClick={() => { setForm({ year: "", cash: "", nisa: "", stock: "", trust: "", nisaGain: "", stockGain: "" }); setShowModal(true); }}>+ 年を追加</Btn>
      </div>

      {/* Stacked bar */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>資産別 積み上がり（元金）</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stackedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#888" }} />
            <Bar dataKey="現金" stackId="a" fill={CHART_COLORS[1]} />
            <Bar dataKey="NISA" stackId="a" fill={CHART_COLORS[0]} />
            <Bar dataKey="高配当株" stackId="a" fill={CHART_COLORS[2]} />
            <Bar dataKey="投資信託" stackId="a" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Gain chart */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>含み益 推移</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={gainData} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#888" }} />
            <Bar dataKey="NISA含み益" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="株式含み益" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 600 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                {["年", "現金", "NISA元金", "株式元金", "投信元金", "NISA含み益", "株式含み益", "総資産", ""].map(h => (
                  <th key={h} style={{ padding: "11px 12px", textAlign: "right", color: "#888", fontWeight: 600, fontSize: 10, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...yearly].reverse().map((r, i) => {
                const total = r.cash + r.nisa + r.stock + r.trust + r.nisaGain + r.stockGain;
                return (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "10px 12px", color: "#ccc", fontFamily: "monospace", textAlign: "right" }}>{r.year}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: CHART_COLORS[1], fontFamily: "monospace" }}>{fmt(r.cash)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: CHART_COLORS[0], fontFamily: "monospace" }}>{fmt(r.nisa)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: CHART_COLORS[2], fontFamily: "monospace" }}>{fmt(r.stock)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: CHART_COLORS[3], fontFamily: "monospace" }}>{fmt(r.trust)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#f87171", fontFamily: "monospace" }}>+{fmt(r.nisaGain)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#fbbf24", fontFamily: "monospace" }}>+{fmt(r.stockGain)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#fff", fontFamily: "monospace", fontWeight: 700 }}>{fmt(total)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", marginRight: 6, fontSize: 12 }}>✎</button>
                      <button onClick={() => del(r.year)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <Modal title="年次データ追加・編集" onClose={() => setShowModal(false)}>
          <Field label="年 (例: 2027)" value={form.year} onChange={f("year")} placeholder="2027" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="現金・預金" value={form.cash} onChange={f("cash")} prefix="¥" type="number" />
            <Field label="NISA元金" value={form.nisa} onChange={f("nisa")} prefix="¥" type="number" />
            <Field label="高配当株元金" value={form.stock} onChange={f("stock")} prefix="¥" type="number" />
            <Field label="投資信託元金" value={form.trust} onChange={f("trust")} prefix="¥" type="number" />
            <Field label="NISA含み益" value={form.nisaGain} onChange={f("nisaGain")} prefix="¥" type="number" />
            <Field label="株式含み益（※自動計算タブ参照）" value={form.stockGain} onChange={f("stockGain")} prefix="¥" type="number" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>キャンセル</Btn>
            <Btn onClick={save}>保存</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
