"use client";
import { useState, useEffect, useCallback } from "react";
import {
  AppState, loadState, saveState,
  MonthlyRecord, YearlyRecord, SbiAccount, StockHolding, NisaRecord, LifeEvent, MemberConfig, Subscription, AssetGoal,
} from "./lib/data";
import DashboardTab   from "./components/DashboardTab";
import MonthlyTab     from "./components/MonthlyTab";
import YearlyTab      from "./components/YearlyTab";
import AccountsTab    from "./components/AccountsTab";
import StocksTab      from "./components/StocksTab";
import NisaTab        from "./components/NisaTab";
import LifeEventsTab      from "./components/LifeEventsTab";
import RealEstateTab      from "./components/RealEstateTab";
import SubscriptionsTab   from "./components/SubscriptionsTab";
import GoalsTab          from "./components/GoalsTab";
import { Modal, Btn } from "./components/ui";

const APP_PIN = process.env.NEXT_PUBLIC_APP_PIN ?? "asset2024";

const TABS = [
  { id: "dashboard",   label: "ダッシュボード", icon: "📊" },
  { id: "monthly",       label: "月次収支",       icon: "📅" },
  { id: "subscriptions", label: "サブスク管理",   icon: "💳" },
  { id: "yearly",        label: "年次資産",       icon: "📈" },
  { id: "goals",         label: "資産目標",       icon: "🎯" },
  { id: "accounts",    label: "目的別口座",     icon: "🏦" },
  { id: "stocks",      label: "保有証券",       icon: "💹" },
  { id: "nisa",        label: "NISA枠管理",     icon: "💰" },
  { id: "events",      label: "ライフイベント", icon: "🗓️" },
  { id: "realestate",  label: "不動産シミュ",   icon: "🏠" },
];

function exportState(state: AppState) {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `asset-journey-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportMonthlyCsv(state: AppState) {
  const rows = ["月,収入,支出,残高", ...state.monthly.map(r => `${r.month},${r.income},${r.expense},${r.balance}`)];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `monthly-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportYearlyCsv(state: AppState) {
  const rows = ["年,現金,NISA,高配当株,投資信託,NISA含み益,株含み益", ...state.yearly.map(r => `${r.year},${r.cash},${r.nisa},${r.stock},${r.trust},${r.nisaGain},${r.stockGain}`)];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `yearly-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportPdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2canvas = (await import("html2canvas")).default as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { jsPDF } = (await import("jspdf")) as any;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#080b12",
    logging: false,
  });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  let y = 0;
  while (y < imgH) {
    if (y > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, -y, imgW, imgH);
    y += pageH;
  }
  pdf.save(filename);
}

export default function Page() {
  const [tab, setTab]           = useState("dashboard");
  const [authed, setAuthed]     = useState<boolean | null>(null);
  const [pin, setPin]           = useState("");
  const [pinError, setPinError] = useState("");
  const [state, setState]       = useState<AppState | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("asset-journey-auth") === "1") {
      setAuthed(true);
    } else {
      setAuthed(false);
    }
  }, []);

  useEffect(() => { setState(loadState()); }, []);

  useEffect(() => {
    if (!state) return;
    saveState(state);
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1200);
    return () => clearTimeout(t);
  }, [state]);

  const update = useCallback(<K extends keyof AppState>(key: K) =>
    (fn: (prev: AppState[K]) => AppState[K]) => {
      setState(prev => { if (!prev) return prev; return { ...prev, [key]: fn(prev[key]) }; });
    }, []);

  const handlePinSubmit = () => {
    if (pin === APP_PIN) {
      sessionStorage.setItem("asset-journey-auth", "1");
      setAuthed(true);
      setPinError("");
    } else {
      setPinError("パスワードが違います");
      setPin("");
    }
  };

  if (authed === null) return null;
  if (!authed) {
    return (
      <div style={{
        minHeight: "100vh", background: "#080b12",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}>
        <div style={{
          background: "#0e1118",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16, padding: 40,
          maxWidth: 380, width: "100%",
          textAlign: "center",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "linear-gradient(135deg,#FF6B6B,#FFE66D)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 16px",
          }}>💹</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'Noto Serif JP', serif", marginBottom: 6 }}>
            Asset Journey
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 28 }}>家族の資産ダッシュボード</div>
          <input
            type="password"
            value={pin}
            onChange={e => { setPin(e.target.value); setPinError(""); }}
            onKeyDown={e => e.key === "Enter" && handlePinSubmit()}
            placeholder="パスワードを入力"
            autoFocus
            style={{
              width: "100%", padding: "12px 14px",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${pinError ? "#FF6B6B" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 8, color: "#fff", fontSize: 14,
              boxSizing: "border-box", outline: "none",
              fontFamily: "monospace", marginBottom: 12,
            }}
          />
          {pinError && (
            <div style={{ fontSize: 12, color: "#FF6B6B", marginBottom: 12 }}>{pinError}</div>
          )}
          <button
            onClick={handlePinSubmit}
            style={{
              width: "100%", padding: "12px",
              background: "#FF6B6B", border: "none",
              borderRadius: 8, color: "#fff",
              fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"#555" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:32,marginBottom:12 }}>💹</div>
          <div style={{ fontFamily:"monospace",fontSize:13 }}>Loading...</div>
        </div>
      </div>
    );
  }

  const activeTab = TABS.find(t => t.id === tab) ?? TABS[0];

  return (
    <div style={{ minHeight:"100vh",background:"#080b12" }}>
      <header style={{
        padding:"0 20px", height:56,
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:"rgba(0,0,0,0.4)", backdropFilter:"blur(12px)",
        position:"sticky", top:0, zIndex:200,
      }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{
            width:32,height:32,borderRadius:8,
            background:"linear-gradient(135deg,#FF6B6B,#FFE66D)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
          }}>💹</div>
          <div>
            <div style={{ fontSize:15,fontWeight:700,fontFamily:"'Noto Serif JP',serif",color:"#fff" }}>Asset Journey</div>
            <div style={{ fontSize:9,color:"#555",letterSpacing:"0.08em" }}>家族の資産ダッシュボード</div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <button
            onClick={() => setShowExport(true)}
            style={{
              background:"rgba(78,205,196,0.12)", border:"1px solid rgba(78,205,196,0.3)",
              color:"#4ECDC4", fontSize:11, fontWeight:600, borderRadius:6,
              padding:"5px 10px", cursor:"pointer", letterSpacing:"0.03em",
              fontFamily:"'Noto Sans JP',sans-serif", whiteSpace:"nowrap",
            }}
          >
            ⬇ エクスポート
          </button>
          <div style={{ fontSize:10,color:saved?"#4ECDC4":"#555",fontFamily:"monospace",transition:"color 0.3s" }}>
            {saved ? "✓ 保存" : "自動保存"}
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(p=>!p)}
            style={{ background:"none",border:"none",color:"#888",fontSize:20,cursor:"pointer",padding:4 }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      <nav className="desktop-nav" style={{ padding:"0 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",overflowX:"auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"13px 16px", border:"none", background:"none",
            color:tab===t.id?"#FF6B6B":"#666",
            fontWeight:tab===t.id?700:400, fontSize:13, cursor:"pointer",
            borderBottom:tab===t.id?"2px solid #FF6B6B":"2px solid transparent",
            whiteSpace:"nowrap", transition:"color 0.2s",
            fontFamily:"'Noto Sans JP',sans-serif",
          }}>
            <span style={{ marginRight:6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      {menuOpen && (
        <div className="mobile-menu" style={{
          position:"fixed",top:56,left:0,right:0,bottom:0,
          background:"rgba(8,11,18,0.98)", backdropFilter:"blur(8px)",
          zIndex:150, display:"flex", flexDirection:"column", padding:"16px 0", overflowY:"auto",
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false); }} style={{
              padding:"16px 28px", border:"none",
              background:tab===t.id?"rgba(255,107,107,0.1)":"none",
              color:tab===t.id?"#FF6B6B":"#bbb",
              fontWeight:tab===t.id?700:400, fontSize:16, cursor:"pointer",
              textAlign:"left",
              borderLeft:tab===t.id?"3px solid #FF6B6B":"3px solid transparent",
              fontFamily:"'Noto Sans JP',sans-serif",
            }}>
              <span style={{ marginRight:12,fontSize:18 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      )}

      <main id="pdf-main" style={{ padding:"24px 20px",maxWidth:1100,margin:"0 auto" }}>
        <div className="mobile-breadcrumb" style={{ marginBottom:20,fontSize:12,color:"#666" }}>
          {activeTab.icon} {activeTab.label}
        </div>

        {tab==="dashboard"  && <DashboardTab  monthly={state.monthly} yearly={state.yearly} accounts={state.accounts} stocks={state.stocks} members={state.members} />}
        {tab==="monthly"        && <MonthlyTab       monthly={state.monthly}          setMonthly={update("monthly") as (fn:(prev:MonthlyRecord[])=>MonthlyRecord[])=>void} />}
        {tab==="subscriptions"  && <SubscriptionsTab subscriptions={state.subscriptions} setSubscriptions={update("subscriptions") as (fn:(prev:Subscription[])=>Subscription[])=>void} />}
        {tab==="yearly"     && <YearlyTab     yearly={state.yearly}    setYearly={update("yearly") as (fn:(prev:YearlyRecord[])=>YearlyRecord[])=>void} />}
        {tab==="accounts"   && <AccountsTab   accounts={state.accounts} setAccounts={update("accounts") as (fn:(prev:SbiAccount[])=>SbiAccount[])=>void} />}
        {tab==="stocks"     && <StocksTab     stocks={state.stocks}    setStocks={update("stocks") as (fn:(prev:StockHolding[])=>StockHolding[])=>void} />}
        {tab==="nisa"       && <NisaTab       nisa={state.nisa}        setNisa={update("nisa") as (fn:(prev:NisaRecord[])=>NisaRecord[])=>void} />}
        {tab==="events"     && <LifeEventsTab events={state.events}   setEvents={update("events") as (fn:(prev:LifeEvent[])=>LifeEvent[])=>void} />}
        {tab==="realestate" && <RealEstateTab yearly={state.yearly} />}
        {tab==="goals"      && <GoalsTab goals={state.goals} setGoals={update("goals") as (fn:(prev:AssetGoal[])=>AssetGoal[])=>void} />}
      </main>

      <nav className="bottom-nav" style={{ overflowX:"auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false); }} style={{
            flex:"none", minWidth:60, border:"none", background:"none",
            color:tab===t.id?"#FF6B6B":"#555",
            padding:"8px 2px 6px", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:3,
          }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ fontSize:8,fontFamily:"'Noto Sans JP',sans-serif",fontWeight:tab===t.id?700:400 }}>
              {t.label.slice(0,4)}
            </span>
          </button>
        ))}
      </nav>

      {showExport && state && (
        <Modal title="⬇ データエクスポート" onClose={() => setShowExport(false)}>
          <p style={{ fontSize:12,color:"#888",margin:"0 0 16px",lineHeight:1.6 }}>
            保存先はブラウザのダウンロードフォルダです。
          </p>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            <Btn
              variant="ghost"
              onClick={() => { exportState(state); setShowExport(false); }}
              style={{ width:"100%",textAlign:"left",justifyContent:"flex-start" }}
            >
              📋 JSON完全バックアップ
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => { exportMonthlyCsv(state); setShowExport(false); }}
              style={{ width:"100%",textAlign:"left",justifyContent:"flex-start" }}
            >
              📊 月次収支 CSV
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => { exportYearlyCsv(state); setShowExport(false); }}
              style={{ width:"100%",textAlign:"left",justifyContent:"flex-start" }}
            >
              📈 年次資産 CSV
            </Btn>
            <Btn
              variant="ghost"
              onClick={async () => {
                setShowExport(false);
                await new Promise(r => setTimeout(r, 100));
                await exportPdf("pdf-main", `asset-journey-${new Date().toISOString().slice(0, 10)}.pdf`);
              }}
              style={{ width:"100%",textAlign:"left",justifyContent:"flex-start" }}
            >
              📄 PDF ダウンロード（現在の画面）
            </Btn>
          </div>
        </Modal>
      )}

      <style>{`
        .hamburger { display:none; }
        .bottom-nav { display:none; }
        .mobile-breadcrumb { display:none; }
        @media (max-width:768px) {
          .hamburger { display:block !important; }
          .desktop-nav { display:none !important; }
          .mobile-breadcrumb { display:block !important; }
          .bottom-nav {
            display:flex !important; position:fixed; bottom:0; left:0; right:0;
            background:rgba(8,11,18,0.97);
            border-top:1px solid rgba(255,255,255,0.08);
            z-index:100; padding:0 0 env(safe-area-inset-bottom);
          }
          main { padding-bottom:80px !important; }
        }
      `}</style>
    </div>
  );
}
