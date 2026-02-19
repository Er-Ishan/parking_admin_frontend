"use client";

import React, { useState } from "react";
import { Save, Eye } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function WebsiteSettings() {
  const [form, setForm] = useState({
    website_name: "",
    website_url: "",
    website_contact: "",
    website_mobile: "",
    website_email: "",
    office_address: "",
    postcode: "",
    booking_prefix: "",
    booking_ref: "",
    amend_short_notice_hours: "",
    cancel_short_notice_hours: "",
    booking_fee: "",
    booking_fee_message: "",
    smtp_server: "",
    smtp_port: "",
    smtp_user: "",
    smtp_password: "",
    email_title: "",
    booking_email_address: "",
    reply_email_address: "",
    no_reply_email: "",
    website_active: "1",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch(`${API_BASE}/api/website/settings/insert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) return setMessage(data.error || "Error saving");

    setMessage("Website Added Successfully!");
  };

  return (
    <div className="border w-full mx-auto px-4 sm:px-6 lg:px-8 p-6 rounded-xl mt-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Website Settings</h2>

        <button
          type="button"
          onClick={() => (window.location.href = "/website-view")}
        >
          <Eye className="text-primary hover:text-amber-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>

        {/* SECTION 1 */}
        <div className="border rounded-lg p-4 mb-6 bg-white">
          <h3 className="font-semibold text-sm mb-4">General Website Info</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input name="website_name" label="Website Name *" value={form.website_name} onChange={handleChange} required/>
            <Input name="website_url" label="Website URL *" value={form.website_url} onChange={handleChange} required/>
            <Input name="website_contact" label="Website Contact" value={form.website_contact} onChange={handleChange} required/>
            <Input name="website_mobile" label="Website Mobile" value={form.website_mobile} onChange={handleChange} required/>
            <Input name="website_email" label="Website Email" value={form.website_email} onChange={handleChange} required/>
            <Input name="office_address" label="Office Address" value={form.office_address} onChange={handleChange} required/>
            <Input name="postcode" label="Postcode" value={form.postcode} onChange={handleChange} required/>
          </div>
        </div>

        {/* SECTION 2 */}
        <div className="border rounded-lg p-4 mb-6 bg-white">
          <h3 className="font-semibold text-sm mb-4">Booking Configuration</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input name="booking_prefix" label="Booking Prefix" value={form.booking_prefix} onChange={handleChange} required/>
            <Input name="booking_ref" label="Booking Ref" value={form.booking_ref} onChange={handleChange} required/>
            <Input name="amend_short_notice_hours" label="Amend Short Notice (hours)" value={form.amend_short_notice_hours} onChange={handleChange} required/>
            <Input name="cancel_short_notice_hours" label="Cancel Short Notice (hours)" value={form.cancel_short_notice_hours} onChange={handleChange} required/>
            <Input name="booking_fee" label="Booking Fee" value={form.booking_fee} onChange={handleChange} required/>

            <div className="col-span-full">
              <label className="text-sm block mb-1">Booking Fee Message</label>
              <textarea
                name="booking_fee_message"
                value={form.booking_fee_message}
                onChange={handleChange}
                className="border p-2 rounded w-full h-24"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3 */}
        <div className="border rounded-lg p-4 mb-6 bg-white">
          <h3 className="font-semibold text-sm mb-4">SMTP & Email Settings</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input name="smtp_server" label="SMTP Server" value={form.smtp_server} onChange={handleChange} required/>
            <Input name="smtp_port" label="SMTP Port" value={form.smtp_port} onChange={handleChange} required/>
            <Input name="smtp_user" label="SMTP Username" value={form.smtp_user} onChange={handleChange} required/>
            <Input name="smtp_password" label="SMTP Password" value={form.smtp_password} onChange={handleChange} required/>
            <Input name="email_title" label="Email Title" value={form.email_title} onChange={handleChange} required/>
            <Input name="booking_email_address" label="Booking Email Address" value={form.booking_email_address} onChange={handleChange} required/>
            <Input name="reply_email_address" label="Reply Email Address" value={form.reply_email_address} onChange={handleChange} required/>
            <Input name="no_reply_email" label="No Reply Email" value={form.no_reply_email} onChange={handleChange} required/>

            <div>
              <label className="text-sm mb-1 block">Website Status</label>
              <select
                name="website_active"
                value={form.website_active}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-end mt-4">
          <button onClick={() => (window.location.href = "/website-view")} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
             Save Settings
          </button>
        </div>

        {message && (
          <p className="text-green-600 font-medium mt-4">{message}</p>
        )}
      </form>
    </div>
  );
}

/* FIXED INPUT COMPONENT */
function Input({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm block mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}
