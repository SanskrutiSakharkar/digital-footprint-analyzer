import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import "./CompareReports.css";

/** Find all items saved by saveAnalysisSnapshot (key prefix "analysis:") */
function loadSavedAnalyses() {
  const items = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("analysis:")) continue;
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (parsed && parsed.__kind === "cloud-footprint-analysis") items.push(parsed);
    } catch {}
  }
  return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/** Save a snapshot in the expected shape */
function saveAnalysisSnapshot(name, metrics, meta = {}) {
  const id = (crypto?.randomUUID?.() || `${Date.now()}_${Math.random()}`);
  const payload = { __kind: "cloud-footprint-analysis", id, name, createdAt: Date.now(), metrics, meta };
  localStorage.setItem(`analysis:${id}`, JSON.stringify(payload));
  return id;
}

/** Flatten numeric metrics for arbitrary nested objects */
function flattenNumbers(obj, prefix = "", out = {}) {
  if (obj == null) return out;
  if (Array.isArray(obj)) { obj.forEach((v, i) => flattenNumbers(v, `${prefix}[${i}]`, out)); return out; }
  if (typeof obj === "object") { Object.entries(obj).forEach(([k, v]) => flattenNumbers(v, prefix ? `${prefix}.${k}` : k, out)); return out; }
  if (typeof obj === "number" && isFinite(obj)) out[prefix] = obj;
  return out;
}

/** Compute deltas */
function diffAnalyses(a, b) {
  if (!a || !b) return [];
  const A = flattenNumbers(a.metrics ?? a);
  const B = flattenNumbers(b.metrics ?? b);
  const keys = Array.from(new Set([...Object.keys(A), ...Object.keys(B)])).sort();
  return keys
    .map((k) => {
      const av = A[k] ?? null;
      const bv = B[k] ?? null;
      const delta = (bv != null && av != null) ? (bv - av) : null;
      return { metric: k, a: av, b: bv, delta };
    })
    .filter(r => r.a != null || r.b != null);
}

function when(ts) {
  try { return new Date(ts).toLocaleString(); } catch { return ""; }
}

export default function CompareReports() {
  const all = useMemo(loadSavedAnalyses, []);
  const [leftId, setLeftId] = useState(all[1]?.id ?? all[0]?.id ?? "");
  const [rightId, setRightId] = useState(all[0]?.id ?? "");
  const left = useMemo(() => all.find(a => a.id === leftId), [all, leftId]);
  const right = useMemo(() => all.find(a => a.id === rightId), [all, rightId]);
  const rows = useMemo(() => diffAnalyses(left, right), [left, right]);

  const topDeltas = useMemo(() => (
    rows
      .filter(r => typeof r.delta === "number")
      .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))
      .slice(0, 6)
      .map(r => ({ name: r.metric, change: r.delta }))
  ), [rows]);

  function createDemoSnapshots() {
    // minimal numeric-only metrics so you can instantly test the page
    const base = {
      total_accounts: 14,
      risk_average: 2.1,
      accounts_by_category: { Social: 8, "E-Commerce": 4, Banking: 2 },
      accounts_per_year: { 2022: 3, 2023: 5, 2024: 6 },
    };
    const improved = {
      total_accounts: 12,
      risk_average: 1.6,
      accounts_by_category: { Social: 6, "E-Commerce": 4, Banking: 2 },
      accounts_per_year: { 2022: 3, 2023: 5, 2024: 4 },
    };
    saveAnalysisSnapshot("Demo — Before cleanup", base, { demo: true });
    saveAnalysisSnapshot("Demo — After cleanup", improved, { demo: true });
    // hard refresh the page’s state
    window.location.reload();
  }

  return (
    <div className="compare-bg">
      <div className="compare-container">
        <header className="compare-header">
          <h1>Compare Reports</h1>
          <p>Pick any two saved analyses to see metric deltas.</p>
        </header>

        {all.length === 0 && (
          <div className="card empty-card">
            <p>No saved analyses found. Generate reports first, then save them to compare.</p>
            <button className="btn" onClick={createDemoSnapshots}>Create demo snapshots</button>
          </div>
        )}

        {all.length > 0 && (
          <>
            <section className="grid-two">
              <div className="card">
                <label className="label">Baseline (Left)</label>
                <select className="select" value={leftId} onChange={(e) => setLeftId(e.target.value)}>
                  {all.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.id} — {when(a.createdAt)}
                    </option>
                  ))}
                </select>
                {left && (
                  <div className="meta">
                    <div><span className="muted">Name:</span> {left.name || left.id}</div>
                    <div><span className="muted">Saved:</span> {when(left.createdAt)}</div>
                  </div>
                )}
              </div>

              <div className="card">
                <label className="label">Comparison (Right)</label>
                <select className="select" value={rightId} onChange={(e) => setRightId(e.target.value)}>
                  {all.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.id} — {when(a.createdAt)}
                    </option>
                  ))}
                </select>
                {right && (
                  <div className="meta">
                    <div><span className="muted">Name:</span> {right.name || right.id}</div>
                    <div><span className="muted">Saved:</span> {when(right.createdAt)}</div>
                  </div>
                )}
              </div>
            </section>

            <section className="card">
              <h2 className="card-title">Biggest Changes</h2>
              {topDeltas.length === 0 ? (
                <p className="muted">No numeric metrics in common to compare.</p>
              ) : (
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={topDeltas}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" hide />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="change" name="Δ (Right - Left)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="card table-card">
              <h2 className="card-title">All Metric Deltas</h2>
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="tl">Metric</th>
                      <th className="tr">Left</th>
                      <th className="tr">Right</th>
                      <th className="tr">Δ (R − L)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const deltaClass =
                        typeof r.delta === "number"
                          ? r.delta > 0
                            ? "delta pos"
                            : r.delta < 0
                              ? "delta neg"
                              : "delta zero"
                          : "delta na";
                      return (
                        <tr key={r.metric}>
                          <td className="metric">{r.metric}</td>
                          <td className="tr">{r.a ?? "—"}</td>
                          <td className="tr">{r.b ?? "—"}</td>
                          <td className={`tr ${deltaClass}`}>
                            {typeof r.delta === "number" ? r.delta : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
