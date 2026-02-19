'use client';

import { Fragment, useEffect, useState } from 'react';
import { Pencil, Trash2, X, Plus } from 'lucide-react';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProtectedRoute from '@/components/ProtectedRoute';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ===========================
   TYPE
=========================== */
type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

/* ===========================
   MAIN COMPONENT
=========================== */
export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [permissions, setPermissions] = useState({
    access_all_bookings: false,
    access_cancelled_bookings: false,
    access_website_bookings: false,
    access_admin_booking: false,
    access_incomplete_booking: false,
    access_refunded_bookings: false,
    access_invoice: false,
    access_supplier_booking: false,
    access_supplier_list: false,
    access_supplier_report: false,
    access_supplier_invoice: false,
    access_depart_report: false,
    access_return_report: false,
    access_depart_return_report: false,
    access_depart_cards_report: false,
    access_website_settings: false,
    access_airport_settings: false,
    access_admin_settings: false,
  });


  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<AdminUser>>({});

  /* ===========================
     FETCH USERS
  =========================== */
  const fetchUsers = async () => {
    setLoading(true);
    setErrMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/getdata/users`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) throw new Error(await res.text());
      setRows(await res.json());
    } catch {
      setErrMsg("Failed to load admin users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ===========================
     CREATE USER
  =========================== */
  const createUser = async () => {
    if (!name || !email || !password) {
      alert("All fields required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/insertdata/users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          ...permissions
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Admin created");
      setName("");
      setEmail("");
      setPassword("");
      setRole("admin");
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  /* ===========================
     OPEN EDIT
  =========================== */
  const openEdit = async (user: AdminUser) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/getdata/users/${user.id}`, {
        credentials: "include",
      });

      const data = await res.json();

      setEditingId(user.id);

      setEditData({
        name: data.name,
        email: data.email,
        role: data.role,
      });

      // Load permissions from DB
      setPermissions({
        access_all_bookings: !!data.access_all_bookings,
        access_cancelled_bookings: !!data.access_cancelled_bookings,
        access_website_bookings: !!data.access_website_bookings,
        access_admin_booking: !!data.access_admin_booking,
        access_incomplete_booking: !!data.access_incomplete_booking,
        access_refunded_bookings: !!data.access_refunded_bookings,
        access_invoice: !!data.access_invoice,
        access_supplier_booking: !!data.access_supplier_booking,
        access_supplier_list: !!data.access_supplier_list,
        access_supplier_report: !!data.access_supplier_report,
        access_supplier_invoice: !!data.access_supplier_invoice,
        access_depart_report: !!data.access_depart_report,
        access_return_report: !!data.access_return_report,
        access_depart_return_report: !!data.access_depart_return_report,
        access_depart_cards_report: !!data.access_depart_cards_report,
        access_website_settings: !!data.access_website_settings,
        access_airport_settings: !!data.access_airport_settings,
        access_admin_settings: !!data.access_admin_settings,
      });

    } catch (error) {
      console.error(error);
    }
  };


  const closeEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  /* ===========================
     UPDATE USER
  =========================== */
  const updateUser = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/updatedata/users/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editData,
          ...permissions
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Admin updated");
      closeEdit();
      fetchUsers();

    } catch (err: any) {
      alert(err.message);
    }
  };


  /* ===========================
     DELETE USER
  =========================== */
  const deleteUser = async (id: number) => {
    if (!confirm("Delete this admin?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/deletedata/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Admin deleted");
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <ProtectedRoute>
      <div className="w-full px-3 md:px-1 pt-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
          <h6 className="text-lg font-bold text-gray-900">Role Users</h6>

          <Button onClick={() => setShowForm(v => !v)} className="flex gap-2 rounded-none">
            <Plus size={16} /> Add Admin
          </Button>
        </div>

        {/* CREATE FORM */}
        {/* CREATE FORM */}
        {showForm && (
          <div className="mb-6 border p-6 w-full ">

            {/* HEADER */}
            <div className="mb-6 border-b pb-3">
              <h2 className="text-xl font-semibold text-gray-800">
                Create New Admin
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the details below to create a new administrator account.
              </p>
            </div>

            {/* =========================
        ROW 1 — BASIC INFO
    ========================== */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* USERNAME */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 mt-1 rounded-none"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 mt-1 rounded-none"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-16 rounded-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className=" rounded-none absolute inset-y-0 right-3 flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showPassword ? "Hide" : "View"}
                  </button>
                </div>
              </div>


              {/* ROLE */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-11 mt-1 rounded-none"
                />
              </div>

            </div>

            {/* =========================
        ROW 2 — PERMISSIONS
    ========================== */}
            <div className="mt-8">

              <h3 className="text-sm font-semibold mb-4 border-b pb-2">
                Permissions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

                {Object.keys(permissions).map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between border  px-3 py-2 hover:bg-gray-50"
                  >
                    <span className="text-xs">
                      {key.replaceAll("_", " ").replace("access ", "")}
                    </span>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={permissions[key as keyof typeof permissions]}
                        onChange={(e) =>
                          setPermissions({
                            ...permissions,
                            [key]: e.target.checked,
                          })
                        }
                      />

                      {/* Toggle Background */}
                      <div className="w-11 h-6 bg-gray-300  peer 
                  peer-checked:bg-green-500 
                  transition-colors duration-300">
                      </div>

                      {/* Toggle Circle */}
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white  
                  transition-transform duration-300
                  peer-checked:translate-x-5">
                      </div>
                    </label>

                  </div>
                ))}

              </div>
            </div>

            {/* =========================
        ROW 3 — BUTTONS
    ========================== */}
            <div className="flex justify-end gap-3 mt-8 border-t pt-5">

              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="px-6 rounded-none"
              >
                Cancel
              </Button>

              <Button
                onClick={createUser}
                className="px-6 rounded-none"
              >
                Create Admin
              </Button>

            </div>

          </div>
        )}



        {/* TABLE */}
        <div className="overflow-x-auto border">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center bg-neutral-100">SL</TableHead>
                <TableHead className="text-center bg-neutral-100">Actions</TableHead>
                <TableHead className="text-center bg-neutral-100">Name</TableHead>
                <TableHead className="text-center bg-neutral-100">Email</TableHead>
                <TableHead className="text-center bg-neutral-100">Role</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                </TableRow>
              )}

              {!loading && rows.map((u, i) => (
                <Fragment key={u.id}>
                  <TableRow>
                    <TableCell className="text-center">{i + 1}</TableCell>

                    <TableCell className="text-center">
                      <Button size="icon" variant="ghost" onClick={() => deleteUser(u.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>

                      <span onClick={() => editingId === u.id ? closeEdit() : openEdit(u)} className="cursor-pointer">
                        {editingId === u.id ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">{u.name}</TableCell>
                    <TableCell className="text-center">{u.email}</TableCell>
                    <TableCell className="text-center font-medium">{u.role}</TableCell>
                  </TableRow>

                  {editingId === u.id && (
                    <TableRow className="bg-neutral-50">
                      <TableCell colSpan={5}>

                        {/* BASIC INFO ROW */}
                        {/* BASIC INFO ROW */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">

                          {/* USERNAME */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Username
                            </label>
                            <Input
                              value={editData.name || ""}
                              onChange={(e) =>
                                setEditData({ ...editData, name: e.target.value })
                              }
                              className="h-10 rounded-none"
                            />
                          </div>

                          {/* EMAIL */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Email
                            </label>
                            <Input
                              value={editData.email || ""}
                              onChange={(e) =>
                                setEditData({ ...editData, email: e.target.value })
                              }
                              className="h-10 rounded-none"
                            />
                          </div>

                          {/* ROLE */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Role
                            </label>
                            <Input
                              value={editData.role || ""}
                              onChange={(e) =>
                                setEditData({ ...editData, role: e.target.value })
                              }
                              className="h-10 rounded-none"
                            />
                          </div>

                        </div>


                        {/* PERMISSIONS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 pb-4">

                          {Object.keys(permissions).map((key) => (
                            <div
                              key={key}
                              className="flex items-center justify-between border px-3 py-2"
                            >
                              <span className="text-xs">
                                {key.replaceAll("_", " ").replace("access ", "")}
                              </span>

                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={permissions[key as keyof typeof permissions]}
                                  onChange={(e) =>
                                    setPermissions({
                                      ...permissions,
                                      [key]: e.target.checked,
                                    })
                                  }
                                />

                                <div className="w-10 h-5 bg-gray-300 peer-checked:bg-green-500 transition-colors duration-300"></div>

                                <div className="absolute left-1 top-1 w-3.5 h-3.5 bg-white transition-transform duration-300 peer-checked:translate-x-5"></div>
                              </label>

                            </div>
                          ))}

                        </div>

                        {/* BUTTONS */}
                        <div className="flex gap-2 px-4 pb-4">
                          <Button size="sm" className='rounded-none' onClick={() => updateUser(u.id)}>
                            Save Changes
                          </Button>
                          <Button size="sm" className='rounded-none' variant="outline" onClick={closeEdit}>
                            Cancel
                          </Button>
                        </div>

                      </TableCell>
                    </TableRow>
                  )}

                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {errMsg && <div className="mt-3 text-sm text-red-600">{errMsg}</div>}

      </div>
    </ProtectedRoute>
  );
}
