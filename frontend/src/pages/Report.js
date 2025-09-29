// src/pages/Report.js
import React, { useMemo, useRef } from "react";
import {
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { FaDownload, FaKey, FaUserClock, FaExclamationCircle, FaChartPie, FaLightbulb, FaExclamationTriangle } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import "./Report.css";

// Demo fallback (replace with prop/real data if passed)
const FALLBACK_ANALYSIS = {
  total_accounts: 19,
  oldest_account: "2012-03-12",
  password_hygiene_warnings: ["Facebook", "Instagram", "Amazon"],
  inactive_accounts: ["Pinterest", "Booking.com", "GitHub"],
  risk_breakdown: { Low: 12, Medium: 5, High: 2 },
  risk_average: 1.7,
  accounts_by_category: { "Social Media": 5, Banking: 3, "E-Commerce": 4, Education: 2, Entertainment: 3, Travel: 2 },
  accounts_per_year: { "2012": 2, "2014": 2, "2016": 3, "2018": 3, "2020": 3, "2023": 6 },
  account_age_distribution: { "<1 year": 2, "1-3 years": 7, ">3 years": 10 },
  insights: [
    "2 high-risk account(s) found.",
    "Some accounts need password updates.",
    "Inactive accounts detected; review for deletion."
  ]
};

const PALETTE = [
  "#2563eb", "#38bdf8", "#fbbf24", "#ef4444", "#0ea5e9", "#b6d0fa", "#14213d", "#fca311", "#0d9488",
];

export default function Report({ analysis }) {
  // Choose real analysis or fallback
  const reportData = analysis || FALLBACK_ANALYSIS;

  // Data hooks
  const categoriesData = useMemo(() => {
    const obj = reportData.accounts_by_category || {};
    return Object.entries(obj).map(([name, value], i) => ({
      name, value, color: PALETTE[i % PALETTE.length]
    }));
  }, [reportData]);

  const riskData = useMemo(() =>
    Object.entries(reportData.risk_breakdown || {}).map(([level, value]) => ({
      name: level,
      value,
      color: level === "High" ? "#ef4444" : level === "Medium" ? "#fbbf24" : "#22c55e"
    })), [reportData]
  );

  const ageData = useMemo(() =>
    Object.entries(reportData.account_age_distribution || {}).map(([k, v]) => ({
      age: k, count: v
    })), [reportData]
  );

  const yearData = useMemo(() => {
    const obj = reportData.accounts_per_year || {};
    const rows = Object.entries(obj).map(([year, count]) => ({ year: String(year), count }));
    rows.sort((a, b) => Number(a.year) - Number(b.year));
    return rows;
  }, [reportData]);

  // Highlights row
  const highlights = [
    { icon: <FaUserClock color="#fca311" />, label: "Oldest Account", value: reportData.oldest_account || "—" },
    { icon: <FaKey color="#2563eb" />, label: "Password Warnings", value: (reportData.password_hygiene_warnings || []).length },
    { icon: <FaExclamationCircle color="#ef4444" />, label: "Inactive Accounts", value: (reportData.inactive_accounts || []).length },
    { icon: <FaChartPie color="#0d9488" />, label: "Top Category", value: Object.keys(reportData.accounts_by_category || {})[0] || "—" }
  ];

  // CSV/PDF export
  const reportRef = useRef();
  const downloadCSV = () => {
    const csv = [
      "Metric,Value",
      "Total Accounts," + reportData.total_accounts,
      "Oldest Account," + reportData.oldest_account,
      "Risk Avg," + reportData.risk_average,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "report.csv"; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };
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

  // Export list (password/inactive)
  const exportList = (items, file) => {
    const csv = items.map(x => `"${x}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = file; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // --- Render ---
  return (
    <div className="report-bg">
      <div ref={reportRef}>
        {/* Header, Scorecards, Highlights */}
        <motion.section className="report-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="report-title">Your Analysis Report</h2>
          <div className="scorecards">
            <div className="scorecard"><div className="k">Total</div><div className="v">{reportData.total_accounts}</div></div>
            <div className="scorecard"><div className="k">Oldest</div><div className="v">{reportData.oldest_account}</div></div>
            <div className="scorecard"><div className="k">Pwd Warn</div><div className="v">{reportData.password_hygiene_warnings.length}</div></div>
            <div className="scorecard"><div className="k">Inactive</div><div className="v">{reportData.inactive_accounts.length}</div></div>
            <div className="scorecard"><div className="k">Risk Avg</div><div className="v">{reportData.risk_average}</div></div>
          </div>
          <div className="highlights-row">
            {highlights.map((h, i) => (
              <motion.div className="highlight-card" key={h.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 * i }}>
                <span className="highlight-icon">{h.icon}</span>
                <div>
                  <div className="highlight-label">{h.label}</div>
                  <div className="highlight-value">{h.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="export-row">
            <button className="export-btn" onClick={downloadCSV}><FaDownload style={{ marginRight: 6 }} /> Download Full Report (CSV)</button>
            <button className="export-btn alt" onClick={handleExportPDF}><FaDownload style={{ marginRight: 6 }} /> Export PDF</button>
          </div>
        </motion.section>

        {/* Analysis Charts */}
        <motion.section className="report-charts" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.18 }}>
          <div className="charts-row">
            <div className="chart-card">
              <h4>Account Type Share</h4>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={categoriesData} dataKey="value" nameKey="name" outerRadius={65}>
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
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* New: Risk & Age */}
          <div className="charts-row">
            <div className="chart-card">
              <h4>Risk Breakdown</h4>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={60} label>
                    {riskData.map((entry, idx) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Detailed Risk List */}
              <div className="risk-details-list">
                <div><span className="pill low"></span>Low: {reportData.risk_breakdown.Low}</div>
                <div><span className="pill med"></span>Medium: {reportData.risk_breakdown.Medium}</div>
                <div><span className="pill high"></span>High: {reportData.risk_breakdown.High}</div>
              </div>
            </div>
            <div className="chart-card">
              <h4>Account Age Distribution</h4>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={ageData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="age" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#fca311" radius={6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>

        {/* Detailed Lists Section */}
        <motion.section className="details-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.20 }}>
          <div className="details-card">
            <h4><FaKey style={{ marginRight: 8 }} />Password Hygiene Warnings ({reportData.password_hygiene_warnings.length})</h4>
            {reportData.password_hygiene_warnings.length === 0 ? (
              <p className="muted">No services flagged. 👍</p>
            ) : (
              <>
                <ul className="list">{reportData.password_hygiene_warnings.map((svc, idx) => <li key={`pw-${idx}`}>{svc}</li>)}</ul>
                <button className="mini-btn" onClick={() => exportList(reportData.password_hygiene_warnings, "password-warnings.csv")}>
                  <FaDownload style={{ marginRight: 5 }} /> Export List
                </button>
              </>
            )}
          </div>
          <div className="details-card">
            <h4><FaExclamationCircle style={{ marginRight: 8 }} />Inactive Accounts ({reportData.inactive_accounts.length})</h4>
            {reportData.inactive_accounts.length === 0 ? (
              <p className="muted">No inactive accounts detected.</p>
            ) : (
              <>
                <ul className="list">{reportData.inactive_accounts.map((svc, idx) => <li key={`inactive-${idx}`}>{svc}</li>)}</ul>
                <button className="mini-btn" onClick={() => exportList(reportData.inactive_accounts, "inactive-accounts.csv")}>
                  <FaDownload style={{ marginRight: 5 }} /> Export List
                </button>
              </>
            )}
          </div>
        </motion.section>

        {/* Insights section */}
        {Array.isArray(reportData.insights) && reportData.insights.length > 0 && (
          <section style={{ margin: "2.5rem auto 1.5rem auto", maxWidth: 900 }}>
            <div className="insights-card" style={{
              background: "#fff", borderRadius: 14, boxShadow: "0 2px 18px rgba(253,186,116,0.09)", padding: "1.5rem 2rem", margin: "1.3rem auto"
            }}>
              <h4 style={{ color: "#f59e42", fontWeight: 700, fontSize: "1.12rem", display: "flex", alignItems: "center", gap: 9 }}>
                <FaLightbulb style={{ color: "#fbbf24" }} /> Insights & Warnings
              </h4>
              <ul style={{ marginTop: 13, marginBottom: 2 }}>
                {reportData.insights.map((msg, idx) => (
                  <li key={idx} style={{ margin: "0.3em 0", color: "#d97706", fontWeight: 600, fontSize: "1.03rem", display: "flex", alignItems: "center", gap: 8 }}>
                    <FaExclamationTriangle style={{ color: "#fb923c" }} /> {msg}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
      <footer className="report-footer">
        <p>Analysis Completed!</p>
      </footer>
    </div>
  );
}
