import GenerateContentCard from "@/app/(dashboard)/(homes)/dashboard/components/generate-content-card";
import SalesStaticCard from "@/app/(dashboard)/(homes)/dashboard/components/sales-static-card";
import StatCard from "@/app/(dashboard)/(homes)/dashboard/components/stat-card";
import TabsWithTableCard from "@/app/(dashboard)/(homes)/dashboard/components/tabs-with-table-card";
import TopCountriesCard from "@/app/(dashboard)/(homes)/dashboard/components/top-countries-card";
import TopPerformerCard from "@/app/(dashboard)/(homes)/dashboard/components/top-performer-card";
import TotalSubscriberCard from "@/app/(dashboard)/(homes)/dashboard/components/total-subscriber-card";
import UserOverviewCard from "@/app/(dashboard)/(homes)/dashboard/components/user-overview-card";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const metadata: Metadata = {
  title: "AI Dashboard | WowDash Admin Panel",
  description:
    "Explore AI analytics, monitor model performance, and track intelligent automation workflows in the AI Dashboard of WowDash Admin Template.",
};


export default async function DashboardPage() {
  return (
    <>
      <ProtectedRoute>
        <h1 className="text-2xl font-bold mb-4">Gree Maurice Analysis</h1>

      {/* TOP STATS – fully responsive auto-fit grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        <Suspense fallback={<LoadingSkeleton text="Loading..." />}>
          <StatCard />
        </Suspense>
      </div>

      {/* MAIN SECTION – responsive layout, NO fixed size */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">

        {/* User Overview */}
        <div className="xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton text="Loading..." />}>
            <UserOverviewCard />
          </Suspense>
        </div>

        {/* Sales Statistics */}
        <div className="xl:col-span-8">
          <Suspense fallback={<LoadingSkeleton text="Loading..." />}>
            <SalesStaticCard />
          </Suspense>
        </div>

        {/* Subscribers */}
        {/* <div className="xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton text="Loading..." />}>
            <TotalSubscriberCard />
          </Suspense>
        </div> */}

        {/* Tabs Table */}
        {/* <div className="xl:col-span-8">
          <Suspense fallback={<LoadingSkeleton text="Loading..." />}>
            <TabsWithTableCard />
          </Suspense>
        </div> */}

        {/* Top Countries */}
        {/* <div className="xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton text="Loading..." />}>
            <TopCountriesCard />
          </Suspense>
        </div> */}

        {/* Generate Content */}
        {/* <div className="xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton text="Loading..." />}>
            <GenerateContentCard />
          </Suspense>
        </div> */}
      </div>
      </ProtectedRoute>
    </>
  );
}

