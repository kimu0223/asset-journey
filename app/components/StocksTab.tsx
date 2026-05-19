"use client";
import { useState, useCallback } from "react";
import { StockHolding, fmt, fmtFull, CHART_COLORS } from "../lib/data";
import { Card, SectionHeader, Modal, Field, Select, Btn, CustomTooltip } from "./ui";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  stocks: StockHolding[];
  setStocks: (fn: (prev: StockHolding[]) => StockHolding[]) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  nisa: "NISA",
  dividend: "高配当株",
  trust: "投資信託",
  other: "その他",
};
const CATEGORY_COLORS: Record<string, string> = {
  nisa: "#FF6B6B",
  dividend: "#FFE66D",
  trust: "#A8E6CF",
  other: "#DDA0DD",
};

interface PriceStatus {
  [id: string]: "idle" | "loading" | "ok" | "error";
}

export default function StocksTab({ stocks, setStocks }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ticker: "", name: "", shares: "", avgCost: "", category: "dividend" });
  const [priceStatus, setPriceStatus] = useState<PriceStatus>({});
  const [refreshing, setRefreshing] = useState(false);
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const fetchPrice = useCallback(async (s: StockHolding): Promise<number | null> => {
    try {
      const res = await fetch(`/api/stock-price?ticker=${encodeURIComponent(s.ticker)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.price ?? null;
    } catch {
      return null;
    }
  }, []);

  const refreshAll = async () => {
    setRefreshing(true);
    const ids = stocks.map(s => s.id);
    setPriceStatus(ids.reduce((a, id) => ({ ...a, [id]: "loading" }), {}));
    
    const results = await Promise.all(
      stocks.map(async s => {
        const price = await fetchPrice(s);
        return { id: s.id, price };
      })
    );

    setStocks(prev => prev.map(s => {
      const result = results.find(r => r.id === s.id);
      return result?.price ? { ...s, currentPrice: result.price, lastUpdated: new Date().toISOString() } : s;
    }));
    setPriceStatus(results.reduce((a, r) => ({
      ...a, [r.id]: r.price ? "ok" : "error",
    }), {}));
    setRefreshing(false);
  };

  const refreshOne = async (s: StockHolding) => {
    setPriceStatus(p => ({ ...p, [s.id]: "loading" }));
    const price = await fetchPrice(s);
    if (price) {
      setStocks(prev => prev.map(st => st.id === s.id ? { ...st, currentPrice: price, lastUpdated: new Date().toISOString() } : st));
      setPriceStatus(p => ({ ...p, [s.id]: "ok" }));
    } else {
      setPriceStatus(p => ({ ...p, [s.id]: "error" }));
    }
  };

  const save = () => {
    const entry: StockHolding = {
      id: editId ?? `s${Date.now()}`,
      ticker: form.ticker.trim().toUpperCase(),
      name: form.name,
      shares: Number(form.shares) || 0,
      avgCost: Number(form.avgCost) || 0,
      category: form.category as StockHolding["category"],
    };
    if (editId) {
      setStocks(prev => prev.map(s => s.id === editId ? { ...s, ...entry } : s));
    } else {
      setStocks(prev => [...prev, entry]);
    }
    setShowModal(false);
  };

  const del = (id: string) => {
    if (!confirm("この銘柄を削除しますか？")) return;
    setStocks(prev => prev.filter(s => s.id !== id));
  };

  const openEdit = (s: StockHolding) => {
    setEditId(s.id);
    setForm({ ticker: s.ticker, name: s.name, shares: String(s.shares), avgCost: String(s.avgCost), category: s.category });
    setShowModal(true);
  };

  // Aggregated portfolio stats
  const totalCost = stocks.reduce((s, h) => s + h.avgCost * h.shares, 0);
  const totalValue = stocks.reduce((s, h) => s + (h.currentPrice ?? h.avgCost) * h.shares, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost * 100) : 0;

  // Category breakdown chart
  const categoryData = Object.entries(CATEGORY_LABELS).map(([key, label]) => {
    const group = stocks.filter(s => s.category === key);
    const value = group.reduce((s, h) => s + (h.currentPrice ?? h.avgCost) * h.shares, 0);
    const cost = group.reduce((s, h) => s + h.avgCost * h.shares, 0);
    return { name: label, 評価額: value, 元金: cost };
  }).filter(d => d.評価額 > 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <SectionHeader title="保有証券" sub="ティッカー入力で株価を自動取得" />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={refreshAll} disabled={refreshing}>
            {refreshing ? "取得中…" : "🔄 株価を更新"}
          </Btn>
          <Btn onClick={() => { setEditId(null); setForm({ ticker: "", name: "", shares: "", avgCost: "", category: "dividend" }); setShowModal(true); }}>
            + 銘柄追加
          </Btn>
        </div>
      </div>

      {/* Portfolio summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }} className="port-grid">
        <style>{`@media(max-width:480px){.port-grid{grid-template-columns:1fr!important;}}`}</style>
        {[
          { label: "取得原価 合計", v: fmt(totalCost), color: "#4ECDC4" },
          { label: "評価額 合計", v: fmt(totalValue), color: "#FF6B6B" },
          { label: "含み損益", v: `${totalGain >= 0 ? "+" : ""}${fmt(totalGain)} (${totalGainPct >= 0 ? "+" : ""}${totalGainPct.toFixed(1)}%)`, color: totalGain >= 0 ? "#4ECDC4" : "#f87171" },
        ].map((c, i) => (
          <Card key={i} style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.color, fontFamily: "monospace" }}>{c.v}</div>
          </Card>
        ))}
      </div>

      {/* Category bar */}
      {categoryData.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>カテゴリ別 評価額 vs 元金</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={categoryData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="評価額" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="元金" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Holdings table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 620 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                {["銘柄", "ティッカー", "区分", "保有株数", "取得単価", "現在値", "評価額", "含み損益", "更新", ""].map(h => (
                  <th key={h} style={{ padding: "11px 12px", textAlign: "right", color: "#888", fontWeight: 600, fontSize: 10, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stocks.map((s, i) => {
                const price = s.currentPrice ?? s.avgCost;
                const value = price * s.shares;
                const gain = value - s.avgCost * s.shares;
                const gainPct = (gain / (s.avgCost * s.shares)) * 100;
                const status = priceStatus[s.id];
                const catColor = CATEGORY_COLORS[s.category] ?? "#888";

                return (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "10px 12px", color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>{s.name}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#888", fontFamily: "monospace", fontSize: 11 }}>{s.ticker}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <span style={{ background: `${catColor}22`, color: catColor, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
                        {CATEGORY_LABELS[s.category]}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#ccc", fontFamily: "monospace" }}>{s.shares.toLocaleString()}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#888", fontFamily: "monospace" }}>¥{s.avgCost.toLocaleString()}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: s.currentPrice ? "#fff" : "#555", fontFamily: "monospace" }}>
                      {s.currentPrice ? `¥${s.currentPrice.toLocaleString()}` : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#4ECDC4", fontFamily: "monospace", fontWeight: 700 }}>
                      {fmt(value)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: gain >= 0 ? "#4ECDC4" : "#f87171", fontFamily: "monospace" }}>
                      {gain >= 0 ? "+" : ""}{fmt(gain)}<br />
                      <span style={{ fontSize: 10, opacity: 0.8 }}>({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%)</span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <button
                        onClick={() => refreshOne(s)}
                        disabled={status === "loading"}
                        title={s.lastUpdated ? `最終更新: ${new Date(s.lastUpdated).toLocaleString("ja-JP")}` : "未取得"}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14,
                          color: status === "loading" ? "#555" : status === "ok" ? "#4ECDC4" : status === "error" ? "#f87171" : "#666" }}
                      >
                        {status === "loading" ? "⏳" : "🔄"}
                      </button>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <button onClick={() => openEdit(s)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", marginRight: 6, fontSize: 12 }}>✎</button>
                      <button onClick={() => del(s.id)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ marginTop: 12, fontSize: 11, color: "#555", textAlign: "right" }}>
        ※ 株価はYahoo Finance経由。日本株は銘柄コード+.T (例: 7203.T)、米国株はそのまま (例: AAPL)
      </div>

      {showModal && (
        <Modal title={editId ? "銘柄を編集" : "銘柄を追加"} onClose={() => setShowModal(false)}>
          <Field label="ティッカーシンボル" value={form.ticker} onChange={f("ticker")} placeholder="7203.T / AAPL" />
          <Field label="銘柄名" value={form.name} onChange={f("name")} placeholder="トヨタ自動車" />
          <Select label="区分" value={form.category} onChange={f("category")} options={[
            { value: "nisa", label: "NISA" },
            { value: "dividend", label: "高配当株" },
            { value: "trust", label: "投資信託" },
            { value: "other", label: "その他" },
          ]} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="保有株数（口数）" value={form.shares} onChange={f("shares")} type="number" placeholder="100" />
            <Field label="平均取得単価 (円)" value={form.avgCost} onChange={f("avgCost")} prefix="¥" type="number" placeholder="2800" />
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
