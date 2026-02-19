'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotebookPen, StickyNote, Pencil, Trash2, X, Handshake, SquareParking } from 'lucide-react';

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import { Lightbulb } from 'lucide-react';
import { Download } from 'lucide-react';


/* ---------- ENUM options from SQL ---------- */
const SOURCES = ['Supplier', 'Website'] as const;
const AIRPORTS = ['LHR', 'LGW', 'STN', 'LTN', 'MAN', 'BHX', 'Other'] as const;
const SERVICES = ['meet greet', 'park ride'] as const;
const STATUSES = ['Active', 'Cancelled', 'Completed', 'No Show', 'Refunded'] as const;

/* ---------- Types ---------- */
type Booking = {
    id: number;
    ref_no: string;
    source: string;
    supplier_name: string;
    airport: string;
    service_type: string;
    customer_name: string;
    contact_no: string | null;
    customer_email: string | null;
    booked_on: string;
    booked_at?: string;
    dropoff_datetime: string;
    return_datetime: string;
    vehicle_reg_no: string | null;
    price: number;
    status: string;
    notes: string | null;
    airport_alias: string | null;
    make_model: string;
    model: string;
    color: string;
    no_of_days: string | null;
    quote_price: number | null;
    paid_price: number | null;   // ✅ ADD THIS: number | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE_CRUD = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ---------- Helpers ---------- */
function getCookie(name: string) {
    const m = typeof document !== 'undefined'
        ? document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
        : null;
    return m ? m.pop() : '';
}

function safeGetCookie(name: string) {
    if (typeof document === 'undefined') return '';
    const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
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
    if (s === 'active') return 'bg-emerald-50';
    if (s === 'cancelled') return 'bg-red-50';
    if (s === 'completed') return 'bg-blue-50';
    if (s === 'pending') return 'bg-yellow-50';
    if (s === 'refunded') return 'bg-pink-50';
    if (s === 'no show') return 'bg-gray-50';
    return 'bg-neutral-50';
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



    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [total, setTotal] = useState(0);

    /* ---------- Filters ---------- */
    const [status, setStatus] = useState('');
    const [airport, setAirport] = useState('');
    const [source, setSource] = useState('');
    const [service_type, setService] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const [selectedDate, setSelectedDate] = useState("");
    const [departDate, setDepartDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [rangeFrom, setRangeFrom] = useState("");
    const [rangeTo, setRangeTo] = useState("");

    const [editTab, setEditTab] = useState("booking");

    const [pattern, setPattern] = useState("booked");

    const [dropoffFrom, setDropoffFrom] = useState("");
    const [dropoffTo, setDropoffTo] = useState("");
    const [returnFrom, setReturnFrom] = useState("");
    const [returnTo, setReturnTo] = useState("");



    /* ---------- Inline Editing ---------- */
    const [openRowId, setOpenRowId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    type EditForm = {
        first_name: string,
        last_name: string,
        contact_no: string;
        customer_email: string;
        vehicle_reg_no: string;
        airport: string;
        status: string;
        dropoff_datetime: string;
        return_datetime: string;
        notes: string;
        make_model: string,
        model: string;
        color: string;
        no_of_days: number;      // number
        quote_price: number;     // number
        paid_price: number;      // number
        price: number;           // ALSO convert price to number
    };
    const [form, setForm] = useState<EditForm>({
        first_name: "",
        last_name: "",
        contact_no: '',
        customer_email: '',
        vehicle_reg_no: '',
        airport: '',
        status: 'Active',
        dropoff_datetime: '',
        return_datetime: '',
        notes: '',
        make_model: '',
        model: '',
        color: '',
        no_of_days: 0,
        quote_price: 0,
        paid_price: 0,
        price: 0,

    });

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

    /* ===========================================================
       FETCH DATA
    =========================================================== */
    const fetchData = async () => {
        setLoading(true);
        setErrMsg('');

        try {
            const authToken =
                (typeof window !== 'undefined' &&
                    (localStorage.getItem('authToken') || getCookie('token'))) ||
                '';

            const qs = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sortBy: 'booked_on',
                sortOrder: 'desc',
            });

            // if (selectedDate) qs.set("booking_date", selectedDate);
            // if (departDate) qs.set("depart_date", departDate);
            // if (returnDate) qs.set("return_date", returnDate);
            // if (rangeFrom) qs.set("range_from", rangeFrom);
            // if (rangeTo) qs.set("range_to", rangeTo);
            // if (search && search.trim()) qs.set("search", search.trim());



            // if (status) qs.set('status', status);
            // if (airport) qs.set('airport', airport);
            // if (source) qs.set('source', source);
            // if (service_type) qs.set('service_type', service_type);
            // if (from) qs.set('from', from);
            // if (to) qs.set('to', to);

            const res = await fetch(
                `${API_BASE_URL}/api/bookings/supplierData?${qs.toString()}`,
                {
                    cache: 'no-store',
                    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
                }
            );

            if (!res.ok) throw new Error(await res.text());

            const json = await res.json();
            const data: Booking[] = json.data || [];

            setRows(data);
            setTotal(json.total);
        } catch (e) {
            console.error(e);
            setErrMsg('Failed to load bookings.');
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
        selectedDate,
        departDate,
        returnDate,
        rangeFrom,
        rangeTo,
        search
    ]);

    function downloadCSV() {
        const headers = Object.keys(rows[0] || {}).join(",");

        const csv = filteredRows.map(b =>
            Object.values(b)
                .map(v => `"${String(v).replace(/"/g, '""')}"`)
                .join(",")
        );

        const blob = new Blob([headers + "\n" + csv.join("\n")], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.setAttribute("download", "bookings.csv");
        a.click();
    }


    /* ===========================================================
       EDIT HANDLERS
    =========================================================== */
    const openEdit = (b: Booking) => {
        if (openRowId === b.id) {
            setOpenRowId(null);
            setSaveMsg('');
            return;
        }
        setOpenRowId(b.id);
        setSaveMsg('');
        setForm({
            first_name: b.customer_name?.split(" ")[0] || "",
            last_name: b.customer_name?.split(" ").slice(1).join(" ") || "",
            contact_no: b.contact_no || '',
            customer_email: b.customer_email || '',
            vehicle_reg_no: b.vehicle_reg_no || '',
            airport: b.airport || '',
            status: b.status || 'Active',
            dropoff_datetime: toLocalInputValue(b.dropoff_datetime),
            return_datetime: toLocalInputValue(b.return_datetime),
            notes: b.notes || '',
            make_model: b.make_model || '',
            model: b.model || '',
            color: b.color || '',
            no_of_days: Number(b.no_of_days || 0),
            quote_price: Number(b.quote_price || 0),
            paid_price: Number(b.paid_price || 0),
            price: Number(b.price || 0)
        });
    };

    const cancelEdit = () => {
        setOpenRowId(null);
        setSaveMsg('');
    };

    const saveEdit = async (id: number): Promise<void> => {
        setSaving(true);
        setSaveMsg("Saving...");

        try {
            const token =
                (typeof window !== "undefined" &&
                    (localStorage.getItem("authToken") || safeGetCookie("token"))) || "";

            const payload = {
                customer_name: `${form.first_name} ${form.last_name}`.trim(),
                contact_no: form.contact_no,
                customer_email: form.customer_email,
                vehicle_reg_no: form.vehicle_reg_no,
                airport: form.airport,
                status: form.status,
                dropoff_datetime: toSqlDateTime(form.dropoff_datetime),
                return_datetime: toSqlDateTime(form.return_datetime),
                notes: form.notes,
                make_model: form.make_model,
                color: form.color,
                model: form.model,
                no_of_days: Number(form.no_of_days),
                quote_price: Number(form.quote_price),
                paid_price: Number(form.paid_price),
                price: Number(form.price)
            };

            const res = await fetch(
                `${API_BASE_CRUD}/api/supplier/update/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || "Update failed");
            }

            await res.json();
            setSaveMsg("Saved ✓");

            await fetchData();

            setTimeout(() => {
                setSaveMsg("");
                setOpenRowId(null);
            }, 1000);

        } catch (err) {
            setSaveMsg("Save error");
        }

        setSaving(false);
    };

    const deleteRow = async (b: Booking) => {
        if (!confirm(`Delete supplier booking ${b.ref_no}? This cannot be undone.`)) return;

        try {
            // Auth token (localStorage or cookie)
            const token =
                (typeof window !== "undefined" &&
                    (localStorage.getItem("authToken") || safeGetCookie("token"))) ||
                "";

            // Send DELETE request
            const res = await fetch(`${API_BASE_CRUD}/delete/supplier/${b.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            // API error handling
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || `Delete failed (status ${res.status})`);
            }

            // Close open edit row if same row
            if (openRowId === b.id) cancelEdit();

            // Refresh data table
            await fetchData();

            alert("Supplier booking deleted successfully.");
        } catch (err: any) {
            alert(err?.message || "Delete failed");
        }
    };

    function calculateDays(drop: string, ret: string): number {
        if (!drop || !ret) return 0;

        const d1 = new Date(drop);
        const d2 = new Date(ret);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;

        // difference in ms
        const diff = d2.getTime() - d1.getTime();

        if (diff < 0) return 0;

        // convert → days + include both dates
        return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    /* ===========================================================
       RENDER
    =========================================================== */
    return (
        <div className="w-full min-h-screen px-3 md:px-1">
            <div className="w-full pt-4">

                <div className="text-xs text-muted-foreground mb-3">
                    <span className="font-semibold">Supplier Bookings</span> —{' '}
                    <span className="font-medium">{total}</span> total
                </div>

                {/* FILTER BAR */}
                <div className="mb-2 w-full border-b pb-2">
                    <div className="flex flex-wrap items-end gap-3">


                        {/* Service */}
                        <div className="flex flex-col">
                            {/* <label className="text-xs font-medium text-gray-600 mb-1">Source</label> */}
                            <select
                                className="h-9 min-w-[150px] border rounded-md px-2 text-sm"
                                value={service_type}
                                onChange={(e) => { setService(e.target.value); setPage(1); }}
                            >
                                <option value="">All Services</option>
                                {SERVICES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* STATUS */}
                        <div className="flex flex-col">
                            {/* <label className="text-xs font-medium text-gray-600 mb-1">Status</label> */}
                            <select
                                className="h-9 min-w-[150px] border rounded-md px-2 text-sm"
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
                                className="h-9 min-w-[160px] border rounded-md px-2 text-sm"
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
                                <option value="cancelled">Cancellation Date</option>
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
                                        value={rangeFrom}
                                        onChange={(e) => { setRangeFrom(e.target.value); setPage(1); }}
                                        onClick={(e) => {
                                            const input = e.currentTarget as HTMLInputElement;
                                            input.showPicker?.();
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">

                                    <Input
                                        type="date"
                                        className="h-9 text-sm w-40 sm:w-30 cursor-pointer"
                                        value={rangeTo}
                                        onChange={(e) => { setRangeTo(e.target.value); setPage(1); }}
                                        onClick={(e) => {
                                            const input = e.currentTarget as HTMLInputElement;
                                            input.showPicker?.();
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
                                        value={dropoffFrom}
                                        onChange={(e) => { setDropoffFrom(e.target.value); setPage(1); }}
                                        onClick={(e) => {
                                            const input = e.currentTarget as HTMLInputElement;
                                            input.showPicker?.();
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">

                                    <Input
                                        type="date"
                                        className="h-9 text-sm w-40 sm:w-30 cursor-pointer"
                                        value={dropoffTo}
                                        onChange={(e) => { setDropoffTo(e.target.value); setPage(1); }}
                                        onClick={(e) => {
                                            const input = e.currentTarget as HTMLInputElement;
                                            input.showPicker?.();
                                        }}
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
                                        value={returnFrom}
                                        onChange={(e) => { setReturnFrom(e.target.value); setPage(1); }}
                                        onClick={(e) => {
                                            const input = e.currentTarget as HTMLInputElement;
                                            input.showPicker?.();
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">

                                    <Input
                                        type="date"
                                        className="h-9 text-sm w-40 sm:w-30 cursor-pointer"
                                        value={returnTo}
                                        onChange={(e) => { setReturnTo(e.target.value); setPage(1); }}
                                        onClick={(e) => {
                                            const input = e.currentTarget as HTMLInputElement;
                                            input.showPicker?.();
                                        }}
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
                                className="h-9 border rounded-md px-2 text-sm w-full"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>

                        <Button
                            onClick={downloadCSV}
                            className="h-9 bg-green-600 text-white px-3 rounded text-sm"
                        >
                            <Download />
                        </Button>


                    </div>
                </div>





                {/* TABLE */}
                <div className="overflow-x-auto border rounded-lg w-full">
                    <Table className="w-full text-xs border-separate border-spacing-0">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center bg-neutral-100">S.L</TableHead>
                                <TableHead className="text-center bg-neutral-100">Actions</TableHead>
                                {/* <TableHead className="text-center bg-neutral-100">Ref No</TableHead> */}
                                <TableHead className="text-center bg-neutral-100">Full Name</TableHead>
                                <TableHead className="text-center bg-neutral-100">Supplier Name</TableHead>
                                <TableHead className="text-center bg-neutral-100">Phone</TableHead>
                                {/* <TableHead className="text-center bg-neutral-100">Airport</TableHead> */}
                                <TableHead className="text-center bg-neutral-100">Make / Model</TableHead>
                                <TableHead className="text-center bg-neutral-100">Color</TableHead>
                                <TableHead className="text-center bg-neutral-100">Booked On</TableHead>
                                <TableHead className="text-center bg-neutral-100">Drop-off</TableHead>
                                <TableHead className="text-center bg-neutral-100">Return</TableHead>
                                <TableHead className="text-center bg-neutral-100">Reg No</TableHead>
                                <TableHead className="text-center bg-neutral-100">Amount</TableHead>
                                <TableHead className="text-center bg-neutral-100">Status</TableHead>
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
                                                <div className="flex items-center justify-center gap-1">

                                                    {/* Service Icon */}
                                                    {(() => {
                                                        const s = b.service_type || "";
                                                        const lower = s.toLowerCase();

                                                        if (lower.startsWith("meet")) {
                                                            return (
                                                                <Button size="icon" variant="ghost">
                                                                    <Handshake className="h-3.5 w-3.5 text-orange-500" />
                                                                </Button>
                                                            );
                                                        }
                                                        if (lower.startsWith("park")) {
                                                            return (
                                                                <Button size="icon" variant="ghost">
                                                                    <SquareParking className="h-3.5 w-3.5 text-blue-500" />
                                                                </Button>
                                                            );
                                                        }
                                                        return <span className="text-xs">{s || "-"}</span>;
                                                    })()}

                                                    {/* Edit Button */}
                                                    <Button size="icon" variant="ghost" className="h-5 w-5 p-0" onClick={() => openEdit(b)}>
                                                        {editorOpen ? (
                                                            <X className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>

                                                    {/* Delete Button */}
                                                    <Button size="icon" variant="ghost" onClick={() => deleteRow(b)}>
                                                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                                    </Button>

                                                    {/* Notes Button */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-5 w-5 p-0"
                                                            >

                                                                <Lightbulb
                                                                    className={`h-3.5 w-3.5 ${b.notes && b.notes.trim() !== "" ? "text-red-500" : "text-green-600"
                                                                        }`}
                                                                />
                                                            </Button>
                                                        </TooltipTrigger>

                                                        <TooltipContent className="max-w-xs text-xs">
                                                            {b.notes && b.notes.trim() !== "" ? b.notes : "No notes"}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>



                                            {/* <TableCell className="text-center">{b.ref_no}</TableCell> */}
                                            <TableCell className="text-center">{b.customer_name}</TableCell>
                                            <TableCell className="text-center">{b.supplier_name}</TableCell>
                                            <TableCell className="text-center">{b.contact_no || '-'}</TableCell>
                                            {/* <TableCell className="text-center">{b.airport}</TableCell> */}
                                            <TableCell className="text-center">{`${b.make_model} / ${b.model}`}</TableCell>
                                            <TableCell className="text-center">{b.color || '-'}</TableCell>
                                            <TableCell className="text-center">{fmtDT(b.booked_on)}</TableCell>
                                            <TableCell className="text-center">{fmtDT(b.dropoff_datetime)}</TableCell>
                                            <TableCell className="text-center">{fmtDT(b.return_datetime)}</TableCell>

                                            <TableCell className="text-center">{b.vehicle_reg_no || '-'}</TableCell>
                                            <TableCell className="text-center">{money(b.price)}</TableCell>

                                            {/* ✅ UPDATED STATUS COLUMN — SAME COLORS AS REPORT */}
                                            <TableCell className="text-center">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium
                            ${b.status === 'Active'
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
                                                                                : 'bg-neutral-200 text-neutral-700'
                                                        }
                          `}
                                                >
                                                    {b.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>

                                        {/* INLINE EDITOR */}

                                        {/* INLINE EDITOR */}
                                        {editorOpen && (
                                            <TableRow key={`edit-${b.id}`} className="bg-neutral-50/60">
                                                <TableCell colSpan={13} className="p-4">

                                                    <div className="rounded-lg border bg-white p-4 text-xs space-y-4">

                                                        {/* TITLE */}
                                                        <div className="font-semibold text-sm">
                                                            Edit Booking <span className="text-primary">{b.ref_no}</span>
                                                        </div>

                                                        {/* THREE PANEL LAYOUT */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                                            {/* PANEL 1 — BOOKING DETAILS */}
                                                            <div className="border rounded-md p-3 bg-white">
                                                                <div className="font-medium mb-2 text-[13px]">Booking Details</div>

                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <label className="block mb-1">Drop-off</label>
                                                                        <Input
                                                                            type="datetime-local"
                                                                            className="h-8 text-xs"
                                                                            value={form.dropoff_datetime}
                                                                            onChange={(e) => {
                                                                                const newDrop = e.target.value;
                                                                                setForm((f) => ({
                                                                                    ...f,
                                                                                    dropoff_datetime: newDrop,
                                                                                    no_of_days: calculateDays(newDrop, form.return_datetime)
                                                                                }));
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1">Return</label>
                                                                        <Input
                                                                            type="datetime-local"
                                                                            className="h-8 text-xs"
                                                                            value={form.return_datetime}
                                                                            onChange={(e) => {
                                                                                const newReturn = e.target.value;
                                                                                setForm((f) => ({
                                                                                    ...f,
                                                                                    return_datetime: newReturn,
                                                                                    no_of_days: calculateDays(form.dropoff_datetime, newReturn)
                                                                                }));
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1">No Of Days</label>
                                                                        <Input
                                                                            className="h-8 text-xs"
                                                                            value={form.no_of_days}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, no_of_days: Number(e.target.value) }))
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* PANEL 2 — CUSTOMER DETAILS */}
                                                            <div className="border rounded-md p-3 bg-white">
                                                                <div className="font-medium mb-2 text-[13px]">Customer Details</div>

                                                                <div className="space-y-3">

                                                                    <div>
                                                                        <label className="block mb-1">First Name</label>
                                                                        <Input
                                                                            className="h-8 text-xs"
                                                                            value={form.first_name}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, first_name: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1">Last Name</label>
                                                                        <Input
                                                                            className="h-8 text-xs"
                                                                            value={form.last_name}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, last_name: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1">Contact No</label>
                                                                        <Input
                                                                            className="h-8 text-xs"
                                                                            value={form.contact_no}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, contact_no: e.target.value }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                </div>
                                                            </div>

                                                            {/* PANEL 3 — PRICING DETAILS */}
                                                            <div className="border rounded-md p-3 bg-white">
                                                                <div className="font-medium mb-2 text-[13px]">Pricing</div>

                                                                <div className="space-y-3">

                                                                    <div>
                                                                        <label className="block mb-1">Quote Price</label>
                                                                        <Input
                                                                            className="h-8 text-xs"
                                                                            value={form.quote_price}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, quote_price: Number(e.target.value) }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1">Paid Price</label>
                                                                        <Input
                                                                            className="h-8 text-xs"
                                                                            value={form.paid_price}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, paid_price: Number(e.target.value) }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="block mb-1">Price</label>
                                                                        <Input
                                                                            className="h-8 text-xs"
                                                                            value={form.price}
                                                                            onChange={(e) =>
                                                                                setForm((f) => ({ ...f, price: Number(e.target.value) }))
                                                                            }
                                                                        />
                                                                    </div>

                                                                </div>
                                                            </div>

                                                        </div>

                                                        {/* SAVE MESSAGE */}
                                                        {saveMsg && (
                                                            <div className="text-[11px] text-muted-foreground">{saveMsg}</div>
                                                        )}

                                                        {/* SAVE / CANCEL BUTTONS (BOTTOM RIGHT) */}
                                                        <div className="flex justify-end gap-2 pt-2">
                                                            <Button
                                                                size="sm"
                                                                className="h-7 px-4 text-xs"
                                                                onClick={() => saveEdit(b.id)}
                                                                disabled={saving}
                                                            >
                                                                {saving ? "Saving…" : "Save"}
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 px-4 text-xs"
                                                                onClick={cancelEdit}
                                                                disabled={saving}
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
                {/* PAGINATION (same style as website settings) */}
                <div className="flex justify-center items-center gap-3 py-4">

                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setPage(index + 1)}
                            className={`px-3 py-1 border rounded 
        ${page === index + 1 ? "bg-blue-600 text-white" : ""}
      `}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>

                </div>


            </div>
        </div>
    );
}
