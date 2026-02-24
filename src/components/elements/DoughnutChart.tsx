'use client';

import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface ChartData {
  labels?: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderWidth: number;
    borderColor: string;
  }[];
  total: string;
}

export function DoughnutChart({ datasets, labels, total }: Readonly<ChartData>) {
  const data = { labels, datasets };

  const options = {
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: false, // Changed to false for better container control
    plugins: {
      legend: {
        display: false, // Simplified since you're always setting it to false
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          generateLabels: (chart: Chart) => {
            const dataset = chart.data.datasets[0];
            return (
              chart?.data?.labels?.map((label, index) => ({
                text: `${label} ${dataset.data[index]?.toLocaleString('en-US')}`,
                fillStyle: (dataset?.backgroundColor as string[])[index],
                strokeStyle: (dataset?.backgroundColor as string[])[index],
                hidden: dataset.hidden || false,
                index: index,
              })) ?? []
            );
          },
        },
      },
      tooltip: { enabled: false },
    },
  };

  const plugins = [
    {
      id: 'textCenter',
      beforeDraw: (chart: Chart) => {
        const { width, height, ctx, chartArea } = chart;
        ctx.restore();

        if (total && chartArea) {
          // Added chartArea check
          const fontSize = Math.min(width, height) * 0.1;
          ctx.font = `bold ${fontSize}px Inter`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#000';

          const centerX = chartArea.left + (chartArea.right - chartArea.left) / 2;
          const centerY = chartArea.top + (chartArea.bottom - chartArea.top) / 2;

          ctx.fillText(total, centerX, centerY);
          ctx.save();
        }
      },
    },
  ];

  return <Doughnut data={data} options={options} plugins={plugins} />;
}
