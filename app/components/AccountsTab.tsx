"use client";
import { useState } from "react";
import { SbiAccount, BankAccount, fmt, CHART_COLORS } from "../lib/data";
import { Card, SectionHeader, Modal, Field, Btn, CustomTooltip } from "./ui";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  accounts: SbiAccount[];
  setAccounts: (fn: (prev: SbiAccount[]) => SbiAccount[]) => void;
  bankAccounts: BankAccount[];
  setBankAccounts: (fn: (prev: BankAccount[]) => BankAccount[]) => void;
}

const ICONS = ["🛡️","🏠","🎓","✈️","🚗","💒","💰","🎮","👶","📱","🏋️","🎹","🌿","🐶","💊"];
const BANK_TYPES = ["普通", "定期", "積立", "その他"] as const;
const TYPE_COLORS: Record<string, string> = {
  "普通": "#4ECDC4", "定期": "#FFE66D", "積立": "#A8E6CF", "その他": "#DDA0DD",
};

export default function AccountsTab({ accounts, setAccounts, bankAccounts, setBankAccounts }: Props) {
  // ── SBI目的別口座 state ────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", balance: "", icon: "💰", color: "#4ECDC4", target: "" });
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const total = accounts.reduce((s, a) => s + a.balance, 0);

  const openAdd = () => {
    setEditIdx(null);
    setForm({ name: "", balance: "", icon: "💰", color: "#4ECDC4", target: "" });
    setShowModal(true);
  };
  const openEdit = (i: number) => {
    setEditIdx(i);
    setForm({ ...accounts[i], balance: String(accounts[i].balance), target: String(accounts[i].target ?? "") });
    setShowModal(true);
  };
  const save = () => {
    const entry: SbiAccount = {
      name: form.name, balance: Number(form.balance) || 0,
      icon: form.icon, color: form.color,
      target: form.target ? Number(form.target) : undefined,
    };
    if (editIdx !== null) {
      setAccounts(prev => prev.map((a, i) => i === editIdx ? entry : a));
    } else {
      setAccounts(prev => [...prev, entry]);
    }
    setShowModal(false);
  };
  const del = (i: number) => {
    if (!confirm("この口座を削除しますか？")) return;
    setAccounts(prev => prev.filter((_, idx) => idx !== i));
  };

  // ── 銀行口座 state ─────────────────────────────────────────────────────────
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankEditId, setBankEditId] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState({
    name: "", bank: "", balance: "",
    type: "普通" as BankAccount["type"],
    color: "#4ECDC4",
  });
  const bf = (k: string) => (v: string) => setBankForm(p => ({ ...p, [k]: v }));

  const bankTotal = bankAccounts.reduce((s, a) => s + a.balance, 0);

  const openBankAdd = () => {
    setBankEditId(null);
    setBankForm({ name: "", bank: "", balance: "", type: "普通", color: "#4ECDC4" });
    setShowBankModal(true);
  };
  const openBankEdit = (a: BankAccount) => {
    setBankEditId(a.id);
    setBankForm({ name: a.name, bank: a.bank, balance: String(a.balance), type: a.type, color: a.color ?? "#4ECDC4" });
    setShowBankModal(true);
  };
  const saveBank = () => {
    if (bankEditId !== null) {
      setBankAccounts(prev => prev.map(a => a.id === bankEditId
        ? { ...a, name: bankForm.name, bank: bankForm.bank, balance: Number(bankForm.balance) || 0, type: bankForm.type, color: bankForm.color }
        : a
      ));
    } else {
      const newId = `b${Date.now()}`;
      setBankAccounts(prev => [...prev, {
        id: newId, name: bankForm.name, bank: bankForm.bank,
        balance: Number(bankForm.balance) || 0, type: bankForm.type,
        owner: "self", color: bankForm.color,
      }]);
    }
    setShowBankModal(false);
  };
  const delBank = (id: string) => {
    if (!confirm("この口座を削除しますか？")) return;
    setBankAccounts(prev => prev.filter(a => a.id !== id));
  };

  // ── 銀行別グループ ─────────────────────────────────────────────────────────
  const bankGroups = bankAccounts.reduce<Record<string, BankAccount[]>>((acc, a) => {
    (acc[a.bank] = acc[a.bank] ?? []).push(a);
    return acc;
  }, {});

  return (
    <div>
      {/* ── SBI住信 目的別口座 ───────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <SectionHeader title="SBI住信 目的別口座" sub={`合計: ${fmt(total)}`} />
        <Btn onClick={openAdd}>+ 口座追加</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {accounts.map((a, i) => {
          const pct = a.target ? Math.min(100, Math.round(a.balance / a.target * 100)) : null;
          return (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 14,
              border: `1px solid ${a.color}44`, padding: "18px 18px 14px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 26 }}>{a.icon}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => openEdit(i)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 13 }}>✎</button>
                  <button onClick={() => del(i)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 13 }}>✕</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#888", margin: "10px 0 4px" }}>{a.name}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: a.color, fontFamily: "monospace" }}>{fmt(a.balance)}</div>
              {pct !== null && a.target && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#666", marginBottom: 5 }}>
                    <span>目標: {fmt(a.target)}</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: a.color, borderRadius: 2 }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {accounts.length > 0 && (
        <Card style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14, fontWeight: 600 }}>口座別配分</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={accounts.map(a => ({ name: a.name, value: a.balance }))}
                cx="50%" cy="50%" outerRadius={85} dataKey="value" nameKey="name"
              >
                {accounts.map((a, i) => <Cell key={i} fill={a.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 8 }}>
            {accounts.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#888" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color }} />
                {a.name}: {fmt(a.balance)}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── 銀行口座 ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <SectionHeader title="銀行口座" sub={`合計: ${fmt(bankTotal)}`} />
        <Btn onClick={openBankAdd}>+ 口座追加</Btn>
      </div>

      {bankAccounts.length === 0 ? (
        <Card>
          <div style={{ fontSize: 13, color: "#555", textAlign: "center", padding: "24px 0" }}>
            銀行口座がありません。「+ 口座追加」から登録してください。
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(bankGroups).map(([bankName, accs]) => {
            const groupTotal = accs.reduce((s, a) => s + a.balance, 0);
            return (
              <Card key={bankName} style={{ padding: 0 }}>
                <div style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ccc" }}>🏦 {bankName}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#4ECDC4", fontFamily: "monospace" }}>{fmt(groupTotal)}</div>
                </div>
                <div>
                  {accs.map(a => (
                    <div key={a.id} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}>
                      <div style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: a.color ?? "#4ECDC4", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "#ddd", fontWeight: 600, marginBottom: 3 }}>{a.name}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                            background: `${TYPE_COLORS[a.type] ?? "#666"}22`,
                            color: TYPE_COLORS[a.type] ?? "#888",
                            border: `1px solid ${TYPE_COLORS[a.type] ?? "#666"}44`,
                          }}>{a.type}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: a.color ?? "#4ECDC4", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                        {fmt(a.balance)}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button onClick={() => openBankEdit(a)} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 13 }}>✎</button>
                        <button onClick={() => delBank(a.id)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 13 }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── SBI口座 Modal ───────────────────────────────────────────────── */}
      {showModal && (
        <Modal title={editIdx !== null ? "口座を編集" : "口座を追加"} onClose={() => setShowModal(false)}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 8 }}>アイコン</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))} style={{
                  fontSize: 18, padding: "6px 8px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: form.icon === ic ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                }}>{ic}</button>
              ))}
            </div>
          </div>
          <Field label="口座名" value={form.name} onChange={f("name")} placeholder="生活防衛費" />
          <Field label="残高" value={form.balance} onChange={f("balance")} prefix="¥" type="number" />
          <Field label="目標金額（任意）" value={form.target} onChange={f("target")} prefix="¥" type="number" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 8 }}>カラー</label>
            <div style={{ display: "flex", gap: 10 }}>
              {CHART_COLORS.map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{
                  width: 28, height: 28, borderRadius: "50%", background: c,
                  border: form.color === c ? "3px solid #fff" : "2px solid transparent", cursor: "pointer",
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>キャンセル</Btn>
            <Btn onClick={save}>保存</Btn>
          </div>
        </Modal>
      )}

      {/* ── 銀行口座 Modal ──────────────────────────────────────────────── */}
      {showBankModal && (
        <Modal title={bankEditId !== null ? "銀行口座を編集" : "銀行口座を追加"} onClose={() => setShowBankModal(false)}>
          <Field label="銀行名" value={bankForm.bank} onChange={bf("bank")} placeholder="三井住友銀行" />
          <Field label="口座名" value={bankForm.name} onChange={bf("name")} placeholder="Olive 普通" />
          <Field label="残高" value={bankForm.balance} onChange={bf("balance")} prefix="¥" type="number" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 8 }}>種別</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BANK_TYPES.map(t => (
                <button key={t} onClick={() => setBankForm(p => ({ ...p, type: t }))} style={{
                  padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12,
                  background: bankForm.type === t ? `${TYPE_COLORS[t]}33` : "rgba(255,255,255,0.06)",
                  color: bankForm.type === t ? TYPE_COLORS[t] : "#888",
                  outline: bankForm.type === t ? `1px solid ${TYPE_COLORS[t]}66` : "none",
                  fontFamily: "'Noto Sans JP',sans-serif",
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 8 }}>カラー</label>
            <div style={{ display: "flex", gap: 10 }}>
              {CHART_COLORS.map(c => (
                <button key={c} onClick={() => setBankForm(p => ({ ...p, color: c }))} style={{
                  width: 28, height: 28, borderRadius: "50%", background: c,
                  border: bankForm.color === c ? "3px solid #fff" : "2px solid transparent", cursor: "pointer",
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setShowBankModal(false)}>キャンセル</Btn>
            <Btn onClick={saveBank}>保存</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
