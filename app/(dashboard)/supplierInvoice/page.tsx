"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS = ["Active", "Completed", "Cancelled", "Refunded", "No Show", "pending"];

const today = new Date();
const todayStr = today.toISOString().split("T")[0];

const threeDaysAgo = new Date();
threeDaysAgo.setDate(today.getDate() - 3);
const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];


function formatTableDate(value?: string | null) {
  if (!value) return "-";

  const s = String(value).trim();
  if (!s || s.startsWith("0000-00-00")) return "-";

  // ✅ If value is MySQL datetime "YYYY-MM-DD HH:mm:ss", convert to ISO-like
  const isoLike = s.includes(" ") && !s.includes("T") ? s.replace(" ", "T") : s;

  const d = new Date(isoLike);
  if (isNaN(d.getTime())) return "-";

  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}


// Background colors for each status (matching your screenshot)
const statusColors: any = {
  Active: "bg-green-50",
  Completed: "bg-blue-50",
  Cancelled: "bg-red-50",
  Refunded: "bg-red-50",
  "No Show": "bg-red-50",
  pending: "bg-yellow-50",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}


export default function SupplierInvoicePage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState("");

  const [from, setFrom] = useState(threeDaysAgoStr);
  const [to, setTo] = useState(todayStr);

  const [status, setStatus] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  function money(n: number) {
    return `£${Number(n || 0).toFixed(2)}`;
  }

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/suppliers/list`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        console.log("SUPPLIERS API RESPONSE:", json);
        setSuppliers(Array.isArray(json) ? json : json.data ?? []);
      });
  }, []);

  function formatDDMMYYYY(dateStr: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }



  const fetchInvoice = async () => {
    if (!supplierId) return alert("Please choose supplier");

    setLoading(true);
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    if (status) qs.set("status", status);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/invoice/supplier/${supplierId}?${qs}`,
      { cache: "no-store", credentials: "include", }
    );

    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  /* ========================
       MULTI-PAGE PDF
     ======================== */
  const generateSupplierPDF = (data: any) => {
    const doc = new jsPDF("p", "mm", "a4");

    const supplierName = data?.supplierName || "Supplier";
    const totalBookings = Number(data?.totalBookings) || 0;
    const totalAmount = Number(data?.totalAmount) || 0;
    const commission = Number(data?.commission) || 0;
    const invoiceAmount = Number(data?.invoiceAmount) || 0;
    const unitPrice = totalBookings > 0 ? (totalAmount / totalBookings).toFixed(2) : "0.00";

    /* =======================
          PAGE 1 : INVOICE
       ======================= */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INVOICE", 15, 20);

    doc.setFontSize(12);
    doc.text("Issued Date:", 15, 35);
    doc.text(new Date().toLocaleDateString("en-GB"), 45, 35);

    doc.text("Supplier:", 15, 45);
    doc.text(supplierName, 45, 45);

    autoTable(doc, {
      startY: 60,
      head: [["Item", "Quantity", "Price", "Amount"]],
      body: [
        ["Supplier Bookings", totalBookings, `£${unitPrice}`, `£${totalAmount.toFixed(2)}`],
        ["Commission", "", "", `£${commission.toFixed(2)}`],
        ["Invoice Amount", "", "", `£${invoiceAmount.toFixed(2)}`],
      ],
      theme: "grid",
    });

    /* =======================
          PAGE 2 : DETAILS
       ======================= */
    doc.addPage();

    doc.setFontSize(16);
    doc.text("Customer Booking Details", 15, 20);

    const rows = data?.rows?.map((r: any, index: number) => [
      index + 1,
      r.ref_no,
      r.contact_no,
      new Date(r.booked_on).toLocaleDateString(),
      new Date(r.dropoff_datetime).toLocaleDateString(),
      new Date(r.return_datetime).toLocaleDateString(),
      money(r.price),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["S.L", "Ref No", "Contact", "Booked On", "Drop-off", "Return", "Price"]],
      body: rows,
      theme: "grid",
    });

    doc.save("supplier_invoice.pdf");
  };

  function formatPrettyDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "";

    const [y, m, d] = dateStr.split("-");
    return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
  }


  return (
    <div className="p-4 w-full mx-auto">

      <h2 className="text-xl font-semibold mb-4">Supplier Invoice</h2>

      {/* FILTER BAR */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">

        {/* Supplier */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-sm font-medium">Supplier</label>
          <select
            className="h-9 border  px-2"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            <option value="">Select Supplier</option>
            {Array.isArray(suppliers) &&
              suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.supplier_name}
                </option>
              ))}

          </select>
        </div>

        {/* From */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-sm font-medium">From</label>

          <div className="relative w-44">
            {/* Display-only input */}
            <input
              type="text"
              className="h-9 w-full px-3 text-sm border border-gray-300  cursor-pointer "
              value={formatPrettyDate(from)}
              readOnly
              onClick={() =>
                (document.getElementById("fromNative") as HTMLInputElement | null)?.showPicker()
              }

            />

            {/* Native date picker */}
            <input
              id="fromNative"
              type="date"
              className="absolute inset-0 opacity-0"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
            />
          </div>
        </div>



        {/* To */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-sm font-medium">To</label>

          <div className="relative w-44">
            {/* Display-only formatted input */}
            <input
              type="text"
              readOnly
              value={formatPrettyDate(to)}
              onClick={() =>
                (document.getElementById("fromNative") as HTMLInputElement | null)?.showPicker()
              }
              className="
        h-9 w-full px-3 text-sm cursor-pointer
        border border-gray-300 
        
      "
            />

            {/* Native date picker */}
            <input
              type="date"
              className="absolute inset-0 opacity-0"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
            />
          </div>
        </div>


        {/* Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-sm font-medium">Status</label>
          <select className="h-9 border  px-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            {STATUS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Generate */}
        <Button className="rounded-none" onClick={fetchInvoice}>
          {loading ? "Loading..." : "Generate Supplier Invoice"}
        </Button>

        {/* PDF Button */}
        {data && (
          <Button className="bg-green-600 rounded-none text-white" onClick={() => generateSupplierPDF(data)}>
            Download PDF
          </Button>
        )}
      </div>

      {/* SUMMARY TABLE */}
      {data && (
        <div className="-xl border mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-center font-semibold">Supplier</th>
                <th className="py-3 px-4 text-center font-semibold">Total Bookings</th>
                <th className="py-3 px-4 text-center font-semibold">Total Amount</th>
                <th className="py-3 px-4 text-center font-semibold">Commission</th>
                <th className="py-3 px-4 text-center font-semibold">Invoice Amount</th>
                <th className="py-3 px-4 text-center font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="bg-white">
              <tr className="border-b">
                <td className="py-3 px-4 text-center">{data.supplierName}</td>
                <td className="py-3 px-4 text-center">{data.totalBookings}</td>
                <td className="py-3 px-4 text-center">{money(data.totalAmount)}</td>
                <td className="py-3 px-4 text-center">{money(data.commission)}</td>
                <td className="py-3 px-4 text-center">{money(data.invoiceAmount)}</td>
                <td className="py-3 px-4 text-center">
                  <Button className="rounded-none" size="sm" onClick={() => generateSupplierPDF(data)}>Download PDF</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* CUSTOMER TABLE (MATCHING YOUR DESIGN) */}
      {/* {data?.rows?.length > 0 && (
        <div className="mt-8 border rounded-md overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-3 border">S.L.</th>
                <th className="py-2 px-3 border">Ref No</th>
                <th className="py-2 px-3 border">Booked On</th>
                <th className="py-2 px-3 border">Drop-off</th>
                <th className="py-2 px-3 border">Return</th>
                <th className="py-2 px-3 border">Price</th>
              </tr>
            </thead>

            <tbody>
              {data.rows.map((r: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2 px-3 border text-center">{i + 1}</td>
                  <td className="py-2 px-3 border text-center">{r.ref_no ?? "-"}</td>

                  <td className="py-2 px-3 border text-center">
                    {formatTableDate(r.booked_on)}
                  </td>

                  <td className="py-2 px-3 border text-center">
                    {formatTableDate(r.dropoff_datetime)}
                  </td>

                  <td className="py-2 px-3 border text-center">
                    {formatTableDate(r.return_datetime)}
                  </td>

                  <td className="py-2 px-3 border text-center">
                    {money(r.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}


    </div>
  );
}
