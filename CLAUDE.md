# Asset Journey — Claude Code コンテキスト

## プロジェクト概要
家族向け資産管理ダッシュボード。毎日の家計簿ではなく「月1回5分で資産を把握する」ことに特化。

**コンセプト:** 人生の資産管理ダッシュボード  
**ターゲット:** 投資・NISA・不動産購入を考えている家族持ちの個人開発者  
**URL予定:** Vercelでデプロイ → URLで家族と共有

---

## 技術スタック

| 項目 | 採用技術 |
|------|----------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS + inline styles |
| チャート | Recharts |
| 株価取得 | Yahoo Finance v8 API（APIキー不要） |
| データ永続化 | localStorage（`asset-journey-v1`キー） |
| デプロイ | Vercel |

---

## ディレクトリ構成

```
app/
├── api/
│   └── stock-price/route.ts   # Yahoo Finance プロキシAPI
├── components/
│   ├── ui.tsx                  # 共通UI（Modal, Field, Btn, Card等）
│   ├── DashboardTab.tsx        # トップサマリー
│   ├── MonthlyTab.tsx          # 月次収支
│   ├── YearlyTab.tsx           # 年次資産推移
│   ├── AccountsTab.tsx         # SBI住信 目的別口座
│   ├── StocksTab.tsx           # 保有証券（株価自動取得）
│   └── RealEstateTab.tsx       # 不動産購入シミュレーション
├── lib/
│   └── data.ts                 # 型定義・初期データ・localStorage utils
├── page.tsx                    # メインページ（タブ管理・状態管理）
├── layout.tsx                  # HTML shell + Google Fonts
└── globals.css                 # ベーススタイル
```

---

## データ構造（app/lib/data.ts）

```ts
interface AppState {
  monthly:  MonthlyRecord[];   // 月次収支
  yearly:   YearlyRecord[];    // 年次資産
  accounts: SbiAccount[];      // SBI目的別口座
  stocks:   StockHolding[];    // 保有証券
}
```

**localStorage キー:** `asset-journey-v1`  
**保存タイミング:** 状態変更のたびに自動保存（useEffectで監視）

---

## 株価取得の仕組み

- `GET /api/stock-price?ticker=7203.T` のように呼ぶ
- サーバーサイドでYahoo Finance v8 APIにfetchしてCORSを回避
- 日本株: `7203.T`（証券コード+`.T`）
- 米国株: `AAPL`（そのまま）
- レスポンス: `{ ticker, price, currency, name, updatedAt }`
- キャッシュ: 5分（`next: { revalidate: 300 }`）

---

## デザイン仕様

- **テーマ:** ダークテーマ固定（`#080b12` 背景）
- **アクセントカラー:** `#FF6B6B`（赤）、`#4ECDC4`（ティール）、`#FFE66D`（黄）
- **フォント:** Noto Sans JP（本文）、Noto Serif JP（見出し）
- **モバイル対応:**
  - 〜768px: ハンバーガーメニュー + 画面下部タブバー
  - 769px〜: 上部タブナビゲーション

---

## タブ一覧

| タブID | コンポーネント | 機能 |
|--------|---------------|------|
| `dashboard` | DashboardTab | KPI・折れ線・円グラフ・口座サマリー |
| `monthly` | MonthlyTab | 月次収支 CRUD・棒グラフ |
| `yearly` | YearlyTab | 年次資産 CRUD・積み上げ棒・含み益グラフ |
| `accounts` | AccountsTab | SBI口座 CRUD・目標進捗バー・円グラフ |
| `stocks` | StocksTab | 保有証券 CRUD・Yahoo Finance株価取得 |
| `realestate` | RealEstateTab | スライダー式 頭金シミュ・ローン試算 |

---

## 開発時の注意

- `"use client"` は各コンポーネントファイルの先頭に必要（全コンポーネントがクライアントコンポーネント）
- `page.tsx` の `update()` 関数でイミュータブルな状態更新をしている
- テーブルはモバイルで `overflowX: "auto"` + `minWidth` で横スクロール対応済み
- グリッドはclassNameベースのメディアクエリで切り替え（`<style>` タグをJSX内に埋め込む方式）

---

## デプロイ

```bash
# ローカル確認
npm run dev

# Vercelへデプロイ
npx vercel --prod
```

環境変数は現状不要（Yahoo Finance APIキー不要）。

---

## 今後の拡張アイデア（優先度順）

| # | 機能 | 状態 | 概要 |
|---|------|------|------|
| 1 | **Supabase連携** | 未実装 | 複数デバイス間でデータ同期 |
| 2 | **ライフイベントタイムライン** | 未実装 | 子供入学・車購入等をビジュアル表示 |
| 3 | **NISA枠残高管理** | 未実装 | 年間投資枠（成長投資枠・積立枠）のトラッキング |
| 4 | **資産目標設定** | 未実装 | 「60歳までに1億円」などのゴール設定と達成予測 |
| 5 | **CSV/JSONエクスポート** | 未実装 | データのバックアップ機能 |

---

## クイックコマンド

```bash
npm run dev          # 開発サーバー起動 (http://localhost:3000)
npm run build        # 本番ビルド確認
npx tsc --noEmit     # 型チェックのみ
npx vercel --prod    # Vercelへ本番デプロイ
```

---

## コンポーネントパターン

### UIプリミティブ（app/components/ui.tsx）

```tsx
// Modal — フォームダイアログ
<Modal title="タイトル" onClose={() => setShowModal(false)}>
  <Field label="ラベル" value={val} onChange={v => setVal(v)} />
  <Field label="金額" value={num} onChange={v => setNum(v)} type="number" prefix="¥" />
  <Select label="区分" value={sel} onChange={v => setSel(v)} options={[...]} />
  <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20 }}>
    <Btn variant="ghost" onClick={() => setShowModal(false)}>キャンセル</Btn>
    <Btn onClick={save}>保存</Btn>
  </div>
</Modal>

// Card — コンテンツブロック
<Card>内容</Card>
<Card style={{ padding:0 }}>// テーブルなど padding なし</Card>

// SectionHeader — タブ見出し
<SectionHeader title="セクション名" sub="サブテキスト" />

// Btn variants
<Btn onClick={...}>通常（赤）</Btn>
<Btn variant="ghost" onClick={...}>ゴースト（薄灰）</Btn>
<Btn variant="danger" onClick={...}>危険（薄赤）</Btn>
```

### モバイル対応パターン

```tsx
// グリッドのレスポンシブ（JSX内styleタグ方式）
<div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }} className="my-grid">
  <style>{`@media(max-width:640px){.my-grid{grid-template-columns:1fr!important;}}`}</style>
  ...
</div>
```

---

## 新タブ追加チェックリスト

1. `app/components/NewTab.tsx` を作成（先頭に `"use client";`）
2. `app/lib/data.ts` に型・初期データ・AppStateキーを追加
3. `app/page.tsx` の `TABS` 配列にエントリ追加
4. `page.tsx` の `main` 内に `{tab==="newtab" && <NewTab ... />}` 追加
5. `update()` 関数経由で状態更新（イミュータブルパターン維持）

---

## Claude Code設定（.claude/settings.json）

- `npm run dev/build/start/lint` — 自動許可
- `npx tsc --noEmit` — 型チェック自動許可
- `npx vercel --prod` — デプロイ自動許可
- `git status/diff/add/commit` — 自動許可
- ファイル編集後にTypeScript型チェックを自動実行（hooks）
