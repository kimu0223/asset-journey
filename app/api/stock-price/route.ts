import { NextResponse } from "next/server";

// Yahoo Finance v8 — no API key required
// Supports Japanese stocks (7203.T) and US stocks (AAPL)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json({ error: "ticker required" }, { status: 400 });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;

    if (!meta) throw new Error("No data returned");

    const price = meta.regularMarketPrice ?? meta.previousClose;
    const currency = meta.currency ?? "JPY";
    const name = meta.shortName ?? ticker;

    return NextResponse.json({
      ticker,
      price,
      currency,
      name,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Stock price fetch error:", e);
    return NextResponse.json(
      { error: "Failed to fetch price", ticker },
      { status: 500 }
    );
  }
}
