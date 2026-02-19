"use client";

import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import AddGlobalBandModal from "./AddGlobalBandModal";
import EditGlobalBandModal from "./EditGlobalBandModal";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Band = {
  id: number;
  band_name: string;
  increment_value: number;
  product_id: number;
  [key: string]: number | string | null;
};

const formatPrice = (value: any) => {
  if (value === null || value === "" || value === "-") return "-";
  const num = Number(value);
  return Number.isInteger(num) ? num : num.toFixed(2).replace(/\.00$/, "");
};

export default function GlobalBandsTable({
  productId,
  productName,
  provider,
}: {
  productId: string;
  productName: string;
  provider: string;
}) {
  const [data, setData] = useState<Band[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedBand, setSelectedBand] = useState<Band | null>(null);

  const load = async () => {
    const res = await fetch(`${API_BASE_URL}/api/global-bands/${productId}`, {
      cache: "no-store",
      credentials: "include",
    });
    const json = await res.json();
    setData(json);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete band?")) return;
    await fetch(`${API_BASE_URL}/api/global-bands/${id}`, { method: "DELETE", credentials: "include", });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ProtectedRoute>
      <div className="mt-6 bg-white rounded-xl border shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {productName}
            </h3>
            <p className="text-[11px] text-gray-500">
              Provider: {provider}
            </p>
          </div>

          <button
            onClick={() => setOpenAdd(true)}
            className="bg-blue-600 text-white text-xs px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
          >
            + Add New Band
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-[12px] border-collapse table-fixed">

            <thead className="bg-gray-100">
              <tr className="border-b text-gray-700">

                <th className="px-2 py-3 w-[36px] border-r text-center">#</th>
                <th className="px-2 py-3 w-[70px] border-r text-center">Action</th>

                <th className="px-2 py-3 w-[60px] border-r sticky left-0 bg-gray-100 text-center font-semibold">
                  Band
                </th>

                {Array.from({ length: 30 }).map((_, i) => (
                  <th
                    key={i}
                    className={`px-1 py-2 border-r text-center w-[42px]
                  ${[7, 14, 21].includes(i)
                        ? "bg-purple-200 font-semibold text-purple-900"
                        : ""}`}
                  >
                    {i + 1}
                  </th>
                ))}

                <th className="px-2 py-3 border-r text-center w-[40px]">31+</th>
                <th className="px-2 py-3 text-center w-[40px]"></th>
              </tr>
            </thead>

            <tbody>
              {data.map((b, i) => (
                <tr
                  key={b.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-2 py-2 border-r text-center">{i + 1}</td>

                  <td className="px-2 py-2 border-r text-center">
                    <button
                      onClick={() => {
                        setSelectedBand(b);
                        setOpenEdit(true);
                      }}
                      className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-[11px] font-medium"
                    >
                      Edit
                    </button>
                  </td>

                  <td className="px-2 py-2 border-r sticky left-0 bg-white font-semibold text-center">
                    {b.band_name}
                  </td>

                  {Array.from({ length: 30 }).map((_, idx) => (
                    <td
                      key={idx}
                      className={`px-1 py-2 text-center border-r
                    ${[7, 14, 21].includes(idx)
                          ? "bg-purple-50 font-medium"
                          : ""}`}
                    >
                      {formatPrice(b[`day_${idx + 1}`])}
                    </td>
                  ))}

                  <td className="px-2 py-2 text-center border-r font-semibold">
                    {formatPrice(b.increment_value)}
                  </td>

                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="hover:scale-110 transition"
                    >
                      <Trash className="text-red-600 w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* ADD MODAL */}
        <AddGlobalBandModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          productId={productId}
          refresh={load}
          existingBands={data}
        />

        {/* EDIT MODAL */}
        <EditGlobalBandModal
          open={openEdit}
          onClose={() => {
            setOpenEdit(false);
            setSelectedBand(null);
          }}
          band={selectedBand}
          refresh={load}
        />
      </div>
    </ProtectedRoute>
  );
}
