"use client";

import { useEffect, useState, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";
import { User } from 'lucide-react';
import { Link } from 'lucide-react';
import { NotebookPen } from 'lucide-react';

/* BACKEND URLS */
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/website/settings/get`;
const UPDATE_API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/website/settings/update`;

type WebSettings = {
    id: number;
    website_name: string;
    website_url: string;
    website_contact: string;
    website_mobile: string;
    website_email: string;
    office_address: string;
    postcode: string;
    booking_prefix: string;
    booking_ref: string;
    amend_short_notice_hours: number;
    cancel_short_notice_hours: number;
    booking_fee: number;
    booking_fee_message: string;
    smtp_server: string;
    smtp_port: string;
    smtp_user: string;
    smtp_password: string;
    email_title: string;
    booking_email_address: string;
    reply_email_address: string;
    no_reply_email: string;
    website_active: number;
    bookings_count: number;
};

export default function WebsiteSettingsTable() {
    const [rows, setRows] = useState<WebSettings[]>([]);
    const [openRowId, setOpenRowId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [limit] = useState(30);
    const [total, setTotal] = useState(0);

    const totalPages = Math.max(1, Math.ceil(total / limit));


    const [form, setForm] = useState({} as WebSettings);

    /* =========== GET DATA ============ */
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_URL);

            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();

            setRows(json);
        } catch (err: any) {
            setErrMsg("Failed to load settings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    /* =========== ACTIONS ============ */
    const openEdit = (row: WebSettings) => {
        if (openRowId === row.id) {
            setOpenRowId(null);
            return;
        }
        setOpenRowId(row.id);
        setForm({ ...row });
    };

    const viewRow = (row: WebSettings) => {
        alert("View Record ID: " + row.id);
    };


    const handleChange = (name: keyof WebSettings, value: any) =>
        setForm(prev => ({ ...prev, [name]: value }));

    /* =========== SAVE UPDATE ============ */
    const saveUpdate = async (id: number) => {
        setSaving(true);
        setSaveMsg("Saving...");

        try {
            const res = await fetch(`${UPDATE_API}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error(await res.text());

            setSaveMsg("Saved ✓");
            setTimeout(() => setSaveMsg(""), 1000);

            setOpenRowId(null);
            fetchData();
        } catch (err: any) {
            setSaveMsg(err.message);
        } finally {
            setSaving(false);
        }
    };

    const fields: Array<keyof WebSettings> = [
        "website_name", "website_url", "website_contact", "website_mobile",
        "website_email", "office_address", "postcode", "booking_prefix",
        "booking_ref", "amend_short_notice_hours", "cancel_short_notice_hours",
        "booking_fee", "booking_fee_message", "smtp_server", "smtp_port",
        "smtp_user", "smtp_password", "email_title", "booking_email_address",
        "reply_email_address", "no_reply_email"
    ];

    const deleteRow = async (id: number) => {
        if (!confirm("Are you sure you want to delete this website setting?")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/website/settings/delete/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error(await res.text());

            alert("Deleted successfully!");
            fetchData(); // refresh table

        } catch (err: any) {
            alert(err.message);
        }
    };


    return (
        <div className="w-full min-h-screen px-3 md:px-1 pt-4">

            {/* TOP BAR */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Website List</h2>

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="border px-4 py-2 rounded-lg w-64 text-sm"
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}

                    />

                    <Button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                        onClick={() => (window.location.href = "/website-settings")}
                    >
                        + Add Website
                    </Button>
                </div>

            </div>


            <div className="overflow-x-auto border rounded-lg w-full">
                <Table className="w-full text-xs border-separate border-spacing-0">

                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center bg-neutral-100">S.L</TableHead>
                            <TableHead className="text-center bg-neutral-100">Actions</TableHead>
                            <TableHead className="text-center bg-neutral-100">Website Name</TableHead>
                            <TableHead className="text-center bg-neutral-100">Contact</TableHead>
                            <TableHead className="text-center bg-neutral-100">Email</TableHead>
                            <TableHead className="text-center bg-neutral-100">Address</TableHead>
                            <TableHead className="text-center bg-neutral-100">Post Code</TableHead>
                            <TableHead className="text-center bg-neutral-100">Fees</TableHead>
                            <TableHead className="text-center bg-neutral-100">Server</TableHead>
                            <TableHead className="text-center bg-neutral-100">Port</TableHead>
                            <TableHead className="text-center bg-neutral-100">Count</TableHead>
                            <TableHead className="text-center bg-neutral-100">Status</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading && <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>}
                        {errMsg && <TableRow><TableCell colSpan={7}>{errMsg}</TableCell></TableRow>}

                        {rows
                            .filter(row =>
                                Object.values(row)
                                    .join(" ")
                                    .toLowerCase()
                                    .includes(search.toLowerCase())
                            )
                            .map((row, i) => {

                                const inline = openRowId === row.id;

                                return (
                                    <Fragment key={row.id}>
                                        <TableRow className="bg-neutral-50">
                                            <TableCell className="text-center">{i + 1}</TableCell>

                                            <TableCell className="text-center">
                                                <div className="flex justify-center items-center gap-2">

                                                    {/* View */}
                                                    <Eye
                                                        onClick={() => viewRow(row)}
                                                        className="h-4 w-4 text-blue-600 cursor-pointer hover:scale-110"
                                                    />

                                                    {/* Edit */}
                                                    {inline ? (
                                                        <X
                                                            onClick={() => openEdit(row)}
                                                            className="h-4 w-4 cursor-pointer hover:scale-110"
                                                        />
                                                    ) : (
                                                        <Pencil
                                                            onClick={() => openEdit(row)}
                                                            className="h-4 w-4 cursor-pointer hover:scale-110"
                                                        />
                                                    )}

                                                    {/* Delete */}
                                                    <Trash2
                                                        onClick={() => deleteRow(row.id)}
                                                        className="h-4 w-4 text-red-600 cursor-pointer hover:scale-110"
                                                    />

                                                    {/* URL */}
                                                    <Link
                                                        onClick={() => window.open(row.website_url, "_blank")}
                                                        className="h-4 w-4 text-blue-600 cursor-pointer hover:scale-110"
                                                    />

                                                    {/* Notes Indicator */}
                                                    <NotebookPen 
                                                        onClick={() =>
                                                            alert(row.booking_fee_message || "No notes available")
                                                        }
                                                        className={`h-4 w-4 cursor-pointer hover:scale-110 ${row.booking_fee_message ? "text-red-600" : "text-green-600"
                                                            }`}
                                                    />

                                                </div>
                                            </TableCell>



                                            <TableCell className="text-center">{row.website_name}</TableCell>

                                            <TableCell className="text-center">{row.website_contact}</TableCell>
                                            <TableCell className="text-center">{row.website_email}</TableCell>
                                            <TableCell className="text-center">{row.office_address}</TableCell>
                                            <TableCell className="text-center">{row.postcode}</TableCell>
                                            <TableCell className="text-center">{row.booking_fee}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="relative group cursor-pointer flex justify-center">
                                                    <ExternalLink className="h-4 w-4 text-blue-600" />

                                                    <span className="
                                                                absolute hidden group-hover:block
                                                                bg-black text-white text-[10px]
                                                                px-2 py-1 rounded shadow-lg
                                                                -top-8 whitespace-nowrap
                                                            ">
                                                        {row.smtp_server}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            {/* <TableCell className="text-center">
                                                <div className="relative group cursor-pointer flex justify-center">
                                                    <User className="h-4 w-4 text-purple-600" />

                                                    <span className="
                                                                    absolute hidden group-hover:block
                                                                    bg-black text-white text-[10px]
                                                                    px-2 py-1 rounded shadow-lg
                                                                    -top-8 whitespace-nowrap
                                                                ">
                                                        {row.smtp_user}
                                                    </span>
                                                </div>
                                            </TableCell> */}
                                            <TableCell className="text-center">{row.smtp_port}</TableCell>
                                            <TableCell className="text-center">{row.bookings_count}</TableCell>

                                            <TableCell className="text-center">
                                                {row.website_active ? (
                                                    <span className="bg-green-200 text-green-700 px-2 py-1 rounded">Active</span>
                                                ) : (
                                                    <span className="bg-red-200 text-red-700 px-2 py-1 rounded">Inactive</span>
                                                )}
                                            </TableCell>
                                        </TableRow>

                                        {/* INLINE EDIT FORM */}
                                        {/* INLINE EDIT FORM */}
                                        {inline && (
                                            <TableRow>
                                                <TableCell colSpan={12} className="p-0">
                                                    <div className="w-full border rounded-lg p-6 bg-white">

                                                        {/* ==== Improved Header ==== */}
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                                                                Edit Website Settings : <span className="text-blue-600">{row.website_name}</span>
                                                            </h3>

                                                        </div>

                                                        {/* ==== SAME FIELDS, NO BREAKING CSS ==== */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                                            {fields.map(field => (
                                                                <div key={field}>
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
                                                                        {field.replace(/_/g, " ")}
                                                                    </label>
                                                                    <Input
                                                                        className="h-9 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                                        value={(form as any)[field] || ""}
                                                                        onChange={e => handleChange(field, e.target.value)}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {saveMsg && (
                                                            <p className="text-xs text-green-600 font-medium mt-2">{saveMsg}</p>
                                                        )}

                                                        {/* ==== BUTTONS ==== */}
                                                        <div className="flex justify-end gap-2 mt-5">
                                                            <Button size="sm" className="bg-blue-600 text-white" onClick={() => saveUpdate(row.id)} disabled={saving}>
                                                                {saving ? "Saving..." : "Save"}
                                                            </Button>

                                                            <Button size="sm" variant="outline" className="border-gray-400" onClick={() => setOpenRowId(null)}>
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


    );
}
