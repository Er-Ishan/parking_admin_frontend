import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import CountriesStatusCard from "../crm/components/countries-status-card";
import AudienceStatsCard from "./components/audience-stats-card";
import PodcastEarningsOverviewCard from "./components/podcast-earnings-overview-card";
import PodcastTopCategoriesCard from "./components/podcast-top-categories-card";
import RecentPurposePlanCard from "./components/recent-purpose-plan-card";
import RecentlyPlayedCard from "./components/recently-played-card";
import TopPodcasterCard from "./components/top-podcaster-card";
import TotalPodcasts from "./components/total-podcasts";
import TotalUsers from "./components/total-users";
import TrendingEpisodesCard from "./components/trending-episodes-card";

const metadata: Metadata = {
    title: "Podcast Dashboard | Manage Shows, Episodes & Analytics - WowDash Admin Panel",
    description:
        "Easily manage podcast shows, episodes, guests, and performance analytics with the Podcast Dashboard in WowDash Admin Template. Built using Next.js, Tailwind CSS, and ShadCN UI for seamless performance and modern design.",
};

const podcastPage = () => {
    return (
        <>
            <DashboardBreadcrumb title="Podcast" text="Podcast" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                <div className="col-span-12 lg:col-span-5 2xl:col-span-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="col-span-12 md:col-span-6 lg:col-span-12">
                            <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                                <TotalUsers />
                            </Suspense>
                        </div>
                        <div className="col-span-12 md:col-span-6 lg:col-span-12">
                            <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                                <TotalPodcasts />
                            </Suspense>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-7 2xl:col-span-8">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <AudienceStatsCard />
                    </Suspense>
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <PodcastEarningsOverviewCard />
                    </Suspense>
                </div>

                <div className="col-span-12 lg:col-span-8">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <RecentlyPlayedCard />
                    </Suspense>
                </div>

                <div className="col-span-12 2xl:col-span-8">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <RecentPurposePlanCard />
                    </Suspense>
                </div>

                <div className="col-span-12 md:col-span-6 2xl:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <CountriesStatusCard />
                    </Suspense>
                </div>
                
                <div className="col-span-12 md:col-span-6 2xl:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <TrendingEpisodesCard />
                    </Suspense>
                </div>
                
                <div className="col-span-12 md:col-span-6 2xl:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <PodcastTopCategoriesCard />
                    </Suspense>
                </div>
                
                <div className="col-span-12 md:col-span-6 2xl:col-span-4">
                    <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                        <TopPodcasterCard />
                    </Suspense>
                </div>

            </div>
        </>
    );
};
export default podcastPage;
