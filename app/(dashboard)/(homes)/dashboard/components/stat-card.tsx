"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UsersRound, Medal, FileText } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const API_LIST_URL =
  `${API_BASE_URL}/api/analytics/parking-analytics`;



const StatCard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(API_LIST_URL);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <p className="text-neutral-500">Loading stats...</p>;
  if (!stats) return <p className="text-red-500">Failed to load data</p>;

  const cardsDatas = [
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      icon: UsersRound,
      iconBg: "bg-cyan-600",
      description: "Total bookings in system",
    },
    {
      title: "Active Bookings",
      value: stats.active.toString(),
      icon: Medal,
      iconBg: "bg-purple-600",
      description: "Current active bookings",
    },
    {
      title: "Incomplete Bookings",
      value: stats.pending.toString(),
      icon: FileText,
      iconBg: "bg-primary",
      description: "Bookings not yet completed",
    },
    {
      title: "Cancelled Bookings",
      value: stats.cancelled.toString(),
      icon: FileText,
      iconBg: "bg-red-600",
      description: "Cancelled bookings",
    },
    {
      title: "Suppliers Bookings",
      value: stats.supplier.toString(),
      icon: UsersRound,
      iconBg: "bg-green-600",
      description: "Bookings made today",
    },


  ];

  return (
    <>
      {cardsDatas.map((card, index) => (
        <Card
          key={index}
          className="w-full border border-gray-200 dark:border-neutral-700 
          rounded-md shadow-sm transition-all"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {card.value}
                </h3>
              </div>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default StatCard;
