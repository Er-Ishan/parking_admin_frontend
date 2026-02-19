"use client";

import { useState } from "react";
import BookingCharges from "@/components/charges/ChargeBooking";
import AmendedCharges from "@/components/charges/ChargeAmended";
import ChagreCancellation from "@/components/charges/ChargeCancellation";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ChargesPage() {
  const [tab, setTab] = useState("booking");

  return (
    <ProtectedRoute>
      <div className="w-full min-h-screen p-4">

        <BookingCharges />
        <AmendedCharges />
        <ChagreCancellation />

      </div>
    </ProtectedRoute>
  );
}
