import type { Metadata } from "next";
import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import DefaultCardComponent from "@/app/(dashboard)/components/default-card-component";
import GenerateContentChart from "@/components/charts/generate-content-chart";
import RevenueStatisticsChartUpdown from "@/components/charts/revenue-statistics-chart-updown";
import ColumnGroupBarChart from "@/components/charts/column-group-bar-chart";
import GroupColumnChart from "@/components/charts/group-column-chart";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";

const metadata: Metadata = {
    title: "Column Charts & Data Visualization | WowDash Admin Dashboard",
    description:
        "Explore various interactive chart components for analytics and data visualization in the WowDash Admin Dashboard template built with Next.js and Tailwind CSS.",
};

const ColumnChartPage = () => {
    return (
        <>
            <DashboardBreadcrumb title="Column Chart" text="Column Chart" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DefaultCardComponent title="Column Charts">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <GenerateContentChart />
                    </Suspense>
                </DefaultCardComponent>
                <DefaultCardComponent title="Column Charts">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <ColumnGroupBarChart />
                    </Suspense>
                </DefaultCardComponent>
                <DefaultCardComponent title="Group Columns">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <GroupColumnChart />
                    </Suspense>
                </DefaultCardComponent>
                <DefaultCardComponent title="Simple Column">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <RevenueStatisticsChartUpdown />
                    </Suspense>
                </DefaultCardComponent>
            </div>
        </>
    );
};
export default ColumnChartPage;
