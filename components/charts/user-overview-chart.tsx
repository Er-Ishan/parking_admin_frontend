"use client";

import dynamic from "next/dynamic";
import React from "react";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  totalPickups: number;
  totalReturns: number;
};

const UserOverviewChart = ({ totalPickups, totalReturns }: Props) => {
  const total = totalPickups + totalReturns;

  const chartOptions: ApexOptions = {
    series: [totalPickups, totalReturns, total],
    colors: ["#487FFF", "#FF9F29", "#E4F1FF"],
    labels: ["Pickups", "Returns", "Total"],
    legend: {
      show: false,
    },
    chart: {
      type: "donut",
      height: 270,
      sparkline: {
        enabled: true,
      },
    },
    stroke: {
      width: 0,
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  return (
    <Chart
      options={chartOptions}
      series={chartOptions.series}
      type="donut"
      height={270}
    />
  );
};

export default UserOverviewChart;
