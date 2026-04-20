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

const tickColor = "#a1a1aa";
const gridColor = "rgba(255, 255, 255, 0.05)";

/** Shared line colors for yearly + monthly trend charts */
const TREND_LINE_SLATE = {
  borderColor: "#94a3b8",
  backgroundColor: "rgba(148, 163, 184, 0.08)",
  pointBackgroundColor: "#94a3b8",
};

/** Pie slices by category (stable regardless of API key order) */
const PIE_COLORS_BY_CATEGORY = {
  Food: "rgba(251, 191, 36, 0.88)",
  Clothes: "rgba(244, 114, 182, 0.85)",
  Utilities: "rgba(96, 165, 250, 0.88)",
  Travel: "rgba(251, 146, 60, 0.9)",
  Entertainment: "rgba(248, 113, 113, 0.85)",
  Other: "rgba(161, 161, 170, 0.92)",
};

const PIE_FALLBACK_PALETTE = [
  "rgba(129, 140, 248, 0.88)",
  "rgba(251, 191, 36, 0.88)",
  "rgba(96, 165, 250, 0.88)",
  "rgba(244, 114, 182, 0.85)",
  "rgba(248, 113, 113, 0.85)",
  "rgba(148, 163, 184, 0.9)",
];

function Dashboard() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetch(apiUrl("/api/transactions/reports/summary"))
      .then((res) => res.json())
      .then((data) => setReport(data))
      .catch((err) => console.error("Failed to load report:", err));
  }, []);

  if (!report) {
    return <p className="loading">Loading dashboard…</p>;
  }

  const categoryTotals = report.categoryTotals || {};
  const monthlyTotals = report.monthlyTotals || {};
  const kpis = report.kpis || {};
  const businessRules = Array.isArray(report.businessRules)
    ? report.businessRules
    : [];

  const pct = (v) =>
    v == null || Number.isNaN(Number(v)) ? "—" : `${Number(v).toFixed(1)}%`;
  const moneyOrDash = (v) =>
    v == null || Number.isNaN(Number(v)) ? "—" : fmt(Number(v));
  const categories = Object.keys(categoryTotals);
  const categoryValues = Object.values(categoryTotals);

  const months = Object.keys(monthlyTotals).sort();
  const currentMonth = months[months.length - 1];
  const previousMonth = months[months.length - 2];

  const currentMonthSpending = currentMonth ? monthlyTotals[currentMonth] : 0;

  const previousMonthSpending = previousMonth
    ? monthlyTotals[previousMonth]
    : 0;

  const averageMonthlySpending = months.length
    ? Object.values(monthlyTotals).reduce((a, b) => a + b, 0) / months.length
    : 0;

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

  const recentMonths = months.slice(-24);
  const recentMonthlyValues = recentMonths.map((m) => monthlyTotals[m]);

  const yearlyLineData = {
    labels: years,
    datasets: [
      {
        label: "Spending by year",
        data: yearlyLineValues,
        borderColor: TREND_LINE_SLATE.borderColor,
        backgroundColor: TREND_LINE_SLATE.backgroundColor,
        tension: 0.35,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: TREND_LINE_SLATE.pointBackgroundColor,
      },
    ],
  };

  const recentMonthlyLineData = {
    labels: recentMonths,
    datasets: [
      {
        label: "Monthly spending (last 24 months)",
        data: recentMonthlyValues,
        borderColor: TREND_LINE_SLATE.borderColor,
        backgroundColor: TREND_LINE_SLATE.backgroundColor,
        tension: 0.35,
        fill: true,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointBackgroundColor: TREND_LINE_SLATE.pointBackgroundColor,
      },
    ],
  };

  const barData = {
    labels: categories,
    datasets: [
      {
        label: "Spending by category",
        data: categoryValues,
        backgroundColor: categories.map((_, i) => {
          const t = 0.35 + (i / Math.max(categories.length, 1)) * 0.45;
          return `rgba(244, 244, 245, ${t})`;
        }),
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const pieSliceColors = categories.map(
    (cat, i) =>
      PIE_COLORS_BY_CATEGORY[cat] ??
      PIE_FALLBACK_PALETTE[i % PIE_FALLBACK_PALETTE.length],
  );

  const pieData = {
    labels: categories,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: pieSliceColors,
        borderColor: "#18181b",
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const axisOpts = {
    grid: { color: gridColor },
    border: { display: false },
    ticks: { color: tickColor, font: { size: 11 } },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: {
        labels: { color: tickColor, boxWidth: 10, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: "#27272a",
        titleColor: "#fafafa",
        bodyColor: "#d4d4d8",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ...axisOpts,
        ticks: {
          ...axisOpts.ticks,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: axisOpts,
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#27272a",
        titleColor: "#fafafa",
        bodyColor: "#d4d4d8",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ...axisOpts,
        ticks: { ...axisOpts.ticks, maxRotation: 0 },
      },
      y: axisOpts,
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: tickColor,
          padding: 14,
          boxWidth: 10,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "#27272a",
        titleColor: "#fafafa",
        bodyColor: "#d4d4d8",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  const fmt = (n) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Dashboard</h1>
        <p className="page__subtitle">
          Totals and trends from your transaction history.
        </p>
      </header>

      <section className="panel" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="panel__title">
          Overview
        </h2>
        <div className="stat-grid">
          <div className="stat">
            <div className="stat__label">Transactions</div>
            <div className="stat__value">
              {Number(report.totalTransactions ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="stat">
            <div className="stat__label">Total spent</div>
            <div className="stat__value">{fmt(report.totalSpent ?? 0)}</div>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="panel__title">
          Derived KPIs
        </h2>
        <p className="charts-section__hint" style={{ marginTop: 0 }}>
          Server-side metrics used for trend interpretation and rule checks.
        </p>
        <div className="stat-grid">
          <div className="stat">
            <div className="stat__label">MoM spend change</div>
            <div className="stat__value">{pct(kpis.monthOverMonthChangePercent)}</div>
          </div>
          <div className="stat">
            <div className="stat__label">YoY spend change</div>
            <div className="stat__value">{pct(kpis.yearOverYearChangePercent)}</div>
          </div>
          <div className="stat">
            <div className="stat__label">Trailing 3-mo avg</div>
            <div className="stat__value">
              {moneyOrDash(kpis.trailingThreeMonthAverage)}
            </div>
          </div>
          <div className="stat">
            <div className="stat__label">Trailing 12-mo avg</div>
            <div className="stat__value">
              {moneyOrDash(kpis.trailingTwelveMonthAverage)}
            </div>
          </div>
        </div>
      </section>

      {businessRules.length > 0 ? (
        <section className="panel" aria-labelledby="rules-heading">
          <h2 id="rules-heading" className="panel__title">
            Business rule evaluation
          </h2>
          <p className="charts-section__hint" style={{ marginTop: 0 }}>
            Named checks on aggregated spend (integrity, concentration, velocity,
            budget pressure).
          </p>
          <ul className="rules-list">
            {businessRules.map((r) => (
              <li
                key={r.ruleId}
                className={`rule rule--${String(r.severity || "INFO").toLowerCase()}`}
              >
                <span className="rule__id">{r.ruleId}</span>
                <span className="rule__msg">{r.message}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="panel" aria-labelledby="monthly-heading">
        <h2 id="monthly-heading" className="panel__title">
          Monthly
        </h2>
        <div className="stat-grid">
          <div className="stat">
            <div className="stat__label">Current month</div>
            <div className="stat__value">{fmt(currentMonthSpending)}</div>
            <div className="stat__meta">{currentMonth || "—"}</div>
          </div>
          <div className="stat">
            <div className="stat__label">Previous month</div>
            <div className="stat__value">{fmt(previousMonthSpending)}</div>
            <div className="stat__meta">{previousMonth || "—"}</div>
          </div>
          <div className="stat">
            <div className="stat__label">Average / month</div>
            <div className="stat__value">{fmt(averageMonthlySpending)}</div>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="yearly-heading">
        <h2 id="yearly-heading" className="panel__title">
          Yearly
        </h2>
        <div className="stat-grid">
          <div className="stat">
            <div className="stat__label">Current year</div>
            <div className="stat__value">{fmt(currentYearTotal)}</div>
            <div className="stat__meta">{currentYear || "—"}</div>
          </div>
          <div className="stat">
            <div className="stat__label">Previous year</div>
            <div className="stat__value">{fmt(previousYearTotal)}</div>
            <div className="stat__meta">{previousYear || "—"}</div>
          </div>
          <div className="stat">
            <div className="stat__label">Average / year</div>
            <div className="stat__value">{fmt(averageYearlySpending)}</div>
          </div>
        </div>
      </section>

      <section className="panel charts-section" aria-labelledby="trends-heading">
        <h2 id="trends-heading" className="panel__title">
          Trends
        </h2>
        <p className="charts-section__hint">
          Yearly totals reflect your full history. The second chart focuses on
          the most recent 24 months.
        </p>
        <div className="chart-wrap">
          <Line data={yearlyLineData} options={lineChartOptions} />
        </div>
        <div className="chart-wrap chart-wrap--sm">
          <Line data={recentMonthlyLineData} options={lineChartOptions} />
        </div>
      </section>

      <div className="charts-row">
        <div className="chart-box">
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="chart-box">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
