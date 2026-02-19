"use client";

import dynamic from "next/dynamic";
import React from "react";
import { ApexOptions } from "apexcharts";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const chartOptions: ApexOptions = {
  chart: {
    stacked: true,
    type: "bar",
    height: 263,
    fontFamily: "Poppins, sans-serif",
    toolbar: {
      show: false,
    },
  },
  colors: ["#487FFF", "#EF4A00"],
  plotOptions: {
    bar: {
      columnWidth: "8",
      borderRadius: 2,
      borderRadiusWhenStacked: "all",
    },
  },
  stroke: {
    width: [5, 5],
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: true,
    position: "top",
  },
  yaxis: {
    show: false,
    title: {
      text: undefined,
    },
  },
  xaxis: {
    categories: [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: true,
      style: {
        colors: "#d4d7d9",
        fontSize: "10px",
        fontWeight: 500,
      },
    },
  },
  tooltip: {
    enabled: true,
    shared: true,
    intersect: false,
    theme: "dark",
    x: {
      show: false,
    },
  },
};

const chartSeries = [
  {
    name: "Income",
    data: [44, 42, 57, 86, 58, 55, 70, 44, 42, 57, 86, 58, 55, 70],
  },
  {
    name: "Expenses",
    data: [
      -34, -22, -37, -56, -21, -35, -60, -34, -22, -37, -56, -21, -35, -60,
    ],
  },
];

const RevenueStatisticsChartUpdown: React.FC = () => {
  return (
    <>
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="bar"
        height={310}
      />
    </>
  );
};

export default RevenueStatisticsChartUpdown;
