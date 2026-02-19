'use client';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";
import { FileEdit, Clock } from "lucide-react";


import { Fragment, useEffect, useMemo, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StickyNote, Pencil, Trash2, X, Handshake, SquareParking } from 'lucide-react';

import { Download } from 'lucide-react';

import CancelPopup from '@/components/CancelPopup'

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import { Lightbulb } from 'lucide-react';
import { NotebookPen } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Send } from "lucide-react";



/* ---------- ENUM options from SQL ---------- */
const SOURCES = ['Supplier', 'Website'] as const;
const AIRPORTS = ['LHR', 'LGW', 'STN', 'LTN', 'MAN', 'BHX', 'Other'] as const;
const SERVICES = ['meet greet', 'park ride'] as const;
const STATUSES = ['Active', 'Completed', 'No Show', 'Refunded'] as const;

/* ---------- Types ---------- */
type Booking = {
    id: number;
    ref_no: string;
    source: string;
    airport: string;
    service_type: string;
    customer_name: string;
    first_name: string;
    last_name: string;
    mobile: string;
    email: string;
    contact_no: string | null;
    vehicle_registration: string | null;
    service: string | null;
    travelling_from: string | null;
    vehicle_make: string | null;
    vehicle_model: string | null;
    vehicle_colour: string | null;
    drop_off_date: string;
    return_date: string;
    customer_email: string | null;
    booked_on: string;
    booked_at?: string;
    dropoff_datetime: string;
    return_datetime: string;
    vehicle_reg_no: string | null;
    total_payable: number;
    discount: number;
    quote_amount: number;
    booking_fee: number;
    cancellation_cover: number;
    transaction_id: string;
    status: string;
    notes: string | null;
    airport_alias: string | null;
    make_model: string;
    model: string;
    color: string;
    product_name: string;
};


const actionIconClass =
    "flex items-center justify-center w-6 h-6 cursor-pointer";


const handleExtend = (row: any) => {
    console.log("Extend booking:", row);
    // later: open extend modal or logic
};

const splitDateTime = (value?: string) => {
    if (!value) return { date: "", time: "" };
    const d = new Date(value);
    if (isNaN(d.getTime())) return { date: "", time: "" };

    const pad = (n: number) => String(n).padStart(2, "0");

    return {
        date: `${pad(d.getDate())} ${d.toLocaleString("en-GB", { month: "short" })} ${d.getFullYear()}`,
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
};

const n0 = (v: any) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
};


const mergeDateTime = (originalISO: string, time: string) => {
    const d = new Date(originalISO);
    const [hh, mm] = time.split(":").map(Number);
    d.setHours(hh, mm, 0, 0);
    return d.toISOString().slice(0, 19).replace("T", " ");
};


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ---------- Helpers ---------- */
function getCookie(name: string) {
    const m = typeof document !== 'undefined'
        ? document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
        : null;
    return m ? m.pop() : '';
}

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

function toLocalInputValue(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toSqlDateTime(local: string) {
    if (!local) return null;
    return local.replace('T', ':') + ':00';
}

function money(n: number) {
    return `£${Number(n || 0).toFixed(2)}`;
}

function getRowBgClass(status?: string) {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-emerald-100';
    if (s === 'cancelled') return 'bg-red-100';
    if (s === 'completed') return 'bg-blue-100';
    if (s === 'pending') return 'bg-yellow-100';
    if (s === 'refunded') return 'bg-pink-100';
    if (s === 'no show') return 'bg-gray-100';
    return 'bg-neutral-100';
}


// Format visible date like "10 Nov 2025"
function formatDisplayDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}



// Format value for <input type="date"> (yyyy-mm-dd)
function formatInputDate(date: Date): string {
    return date.toISOString().split("T")[0];
}



const renderService = (s?: string) => {
    const lower = (s || '').toLowerCase();
    if (lower.startsWith('meet')) {
        return (
            <span className="inline-flex items-center gap-1.5">
                <Handshake className="h-3.5 w-3.5 text-orange-500" />
            </span>
        );
    }
    if (lower.startsWith('park')) {
        return (
            <span className="inline-flex items-center gap-1.5">
                <SquareParking className="h-3.5 w-3.5 text-blue-500" />
            </span>
        );
    }
    return s || '-';
};





/* ===========================================================
   MAIN COMPONENT
=========================================================== */
export default function BookingsPage() {

    /* ---------- Table State ---------- */
    const [rows, setRows] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    const [search, setSearch] = useState('');

    const todayDate = formatInputDate(new Date());

    const [selectDate, setSelectDate] = useState(todayDate);

    const [notesOpen, setNotesOpen] = useState(false);
    const [notesBooking, setNotesBooking] = useState<any>(null);
    const [notesText, setNotesText] = useState("");
    const [notesSaving, setNotesSaving] = useState(false);


    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [total, setTotal] = useState(0);

    const [editMode, setEditMode] = useState<"amend" | "extend" | null>(null);


    /* ---------- Filters ---------- */
    const [status, setStatus] = useState('');
    const [airport, setAirport] = useState('');
    const [source, setSource] = useState('');
    const [service_type, setServiceType] = useState('');

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const [emailStatus, setEmailStatus] = useState<Record<number, number>>({});


    const [selectedDate, setSelectedDate] = useState("");
    const [departDate, setDepartDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    // const [rangeFrom, setRangeFrom] = useState("");
    // const [rangeTo, setRangeTo] = useState("");
    const [pattern, setPattern] = useState("booked");

    // 🔹 Extend preview state
    const [extendPreview, setExtendPreview] = useState<any>(null);
    const [extendLoading, setExtendLoading] = useState(false);


    const todaydate = new Date().toISOString().split("T")[0];

    const [dropoffFrom, setDropoffFrom] = useState("");
    const [dropoffTo, setDropoffTo] = useState("");

    const [returnFrom, setReturnFrom] = useState("");
    const [returnTo, setReturnTo] = useState("");

    const [rangeFrom, setRangeFrom] = useState("");
    const [rangeTo, setRangeTo] = useState("");


    const [activeTab, setActiveTab] = useState("customer");


    const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    const [alreadyDrawer, setAlreadyDrawer] = useState(false);
    const [drawerBooking, setDrawerBooking] = useState<any>(null);

    const [openedId, setOpenedId] = useState<null>(null);
    const [extendError, setExtendError] = useState("");


    const openNotesPopup = (booking: any) => {
        setNotesBooking(booking);
        setNotesText(booking.notes || "");
        setNotesOpen(true);
    };

    const calculateExtendPrice = async (
        bookingId: number,
        newReturnSql: string
    ) => {
        try {
            setExtendLoading(true);
            setExtendError("");

            const res = await fetch(
                `${API_BASE_URL}/api/bookings/extend/preview/${bookingId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ new_return_date: newReturnSql }),
                }
            );

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();

            setExtendPreview(data);

            setForm((f) => ({
                ...f,
                total_payable: n0(data.new_total_payable),
            }));
        } catch (err) {
            console.error(err);
            setExtendError("Failed to calculate extend price");
        } finally {
            setExtendLoading(false);
        }
    };





    function toSqlDateTimeSafe(local: string): string | null {
        if (!local) return null;
        return local.replace("T", " ") + ":00";
    }


    const sendBookingsCSVByEmail = async () => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/bookings/email-csv`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed");

            alert(data.message || "Email sent successfully");

        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to send email");
        }
    };

    const sendBookingToUser = async (bookingId: number) => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/bookings/send-booking-email/${bookingId}`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            alert("Booking email sent successfully");
            fetchEmailStatus(bookingId);

        } catch (err: any) {
            alert(err.message || "Failed to send email");
        }
    };



    const saveNotes = async () => {
        if (!notesBooking) return;

        const cleanNotes =
            notesText && notesText.trim() !== "" ? notesText.trim() : null;

        try {
            setNotesSaving(true);

            const authToken =
                (typeof window !== "undefined" &&
                    (localStorage.getItem("authToken") || getCookie("token"))) ||
                "";

            const res = await fetch(
                `${API_BASE_URL}/api/bookings/update-notes/${notesBooking.id}`, // ✅ FIXED
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify({
                        notes: cleanNotes, // ✅ ONLY NOTES
                    }),
                }
            );

            if (!res.ok) throw new Error(await res.text());

            // ✅ CLOSE & REFRESH
            setNotesOpen(false);
            setNotesBooking(null);
            setNotesText("");
            fetchData();

        } catch (e: any) {
            alert(e.message);
        } finally {
            setNotesSaving(false);
        }
    };

    const fetchEmailStatus = async (bookingId: number) => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/bookings/email-status/${bookingId}`,
                { credentials: "include" }
            );

            if (!res.ok) return;

            const json = await res.json();

            if (json.success) {
                setEmailStatus(prev => ({
                    ...prev,
                    [bookingId]: json.email_sent
                }));
            }
        } catch (err) {
            console.error("Email status error:", err);
        }
    };


    const openCancelPopup = (booking: any) => {

        if (booking.status === "Cancelled") {
            alert(`Booking ${booking.ref_no} is already cancelled.`);
            return;
        }

        setSelectedBooking(booking);
        setCancelPopupOpen(true);
    };

    const downloadCSV = () => {
        if (!rows.length) {
            alert("No data to download");
            return;
        }

        const headers = [
            "Ref No",
            "Source",
            "Customer Name",
            "Phone",
            "Product",
            "Make/Model",
            "Color",
            "Booked On",
            "Dropoff",
            "Return",
            "Reg",
            "Amount",
            "Status",
        ];

        const csvRows = rows.map(b =>
            [
                b.ref_no,
                b.source,
                b.customer_name,
                b.contact_no,
                b.product_name,
                `${b.make_model}/${b.model}`,
                b.color,
                fmtDT(b.booked_on),
                fmtDT(b.dropoff_datetime),
                fmtDT(b.return_datetime),
                b.vehicle_reg_no,
                b.total_payable,
                b.status,
            ]
                .map(v => `"${v ?? ""}"`) // wrap in quotes
                .join(",")
        );

        const csvString = [headers.join(","), ...csvRows].join("\n");

        const blob = new Blob([csvString], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "bookings.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };



    const handleCancelAction = async (payload: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/cancel/${selectedBooking.id}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(await res.text());

            alert("Action completed successfully!");

            setCancelPopupOpen(false);
            fetchData();

        } catch (err: any) {
            alert(err.message);
        }
    };



    /* ---------- Inline Editing ---------- */
    const [openRowId, setOpenRowId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        mobile: '',
        email: '',
        vehicle_registration: '',
        travelling_from: '',
        service: 'park ride',
        status: 'Active',
        total_payable: 0,
        drop_off_date: '',
        return_date: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_colour: '',
        product_name: '',
    });

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

    /* ===========================================================
       FETCH DATA
    =========================================================== */
    const fetchData = async () => {
        setLoading(true);
        setErrMsg("");

        try {
            const qs = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            });

            const res = await fetch(
                `${API_BASE_URL}/api/parkingBooking?${qs}`,
                {
                    credentials: "include", // 🔐 REQUIRED
                }
            );

            // 🔐 Handle expired session nicely
            if (res.status === 401) {
                window.location.href = "/auth/login";
                return;
            }

            if (!res.ok) throw new Error(await res.text());

            const json = await res.json();
            const apiRows = json.data || [];

            const mapped = apiRows.map((b: any) => ({
                id: b.id,
                ref_no: String(b.id),

                first_name: b.first_name || "",
                last_name: b.last_name || "",
                mobile: b.mobile || "",
                email: b.email || "",
                vehicle_registration: b.vehicle_registration || "",
                travelling_from: b.travelling_from || "",
                service: b.service || "park ride",
                drop_off_date: b.drop_off_date || "",
                return_date: b.return_date || "",
                vehicle_make: b.vehicle_make || "",
                vehicle_model: b.vehicle_model || "",
                vehicle_colour: b.vehicle_colour || "",
                product_name: b.product_name || "",
                notes: b.notes || null,

                customer_name: `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim(),
                contact_no: b.mobile,
                customer_email: b.email,
                booked_on: b.created_at,
                dropoff_datetime: b.drop_off_date,
                return_datetime: b.return_date,
                vehicle_reg_no: b.vehicle_registration,
                total_payable: parseFloat(b.total_payable ?? 0),
                quote_amount: parseFloat(b.quote_amount ?? 0),
                booking_fee: parseFloat(b.booking_fee ?? 0),
                cancellation_cover: parseFloat(b.cancellation_cover ?? 0),
                discount: parseFloat(b.discount ?? 0),
                status: b.status,
                make_model: b.vehicle_make,
                model: b.vehicle_model,
                color: b.vehicle_colour,
                service_type: b.service || "park ride",
            }));

            setRows(mapped);
            setTotal(json.total || mapped.length);

            mapped.forEach((b: any) => {
                fetchEmailStatus(b.id);
            });

        } catch (e) {
            console.error(e);
            setErrMsg("Failed to load bookings.");
        } finally {
            setLoading(false);
        }
    };


    const filteredRows = useMemo(() => {
        return rows.filter(b => {

            const s = search.toLowerCase();

            return (
                (!search ||
                    b.ref_no.toLowerCase().includes(s) ||
                    b.customer_name.toLowerCase().includes(s) ||
                    b.contact_no?.toLowerCase().includes(s) ||
                    b.make_model.toLowerCase().includes(s) ||
                    b.model.toLowerCase().includes(s)
                ) &&

                (!status || b.status === status) &&
                (!airport || b.airport === airport) &&
                (!source || b.source === source) &&
                (!service_type || b.service_type === service_type) &&

                (!selectedDate || b.booked_on.startsWith(selectedDate)) &&
                (!departDate || b.dropoff_datetime.startsWith(departDate)) &&
                (!returnDate || b.return_datetime.startsWith(returnDate)) &&

                // BOOKING RANGE
                (!rangeFrom || new Date(b.booked_on) >= new Date(rangeFrom)) &&
                (!rangeTo || new Date(b.booked_on) <= new Date(rangeTo)) &&

                // DROPOFF RANGE
                (!dropoffFrom || new Date(b.dropoff_datetime) >= new Date(dropoffFrom)) &&
                (!dropoffTo || new Date(b.dropoff_datetime) <= new Date(dropoffTo)) &&

                // RETURN RANGE
                (!returnFrom || new Date(b.return_datetime) >= new Date(returnFrom)) &&
                (!returnTo || new Date(b.return_datetime) <= new Date(returnTo))
            );
        });
    }, [
        rows,
        search,
        status,
        airport,
        source,
        service_type,
        selectedDate,
        departDate,
        returnDate,
        rangeFrom,
        rangeTo,
        dropoffFrom,
        dropoffTo,
        returnFrom,
        returnTo
    ]);

    useEffect(() => {
        fetchData();
    }, [
        page,
        status,
        airport,
        source,
        service_type,
        search,
        selectedDate,
        departDate,
        returnDate,
        rangeFrom,
        rangeTo,
        search
    ]);



    /* ===========================================================
       EDIT HANDLERS
    =========================================================== */
    const openEdit = (b: Booking) => {
        if (openRowId === b.id) {
            setOpenRowId(null);
            return;
        }
        setOpenRowId(b.id);
        setForm({
            first_name: b.first_name,
            last_name: b.last_name,
            mobile: b.mobile || '',
            email: b.email || '',
            vehicle_registration: b.vehicle_registration || '',
            travelling_from: b.travelling_from || '',
            service: b.service || '',
            status: b.status,
            total_payable: Number(b.total_payable || 0),
            drop_off_date: toLocalInputValue(b.drop_off_date),
            return_date: toLocalInputValue(b.return_date),
            vehicle_make: b.vehicle_make || '',
            vehicle_model: b.vehicle_model || '',
            product_name: b.product_name || '',
            vehicle_colour: b.vehicle_colour || ''
        });
    };

    const saveEdit = async (id: number) => {
        setSaving(true);
        setSaveMsg("Saving...");

        try {
            const authToken =
                (typeof window !== "undefined" &&
                    (localStorage.getItem("authToken") || getCookie("token"))) ||
                "";

            const payload: any = {};

            // 🔹 Split customer name
            // const [first_name, ...rest] = form.customer_name.split(" ");
            // payload.first_name = first_name || "";
            // payload.last_name = rest.join(" ");

            // 🔹 Direct first_name
            payload.first_name = form.first_name || null;
            payload.last_name = form.last_name || null;
            payload.mobile = form.mobile || null;
            payload.email = form.email || null;
            payload.vehicle_registration = form.vehicle_registration || null;
            payload.service = form.service;
            payload.status = form.status;
            payload.total_payable = Number(form.total_payable);
            payload.vehicle_make = form.vehicle_make;
            payload.vehicle_model = form.vehicle_model;
            payload.vehicle_colour = form.vehicle_colour;
            payload.product_name = form.product_name;

            // 🔹 Date handling
            if (form.drop_off_date) {
                payload.drop_off_date = toSqlDateTime(form.drop_off_date);
            }

            if (form.return_date) {
                payload.return_date = toSqlDateTime(form.return_date);
            }

            const res = await fetch(
                `${API_BASE_URL}/api/bookings/update/${id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) throw new Error(await res.text());

            setSaveMsg("Saved ✓");
            await fetchData();
            setTimeout(() => setSaveMsg(""), 1000);
            setOpenRowId(null);
        } catch (e: any) {
            setSaveMsg(e.message);
        } finally {
            setSaving(false);
        }
    };


    const deleteRow = async (b: Booking) => {
        if (!confirm(`Delete booking ${b.ref_no}? This action cannot be undone.`)) return;

        try {
            const authToken =
                (typeof window !== 'undefined' &&
                    (localStorage.getItem('authToken') || getCookie('token'))) ||
                '';

            const res = await fetch(`${API_BASE_URL}/api/bookings/delete/${b.id}`, {
                method: 'DELETE',
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            });

            if (!res.ok) throw new Error(await res.text());

            await fetchData();
            alert('Deleted successfully.');
        } catch (e: any) {
            alert(e.message);
        }
    };



    const today = new Date().toISOString().split("T")[0];
    const [rangeFromDisplay, setRangeFromDisplay] = useState(today);
    const [rangeToDisplay, setRangeToDisplay] = useState(today);

    const [dropoffFromDisplay, setDropoffFromDisplay] = useState(today);
    const [dropoffToDisplay, setDropoffToDisplay] = useState(today);

    const [returnFromDisplay, setReturnFromDisplay] = useState(today);
    const [returnToDisplay, setReturnToDisplay] = useState(today);


    const [displayDate, setDisplayDate] = useState(
        formatDisplayDate(today) // 👈 shown by default
    );

    const sendBooking = async (bookingId: number) => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/bookings/send-booking-email/${bookingId}`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed");

            alert("Booking email sent successfully");

            // refresh email icon color
            fetchEmailStatus(bookingId);

        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to send email");
        }
    };


    const saveExtension = async (bookingId: number) => {
        const sql = toSqlDateTimeSafe(form.return_date);
        if (!sql) return alert("Invalid return date");

        const res = await fetch(
            `${API_BASE_URL}/api/bookings/extend/${bookingId}`,
            {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ new_return_date: sql }),
            }
        );

        if (!res.ok) {
            alert(await res.text());
            return;
        }

        setOpenRowId(null);
        setEditMode(null);
        setExtendPreview(null);
        fetchData();
    };



    /* ===========================================================
       RENDER
    =========================================================== */
    return (

        <ProtectedRoute>
            <div className="w-full min-h-screen px-3 md:px-1">

                <CancelPopup
                    open={cancelPopupOpen}
                    booking={selectedBooking}
                    onClose={() => setCancelPopupOpen(false)}
                    refresh={fetchData}
                />

                {notesOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white w-full max-w-lg  shadow-lg border">

                            {/* HEADER */}
                            <div className="flex justify-between items-center px-4 py-3 border-b">
                                <h3 className="text-sm font-semibold">
                                    Booking Notes – <span className="text-primary">{notesBooking?.ref_no}</span>
                                </h3>

                                <button
                                    onClick={() => setNotesOpen(false)}
                                    className="text-neutral-500 hover:text-neutral-800"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* BODY */}
                            <div className="p-4">
                                <label className="block text-xs font-medium mb-2">
                                    Notes
                                </label>

                                <textarea
                                    className="w-full min-h-[140px] border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="Enter booking notes here..."
                                    value={notesText}
                                    onChange={(e) => setNotesText(e.target.value)}
                                />
                            </div>

                            {/* FOOTER */}
                            <div className="flex justify-end gap-2 px-4 py-3 border-t bg-neutral-50">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setNotesOpen(false)}
                                    disabled={notesSaving}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={saveNotes}
                                    disabled={notesSaving}
                                >
                                    {notesSaving ? "Saving…" : "Save Notes"}
                                </Button>


                            </div>
                        </div>
                    </div>
                )}



                <div className="w-full">

                    <div className="text-xs text-muted-foreground mb-3">
                        <span className="font-semibold">Active Bookings</span>{' '}
                    </div>

                    {/* FILTER BAR */}
                    <div className="mb-2 w-full border-b pb-2">
                        <div className="flex flex-wrap items-end gap-3">


                            {/* Service */}
                            <div className="flex flex-col">
                                {/* <label className="text-xs font-medium text-gray-600 mb-1">Source</label> */}
                                <select
                                    className="h-9 min-w-[150px] border px-2 text-sm"
                                    value={service_type}
                                    onChange={(e) => { setServiceType(e.target.value); setPage(1); }}
                                >
                                    <option value="">All Services</option>
                                    {SERVICES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* SOURCE */}
                            <div className="flex flex-col">
                                {/* <label className="text-xs font-medium text-gray-600 mb-1">Source</label> */}
                                <select
                                    className="h-9 min-w-[150px] border  px-2 text-sm"
                                    value={source}
                                    onChange={(e) => { setSource(e.target.value); setPage(1); }}
                                >
                                    <option value="">All Sources</option>
                                    {SOURCES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* STATUS */}
                            <div className="flex flex-col">
                                {/* <label className="text-xs font-medium text-gray-600 mb-1">Source</label> */}
                                <select
                                    className="h-9 min-w-[150px] border  px-2 text-sm"
                                    value={status}
                                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                >
                                    <option value="">All Status</option>
                                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* PATTERN */}
                            <div className="flex flex-col">
                                {/* <label className="text-xs font-medium text-gray-600 mb-1">Pattern</label> */}
                                <select
                                    className="h-9 min-w-[160px] border  px-2 text-sm"
                                    value={pattern}
                                    onChange={(e) => {
                                        setPattern(e.target.value);
                                        setRangeFrom("");
                                        setRangeTo("");
                                        setDropoffFrom("");
                                        setDropoffTo("");
                                        setReturnFrom("");
                                        setReturnTo("");
                                        setPage(1);
                                    }}
                                >
                                    <option value="booked">All Dates</option>
                                    <option value="booked">Booked Date</option>
                                    <option value="depart">Depart</option>
                                    <option value="return">Return</option>
                                </select>
                            </div>
                            {pattern === "booked" && (
                                <>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">

                                        <Input
                                            type="date"
                                            className="h-9 text-sm w-40 sm:w-30 cursor-pointer"
                                            value={rangeFromDisplay}
                                            onChange={(e) => {
                                                setRangeFromDisplay(e.target.value); // UI
                                                setRangeFrom(e.target.value);        // filter
                                                setPage(1);
                                            }}
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">

                                        <Input
                                            type="date"
                                            className="h-9 text-sm w-40 sm:w-30 cursor-pointer"
                                            value={rangeToDisplay}
                                            onChange={(e) => {
                                                setRangeToDisplay(e.target.value);
                                                setRangeTo(e.target.value);
                                                setPage(1);
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {pattern === "depart" && (
                                <>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">

                                        <Input
                                            type="date"
                                            className="h-9 text-sm w-40 sm:w-30 cursor-pointer"
                                            value={dropoffFromDisplay}
                                            onChange={(e) => {
                                                setDropoffFromDisplay(e.target.value); // UI
                                                setDropoffFrom(e.target.value);        // filter
                                                setPage(1);
                                            }}
                                            onClick={(e) => e.currentTarget.showPicker?.()}
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">

                                        <Input
                                            type="date"
                                            className="h-9 text-sm w-40 sm:w-30 cursor-pointer"
                                            value={dropoffToDisplay}
                                            onChange={(e) => {
                                                setDropoffToDisplay(e.target.value);
                                                setDropoffTo(e.target.value);
                                                setPage(1);
                                            }}
                                            onClick={(e) => e.currentTarget.showPicker?.()}
                                        />
                                    </div>
                                </>
                            )}

                            {pattern === "return" && (
                                <>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">

                                        <Input
                                            type="date"
                                            className="h-9 text-sm w-40 sm:w-30 cursor-pointer"
                                            value={returnFromDisplay}
                                            onChange={(e) => {
                                                setReturnFromDisplay(e.target.value);
                                                setReturnFrom(e.target.value);
                                                setPage(1);
                                            }}
                                            onClick={(e) => e.currentTarget.showPicker?.()}
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">

                                        <Input
                                            type="date"
                                            className="h-9 text-sm rounded-none w-40 sm:w-30 cursor-pointer"
                                            value={returnToDisplay}
                                            onChange={(e) => {
                                                setReturnToDisplay(e.target.value);
                                                setReturnTo(e.target.value);
                                                setPage(1);
                                            }}
                                            onClick={(e) => e.currentTarget.showPicker?.()}
                                        />
                                    </div>
                                </>
                            )}





                            {/* SEARCH */}
                            <div className="flex flex-col flex-1 min-w-[200px]">
                                {/* <label className="text-xs font-medium text-gray-600 mb-1">Search</label> */}
                                <input
                                    type="text"
                                    placeholder="Search…"
                                    className="h-9 border  px-2 text-sm w-full"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>

                            <Button
                                onClick={downloadCSV}
                                className="h-9 bg-green-600 rounded-none text-white px-3  text-sm"
                            >
                                <Download />
                            </Button>

                            <Button
                                onClick={sendBookingsCSVByEmail}
                                className="h-9 bg-blue-600 rounded-none text-white px-3 text-sm"
                                title="Email CSV"
                            >
                                <Send className="h-4 w-4" />
                            </Button>


                        </div>
                    </div>




                    {/* TABLE */}
                    <div className="overflow-x-auto border -lg w-full">
                        <Table className="w-full text-xs border-separate border-spacing-0">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">S.L</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Actions</TableHead>
                                    {/* <TableHead className="text-center bg-neutral-100 py-3 px-3">Ref No</TableHead> */}
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Full Name</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Phone</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Product</TableHead>
                                    {/* <TableHead className="text-center bg-neutral-100 py-3 px-3">Service</TableHead> */}

                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Booked On</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Drop-off</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Return</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Make / Model</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Reg No</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Color</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Quote</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Booking</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Discount</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Amount</TableHead>
                                    {/* <TableHead className="text-center bg-neutral-100 py-3 px-3">Transaction ID</TableHead> */}
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Email</TableHead>
                                    <TableHead className="text-center bg-neutral-100 py-3 px-3">Status</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>

                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={14} className="text-center py-4">
                                            Loading…
                                        </TableCell>
                                    </TableRow>
                                )}

                                {errMsg && (
                                    <TableRow>
                                        <TableCell colSpan={14} className="text-center py-4 text-red-600">
                                            {errMsg}
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && rows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={14} className="text-center py-4 text-muted-foreground">
                                            No bookings found.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && filteredRows.map((b, i) => {
                                    const sl = (page - 1) * limit + (i + 1);
                                    const editorOpen = openRowId === b.id;

                                    return (
                                        <Fragment key={b.id}>
                                            <TableRow className={getRowBgClass(b.status)}>
                                                <TableCell className="text-center py-2">{sl}</TableCell>

                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">

                                                        {/* Notes Icon */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span
                                                                    className="cursor-pointer"
                                                                    onClick={() => openNotesPopup(b)}
                                                                >
                                                                    <NotebookPen
                                                                        className={`h-3.5 w-3.5 ${b.notes && b.notes.trim() !== ""
                                                                            ? "text-red-500"
                                                                            : "text-green-600"
                                                                            }`}
                                                                    />
                                                                </span>
                                                            </TooltipTrigger>

                                                            <TooltipContent className="max-w-xs text-xs">
                                                                {b.notes && b.notes.trim() !== "" ? b.notes : "No notes"}
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        {/* Service Icon */}
                                                        {(() => {
                                                            const s = (b.service_type || "").toLowerCase().replace(/[^a-z]/g, "");

                                                            if (s.includes("meet")) {
                                                                return (
                                                                    <Handshake className="h-3.5 w-3.5 text-orange-500" />
                                                                );
                                                            }

                                                            if (s.includes("park")) {
                                                                return (
                                                                    <SquareParking className="h-3.5 w-3.5 text-blue-500" />
                                                                );
                                                            }

                                                            return <span className="text-xs">{b.service_type || "-"}</span>;
                                                        })()}

                                                        {/* Edit Icon */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <span className="cursor-pointer flex items-center justify-center rounded-md p-1 hover:bg-gray-100 transition">
                                                                    {editorOpen ? (
                                                                        <X className="h-3.5 w-3.5 text-gray-600" />
                                                                    ) : (
                                                                        <Pencil className="h-3.5 w-3.5 text-blue-600" />
                                                                    )}
                                                                </span>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent
                                                                align="start"
                                                                sideOffset={6}
                                                                className="min-w-[170px]  border bg-white shadow-lg p-1"
                                                            >
                                                                {/* Amend Booking */}
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setEditMode("amend");
                                                                        openEdit(b);
                                                                    }}
                                                                    className="flex items-center gap-2 px-3 py-2"
                                                                >
                                                                    <FileEdit className="h-4 w-4 text-blue-600" />
                                                                    Amend Booking
                                                                </DropdownMenuItem>

                                                                {/* Extend Booking */}
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setEditMode("extend");
                                                                        openEdit(b);
                                                                    }}
                                                                    className="flex items-center gap-2 px-3 py-2"
                                                                >
                                                                    <Clock className="h-4 w-4 text-emerald-600" />
                                                                    Extend Booking
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>


                                                        {/* Delete Icon */}
                                                        <span
                                                            onClick={() => openCancelPopup(b)}
                                                            className="cursor-pointer"
                                                            title="Cancel / Delete"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                                        </span>




                                                    </div>
                                                </TableCell>



                                                {/* <TableCell className="text-center">{b.ref_no}</TableCell> */}
                                                <TableCell className="text-center">{b.customer_name}</TableCell>
                                                <TableCell className="text-center">{b.contact_no || '-'}</TableCell>
                                                <TableCell className="text-center">{b.product_name}</TableCell>
                                                {/* <TableCell className="text-center">{b.service_type}</TableCell> */}

                                                <TableCell className="text-center">{fmtDT(b.booked_on)}</TableCell>
                                                <TableCell className="text-center">{fmtDT(b.dropoff_datetime)}</TableCell>
                                                <TableCell className="text-center">{fmtDT(b.return_datetime)}</TableCell>
                                                <TableCell className="text-center">{`${b.make_model} / ${b.model}`}</TableCell>
                                                <TableCell className="text-center">{b.vehicle_reg_no || '-'}</TableCell>
                                                <TableCell className="text-center">{b.color || '-'}</TableCell>
                                                <TableCell className="text-center">{money(b.quote_amount)}</TableCell>
                                                <TableCell className="text-center">{money(b.booking_fee)}</TableCell>
                                                <TableCell className="text-center">{money(b.discount)}</TableCell>
                                                <TableCell className="text-center">{money(b.total_payable)}</TableCell>
                                                <TableCell className="text-center">
                                                    <span
                                                        onClick={() => sendBooking(b.id)}
                                                        className="cursor-pointer"
                                                        title="Send Email"
                                                    >
                                                        <Send
                                                            className={`h-3.5 w-3.5 ${emailStatus[b.id] === 1
                                                                ? "text-green-900"   // ✅ sent
                                                                : "text-red-900"     // ❌ not sent
                                                                }`}
                                                        />
                                                    </span>
                                                </TableCell>

                                                {/* <TableCell className="text-center">{b.transaction_id}</TableCell> */}

                                                {/* ✅ UPDATED STATUS COLUMN — SAME COLORS AS REPORT */}
                                                <TableCell className="text-center py-3 px-3">

                                                    <span
                                                        className={`inline-flex  px-2 py-0.5 text-[10px] font-medium
                            ${b.status === 'Active'
                                                                ? 'bg-emerald-800 text-white'
                                                                : b.status === 'Cancelled'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : b.status === 'Completed'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : b.status === 'pending'
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : b.status === 'Refunded'
                                                                                ? 'bg-pink-100 text-pink-800'

                                                                                : b.status === 'No Show'
                                                                                    ? 'bg-blue-100 text-blue-800'
                                                                                    : b.status === "pending" || b.status === "Pending"
                                                                                        ? 'bg-yellow-100 text-gray-800'
                                                                                        : 'bg-neutral-200 text-neutral-700'
                                                            }
                          `}
                                                    >
                                                        {b.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>

                                            {/* INLINE EDITOR */}
                                            {editMode === "amend" && openRowId === b.id && (<TableRow className="bg-neutral-50">
                                                <TableCell colSpan={17} className="p-0">

                                                    <div className="bg-white border border-neutral-200 shadow-sm p-6 w-full">

                                                        {/* HEADER */}
                                                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-5 gap-2">
                                                            <h3 className="font-semibold text-sm">
                                                                Amend Parking Booking{" "}
                                                                <span className="text-primary">{b.ref_no}</span>
                                                            </h3>

                                                            <span className="text-xs text-neutral-500">
                                                                Dates & price are locked
                                                            </span>
                                                        </div>

                                                        {/* GRID */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">

                                                            {/* ================= BOOKING DETAILS (LOCKED) ================= */}
                                                            <div className="border border-neutral-200 bg-white p-4 rounded">
                                                                <h4 className="text-sm font-semibold text-neutral-800 mb-4">
                                                                    Booking Details
                                                                </h4>

                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block mb-1 text-xs">Drop-off Date & Time</label>
                                                                        <Input
                                                                            type="datetime-local"
                                                                            className="h-9 text-sm bg-gray-100 cursor-not-allowed"
                                                                            value={form.drop_off_date}
                                                                            disabled
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1 text-xs">Return Date & Time</label>
                                                                        <Input
                                                                            type="datetime-local"
                                                                            className="h-9 text-sm bg-gray-100 cursor-not-allowed"
                                                                            value={form.return_date}
                                                                            disabled
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1 text-xs">Total Payable (£)</label>
                                                                        <Input
                                                                            type="number"
                                                                            className="h-9 text-sm bg-gray-100 cursor-not-allowed"
                                                                            value={form.total_payable}
                                                                            disabled
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1 text-xs">Status</label>
                                                                        <select
                                                                            className="h-9 w-full border px-2 text-sm"
                                                                            value={form.status}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, status: e.target.value }))
                                                                            }
                                                                        >
                                                                            {STATUSES.map((s) => (
                                                                                <option key={s}>{s}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* ================= CUSTOMER DETAILS ================= */}
                                                            <div className="border border-neutral-200 bg-white p-4 rounded">
                                                                <h4 className="text-sm font-semibold text-neutral-800 mb-4">
                                                                    Customer Details
                                                                </h4>

                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block mb-1 text-xs">First Name</label>
                                                                        <Input
                                                                            className="h-9 text-sm"
                                                                            value={form.first_name}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, first_name: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1 text-xs">Last Name</label>
                                                                        <Input
                                                                            className="h-9 text-sm"
                                                                            value={form.last_name}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, last_name: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1 text-xs">Mobile</label>
                                                                        <Input
                                                                            className="h-9 text-sm"
                                                                            value={form.mobile}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, mobile: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1 text-xs">Email</label>
                                                                        <Input
                                                                            className="h-9 text-sm"
                                                                            value={form.email}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, email: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* ================= VEHICLE DETAILS ================= */}
                                                            <div className="border border-neutral-200 bg-white p-4 rounded">
                                                                <h4 className="text-sm font-semibold text-neutral-800 mb-4">
                                                                    Vehicle Details
                                                                </h4>

                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block mb-1 text-xs">Make</label>
                                                                        <Input
                                                                            className="h-9 text-sm"
                                                                            value={form.vehicle_make}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, vehicle_make: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1 text-xs">Model</label>
                                                                        <Input
                                                                            className="h-9 text-sm"
                                                                            value={form.vehicle_model}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, vehicle_model: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1 text-xs">Colour</label>
                                                                        <Input
                                                                            className="h-9 text-sm"
                                                                            value={form.vehicle_colour}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, vehicle_colour: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1 text-xs">Registration</label>
                                                                        <Input
                                                                            className="h-9 text-sm"
                                                                            value={form.vehicle_registration}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, vehicle_registration: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>


                                                        </div>

                                                        {/* SAVE MESSAGE */}
                                                        {saveMsg && (
                                                            <p className="text-xs text-muted-foreground mt-3">{saveMsg}</p>
                                                        )}

                                                        {/* ACTION BUTTONS */}
                                                        <div className="flex justify-end gap-2 mt-5">
                                                            <Button
                                                                size="sm"
                                                                className="h-8 px-4 text-xs"
                                                                onClick={() => saveEdit(b.id)}
                                                                disabled={saving}
                                                            >
                                                                {saving ? "Saving…" : "Save Changes"}
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 px-4 text-xs"
                                                                onClick={() => setOpenRowId(null)}
                                                                disabled={saving}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>

                                                    </div>
                                                </TableCell>
                                            </TableRow>)}

                                            {editMode === "extend" && openRowId === b.id && (
                                                <TableRow className="bg-emerald-50">
                                                    <TableCell colSpan={17} className="p-0">
                                                        <div className="bg-white border border-emerald-200 shadow-sm p-6 w-full">

                                                            {/* HEADER */}
                                                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-2">
                                                                <h3 className="font-semibold text-sm text-emerald-700">
                                                                    Extend Booking <span className="text-emerald-600">{b.ref_no}</span>
                                                                </h3>

                                                                <span className="text-xs text-neutral-500">
                                                                    Price recalculates automatically when return date changes
                                                                </span>
                                                            </div>

                                                            {/* GRID */}
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                                                {/* EXTENSION DETAILS */}
                                                                <div className="border border-emerald-200 bg-white p-5 md:col-span-2">
                                                                    <h4 className="text-sm font-semibold text-emerald-700 mb-4">
                                                                        Extension Details
                                                                    </h4>

                                                                    <div className="space-y-4">

                                                                        {/* DROP-OFF */}
                                                                        <div>
                                                                            <label className="block text-xs mb-1">Drop-off Date & Time</label>
                                                                            <Input
                                                                                type="datetime-local"
                                                                                className="h-9 text-sm bg-gray-100 cursor-not-allowed"
                                                                                value={form.drop_off_date}
                                                                                readOnly
                                                                            />
                                                                        </div>

                                                                        {/* RETURN DATE */}
                                                                        <div>
                                                                            <label className="block text-xs mb-1">New Return Date & Time</label>
                                                                            <Input
                                                                                type="datetime-local"
                                                                                className="h-9 text-sm"
                                                                                value={form.return_date}
                                                                                onChange={(e) => {
                                                                                    const v = e.target.value;

                                                                                    setForm((f) => ({ ...f, return_date: v }));

                                                                                    const sqlDate = toSqlDateTimeSafe(v);
                                                                                    if (!sqlDate) return;

                                                                                    calculateExtendPrice(b.id, sqlDate);
                                                                                }}
                                                                            />

                                                                            {extendLoading && (
                                                                                <p className="text-[11px] text-blue-600 mt-1">
                                                                                    Calculating updated price…
                                                                                </p>
                                                                            )}

                                                                            {extendError && (
                                                                                <p className="text-[11px] text-red-600 mt-1">
                                                                                    {extendError}
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        {/* FINAL TOTAL */}
                                                                        <div>
                                                                            <label className="block text-xs mb-1">Final Total Payable (£)</label>
                                                                            <Input
                                                                                type="number"
                                                                                className="h-9 text-sm bg-gray-100 cursor-not-allowed"
                                                                                value={String(n0(form.total_payable))}
                                                                                readOnly
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* PRICE BREAKDOWN */}
                                                                <div className="border border-neutral-200 bg-gray-50 p-5">
                                                                    <h4 className="text-sm font-semibold mb-3">Price Breakdown</h4>

                                                                    {!extendPreview ? (
                                                                        <p className="text-xs text-neutral-500">
                                                                            Change return date to calculate pricing
                                                                        </p>
                                                                    ) : (
                                                                        <div className="text-xs space-y-1">
                                                                            <div className="flex justify-between">
                                                                                <span>Old Quote</span>
                                                                                <span>£{Number(b.quote_amount).toFixed(2)}</span>
                                                                            </div>

                                                                            <div className="flex justify-between">
                                                                                <span>Extra Days</span>
                                                                                <span>{extendPreview.extra_days}</span>
                                                                            </div>

                                                                            <div className="flex justify-between">
                                                                                <span>Extend / Day</span>
                                                                                <span>£{extendPreview.extend_charge_per_day}</span>
                                                                            </div>

                                                                            <div className="flex justify-between">
                                                                                <span>Extra Charge</span>
                                                                                <span>£{extendPreview.extra_charge}</span>
                                                                            </div>

                                                                            <div className="flex justify-between font-medium border-t pt-1">
                                                                                <span>New Quote</span>
                                                                                <span>£{extendPreview.new_quote}</span>
                                                                            </div>

                                                                            <div className="flex justify-between">
                                                                                <span>Booking Fee</span>
                                                                                <span>£{Number(b.booking_fee).toFixed(2)}</span>
                                                                            </div>

                                                                            <div className="flex justify-between">
                                                                                <span>Cancellation Cover</span>
                                                                                <span>£{Number(b.cancellation_cover).toFixed(2)}</span>
                                                                            </div>

                                                                            <div className="flex justify-between">
                                                                                <span>Discount</span>
                                                                                <span>-£{Number(b.discount).toFixed(2)}</span>
                                                                            </div>

                                                                            <div className="flex justify-between">
                                                                                <span>Admin Charge</span>
                                                                                <span>£{extendPreview.admin_charge}</span>
                                                                            </div>

                                                                            <div className="flex justify-between font-semibold border-t pt-1 text-emerald-700">
                                                                                <span>Final Total</span>
                                                                                <span>£{extendPreview.new_total_payable}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* ACTIONS */}
                                                            <div className="flex justify-end gap-2 mt-6">
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-emerald-600 hover:bg-emerald-700"
                                                                    onClick={() => saveExtension(b.id)}
                                                                    disabled={saving || extendLoading}
                                                                >
                                                                    Save Extension
                                                                </Button>


                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setOpenRowId(null);
                                                                        setEditMode(null);
                                                                        setExtendPreview(null);
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>

                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}







                                        </Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINATION */}
                    {/* PAGINATION */}
                    <div className="flex justify-center items-center gap-3 py-4 text-xs">

                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border  disabled:opacity-50"
                        >
                            Prev
                        </button>

                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setPage(index + 1)}
                                className={`px-3 py-1 border 
        ${page === index + 1 ? "bg-blue-600 text-white" : ""}
      `}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>


                </div>
            </div>
        </ProtectedRoute>
    );
}
