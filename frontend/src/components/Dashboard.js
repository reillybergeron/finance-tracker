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

  // 📈 Line chart (monthly spending)
  const lineData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Spending",
        data: monthlyValues,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
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
          Total Spent: <strong>${report.totalSpent.toFixed(2)}</strong>
        </p>
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

        <p>
          Trend:{" "}
          <span
            style={{
              color:
                currentMonthSpending > previousMonthSpending
                  ? "#ef4444"
                  : "#22c55e",
              fontWeight: "bold",
            }}
          >
            {currentMonthSpending > previousMonthSpending
              ? "Increasing"
              : "Decreasing"}
          </span>
        </p>
      </div>

      {/* Charts */}
      <div style={{ width: "100%", height: "250px", marginBottom: "30px" }}>
        <Line data={lineData} options={options} />
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
