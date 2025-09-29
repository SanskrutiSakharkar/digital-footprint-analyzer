import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#2563eb', '#38bdf8', '#94a3b8'];

const Report = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="report-charts"><p>🔄 Loading report data...</p></div>;
  }

  const categoryData = {};
  const signupDataByYear = {};
  const signupDataByMonth = {};

  data.forEach(entry => {
    const category = entry.category || 'Uncategorized';
    categoryData[category] = (categoryData[category] || 0) + 1;

    const rawDate = entry.created || entry.signup_date || entry.created_on;
    if (rawDate) {
      const date = new Date(rawDate);
      const year = date.getFullYear();
      const month = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      signupDataByYear[year] = (signupDataByYear[year] || 0) + 1;
      signupDataByMonth[month] = (signupDataByMonth[month] || 0) + 1;
    }
  });

  const categoryChartData = Object.entries(categoryData).map(([name, count]) => ({ name, count }));
  const yearChartData = Object.entries(signupDataByYear)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  const monthChartData = Object.entries(signupDataByMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => new Date(a.month) - new Date(b.month));

  return (
    <div className="report-charts">
      <div className="charts-row">
        <div className="chart-card">
          <h4>Accounts by Category</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={categoryChartData}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" label={{ position: "right" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4>Account Type Share</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#82ca9d"
                label
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h4>Signups Over Time (Year)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearChartData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h4>Signups Over Time (Month)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthChartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Report;