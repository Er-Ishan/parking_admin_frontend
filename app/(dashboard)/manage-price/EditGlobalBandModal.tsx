"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function EditGlobalBandModal({ open, onClose, band, refresh }: any) {
  const [bandName, setBandName] = useState("");
  const [incrementValue, setIncrementValue] = useState("");
  const [days, setDays] = useState<string[]>(Array(31).fill(""));

  // Sync band data
  useEffect(() => {
    if (!band) return;

    setBandName(band.band_name || "");
    setIncrementValue(band.increment_value || "");

    setDays(
      Array.from({ length: 31 }).map((_, i) => band[`day_${i + 1}`] ?? "")
    );
  }, [band]);

  if (!open || !band) return null;

  const handleChange = (index: number, value: string) => {
    const updated = [...days];
    updated[index] = value;
    setDays(updated);
  };

  const handleSave = async () => {
    await fetch(`${API_BASE_URL}/api/global-bands/${band.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        band_name: bandName,
        increment_value: incrementValue,
        days,
      }),
    });

    refresh();
    onClose();
  };

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
        <div className="bg-white w-[900px] rounded shadow-lg p-5">

          {/* Header */}
          <div className="border-b pb-3 mb-4">
            <h2 className="text-lg font-semibold">
              Edit Band — {bandName}
            </h2>
          </div>

          {/* Band Name */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Band Name */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Band Name *
              </label>
              <input
                value={bandName}
                onChange={(e) => setBandName(e.target.value)}
                className="border p-2 w-full text-sm"
              />
            </div>

            {/* Increment Value */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Increment Value
              </label>
              <input
                value={incrementValue}
                onChange={(e) => setIncrementValue(e.target.value)}
                className="border p-2 w-full text-sm"
              />
            </div>
          </div>




          {/* Days Grid */}
          <div className="grid grid-cols-6 gap-4">
            {days.map((value, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-xs font-medium mb-1">
                  {index + 1} DAY(S) *
                </label>
                <input
                  value={value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="border p-2 text-sm"
                />
              </div>
            ))}


          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6">



            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-300 rounded text-sm"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-black text-white rounded text-sm"
            >
              Save
            </button>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
