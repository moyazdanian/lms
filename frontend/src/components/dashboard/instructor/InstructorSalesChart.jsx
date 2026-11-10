"use client";

import { Line } from "react-chartjs-2";
import {
  LineElement,
  PointElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export default function InstructorSalesChart({ data = [] }) {
  const labels = data.map((item) => item.label);
  const values = data.map((item) => Number(item.amount || 0));

  return (
    <div className="h-64 w-full">
      <Line
        data={{
          labels,
          datasets: [{
            label: "Sales",
            data: values,
            borderColor: "#3b82f6",
            backgroundColor: "hsl(var(--primary) / 0.12)",
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "hsl(var(--background))",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3,
            tension: 0.35,
            fill: true,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (context) => `$${Number(context.raw || 0).toFixed(2)}` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
            y: { beginAtZero: true, grid: { color: "rgba(148, 163, 184, .2)" }, ticks: { callback: (value) => `$${value}` } },
          },
        }}
      />
    </div>
  );
}
