// SignalLab D2 probe (SL-1031-01): minimal Node service for Render free
// tier (Frankfurt) that measures reachability of Binance fapi public
// endpoints from the service egress. No dependencies. Delete after use.
const http = require("http");

const BASE = "https://fapi.binance.com";
const EPS = {
  ping: BASE + "/fapi/v1/ping",
  klines: BASE + "/fapi/v1/klines?symbol=BTCUSDT&interval=1h&limit=2",
  openInterest: BASE + "/fapi/v1/openInterest?symbol=BTCUSDT",
  oiHist: BASE + "/futures/data/openInterestHist?symbol=BTCUSDT&period=5m&limit=3",
  topPos: BASE + "/futures/data/topLongShortPositionRatio?symbol=BTCUSDT&period=5m&limit=3",
  topAcc: BASE + "/futures/data/topLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=3",
  globAcc: BASE + "/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=3",
  taker: BASE + "/futures/data/takerlongshortRatio?symbol=BTCUSDT&period=5m&limit=3",
};
const SUPPLEMENT = {
  premiumIndex: BASE + "/fapi/v1/premiumIndex?symbol=BTCUSDT",
};
const IPIFY = "https://api.ipify.org?format=json";

async function probe(url) {
  const t0 = Date.now();
  try {
    const r = await fetch(url, { headers: { "User-Agent": "signallab-d2-probe" } });
    const txt = await r.text();
    return { status: r.status, ms: Date.now() - t0, head: txt.slice(0, 200) };
  } catch (e) {
    return { status: null, ms: Date.now() - t0, error: String(e).slice(0, 160) };
  }
}

async function runProbe() {
  const out = {
    probe: "signallab-d2-render",
    ts: new Date().toISOString(),
    render_region_env: process.env.RENDER_REGION || null,
    results: {},
    supplement: {},
    egress: {},
  };
  for (const [k, u] of Object.entries(EPS)) out.results[k] = await probe(u);
  for (const [k, u] of Object.entries(SUPPLEMENT)) out.supplement[k] = await probe(u);
  out.egress.ipify = await probe(IPIFY);
  return out;
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/probe") {
    const out = await runProbe();
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(out, null, 1));
    return;
  }
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: true, service: "signallab-d2-probe", ts: new Date().toISOString() }));
});

const port = process.env.PORT || 10000;
server.listen(port, () => console.log("probe listening on", port));
