"use client";

import { useEffect, useState } from "react";
import UserOverviewChart from "@/components/charts/user-overview-chart";
import { Card, CardContent } from "@/components/ui/card";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const API_URL =
    `${API_BASE_URL}/api/analytics/parking-pickups-returns`;

type TrendItem = {
    date: string;
    total: number;
};

type ApiResponse = {
    totalPickups: number;
    totalReturns: number;
    pickupTrend: TrendItem[];
    returnTrend: TrendItem[];
};

const UserOverviewCard = () => {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(API_URL);
                if (!res.ok) throw new Error("Failed to fetch");

                const json: ApiResponse = await res.json();
                setData(json);
            } catch (err) {
                console.error("Analytics fetch error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <Card className="card">
                <CardContent className="card-body p-4">Loading analytics...</CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return (
            <Card className="card">
                <CardContent className="card-body p-4 text-red-500">
                    Failed to load analytics
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="card">
            <CardContent className="card-body p-0">
                <div className="flex items-center justify-between px-4 pt-4">
                    <h6 className="mb-3 font-semibold text-lg">
                        Pickups & Returns Overview
                    </h6>
                </div>

                <UserOverviewChart
                    totalPickups={data.totalPickups}
                    totalReturns={data.totalReturns}
                />


                <ul className="flex flex-wrap items-center justify-between mt-4 gap-3 px-4 pb-4">
                    <li className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-[2px] bg-blue-500"></span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-300">
                            Total Pickups:
                            <span className="font-semibold"> {data.totalPickups}</span>
                        </span>
                    </li>

                    <li className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-[2px] bg-yellow-500"></span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-300">
                            Total Returns:
                            <span className="font-semibold"> {data.totalReturns}</span>
                        </span>
                    </li>
                </ul>
            </CardContent>
        </Card>
    );
};

export default UserOverviewCard;
