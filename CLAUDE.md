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

1. **Supabase連携** — 複数デバイス間でデータ同期（現状はlocalStorageのみ）
2. **ライフイベントタイムライン** — 子供入学・車購入等をビジュアル表示
3. **NISA枠残高管理** — 年間投資枠（成長投資枠・積立枠）のトラッキング
4. **資産目標設定** — 「60歳までに1億円」などのゴール設定と達成予測
5. **CSV/JSONエクスポート** — データのバックアップ機能
