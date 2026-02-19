import CustomersStatisticsCard from '@/app/(dashboard)/(homes)/ecommerce/component/customers-statistics-card';
import DailySalesCard from '@/app/(dashboard)/(homes)/ecommerce/component/daily-sales-card';
import DistributionMapsCard from '@/app/(dashboard)/(homes)/ecommerce/component/distribution-maps-card';
import RecentOrdersCard from '@/app/(dashboard)/(homes)/ecommerce/component/recent-orders-card';
import RevenueReportCard from '@/app/(dashboard)/(homes)/ecommerce/component/revenue-report-card';
import StockReportCard from '@/app/(dashboard)/(homes)/ecommerce/component/stock-report-card';
import TopCustomersCard from '@/app/(dashboard)/(homes)/ecommerce/component/top-customers-card';
import TopSellingProductCard from '@/app/(dashboard)/(homes)/ecommerce/component/top-selling-product-card';
import TransactionsCard from '@/app/(dashboard)/(homes)/ecommerce/component/transactions-card';
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";

const metadata: Metadata = {
  title: "E-commerce Dashboard | WowDash Admin Panel",
  description:
    "Manage orders, monitor sales, and track product performance with the E-commerce Dashboard in WowDash Admin Template.",
};


const EcommercePage = () => {
  return (
    <>
      <DashboardBreadcrumb title="eCommerce" text="eCommerce" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        <div className="md:col-span-12 2xl:col-span-9">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <RevenueReportCard />
          </Suspense>
        </div>

        <div className="md:col-span-12 lg:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <CustomersStatisticsCard />
          </Suspense>
        </div>

        <div className="md:col-span-12 lg:col-span-6 2xl:col-span-9">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <RecentOrdersCard />
          </Suspense>
        </div>

        <div className="md:col-span-12 lg:col-span-6 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <TransactionsCard />
          </Suspense>
        </div>

        <div className="md:col-span-12 lg:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <DailySalesCard />
          </Suspense>
        </div>

        <div className="md:col-span-12 lg:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <DistributionMapsCard />
          </Suspense>
        </div>

        <div className="md:col-span-12 lg:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <TopCustomersCard />
          </Suspense>
        </div>

        <div className="md:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <TopSellingProductCard />
          </Suspense>
        </div>

        <div className="md:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
            <StockReportCard />
          </Suspense>
        </div>

      </div>
    </>
  )
}
export default EcommercePage;