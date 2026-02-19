"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { NotebookPen, StickyNote, Pencil, Trash2, X, Handshake, SquareParking, CircleCheck, CircleX } from 'lucide-react';

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import { Lightbulb, Mail, User } from 'lucide-react';


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const API = `${API_BASE}/api/getdata/suppliers`;

type Supplier = {
  supplier_id: number;
  supplier_name: string;
  reg_no: string;
  supplier_contact: string;
  director_name: string;
  director_email: string;
  director_phone: string;
  supplier_email: string;
  supplier_address: string;
  from_email_address: string;
  airport: string;
  commission: number;
  email_parsing_active: number;
  supplier_active: number;
  bookings_count: number;
};

export default function SuppliersPage() {
  const [rows, setRows] = useState<Supplier[]>([]);
  const [form, setForm] = useState<any>({});
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  const [activeTab, setActiveTab] = useState("company");

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}?page=${page}&limit=${limit}&search=${search}`, { credentials: "include" });
      const json = await res.json();

      setRows(Array.isArray(json?.data) ? json.data : []);
      setTotal(typeof json?.total === "number" ? json.total : 0);
    } catch (err) {
      console.error(err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [page, search]);

  const openEdit = (s: Supplier) => {
    setForm({
      supplier_name: s.supplier_name || "",
      reg_no: s.reg_no || "",
      supplier_address: s.supplier_address || "",
      supplier_contact: s.supplier_contact || "",
      supplier_email: s.supplier_email || "",
      from_email_address: s.from_email_address || "",
      commission: s.commission ?? 0,
      director_name: s.director_name || "",
      director_email: s.director_email || "",
      director_phone: s.director_phone || "",
      email_parsing_active: s.email_parsing_active ?? 0,
      supplier_active: s.supplier_active ?? 1,
    });

    setOpenRow(s.supplier_id);
  };


  const saveEdit = async (id: number) => {
    setSaveMsg("Saving...");
    const res = await fetch(`${API}/update/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSaveMsg("Saved ✓");
      fetchData();
      setTimeout(() => setSaveMsg(""), 1000);
      setOpenRow(null);
    } else {
      setSaveMsg("Error saving");
    }
  };

  const deleteSupplier = async (id: number) => {
    if (!confirm("Delete supplier?")) return;
    const res = await fetch(`${API}/delete/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) fetchData();
  };

  const FlagIcon = (value: number) =>
    value === 1 ? <CircleCheck className="text-green-600 mx-auto" /> : <CircleX className="text-red-600 mx-auto" />;

  return (
    <div className="w-full min-h-screen p-4">
      <div className="w-full mx-auto">


        {/* SEARCH + ADD BUTTON ROW */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Suppliers List</h2>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="border px-4 py-2  w-64 text-sm"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}

            />

            <Button
              className="bg-blue-600 text-white px-4 py-2 rounded-none "
              onClick={() => (window.location.href = "/supplierAdd")}
            >
              + Add Suppliers
            </Button>
          </div>

        </div>


        {/* TABLE */}
        <div className="border  overflow-x-auto w-full">
          <Table className="text-xs w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center bg-neutral-100">S.L</TableHead>
                <TableHead className="text-center bg-neutral-100">Actions</TableHead>
                <TableHead className="text-center bg-neutral-100">Supplier Website</TableHead>
                {/* <TableHead className="text-center bg-neutral-100">Reg No.</TableHead> */}
                {/* <TableHead className="text-center bg-neutral-100">Address</TableHead> */}
                {/* <TableHead className="text-center bg-neutral-100">Director</TableHead> */}
                {/* <TableHead className="text-center bg-neutral-100">Director Email</TableHead> */}
                <TableHead className="text-center bg-neutral-100">Booking Email</TableHead>
                {/* <TableHead className="text-center bg-neutral-100">Contact</TableHead> */}
                <TableHead className="text-center bg-neutral-100">Commission</TableHead>
                {/* <TableHead className="text-center bg-neutral-100">Count</TableHead> */}
                <TableHead className="text-center bg-neutral-100">Email Parsing</TableHead>
                <TableHead className="text-center bg-neutral-100">Active</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-3">
                    Loading…
                  </TableCell>
                </TableRow>
              )}

              {rows.map((s, i) => {
                const isOpen = openRow === s.supplier_id;
                const sl = (page - 1) * limit + (i + 1);

                return (
                  <Fragment key={s.supplier_id}>

                    <TableRow>
                      <TableCell className="text-center">{sl}</TableCell>

                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Button size="icon" variant="ghost" className=" w-5" onClick={() => openEdit(s)}>
                            {isOpen ? (
                              <X className="h-3.5 w-3.5" />
                            ) : (
                              <Pencil className="h-3.5 w-3.5" />
                            )}
                          </Button>

                          <Button size="icon" variant="ghost" onClick={() => deleteSupplier(s.supplier_id)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>


                      <TableCell className="text-center">{s.supplier_name}</TableCell>
                      {/* <TableCell className="text-center">{s.reg_no}</TableCell> */}
                      {/* <TableCell className="text-center">{s.supplier_address}</TableCell> */}
                      {/* <TableCell className="text-center">{s.director_name}</TableCell> */}
                      {/* <TableCell className="text-center">{s.director_email}</TableCell> */}
                      <TableCell className="text-center">{s.from_email_address}</TableCell>
                      {/* <TableCell className="text-center">{s.supplier_contact}</TableCell> */}
                      <TableCell className="text-center">{s.commission}%</TableCell>
                      {/* <TableCell className="text-center">{s.bookings_count}</TableCell> */}
                      <TableCell className="text-center">{FlagIcon(s.email_parsing_active)}</TableCell>
                      <TableCell className="text-center">{FlagIcon(s.supplier_active)}</TableCell>
                    </TableRow>

                    {/* EDITOR */}
                    {isOpen && (
                      <TableRow>
                        <TableCell colSpan={13} className="bg-neutral-50">
                          <div className="border border-neutral-200 bg-white shadow-md p-6">

                            {/* HEADER */}
                            <div className="mb-6">
                              <h3 className="text-sm font-semibold text-neutral-800">
                                Edit Supplier
                              </h3>
                              <p className="text-xs text-neutral-500">
                                {s.supplier_name}
                              </p>
                            </div>

                            {/* GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                              {/* 1️⃣ COMPANY DETAILS */}
                              <div className="border rounded-none bg-white">
                                {/* <div className="px-4 py-2 border-b bg-neutral-100">
                                  <h4 className="text-xs font-semibold text-neutral-700">
                                    Company Details
                                  </h4>
                                </div> */}

                                <div className="p-4 space-y-4">
                                  <div>
                                    <label className="block text-[11px] text-neutral-600 mb-1">
                                      Company Website
                                    </label>
                                    <Input
                                      className="h-8 text-xs rounded-none"
                                      value={form.supplier_name}
                                      onChange={e =>
                                        setForm({ ...form, supplier_name: e.target.value })
                                      }
                                    />
                                  </div>

                                  {/* <div>
                                    <label className="block text-[11px] text-neutral-600 mb-1">
                                      Registration No
                                    </label>
                                    <Input
                                      className="h-8 text-xs rounded-none"
                                      value={form.reg_no}
                                      onChange={e =>
                                        setForm({ ...form, reg_no: e.target.value })
                                      }
                                    />
                                  </div> */}

                                  {/* <div>
                                    <label className="block text-[11px] text-neutral-600 mb-1">
                                      Address
                                    </label>
                                    <Input
                                      className="h-8 text-xs rounded-none"
                                      value={form.supplier_address}
                                      onChange={e =>
                                        setForm({ ...form, supplier_address: e.target.value })
                                      }
                                    />
                                  </div> */}
                                </div>
                              </div>

                              {/* 2️⃣ CONTACT DETAILS */}
                              <div className="border rounded-none bg-white">
                                {/* <div className="px-4 py-2 border-b bg-neutral-100">
                                  <h4 className="text-xs font-semibold text-neutral-700">
                                    Contact Details
                                  </h4>
                                </div> */}

                                <div className="p-4 space-y-4">
                                  {/* <div>
                                    <label className="block text-[11px] text-neutral-600 mb-1">
                                      Office Email
                                    </label>
                                    <Input
                                      className="h-8 text-xs rounded-none"
                                      value={form.supplier_email}
                                      onChange={e =>
                                        setForm({ ...form, supplier_email: e.target.value })
                                      }
                                    />
                                  </div> */}

                                  {/* <div>
                                    <label className="block text-[11px] text-neutral-600 mb-1">
                                      Contact Number
                                    </label>
                                    <Input
                                      className="h-8 text-xs rounded-none"
                                      value={form.supplier_contact}
                                      onChange={e =>
                                        setForm({ ...form, supplier_contact: e.target.value })
                                      }
                                    />
                                  </div> */}

                                  <div>
                                    <label className="block text-[11px] text-neutral-600 mb-1">
                                      Commission (%)
                                    </label>
                                    <Input
                                      type="number"
                                      className="h-8 text-xs rounded-none"
                                      value={form.commission}
                                      onChange={e =>
                                        setForm({ ...form, commission: Number(e.target.value) })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* 3️⃣ DIRECTOR DETAILS */}
                              <div className="border rounded-none bg-white">
                                {/* <div className="px-4 py-2 border-b bg-neutral-100">
                                  <h4 className="text-xs font-semibold text-neutral-700">
                                    Director Details
                                  </h4>
                                </div> */}

                                <div className="p-4 space-y-4">
                                  <div>
                                    <label className="block text-[11px] text-neutral-600 mb-1">
                                      Booking Email
                                    </label>
                                    <Input
                                      className="h-8 text-xs rounded-none"
                                      value={form.from_email_address}
                                      onChange={e =>
                                        setForm({ ...form, from_email_address: e.target.value })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* 4️⃣ PARSING SETTING */}
                              <div className="border rounded-none bg-white">
                                {/* <div className="px-4 py-2 border-b bg-neutral-100">
                                  <h4 className="text-xs font-semibold text-neutral-700">
                                    Parsing Setting
                                  </h4>
                                </div> */}

                                <div className="p-4 space-y-4">

                                  

                                  <label className="flex items-center justify-between">
                                    <span className="text-xs text-neutral-700">
                                      Email Parsing Active
                                    </span>
                                    <input
                                      type="checkbox"
                                      className="rounded-none"
                                      checked={form.email_parsing_active === 1}
                                      onChange={e =>
                                        setForm({
                                          ...form,
                                          email_parsing_active: e.target.checked ? 1 : 0,
                                        })
                                      }
                                    />
                                  </label>

                                  <label className="flex items-center justify-between">
                                    <span className="text-xs text-neutral-700">
                                      Supplier Active
                                    </span>
                                    <input
                                      type="checkbox"
                                      className="rounded-none"
                                      checked={form.supplier_active === 1}
                                      onChange={e =>
                                        setForm({
                                          ...form,
                                          supplier_active: e.target.checked ? 1 : 0,
                                        })
                                      }
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-end gap-2 mt-6">
                              <Button className="rounded-none" size="sm" onClick={() => saveEdit(s.supplier_id)}>
                                Save Changes
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-none"
                                onClick={() => setOpenRow(null)}
                              >
                                Cancel
                              </Button>
                            </div>

                            {saveMsg && (
                              <p className="text-xs text-green-700 mt-2">{saveMsg}</p>
                            )}
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
            className="px-3 py-1 border  disabled:opacity-50"
          >
            Next
          </button>

        </div>


      </div>
    </div>
  );
}
