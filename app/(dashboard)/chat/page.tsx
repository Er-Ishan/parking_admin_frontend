"use client";

import type { Metadata } from "next";
import React from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";
import ChatBox from "./components/chat-box";

const metadata: Metadata = {
    title: "Real-Time Chat & Messaging | WowDash Admin Dashboard",
    description:
        "Engage in seamless real-time conversations and manage messages efficiently in the WowDash Admin Dashboard built with Next.js, Tailwind CSS, and shadcn UI.",
};


const EmailPage = () => {
    return (
        <>
            <DashboardBreadcrumb title="Chat" text="Chat" />

            <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                <ChatBox />
            </Suspense>

        </>
    );
};
export default EmailPage;