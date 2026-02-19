"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddBandModal from "./AddBandModal";
import GlobalBandsTable from "./GlobalBandsTable";
import { Trash } from "lucide-react";


type PriceBand = {
  id: number;
  year: number;
  month: string;
  bandRow: string[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH_INDEX = now.getMonth(); // 0 = January

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getAllowedMonths = (year: number | null) => {
  if (!year) return [];

  if (year === CURRENT_YEAR) {
    return MONTHS.slice(CURRENT_MONTH_INDEX);
  }

  if (year > CURRENT_YEAR) {
    return MONTHS;
  }

  return [];
};



const getDaysInMonth = (month: string, year: number) => {
  const months: any = {
    January: 31,
    February: (year % 4 === 0 ? 29 : 28),
    March: 31,
    April: 30,
    May: 30,
    June: 30,
    July: 31,
    August: 31,
    September: 30,
    October: 31,
    November: 30,
    December: 31,
  };

  return months[month] || 31;
};


export default function ManagePrice() {
  const params = useSearchParams();

  const id = params.get("id");
  const productName = params.get("name");
  const provider = params.get("provider");

  const [bands, setBands] = useState<PriceBand[]>([]);
  const [loading, setLoading] = useState(false);

  // modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedBandRow, setSelectedBandRow] = useState<string[]>([]);
  const [selectedBandId, setSelectedBandId] = useState<number | null>(null);


  // New Filter States
  const [newYear, setNewYear] = useState("");
  const [newMonth, setNewMonth] = useState("");
  const [newOption, setNewOption] = useState("");

  const handleDelete = async (bandId: number) => {
    if (!confirm("Are you sure?")) return;

    // Optimistic update
    setBands(prev => prev.filter(b => b.id !== bandId));

    await fetch(`${API_BASE_URL}/api/price-bands/${bandId}`, {
      method: "DELETE",
      credentials: "include",
    });
  };



  const loadPriceBands = async () => {
    if (!id) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/price-bands/${id}`, {
        cache: "no-store",
        credentials: "include",
      });

      const json = await res.json();

      const formatted = json.map((item: any) => ({
        id: item.id,
        year: item.year,
        month: item.month,
        bandRow: Array.from(
          { length: 31 },
          (_, i) => item[`day_${i + 1}`] || "-"
        ),
      }));

      setBands(formatted);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriceBands();
  }, [id]);

  // open modal WHEN editing existing row
  const handleEdit = (id: number, month: string, year: number, bandRow: string[]) => {
    setSelectedBandId(id);
    setSelectedMonth(month);
    setSelectedYear(year);
    setSelectedBandRow(bandRow);
    setModalOpen(true);
  };


  // adding new month & year
  const handleNewBand = async () => {
    if (!newYear || !newMonth) {
      alert("Select Year and Month first");
      return;
    }

    const yearNum = Number(newYear);

    // ✅ DUPLICATE CHECK
    const alreadyExists = bands.some(
      (b) => b.year === yearNum && b.month === newMonth
    );

    if (alreadyExists) {
      alert(`Price band for ${newMonth} ${yearNum} already exists.`);
      return;
    }

    await fetch(`${API_BASE_URL}/api/price-bands`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: id,
        year: yearNum,
        month: newMonth,
      }),
    });

    setNewMonth(""); // optional UX reset
    await loadPriceBands();
  };


  return (
    <div className="w-full px-6 py-5">

      {/* TITLE & BACK */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">
          {provider} <span className="text-gray-500">• {productName}</span>
        </h2>

        <button
          onClick={() => (window.location.href = "/viewProducts")}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-900 text-white text-sm"
        >
          ← Back To Product List
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 mb-3 flex-wrap">

        <select
          className="border px-3 py-1 text-xs rounded"
          value={newYear}
          onChange={(e) => {
            const year = e.target.value;
            setNewYear(year);
            setNewMonth(""); // RESET month properly
          }}

        >
          <option value="">Select Year</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>

        <select
          className="border px-3 py-1 text-xs rounded"
          value={newMonth}
          onChange={(e) => setNewMonth(e.target.value)}
          disabled={!newYear}
        >
          <option value="">Select Month</option>

          {getAllowedMonths(newYear ? Number(newYear) : null).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>




        <button
          onClick={handleNewBand}
          className="px-4 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
        >
          Price Plans Action
        </button>
      </div>

      {/* TABLE */}
      {!loading && (
        <div className="overflow-x-auto border bg-white rounded">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-3 py-2 text-left border-r">Year</th>
                <th className="px-3 py-2 text-left border-r">Month</th>
                <th className="px-3 py-2 text-left border-r">Actions</th>

                {Array.from({ length: 31 }).map((_, i) => (
                  <th key={i} className="px-2 py-1 text-center border-r font-medium">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {bands.map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="px-3 py-2 border-r font-semibold">{b.year}</td>
                  <td className="px-3 py-2 border-r">{b.month}</td>

                  <td className="px-3 py-2 border-r">
                    <div className="flex items-center gap-2">

                      {/* EDIT BUTTON */}
                      <button
                        className="px-2 py-1 bg-yellow-300 text-black text-xs rounded"
                        onClick={() => handleEdit(b.id, b.month, b.year, b.bandRow)}
                      >
                        Edit Bands
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(b.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </button>

                    </div>
                  </td>


                  {b.bandRow
                    .slice(0, getDaysInMonth(b.month, b.year))
                    .map((d, index) => (
                      <td key={index} className="px-2 py-1 text-center border-r">
                        {d}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AddBandModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        month={selectedMonth}
        year={selectedYear}
        bandData={selectedBandRow}
        bandId={selectedBandId}
        refresh={loadPriceBands}
        productId={id!}
      />


      <GlobalBandsTable
        productId={id!}
        productName={productName!}
        provider={provider!}
      />

    </div>
  );
}
