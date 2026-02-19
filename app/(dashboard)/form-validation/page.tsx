"use client";

import type { Metadata } from "next";
import React from "react";
import ValidateForm from "@/app/(dashboard)/form-validation/validate-form";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";

const metadata: Metadata = {
    title: "Form Validation & Input Handling | WowDash Admin Dashboard",
    description:
        "Implement robust form validation and input handling techniques in the WowDash Admin Dashboard built with Next.js and Tailwind CSS.",
};

const FormValidation = () => {
    return (
        <>
            <DashboardBreadcrumb title="Form Validation" text="Form Validation" />

            <Suspense fallback={<LoadingSkeleton height="h-64" text="Loading..." />}>
                <ValidateForm />
            </Suspense>

        </>
    );
};

export default FormValidation;
