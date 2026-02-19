"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SquareParking, Handshake, Pencil } from "lucide-react";
import { DollarSign } from 'lucide-react';
import { Check, X, Eye } from 'lucide-react';
import { Trash2, Clock } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/app/lib/apiFetch";
import RichTextEditor from "@/components/RichTextEditor";



const STATUSES = ['Active', 'Inactive'] as const;
const FLEXIBILITY = ['Refundable', 'Non-Refundable'] as const;
const SERVICES = ['Meet & Greet', 'Park & Ride'] as const;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Product = {
    id: number;
    airport_name: string;
    service_provider: string;
    product_name: string;
    // airport_number: string;
    booking_email: string;
    airport_charges: string;
    operational_from: string;
    operational_to: string;
    book_short_hours: string;
    commission: string;
    product_extra: string;
    nonflex: string;
    service_type: string;
    recommended: string;

    airport_duty_number: string;
    edit_short_hours: number;
    cancel_short_hours: number;
    promocodes_applicable: string;


    // WEBSITE
    product_description: string;
    product_overview: string;
    dropoff_procedure: string;
    return_procedure?: string;
    directions: string;
    important_information?: string;

    // EMAIL (NEW)
    email_dropoff_procedure?: string;
    email_return_procedure?: string;
    email_notes?: string;

    // POINTS
    point_1?: string;
    point_2?: string;
    point_3?: string;
    point_4?: string;
    point_5?: string;
    point_6?: string;

    is_active: number;
    status: string;
    image_data?: string;
};

// Convert "13:30" → "01:30 PM"
const formatTime12 = (time?: string) => {
    if (!time) return "-";
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
};

// const isProductOperationalNow = (
//     from?: string,
//     to?: string
// ): boolean => {
//     if (!from || !to) return false;

//     const now = new Date();

//     const [fromH, fromM] = from.split(":").map(Number);
//     const [toH, toM] = to.split(":").map(Number);

//     const fromTime = new Date();
//     fromTime.setHours(fromH, fromM, 0, 0);

//     const toTime = new Date();
//     toTime.setHours(toH, toM, 0, 0);

//     // ✅ Handles overnight ranges (e.g. 22:00 → 06:00)
//     if (fromTime <= toTime) {
//         return now >= fromTime && now <= toTime;
//     } else {
//         return now >= fromTime || now <= toTime;
//     }
// };

const getUKNow = () => {
    // Create "now" in UK time regardless of server/browser timezone
    const now = new Date();

    const ukNow = new Date(
        now.toLocaleString("en-GB", {
            timeZone: "Europe/London",
        })
    );

    return ukNow;
};

const isProductOperationalNow = (from?: string, to?: string): boolean => {
    if (!from || !to) return false;

    // Get current UK time (hours + minutes only)
    const now = new Date();
    const ukTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Europe/London" })
    );

    const nowMinutes = ukTime.getHours() * 60 + ukTime.getMinutes();

    const [fromH, fromM] = from.slice(0, 5).split(":").map(Number);
    const [toH, toM] = to.slice(0, 5).split(":").map(Number);

    const fromMinutes = fromH * 60 + fromM;
    const toMinutes = toH * 60 + toM;

    // Normal range (e.g. 04:00 → 23:45)
    if (fromMinutes <= toMinutes) {
        return nowMinutes >= fromMinutes && nowMinutes <= toMinutes;
    }

    // Overnight range (e.g. 22:00 → 06:00)
    return nowMinutes >= fromMinutes || nowMinutes <= toMinutes;
};



// Generate time options
const generateTimeOptions = () => {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
        for (const m of ["00", "15", "30", "45"]) {
            const value = `${String(h).padStart(2, "0")}:${m}`;
            options.push({ value, label: formatTime12(value) });
        }
    }
    return options;
};

// Normalize DB time to "HH:mm" (handles "HH:mm:ss", spaces, etc.)
const normalizeTimeForSelect = (time?: string) => {
    if (!time) return "";
    return time.trim().slice(0, 5); // "00:00:00" -> "00:00"
};



const TIME_OPTIONS = generateTimeOptions();


export default function ProductsListPage() {

    const [rows, setRows] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<any>({});

    const [contentTab, setContentTab] = useState<"website" | "email">("website");


    const [statusFilter, setStatusFilter] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");
    const [recommendedFilter, setRecommendedFilter] = useState("");
    const [flexFilter, setFlexFilter] = useState("");

    const [status, setStatus] = useState('');
    const [flex, setFlex] = useState('');
    const [service, setService] = useState('');

    const [airport, setAirport] = useState('');


    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);



    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 30;

    const toggleActive = async (id: number, value: number) => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/parking/products/toggle/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ is_active: value }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error(data);
                alert(data.message || "Update failed");
                return;
            }

            // Update UI immediately
            setRows(prev =>
                prev.map(p =>
                    p.id === id ? { ...p, is_active: value } : p
                )
            );
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };



    const fetchProducts = async () => {
        setLoading(true);
        setErrMsg("");

        try {
            const res = await apiFetch(
                `${API_BASE_URL}/api/parking/products`,
                { cache: "no-store" }
            );

            const json = await res.json();

            // ✅ NORMALIZE RESPONSE
            const list = Array.isArray(json)
                ? json
                : Array.isArray(json?.data)
                    ? json.data
                    : [];

            setRows(list);
        } catch (err: any) {
            console.error(err);
            setErrMsg("Failed to load products.");
            setRows([]); // IMPORTANT
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const startEdit = (p: Product) => {
        setEditingId(p.id);

        setForm({
            ...p,

            // ✅ ENSURE TIME VALUES EXIST
            operational_from: normalizeTimeForSelect(p.operational_from),
            operational_to: normalizeTimeForSelect(p.operational_to),

            airport_duty_number: p.airport_duty_number || "",
            product_extra: p.product_extra || "",
            edit_short_hours: p.edit_short_hours ?? 0,
            cancel_short_hours: p.cancel_short_hours ?? 0,
            promocodes_applicable: p.promocodes_applicable || "Yes",
        });
    };


    const saveEdit = async (id: number) => {
        const res = await fetch(`${API_BASE_URL}/api/parking/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(form),
        });

        if (!res.ok) {
            alert("Failed to update product");
            return;
        }

        // ⬇ upload image separately
        await uploadImage(id);

        alert("Updated successfully");
        setEditingId(null);
        fetchProducts();
    };




    const uploadImage = async (id: number) => {
        if (!selectedImage) return;

        const formData = new FormData();
        formData.append("image", selectedImage);

        const res = await fetch(
            `${API_BASE_URL}/api/parking/product/update-image/${id}`,
            {
                method: "PUT",
                credentials: "include",
                body: formData, // ❌ DO NOT set Content-Type
            }
        );

        if (!res.ok) {
            alert("Image upload failed");
        }
    };



    const deleteProduct = async (id: number) => {
        if (!confirm("Are you sure you want to delete?")) return;

        try {
            const res = await fetch(
                `${API_BASE_URL}/api/parking/products/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Delete failed");
            }

            alert("Deleted successfully");
            await fetchProducts();

        } catch (err: any) {
            console.error("DELETE ERROR:", err);
            alert(err.message || "Delete failed");
        }
    };



    // SEARCH
    const filteredRows: Product[] = Array.isArray(rows)
        ? rows.filter((p: Product) => {

            // 🔍 SEARCH FILTER
            if (
                !`${p.product_name} ${p.airport_name} ${p.service_provider}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
            ) {
                return false;
            }

            // ✈️ AIRPORT FILTER
            if (airport && p.airport_name !== airport) {
                return false;
            }

            // 📌 STATUS FILTER
            if (status && p.status !== status) {
                return false;
            }

            // 🔁 FLEXIBILITY FILTER
            if (flex && p.nonflex !== flex) {
                return false;
            }

            // 🅿️ SERVICE TYPE FILTER
            if (service && p.service_type !== service) {
                return false;
            }

            return true;
        })
        : [];




    // PAGINATION LOGIC
    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRows = filteredRows.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredRows.length / recordsPerPage);


    // ICON LOGIC
    const renderServiceIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes("yes")) return <Check className="h-4 w-4 text-green-600" />;
        if (t.includes("no")) return <X className="h-4 w-4 text-red-600" />;
        if (t.includes("meet")) return <Handshake className="h-4 w-4 text-orange-500" />;
        if (t.includes("park")) return <SquareParking className="h-4 w-4 text-blue-500" />;
        return <SquareParking className="h-4 w-4 text-gray-500" />;
    };

    return (
        <ProtectedRoute>
            <div className="w-full min-h-screen px-4 py-6">


                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Parking Products</h2>



                    <div className="flex items-center gap-2">

                        {/* AIRPORT FILTER */}
                        <div className="flex flex-col">
                            <select
                                className="h-9 min-w-[150px] border px-2 text-sm"
                                value={airport}
                                onChange={(e) => {
                                    setAirport(e.target.value);
                                    setCurrentPage(1); // reset pagination
                                }}
                            >
                                <option value="">All Airports</option>
                                <option value="Heathrow">Heathrow</option>
                                <option value="Gatwick">Gatwick</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <select
                                className="h-9 min-w-[150px] border  px-2 text-sm"
                                value={service}
                                onChange={(e) => { setService(e.target.value); }}
                            >
                                <option value="">All Services</option>
                                {SERVICES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>

                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-[300px] text-sm rounded-none"
                        />

                        <Button
                            className="h-8 rounded-none px-3 text-xs"
                            onClick={() => (window.location.href = "/addNewProduct")}
                        >
                            + Add Product
                        </Button>
                    </div>
                </div>



                {/* TABLE */}
                <div className="overflow-x-auto border  w-full bg-white">
                    <Table className="w-full text-xs border-separate border-spacing-0">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center bg-neutral-100">S.L</TableHead>
                                <TableHead className="text-center bg-neutral-100">Action</TableHead>
                                <TableHead className="text-center bg-neutral-100">Image</TableHead>
                                <TableHead className="text-center bg-neutral-100">Product</TableHead>
                                <TableHead className="text-center bg-neutral-100">Airport</TableHead>
                                <TableHead className="text-center bg-neutral-100">Service Type</TableHead>
                                <TableHead className="text-center bg-neutral-100">Provider</TableHead>
                                <TableHead className="text-center bg-neutral-100">Booking Email</TableHead>
                                <TableHead className="text-center bg-neutral-100">From</TableHead>
                                <TableHead className="text-center bg-neutral-100">To</TableHead>
                                {/* <TableHead className="text-center bg-neutral-100">Commission</TableHead> */}
                                <TableHead className="text-center bg-neutral-100">Flex</TableHead>
                                {/* <TableHead className="text-center bg-neutral-100">Recommended</TableHead> */}
                                <TableHead className="text-center bg-neutral-100">Manage Price</TableHead>
                                <TableHead className="text-center bg-neutral-100">
                                    Status
                                </TableHead>

                            </TableRow>
                        </TableHeader>

                        <TableBody>

                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center py-4">
                                        Loading…
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* PAGINATED ROWS */}
                            {!loading && currentRows.map((p, index) => (
                                <React.Fragment key={p.id}>
                                    <TableRow className="bg-neutral-50">
                                        <TableCell className="text-center">{indexOfFirst + index + 1}</TableCell>

                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                {renderServiceIcon(p.service_type)}

                                                {/* 🕒 OPERATIONAL STATUS ICON */}
                                                <Clock
                                                    className={`w-4 h-4 ${isProductOperationalNow(p.operational_from, p.operational_to)
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                        }`}

                                                />

                                                <Pencil
                                                    className="w-4 h-4 cursor-pointer text-black"
                                                    onClick={() => startEdit(p)}
                                                />

                                                <Trash2
                                                    className="w-4 h-4 cursor-pointer text-red-500"
                                                    onClick={() => deleteProduct(p.id)}
                                                />
                                            </div>

                                        </TableCell>

                                        <TableCell className="text-center">
                                            {p.image_data ? (
                                                <div className="w-32 h-20 mx-auto border flex items-center justify-center bg-white">
                                                    <img
                                                        src={p.image_data}
                                                        alt="Product"
                                                        className="max-w-full max-h-full object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-400">No Image</span>
                                            )}
                                        </TableCell>



                                        <TableCell className="text-center">{p.product_name}</TableCell>
                                        <TableCell className="text-center">{p.airport_name}</TableCell>
                                        <TableCell className="text-center">{p.service_type}</TableCell>
                                        <TableCell className="text-center">{p.service_provider}</TableCell>
                                        <TableCell className="text-center">{p.booking_email}</TableCell>
                                        <TableCell className="text-center">
                                            {formatTime12(p.operational_from)}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {formatTime12(p.operational_to)}
                                        </TableCell>

                                        <TableCell className="text-center">{p.nonflex}</TableCell>



                                        <TableCell className="text-center">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 px-2"
                                                onClick={() => {
                                                    const name = encodeURIComponent(p.product_name);
                                                    const provider = encodeURIComponent(p.service_provider);

                                                    window.location.href = `/manage-price?id=${p.id}&name=${name}&provider=${provider}`;
                                                }}
                                            >
                                                <DollarSign className="w-3 h-3" />
                                            </Button>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <button
                                                onClick={() => toggleActive(p.id, p.is_active === 1 ? 0 : 1)}
                                                className={`relative inline-flex h-5 w-10 items-center  transition
        ${p.is_active === 1 ? "bg-green-500" : "bg-gray-300"}
    `}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform  bg-white transition
            ${p.is_active === 1 ? "translate-x-5" : "translate-x-1"}
        `}
                                                />
                                            </button>

                                        </TableCell>


                                    </TableRow>


                                    {/* ==== INLINE EDIT ==== */}
                                    {editingId === p.id && (
                                        <TableRow>
                                            <TableCell colSpan={14} className="bg-neutral-50 p-6">

                                                <div className="border  bg-white   p-6">
                                                    <h3 className="text-lg font-bold mb-4">
                                                        Edit Product — <span className="text-orange-600">{p.product_name}</span>
                                                    </h3>

                                                    <div className="grid grid-cols-4 gap-6 ">

                                                        {/* CARD 1 */}
                                                        <div className="border bg-white border-black">

                                                            {/* Card Body */}
                                                            <div className="p-4 space-y-4">

                                                                {/* 1. Airport */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                        Airport
                                                                    </label>
                                                                    <select
                                                                        value={form.airport_name}
                                                                        onChange={e =>
                                                                            setForm({ ...form, airport_name: e.target.value })
                                                                        }
                                                                        className="
          w-full
          h-10
          border
          border-gray-300
          rounded-none
          px-3
          text-sm
          focus:outline-none
          focus:ring-1
          focus:ring-blue-500
          focus:border-blue-500
        "
                                                                    >
                                                                        <option value="">Select Airport</option>
                                                                        <option value="Heathrow">Heathrow</option>
                                                                        <option value="Gatwick">Gatwick</option>
                                                                    </select>
                                                                </div>

                                                                {/* 2. Product Name */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                        Product Name
                                                                    </label>
                                                                    <Input
                                                                        className="rounded-none h-10 text-sm"
                                                                        value={form.product_name}
                                                                        onChange={e =>
                                                                            setForm({ ...form, product_name: e.target.value })
                                                                        }
                                                                    />
                                                                </div>

                                                                {/* 3. Airport Duty Number */}
                                                                {/* <div>
                                                                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                        Airport Number
                                                                    </label>
                                                                    <Input
                                                                        className="rounded-none h-10 text-sm"
                                                                        value={form.airport_number}
                                                                        onChange={e =>
                                                                            setForm({ ...form, airport_number: e.target.value })
                                                                        }
                                                                    />
                                                                </div> */}

                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                        Airport Duty Contact Number
                                                                    </label>
                                                                    <Input
                                                                        className="rounded-none h-10 text-sm"
                                                                        value={form.airport_duty_number}
                                                                        onChange={e =>
                                                                            setForm({ ...form, airport_duty_number: e.target.value })
                                                                        }
                                                                    />
                                                                </div>


                                                                {/* 4. Email Address (Booking Confirmation) */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                        Email Address
                                                                    </label>
                                                                    <Input
                                                                        className="rounded-none h-10 text-sm"
                                                                        value={form.booking_email}
                                                                        onChange={e =>
                                                                            setForm({ ...form, booking_email: e.target.value })
                                                                        }
                                                                    />
                                                                    {/* <p className="text-[11px] text-neutral-500 mt-1">
                                                                        (Booking Confirmation)
                                                                    </p> */}
                                                                </div>

                                                            </div>
                                                        </div>



                                                        {/* CARD 2 */}
                                                        <div className="border p-4 space-y-4 border-black">

                                                            {/* 1. Operation Start */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                    Operation Start
                                                                </label>
                                                                <select
                                                                    value={form.operational_from ?? ""}

                                                                    onChange={(e) =>
                                                                        setForm({ ...form, operational_from: e.target.value })
                                                                    }
                                                                    className="w-full h-10 border border-gray-300 px-3 text-sm focus:ring-1 focus:ring-blue-500"
                                                                >
                                                                    <option value="">Select Time</option>
                                                                    {TIME_OPTIONS.map(t => (
                                                                        <option key={t.value} value={t.value}>
                                                                            {t.label}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                {/* <p className="text-[11px] text-neutral-500 mt-1">(Hours)</p> */}
                                                            </div>

                                                            {/* 2. Operation End */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                    Operation End
                                                                </label>
                                                                <select
                                                                    value={form.operational_to ?? ""}

                                                                    onChange={(e) =>
                                                                        setForm({ ...form, operational_to: e.target.value })
                                                                    }
                                                                    className="w-full h-10 border border-gray-300 px-3 text-sm focus:ring-1 focus:ring-blue-500"
                                                                >
                                                                    <option value="">Select Time</option>
                                                                    {TIME_OPTIONS.map(t => (
                                                                        <option key={t.value} value={t.value}>
                                                                            {t.label}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                {/* <p className="text-[11px] text-neutral-500 mt-1">(Hours)</p> */}
                                                            </div>

                                                            {/* 3. Company Extra */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                    Company Extra
                                                                </label>
                                                                <Input
                                                                    type="text"
                                                                    className="rounded-none h-10 text-sm"
                                                                    value={form.product_extra ?? ""}
                                                                    onChange={e =>
                                                                        setForm({ ...form, product_extra: e.target.value })
                                                                    }
                                                                />
                                                            </div>



                                                            {/* 4. Service Type */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                    Service Type
                                                                </label>
                                                                <select
                                                                    value={form.service_type}
                                                                    onChange={e =>
                                                                        setForm({ ...form, service_type: e.target.value })
                                                                    }
                                                                    className="w-full h-10 border border-gray-300 px-3 text-sm focus:ring-1 focus:ring-blue-500"
                                                                >
                                                                    <option value="">Select Service Type</option>
                                                                    <option value="Park & Ride">Park & Ride</option>
                                                                    <option value="Meet & Greet">Meet & Greet</option>
                                                                    <option value="Valet Parking">Valet Parking</option>
                                                                </select>
                                                            </div>

                                                        </div>

                                                        <div className="border p-4 border-black space-y-4">

                                                            {/* 1. Book Short Hours */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                    Book Short Hours
                                                                </label>
                                                                <Input
                                                                    type="number"
                                                                    className="
      rounded-none
      h-10
      text-sm
      appearance-none
      [&::-webkit-inner-spin-button]:appearance-none
      [&::-webkit-outer-spin-button]:appearance-none
    "
                                                                    value={form.book_short_hours}
                                                                    onChange={e =>
                                                                        setForm({ ...form, book_short_hours: e.target.value })
                                                                    }
                                                                />
                                                            </div>


                                                            {/* 2. Edit Short Hours */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                    Edit Short Hours
                                                                </label>
                                                                <Input
                                                                    type="number"
                                                                    className="
      rounded-none
      h-10
      text-sm
      appearance-none
      [&::-webkit-inner-spin-button]:appearance-none
      [&::-webkit-outer-spin-button]:appearance-none
    "
                                                                    value={form.edit_short_hours}
                                                                    onChange={e =>
                                                                        setForm({ ...form, edit_short_hours: e.target.value })
                                                                    }
                                                                />
                                                            </div>


                                                            {/* 3. Cancel Short Hours */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                    Cancel Short Hours
                                                                </label>
                                                                <Input
                                                                    type="number"
                                                                    className="
      rounded-none
      h-10
      text-sm
      appearance-none
      [&::-webkit-inner-spin-button]:appearance-none
      [&::-webkit-outer-spin-button]:appearance-none
    "
                                                                    value={form.cancel_short_hours}
                                                                    onChange={e =>
                                                                        setForm({ ...form, cancel_short_hours: e.target.value })
                                                                    }
                                                                />
                                                            </div>


                                                            {/* 4. Promocodes Applicable */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                    Promocodes Applicable
                                                                </label>
                                                                <select
                                                                    value={form.promocodes_applicable}
                                                                    onChange={e =>
                                                                        setForm({ ...form, promocodes_applicable: e.target.value })
                                                                    }
                                                                    className="w-full h-10 border border-gray-300 px-3 text-sm  focus:ring-1 focus:ring-blue-500"
                                                                >
                                                                    {/* <option value="">Select</option> */}
                                                                    <option value="Yes">Yes</option>
                                                                    <option value="No">No</option>
                                                                </select>
                                                            </div>

                                                        </div>



                                                        {/* CARD 3 */}
                                                        <div className="border border-black  bg-white">

                                                            {/* Card Body */}
                                                            <div className="p-4  space-y-4">



                                                                {/* Recommended */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                        Recommended
                                                                    </label>
                                                                    <select
                                                                        value={form.recommended}
                                                                        onChange={e =>
                                                                            setForm({ ...form, recommended: e.target.value })
                                                                        }
                                                                        className="
      w-full
      h-10
      border
      border-gray-300
      rounded-none
      px-3
      text-sm
      focus:outline-none
      focus:ring-1
      focus:ring-blue-500
      focus:border-blue-500
    "
                                                                    >
                                                                        <option value="">Select</option>
                                                                        <option value="Yes">Yes</option>
                                                                        <option value="No">No</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                                                                        Flexibility
                                                                    </label>
                                                                    <select
                                                                        value={form.nonflex}
                                                                        onChange={e =>
                                                                            setForm({ ...form, nonflex: e.target.value })
                                                                        }
                                                                        className="
      w-full
      h-10
      border
      border-gray-300
      rounded-none
      px-3
      text-sm
      focus:outline-none
      focus:ring-1
      focus:ring-blue-500
      focus:border-blue-500
    "
                                                                    >
                                                                        <option value="">Select</option>
                                                                        <option value="Refundable">Refundable</option>
                                                                        <option value="Non-Refundable">Non-Refundable</option>
                                                                    </select>
                                                                </div>


                                                                {/* Product Image */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-600 mb-2">
                                                                        Product Image
                                                                    </label>

                                                                    {/* Upload box */}
                                                                    <div className="flex items-center gap-4">
                                                                        <label className="flex items-center justify-center w-32 h-24 border border-dashed border-gray-300 bg-white text-xs text-gray-500 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition">
                                                                            Upload Image
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                className="hidden"
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (!file) return;
                                                                                    setSelectedImage(file);
                                                                                    setPreviewImage(URL.createObjectURL(file));
                                                                                }}
                                                                            />
                                                                        </label>

                                                                        {/* Image Preview */}
                                                                        {(previewImage || p.image_data) && (
                                                                            <div className="w-32 h-24 border bg-white flex items-center justify-center">
                                                                                <img
                                                                                    src={
                                                                                        previewImage
                                                                                            ? previewImage
                                                                                            : `${API_BASE_URL}/api/parking/product/image/${p.id}`
                                                                                    }
                                                                                    alt="Product"
                                                                                    className="max-w-full max-h-full object-contain"
                                                                                    onError={(e) => {
                                                                                        e.currentTarget.style.display = "none";
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}


                                                                    </div>

                                                                    {/* <p className="text-[11px] text-neutral-500 mt-2">
                                                                        Recommended size: 400×300px (JPG / PNG)
                                                                    </p> */}
                                                                </div>

                                                            </div>
                                                        </div>


                                                    </div>

                                                    {/* TAB HEADERS */}
                                                    <div className="flex justify-center gap-6 mb-4 mt-6 p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setContentTab("website")}
                                                            className={`px-6 py-2 text-sm font-medium transition-all rounded-none
      ${contentTab === "website"
                                                                    ? "bg-purple-600 text-white "
                                                                    : "text-gray-600 hover:bg-gray-200"
                                                                }`}
                                                        >
                                                            Website (More Info)
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setContentTab("email")}
                                                            className={`px-6 py-2 text-sm font-medium transition-all rounded-none
      ${contentTab === "email"
                                                                    ? "bg-purple-600 text-white "
                                                                    : "text-gray-600 hover:bg-gray-200"
                                                                }`}
                                                        >
                                                            Email (Booking Confirmation)
                                                        </button>
                                                    </div>

                                                    {/* WEBSITE TAB */}
                                                    {/* WEBSITE TAB */}
                                                    {contentTab === "website" && (
                                                        <div className="space-y-6 mt-4">

                                                            {/* 1️⃣ PRODUCT FEATURES */}
                                                            <div className="border p-4 border-black">
                                                                <h4 className="text-sm font-semibold mb-3">Product Features</h4>

                                                                <div className="grid grid-cols-3 gap-4">
                                                                    {[
                                                                        ["point_1", "Point 1"],
                                                                        ["point_2", "Point 2"],
                                                                        ["point_3", "Point 3"],
                                                                        ["point_4", "Point 4"],
                                                                        ["point_5", "Point 5"],
                                                                        ["point_6", "Point 6"],
                                                                    ].map(([key, label]) => {
                                                                        const value = form[key] || "";
                                                                        const length = value.length;

                                                                        return (
                                                                            <div key={key} className="flex flex-col gap-1">
                                                                                <label className="text-xs text-gray-600">{label}</label>

                                                                                <textarea
                                                                                    className="border p-2 text-xs resize-none"
                                                                                    placeholder={label}
                                                                                    maxLength={25}                      // ✅ LIMIT
                                                                                    value={value}
                                                                                    onChange={(e) =>
                                                                                        setForm({ ...form, [key]: e.target.value })
                                                                                    }
                                                                                />

                                                                                {/* CHARACTER COUNTER */}
                                                                                <div
                                                                                    className={`text-[10px] text-right ${length >= 25 ? "text-red-500" : "text-gray-400"
                                                                                        }`}
                                                                                >
                                                                                    {length} / 25
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>


                                                            {/* 2️⃣ PRODUCT OVERVIEW */}
                                                            <div className="border p-4 border-black">
                                                                <h4 className="text-sm font-semibold mb-3">Product Overview</h4>

                                                                <RichTextEditor
                                                                    value={form.product_overview || ""}
                                                                    onChange={(val) =>
                                                                        setForm({ ...form, product_overview: val })
                                                                    }
                                                                />

                                                            </div>

                                                            {/* 3️⃣ PRODUCT PROCEDURE */}
                                                            <div className="border p-4 border-black">
                                                                <h4 className="text-sm font-semibold mb-3">Product Procedure</h4>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="flex flex-col gap-1">
                                                                        <label className="text-xs text-gray-600">Dropoff Procedure</label>
                                                                        <RichTextEditor
                                                                            value={form.dropoff_procedure || ""}
                                                                            onChange={(val) =>
                                                                                setForm({ ...form, dropoff_procedure: val })
                                                                            }
                                                                        />

                                                                    </div>

                                                                    <div className="flex flex-col gap-1">
                                                                        <label className="text-xs text-gray-600">Return Procedure</label>
                                                                        <RichTextEditor
                                                                            value={form.return_procedure || ""}
                                                                            onChange={(val) =>
                                                                                setForm({ ...form, return_procedure: val })
                                                                            }
                                                                        />

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* 4️⃣ IMPORTANT INFORMATION */}
                                                            <div className="border p-4 border-black">
                                                                <h4 className="text-sm font-semibold mb-3">Important Information</h4>

                                                                <RichTextEditor
                                                                    value={form.important_information || ""}
                                                                    onChange={(val) =>
                                                                        setForm({ ...form, important_information: val })
                                                                    }
                                                                />

                                                            </div>

                                                        </div>
                                                    )}



                                                    {/* EMAIL TAB */}
                                                    {/* EMAIL TAB */}
                                                    {contentTab === "email" && (
                                                        <div className="space-y-6 mt-4">

                                                            {/* PRODUCT PROCEDURE (EMAIL) */}
                                                            <div className="border p-4 border-black">
                                                                <h4 className="text-sm font-semibold mb-3">
                                                                    Product Procedure (Email)
                                                                </h4>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="flex flex-col gap-1">
                                                                        <label className="text-xs text-gray-600">
                                                                            Dropoff Procedure (Email)
                                                                        </label>
                                                                        <RichTextEditor
                                                                            value={form.email_dropoff_procedure || ""}
                                                                            onChange={(val) =>
                                                                                setForm({ ...form, email_dropoff_procedure: val })
                                                                            }
                                                                        />

                                                                    </div>

                                                                    <div className="flex flex-col gap-1">
                                                                        <label className="text-xs text-gray-600">
                                                                            Return Procedure (Email)
                                                                        </label>
                                                                        <RichTextEditor
                                                                            value={form.email_return_procedure || ""}
                                                                            onChange={(val) =>
                                                                                setForm({
                                                                                    ...form,
                                                                                    email_return_procedure: val,
                                                                                })
                                                                            }
                                                                        />

                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* EMAIL NOTES */}
                                                            <div className="border p-4 border-black">
                                                                <h4 className="text-sm font-semibold mb-3">
                                                                    Notes (Email)
                                                                </h4>

                                                                <RichTextEditor
                                                                    value={form.email_notes || ""}
                                                                    onChange={(val) =>
                                                                        setForm({
                                                                            ...form,
                                                                            email_notes: val,
                                                                        })
                                                                    }
                                                                />

                                                            </div>

                                                            {/* EMAIL DIRECTION */}
                                                            <div className="border p-4 border-black">
                                                                <h4 className="text-sm font-semibold mb-3">
                                                                    Directions (Email)
                                                                </h4>

                                                                <RichTextEditor
                                                                    value={form.directions || ""}
                                                                    onChange={(val) =>
                                                                        setForm({
                                                                            ...form,
                                                                            directions: val,
                                                                        })
                                                                    }
                                                                />

                                                            </div>

                                                        </div>
                                                    )}




                                                    {/* POINTS SECTION */}
                                                    {/* <div className="grid grid-cols-2 gap-4 mt-4">
                                                        {[
                                                            ["point_1", "Point 1"],
                                                            ["point_2", "Point 2"],
                                                            ["point_3", "Point 3"],
                                                            ["point_4", "Point 4"],
                                                            ["point_5", "Point 5"],
                                                        ].map(([key, label]) => (
                                                            <div key={key} className="flex flex-col gap-1">
                                                                <label className="text-xs font-medium text-gray-600">
                                                                    {label}
                                                                </label>
                                                                <textarea
                                                                    className="border p-2 text-xs"
                                                                    placeholder={label}
                                                                    value={form[key] || ""}
                                                                    onChange={(e) =>
                                                                        setForm({ ...form, [key]: e.target.value })
                                                                    }
                                                                />
                                                            </div>
                                                        ))}
                                                    </div> */}






                                                    {/* BUTTONS */}
                                                    <div className="flex justify-end gap-2 mt-6">
                                                        <Button className="rounded-none" size="sm" onClick={() => saveEdit(p.id)}>
                                                            Save
                                                        </Button>
                                                        <Button className="rounded-none" size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>

                                            </TableCell>
                                        </TableRow>
                                    )}



                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>


                {/* PAGINATION BUTTONS */}
                {/* pagination */}
                <div className="flex justify-center items-center gap-3 py-4">

                    {/* PREV */}
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-3 py-1 border  disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {/* PAGE NUMBERS */}
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-3 py-1 border  
        ${currentPage === index + 1 ? "bg-purple-600 text-white" : ""}
      `}
                        >
                            {index + 1}
                        </button>
                    ))}

                    {/* NEXT */}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-3 py-1 border  disabled:opacity-50"
                    >
                        Next
                    </button>

                </div>


            </div>
        </ProtectedRoute>
    );
}
