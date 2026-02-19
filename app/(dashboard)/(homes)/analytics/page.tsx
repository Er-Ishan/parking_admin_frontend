import DashboardBreadcrumb from '@/components/layout/dashboard-breadcrumb';
import LoadingSkeleton from '@/components/loading-skeleton';
import type { Metadata } from "next";
import { Suspense } from "react";
import AverageDailySalesCard from './components/average-daily-sales-card';
import MonthlyCampaignStateCard from './components/monthly-campaign-state-card';
import RecentActivityCard from './components/recent-activity-card';
import RevenueStatisticCard from './components/revenue-statistic-card';
import SalesByCountriesCard from './components/sales-by-countries-card';
import SourceVisitorsCard from './components/source-visitors-card';
import SupportTrackerCard from './components/support-tracker-card';
import TransactionsCard from './components/transactions-card';
import UpgradePlanCard from './components/upgrade-plan-card';

export const metadata: Metadata = {
    title: "Analytics Dashboard | WowDash Admin Panel",
    description:
        "Gain insights into your business performance with the Analytics Dashboard in WowDash. Track KPIs, monitor trends, and make data-driven decisions with ease.",
};


const Analytics = () => {
    return (
        <>
            <DashboardBreadcrumb title="Analytics" text="Analytics" />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                <div className="col-span-12 2xl:col-span-6">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <UpgradePlanCard />
                    </Suspense>
                </div>

                <div className="col-span-12 2xl:col-span-6">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <RevenueStatisticCard />
                    </Suspense>
                </div>

                <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <SupportTrackerCard />
                    </Suspense>
                </div>

                <div className="col-span-12 xl:col-span-6 2xl:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <AverageDailySalesCard />
                    </Suspense>
                </div>

                <div className="col-span-12 2xl:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <TransactionsCard />
                    </Suspense>
                </div>

                <div className="col-span-12 2xl:col-span-6">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <SalesByCountriesCard />
                    </Suspense>
                </div>

                <div className="col-span-12 2xl:col-span-6">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <SourceVisitorsCard />
                    </Suspense>
                </div>

                <div className="col-span-12 2xl:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <MonthlyCampaignStateCard />
                    </Suspense>
                </div>

                <div className="col-span-12 2xl:col-span-8">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <RecentActivityCard />
                    </Suspense>
                </div>

            </div>
        </>
    );
};

export default Analytics;