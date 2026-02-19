'use client';

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { apiFetch } from "@/app/lib/apiFetch";
import { Fragment, useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProtectedRoute from "@/components/ProtectedRoute";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* -------------------- OPTIONS -------------------- */
const AIRPORTS = ['All Airports', 'LHR', 'LGW', 'STN', 'LTN', 'MAN', 'BHX'] as const;
const STATUSES = ['All Bookings', 'Active', 'Cancelled', 'Completed', 'No Show', 'Refunded', 'Pending'] as const;
const SOURCES = ['All Sources', 'Supplier', 'Direct', 'Partner', 'Website', 'Call Centre'] as const;
const BOOKING = ['All Types', 'Drop Off', 'Return', 'Both'] as const;

/* -------------------- TYPES -------------------- */
type Booking = {
  id: number;
  ref_no: string | null;
  product_name: string | null;
  title: string | null;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  travelling_from: string | null;
  service_provider: string | null;
  service: string | null;

  record_type?: 'DROP_OFF' | 'RETURN';
  event_date?: string;


  drop_off_date: string | null;
  return_date: string | null;
  no_of_days: number | null;

  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_colour: string | null;
  vehicle_registration: string | null;
  passengers: number | null;

  quote_amount: number | null;
  discount: number | null;
  booking_fee: number | null;
  total_payable: number | null;

  status: string;
  source: string | null;
  website_name: string | null;
  transaction_source: string | null;
  transaction_id: string | null;

  depart_terminal: string | null;
  depart_flight: string | null;
  return_terminal: string | null;
  return_flight: string | null;

  created_at: string;
};


type MaybeWrapped<T> = { data: T } | T;

/* -------------------- CONFIG -------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatPrettyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
}


/* -------------------- UTILS -------------------- */
function fmtDT(v?: string) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString(undefined, {

    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function downloadExcelBooking(filename: string, rows: Booking[]) {
  const excelRows = rows.map((b) => ({
    Plate: b.vehicle_registration ?? "",
    Description: "",
    Reference: b.ref_no ?? "",
    "Start Date": formatExcelDate(b.drop_off_date),
    "End Date": formatExcelDate(b.return_date),
    "Stay Duration": "",
    "Paid Value": "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelRows, {
    cellDates: false, // ✅ IMPORTANT
  });

  /* Force Start Date & End Date columns as TEXT */
  Object.keys(worksheet).forEach((cell) => {
    if (
      cell.startsWith("D") || // Start Date column
      cell.startsWith("E")    // End Date column
    ) {
      if (worksheet[cell]?.v) {
        worksheet[cell].t = "s"; // string
      }
    }
  });

  worksheet["!cols"] = [
    { wch: 15 }, // Plate
    { wch: 20 }, // Description
    { wch: 20 }, // Reference
    { wch: 24 }, // Start Date
    { wch: 24 }, // End Date
    { wch: 15 }, // Stay Duration
    { wch: 15 }, // Paid Value
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([buffer], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, filename);
}


const today = new Date();
const todayStr = today.toISOString().split("T")[0];

const threeDaysAgo = new Date();
threeDaysAgo.setDate(today.getDate() - 3);
const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];

function buildProfessionalReportHTML(rows: Booking[]) {
  const printedAt = new Date().toLocaleString("en-GB");

  const tableRows = rows.map((b, i) => {
    const isReturnRow = b.record_type === "RETURN";

    return `

    
    <tr class="${isReturnRow ? "return-row" : ""}">
      <td>${i + 1}</td>
      <td>${b.ref_no ?? "-"}</td>
      <td>${b.first_name ?? ""} ${b.last_name ?? ""}</td>
      <td>${b.product_name ?? "-"}</td>
      <td>${b.mobile ?? "-"}</td>
      <td>${b.return_flight ?? "-"}</td>
      <td>
        ${b.record_type === "DROP_OFF"
        ? formatFullDate(b.drop_off_date)
        : b.record_type === "RETURN"
          ? formatFullDate(b.return_date)
          : "-"
      }
      </td>
      <td>${b.vehicle_registration ?? "-"}</td>
      <td>${b.vehicle_make ?? "-"} / ${b.vehicle_model ?? "-"} / ${b.vehicle_colour ?? "-"}</td>
      <td>${b.depart_terminal ?? "-"}</td>
      <td>${b.return_terminal ?? "-"}</td>
    </tr>
  `;
  }).join("");


  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Booking Report</title>

  <style>
  .return-row {
    background-color: #f1f3f5; /* SAME as UI grey */
    color: #374151;
  }

  tbody tr {
    page-break-inside: avoid;
  }
</style>


  <style>
    @page {
      size: A4 landscape;
      margin: 14mm;
    }

    body {
      font-family: "Segoe UI", Arial, sans-serif;
      color: #1f2937;
      margin: 0;
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    

    .brand {
      font-size: 22px;
      font-weight: 700;
      color: #2563eb;
    }

    .meta {
      text-align: right;
      font-size: 12px;
      color: #555;
    }

    .title {
      margin: 20px 0 10px;
      font-size: 20px;
      font-weight: 600;
    }

    /* TABLE */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    thead th {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 8px;
      text-align: center;
      font-weight: 600;
      white-space: nowrap;
    }

    tbody td {
      border: 1px solid #e5e7eb;
      padding: 7px;
      text-align: center;
      white-space: nowrap;
    }

    tbody tr:nth-child(even) {
      background: #fafafa;
    }

    /* FOOTER */
    .footer {
      margin-top: 20px;
      font-size: 11px;
      color: #6b7280;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
    }
  </style>
</head>

<body>
  <!-- HEADER -->
  <div class="header">
    <div class="brand">Greyg Maurice Parking Ltd.</div>
    <div class="meta">
      <div><strong>Report:</strong> Booking Report</div>
      <div><strong>Generated:</strong> ${printedAt}</div>
    </div>
  </div>

  <div class="title">Daily Booking Report</div>

  <!-- TABLE -->
  <table>
    <thead>
      <tr>
        <th>S.L</th>
        <th>Ref No</th>
        <th>Customer</th>
        <th>Product</th>
        <th>Contact No</th>
        <th>Return Flight</th>
        <th>Date & Time</th>
        <th>Reg No</th>
        <th>Make / Model / Color</th>
        <th>Depart Terminal</th>
        <th>Return Terminal</th>
      </tr>
    </thead>

    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <!-- FOOTER -->
  <div class="footer">
    <div>Internal Use Only</div>
    <div>Total Records: ${rows.length}</div>
  </div>
</body>
</html>
`;
}



async function exportTableToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return alert("Table not found");

  // Expand scroll area
  element.style.overflow = "visible";

  // Capture as canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    scrollX: 0,
    scrollY: 0,
    useCORS: true,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("l", "pt", "a4"); // landscape mode for wide table

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}

function money(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `£${Number(n || 0).toFixed(2)}`;
  }
}
function formatFullDate(dateString: string | null | undefined) {
  if (!dateString) return "-";

  const d = new Date(
    dateString.includes("T") ? dateString : `${dateString}T00:00:00`
  );

  if (isNaN(d.getTime())) return dateString;

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // ✅ 24-hour
  });
}


function formatExcelDate(dateStr?: string | null) {
  if (!dateStr) return "";

  const d = new Date(
    dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`
  );

  if (isNaN(d.getTime())) return "";

  return d
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace("AM", "am")
    .replace("PM", "pm");
}


function toLocalInputValue(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toSqlDateTime(local: string) {
  if (!local) return null;
  const s = local.trim();
  if (!s.includes('T')) return s.replace(' ', ' ').concat(':00');
  return s.replace('T', ' ') + (s.length === 16 ? ':00' : '');
}
function normalizeYMD(input: string) {
  if (!input) return '';
  const ddmmyyyy = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  const ymd = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) return input;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getRowBgClass(status?: string) {
  const s = (status || '').toLowerCase();
  if (s === 'active') return 'bg-emerald-50';
  if (s === 'cancelled') return 'bg-red-50';
  if (s === 'completed') return 'bg-blue-50';
  if (s === 'pending') return 'bg-yellow-50';
  if (s === 'refunded') return 'bg-pink-50';
  if (s === 'no show') return 'bg-gray-50';
  return 'bg-neutral-50';
}

const esc = (s: any) =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* CSV helper */
function downloadCSV(filename: string, rows: Booking[]) {
  const headers = [
    "Ref No",
    "Customer Name",
    "Product",
    "Contact No",
    "Return Flight",
    "Date & Time",
    "Vehicle Reg",
    "Make / Model / Color",
    "Depart Terminal",
    "Return Terminal",
  ];

  const csvRows = [
    headers.join(","),
    ...rows.map((b) =>
      [
        b.ref_no ?? "-",
        `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim(),
        b.product_name ?? "-",
        b.mobile ?? "-",
        b.return_flight ?? "-",
        b.record_type === "DROP_OFF"
          ? formatFullDate(b.drop_off_date)
          : b.record_type === "RETURN"
            ? formatFullDate(b.return_date)
            : "-",

        b.vehicle_registration ?? "-",
        `${b.vehicle_make ?? "-"} / ${b.vehicle_model ?? "-"} / ${b.vehicle_colour ?? "-"}`,
        b.depart_terminal ?? "-",
        b.return_terminal ?? "-",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}


/* -------------------- PRINT (multi-page invoices) -------------------- */
function buildInvoiceHTML(rows: Booking[]) {
  const printDate = new Date().toLocaleString();

  const pages = rows.map((b, idx) => {
    return `
  <section class="page" style="font-family: 'Segoe UI', Arial, sans-serif; color:#222; background:#fff; margin:0; padding:20px;">

    <!-- Header -->
    <header class="hdr" style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0a58ca; padding-bottom:15px; margin-bottom:20px;">
      <div class="brand" style="max-width:60%;">
        <div class="brand-name" style="font-size:24px; font-weight:700; color:#0a58ca;">Gree Maurice Parking Ltd.</div>
        <div class="brand-sub" style="font-size:14px; color:#555;">Gree Maurice Parking Services</div>
        <div class="brand-meta" style="font-size:12px; color:#777; margin-top:5px;">www.example.com · +44 0000 000000 · support@example.com</div>
      </div>
      <div class="inv-block" style="text-align:right;">
        <div class="inv-title" style="font-size:20px; font-weight:600; color:#111;">Booking Invoice</div>
        <div class="inv-meta" style="font-size:13px; color:#555;"><strong>No:</strong> ${esc(b.ref_no)}</div>
        <div class="inv-meta" style="font-size:13px; color:#555;"><strong>Printed:</strong> ${esc(printDate)}</div>
      </div>
    </header>

    <!-- Customer & Booking Info -->
    <div style="display:flex; flex-wrap:wrap; gap:20px; margin-bottom:20px;">
      <div style="flex:1; min-width:250px; background:#f9fafc; border:1px solid #e3e6ea; border-radius:8px; padding:15px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
        <div style="font-weight:600; font-size:15px; margin-bottom:10px; border-bottom:1px solid #ddd; padding-bottom:5px;">Customer</div>
        <p><strong>First Name:</strong> ${esc(b.first_name)}</p>
        <p><strong>Last Name:</strong> ${esc(b.last_name)}</p>
        <p><strong>Contact:</strong> ${esc(b.mobile || '-')}</p>
        <p><strong>Email:</strong> ${esc(b.email || '-')}</p>
      </div>

      <div style="flex:1; min-width:250px; background:#f9fafc; border:1px solid #e3e6ea; border-radius:8px; padding:15px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
        <div style="font-weight:600; font-size:15px; margin-bottom:10px; border-bottom:1px solid #ddd; padding-bottom:5px;">Booking</div>
        <p><strong>Source:</strong> ${esc(b.source)}</p>
        <p><strong>Status:</strong> ${esc(b.status)}</p>
        <p><strong>Booked On:</strong> ${esc(fmtDT(b.created_at))}</p>
      </div>
    </div>

    <!-- Travel & Vehicle -->
    <div style="background:#f9fafc; border:1px solid #e3e6ea; border-radius:8px; padding:15px; margin-bottom:20px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
      <div style="font-weight:600; font-size:15px; margin-bottom:10px; border-bottom:1px solid #ddd; padding-bottom:5px;">Travel & Vehicle</div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; font-size:13px;">
        <div><strong>Airport:</strong> ${esc(b.travelling_from)}</div>
        <div><strong>Service:</strong> ${esc(b.service || '-')}</div>
        <div><strong>Drop-off:</strong> ${esc(b.drop_off_date)}</div>
        <div><strong>Return:</strong> ${esc(b.return_date)}</div>
        <div><strong>Vehicle:</strong> ${esc(b.vehicle_make || '-')}</div>
        <div><strong>Vehicle:</strong> ${esc(b.vehicle_model || '-')}</div>
        <div><strong>Vehicle:</strong> ${esc(b.vehicle_colour || '-')}</div>
        <div><strong>Reg No:</strong> ${esc(b.vehicle_registration || '-')}</div>
      </div>
    </div>

    <!-- Flight & Terminals -->
    <div style="background:#f9fafc; border:1px solid #e3e6ea; border-radius:8px; padding:15px; margin-bottom:20px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
      <div style="font-weight:600; font-size:15px; margin-bottom:10px; border-bottom:1px solid #ddd; padding-bottom:5px;">Flight Details</div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; font-size:13px;">
        <div><strong>Depart Flight:</strong> ${esc(b.depart_flight)}</div>
        <div><strong>Depart Terminal:</strong> ${esc(b.depart_terminal)}</div>
        <div><strong>Return Flight:</strong> ${esc(b.return_flight)}</div>
        <div><strong>Return Flight:</strong> ${esc(b.return_terminal)}</div>
      </div>
    </div>

    <!-- Charges -->
    <div style="background:#f9fafc; border:1px solid #e3e6ea; border-radius:8px; padding:15px; margin-bottom:20px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
      <div style="font-weight:600; font-size:15px; margin-bottom:10px; border-bottom:1px solid #ddd; padding-bottom:5px;">Charges</div>
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <thead>
          <tr style="background:#eef2f7; text-align:left;">
            <th style="padding:8px; border-bottom:1px solid #ccc;">Description</th>
            <th style="padding:8px; text-align:right; border-bottom:1px solid #ccc;">Quote Amount</th>
            <th style="padding:8px; text-align:right; border-bottom:1px solid #ccc;">Discount</th>
            <th style="padding:8px; text-align:right; border-bottom:1px solid #ccc;">Booking Fee</th>
            <th style="padding:8px; text-align:right; border-bottom:1px solid #ccc;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px;">Parking / Service Fee</td>
            <td style="padding:8px; text-align:right;">${esc(money(Number(b.quote_amount || 0)))}</td>
            <td style="padding:8px; text-align:right;">${esc(money(Number(b.discount || 0)))}</td>
            <td style="padding:8px; text-align:right;">${esc(money(Number(b.booking_fee || 0)))}</td>
            <td style="padding:8px; text-align:right;">${esc(money(Number(b.total_payable || 0)))}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td style="padding:8px; font-weight:600; border-top:1px solid #ccc;">Total</td>
            <td style="padding:8px; text-align:right; font-weight:600; border-top:1px solid #ccc;">${esc(money(Number(b.total_payable || 0)))}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Footer -->
    <footer style="text-align:center; font-size:12px; color:#666; border-top:1px solid #ddd; padding-top:10px;">
      <div>Thank you for choosing us.</div>
    </footer>

  </section>
`;

  }).join('\n');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Booking Invoices</title>
  <style>
    :root {
      --fg:#0f172a; --muted:#475569; --line:#e2e8f0; --accent:#0ea5e9;
    }
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;color:var(--fg);font:14px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial}
    @page { size: A4; margin: 16mm; }
    .page{page-break-after: always;}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:16px}
    .brand-name{font-size:20px;font-weight:700}
    .brand-sub{color:var(--muted)}
    .brand-meta{color:var(--muted);font-size:12px}
    .inv-block{text-align:right}
    .inv-title{font-size:18px;font-weight:700;margin-bottom:4px}
    .inv-meta{font-size:12px;color:var(--muted)}
    .inv-meta span{color:var(--fg);font-weight:600;margin-right:6px}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
    .card{border:1px solid var(--line);border-radius:8px;padding:12px;margin-bottom:12px}
    .card-title{font-weight:700;margin-bottom:10px;color:var(--accent)}
    .kv{display:flex;justify-content:space-between;border-bottom:1px dashed #eef2f7;padding:6px 0}
    .kv span{color:var(--muted)}
    .kv b{font-weight:600}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px 16px}
    .charge-table{width:100%;border-collapse:collapse}
    .charge-table th,.charge-table td{border:1px solid var(--line);padding:8px}
    .charge-table .num{text-align:right}
    .charge-table tfoot .total{font-weight:700}
    .notes{white-space:pre-wrap}
    .ftr{display:flex;justify-content:space-between;color:var(--muted);font-size:12px;margin-top:16px;border-top:1px solid var(--line);padding-top:8px}
    @media print {.page{break-after: page;}}
  </style>
</head>
<body>
  ${pages}
</body>
</html>`;
}


function buildPrintCardHTML(rows: Booking[]) {
  const pages = rows.map((b) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Parking Booking Slip</title>
<style>
${/* === COPY CSS EXACTLY FROM YOUR HTML FILE === */""}
${/* (No changes made to styling) */""}
${`
* { box-sizing:border-box; font-family:Arial, Helvetica, sans-serif; }
body { margin:0; padding:20px; background:#fff; }
.page { width:1200px; margin:auto; border:1px solid #ccc; }
.grid { display:grid; grid-template-columns:1fr 1fr 1fr; position:relative; }
.grid::before,.grid::after { content:""; position:absolute; top:0; bottom:0; border-left:2px dashed #999; }
.grid::before { left:33.333%; }
.grid::after { left:66.666%; }
.section { padding:15px; }
h3 { font-size:14px; margin:0 0 8px; font-weight:bold; text-transform:uppercase; }
.box { border:1px solid #000; padding:10px; margin-bottom:15px; }
.field { display:grid; grid-template-columns:90px 1fr; margin-bottom:10px; font-size:12px; }
.line { border-bottom:1px solid #000; height:14px; }
table { width:100%; border-collapse:collapse; font-size:12px; margin-bottom:15px; }
td,th { border:1px solid #000; padding:8px; height:35px; }
.red { color:red; font-weight:bold; }
.arrival { height:90px; text-align:center; font-weight:bold; padding-top:10px; }
.phone { font-size:26px; font-weight:bold; margin:15px 0; }
.warning { color:red; font-size:13px; font-weight:bold; margin-bottom:8px; }
.text { font-size:12px; line-height:1.4; margin-bottom:10px; }
.signature-wrap { display:grid; grid-template-columns:1fr 1fr; gap:15px; }
.signature { border:1px solid #000; height:60px; padding:5px; font-size:12px; font-weight:bold; }
.small { font-size:10px; margin-top:5px; }
`}
</style>
</head>

<body>
<div class="page">
<div class="grid">

<!-- LEFT -->
<div class="section">
<h3>Customer Information</h3>
<div class="box">
  <div class="field"><strong>Name</strong><div>${b.first_name} ${b.last_name}</div></div>
  <div class="field"><strong>Mobile</strong><div>${b.mobile ?? "-"}</div></div>
  <div class="field"><strong>Booking Ref</strong><div>${b.ref_no}</div></div>
</div>

<h3>Flight Details</h3>
<table>
<tr><th>DEPART DATE</th><th>TIME</th><th>TERMINAL</th></tr>
<tr>
  <td class="red">${formatFullDate(b.return_date)}</td>
  <td class="red">—</td>
  <td class="red">${b.return_terminal ?? "-"}</td>
</tr>
<tr>
  <td colspan="2" class="red">FLIGHT NO:</td>
  <td class="red">${b.email}</td>
</tr>
</table>

<h3>Vehicle Information</h3>
<table>
<tr><td>${b.vehicle_registration}</td><td>${b.vehicle_colour}</td></tr>
<tr><td>${b.vehicle_make}</td><td>${b.vehicle_model}</td></tr>
<tr><td colspan="2"></td></tr>
</table>

<h3>Declaration</h3>
<p class="text">
I agree that I am willing to be bound by the terms and conditions and confirm no valuables are left in the vehicle.
</p>

<div class="signature-wrap">
<div class="signature">SIGNATURE 1:</div>
<div class="signature">SIGNATURE 2:</div>
</div>
</div>

<!-- MIDDLE -->
<div class="section">
<h3>Arrival</h3>
<div class="box arrival">${formatFullDate(b.drop_off_date)}</div>
<div class="box arrival">TIME</div>
<div class="box arrival">${b.depart_terminal ?? "-"}</div>

<h3>Details</h3>
<table>
<tr>
<td>${b.ref_no}</td>
<td>${b.vehicle_registration}</td>
</tr>
</table>
</div>

<!-- RIGHT -->
<div class="section">
<h3>Don't Forget:</h3>
<div>✔ Tickets</div>
<div>✔ Phone</div>
<div>✔ Passport</div>
<div>✔ Currency</div>

<div class="phone">📱 0778 050 4999</div>

<div class="warning">** DO NOT TEXT THIS NUMBER **</div>
<div class="warning">** NO CASH PAYMENTS **</div>

<h3>Booking Details</h3>
<table>
<tr><td>${b.ref_no}</td><td>${b.return_terminal ?? "-"}</td></tr>
<tr><td>${formatFullDate(b.return_date)}</td><td>${b.return_flight ?? "-"}</td></tr>
</table>

<p class="text"><strong>PRESENT THIS SLIP ON RETURN</strong></p>
</div>

</div>
</div>
</body>
</html>
`).join("<div style='page-break-after:always'></div>");

  return pages;
}

/* -------------------- PAGE -------------------- */
export default function BookingReportPage() {

  /* Filters */
  const [airport, setAirport] = useState<string>('All Airports');
  const [booking_type, setBookingType] = useState<string>('Booking Type');
  // const [from, setFrom] = useState<string>('');
  // const [to, setTo] = useState<string>('');
  const [status, setStatus] = useState<string>('All Bookings');
  const [source, setSource] = useState<string>('All Sources');

  const [from, setFrom] = useState<string>(todayStr);
  const [to, setTo] = useState<string>(todayStr);

  const [fromDisplay, setFromDisplay] = useState<string>(from);
  const [toDisplay, setToDisplay] = useState<string>(to);


  /* Data/UI */
  const [allRows, setAllRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const [serviceType, setServiceType] = useState<string>('All Services');


  type DatePattern = "depart" | "depart_return" | "depart_card";

  const [datePattern, setDatePattern] = useState<DatePattern>("depart");

  /* Pagination */
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const formatTimeOnly = (value?: string | null) => {
    if (!value) return "-";

    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";

    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };




  /* Sorting */
  const [sortBy, setSortBy] =
    useState<'booked_on' | 'dropoff_datetime' | 'return_datetime' | 'price' | 'customer_name' | 'ref_no'>('booked_on');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  /* Inline edit */
  const [openRowId, setOpenRowId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  type EditForm = {
    customer_name: string;
    contact_no: string;
    customer_email: string;
    vehicle_reg_no: string;
    airport: string;
    status: string;
    price: string;
    dropoff_datetime: string;
    return_datetime: string;
    notes: string;
  };
  const [form, setForm] = useState<EditForm>({
    customer_name: '',
    contact_no: '',
    customer_email: '',
    vehicle_reg_no: '',
    airport: '',
    status: 'Active',
    price: '',
    dropoff_datetime: '',
    return_datetime: '',
    notes: '',
  });

  function buildFullTableHTML(rows: Booking[]) {
    const formatTimeOnly = (value?: string | null) => {
      if (!value) return "-";

      const d = new Date(value);
      if (isNaN(d.getTime())) return "-";

      return d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const tableRows = rows
      .map(
        (b, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${b.ref_no ?? "-"}</td>
        <td>${b.first_name ?? ""} ${b.last_name ?? ""}</td>
        <td>${b.product_name ?? "-"}</td>
        <td>${b.mobile ?? "-"}</td>
        <td>${b.return_flight ?? "-"}</td>

        <!-- Time (single column, time only) -->
        <td>
          ${b.record_type === "DROP_OFF"
            ? formatTimeOnly(b.drop_off_date)
            : b.record_type === "RETURN"
              ? formatTimeOnly(b.return_date)
              : "-"
          }
        </td>

        <td>${b.vehicle_registration ?? "-"}</td>
        <td>${b.vehicle_make ?? "-"} / ${b.vehicle_model ?? "-"} / ${b.vehicle_colour ?? "-"}</td>
        <td>${b.depart_terminal ?? "-"}</td>
        <td>${b.return_terminal ?? "-"}</td>
      </tr>
    `
      )
      .join("");

    return `
<!doctype html>
<html>
<head>
  <title>Booking Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 6px;
      text-align: center;
      white-space: nowrap;
    }
    th {
      background: #f2f2f2;
    }
    @page {
      size: A4 landscape;
      margin: 12mm;
    }
  </style>
</head>
<body>
  <h2>Booking Report</h2>

  <table>
    <thead>
      <tr>
        <th>S.L</th>
        <th>Ref No</th>
        <th>Customer</th>
        <th>Product</th>
        <th>Contact No</th>
        <th>Return Flight</th>
        <th>Time</th>
        <th>Reg No</th>
        <th>Make / Model / Color</th>
        <th>Depart Terminal</th>
        <th>Return Terminal</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
</body>
</html>
`;
  }






  async function downloadFullTablePDF(rows: Booking[]) {
    const html = buildFullTableHTML(rows);
    const win = window.open("", "_blank");

    if (!win) return alert("Please allow popups!");

    win.document.write(html);
    win.document.close();

    setTimeout(() => win.print(), 500);
  }


  const ariaSort = (key: typeof sortBy): 'ascending' | 'descending' | 'none' =>
    sortBy === key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none';

  function buildFetchUrl(df: string, dt: string) {
    if (df && dt) {
      const qs = new URLSearchParams({ start: df, end: dt });
      return `${API_BASE}/api/thomsondata/depart-return-range?${qs.toString()}`;
    }
    return `${API_BASE}/api/thomsondata/active`;
  }

  const generateReport = async () => {
    setLoading(true);
    setErrMsg('');
    setHasGenerated(true);

    try {
      const df = normalizeYMD(from);
      const dt = normalizeYMD(to);

      const url = buildFetchUrl(df, dt);

      const res = await apiFetch(url, {
        cache: "no-store",
      });

      const payload = await res.json();
      const list = Array.isArray(payload)
        ? payload
        : payload?.data || [];

      const filtered = list.filter((r: Booking) => {
        const okAirport =
          airport === 'All Airports' ||
          (r.travelling_from || '').toLowerCase() === airport.toLowerCase();

        const okService =
          serviceType === 'All Services' ||
          (r.service || '').toLowerCase() === serviceType.toLowerCase();

        const okStatus =
          status === 'All Bookings' ||
          (r.status || '').toLowerCase() === status.toLowerCase();

        const okSource =
          source === 'All Sources' ||
          (r.source || '').toLowerCase() === source.toLowerCase();

        return okAirport && okService && okStatus && okSource;
      });


      filtered.sort((a: Booking, b: Booking) => {
        const ta = new Date(a.event_date ?? "").toTimeString().slice(0, 8);
        const tb = new Date(b.event_date ?? "").toTimeString().slice(0, 8);
        return ta.localeCompare(tb);
      });



      const finalFiltered =
        datePattern === "depart_card"
          ? filtered.filter((b: Booking) => b.drop_off_date)
          : filtered;

      setAllRows(finalFiltered);

      setPage(1);

    } catch (e: any) {
      setErrMsg(e.message || "Failed to generate report");
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  };


  /* Client-side sort & paginate */
  const filteredSorted = useMemo(() => {
    let res = [...allRows];
    res.sort((a, b) => {
      const dir = sortOrder === 'asc' ? 1 : -1;
      const av = (a as any)[sortBy];
      const bv = (b as any)[sortBy];
      if (sortBy === 'price') {
        const an = Number(av || 0);
        const bn = Number(bv || 0);
        return (an - bn) * dir;
      }
      const ad = new Date(av || 0).getTime();
      const bd = new Date(bv || 0).getTime();
      if (!Number.isNaN(ad) && !Number.isNaN(bd)) {
        return (ad - bd) * dir;
      }
      return String(av || '').localeCompare(String(bv || '')) * dir;
    });
    return res;
  }, [allRows, sortBy, sortOrder]);

  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredSorted.slice(start, start + limit);
  }, [filteredSorted, page, limit]);

  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };



  const handlePrint = () => {
    const html = buildPrintCardHTML(filteredSorted);
    const w = window.open("", "_blank");
    if (!w) return alert("Allow popups");
    w.document.write(html);
    w.document.close();
    w.print();
  };


  // const handlePdf = () => {
  //   const html = buildInvoiceHTML(filteredSorted);
  //   const w = window.open("", "_blank");
  //   if (!w) return alert("Allow popups");
  //   w.document.write(html);
  //   w.document.close();
  // };


  const handlePdf = () => {
    const html = buildProfessionalReportHTML(filteredSorted);
    const win = window.open("", "_blank");

    if (!win) {
      alert("Please allow popups to generate PDF");
      return;
    }

    win.document.write(html);
    win.document.close();

    setTimeout(() => {
      win.focus();
      win.print();
    }, 500);
  };



  const handleDownload = () => downloadCSV(`booking-report-${Date.now()}.csv`, filteredSorted);

  /* -------------------- REQUIRED BUTTON LOGIC -------------------- */
  // const normalizedBooking = booking_type.toLowerCase();
  // const isDropOff = normalizedBooking === 'drop off';
  // const isReturn = normalizedBooking === 'return';
  // const isBoth = normalizedBooking === 'both';

  // const showPrintCards = isDropOff;
  // const showPdfButton = isDropOff || isReturn || isBoth;
  /* Buttons are now always visible after generating */
  const showCsv =
    datePattern === "depart" || datePattern === "depart_return";

  const showPdf =
    datePattern === "depart" || datePattern === "depart_return";

  const showPrintCards =
    datePattern === "depart_card";



  /* --------------------------------------------------------------- */

  return (

    <ProtectedRoute>

      <div className="mx-auto w-full p-3 md:p-4">

        {/* FILTER BAR */}
        {/* FILTER BAR */}
        <div className="mb-3 w-full flex flex-wrap items-center gap-3">

          {/* <select
            className="h-9 min-w-[180px] border px-2 text-sm"
            value={airport}
            onChange={(e) => setAirport(e.target.value)}
          >
            <option value="All Airports">All Airports</option>
            <option value="Heathrow">Heathrow</option>
            <option value="Gatwick">Gatwick</option>
          </select> */}


          {/* <select
            className="h-9 min-w-[180px] border px-2 text-sm"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            <option value="All Services">All Services</option>
            <option value="Park & Ride">Park & Ride</option>
            <option value="Meet & Greet">Meet & Greet</option>
          </select> */}



          {/* From Date */}
          {/* <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">From</label>
            <Input
              type="date"
              className="h-9 text-sm w-40 sm:w-30 cursor-pointer rounded-none"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
            />

          </div> */}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">From</label>

            <div className="relative w-[170px]">
              {/* Display formatted date */}
              <input
                type="text"
                readOnly
                value={formatPrettyDate(from || fromDisplay)}
                className="h-9 w-full px-3 text-sm border border-gray-300 cursor-pointer"
                onClick={() =>
                  (document.getElementById("reportFromNative") as HTMLInputElement | null)
                    ?.showPicker()
                }
              />

              {/* Native date picker */}
              <input
                id="reportFromNative"
                type="date"
                className="absolute inset-0 opacity-0"
                value={from || ""}
                onChange={(e) => {
                  setFrom(e.target.value);          // ISO for API
                  setFromDisplay(e.target.value);   // display source
                }}
                onClick={(e) => e.currentTarget.showPicker?.()}
              />
            </div>
          </div>


          {/* To Date */}
          {/* <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">To</label>
            <Input
              type="date"
              className="h-9 text-sm w-40 sm:w-30 cursor-pointer rounded-none"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
            />
          </div> */}


          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">To</label>

            <div className="relative w-[170px]">
              {/* Display formatted date */}
              <input
                type="text"
                readOnly
                value={formatPrettyDate(to || toDisplay)}
                className="h-9 w-full px-3 text-sm border border-gray-300 cursor-pointer"
                onClick={() =>
                  (document.getElementById("reportToNative") as HTMLInputElement | null)
                    ?.showPicker()
                }
              />

              {/* Native date picker */}
              <input
                id="reportToNative"
                type="date"
                className="absolute inset-0 opacity-0"
                value={to || ""}
                onChange={(e) => {
                  setTo(e.target.value);            // ISO for API
                  setToDisplay(e.target.value);     // display source
                }}
                onClick={(e) => e.currentTarget.showPicker?.()}
              />
            </div>
          </div>


          {/* Generate */}
          <Button
            className="h-9 w-full rounded-none sm:w-auto px-4"
            onClick={generateReport}
            disabled={loading}
          >
            Generate
          </Button>



          {/* CSV */}
          {hasGenerated && showCsv && (
            <Button
              className="rounded-none"
              onClick={() =>
                downloadCSV(`booking-${Date.now()}.csv`, filteredSorted)
              }
            >
              CSV
            </Button>
          )}

          {/* CSV */}
          {hasGenerated && showCsv && (
            <Button
              className="rounded-none"
              onClick={() =>
                downloadExcelBooking(
                  `booking-${Date.now()}.xlsx`,
                  filteredSorted
                )
              }
            >
              Booking Excel File
            </Button>

          )}


          {/* PDF */}
          {hasGenerated && showPdf && (
            <Button
              className="rounded-none"
              onClick={() => downloadFullTablePDF(filteredSorted)}
            >
              PDF
            </Button>
          )}

        </div>


        {/* ONLY SHOW TABLE AFTER GENERATE */}
        {!hasGenerated ? (
          <div className="text-sm text-muted-foreground border  p-6 text-center">
            Choose filters and click <span className="font-semibold">Generate</span> to display the report.
          </div>
        ) : (
          <>
            <div id="booking-report-table" className="w-full overflow-x-auto border">
              <Table className="table-auto w-full text-[12px] md:text-xs border-separate border-spacing-0">
                <TableHeader>
                  <TableRow className="border-0 sticky top-0 z-10 ">
                    <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                      S.L
                    </TableHead>
                    <TableHead
                      className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 cursor-pointer select-none"
                    >
                      Ref No
                    </TableHead>
                    <TableHead
                      className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 cursor-pointer select-none"
                    >
                      Customer Name
                    </TableHead>

                    <TableHead
                      className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 cursor-pointer select-none"
                    >
                      Product
                    </TableHead>
                    <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                      Contact No
                    </TableHead>
                    {/* <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                                    Email
                                  </TableHead> */}
                    {/* <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                                    Service
                                  </TableHead> */}
                    {/* <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                                    Airport
                                  </TableHead> */}
                    {/* <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                                    Depart Flight
                                  </TableHead> */}
                    <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                      Return Flight
                    </TableHead>

                    {/* <TableHead
                                    className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 cursor-pointer select-none"
                                  >
                                    Booked On
                                  </TableHead> */}
                    {/* <TableHead
                      className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 cursor-pointer select-none"
                    >
                      Drop-off
                    </TableHead> */}
                    {/* <TableHead

                      className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 cursor-pointer select-none"

                    >
                      Return
                    </TableHead> */}
                    <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                      Date & Time
                    </TableHead>
                    {/* <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                                    No Of Days
                                  </TableHead> */}
                    <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                      Reg No
                    </TableHead>
                    <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                      Make / Model / color
                    </TableHead>
                    {/* <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                                    Color
                                  </TableHead> */}
                    {/* <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                                    Passengers
                                  </TableHead> */}
                    <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                      Depart Terminal
                    </TableHead>
                    <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                      Return Terminal
                    </TableHead>
                    {/* <TableHead className="px-4 h-12 text-center bg-blue-300 dark:bg-slate-700">
                                    Quote
                                  </TableHead> */}
                    {/* <TableHead className="px-4 h-12 text-center bg-yellow-300 dark:bg-slate-700">
                                    Discount
                                  </TableHead> */}
                    {/* <TableHead className="px-4 h-12 text-center bg-purple-300 dark:bg-slate-700">
                                    Booking Fee
                                  </TableHead> */}
                    {/* <TableHead className="px-4 h-12 text-center bg-green-300 dark:bg-slate-700">
                                    Total
                                  </TableHead> */}
                    {/* <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">
                                    Transaction ID
                                  </TableHead> */}
                    {/* <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 ">
                                    Status
                                  </TableHead> */}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow key="loading">
                      <TableCell colSpan={17} className="py-6 px-4 text-center text-muted-foreground">
                        Generating…
                      </TableCell>
                    </TableRow>
                  ) : errMsg ? (
                    <TableRow key="error">
                      <TableCell colSpan={17} className="py-6 px-4 text-center text-red-600">
                        {errMsg}
                      </TableCell>
                    </TableRow>
                  ) : pageSlice.length === 0 ? (
                    <TableRow key="empty">
                      <TableCell colSpan={17} className="py-6 px-4 text-center text-muted-foreground">
                        No results found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageSlice.map((b, i) => {
                      const sl = (page - 1) * limit + (i + 1);
                      const isLast = i === pageSlice.length - 1;
                      const editorOpen = openRowId === b.id;

                      return (
                        <Fragment key={`${b.id}-${b.record_type}`}>
                          <TableRow
                            className={
                              b.record_type === 'RETURN'
                                ? 'bg-gray-100 text-gray-700'
                                : ''
                            }
                          >

                            <TableCell className={`py-3 px-4 text-center ${isLast && !editorOpen ? '' : ''}`}>
                              {String(sl).padStart(2, '0')}
                            </TableCell>
                            <TableCell className="py-3 px-4 text-center text-primary">{b.ref_no}</TableCell>
                            <TableCell className="py-3 px-4 text-center whitespace-nowrap">{`${b.first_name} ${b.last_name}`}</TableCell>
                            <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.product_name}</TableCell>
                            <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.mobile || '-'}</TableCell>
                            {/* <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.email || '-'}</TableCell> */}
                            {/* <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.service || '-'}</TableCell> */}
                            {/* <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.travelling_from || '-'}</TableCell> */}
                            {/* <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.depart_flight || '-'}</TableCell> */}
                            <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.return_flight || '-'}</TableCell>
                            {/* <TableCell className="py-3 px-4 text-center whitespace-nowrap">{fmtDT(b.created_at)}</TableCell> */}
                            {/* <TableCell className="py-3 px-4 text-center whitespace-nowrap">
                              {formatFullDate(b.drop_off_date)}
                            </TableCell> */}

                            {/* <TableCell className="py-3 px-4 text-center whitespace-nowrap">
                              {formatFullDate(b.return_date)}
                            </TableCell> */}

                            <TableCell className="py-3 px-4 text-center whitespace-nowrap">
                              {b.record_type === 'DROP_OFF' && (
                                <span className="font-medium">
                                  {formatFullDate(b.drop_off_date)}
                                </span>
                              )}

                              {b.record_type === 'RETURN' && (
                                <span className="text-gray-600">
                                  {formatFullDate(b.return_date)}
                                </span>
                              )}
                            </TableCell>


                            {/* <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.no_of_days}</TableCell> */}
                            <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.vehicle_registration || '-'}</TableCell>
                            <TableCell className="py-3 px-4 text-center whitespace-nowrap">
                              {`${b.vehicle_make} / ${b.vehicle_model} / ${b.vehicle_colour}`}
                            </TableCell>
                            {/* <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.vehicle_colour}</TableCell> */}
                            {/* <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.passengers}</TableCell> */}
                            <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.depart_terminal}</TableCell>
                            <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.return_terminal}</TableCell>
                            {/* <TableCell className="bg-blue-300 py-3 px-4 text-center whitespace-nowrap">{b.quote_amount}</TableCell> */}
                            {/* <TableCell className="bg-yellow-300 py-3 px-4 text-center whitespace-nowrap">{b.discount || '-'}</TableCell> */}
                            {/* <TableCell className="bg-purple-300 py-3 px-4 text-center whitespace-nowrap">{b.booking_fee || '-'}</TableCell> */}
                            {/* <TableCell className="bg-green-300 py-3 px-4 text-center whitespace-nowrap">{b.total_payable || '-'}</TableCell> */}
                            {/* <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.transaction_id || '-'}</TableCell> */}

                            {/* <TableCell className={`py-3 px-4 text-center ${isLast && !editorOpen ? '' : ''}`}>
                                            <span
                                              className={`inline-flex  px-2 py-0.5 text-[10px] font-medium ${b.status === 'Active'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : b.status === 'Cancelled'
                                                  ? 'bg-red-100 text-red-800'
                                                  : b.status === 'Completed'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : b.status === 'pending'
                                                      ? 'bg-yellow-100 text-yellow-800'
                                                      : b.status === 'Refunded'
                                                        ? 'bg-pink-100 text-pink-800'
                                                        : b.status === 'No Show'
                                                          ? 'bg-gray-100 text-gray-800'
                                                          : 'bg-neutral-100 text-neutral-700 dark:bg-slate-700 dark:text-neutral-100'
                                                }`}
                                            >
                                              {b.status}
                                            </span>
                                          </TableCell> */}
                          </TableRow>

                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Bottom pagination */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold">Report Results</span> — Page{' '}
                <span className="font-medium">{page}</span> /{' '}
                <span className="font-medium">{totalPages}</span>{' '}
                — <span className="font-medium">{total}</span> total
              </div>
              <div className="flex items-center">
                <button
                  className="h-8  border px-3 text-xs disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                >
                  Prev
                </button>
                <button
                  className="h-8  border border-l-0 px-3 text-xs disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
