"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";
import CustomSelect from "@/components/shared/custom-select";
import SalesStaticChart from "@/components/charts/sales-static-chart";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/analytics/sales`;

type ChartData = {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
};

type SalesStats = {
  totalSales: number;
  growthPercent: number;
  growthPerDay: number;
  chartData: ChartData;
};

const SalesStaticCard = () => {
  const [filter, setFilter] = useState("Yearly");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SalesStats | null>(null);

  const fetchSalesData = async (selectedFilter: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}?filter=${selectedFilter}`);
      const data: SalesStats = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching sales data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(filter);
  }, [filter]);

  if (loading) return <p className="text-neutral-500">Loading sales...</p>;
  if (!stats) return <p className="text-red-500">Failed to load sales data</p>;

  return (
    <Card className="card">
      <CardContent className="px-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between">
          <h6 className="text-lg mb-0">Sales Statistic</h6>

          <CustomSelect
            placeholder={filter}
            options={["Yearly", "Monthly", "Weekly", "Today"]}
            onChange={(value: string) => setFilter(value)}
          />
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <h6 className="mb-0">£{stats.totalSales}</h6>

          <span className="text-sm font-semibold rounded-full bg-green-100 dark:bg-green-600/25 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-600/50 px-2 py-1.5 flex items-center gap-1">
            {stats.growthPercent}% <ArrowUp width={14} height={14} />
          </span>

          <span className="text-xs font-medium">
            + £{stats.growthPerDay} Per Day
          </span>
        </div>

        {/* Chart */}
        <div className="apexcharts-tooltip-style-1 mt-7">
          <SalesStaticChart chartData={stats.chartData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesStaticCard;
