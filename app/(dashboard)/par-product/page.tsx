"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const AIRPORTS = ["LHR", "LGW", "STN", "LTN", "MAN", "BHX"] as const;
const SERVICES = [
  "Meet & Greet",
  "Park & Ride",
  "Meet & Greet (Indoor)",
  "Park & Ride (Indoor)",
] as const;

export default function AddParkingProductPage() {
  const [form, setForm] = useState({
    product_name: "",
    airport: "",
    service_type: "",
    supplier_name: "",
    base_price: "",
    commission_percentage: "",
    min_days: "",
    max_days: "",
    is_active: true,
    is_refundable: false,
    secure_parking: false,
    cctv: false,
    insured_driver: false,
    indoor_parking: false,
    car_wash_available: false,
    short_description: "",
    full_description: "",
  });

  const update = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const submitProduct = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error("Failed to add product");

      alert("Parking Product Added Successfully!");
      setForm({
        product_name: "",
        airport: "",
        service_type: "",
        supplier_name: "",
        base_price: "",
        commission_percentage: "",
        min_days: "",
        max_days: "",
        is_active: true,
        is_refundable: false,
        secure_parking: false,
        cctv: false,
        insured_driver: false,
        indoor_parking: false,
        car_wash_available: false,
        short_description: "",
        full_description: "",
      });
    } catch (e: any) {
      alert(e?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Add Parking Product</h1>

      {/* Product Details */}
      <div className="border rounded-lg p-4 space-y-4 bg-white">
        <h2 className="font-semibold">Product Details</h2>

        <Input
          placeholder="Product Name"
          value={form.product_name}
          onChange={(e) => update("product_name", e.target.value)}
        />

        <select
          className="border h-10 rounded px-2 w-full text-sm"
          value={form.airport}
          onChange={(e) => update("airport", e.target.value)}
        >
          <option value="">Select Airport</option>
          {AIRPORTS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          className="border h-10 rounded px-2 w-full text-sm"
          value={form.service_type}
          onChange={(e) => update("service_type", e.target.value)}
        >
          <option value="">Select Service Type</option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <Input
          placeholder="Supplier Name"
          value={form.supplier_name}
          onChange={(e) => update("supplier_name", e.target.value)}
        />
      </div>

      {/* Pricing */}
      <div className="border rounded-lg p-4 space-y-4 bg-white">
        <h2 className="font-semibold">Pricing</h2>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Base Price (£)"
            value={form.base_price}
            onChange={(e) => update("base_price", e.target.value)}
          />

          <Input
            type="number"
            placeholder="Commission (%)"
            value={form.commission_percentage}
            onChange={(e) => update("commission_percentage", e.target.value)}
          />

          <Input
            type="number"
            placeholder="Minimum Days"
            value={form.min_days}
            onChange={(e) => update("min_days", e.target.value)}
          />

          <Input
            type="number"
            placeholder="Maximum Days"
            value={form.max_days}
            onChange={(e) => update("max_days", e.target.value)}
          />
        </div>
      </div>

      {/* Availability */}
      <div className="border rounded-lg p-4 space-y-4 bg-white">
        <h2 className="font-semibold">Availability</h2>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => update("is_active", e.target.checked)}
          />
          Active Product
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_refundable}
            onChange={(e) => update("is_refundable", e.target.checked)}
          />
          Refundable
        </label>
      </div>

      {/* Features */}
      <div className="border rounded-lg p-4 space-y-4 bg-white">
        <h2 className="font-semibold">Features</h2>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.secure_parking}
              onChange={(e) => update("secure_parking", e.target.checked)}
            />
            Secure Parking
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.cctv}
              onChange={(e) => update("cctv", e.target.checked)}
            />
            CCTV Surveillance
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.insured_driver}
              onChange={(e) => update("insured_driver", e.target.checked)}
            />
            Insured Driver
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.indoor_parking}
              onChange={(e) => update("indoor_parking", e.target.checked)}
            />
            Indoor Parking
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.car_wash_available}
              onChange={(e) => update("car_wash_available", e.target.checked)}
            />
            Car Wash Available
          </label>
        </div>
      </div>

      {/* Description */}
      <div className="border rounded-lg p-4 space-y-4 bg-white">
        <h2 className="font-semibold">Descriptions</h2>

        <Textarea
          placeholder="Short Description"
          value={form.short_description}
          onChange={(e) => update("short_description", e.target.value)}
        />

        <Textarea
          placeholder="Full Description"
          className="min-h-[120px]"
          value={form.full_description}
          onChange={(e) => update("full_description", e.target.value)}
        />
      </div>

      {/* Submit */}
      <Button className="w-full h-10 text-sm" onClick={submitProduct}>
        Add Parking Product
      </Button>
    </div>
  );
}
