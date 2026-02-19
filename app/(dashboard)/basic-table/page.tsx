import type { Metadata } from "next";
import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import DefaultCardComponent from "@/app/(dashboard)/components/default-card-component";
import RecentOrdersTable from "@/components/table/recent-orders-table";
import TopSellingProductTable from "@/components/table/top-selling-product-table";
import BorderedTable from "@/components/table/bordered-table";
import DefaultTable from "@/components/table/default-table";
import BorderedColorTable from "@/components/table/bordered-color-table";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";

const metadata: Metadata = {
    title: "Basic Tables & Data Display | WowDash Admin Dashboard",
    description:
        "Present structured data using basic table components with responsive design in the WowDash Admin Dashboard built with Next.js and Tailwind CSS.",
};

const BasicTablePage = () => {
    return (
        <>
            <DashboardBreadcrumb title="Basic Table" text="Basic Table" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-6">
                    <DefaultCardComponent title="Default Table">
                        <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                            <DefaultTable />
                        </Suspense>
                    </DefaultCardComponent>
                </div>
                <div className="col-span-12 lg:col-span-6">
                    <DefaultCardComponent title="Bordered Tables">
                        <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                            <BorderedTable />
                        </Suspense>
                    </DefaultCardComponent>
                </div>
                <div className="col-span-12 lg:col-span-6">
                    <DefaultCardComponent title="Tables Border Colors">
                        <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                            <BorderedColorTable />
                        </Suspense>
                    </DefaultCardComponent>
                </div>
                <div className="col-span-12 lg:col-span-6">
                    <DefaultCardComponent title="Striped Rows">
                        <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                            <TopSellingProductTable />
                        </Suspense>
                    </DefaultCardComponent>
                </div>
                <div className="col-span-12">
                    <DefaultCardComponent title="Card Tables">
                        <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                            <RecentOrdersTable />
                        </Suspense>
                    </DefaultCardComponent>
                </div>
            </div>
        </>
    );
};
export default BasicTablePage;
