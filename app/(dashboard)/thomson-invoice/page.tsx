"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Send } from "lucide-react";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function WebsiteInvoicePage() {
    // const [from, setFrom] = useState("");
    // const [to, setTo] = useState("");

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0];


    const [from, setFrom] = useState(todayStr);
    const [to, setTo] = useState(todayStr);

    const [fromDisplay, setFromDisplay] = useState(from);
    const [toDisplay, setToDisplay] = useState(to);


    const [airport, setAirport] = useState<string>('All Airports');
    const [serviceType, setServiceType] = useState<string>('All Services');


    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    function formatPrettyDate(dateStr?: string) {
        if (!dateStr) return "";
        const [y, m, d] = dateStr.split("-");
        return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
    }


    // ------------------------------- FETCH INVOICE -------------------------------
    const fetchInvoice = async () => {
        try {
            setLoading(true);

            const qs = new URLSearchParams();

            if (from) qs.append("from", from);
            if (to) qs.append("to", to);

            if (airport !== "All Airports") {
                qs.append("airport", airport);
            }

            if (serviceType !== "All Services") {
                qs.append("service_type", serviceType);
            }

            const res = await fetch(
                `${API_BASE}/api/bookings/invoice/parking?${qs.toString()}`,
                { cache: "no-store", credentials: "include" }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch invoice");
            }

            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
            alert("Failed to load invoice");
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------- PDF GENERATION -------------------------------
    const generateInvoicePDF = (data: any) => {
        const totalAmount = data.totals.payableAmount;

        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("INVOICE", 15, 20);

        doc.setFontSize(10);
        doc.text("NO. 000001", 190, 20, { align: "right" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Billed To:", 15, 40);

        doc.setFont("helvetica", "normal");
        doc.text("Website Users", 15, 47);
        doc.text("London, UK", 15, 53);

        doc.setFont("helvetica", "bold");
        doc.text("From:", 120, 40);

        doc.setFont("helvetica", "normal");
        doc.text("Parking Dashboard", 120, 47);
        doc.text("support@parking.com", 120, 53);

        doc.setFont("helvetica", "bold");
        doc.text("Date:", 15, 70);

        doc.setFont("helvetica", "normal");
        doc.text(new Date().toLocaleDateString("en-GB"), 35, 70);

        autoTable(doc, {
            startY: 85,
            head: [["Item", "Qty", "Unit Price", "Amount"]],
            body: [
                [
                    "Website Parking Bookings",
                    data.totalBookings,
                    `GBP ${(totalAmount / data.totalBookings).toFixed(2)}`,
                    `GBP ${totalAmount.toFixed(2)}`,
                ],
            ],
            theme: "grid",
            styles: { fontSize: 11, halign: "center" },
            headStyles: { fillColor: [230, 230, 230], textColor: 0 },
        });

        const finalY = (doc as any).lastAutoTable.finalY;

        doc.setFont("helvetica", "bold");
        doc.text("Total:", 140, finalY + 12);
        doc.text(`GBP ${totalAmount.toFixed(2)}`, 190, finalY + 12, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.text("Payment Method: Cash", 15, finalY + 30);
        doc.text("Thank you for choosing us!", 15, finalY + 37);

        doc.save("parking_invoice.pdf");
    };


    const sendInvoiceEmail = async () => {
        try {
            const res = await fetch(
                `${API_BASE}/api/bookings/invoice/parking/email`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ from, to }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            alert(data.message);
        } catch (err: any) {
            alert(err.message || "Failed to send invoice email");
        }
    };


    // ------------------------------- UI -------------------------------
    return (
        <ProtectedRoute>
            <div className="w-full p-4">
                <h2 className="text-xl font-semibold mb-4">
                    Elite Parking Invoice
                </h2>




                {/* FILTER BAR */}
                <div className="flex flex-wrap gap-3 mb-6 items-end">

                    {/* AIRPORT FILTER */}
                    {/* <select
                        className="h-9 min-w-[160px] border px-2 text-sm"
                        value={airport}
                        onChange={(e) => setAirport(e.target.value)}
                    >
                        <option value="All Airports">All Airports</option>
                        <option value="Heathrow">Heathrow</option>
                        <option value="Gatwick">Gatwick</option>
                    </select> */}

                    {/* SERVICE TYPE FILTER */}
                    {/* <select
                        className="h-9 min-w-[160px] border px-2 text-sm"
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                    >
                        <option value="All Services">All Services</option>
                        <option value="Park & Ride">Park & Ride</option>
                        <option value="Meet & Greet">Meet & Greet</option>
                    </select> */}

                    <div className="flex items-center gap-4">
                        {/* <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">From:</span>
                            <Input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                                className="w-[160px] cursor-pointer"
                            />

                        </div> */}

                        <div className="relative w-[160px]">
                            {/* Display */}
                            <input
                                type="text"
                                readOnly
                                value={formatPrettyDate(from || fromDisplay)}
                                className="h-9 w-full px-3 text-sm border cursor-pointer"
                                onClick={() =>
                                    (document.getElementById("invoiceFromNative") as HTMLInputElement | null)
                                        ?.showPicker()
                                }
                            />

                            {/* Native picker */}
                            <input
                                id="invoiceFromNative"
                                type="date"
                                className="absolute inset-0 opacity-0"
                                value={from}
                                onChange={(e) => {
                                    setFrom(e.target.value);          // ISO for API
                                    setFromDisplay(e.target.value);   // display source
                                }}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                        </div>




                        {/* <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">To:</span>
                            <Input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                                className="w-[160px] cursor-pointer"
                            />
                        </div> */}

                        <div className="relative w-[160px]">
                            {/* Display */}
                            <input
                                type="text"
                                readOnly
                                value={formatPrettyDate(to || toDisplay)}
                                className="h-9 w-full px-3 text-sm border cursor-pointer"
                                onClick={() =>
                                    (document.getElementById("invoiceToNative") as HTMLInputElement | null)
                                        ?.showPicker()
                                }
                            />

                            {/* Native picker */}
                            <input
                                id="invoiceToNative"
                                type="date"
                                className="absolute inset-0 opacity-0"
                                value={to}
                                onChange={(e) => {
                                    setTo(e.target.value);            // ISO for API
                                    setToDisplay(e.target.value);     // display source
                                }}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                        </div>


                    </div>


                    <Button className="rounded-none" onClick={fetchInvoice} disabled={loading}>
                        {loading ? "Loading..." : "Generate Invoice"}
                    </Button>

                    <Button
                        className="rounded-none bg-indigo-600 text-white"
                        onClick={sendInvoiceEmail}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>

                {/* INVOICE SUMMARY */}
                {data && (
                    <div className="space-y-6 rounded-none">
                        {/* KPI CARDS */}
                        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-xl border bg-orange-50 border-orange-200 p-5">
                            <p className="text-sm text-orange-700">Total Bookings</p>
                            <p className="text-2xl font-semibold mt-1 text-orange-700">
                                {data.totalBookings}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-blue-50 border-blue-200 p-5">
                            <p className="text-sm text-blue-700">Quote Amount</p>
                            <p className="text-2xl font-semibold mt-1 text-blue-700">
                                GBP {data.totals.quoteAmount.toFixed(2)}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-purple-50 border-purple-200 p-5">
                            <p className="text-sm text-purple-700">Booking Fees</p>
                            <p className="text-2xl font-semibold text-purple-700 mt-1">
                                GBP {data.totals.bookingFee.toFixed(2)}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-green-50 border-green-200 p-5">
                            <p className="text-sm text-green-700">Total Payable</p>
                            <p className="text-2xl font-bold mt-1 text-green-700">
                                GBP {data.totals.payableAmount.toFixed(2)}
                            </p>
                        </div>
                    </div> */}

                        {/* TABLE */}
                        <div className=" border bg-white  overflow-hidden rounded-none">
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                <h3 className="text-lg font-semibold">Invoice Summary</h3>
                                <Button className="rounded-none" onClick={() => generateInvoicePDF(data)}>
                                    Download PDF
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-6 py-3 text-left">#</th>
                                            <th className="px-6 py-3 text-left">Description</th>
                                            <th className="px-6 py-3 text-center">Bookings</th>
                                            <th className="px-6 py-3 text-right">Amount (GBP)</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr className="border-t">
                                            <td className="px-6 py-4">1</td>
                                            <td className="px-6 py-4">Quote Amount</td>
                                            <td className="px-6 py-4 text-center">—</td>
                                            <td className="px-6 py-4 text-right">
                                                {data.totals.quoteAmount.toFixed(2)}
                                            </td>
                                        </tr>

                                        <tr className="border-t">
                                            <td className="px-6 py-4">2</td>
                                            <td className="px-6 py-4">Booking Fees</td>
                                            <td className="px-6 py-4 text-center">—</td>
                                            <td className="px-6 py-4 text-right">
                                                {data.totals.bookingFee.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>

                                    <tfoot className="bg-gray-100 font-semibold">
                                        <tr>
                                            <td className="px-6 py-4">Total</td>
                                            <td></td>
                                            <td className="px-6 py-4 text-center">
                                                {data.totalBookings}
                                            </td>
                                            <td className="px-6 py-4 text-right text-green-700">
                                                GBP {data.totals.payableAmount.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
