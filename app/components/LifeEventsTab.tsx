"use client";
import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { LifeEvent, fmt } from "../lib/data";
import { Card, SectionHeader, Modal, Field, Select, Btn } from "./ui";

// ─── カテゴリ設定 ──────────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  education: { label: "教育",   icon: "🎓", color: "#FFE66D" },
  housing:   { label: "住宅",   icon: "🏠", color: "#FF6B6B" },
  vehicle:   { label: "車",     icon: "🚗", color: "#4ECDC4" },
  travel:    { label: "旅行",   icon: "✈️", color: "#A8E6CF" },
  wedding:   { label: "結婚",   icon: "💒", color: "#DDA0DD" },
  other:     { label: "その他", icon: "📌", color: "#96CEB4" },
} as const;

const CATEGORY_OPTIONS = Object.entries(CATEGORY_CONFIG).map(([value, cfg]) => ({
  value,
  label: `${cfg.icon} ${cfg.label}`,
}));

const CURRENT_YEAR = new Date().getFullYear();

// ─── 空フォーム ────────────────────────────────────────────────────────────────
const emptyForm = () => ({
  title: "",
  year: String(CURRENT_YEAR + 1),
  amount: "",
  category: "education" as LifeEvent["category"],
  note: "",
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  events: LifeEvent[];
  setEvents: (fn: (prev: LifeEvent[]) => LifeEvent[]) => void;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,12,20,0.97)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#e8e8e8",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#fff" }}>{label}年</div>
      <div style={{ color: "#FF6B6B" }}>{fmt(Number(payload[0].value))}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LifeEventsTab({ events, setEvents }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<LifeEvent | null>(null);
  const [form, setForm]           = useState(emptyForm());

  // ─── サマリー計算 ──────────────────────────────────────────────────────────
  const next5Total = useMemo(
    () => events
      .filter(e => e.year >= CURRENT_YEAR && e.year < CURRENT_YEAR + 5)
      .reduce((acc, e) => acc + e.amount, 0),
    [events],
  );

  const maxEvent = useMemo(
    () => events.reduce<LifeEvent | null>(
      (best, e) => (!best || e.amount > best.amount ? e : best),
      null,
    ),
    [events],
  );

  // ─── 年別グループ（ソート済み）────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map<number, LifeEvent[]>();
    for (const e of events) {
      const list = map.get(e.year) ?? [];
      list.push(e);
      map.set(e.year, list);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, list]) => ({ year, list }));
  }, [events]);

  // ─── バーチャート用データ ──────────────────────────────────────────────────
  const chartData = useMemo(
    () => grouped.map(({ year, list }) => ({
      year: String(year),
      合計: list.reduce((acc, e) => acc + e.amount, 0),
    })),
    [grouped],
  );

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (ev: LifeEvent) => {
    setEditing(ev);
    setForm({
      title: ev.title,
      year: String(ev.year),
      amount: String(ev.amount),
      category: ev.category,
      note: ev.note ?? "",
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const year   = parseInt(form.year, 10);
    const amount = parseInt(form.amount, 10);
    if (!form.title.trim() || isNaN(year) || isNaN(amount) || amount < 0) return;

    if (editing) {
      setEvents(prev =>
        prev.map(e =>
          e.id === editing.id
            ? { ...e, title: form.title.trim(), year, amount, category: form.category, note: form.note.trim() || undefined }
            : e,
        ),
      );
    } else {
      const newEvent: LifeEvent = {
        id: `e${Date.now()}`,
        title: form.title.trim(),
        year,
        amount,
        category: form.category,
        note: form.note.trim() || undefined,
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ヘッダー */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <SectionHeader
          title="ライフイベント"
          sub="人生の大きな支出をタイムラインで把握する"
        />
        <Btn onClick={openAdd} variant="primary" style={{ whiteSpace: "nowrap", marginTop: 2 }}>
          + イベント追加
        </Btn>
      </div>

      {/* サマリーカード */}
      <div className="events-grid3" style={{ marginBottom: 28 }}>
        <Card>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6, letterSpacing: "0.05em" }}>登録イベント数</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{events.length}<span style={{ fontSize: 14, color: "#888", marginLeft: 4 }}>件</span></div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6, letterSpacing: "0.05em" }}>今後5年の支出合計</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#FF6B6B", fontFamily: "monospace" }}>{fmt(next5Total)}</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>{CURRENT_YEAR}〜{CURRENT_YEAR + 4}年</div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 6, letterSpacing: "0.05em" }}>最大イベント</div>
          {maxEvent ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{maxEvent.title}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#FFE66D", fontFamily: "monospace" }}>{fmt(maxEvent.amount)}</div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: "#555" }}>—</div>
          )}
        </Card>
      </div>

      {/* バーチャート */}
      {chartData.length > 0 && (
        <Card style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>年次イベント費用</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="year" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} width={60} tickFormatter={fmt} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="合計" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.year}
                    fill={parseInt(entry.year, 10) < CURRENT_YEAR ? "#333" : "#FF6B6B"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* タイムライン */}
      {grouped.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "40px 0", color: "#555", fontSize: 13 }}>
            イベントがありません。「+ イベント追加」から登録してください。
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {grouped.map(({ year, list }) => {
            const isPast = year < CURRENT_YEAR;
            return (
              <div key={year} style={{ opacity: isPast ? 0.5 : 1, transition: "opacity 0.2s" }}>
                {/* 年ラベル */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{
                    fontSize: 22, fontWeight: 700, color: "#FF6B6B",
                    fontFamily: "'Noto Serif JP', serif", minWidth: 56,
                  }}>
                    {year}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,107,107,0.2)" }} />
                  {isPast && (
                    <span style={{ fontSize: 10, color: "#555", whiteSpace: "nowrap" }}>過去</span>
                  )}
                </div>

                {/* イベントカード群 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 8 }}>
                  {list.map(ev => {
                    const cfg = CATEGORY_CONFIG[ev.category];
                    return (
                      <div key={ev.id} style={{
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderLeft: `4px solid ${cfg.color}`,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}>
                        {/* アイコン */}
                        <span style={{ fontSize: 22, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>{cfg.icon}</span>

                        {/* テキスト */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: ev.note ? 4 : 0 }}>
                            {ev.title}
                          </div>
                          {ev.note && (
                            <div style={{ fontSize: 11, color: "#888" }}>{ev.note}</div>
                          )}
                        </div>

                        {/* 金額・操作 */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: cfg.color, fontFamily: "monospace" }}>
                            {fmt(ev.amount)}
                          </span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => openEdit(ev)}
                              style={{
                                background: "rgba(255,255,255,0.06)", border: "none",
                                color: "#aaa", fontSize: 11, borderRadius: 5,
                                padding: "4px 8px", cursor: "pointer",
                                fontFamily: "'Noto Sans JP', sans-serif",
                              }}
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(ev.id)}
                              style={{
                                background: "rgba(255,80,80,0.1)", border: "none",
                                color: "#ff6b6b", fontSize: 11, borderRadius: 5,
                                padding: "4px 8px", cursor: "pointer",
                                fontFamily: "'Noto Sans JP', sans-serif",
                              }}
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 追加/編集 Modal */}
      {showModal && (
        <Modal
          title={editing ? "イベントを編集" : "イベントを追加"}
          onClose={() => setShowModal(false)}
        >
          <Field
            label="タイトル"
            value={form.title}
            onChange={v => setForm(f => ({ ...f, title: v }))}
            placeholder="例: 第一子 小学校入学"
          />
          <Field
            label="年"
            value={form.year}
            onChange={v => setForm(f => ({ ...f, year: v }))}
            type="number"
            placeholder="2027"
          />
          <Field
            label="費用"
            value={form.amount}
            onChange={v => setForm(f => ({ ...f, amount: v }))}
            type="number"
            prefix="¥"
            placeholder="200000"
          />
          <Select
            label="カテゴリ"
            value={form.category}
            onChange={v => setForm(f => ({ ...f, category: v as LifeEvent["category"] }))}
            options={CATEGORY_OPTIONS}
          />
          <Field
            label="メモ（任意）"
            value={form.note}
            onChange={v => setForm(f => ({ ...f, note: v }))}
            placeholder="備考など"
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>キャンセル</Btn>
            <Btn variant="primary" onClick={handleSave}>保存</Btn>
          </div>
        </Modal>
      )}

      <style>{`
        .events-grid3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        @media (max-width: 768px) {
          .events-grid3 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
