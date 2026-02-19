import TicketPriorityChart from "@/components/charts/ticket-priority-chart";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import PendingSolvedTicketsCard from "./components/pending-solved-tickets-card";
import PerformanceAgentsCard from "./components/performance-agents-card";
import ResponseTimeCard from "./components/response-time-card";
import TaskSummaryCard from "./components/task-summary-card";
import TicketStatusCard from "./components/ticket-status-card";
import TodoListCard from "./components/todo-list-card";
import TopPodcasterCard from "./components/top-podcaster-card";

const metadata: Metadata = {
    title: "Booking System Dashboard | WowDash Admin Panel",
    description:
        "Manage reservations, track bookings, and streamline scheduling with the Booking System Dashboard in WowDash Admin Template built using Next.js and Tailwind.",
};

const HelpPage = () => {
    return (
        <>
            <DashboardBreadcrumb title="Help Desk" text="Help Desk" />

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <TaskSummaryCard />
                    </Suspense>
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <div className="shadow-7 p-5 rounded-xl bg-white dark:bg-[#273142] h-full">
                            <div className="flex items-center flex-wrap gap-2 justify-between">
                                <h6 className="mb-0 font-bold text-lg">Ticket Priority</h6>
                            </div>
                            <div className="relative text-style label-bold">
                                <TicketPriorityChart />
                            </div>
                        </div>
                    </Suspense>
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <TicketStatusCard />
                    </Suspense>
                </div>

                <div className="col-span-12 lg:col-span-8">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <PendingSolvedTicketsCard />
                    </Suspense>
                </div>

                <div className="col-span-12 lg:col-span-8">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <TodoListCard />
                    </Suspense>
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <TopPodcasterCard />
                    </Suspense>
                </div>

                <div className="col-span-12 lg:col-span-8">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <PerformanceAgentsCard />
                    </Suspense>
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <ResponseTimeCard />
                    </Suspense>
                </div>
            </div>
        </>
    );
};
export default HelpPage;
