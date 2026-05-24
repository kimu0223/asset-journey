"use client";
import { useState } from "react";
import { NisaRecord } from "../lib/data";
import { Card, SectionHeader, Modal, Field, Btn } from "./ui";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  nisa: NisaRecord[];
  setNisa: (fn: (prev: NisaRecord[]) => NisaRecord[]) => void;
}

const GROWTH_LIMIT       = 240;  // 万円
const ACCUMULATION_LIMIT = 120;  // 万円
const LIFETIME_LIMIT     = 1800; // 万円

const CURRENT_YEAR = String(new Date().getFullYear());

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, overflow: "hidden", height: 8 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 6, transition: "width 0.4s" }} />
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}
function NisaTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,12,20,0.97)", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#e8e8e8",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: "#fff" }}>{label}年</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {p.value}万円
        </div>
      ))}
    </div>
  );
}

export default function NisaTab({ nisa, setNisa }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editYear, setEditYear] = useState<string | null>(null);
  const [form, setForm] = useState({ year: "", growthUsed: "", accumulationUsed: "" });
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  // 今年のレコード（なければゼロ）
  const thisYear = nisa.find(r => r.year === CURRENT_YEAR) ?? {
    year: CURRENT_YEAR,
    growthUsed: 0,
    accumulationUsed: 0,
  };

  // 生涯累積
  const lifetimeUsed = nisa.reduce((s, r) => s + r.growthUsed + r.accumulationUsed, 0);
  const lifetimePct  = Math.min((lifetimeUsed / LIFETIME_LIMIT) * 100, 100);

  // CRUD
  const save = () => {
    const entry: NisaRecord = {
      year:              form.year.trim(),
      growthUsed:        Number(form.growthUsed) || 0,
      accumulationUsed:  Number(form.accumulationUsed) || 0,
    };
    if (!entry.year) return;
    if (editYear) {
      setNisa(prev => prev.map(r => r.year === editYear ? entry : r));
    } else {
      setNisa(prev => [...prev.filter(r => r.year !== entry.year), entry].sort((a, b) => a.year.localeCompare(b.year)));
    }
    setShowModal(false);
  };

  const del = (year: string) => {
    if (!confirm(`${year}年のデータを削除しますか？`)) return;
    setNisa(prev => prev.filter(r => r.year !== year));
  };

  const openEdit = (r: NisaRecord) => {
    setEditYear(r.year);
    setForm({ year: r.year, growthUsed: String(r.growthUsed), accumulationUsed: String(r.accumulationUsed) });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditYear(null);
    setForm({ year: "", growthUsed: "", accumulationUsed: "" });
    setShowModal(true);
  };

  // テーブルを年順ソート
  const sorted = [...nisa].sort((a, b) => a.year.localeCompare(b.year));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <SectionHeader title="NISA枠管理" sub="新NISA 年間・生涯非課税投資枠のトラッキング" />
        <Btn onClick={openAdd}>+ 年を追加</Btn>
      </div>

      {/* 今年のサマリーカード */}
      <div className="nisa-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <style>{`@media(max-width:600px){.nisa-summary-grid{grid-template-columns:1fr!important;}}`}</style>

        {/* 成長投資枠 */}
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 10, color: "#888", marginBottom: 4, letterSpacing: "0.05em" }}>
            {CURRENT_YEAR}年 成長投資枠
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#FF6B6B", fontFamily: "monospace" }}>
              {thisYear.growthUsed}
            </span>
            <span style={{ fontSize: 12, color: "#888" }}>/ {GROWTH_LIMIT} 万円</span>
          </div>
          <ProgressBar value={thisYear.growthUsed} max={GROWTH_LIMIT} color="#FF6B6B" />
          <div style={{ fontSize: 10, color: "#666", marginTop: 6 }}>
            残り {Math.max(GROWTH_LIMIT - thisYear.growthUsed, 0)} 万円
          </div>
        </Card>

        {/* 積立枠 */}
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 10, color: "#888", marginBottom: 4, letterSpacing: "0.05em" }}>
            {CURRENT_YEAR}年 積立投資枠
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#4ECDC4", fontFamily: "monospace" }}>
              {thisYear.accumulationUsed}
            </span>
            <span style={{ fontSize: 12, color: "#888" }}>/ {ACCUMULATION_LIMIT} 万円</span>
          </div>
          <ProgressBar value={thisYear.accumulationUsed} max={ACCUMULATION_LIMIT} color="#4ECDC4" />
          <div style={{ fontSize: 10, color: "#666", marginTop: 6 }}>
            残り {Math.max(ACCUMULATION_LIMIT - thisYear.accumulationUsed, 0)} 万円
          </div>
        </Card>

        {/* 今年の残り合計 */}
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 10, color: "#888", marginBottom: 4, letterSpacing: "0.05em" }}>
            {CURRENT_YEAR}年 残り枠合計
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#FFE66D", fontFamily: "monospace" }}>
              {Math.max(GROWTH_LIMIT - thisYear.growthUsed, 0) + Math.max(ACCUMULATION_LIMIT - thisYear.accumulationUsed, 0)}
            </span>
            <span style={{ fontSize: 12, color: "#888" }}>万円</span>
          </div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 2, lineHeight: 1.6 }}>
            成長枠 {Math.max(GROWTH_LIMIT - thisYear.growthUsed, 0)}万 +{" "}
            積立枠 {Math.max(ACCUMULATION_LIMIT - thisYear.accumulationUsed, 0)}万
          </div>
        </Card>
      </div>

      {/* 生涯非課税枠の進捗 */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>
            生涯非課税枠の進捗
          </div>
          <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>
            {lifetimeUsed}万 / {LIFETIME_LIMIT}万円
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, overflow: "hidden", height: 12, marginBottom: 10 }}>
          <div style={{
            width: `${lifetimePct}%`, height: "100%",
            background: "linear-gradient(90deg,#FF6B6B,#FFE66D)",
            borderRadius: 8, transition: "width 0.4s",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
          <span style={{ color: "#4ECDC4", fontFamily: "monospace", fontWeight: 700 }}>
            使用済み {lifetimeUsed}万円 ({lifetimePct.toFixed(1)}%)
          </span>
          <span style={{ color: "#888" }}>
            残り {Math.max(LIFETIME_LIMIT - lifetimeUsed, 0)}万円
          </span>
        </div>
      </Card>

      {/* 積み上げ棒グラフ */}
      {nisa.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>年次 NISA 投資枠使用額</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sorted} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#666", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}年`}
              />
              <YAxis
                tick={{ fill: "#666", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}万`}
              />
              <Tooltip content={<NisaTooltip />} />
              <Legend
                formatter={(v) => <span style={{ color: "#aaa", fontSize: 11 }}>{v}</span>}
              />
              <Bar dataKey="growthUsed"       name="成長投資枠" fill="#FF6B6B" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="accumulationUsed" name="積立投資枠" fill="#4ECDC4" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 年次内訳テーブル */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 560 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                {["年", "成長投資枠 (万円)", "積立投資枠 (万円)", "合計 (万円)", "成長枠 残り", "積立枠 残り", ""].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 14px", textAlign: h === "年" ? "left" : "right",
                      color: "#888", fontWeight: 600, fontSize: 10, whiteSpace: "nowrap",
                    }}
                  >{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 28, textAlign: "center", color: "#555", fontSize: 13 }}>
                    データがありません。「+ 年を追加」から入力してください。
                  </td>
                </tr>
              ) : sorted.map((r) => {
                const total     = r.growthUsed + r.accumulationUsed;
                const growthRem = Math.max(GROWTH_LIMIT - r.growthUsed, 0);
                const accumRem  = Math.max(ACCUMULATION_LIMIT - r.accumulationUsed, 0);
                const isCurrentYear = r.year === CURRENT_YEAR;

                return (
                  <tr
                    key={r.year}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      background: isCurrentYear ? "rgba(255,107,107,0.04)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "10px 14px", color: isCurrentYear ? "#FF6B6B" : "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {r.year}年{isCurrentYear && <span style={{ fontSize: 9, marginLeft: 6, background: "rgba(255,107,107,0.2)", color: "#FF6B6B", padding: "1px 6px", borderRadius: 10 }}>今年</span>}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: "#FF6B6B", fontFamily: "monospace" }}>
                      {r.growthUsed}
                      <span style={{ fontSize: 10, color: "#555", marginLeft: 4 }}>/ {GROWTH_LIMIT}</span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: "#4ECDC4", fontFamily: "monospace" }}>
                      {r.accumulationUsed}
                      <span style={{ fontSize: 10, color: "#555", marginLeft: 4 }}>/ {ACCUMULATION_LIMIT}</span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: "#FFE66D", fontFamily: "monospace", fontWeight: 700 }}>
                      {total}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: growthRem > 0 ? "#aaa" : "#555", fontFamily: "monospace" }}>
                      {growthRem}万
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: accumRem > 0 ? "#aaa" : "#555", fontFamily: "monospace" }}>
                      {accumRem}万
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
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

      <div style={{ marginTop: 12, fontSize: 11, color: "#555", textAlign: "right" }}>
        ※ 新NISA（2024年〜）: 成長投資枠 240万円/年、積立投資枠 120万円/年、生涯上限 1,800万円
      </div>

      {showModal && (
        <Modal title={editYear ? `${editYear}年を編集` : "年を追加"} onClose={() => setShowModal(false)}>
          {!editYear && (
            <Field label="年（例: 2026）" value={form.year} onChange={f("year")} placeholder="2026" type="number" />
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field
              label={`成長投資枠 使用額（万円）上限 ${GROWTH_LIMIT}万`}
              value={form.growthUsed}
              onChange={f("growthUsed")}
              type="number"
              placeholder="0"
            />
            <Field
              label={`積立投資枠 使用額（万円）上限 ${ACCUMULATION_LIMIT}万`}
              value={form.accumulationUsed}
              onChange={f("accumulationUsed")}
              type="number"
              placeholder="0"
            />
          </div>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 16, lineHeight: 1.6 }}>
            合計: {(Number(form.growthUsed) || 0) + (Number(form.accumulationUsed) || 0)} 万円
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>キャンセル</Btn>
            <Btn onClick={save}>保存</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
