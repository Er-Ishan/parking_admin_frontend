"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatPrettyDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${Number(d)} ${MONTHS[Number(m) - 1]}, ${y}`;
}


function pad2(n: number) {
    return String(n).padStart(2, "0");
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${pad2(hours)}:${minutes}`;
});


function toYMD(d: Date) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toHM(d: Date) {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function toDisplayDate(ymd: string) {
    // ymd: YYYY-MM-DD
    if (!ymd) return "";
    const [y, m, d] = ymd.split("-").map(Number);
    if (!y || !m || !d) return "";
    return `${d} ${MONTHS[m - 1]}, ${y}`; // "19 Jan, 2026"
}

function addDays(ymd: string, days: number) {
    const [y, m, d] = ymd.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    return toYMD(date);
}

function toBackendDateTime(ymd: string, hm: string) {
    if (!ymd || !hm) return null;
    return `${ymd.trim()} ${hm.trim()}`;
}


function safeImage(url?: string | null) {
    if (!url) return "";
    return url;
}

export default function AdminAddBooking() {
    // ===================== SEARCH STATE =====================
    const [dropoffDate, setDropoffDate] = useState("");
    const [dropoffTime, setDropoffTime] = useState("12:00");
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceMessage, setInvoiceMessage] = useState("");

    const [airports, setAirports] = useState<any[]>([]);
    const [selectedAirport, setSelectedAirport] = useState("");



    const [returnDate, setReturnDate] = useState("");
    const [returnTime, setReturnTime] = useState("12:00");

    const [bookingId, setBookingId] = useState<number | null>(null);


    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMessage, setEmailMessage] = useState("");

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentIntentId, setPaymentIntentId] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState("");

    const today = new Date().toISOString().split("T")[0];

    // Display only (default today)
    const [displayFromDate, setDisplayFromDate] = useState<string>(today);
    const [displayToDate, setDisplayToDate] = useState<string>(today);

    // Applied filters (EMPTY initially)
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    const [terminals, setTerminals] = useState<
        {
            terminal_id: number;
            terminal_name: string;
            terminal_code: string;
        }[]
    >([]);

    useEffect(() => {
        fetch(`${API}/api/terminals`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setTerminals(data.data || []);
                }
            })
            .catch((err) => {
                console.error("Failed to load terminals", err);
            });
    }, []);

    useEffect(() => {
        fetch(`${API}/api/airports`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAirports(data.data || []);
                }
            })
            .catch(() => {
                console.error("Failed to load airports");
            });
    }, []);




    const [charges, setCharges] = useState<{
        cancellation?: { name: string; price: number };
        booking?: { name: string; price: number };
    }>({});

    const inputClass =
        "w-full border rounded-none px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";



    // ===================== BOOKING STATE =====================
    const [hasTravel, setHasTravel] = useState<"yes" | "no">("yes");
    const [hasVehicle, setHasVehicle] = useState<"yes" | "no">("yes");

    const [message, setMessage] = useState("");

    const [booking, setBooking] = useState({
        // Customer
        title: "",
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",

        // Optional Address (admin style; doesn’t break backend if ignored server-side)
        address_1: "",
        address_2: "",
        city: "",
        postcode: "",
        country: "United Kingdom",

        // Travel
        depart_terminal: "",
        depart_flight: "",
        return_terminal: "",
        return_flight: "",

        // Vehicle
        vehicle_make: "",
        vehicle_model: "",
        vehicle_colour: "",
        vehicle_reg: "",
        passengers: "1",

        // Options
        cancellation_cover: false,
        terms: false,

        // Notes
        admin_notes: "",
    });

    const saveBookingAndGetId = async (): Promise<number | null> => {
        if (bookingId) return bookingId;

        if (!selectedProduct) {
            setInvoiceMessage("Please complete booking details first.");
            return null;
        }

        const payload = {
            product_name: selectedProduct.product_name,
            product_flexibility: selectedProduct.product_flexibility || "Flexible",
            travelling_from: selectedProduct.airport_name,
            service_provider: selectedProduct.service_provider || "Gree Maurice",
            service: selectedProduct.service_type || "",

            dropoff: dropoffBackend,
            return_date: returnBackend,

            // ✅ PRICES (EXPLICIT)
            quote_amount: quoteFee,                 // 56.77
            booking_fee: bookingFee,                // 1.99
            has_cancellation_cover: booking.cancellation_cover ? 1 : 0,
            cancellation_fee: booking.cancellation_cover ? cancellationFee : 0,
            total_payable: totalPayable,            // 68.76

            discount: 0,

            title: booking.title,
            first_name: booking.first_name,
            last_name: booking.last_name,
            email: booking.email,
            mobile: booking.mobile,

            passengers: Number(booking.passengers),
            terms: booking.terms,
        };



        const res = await fetch(`${API}/api/admin/create-admin-booking`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            setInvoiceMessage(data.message || "Failed to save booking.");
            return null;
        }

        setBookingId(data.booking_id);
        setMessage(`✅ Booking created successfully (ID: ${data.booking_id})`);
        return data.booking_id;
    };


    const sendInvoice = async () => {
        setInvoiceMessage("");
        setInvoiceLoading(true);

        try {
            // 1️⃣ Ensure booking exists
            const id = await saveBookingAndGetId();

            if (!id) return;

            // 2️⃣ Send invoice
            const res = await fetch(`${API}/api/admin/send-invoice`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ booking_id: id }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setInvoiceMessage(data.message || "Failed to send invoice.");
                return;
            }

            setInvoiceMessage("✅ Invoice sent successfully to customer email.");
        } catch (err) {
            setInvoiceMessage("Failed to send invoice.");
        } finally {
            setInvoiceLoading(false);
        }
    };



    const handleBookingChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setBooking((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const verifyAndActivatePayment = async () => {
        if (!paymentIntentId) {
            setPaymentMessage("Enter a valid Transaction ID (pi_xxx).");
            return;
        }

        if (!bookingId) {
            setPaymentMessage("Booking ID missing.");
            return;
        }

        setPaymentLoading(true);
        setPaymentMessage("");

        try {
            const res = await fetch(`${API}/api/admin/manual-confirm-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking_id: bookingId,          // ✅ ADD THIS
                    transaction_id: paymentIntentId // ✅ already correct
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setPaymentMessage(data.message || "Activation failed.");
                return;
            }

            setPaymentMessage(`✅ Booking Activated. Ref: ${data.ref_no}`);
            setShowPaymentModal(false);

        } catch (err) {
            setPaymentMessage("Activation failed.");
        } finally {
            setPaymentLoading(false);
        }
    };


    useEffect(() => {
        fetch(`${API}/api/admin/charges`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCharges(data.charges || {});
                }
            })
            .catch(() => {
                console.error("Failed to load charges");
            });
    }, []);

    const sendPaymentEmail = async () => {
        setEmailMessage("");

        if (!booking.email) {
            setEmailMessage("Customer email is required.");
            return;
        }

        if (!selectedProduct) {
            setEmailMessage("Select a product first.");
            return;
        }

        setEmailLoading(true);
        try {
            const res = await fetch(`${API}/api/admin/send-payment-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: booking.email,
                    first_name: booking.first_name,
                    last_name: booking.last_name,
                    product_name: selectedProduct.product_name,
                    amount: totalPayable,

                    dropoff: dropoffBackend,
                    return_date: returnBackend,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setEmailMessage(data.message || "Failed to send payment email.");
                return;
            }

            setEmailMessage("✅ Payment email sent successfully.");
        } catch (err: any) {
            setEmailMessage("Failed to send payment email.");
        } finally {
            setEmailLoading(false);
        }
    };



    // ===================== DEFAULT DATES =====================
    useEffect(() => {
        // Dropoff = tomorrow at 12:00
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0);
        const ymd = toYMD(tomorrow);

        setDropoffDate(ymd);
        setDropoffTime("12:00");

        // Return = +8 days after dropoff
        setReturnDate(addDays(ymd, 8));
        setReturnTime("12:00");
    }, []);

    // Auto-update return date to +8 days whenever dropoff date changes
    useEffect(() => {
        if (!dropoffDate) return;
        setReturnDate(addDays(dropoffDate, 8));
    }, [dropoffDate]);

    const dropoffDisplay = useMemo(() => toDisplayDate(dropoffDate), [dropoffDate]);
    const returnDisplay = useMemo(() => toDisplayDate(returnDate), [returnDate]);

    const dropoffBackend = useMemo(
        () => toBackendDateTime(dropoffDate, dropoffTime),
        [dropoffDate, dropoffTime]
    );

    // const [selectedAirport, setSelectedAirport] = useState("");


    const returnBackend = useMemo(
        () => toBackendDateTime(returnDate, returnTime),
        [returnDate, returnTime]
    );

    const filteredTerminals = useMemo(() => {
        if (!selectedProduct?.airport_name) return [];

        return terminals.filter(
            (t: any) => t.airport_name === selectedProduct.airport_name
        );
    }, [selectedProduct, terminals]);


    // ===================== PAYMENT CALCULATION (GLOBAL) =====================
    const quoteFee = useMemo(() => {
        return Number(selectedProduct?.total_price || 0);
    }, [selectedProduct]);

    const bookingFee = useMemo(() => {
        return Number(charges.booking?.price || 0);
    }, [charges.booking]);

    const cancellationFee = useMemo(() => {
        return booking.cancellation_cover
            ? Number(charges.cancellation?.price || 0)
            : 0;
    }, [booking.cancellation_cover, charges.cancellation]);

    const totalPayable = useMemo(() => {
        return Number((quoteFee + bookingFee + cancellationFee).toFixed(2));
    }, [quoteFee, bookingFee, cancellationFee]);




    // ===================== SEARCH PRODUCTS =====================
    const searchProducts = async () => {
        setSearchError("");
        setMessage("");
        setSelectedProduct(null);
        setProducts([]);

        if (!dropoffBackend || !returnBackend) {
            setSearchError("Please select valid drop-off and return date & time.");
            return;
        }


        setSearchLoading(true);
        try {
            const res = await fetch(`${API}/api/admin/search-products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dropoff: String(dropoffBackend),
                    return_date: String(returnBackend),
                    airport_name: selectedAirport || null,
                }),
            });

            const text = await res.text();
            let data: any;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error("Server did not return JSON. Check API URL / backend logs.");
            }

            if (!res.ok || !data?.success) {
                setSearchError(data?.message || "Failed to load products.");
                return;
            }

            setProducts(Array.isArray(data.data) ? data.data : []);
        } catch (err: any) {
            setSearchError(err?.message || "Search failed.");
        } finally {
            setSearchLoading(false);
        }
    };

    // ===================== CREATE BOOKING =====================
    // const createBooking = async (e: any) => {
    //     e.preventDefault();
    //     setMessage("");

    //     if (!selectedProduct) {
    //         setMessage("Please select a product first.");
    //         return;
    //     }
    //     if (!booking.terms) {
    //         setMessage("Please accept Terms & Conditions.");
    //         return;
    //     }

    //     const payload = {
    //         product_name: selectedProduct.product_name,
    //         product_flexibility: selectedProduct.product_flexibility || "Flexible",
    //         travelling_from: selectedProduct.airport_name,
    //         service_provider: selectedProduct.service_provider || "Gree Maurice Parking",
    //         service: selectedProduct.service_type || "",

    //         dropoff: dropoffBackend,
    //         return_date: returnBackend,

    //         // ✅ PRICES (MATCH BACKEND)
    //         quote_amount: quoteFee,
    //         booking_fee: bookingFee,
    //         has_cancellation_cover: booking.cancellation_cover ? 1 : 0,
    //         cancellation_fee: booking.cancellation_cover ? cancellationFee : 0,
    //         total_payable: totalPayable,

    //         discount: 0,

    //         title: booking.title,
    //         first_name: booking.first_name,
    //         last_name: booking.last_name,
    //         email: booking.email,
    //         mobile: booking.mobile,

    //         passengers: Number(booking.passengers),
    //         terms: booking.terms,
    //     };





    //     try {
    //         const res = await fetch(`${API}/api/admin/create-admin-booking`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify(payload),
    //         });

    //         const text = await res.text();
    //         let data: any;
    //         try {
    //             data = JSON.parse(text);
    //         } catch {
    //             throw new Error("Server did not return JSON.");
    //         }

    //         if (!res.ok || !data?.success) {
    //             setMessage(data?.message || "Booking failed.");
    //             return;
    //         }

    //         setBookingId(data.booking_id);
    //         setMessage(`✅ Booking created successfully (ID: ${data.booking_id})`);


    //         // Reset booking form (keep dates/products so admin can continue)
    //         setBooking({
    //             title: "",
    //             first_name: "",
    //             last_name: "",
    //             email: "",
    //             mobile: "",
    //             address_1: "",
    //             address_2: "",
    //             city: "",
    //             postcode: "",
    //             country: "United Kingdom",
    //             depart_terminal: "",
    //             depart_flight: "",
    //             return_terminal: "",
    //             return_flight: "",
    //             vehicle_make: "",
    //             vehicle_model: "",
    //             vehicle_colour: "",
    //             vehicle_reg: "",
    //             passengers: "1",
    //             cancellation_cover: false,
    //             terms: false,
    //             admin_notes: "",
    //         });

    //         setHasTravel("yes");
    //         setHasVehicle("yes");
    //         setSelectedProduct(null);
    //     } catch (err: any) {
    //         setMessage(err?.message || "Booking failed.");
    //     }
    // };


    const createBooking = async (e: any) => {
        e.preventDefault();
        setMessage("");

        if (!selectedProduct) {
            setMessage("Please select a product first.");
            return;
        }

        if (!booking.terms) {
            setMessage("Please accept Terms & Conditions.");
            return;
        }

        const payload = {
            product_name: selectedProduct.product_name,
            product_flexibility: selectedProduct.product_flexibility || "Flexible",
            travelling_from: selectedProduct.airport_name,
            service_provider: selectedProduct.service_provider || "Gree Maurice Parking",
            service: selectedProduct.service_type || "",

            dropoff: dropoffBackend,
            return_date: returnBackend,

            // ✅ EXACT DB MAPPING
            quote_amount: Number(quoteFee),
            booking_fee: Number(bookingFee),
            has_cancellation_cover: booking.cancellation_cover ? 1 : 0,
            cancellation_fee: booking.cancellation_cover
                ? Number(cancellationFee)
                : 0,
            total_payable: Number(totalPayable),

            title: booking.title,
            first_name: booking.first_name,
            last_name: booking.last_name,
            email: booking.email,
            mobile: booking.mobile,
            passengers: Number(booking.passengers),
            terms: booking.terms,
        };


        try {
            const res = await fetch(`${API}/api/admin/create-admin-booking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setMessage(data.message || "Booking failed.");
                return;
            }

            setBookingId(data.booking_id);
            setMessage(`✅ Booking created successfully (ID: ${data.booking_id})`);
        } catch {
            setMessage("Booking failed.");
        }
    };


    // ===================== UI HELPERS =====================
    const Field = ({
        label,
        required,
        children,
    }: {
        label: string;
        required?: boolean;
        children: React.ReactNode;
    }) => (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 leading-tight">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* input wrapper */}
            <div className="relative">
                {children}
            </div>
        </div>
    );




    return (
        <ProtectedRoute>
            <div className="border w-full mx-auto px-4 sm:px-6 lg:px-8 p-6 mt-6 bg-white pointer-events-auto">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-semibold">Add Booking</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Select dates → see dynamic prices → choose product → fill booking details.
                        </p>
                    </div>
                </div>

                {/* ===========================
            SECTION 1 — DATE SEARCH (PRO)
        ============================ */}
                <div className="border  p-4 mb-6 bg-white">
                    <h3 className="font-semibold text-sm mb-4">Select Dates</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Airport Filter Card */}
                        <div className="border p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold">
                                    Select Airport <span className="text-red-500">*</span>
                                </p>

                            </div>

                            <div className="flex flex-col gap-1">

                                <span className="text-xs text-gray-600 px-3 py-1">
                                    Select Your Airport
                                </span>

                                <select
                                    required
                                    value={selectedAirport}
                                    onChange={(e) => setSelectedAirport(e.target.value)}
                                    className="border px-3 py-2 w-full bg-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Airports</option>

                                    {airports.map((a) => (
                                        <option key={a.airport_id} value={a.airport_name}>
                                            {a.airport_name}
                                        </option>
                                    ))}
                                </select>

                                <p className="text-xs text-gray-500">
                                    Products will be filtered based on selected airport.
                                </p>
                            </div>
                        </div>


                        {/* Drop-off Card */}
                        <div className="border  p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold">Drop-off</p>
                                <span className="text-xs text-gray-600 bg-white border rounded-full px-3 py-1">

                                    {dropoffDisplay || "—"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Date" required>
                                    <div className="relative w-full">

                                        {/* Display formatted date */}
                                        <input
                                            type="text"
                                            readOnly
                                            value={formatPrettyDate(dropoffDate)}
                                            className="border p-2 w-full bg-white text-sm cursor-pointer"
                                            onClick={() =>
                                                (
                                                    document.getElementById("dropoffNative") as HTMLInputElement | null
                                                )?.showPicker()
                                            }
                                        />

                                        {/* Native date picker (hidden) */}
                                        <input
                                            id="dropoffNative"
                                            type="date"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            value={dropoffDate}
                                            onChange={(e) => setDropoffDate(e.target.value)}
                                            onClick={(e) => e.currentTarget.showPicker?.()}
                                        />

                                    </div>
                                </Field>




                                <Field label="Time" required>
                                    <select
                                        value={dropoffTime}
                                        onChange={(e) => setDropoffTime(e.target.value)}
                                        className="border p-2 w-full bg-white cursor-pointer"
                                    >
                                        {TIME_OPTIONS.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>

                                </Field>
                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                                Default: tomorrow at 12:00. Changing drop-off automatically updates return to +8 days.
                            </p>
                        </div>

                        {/* Return Card */}
                        <div className="border  p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold">Return</p>
                                <span className="text-xs text-gray-600 bg-white border -full px-3 py-1">
                                    {returnDisplay || "—"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Date" required>
                                    <div className="relative w-full">

                                        {/* Display formatted date */}
                                        <input
                                            type="text"
                                            readOnly
                                            value={formatPrettyDate(returnDate)}
                                            className="border p-2 w-full bg-white text-sm cursor-pointer"
                                            onClick={() =>
                                                (
                                                    document.getElementById("returnNative") as HTMLInputElement | null
                                                )?.showPicker()
                                            }
                                        />

                                        {/* Native date picker (hidden) */}
                                        <input
                                            id="returnNative"
                                            type="date"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            value={returnDate}
                                            onChange={(e) => setReturnDate(e.target.value)}
                                            onClick={(e) => e.currentTarget.showPicker?.()}
                                        />

                                    </div>
                                </Field>


                                <Field label="Time" required>

                                    <select
                                        value={returnTime}
                                        onChange={(e) => setReturnTime(e.target.value)}
                                        className="border p-2 w-full bg-white cursor-pointer"
                                    >
                                        {TIME_OPTIONS.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <div className="mt-3 text-xs text-gray-600">
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-white border rounded-full px-3 py-1">
                                        Drop-off: <b>{dropoffBackend || "—"}</b>
                                    </span>
                                    <span className="bg-white border rounded-full px-3 py-1">
                                        Return: <b>{returnBackend || "—"}</b>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-5">
                        <div className="text-sm text-red-600">{searchError}</div>

                        <button
                            type="button"
                            onClick={searchProducts}
                            disabled={searchLoading}
                            className={`px-5 py-2  text-white font-medium ${searchLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {searchLoading ? "Searching..." : "Search Parking Products"}
                        </button>
                    </div>
                </div>

                {/* ===========================
            SECTION 2 — PRODUCTS (CARD UI)
        ============================ */}
                {products.length > 0 && (
                    <div className="border  p-4 mb-6 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-sm">Available Products</h3>
                            <span className="text-xs text-gray-500">
                                Showing {products.length} product(s)
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {products.map((p) => {
                                const img = safeImage(p.image_url || p.image_data);
                                const isActive = selectedProduct?.id === p.id;

                                return (
                                    <div
                                        key={p.id}
                                        className={`border  overflow-hidden bg-white shadow-sm hover:shadow-md transition ${isActive ? "ring-2 ring-blue-600" : ""
                                            }`}
                                    >
                                        {/* Image */}
                                        <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {img ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={img}
                                                    alt={p.product_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-xs text-gray-500">No Image</div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h4 className="font-semibold text-sm leading-5">
                                                        {p.product_name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Service: <span className="font-medium">{p.service_type || "—"}</span>
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Airport: <span className="font-medium">{p.airport_name}</span>
                                                    </p>

                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Total</p>
                                                    <p className="text-lg font-bold text-gray-900">£{p.total_price}</p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedProduct(p);

                                                    // reset terminals when product changes
                                                    setBooking((prev) => ({
                                                        ...prev,
                                                        depart_terminal: "",
                                                        return_terminal: "",
                                                    }));
                                                }}

                                                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2  font-medium"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-xs text-gray-500 mt-4">
                            Prices are dynamically calculated based on your pricing bands.
                        </p>
                    </div>
                )}

                {/* ===========================
            SECTION 3 — BOOKING FORM (ADMIN UI)
        ============================ */}
                {selectedProduct && (
                    <form onSubmit={createBooking}>
                        {/* Summary strip */}
                        <div className="border  p-4 mb-6 bg-white">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">Selected Product</p>
                                    <p className="font-semibold">{selectedProduct.product_name}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Service: <b>{selectedProduct.service_type || "—"}</b>
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-gray-50 border -full px-3 py-1">
                                        Drop-off: <b>{dropoffDisplay}</b> {dropoffTime}
                                    </span>
                                    <span className="text-xs bg-gray-50 border -full px-3 py-1">
                                        Return: <b>{returnDisplay}</b> {returnTime}
                                    </span>
                                    <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1">

                                        Total: <b>£{totalPayable.toFixed(2)}</b>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ===========================
                SECTION A — CUSTOMER INFO
            ============================ */}
                        <div className="border  p-4 mb-6 bg-white">
                            <h3 className="font-semibold text-sm mb-4">Customer Information</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Field label="Title" required>
                                    <select
                                        name="title"
                                        value={booking.title}
                                        onChange={handleBookingChange}
                                        className="border p-2  w-full bg-white"
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option>Mr</option>
                                        <option>Mrs</option>
                                        <option>Miss</option>
                                        <option>Ms</option>
                                    </select>
                                </Field>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="first_name"
                                        value={booking.first_name}
                                        onChange={handleBookingChange}
                                        className={inputClass}
                                        required

                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="last_name"
                                        value={booking.last_name}
                                        onChange={handleBookingChange}
                                        className={inputClass}
                                        required
                                    />
                                </div>


                                {/* <Field label="Last Name" required>
                                    <input
                                        name="last_name"
                                        value={booking.last_name}
                                        onChange={handleBookingChange}
                                        className="border p-2  w-full"
                                        required
                                    />
                                </Field> */}

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={booking.email}
                                        onChange={handleBookingChange}
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Mobile <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={booking.mobile}
                                        onChange={handleBookingChange}
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                {/* <Field label="Mobile" required>
                                    <input
                                        name="mobile"
                                        value={booking.mobile}
                                        onChange={handleBookingChange}
                                        className="border p-2  w-full"
                                        required
                                    />
                                </Field> */}
                            </div>
                        </div>

                        {/* ===========================
                SECTION B — TRAVEL DETAILS
            ============================ */}


                        <div className="border  p-4 mb-6 bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                <h3 className="font-semibold text-sm">Travel Details</h3>

                                <div className="flex gap-6 text-sm">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={hasTravel === "yes"}
                                            onChange={() => setHasTravel("yes")}
                                        />
                                        Yes
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={hasTravel === "no"}
                                            onChange={() => setHasTravel("no")}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>

                            {hasTravel === "yes" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">


                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Depart Terminal
                                        </label>
                                        <select
                                            name="depart_terminal"
                                            value={booking.depart_terminal}
                                            onChange={handleBookingChange}
                                            className={inputClass}

                                        >
                                            <option value="">Select Terminal</option>

                                            {filteredTerminals.map((t) => (
                                                <option key={t.terminal_id} value={t.terminal_code}>
                                                    {t.terminal_name}
                                                </option>
                                            ))}

                                        </select>

                                    </div>




                                    {/* <Field label="Departure Flight No">
                                        <input
                                            name="depart_flight"
                                            value={booking.depart_flight}
                                            onChange={handleBookingChange}
                                            className="border p-2  w-full"
                                            placeholder="e.g. BA123"
                                        />
                                    </Field> */}


                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Depart Flight
                                        </label>
                                        <input
                                            type="text"
                                            name="depart_flight"
                                            value={booking.depart_flight}
                                            onChange={handleBookingChange}
                                            className={inputClass}

                                        />
                                    </div>

                                    {/* <Field label="Return Terminal">
                                        <input
                                            name="return_terminal"
                                            value={booking.return_terminal}
                                            onChange={handleBookingChange}
                                            className="border p-2  w-full"
                                            placeholder="e.g. 3"
                                        />
                                    </Field> */}

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Return Terminal
                                        </label>
                                        <select
                                            name="return_terminal"
                                            value={booking.return_terminal}
                                            onChange={handleBookingChange}
                                            className={inputClass}

                                        >
                                            <option value="">Select Terminal</option>

                                            {filteredTerminals.map((t) => (
                                                <option key={t.terminal_id} value={t.terminal_code}>
                                                    {t.terminal_name}
                                                </option>
                                            ))}

                                        </select>

                                    </div>

                                    {/* <Field label="Return Flight No">
                                        <input
                                            name="return_flight"
                                            value={booking.return_flight}
                                            onChange={handleBookingChange}
                                            className="border p-2  w-full"
                                            placeholder="e.g. CX238"
                                        />
                                    </Field> */}

                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Return Flight
                                        </label>
                                        <input
                                            type="text"
                                            name="return_flight"
                                            value={booking.return_flight}
                                            onChange={handleBookingChange}
                                            className={inputClass}

                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">Travel details disabled.</p>
                            )}
                        </div>

                        {/* ===========================
                SECTION C — VEHICLE DETAILS
            ============================ */}
                        <div className="border  p-4 mb-6 bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                <h3 className="font-semibold text-sm">Vehicle Details</h3>

                                <div className="flex gap-6 text-sm">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={hasVehicle === "yes"}
                                            onChange={() => setHasVehicle("yes")}
                                        />
                                        Yes
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={hasVehicle === "no"}
                                            onChange={() => setHasVehicle("no")}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>

                            {hasVehicle === "yes" ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* <Field label="Make">
                                            <input
                                                name="vehicle_make"
                                                value={booking.vehicle_make}
                                                onChange={handleBookingChange}
                                                className="border p-2  w-full"
                                                placeholder="e.g. BMW"
                                            />
                                        </Field> */}

                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-gray-700">
                                                Make
                                            </label>
                                            <input
                                                type="text"
                                                name="vehicle_make"
                                                value={booking.vehicle_make}
                                                onChange={handleBookingChange}
                                                className={inputClass}

                                            />
                                        </div>

                                        {/* <Field label="Model">
                                            <input
                                                name="vehicle_model"
                                                value={booking.vehicle_model}
                                                onChange={handleBookingChange}
                                                className="border p-2  w-full"
                                                placeholder="e.g. X5"
                                            />
                                        </Field> */}

                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-gray-700">
                                                Model
                                            </label>
                                            <input
                                                type="text"
                                                name="vehicle_model"
                                                value={booking.vehicle_model}
                                                onChange={handleBookingChange}
                                                className={inputClass}

                                            />
                                        </div>

                                        {/* <Field label="Colour">
                                            <input
                                                name="vehicle_colour"
                                                value={booking.vehicle_colour}
                                                onChange={handleBookingChange}
                                                className="border p-2  w-full"
                                                placeholder="e.g. Black"
                                            />
                                        </Field> */}

                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-gray-700">
                                                Colour
                                            </label>
                                            <input
                                                type="text"
                                                name="vehicle_colour"
                                                value={booking.vehicle_colour}
                                                onChange={handleBookingChange}
                                                className={inputClass}

                                            />
                                        </div>

                                        {/* <Field label="Registration">
                                            <input
                                                name="vehicle_reg"
                                                value={booking.vehicle_reg}
                                                onChange={handleBookingChange}
                                                className="border p-2  w-full"
                                                placeholder="e.g. AB12CDE"
                                            />
                                        </Field> */}

                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-medium text-gray-700">
                                                Registration
                                            </label>
                                            <input
                                                type="text"
                                                name="vehicle_reg"
                                                value={booking.vehicle_reg}
                                                onChange={handleBookingChange}
                                                className={inputClass}

                                            />
                                        </div>
                                    </div>

                                    <div className="mt-5 w-full sm:w-52">
                                        <Field label="Passengers">
                                            <select
                                                name="passengers"
                                                value={booking.passengers}
                                                onChange={handleBookingChange}
                                                className="border p-2  w-full bg-white"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                                    <option key={n} value={String(n)}>
                                                        {n}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    </div>
                                </>
                            ) : (
                                <p className="text-xs text-gray-500">Vehicle details disabled.</p>
                            )}
                        </div>

                        {/* ===========================
                SECTION D — OPTIONS & NOTES
            ============================ */}
                        {/* ===========================
OPTIONS & PAYMENT SUMMARY
=========================== */}
                        <div className="border p-5 mb-6 bg-white rounded-md">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* LEFT — ADD ONS */}
                                <div className="lg:col-span-2">
                                    <h3 className="text-sm font-semibold mb-3">Optional Add-ons</h3>

                                    <label className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="cancellation_cover"
                                            checked={booking.cancellation_cover}
                                            onChange={handleBookingChange}
                                            className="mt-1"
                                        />

                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-sm">
                                                    {charges.cancellation?.name || "Late Return Cover"}
                                                </span>
                                                <span className="font-semibold text-sm">
                                                    £{charges.cancellation?.price?.toFixed(2) ?? "0.00"}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-500 mt-1">
                                                Covers unexpected late vehicle return. Added instantly to total.
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {/* RIGHT — PAYMENT SUMMARY */}
                                <div className="border rounded bg-gray-50 p-4">
                                    <h4 className="text-sm font-semibold mb-4">Payment Summary</h4>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Quote Fee</span>
                                            <span>£{quoteFee.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Booking Fee</span>
                                            <span>£{bookingFee.toFixed(2)}</span>
                                        </div>

                                        {booking.cancellation_cover && (
                                            <div className="flex justify-between text-green-700">
                                                <span>{charges.cancellation?.name || "Late Return Cover"}</span>
                                                <span>£{cancellationFee.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="border-t pt-3 mt-3 flex justify-between text-base font-semibold">
                                            <span>Total Payable</span>
                                            <span className="text-green-700">
                                                £{totalPayable.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>



                        {/* ===========================
                SUBMIT
            ============================ */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className={`text-sm ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                                {message}
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                {/* Confirm Booking */}
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 font-medium"
                                >
                                    Save As Incomplete
                                </button>

                                {/* Send Invoice */}
                                <button
                                    type="button"
                                    onClick={sendInvoice}
                                    disabled={invoiceLoading}
                                    className="bg-purple-600 text-white px-6 py-2 hover:bg-purple-700 font-medium"
                                >
                                    {invoiceLoading ? "Sending..." : "Send Invoice"}
                                </button>

                                {invoiceMessage && (
                                    <div
                                        className={`text-sm mt-2 ${invoiceMessage.includes("✅")
                                            ? "text-green-600"
                                            : "text-red-600"
                                            }`}
                                    >
                                        {invoiceMessage}
                                    </div>
                                )}


                                {/* Payment */}
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(true)}
                                    className="px-6 py-2 font-medium bg-green-600 text-white hover:bg-green-700"
                                >
                                    Confirm Booking (£{totalPayable.toFixed(2)})

                                </button>

                                {emailMessage && (
                                    <div className={`text-sm mt-2 ${emailMessage.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                                        {emailMessage}
                                    </div>
                                )}

                            </div>

                        </div>
                    </form>
                )}



                {/* If no products yet */}
                {products.length === 0 && !searchLoading && !searchError && (
                    <p className="text-xs text-gray-500">
                        Choose drop-off and return dates, then search to see products and dynamic pricing.
                    </p>
                )}
            </div>

            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-[420px] rounded-lg p-6 shadow-lg">
                        <h2 className="text-lg font-semibold mb-2">
                            Activate Booking
                        </h2>

                        <p className="text-xs text-gray-500 mb-4">
                            Enter the Stripe Payment Intent ID (pi_xxx).
                            Payment will be Activate the booking.
                        </p>

                        <input
                            value={paymentIntentId}
                            onChange={(e) => setPaymentIntentId(e.target.value)}
                            placeholder="pi_XXXXXXXXXXXX"
                            className="border w-full p-2 mb-3"
                        />

                        {paymentMessage && (
                            <p className={`text-sm mb-3 ${paymentMessage.includes("✅")
                                ? "text-green-600"
                                : "text-red-600"
                                }`}>
                                {paymentMessage}
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={paymentLoading}
                                onClick={verifyAndActivatePayment}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                {paymentLoading ? "Activating......" : "Activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </ProtectedRoute>
    );
}
