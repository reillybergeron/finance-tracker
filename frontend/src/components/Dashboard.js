import React, { useEffect, useState } from "react";
import { apiUrl } from "../apiConfig";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

function Dashboard() {
  const [report, setReport] = useState(null);

  //Fetch aggregated data from backend
  useEffect(() => {
    fetch(apiUrl("/api/transactions/reports/summary"))
      .then((res) => res.json())
      .then((data) => setReport(data))
      .catch((err) => console.error("Failed to load report:", err));
  }, []);

  if (!report) {
    return <p style={{ color: "#e2e8f0" }}>Loading dashboard...</p>;
  }

  //Extract backend data safely
  const categoryTotals = report.categoryTotals || {};
  const monthlyTotals = report.monthlyTotals || {};
  const categories = Object.keys(categoryTotals);
  const categoryValues = Object.values(categoryTotals);

  const months = Object.keys(monthlyTotals).sort();
  const monthlyValues = months.map((m) => monthlyTotals[m]);

  const currentMonth = months[months.length - 1];
  const previousMonth = months[months.length - 2];

  const currentMonthSpending = currentMonth ? monthlyTotals[currentMonth] : 0;

  const previousMonthSpending = previousMonth
    ? monthlyTotals[previousMonth]
    : 0;

  const averageMonthlySpending = months.length
    ? Object.values(monthlyTotals).reduce((a, b) => a + b, 0) / months.length
    : 0;

  // Yearly rollup derived from monthlyTotals (YYYY-MM)
  const yearlyTotals = months.reduce((acc, monthKey) => {
    const year = String(monthKey).slice(0, 4);
    const amount = Number(monthlyTotals[monthKey] ?? 0);
    acc[year] = (acc[year] ?? 0) + amount;
    return acc;
  }, {});

  const years = Object.keys(yearlyTotals).sort();
  const currentYear = years[years.length - 1];
  const previousYear = years[years.length - 2];

  const currentYearTotal = currentYear ? yearlyTotals[currentYear] ?? 0 : 0;
  const previousYearTotal = previousYear ? yearlyTotals[previousYear] ?? 0 : 0;

  const averageYearlySpending = years.length
    ? Object.values(yearlyTotals).reduce((a, b) => a + b, 0) / years.length
    : 0;

  const yearlyLineValues = years.map((y) => yearlyTotals[y]);

  // Last 24 months for a readable monthly trend (full history is in yearly chart)
  const recentMonths = months.slice(-24);
  const recentMonthlyValues = recentMonths.map((m) => monthlyTotals[m]);

  // Yearly trend across the seeded range (e.g. past decade)
  const yearlyLineData = {
    labels: years,
    datasets: [
      {
        label: "Spending by year",
        data: yearlyLineValues,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const recentMonthlyLineData = {
    labels: recentMonths,
    datasets: [
      {
        label: "Monthly spending (last 24 months)",
        data: recentMonthlyValues,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.15)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  //Bar chart
  const barData = {
    labels: categories,
    datasets: [
      {
        label: "Spending by Category",
        data: categoryValues,
        backgroundColor: "#3b82f6",
      },
    ],
  };

  //Pie chart
  const pieData = {
    labels: categories,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: [
          "#3b82f6",
          "#ef4444",
          "#22c55e",
          "#f59e0b",
          "#a855f7",
          "#38bdf8",
        ],
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#e2e8f0" },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#e2e8f0",
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: { ticks: { color: "#e2e8f0" } },
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#e2e8f0" },
      },
    },
    scales: {
      x: { ticks: { color: "#e2e8f0" } },
      y: { ticks: { color: "#e2e8f0" } },
    },
  };

  return (
    <div>
      <h2>Dashboard</h2>

      {/* Overview */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3>Overview</h3>

        <p>
          Total Transactions: <strong>{report.totalTransactions}</strong>
        </p>

        <p>
          Total Spent: <strong>${(report.totalSpent ?? 0).toFixed(2)}</strong>
        </p>
        <hr style={{ borderColor: "#334155" }} />
      </div>

      {/* Monthly Summary */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3>Monthly Summary Report</h3>

        <p>
          Current Month ({currentMonth || "N/A"}):{" "}
          <strong>${currentMonthSpending.toFixed(2)}</strong>
        </p>

        <p>
          Previous Month ({previousMonth || "N/A"}):{" "}
          <strong>${previousMonthSpending.toFixed(2)}</strong>
        </p>

        <p>
          Average Monthly Spending:{" "}
          <strong>${averageMonthlySpending.toFixed(2)}</strong>
        </p>

        <hr style={{ borderColor: "#334155" }} />

      </div>

      {/* Yearly Summary */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3>Yearly Summary Report</h3>

        <p>
          Current Year ({currentYear || "N/A"}):{" "}
          <strong>${currentYearTotal.toFixed(2)}</strong>
        </p>

        <p>
          Previous Year ({previousYear || "N/A"}):{" "}
          <strong>${previousYearTotal.toFixed(2)}</strong>
        </p>

        <p>
          Average Yearly Spending:{" "}
          <strong>${averageYearlySpending.toFixed(2)}</strong>
        </p>

        <hr style={{ borderColor: "#334155" }} />
      </div>

      {/* Charts — yearly view for long history; recent months for detail */}
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3>Trends</h3>
        <p style={{ color: "#94a3b8", marginTop: 0 }}>
          Yearly totals cover the full history from your data; the second chart
          zooms to the most recent 24 months.
        </p>
        <div style={{ width: "100%", height: "280px", marginBottom: "24px" }}>
          <Line data={yearlyLineData} options={lineChartOptions} />
        </div>
        <div style={{ width: "100%", height: "260px" }}>
          <Line data={recentMonthlyLineData} options={lineChartOptions} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "400px", height: "250px" }}>
          <Bar data={barData} options={options} />
        </div>

        <div style={{ width: "300px", height: "250px" }}>
          <Pie data={pieData} options={options} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
