// src/components/ChartStats.js
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Example data (replace with real report data via props)
const data = [
  { category: "Social Media", count: 8 },
  { category: "E-Commerce", count: 4 },
  { category: "Banking", count: 2 },
  { category: "Professional", count: 3 },
];

export default function ChartStats({ chartData = data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#FCA311" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
