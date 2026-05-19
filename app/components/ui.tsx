"use client";
import React from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

interface FieldProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  prefix?: string;
  placeholder?: string;
}

interface BtnProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger";
  style?: React.CSSProperties;
  disabled?: boolean;
  type?: "button" | "submit";
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0e1118", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16, padding: 24, maxWidth: 520, width: "100%",
          maxHeight: "90vh", overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "#fff", fontSize: 16, fontFamily: "'Noto Serif JP', serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, value, onChange, type = "text", prefix, placeholder }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 5, letterSpacing: "0.05em" }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#666", fontSize: 13, pointerEvents: "none" }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: prefix ? "10px 12px 10px 24px" : "10px 12px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, color: "#fff", fontSize: 14,
            boxSizing: "border-box", outline: "none",
            fontFamily: "monospace",
          }}
        />
      </div>
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}
export function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, color: "#888", marginBottom: 5, letterSpacing: "0.05em" }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "10px 12px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, color: "#fff", fontSize: 14,
          outline: "none", fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value} style={{ background: "#0e1118" }}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ onClick, children, variant = "primary", style: s, disabled, type = "button" }: BtnProps) {
  const bg =
    variant === "primary" ? "#FF6B6B" :
    variant === "danger"  ? "rgba(255,80,80,0.2)" :
    "rgba(255,255,255,0.08)";
  const color =
    variant === "primary" ? "#fff" :
    variant === "danger"  ? "#ff6b6b" :
    "#ccc";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 20px", borderRadius: 8, border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600, fontSize: 13, letterSpacing: "0.03em",
        background: disabled ? "rgba(255,255,255,0.05)" : bg,
        color: disabled ? "#555" : color,
        fontFamily: "'Noto Sans JP', sans-serif",
        ...s,
      }}
    >
      {children}
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 4, height: 22, background: "#FF6B6B", borderRadius: 2 }} />
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Noto Serif JP', serif" }}>
          {title}
        </h2>
      </div>
      {sub && <p style={{ margin: "4px 0 0 14px", fontSize: 12, color: "#888", fontFamily: "monospace" }}>{sub}</p>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style: s }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.07)",
      padding: 22,
      ...s,
    }}>
      {children}
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}
export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,12,20,0.97)", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#e8e8e8",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: "#fff" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: ¥{p.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
}
