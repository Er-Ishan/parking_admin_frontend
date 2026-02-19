"use client";

import React, { useState } from "react";
import { View } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SupplierForm() {
  const [formData, setFormData] = useState({
    supplier_name: "",
    reg_no: "",
    supplier_address: "",
    supplier_contact: "",
    supplier_email: "",
    from_email_address: "",
    commission: "",
    director_name: "",
    director_email: "",
    director_phone: "",
    email_parsing_active: false,
    supplier_active: false,
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    try {
      const res = await fetch(`${API_BASE}/api/suppliers/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Supplier added successfully");
        setMessageType("success");

        setFormData({
          supplier_name: "",
          reg_no: "",
          supplier_address: "",
          supplier_contact: "",
          supplier_email: "",
          from_email_address: "",
          commission: "",
          director_name: "",
          director_email: "",
          director_phone: "",
          email_parsing_active: false,
          supplier_active: false,
        });
      } else {
        setMessage(data.message || "Something went wrong");
        setMessageType("error");
      }
    } catch {
      setMessage("Backend connection failed");
      setMessageType("error");
    }
  };

  return (
    <div className="w-full bg-white border  p-6 mt-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Add New Supplier
        </h2>

        <button
          type="button"
          onClick={() => (window.location.href = "/suppliersList")}
          className="text-gray-500 hover:text-blue-600"
        >
          <View size={20} />
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* INPUT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          <div>
            <label className="text-sm text-gray-600">Supplier Website</label>
            <input
              type="text"
              name="supplier_name"
              value={formData.supplier_name}
              onChange={handleChange}
            //   placeholder="https://supplierwebsite.com"
              className="mt-1 w-full border  px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Booking Email</label>
            <input
              type="email"
              name="from_email_address"
              value={formData.from_email_address}
              onChange={handleChange}
            //   placeholder="bookings@supplier.com"
              className="mt-1 w-full border  px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Commission</label>
            <input
              type="text"
              name="commission"
              value={formData.commission}
              onChange={handleChange}
            //   placeholder="e.g. 10%"
              className="mt-1 w-full border  px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

        </div>

        {/* TOGGLES */}
        <div className="flex flex-col sm:flex-row gap-6">

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="email_parsing_active"
              checked={formData.email_parsing_active}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-700">
              Email Parsing Active
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="supplier_active"
              checked={formData.supplier_active}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-700">
              Supplier Active
            </span>
          </label>

        </div>

        {/* ACTIONS */}
        <div className="flex justify-end items-center gap-4 pt-4 border-t">

          {message && (
            <span
              className={`text-sm ${
                messageType === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </span>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2  text-sm hover:bg-blue-700 transition"
          >
            Add Supplier
          </button>

        </div>

      </form>
    </div>
  );
}
