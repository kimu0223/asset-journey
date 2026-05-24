# Asset Journey — TODO リスト

> 最終更新: 2026-05-24

---

## 🔴 必須（手動作業）

- [ ] **Supabase URL設定** — ダッシュボードで Site URL と Redirect URL を設定
  URL: https://supabase.com/dashboard/project/nnlbzglsxjnidvnmcrst/auth/url-configuration
  - Site URL: `https://asset-journey.vercel.app`
  - Redirect URLs: `https://asset-journey.vercel.app/auth/callback`

---

## 🟡 実装予定

- [ ] **パートナー（かい）招待UI** — ログイン後に invite_code を表示・共有するページ
  `households.invite_code` を使って `/invite` ページを追加

- [ ] **Realtime同期（Phase 4）** — 夫婦間でリアルタイムデータ反映
  `supabase.channel().on("postgres_changes", ...)` を `useAppState` フックに追加

- [ ] **月次収支データ入力** — 実際の収支スクリーンショットを受け取り次第入力

- [ ] **ライフイベント・資産目標入力** — 実際のデータを受け取り次第入力

- [ ] **メンバー名UI設定** — 壮汰/かい の名前をアプリUIから変更できるようにする

---

## ✅ 完了済み

- [x] Supabaseプロジェクト作成 (`nnlbzglsxjnidvnmcrst`, ap-northeast-1)
- [x] DBスキーマ設計・適用（11テーブル + RLS + トリガー）
- [x] Magic Link認証実装（パスワードレス）
- [x] Repository層実装（fetch + full-replace sync）
- [x] middleware.ts（未認証 → /login リダイレクト）
- [x] 初回ログイン時に実データを自動シード
- [x] Vercel環境変数設定・デプロイ
- [x] 銀行口座一覧機能追加（三井住友/SMBC/住信SBI）
- [x] DashboardTab クラッシュ修正（prevYear undefined）
- [x] 実資産データ反映（2026年5月時点）

---

## 📝 メモ

- Supabaseプロジェクト: `nnlbzglsxjnidvnmcrst`
- デプロイ先: https://asset-journey.vercel.app
- 技術スタック: Next.js 16 + Supabase + Vercel
- 認証: Magic Link（メール）
- データ同期: 楽観的更新 + 非同期full-replace sync
