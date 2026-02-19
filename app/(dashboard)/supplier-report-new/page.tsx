'use client';

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Send, Download } from "lucide-react";
import { Sheet } from 'lucide-react';
import { FileText, } from 'lucide-react';
import { Mail } from "lucide-react";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatPrettyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
}



function isWithinDateRange(
  rowDate: string,
  from: string,
  to: string,
  single: string
) {
  if (!rowDate) return false;

  const d = normalizeYMD(rowDate);

  if (single) {
    return d === normalizeYMD(single);
  }

  if (from && to) {
    return d >= normalizeYMD(from) && d <= normalizeYMD(to);
  }

  return true; // no date filter applied
}


// Convert date to YYYY-MM-DD
function normalizeYMD(input: string) {
  if (!input) return "";
  const d = new Date(input);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function generateSupplierPDF(data: any) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${data.supplierName} - Invoice</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #333;
      font-size: 14px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #eee;
      padding-bottom: 20px;
    }

    .company-details h1 {
      margin: 0;
      font-size: 26px;
    }

    .company-details p {
      margin: 4px 0;
      font-size: 13px;
    }

    .invoice-title {
      font-size: 32px;
      font-weight: bold;
      text-align: right;
    }

    .invoice-meta {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
    }

    .box {
      width: 48%;
      border: 1px solid #ddd;
      padding: 12px;
    }

    .box h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      text-transform: uppercase;
      color: #666;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
    }

    table th {
      background: #f2f2f2;
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }

    table td {
      border: 1px solid #ddd;
      padding: 10px;
    }

    .totals {
      margin-top: 20px;
      width: 300px;
      float: right;
    }

    .totals table {
      width: 100%;
    }

    .totals td {
      border: none;
      padding: 6px 0;
    }

    .totals tr:last-child td {
      font-weight: bold;
      font-size: 16px;
      border-top: 2px solid #333;
      padding-top: 10px;
    }

    .balance-due {
      margin-top: 30px;
      padding: 15px;
      background: #f2f2f2;
      font-size: 18px;
      font-weight: bold;
      text-align: right;
    }

    .footer {
      margin-top: 80px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>

<body>

  <!-- HEADER -->
  <div class="header">
    <div class="company-details">
      <h1>${data.supplierName}</h1>
      <p>${data.supplierAddress}</p>
      <p>Contact: ${data.supplierContact}</p>
      <p>Email: ${data.supplierEmail}</p>
    </div>

    <div class="invoice-title">
      INVOICE
    </div>
  </div>

  <!-- META INFO -->
  <div class="invoice-meta">
    <div class="box">
      <h4>Bill From</h4>
      <p><strong>${data.supplierName}</strong></p>
      <p>${data.supplierAddress}</p>
      <p>${data.supplierEmail}</p>
    </div>

    <div class="box">
      <h4>Invoice Details</h4>
      <p><strong>Invoice No:</strong> ${data.invoiceNumber || "INV-001"}</p>
      <p><strong>Date:</strong> ${data.invoiceDate || new Date().toLocaleDateString()}</p>
      <p><strong>Commission Rate:</strong> ${data.supplierCommission}%</p>
    </div>
  </div>

  <!-- TABLE -->
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price (£)</th>
        <th>Total (£)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Total Bookings</td>
        <td>${data.totalBookings}</td>
        <td>${Number(data.totalAmount).toFixed(2)}</td>
        <td>${Number(data.totalAmount).toFixed(2)}</td>
      </tr>
      <tr>
        <td>Commission (${data.supplierCommission}%)</td>
        <td>1</td>
        <td>-${Number(data.commission).toFixed(2)}</td>
        <td>-${Number(data.commission).toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <!-- TOTALS -->
  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td style="text-align:right;">£${Number(data.totalAmount).toFixed(2)}</td>
      </tr>
      <tr>
        <td>Commission:</td>
        <td style="text-align:right;">-£${Number(data.commission).toFixed(2)}</td>
      </tr>
      <tr>
        <td>Total Payable:</td>
        <td style="text-align:right;">£${Number(data.invoiceAmount).toFixed(2)}</td>
      </tr>
    </table>
  </div>

  <div style="clear: both;"></div>

  <!-- BALANCE -->
  <div class="balance-due">
    Balance Due: £${Number(data.invoiceAmount).toFixed(2)}
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>Payment due upon receipt.</p>
    <p>Thank you for your business.</p>
  </div>

</body>
</html>
`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}


function downloadCSV(data: any[]) {
  const headers = [
    "Supplier Name",
    "Contact",
    "Email",
    "Address",
    "Supplier Commission",
    "Total Bookings",
    "Total Amount",
    "Commission",
    "Invoice Amount"
  ];

  const csv = [
    headers.join(","),
    ...data.map((r) =>
      [
        r.supplierName,
        r.supplierContact,
        r.supplierEmail,
        r.supplierAddress,
        r.supplierCommission,
        r.totalBookings,
        Number(r.totalAmount).toFixed(2),
        Number(r.commission).toFixed(2),
        Number(r.invoiceAmount).toFixed(2)
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `supplier-summary-${Date.now()}.csv`;
  link.click();
}

function generateFullReportPDF(data: any[]) {
  const rows = data.map((d, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${d.supplierName}</td>
      <td>${d.totalBookings}</td>
      <td>£${Number(d.totalAmount).toFixed(2)}</td>
      <td>£${Number(d.commission).toFixed(2)}</td>
      <td>£${Number(d.invoiceAmount).toFixed(2)}</td>
    </tr>
  `).join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Supplier Report</title>
  <style>
    body { font-family: Arial; padding: 40px; }
    h2 { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
    th { background: #f2f2f2; }
  </style>
</head>
<body>

<h2>Supplier Summary Report</h2>

<table>
  <thead>
    <tr>
      <th>S.L.</th>
      <th>Supplier</th>
      <th>Bookings</th>
      <th>Total</th>
      <th>Commission</th>
      <th>Invoice Amount</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>

</body>
</html>
`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}


export default function SupplierSummaryPage() {

  // const today = new Date().toISOString().split("T")[0];
  // const [fromDate, setFromDate] = useState<string>(today);
  // const [toDate, setToDate] = useState<string>(today);

  const [supplierSummary, setSupplierSummary] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  // const [fromDate, setFromDate] = useState("");
  // const [toDate, setToDate] = useState("");
  const today = new Date().toISOString().split("T")[0];

  // Display only (default today)
  const [displayFromDate, setDisplayFromDate] = useState<string>(today);
  const [displayToDate, setDisplayToDate] = useState<string>(today);

  // Applied filters (EMPTY initially)
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");


  const sendInvoiceEmail = async (supplier: any) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/send-supplier-invoice`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(supplier),
        }
      );

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to send invoice");
    }
  };


  const fetchSummary = async () => {
    try {
      const qs = new URLSearchParams();

      if (fromDate) qs.set("from", fromDate);
      if (toDate) qs.set("to", toDate);

      const response = await fetch(
        `${API_BASE}/api/supplier-summary?${qs.toString()}`
      );

      const data = await response.json();
      setSupplierSummary(data);
    } catch (err) {
      console.error(err);
    }
  };



  useEffect(() => {
    fetchSummary();
  }, [fromDate, toDate]);


  const filteredSuppliers = supplierSummary
    .filter((s: any) => {
      if (!fromDate && !toDate) return true;

      const rowDate = normalizeYMD(s.invoiceDate);
      if (!rowDate) return false;

      if (fromDate && toDate) {
        return rowDate >= fromDate && rowDate <= toDate;
      }
      if (fromDate) return rowDate >= fromDate;
      if (toDate) return rowDate <= toDate;

      return true;
    })
    .filter((s: any) =>
      s.supplierName.toLowerCase().includes(search.toLowerCase())
    );



  const sendSupplierSummaryEmail = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/suppliers/email-summary-csv`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: fromDate || null,
            to: toDate || null
          })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(data.message);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to send email");
    }
  };

  const totals = filteredSuppliers.reduce(
    (acc, s) => {
      acc.suppliers += 1;
      acc.bookings += Number(s.totalBookings || 0);
      acc.totalAmount += Number(s.totalAmount || 0);
      acc.commission += Number(s.commission || 0);
      acc.invoiceAmount += Number(s.invoiceAmount || 0);
      return acc;
    },
    {
      suppliers: 0,
      bookings: 0,
      totalAmount: 0,
      commission: 0,
      invoiceAmount: 0,
    }
  );


  return (
    <div className="mx-auto w-full p-4">

      {/* FILTER BAR */}
      <div className="mb-3 w-full flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">


        <div className="flex items-center gap-2">
          <label className="text-sm font-medium whitespace-nowrap">From</label>

          <div className="relative w-[170px]">
            {/* Display formatted date */}
            <input
              type="text"
              readOnly
              value={formatPrettyDate(fromDate || displayFromDate)}
              className="h-9 w-full px-3 text-sm border border-gray-300 cursor-pointer"
              onClick={() =>
                (document.getElementById("fromNative") as HTMLInputElement | null)
                  ?.showPicker()
              }

            />

            {/* Native date picker */}
            <input
              id="fromNative"
              type="date"
              className="absolute inset-0 opacity-0"
              value={fromDate || ""}
              onChange={(e) => {
                setFromDate(e.target.value);
                setDisplayFromDate(e.target.value);
              }}
              onClick={(e) => e.currentTarget.showPicker?.()}
            />
          </div>
        </div>



        <div className="flex items-center gap-2">
          <label className="text-sm font-medium whitespace-nowrap">To</label>

          <div className="relative w-[170px]">
            {/* Display formatted date */}
            <input
              type="text"
              readOnly
              value={formatPrettyDate(toDate || displayToDate)}
              className="h-9 w-full px-3 text-sm border border-gray-300 cursor-pointer"
              onClick={() =>
                (document.getElementById("toNative") as HTMLInputElement | null)
                  ?.showPicker()
              }
            />

            {/* Native date picker */}
            <input
              id="toNative"
              type="date"
              className="absolute inset-0 opacity-0"
              value={toDate || ""}
              onChange={(e) => {
                setToDate(e.target.value);
                setDisplayToDate(e.target.value);
              }}
              onClick={(e) => e.currentTarget.showPicker?.()}
            />
          </div>
        </div>






        {/* Search */}
        <Input
          type="text"
          placeholder="Search supplier..."
          className="h-9 text-sm w-full sm:flex-1 rounded-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />


        {/* CSV */}
        <Button
          className="h-9 px-4 bg-blue-600 rounded-none text-white w-full sm:w-auto"
          onClick={() => downloadCSV(filteredSuppliers)}
        >
          <Sheet />
        </Button>

        <Button
          className="h-9 px-4 bg-green-600 rounded-none text-white w-full sm:w-auto"
          onClick={() => generateFullReportPDF(filteredSuppliers)}
        >
          <FileText />
        </Button>

        <Button
          className="h-9 px-4 bg-blue-600 rounded-none text-white w-full sm:w-auto"
          onClick={sendSupplierSummaryEmail}
          title="Email Supplier Summary CSV"
        >
          <Send />
        </Button>


      </div>

      {/* SUPPLIER TABLE */}
      <div className="w-full mt-3 overflow-x-auto  border max-w-full">
        <Table className="table-auto w-full text-[12px] md:text-xs border-collapse">

          <TableHeader>
            <TableRow className="sticky top-0 z-10">
              {[
                "S.L", "Company Website", "Commission",
                "Total Bookings", "Total Amount", "Commission", "Invoice Amount", "Action"
              ].map((col, idx) => (
                <TableHead key={idx} className="px-3 py-2 text-center bg-neutral-100">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-6 px-4 text-center text-muted-foreground">
                  No supplier summary available.
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((data: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="py-2 px-3 text-center">{i + 1}</TableCell>
                  <TableCell className="py-2 px-3 text-center">{data.supplierName}</TableCell>
                  {/* <TableCell className="py-2 px-3 text-center">{data.regNo}</TableCell> */}
                  {/* <TableCell className="py-2 px-3 text-center">{data.directorName}</TableCell> */}
                  {/* <TableCell className="py-2 px-3 text-center">{data.supplierContact}</TableCell> */}
                  {/* <TableCell className="py-2 px-3 text-center">
                    <div className="relative group inline-flex items-center justify-center">
                      <Mail className="w-4 h-4 cursor-pointer text-blue-600" />

                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap  bg-black px-2 py-1 text-xs text-white shadow-lg">
                        {data.supplierEmail}
                      </div>
                    </div>
                  </TableCell> */}

                  {/* <TableCell className="py-2 px-3 text-center">{data.supplierAddress}</TableCell> */}
                  <TableCell className="py-2 px-3 text-center">{data.supplierCommission}%</TableCell>
                  <TableCell className="py-2 px-3 text-center">{data.totalBookings}</TableCell>
                  <TableCell className="py-2 px-3 text-center">GBP {Number(data.totalAmount).toFixed(2)}</TableCell>
                  <TableCell className="py-2 px-3 text-center">GBP {Number(data.commission).toFixed(2)}</TableCell>
                  <TableCell className="py-2 px-3 text-center">GBP {Number(data.invoiceAmount).toFixed(2)}</TableCell>

                  <TableCell className="py-2 px-3 text-center flex items-center justify-center gap-2">

                    {/* Send / PDF Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => sendInvoiceEmail(data)}
                    >
                      <Send className="w-3 h-3" />
                    </Button>


                    {/* Download Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs flex items-center gap-1 shadow-none"
                      onClick={() => generateSupplierPDF(data)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>

                  </TableCell>




                </TableRow>
              ))
            )}
          </TableBody>

        </Table>
      </div>

      {/* SUMMARY BOX */}
      <div className="mt-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">

          <div className="border p-3 text-center bg-purple-400">
            <div className="text-black">Total Suppliers</div>
            <div className="text-xl font-semibold">
              {totals.suppliers}
            </div>
          </div>

          <div className="border p-3 text-center bg-purple-400">
            <div className="text-black">Total Bookings</div>
            <div className="text-xl font-semibold">
              {totals.bookings}
            </div>
          </div>

          <div className="border p-3 text-center bg-purple-400">
            <div className="text-black">Total Amount</div>
            <div className="text-xl font-semibold">
              GBP {totals.totalAmount.toFixed(2)}
            </div>
          </div>

          <div className="border p-3 text-center bg-purple-400">
            <div className="text-black">Total Commission</div>
            <div className="text-xl font-semibold">
              GBP {totals.commission.toFixed(2)}
            </div>
          </div>

          <div className="border p-3 text-center bg-purple-400">
            <div className="text-black">Total Invoice Amount</div>
            <div className="text-xl font-semibold">
              GBP {totals.invoiceAmount.toFixed(2)}
            </div>
          </div>

        </div>
      </div>


    </div>
  );
}
