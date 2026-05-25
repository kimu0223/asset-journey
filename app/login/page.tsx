"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#080b12",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Noto Sans JP', sans-serif",
    }}>
      <div style={{
        background: "#111827", border: "1px solid #1f2937",
        borderRadius: 16, padding: 40, width: "100%", maxWidth: 400,
      }}>
        <h1 style={{
          color: "#fff", fontSize: 22, fontWeight: 700,
          marginBottom: 8, textAlign: "center",
        }}>
          Asset Journey
        </h1>
        <p style={{ color: "#6b7280", fontSize: 13, textAlign: "center", marginBottom: 32 }}>
          家族の資産管理ダッシュボード
        </p>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <p style={{ color: "#4ECDC4", fontWeight: 600, marginBottom: 12 }}>
              ログインリンクを送信しました
            </p>
            <p style={{ color: "#d1d5db", fontSize: 14, marginBottom: 16 }}>
              <strong>{email}</strong> 宛に「Asset Journey ログインリンク」という件名のメールをお送りしました。
            </p>
            <div style={{
              background: "#1f2937", borderRadius: 8, padding: "14px 16px",
              textAlign: "left",
            }}>
              <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 8px" }}>
                ✉ メール内の「ログイン」ボタンまたはリンクをクリックしてください
              </p>
              <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 8px" }}>
                ⚠ 迷惑メールフォルダも確認してください
              </p>
              <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
                ⏱ リンクの有効期限は1時間です
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", color: "#d1d5db", fontSize: 13, marginBottom: 6 }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8,
                background: "#1f2937", border: "1px solid #374151",
                color: "#fff", fontSize: 14, marginBottom: 8,
                boxSizing: "border-box",
              }}
            />
            {error && (
              <p style={{ color: "#FF6B6B", fontSize: 12, marginBottom: 8 }}>{error}</p>
            )}
            <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 20 }}>
              ログインリンクをメールで送ります。パスワード不要です。
            </p>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px", borderRadius: 8,
                background: loading ? "#374151" : "#FF6B6B",
                color: "#fff", fontWeight: 600, fontSize: 14,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "送信中..." : "ログインリンクを送る"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
