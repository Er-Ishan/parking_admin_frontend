"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ================= TYPES ================= */
type FeatureItem = {
  icon: string;
  title: string;
  description: string;
};

export default function PageEditorForm() {
  const [formData, setFormData] = useState({
    page_slug: "home",
    title: "",
    subtitle: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    features: [
      { icon: "🛡️", title: "", description: "" },
      { icon: "🚐", title: "", description: "" },
      { icon: "💷", title: "", description: "" },
      { icon: "🖱️", title: "", description: "" },
    ] as FeatureItem[],
  });

  const [message, setMessage] = useState("");

  /* ================= HANDLERS ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (
    index: number,
    field: keyof FeatureItem,
    value: string
  ) => {
    const updated = [...formData.features];
    updated[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      features: updated,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/pages/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();
      setMessage("Page content saved successfully");
    } catch {
      setMessage("Failed to save content");
    }
  };

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-10 py-8">

      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Page Content Editor
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage website content and SEO metadata
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* ================= PAGE CONTENT ================= */}
        <section className=" border border-slate-200 p-6 rounded-none">
          <h2 className="text-lg font-medium mb-6">
            Page Content
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Page Title
              </label>
              <textarea
                name="title"
                value={formData.title}
                onChange={handleChange}
                rows={2}
                className="w-full border border-slate-300 px-3 py-2 rounded-none focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Subtitle
              </label>
              <textarea
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                rows={2}
                className="w-full border border-slate-300 px-3 py-2 rounded-none focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </section>

        {/* ================= SEO ================= */}
        <section className=" border border-slate-200 p-6 rounded-none">
          <h2 className="text-lg font-medium mb-6">
            SEO Meta Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Meta Title
              </label>
              <input
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                className="w-full border border-slate-300 px-3 py-2 rounded-none focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Meta Keywords
              </label>
              <input
                name="meta_keywords"
                value={formData.meta_keywords}
                onChange={handleChange}
                className="w-full border border-slate-300 px-3 py-2 rounded-none focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Meta Description
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-slate-300 px-3 py-2 rounded-none focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className=" border border-slate-200 p-6 rounded-none">
          <h2 className="text-lg font-medium mb-6">
            Feature Cards
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {formData.features.map((item, index) => (
              <div
                key={index}
                className="border border-slate-300 p-4 rounded-none "
              >
                <h3 className="font-medium mb-4">
                  Feature {index + 1}
                </h3>

                <div className="space-y-3">
                  <input
                    value={item.icon}
                    onChange={(e) =>
                      handleFeatureChange(index, "icon", e.target.value)
                    }
                    placeholder="Icon"
                    className="w-full border border-slate-300 px-3 py-2 rounded-none focus:outline-none focus:border-blue-600"
                  />

                  <input
                    value={item.title}
                    onChange={(e) =>
                      handleFeatureChange(index, "title", e.target.value)
                    }
                    placeholder="Feature title"
                    className="w-full border border-slate-300 px-3 py-2 rounded-none focus:outline-none focus:border-blue-600"
                  />

                  <textarea
                    value={item.description}
                    onChange={(e) =>
                      handleFeatureChange(index, "description", e.target.value)
                    }
                    rows={3}
                    placeholder="Feature description"
                    className="w-full border border-slate-300 px-3 py-2 rounded-none focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= ACTION BAR ================= */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            className="px-8 py-2.5 bg-blue-600 text-white rounded-none hover:bg-blue-700 transition"
          >
            Save Changes
          </button>

          {message && (
            <span className="text-sm text-slate-700">
              {message}
            </span>
          )}
        </div>

      </form>
    </div>
  );
}
