import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from "recharts";
import {
  FaDownload,
  FaKey,
  FaUserClock,
  FaExclamationCircle,
  FaChartPie
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import "./Report.css";

// Multi-color, lively palette
const PALETTE = [
  "#2563eb", "#38bdf8", "#fbbf24", "#10b981", "#e76f51", "#6a4c93",
  "#0e76a8", "#ef4444", "#3b5998", "#2a9d8f", "#ea4335", "#6ee7b7", "#f472b6"
];

function saveAnalysisSnapshot(name, metrics, meta = {}) {
  const id = (crypto?.randomUUID?.() || `${Date.now()}_${Math.random()}`);
  const payload = {
    __kind: "cloud-footprint-analysis",
    id,
    name,
    createdAt: Date.now(),
    metrics,
    meta
  };
  localStorage.setItem(`analysis:${id}`, JSON.stringify(payload));
  return id;
}

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // Load analysis data (from state or localStorage)
  const analysis = useMemo(() => {
    const fromState = location.state?.analysis;
    if (fromState) return fromState;
    const stored = localStorage.getItem("lastAnalysis");
    return stored ? JSON.parse(stored) : null;
  }, [location.state]);

  // Chart data with colorful palette
  const categoriesData = useMemo(() => {
    const obj = analysis?.accounts_by_category || {};
    const entries = Object.entries(obj);
    if (!entries.length) return [{ name: "Uncategorized", value: analysis?.total_accounts ?? 0, color: "#ccc" }];
    return entries.map(([name, value], i) => ({
      name,
      value,
      color: PALETTE[i % PALETTE.length]
    }));
  }, [analysis]);

  const yearData = useMemo(() => {
    const obj = analysis?.accounts_per_year || {};
    return Object.entries(obj)
      .map(([year, count]) => ({ year: String(year), count }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [analysis]);

  const monthlyData = useMemo(() => {
    const rows = analysis?.enriched_accounts || [];
    const m = {};
    rows.forEach(r => {
      const created = r.created || "";
      const ym = created.slice(0, 7);
      if (ym) m[ym] = (m[ym] || 0) + 1;
    });
    return Object.entries(m)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));
  }, [analysis]);

  const riskBreakdown = analysis?.risk_breakdown || { Low: 0, Medium: 0, High: 0 };
  const riskAvg = analysis?.risk_average ?? 0;

  // Highlights: real categories, not just counts
  const highlights = useMemo(() => {
    if (!analysis) return [];
    const oldest = analysis.oldest_account || "—";
    const unused = (analysis.inactive_accounts || []).length;
    const pwWarn = (analysis.password_hygiene_warnings || []).length;
    const cats = Object.entries(analysis.accounts_by_category || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
    const catHighlights = cats.map(([cat, count], idx) => ({
      icon: <FaChartPie color={PALETTE[(2 + idx) % PALETTE.length]} />,
      label: `Top Category ${idx + 1}`,
      value: `${cat} (${count})`
    }));
    return [
      { icon: <FaUserClock color="#fca311" />, label: "Oldest Account", value: oldest },
      { icon: <FaKey color="#14213d" />, label: "Password Warnings", value: String(pwWarn) },
      { icon: <FaExclamationCircle color="#ef4444" />, label: "Inactive Accounts", value: String(unused) },
      ...catHighlights
    ];
  }, [analysis]);

  const enriched = analysis?.enriched_accounts || [];
  const passwordWarnings = analysis?.password_hygiene_warnings || [];
  const inactiveAccounts = analysis?.inactive_accounts || [];

  const filterByCategory = (servicesArr) => {
    if (!activeCategory) return servicesArr;
    const set = new Set(enriched.filter(r => r.category === activeCategory).map(r => r.service));
    return servicesArr.filter(svc => set.has(svc));
  };
  const shownPwd = filterByCategory(passwordWarnings);
  const shownInactive = filterByCategory(inactiveAccounts);

  if (!analysis) {
    return (
      <div className="report-bg">
        <div className="report-header">
          <h2 className="report-title">Your Analysis Report</h2>
          <p>No analysis data found. Please upload a file first.</p>
        </div>
      </div>
    );
  }

  const downloadCSV = (filename, rows) => {
    const csv = rows.map(r => (Array.isArray(r) ? r.join(",") : r)).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  function handleFullDownload() {
    const csv = [
      ["Metric", "Value"],
      ["Total Accounts", analysis.total_accounts ?? 0],
      ["Oldest Account", analysis.oldest_account ?? ""],
      ["Inactive Accounts", inactiveAccounts.length],
      ["Password Warnings", passwordWarnings.length],
      ["Risk Avg", riskAvg],
      [],
      ["Category", "Count"],
      ...Object.entries(analysis.accounts_by_category || {}).map(([k, v]) => [k, v]),
      [],
      ["Year", "Signups"],
      ...Object.entries(analysis.accounts_per_year || {}).map(([y, c]) => [y, c]),
      [],
      ["Password Hygiene Warnings"],
      ...passwordWarnings.map(svc => [svc]),
      [],
      ["Inactive Accounts"],
      ...inactiveAccounts.map(svc => [svc]),
      [],
      ["Insights"],
      ...(analysis.insights || []).map(t => [t])
    ].map(row => row.join(",")).join("\n");
    downloadCSV("analysis-report.csv", [csv]);
  }

  async function handleExportPDF() {
    const node = reportRef.current;
    const canvas = await html2canvas(node, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const ratio = pageWidth / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 20, canvas.width * ratio, canvas.height * ratio);
    pdf.save("analysis-report.pdf");
  }

  function handleSaveSnapshot() {
    const label = prompt("Name this snapshot (e.g., 'Post-cleanup 21 Sep')") || `Snapshot ${new Date().toLocaleString()}`;
    saveAnalysisSnapshot(label, analysis, { source: "report-page" });
    alert(`Saved snapshot "${label}". Open Compare to see deltas.`);
  }

  function goToCompare() {
    navigate("/compare");
  }

  return (
    <div className="report-bg">
      <div ref={reportRef}>
        {/* ---------- Header & Highlights ---------- */}
        <motion.section className="report-header" initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h2 className="report-title">Your Analysis Report</h2>

          <div className="scorecards">
            <div className="scorecard"><div className="k">Total</div><div className="v">{analysis.total_accounts ?? 0}</div></div>
            <div className="scorecard"><div className="k">Oldest</div><div className="v">{analysis.oldest_account || "—"}</div></div>
            <div className="scorecard"><div className="k">Pwd Warn</div><div className="v">{passwordWarnings.length}</div></div>
            <div className="scorecard"><div className="k">Inactive</div><div className="v">{inactiveAccounts.length}</div></div>
            <div className="scorecard"><div className="k">Risk Avg</div><div className="v">{riskAvg}</div></div>
          </div>

          <div className="highlights-row">
            {highlights.map((h, i) => (
              <motion.div className="highlight-card" key={h.label + i} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 * i }}>
                <span className="highlight-icon">{h.icon}</span>
                <div>
                  <div className="highlight-label">{h.label}</div>
                  <div className="highlight-value">{h.value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="export-row">
            <button className="export-btn" onClick={handleFullDownload} type="button"><FaDownload style={{ marginRight: "0.5em" }} />Download Full Report (CSV)</button>
            <button className="export-btn alt" onClick={handleExportPDF} type="button"><FaDownload style={{ marginRight: "0.5em" }} />Export PDF</button>
            <button className="export-btn" onClick={handleSaveSnapshot} type="button">Save Snapshot</button>
            <button className="export-btn" onClick={goToCompare} type="button">Open Compare</button>
          </div>

          {activeCategory && (
            <div className="filter-chip" onClick={() => setActiveCategory(null)}>Filtering: {activeCategory} ×</div>
          )}
        </motion.section>

        {/* ---------- Charts ---------- */}
        <motion.section className="report-charts" initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.18 }}>
          <div className="charts-row">
            <div className="chart-card center-chart">
              <h4>Accounts by Category</h4>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width={400} height={250}>
                  <BarChart data={categoriesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: "#14213d" }} />
                    <Tooltip />
                    <Bar dataKey="value" barSize={20} onClick={(state) => {
                      const name = state?.activePayload?.[0]?.payload?.name;
                      if (name) setActiveCategory(name);
                    }}>
                      {categoriesData.map((entry, idx) => <Cell key={`cell-bar-${idx}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h4>Account Type Share</h4>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={categoriesData} dataKey="value" nameKey="name" outerRadius={65} onClick={(d) => { if (d && d.name) setActiveCategory(d.name); }}>
                    {categoriesData.map((entry, idx) => <Cell key={`cell-pie-${idx}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend">
                {categoriesData.map((entry, idx) => (
                  <div key={`legend-${idx}`} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: entry.color }} />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h4>Signups Over Time (Year)</h4>
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#fca311" strokeWidth={2.5} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h4>Signups Over Time (Month)</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        {/* ---------- Details ---------- */}
        <motion.section className="report-details" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="details-grid">
            <div className="details-card">
              <h4><FaKey style={{ marginRight: 8 }} />Password Hygiene Warnings ({shownPwd.length})</h4>
              {shownPwd.length === 0 ? (
                <p className="muted">No services flagged. 👍</p>
              ) : (
                <>
                  <ul className="list">{shownPwd.map((svc, idx) => <li key={`pw-${idx}`}>{svc}</li>)}</ul>
                  <button className="mini-btn" onClick={() => downloadCSV("password-warnings.csv", [["Service"], ...shownPwd.map(s => [s])])}>
                    <FaDownload style={{ marginRight: 5 }} /> Export List
                  </button>
                </>
              )}
            </div>

            <div className="details-card">
              <h4><FaExclamationCircle style={{ marginRight: 8 }} />Inactive Accounts ({shownInactive.length})</h4>
              {shownInactive.length === 0 ? (
                <p className="muted">No inactive accounts detected.</p>
              ) : (
                <>
                  <ul className="list">{shownInactive.map((svc, idx) => <li key={`inactive-${idx}`}>{svc}</li>)}</ul>
                  <button className="mini-btn" onClick={() => downloadCSV("inactive-accounts.csv", [["Service"], ...shownInactive.map(s => [s])])}>
                    <FaDownload style={{ marginRight: 5 }} /> Export List
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="details-card risk-block">
            <h4>Risk Breakdown</h4>
            <div className="risk-pills">
              <span className="pill low">Low: {riskBreakdown.Low || 0}</span>
              <span className="pill med">Medium: {riskBreakdown.Medium || 0}</span>
              <span className="pill high">High: {riskBreakdown.High || 0}</span>
            </div>
          </div>

          {Array.isArray(analysis.insights) && analysis.insights.length > 0 && (
            <div className="details-card">
              <h4>Insights</h4>
              <ul className="list">{analysis.insights.map((t, i) => <li key={`ins-${i}`}>{t}</li>)}</ul>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
