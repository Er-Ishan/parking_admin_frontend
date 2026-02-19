"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";

type Band = {
  id: number;
  band_name: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  month: string;
  year: number;
  bandData: string[];
  bandId: number | null;
  refresh: () => void;
  productId: string;
};

export default function AddBandModal({
  open,
  onClose,
  month,
  year,
  bandData,
  bandId,
  refresh,
  productId,
}: Props) {

  /* -------------------- STATES -------------------- */
  const [formValues, setFormValues] = useState<string[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [selectedBand, setSelectedBand] = useState("");

  /* -------------------- LOAD GLOBAL BANDS -------------------- */
  useEffect(() => {
    if (!open) return;

    const loadBands = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/global-bands/${productId}`,
        {
          cache: "no-store",
          credentials: "include",
        }
      );
      const data = await res.json();
      setBands(data);
    };

    loadBands();
  }, [open, productId]);

  /* -------------------- SYNC BAND DATA ON OPEN -------------------- */
  useEffect(() => {
    if (open) {
      setFormValues(bandData);
      setSelectedBand("");
    }
  }, [open, bandData]);

  /* -------------------- BLOCK INVALID MANUAL INPUT -------------------- */
  const handleInputChange = (val: string, index: number) => {
    const upperVal = val.toUpperCase(); // ✅ force uppercase

    if (upperVal && !bands.some(b => b.band_name === upperVal)) {
      alert("This band is not available. Please select a valid band.");
      return;
    }

    const updated = [...formValues];
    updated[index] = upperVal;

    // autofill all days when first day changes
    if (index === 0) {
      updated.fill(upperVal);
    }

    setFormValues(updated);
  };

  /* -------------------- DROPDOWN SELECT -------------------- */
  const handleSelectBand = (val: string) => {
    if (!bands.some(b => b.band_name === val)) return;

    setSelectedBand(val);
    setFormValues(formValues.map(() => val));
  };

  /* -------------------- SAVE WITH FINAL VALIDATION -------------------- */
  const handleSave = async () => {
    if (!bandId) {
      alert("No band selected!");
      return;
    }

    // final safety check
    const hasInvalid = formValues.some(
      (v) => v && !bands.some(b => b.band_name === v)
    );

    if (hasInvalid) {
      alert("One or more days contain an unavailable band.");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/price-bands/${bandId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bandRow: formValues }),
      }
    );

    const data = await res.json();
    alert(
      data.success
        ? "Price Band Updated Successfully"
        : "Error updating price band"
    );

    onClose();
    refresh();
  };

  /* -------------------- SAFE RETURN -------------------- */
  if (!open) return null;

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/30 backdrop-blur-sm p-2">
        <div className="bg-white w-full max-w-[700px] max-h-[90vh] overflow-y-auto  shadow-xl border">

          <div className="w-full px-5 py-4 border-b">
            <h2 className="text-lg font-semibold">
              Apply Band — {month} {year}
            </h2>
          </div>

          <div className="px-5 py-4">

            {/* DROPDOWN */}
            <label className="text-[10px] font-medium text-gray-700 block mb-1">
              Select Band *
            </label>
            <select
              value={selectedBand}
              onChange={(e) => handleSelectBand(e.target.value)}
              className="border  w-full p-1 text-xs mb-4"
            >
              <option value="">Select Band</option>
              {bands.map((b) => (
                <option key={b.id} value={b.band_name}>
                  {b.band_name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {formValues.map((val, i) => (
                <div key={i}>
                  <label className="text-[10px] font-medium text-gray-700 block">
                    {i + 1} DAY(S) *
                  </label>
                  <input
                    value={val}
                    onChange={(e) => handleInputChange(e.target.value, i)}
                    type="text"
                    className="w-full border px-2 py-1 mt-1 text-xs uppercase focus:ring-2 focus:ring-purple-400 outline-none"
                  />

                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-5 py-3 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-black  text-sm"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-black hover:bg-purple-700 text-white  text-sm"
            >
              Save Band
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
