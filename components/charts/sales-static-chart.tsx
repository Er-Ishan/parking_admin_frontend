"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type ChartData = {
  categories?: string[];
  series?: {
    name: string;
    data: number[];
  }[];
};

interface Props {
  chartData?: ChartData;
}

const SalesStaticChart = ({ chartData }: Props) => {
  // 🛡️ SAFETY CHECK (this fixes the crash)
  if (
    !chartData ||
    !chartData.series ||
    chartData.series.length === 0
  ) {
    return (
      <div className="h-[280px] flex items-center justify-center text-neutral-400">
        No sales data available
      </div>
    );
  }

  const chartOptions: ApexOptions = {
    chart: {
      id: "sales-chart",
      toolbar: { show: false },
    },
    xaxis: {
      categories: chartData.categories ?? [],
    },
    stroke: {
      curve: "smooth",
    },
    dataLabels: {
      enabled: false,
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
  };

  return (
    <ApexChart
      type="area"
      options={chartOptions}
      series={chartData.series}
      height={280}
    />
  );
};

export default SalesStaticChart;
