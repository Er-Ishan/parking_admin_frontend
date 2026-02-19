"use client";

import React, { useEffect, useState } from "react";
import { View } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import RichTextEditor from "@/components/RichTextEditor";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AddParkingProduct() {
  const [form, setForm] = useState({
    airport_name: "",
    service_provider: "",
    product_name: "",
    airport_number: "",
    booking_email: "",
    airport_charges: "",
    operational_from: "",
    operational_to: "",
    book_short_hours: "",
    commission: "",
    product_extra: "",
    nonflex: "",
    service_type: "",
    recommended: "",
    product_description: "",
    product_overview: "",
    dropoff_procedure: "",
    directions: "",
    status: "Active",
  });

  const [message, setMessage] = useState("");
  const [airportList, setAirportList] = useState<AirportDropdown[]>([]);


  useEffect(() => {
    fetch(`${API_BASE}/api/data/airports`)
      .then((res) => res.json())
      .then((data) => setAirportList(data))
      .catch((err) => console.error("Error fetching airports:", err));
  }, []);



  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch(`${API_BASE}/api/parking/product/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Error saving product");
      return;
    }

    setMessage("Parking Product added successfully!");

    setForm({
      airport_name: "",
      service_provider: "",
      product_name: "",
      airport_number: "",
      booking_email: "",
      airport_charges: "",
      operational_from: "",
      operational_to: "",
      book_short_hours: "",
      commission: "",
      product_extra: "",
      nonflex: "",
      service_type: "",
      recommended: "",
      product_description: "",
      product_overview: "",
      dropoff_procedure: "",
      directions: "",
      status: "Active",
    });
  };

  type AirportDropdown = {
    airport_id: number;
    airport_name: string;
    iata_code: string;
  };



  return (
    <ProtectedRoute>
      <div className="border w-full mx-auto px-4 sm:px-6 lg:px-8 p-6  mt-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Add Parking Product</h2>

          <button
            type="button"
            onClick={() => (window.location.href = "/viewProducts")}
          >
            <View className="text-primary hover:text-amber-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>


          {/* ===========================
            SECTION 1 — BASIC DETAILS
        ============================ */}
          <div className="border  p-4 mb-6 bg-white">
            <h3 className="font-semibold text-sm mb-4">Basic Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              <div>
                <label className="text-sm">Airport Name *</label>
                <select
                  name="airport_name"
                  value={form.airport_name}
                  onChange={handleChange}
                  className="border p-2  w-full"
                  required
                >
                  <option value="">Select Airport</option>

                  {airportList.map((a) => (
                    <option key={a.airport_id} value={a.airport_name}>
                      {a.airport_name}
                    </option>
                  ))}
                </select>

              </div>

              <div>
                <label className="text-sm">Service Provider *</label>
                <input
                  type="text"
                  name="service_provider"
                  value={form.service_provider}
                  onChange={handleChange}
                  className="border p-2  w-full"
                  required
                />
              </div>

              <div>
                <label className="text-sm">Product Name *</label>
                <input
                  type="text"
                  name="product_name"
                  value={form.product_name}
                  onChange={handleChange}
                  className="border p-2  w-full"
                  required
                />
              </div>

              <div>
                <label className="text-sm">Airport Number *</label>
                <input
                  type="text"
                  name="airport_number"
                  value={form.airport_number}
                  onChange={handleChange}
                  className="border p-2  w-full"
                />
              </div>

              <div>
                <label className="text-sm">Booking Email *</label>
                <input
                  type="email"
                  name="booking_email"
                  value={form.booking_email}
                  onChange={handleChange}
                  className="border p-2  w-full"
                  required
                />
              </div>

              <div>
                <label className="text-sm">Airport Charges</label>
                <input
                  type="text"
                  name="airport_charges"
                  value={form.airport_charges}
                  onChange={handleChange}
                  className="border p-2  w-full"
                />
              </div>

            </div>
          </div>


          {/* ===========================
            SECTION 2 — OPERATIONS
        ============================ */}
          {/* OPERATIONAL DETAILS */}
          <div className="border  p-4 mb-6 bg-white">
            <h3 className="font-semibold text-sm mb-4">Operational Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              <div>
                <label className="text-sm">Operational Hours From</label>
                <input
                  type="time"
                  name="operational_from"
                  value={form.operational_from}
                  onChange={handleChange}
                  className="border p-2  w-full"
                />
              </div>

              <div>
                <label className="text-sm">Operational Hours To</label>
                <input
                  type="time"
                  name="operational_to"
                  value={form.operational_to}
                  onChange={handleChange}
                  className="border p-2  w-full"
                />
              </div>

              <div>
                <label className="text-sm">Book Short Hours</label>
                <input
                  type="text"
                  name="book_short_hours"
                  value={form.book_short_hours}
                  onChange={handleChange}
                  className="border p-2  w-full"
                />
              </div>

              <div>
                <label className="text-sm">Commission</label>
                <input
                  type="text"
                  name="commission"
                  value={form.commission}
                  onChange={handleChange}
                  className="border p-2  w-full"
                />
              </div>

              {/* NEW FLEXIBILITY FIELD */}
              <div>
                <label className="text-sm">Flexibility</label>
                <select
                  name="nonflex"
                  value={form.nonflex}
                  onChange={handleChange}
                  className="border p-2  w-full"
                >
                  <option value="">Select</option>
                  <option value="Refundable">Refundable</option>
                  <option value="Non-Refundable">Non-Refundable</option>
                </select>
              </div>

              <div>
                <label className="text-sm">Service Type</label>
                <select
                  name="service_type"
                  value={form.service_type}
                  onChange={handleChange}
                  className="border p-2  w-full"
                >
                  <option value="">Select</option>
                  <option value="Meet & Greet">Meet & Greet</option>
                  <option value="Park & Ride">Park & Ride</option>
                </select>
              </div>

              <div>
                <label className="text-sm">Recommended</label>
                <select
                  name="recommended"
                  value={form.recommended}
                  onChange={handleChange}
                  className="border p-2  w-full"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* ===========================
            SECTION 3 — CONTENT
        ============================ */}
          <div className="border  p-4 mb-6 bg-white">
            <h3 className="font-semibold text-sm mb-4">Product Content</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div>
                <label className="text-sm">Product Description *</label>
                <RichTextEditor
                  value={form.product_description || ""}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      product_description: val,
                    })
                  }
                />

              </div>

              <div>
                <label className="text-sm">Product Overview Popup</label>
                <RichTextEditor
                  value={form.product_overview || ""}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      product_overview: val,
                    })
                  }
                />

              </div>

            </div>
          </div>


          {/* ===========================
            SECTION 4 — PROCEDURES
        ============================ */}
          <div className="border  p-4 mb-6 bg-white">
            <h3 className="font-semibold text-sm mb-4">Procedures</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm">Drop-off Procedure *</label>
                <RichTextEditor
                  value={form.dropoff_procedure || ""}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      dropoff_procedure: val,
                    })
                  }
                />

              </div>

              <div>
                <label className="text-sm">Directions *</label>
                <RichTextEditor
                  value={form.directions || ""}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      directions: val,
                    })
                  }
                />

              </div>
            </div>
          </div>


          {/* ===========================
            SUBMIT BUTTON
        ============================ */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2  hover:bg-blue-700"
            >
              Save Product
            </button>
          </div>

          {message && <p className="text-green-600 mt-3">{message}</p>}

        </form>
      </div>
    </ProtectedRoute>
  );
}
