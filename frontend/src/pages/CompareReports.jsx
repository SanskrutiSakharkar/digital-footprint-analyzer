import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#2563eb', '#38bdf8', '#94a3b8'];

const CompareReports = ({ oldData, newData }) => {
  const getCategoryData = (data) => {
    const categories = {};
    data.forEach(entry => {
      const category = entry.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  };

  const oldCategoryData = getCategoryData(oldData);
  const newCategoryData = getCategoryData(newData);

  return (
    <div className="compare-bg">
      <div className="compare-container">
        <div className="compare-header">
          <h1>Snapshot Comparison</h1>
          <p>Compare old and new data footprints</p>
        </div>

        <div className="grid-two">
          <div className="card">
            <h2 className="card-title">Old Report – Accounts by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={oldCategoryData}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="card-title">New Report – Accounts by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={newCategoryData}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="card-title">Old Report – Account Type Share</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={oldCategoryData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="#8884d8"
                  label
                >
                  {oldCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="card-title">New Report – Account Type Share</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={newCategoryData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="#82ca9d"
                  label
                >
                  {newCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareReports;
