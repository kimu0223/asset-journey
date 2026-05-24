"use client";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Subscription, fmt, fmtPlain } from "../lib/data";
import { Card, SectionHeader, Modal, Field, Select, Btn } from "./ui";

// ─── カテゴリ設定 ─────────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<
  Subscription["category"],
  { label: string; color: string }
> = {
  entertainment: { label: "エンタメ",       color: "#FF6B6B" },
  music:         { label: "音楽",           color: "#4ECDC4" },
  software:      { label: "ソフト",         color: "#FFE66D" },
  fitness:       { label: "フィットネス",   color: "#A8E6CF" },
  education:     { label: "教育",           color: "#DDA0DD" },
  other:         { label: "その他",         color: "#96CEB4" },
};

const OWNER_LABELS: Record<string, string> = {
  self:    "自分",
  partner: "パートナー",
  joint:   "共有",
};

// ─── 月額換算ヘルパー ─────────────────────────────────────────────────────────
function toMonthly(s: Subscription): number {
  return s.cycle === "yearly" ? Math.round(s.amount / 12) : s.amount;
}

// ─── 空フォーム ───────────────────────────────────────────────────────────────
const emptyForm = (): Omit<Subscription, "id"> => ({
  name: "",
  amount: 0,
  cycle: "monthly",
  category: "entertainment",
  owner: "joint",
  note: "",
  active: true,
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  subscriptions: Subscription[];
  setSubscriptions: (fn: (prev: Subscription[]) => Subscription[]) => void;
}

// ─── コンポーネント ───────────────────────────────────────────────────────────
export default function SubscriptionsTab({ subscriptions, setSubscriptions }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Subscription | null>(null);
  const [form, setForm]           = useState(emptyForm());

  // アクティブなサブスクのみ集計
  const { monthlyTotal, yearlyTotal, activeCount } = useMemo(() => {
    const active = subscriptions.filter(s => s.active);
    const monthly = active.reduce((acc, s) => acc + toMonthly(s), 0);
    const yearly  = active.reduce(
      (acc, s) => acc + (s.cycle === "monthly" ? s.amount * 12 : s.amount),
      0,
    );
    return { monthlyTotal: monthly, yearlyTotal: yearly, activeCount: active.length };
  }, [subscriptions]);

  // カテゴリ別月額集計（アクティブのみ）
  const pieData = useMemo(() => {
    const active = subscriptions.filter(s => s.active);
    return Object.entries(CATEGORY_CONFIG)
      .map(([key, cfg]) => ({
        name:  cfg.label,
        value: active
          .filter(s => s.category === key)
          .reduce((acc, s) => acc + toMonthly(s), 0),
        color: cfg.color,
      }))
      .filter(d => d.value > 0);
  }, [subscriptions]);

  // ─── CRUD ────────────────────────────────────────────────────────────────
  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(s: Subscription) {
    setEditing(s);
    setForm({ name: s.name, amount: s.amount, cycle: s.cycle, category: s.category, owner: s.owner ?? "joint", note: s.note ?? "", active: s.active });
    setModalOpen(true);
  }

  function save() {
    if (!form.name.trim()) return;
    if (editing) {
      setSubscriptions(prev =>
        prev.map(s => s.id === editing.id ? { ...s, ...form, amount: Number(form.amount) } : s)
      );
    } else {
      const newSub: Subscription = {
        ...form,
        id: `sub${Date.now()}`,
        amount: Number(form.amount),
      };
      setSubscriptions(prev => [...prev, newSub]);
    }
    setModalOpen(false);
  }

  function remove(id: string) {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  }

  function toggleActive(id: string) {
    setSubscriptions(prev =>
      prev.map(s => s.id === id ? { ...s, active: !s.active } : s)
    );
  }

  // ─── フォームヘルパー ────────────────────────────────────────────────────
  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div>
      {/* セクションヘッダー */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <SectionHeader
          title="サブスク管理"
          sub="月額・年額サブスクリプションの一覧管理"
        />
        <Btn onClick={openAdd} variant="primary" style={{ marginTop: 4, whiteSpace: "nowrap" }}>
          + 追加
        </Btn>
      </div>

      {/* サマリーカード */}
      <div className="sub-summary-grid" style={{ display: "grid", gap: 14, marginBottom: 24 }}>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6, letterSpacing: "0.06em" }}>月額合計</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#FF6B6B", fontFamily: "monospace" }}>
            {fmtPlain(monthlyTotal)}
          </div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>/ 月</div>
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6, letterSpacing: "0.06em" }}>年額合計</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#4ECDC4", fontFamily: "monospace" }}>
            {fmt(yearlyTotal)}
          </div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>/ 年</div>
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6, letterSpacing: "0.06em" }}>契約数</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#FFE66D", fontFamily: "monospace" }}>
            {activeCount}
          </div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>アクティブ</div>
        </Card>
      </div>

      {/* カテゴリ別円グラフ */}
      {pieData.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#ccc", marginBottom: 16 }}>カテゴリ別内訳（月額）</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => fmtPlain(Number(v))}
                contentStyle={{ background: "rgba(10,12,20,0.97)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "#e8e8e8" }}
                labelStyle={{ color: "#fff", fontWeight: 700 }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#aaa", fontSize: 12 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* サブスク一覧テーブル */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#ccc", marginBottom: 16 }}>
          サブスク一覧 <span style={{ color: "#555", fontWeight: 400 }}>({subscriptions.length}件)</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr>
                {["サービス名", "カテゴリ", "サイクル", "金額", "月額換算", "オーナー", "状態", "操作"].map(h => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: "left",
                    fontSize: 11, color: "#666", fontWeight: 600,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(s => (
                <tr
                  key={s.id}
                  style={{
                    opacity: s.active ? 1 : 0.45,
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#e0e0e0", fontWeight: 600 }}>
                    {s.name}
                    {s.note && (
                      <div style={{ fontSize: 10, color: "#555", fontWeight: 400, marginTop: 2 }}>{s.note}</div>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 12,
                      background: `${CATEGORY_CONFIG[s.category].color}22`,
                      color: CATEGORY_CONFIG[s.category].color,
                      whiteSpace: "nowrap",
                    }}>
                      {CATEGORY_CONFIG[s.category].label}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#999", whiteSpace: "nowrap" }}>
                    {s.cycle === "monthly" ? "月払い" : "年払い"}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#e0e0e0", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                    ¥{s.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#4ECDC4", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                    ¥{toMonthly(s).toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#aaa", whiteSpace: "nowrap" }}>
                    {s.owner ? OWNER_LABELS[s.owner] ?? s.owner : "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <button
                      onClick={() => toggleActive(s.id)}
                      style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 20,
                        border: "1px solid",
                        borderColor: s.active ? "#4ECDC4" : "#555",
                        background: s.active ? "rgba(78,205,196,0.12)" : "rgba(255,255,255,0.05)",
                        color: s.active ? "#4ECDC4" : "#666",
                        cursor: "pointer", whiteSpace: "nowrap",
                        fontFamily: "'Noto Sans JP', sans-serif",
                      }}
                    >
                      {s.active ? "有効" : "停止"}
                    </button>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn variant="ghost" onClick={() => openEdit(s)} style={{ padding: "4px 10px", fontSize: 11 }}>
                        編集
                      </Btn>
                      <Btn variant="danger" onClick={() => remove(s.id)} style={{ padding: "4px 10px", fontSize: 11 }}>
                        削除
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {subscriptions.length === 0 && (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#555", fontSize: 13 }}>
              サブスクリプションが登録されていません
            </div>
          )}
        </div>
      </Card>

      {/* 追加/編集 Modal */}
      {modalOpen && (
        <Modal
          title={editing ? "サブスク編集" : "サブスク追加"}
          onClose={() => setModalOpen(false)}
        >
          <Field
            label="サービス名"
            value={form.name}
            onChange={v => set("name", v)}
            placeholder="例: Netflix"
          />
          <Field
            label="金額"
            value={form.amount}
            onChange={v => set("amount", Number(v))}
            type="number"
            prefix="¥"
          />
          <Select
            label="請求サイクル"
            value={form.cycle}
            onChange={v => set("cycle", v as Subscription["cycle"])}
            options={[
              { value: "monthly", label: "月払い" },
              { value: "yearly",  label: "年払い" },
            ]}
          />
          <Select
            label="カテゴリ"
            value={form.category}
            onChange={v => set("category", v as Subscription["category"])}
            options={Object.entries(CATEGORY_CONFIG).map(([k, c]) => ({ value: k, label: c.label }))}
          />
          <Select
            label="オーナー"
            value={form.owner ?? "joint"}
            onChange={v => set("owner", v as Subscription["owner"])}
            options={[
              { value: "self",    label: "自分" },
              { value: "partner", label: "パートナー" },
              { value: "joint",   label: "共有" },
            ]}
          />
          <Field
            label="メモ（任意）"
            value={form.note ?? ""}
            onChange={v => set("note", v)}
            placeholder="例: ファミリープラン"
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setModalOpen(false)}>キャンセル</Btn>
            <Btn variant="primary" onClick={save}>
              {editing ? "更新" : "追加"}
            </Btn>
          </div>
        </Modal>
      )}

      <style>{`
        @media (min-width: 600px) {
          .sub-summary-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 599px) {
          .sub-summary-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
