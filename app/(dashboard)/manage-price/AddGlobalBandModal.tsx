"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AddGlobalBandModal({ open, onClose, productId, refresh, existingBands }: any) {

  const [bandName, setBandName] = useState("");
  const [incrementValue, setIncrementValue] = useState("");
  const [days, setDays] = useState(Array(30).fill(""));

  

  const handleChange = (index: number, value: string) => {
    const updated = [...days];
    updated[index] = value;
    setDays(updated);
  };

  const getNextBandName = (bands: { band_name: string }[]) => {
    if (!bands || bands.length === 0) return "A";

    // Extract only valid single-letter band names
    const letters = bands
      .map(b => b.band_name?.toUpperCase())
      .filter(b => /^[A-Z]$/.test(b));

    if (letters.length === 0) return "A";

    // Find the highest letter
    const maxCharCode = Math.max(...letters.map(l => l.charCodeAt(0)));

    // Stop at Z (optional safeguard)
    if (maxCharCode >= 90) {
      throw new Error("Maximum band limit reached (Z)");
    }

    return String.fromCharCode(maxCharCode + 1);
  };


  const handleSave = async () => {
    const lastDay = Number(days[29]);
    const inc = Number(incrementValue);
    const autoDays = [...days];

    if (lastDay && inc) {
      for (let i = 30; i < 60; i++) {
        autoDays[i] = String(lastDay + inc * (i - 29));
      }
    }

    await fetch(`${API_BASE_URL}/api/global-bands`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        band_name: bandName,
        increment_value: incrementValue,
        days: autoDays,
      }),
    });

    


    refresh();
    onClose();
  };

  useEffect(() => {
      if (open) {
        try {
          const nextBand = getNextBandName(existingBands || []);
          setBandName(nextBand);
        } catch (err) {
          alert("Maximum band limit reached (Z)");
          onClose();
        }
      }
    }, [open, existingBands]);

    if (!open) return null;

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40 backdrop-blur-sm p-3">

        <div className="bg-white w-full max-w-[900px] rounded-2xl border shadow-xl max-h-[90vh] overflow-y-auto">

          {/* HEADER */}
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold">
              Add New Global Band
            </h2>
          </div>

          {/* BODY */}
          <div className="px-6 py-5">

            {/* Form Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[11px] font-medium text-gray-700 block mb-1">
                  Band Name *
                </label>
                <input
                  value={bandName}
                  disabled
                  className="border w-full px-3 py-2 rounded text-sm bg-gray-100 cursor-not-allowed"
                  placeholder="Auto generated"
                />

              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-700 block mb-1">
                  Increment Value *
                </label>
                <input
                  value={incrementValue}
                  onChange={(e) => setIncrementValue(e.target.value)}
                  type="number"
                  className="border w-full px-3 py-2 rounded text-sm"
                  placeholder="4"
                />
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {days.map((val, i) => (
                <div key={i}>
                  <label className="text-[11px] font-medium text-gray-700 block mb-1">
                    {i + 1} DAY(S) *
                  </label>
                  <input
                    value={val}
                    onChange={(e) => handleChange(i, e.target.value)}
                    className="border w-full px-2 py-1 rounded text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                </div>
              ))}
            </div>

          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900"
            >
              Save Band
            </button>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
