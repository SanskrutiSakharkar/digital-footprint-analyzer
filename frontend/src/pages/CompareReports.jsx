import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import "./CompareReports.css";

const COLORS = [
  "#2563eb", "#38bdf8", "#fca311", "#94a3b8", "#ea4335", "#2a9d8f", "#e76f51", "#6a4c93", "#10b981", "#fbbf24", "#f59e42"
];

// Custom pie label: Big, further out, with white stroke
function renderPieLabel({ cx, cy, midAngle, outerRadius, value }) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 36;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#222"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontWeight={800}
      fontSize={23}
      stroke="#fff"
      strokeWidth={6}
      paintOrder="stroke"
      style={{
        pointerEvents: "none",
        filter: "drop-shadow(0 1px 3px #c0c0c099)"
      }}
    >
      {value}
    </text>
  );
}

function toCategoryArray(report) {
  if (!report) return [];
  if (Array.isArray(report)) {
    const counts = {};
    report.forEach(r => {
      const cat = r.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  } else if (report.accounts_by_category) {
    return Object.entries(report.accounts_by_category).map(([name, count]) => ({ name, count }));
  }
  return [];
}

function getReportLabel(report, fallback) {
  if (!report) return fallback;
  if (report.name) return report.name;
  if (report.createdAt) return new Date(report.createdAt).toLocaleString();
  return fallback;
}

export default function CompareReports({ oldReport, newReport }) {
  // Load from localStorage if not passed as props
  if (!oldReport || !newReport) {
    const snapshots = [];
    for (let k in localStorage) {
      if (k.startsWith("analysis:")) {
        try {
          const snap = JSON.parse(localStorage.getItem(k));
          if (snap && snap.metrics && snap.createdAt) snapshots.push(snap);
        } catch {}
      }
    }
    snapshots.sort((a, b) => b.createdAt - a.createdAt);
    if (snapshots.length >= 2) {
      newReport = newReport || snapshots[0].metrics;
      oldReport = oldReport || snapshots[1].metrics;
    }
  }

  if (!oldReport || !newReport) {
    return (
      <div className="compare-bg">
        <div className="compare-empty">
          <h2>No snapshots to compare!</h2>
          <p>Please generate at least two reports and save snapshots before comparing.</p>
        </div>
      </div>
    );
  }

  // Prepare data
  const oldCats = toCategoryArray(oldReport);
  const newCats = toCategoryArray(newReport);
  const allCatNames = Array.from(new Set([...oldCats.map(d => d.name), ...newCats.map(d => d.name)]));
  const getCount = (arr, cat) => {
    const found = arr.find(d => d.name === cat);
    return found ? found.count : 0;
  };
  const deltaArr = allCatNames.map(name => ({
    name,
    delta: getCount(newCats, name) - getCount(oldCats, name)
  }));

  // Pie chart data
  const oldPie = oldCats.map((c, i) => ({ ...c, color: COLORS[i % COLORS.length] }));
  const newPie = newCats.map((c, i) => ({ ...c, color: COLORS[i % COLORS.length] }));

  // Labels for UI
  const oldLabel = getReportLabel(oldReport, "Old Snapshot");
  const newLabel = getReportLabel(newReport, "New Snapshot");
  const oldTotal = oldReport.total_accounts || (oldCats.reduce((a, b) => a + b.count, 0));
  const newTotal = newReport.total_accounts || (newCats.reduce((a, b) => a + b.count, 0));
  const totalDelta = newTotal - oldTotal;

  return (
    <div className="compare-bg">
      <h1 className="compare-title">Compare Snapshots</h1>
      <div className="compare-meta-row">
        <div className="compare-meta">
          <div className="compare-meta-title">{oldLabel}</div>
          <div className="compare-meta-count">Accounts: <b>{oldTotal}</b></div>
        </div>
        <div className="compare-meta">
          <div className="compare-meta-title">{newLabel}</div>
          <div className="compare-meta-count">Accounts: <b>{newTotal}</b></div>
        </div>
        <div className="compare-meta">
          <div className="compare-meta-title">Change</div>
          <div className={`compare-meta-delta ${totalDelta > 0 ? "plus" : totalDelta < 0 ? "minus" : ""}`}>
            {totalDelta > 0 ? "+" : ""}{totalDelta}
          </div>
        </div>
      </div>
        <div className="compare-grid">
        {/* Old Pie */}
        <div className="compare-card">
          <h2 className="compare-card-title">Old Report: Category Share</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={oldPie}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={55 }
                label={renderPieLabel}
                isAnimationActive={false}
              >
                {oldPie.map((entry, idx) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* New Pie */}
        <div className="compare-card">
          <h2 className="compare-card-title">New Report: Category Share</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={newPie}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={55}
                label={renderPieLabel}
                isAnimationActive={false}
              >
                {newPie.map((entry, idx) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Old bar */}
        <div className="compare-card">
          <h2 className="compare-card-title">Old Report: Accounts by Category</h2>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={oldCats} layout="vertical">
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count">
                {oldCats.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* New bar */}
        <div className="compare-card">
          <h2 className="compare-card-title">New Report: Accounts by Category</h2>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={newCats} layout="vertical">
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count">
                {newCats.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Delta chart below */}
      <div className="compare-card-wide">
        <h2 style={{ color: "#ea4335", fontWeight: 700, marginBottom: 18 }}>Change by Category (Δ)</h2>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={deltaArr} layout="vertical">
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="delta" fill="#34d399" radius={[8, 8, 8, 8]} name="Change (New - Old)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
