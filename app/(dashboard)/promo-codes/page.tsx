'use client';

import { StickyNote, Pencil, Trash2, X, Handshake, SquareParking } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ===========================
   SQL TYPE MAPPING
=========================== */
type PromoCode = {
  id: number;
  promo_code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  usage_limit: number | null;
  used_count: number;
  start_date: string | null;
  expiry_date: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

function getPromoStatus(
  startDate?: string | null,
  expiryDate?: string | null
): "Active" | "Coming" | "Expired" {
  const now = new Date();

  const start = startDate ? new Date(startDate) : null;
  const expiry = expiryDate ? new Date(expiryDate) : null;

  if (expiry && now > expiry) return "Expired";
  if (start && now < start) return "Coming";
  return "Active";
}



/* ===========================
   DATE FORMAT
=========================== */
function formatFullDate(dateString?: string | null) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Convert DB datetime -> input datetime-local (YYYY-MM-DDTHH:mm)
function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

// Convert input datetime-local -> DB datetime string (YYYY-MM-DD HH:mm:ss)
function fromDateTimeLocal(value?: string) {
  if (!value) return null;
  return value.replace("T", " ") + ":00";
}


/* ===========================
   MAIN COMPONENT
=========================== */
export default function PromoCodesPage() {
  const [rows, setRows] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const fiveDaysLater = new Date(today);
  fiveDaysLater.setDate(today.getDate() + 5);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<PromoCode>>({});

  /* FORM STATE */
  const [promoCode, setPromoCode] = useState("");
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [usageLimit, setUsageLimit] = useState("");
  const [startDate, setStartDate] = useState(formatDate(tomorrow));
  const [expiryDate, setExpiryDate] = useState(formatDate(fiveDaysLater));

  /* ===========================
     FETCH PROMO CODES
  =========================== */
  const fetchPromoCodes = async () => {
    setLoading(true);
    setErrMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/promocodes`, {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());
      setRows(await res.json());
    } catch (e) {
      setErrMsg("Failed to load promo codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  /* ===========================
     OPEN EDIT (FETCH SINGLE PROMO)
  =========================== */
  const openEdit = async (promo: PromoCode) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/promocodes/${promo.id}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) throw new Error(await res.text());

      const data: PromoCode = await res.json();

      setEditingId(data.id);
      setEditData({
        promo_code: data.promo_code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        usage_limit: data.usage_limit,
        start_date: toDateTimeLocal(data.start_date),
        expiry_date: toDateTimeLocal(data.expiry_date),
      });
    } catch (err: any) {
      alert(err.message || "Failed to load promo details");
    }
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  /* ===========================
     UPDATE PROMO
  =========================== */
  const updatePromo = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/promocodes/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promo_code: editData.promo_code,
          discount_type: editData.discount_type,
          discount_value: editData.discount_value,
          usage_limit: editData.usage_limit,
          start_date: editData.start_date || null,
          expiry_date: editData.expiry_date || null,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Promo code updated");
      closeEdit();
      fetchPromoCodes();
    } catch (err: any) {
      alert(err.message || "Failed to update promo");
    }
  };

  /* ===========================
     CREATE PROMO CODE
  =========================== */
  const createPromo = async () => {
    if (!promoCode || !discountValue) {
      alert("Promo code and value are required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/insert/promocodes`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promo_code: promoCode,
          discount_type: discountType,
          discount_value: discountValue,
          usage_limit: usageLimit ? Number(usageLimit) : null,
          start_date: startDate || null,
          expiry_date: expiryDate || null,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Promo code created successfully");

      setPromoCode("");
      setDiscountValue(0);
      setUsageLimit("");
      setStartDate("");
      setExpiryDate("");
      setShowForm(false);

      fetchPromoCodes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  /* ===========================
     DELETE PROMO
  =========================== */
  const deletePromo = async (id: number) => {
    if (!window.confirm("Delete this promo code?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/promocodes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Promo code deleted successfully");
      fetchPromoCodes();
    } catch (err: any) {
      alert(err.message || "Failed to delete promo code");
    }
  };

  return (
    <ProtectedRoute>
      <div className="w-full px-3 md:px-1">
        <div className="pt-4">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-3">
            <h6 className="text-lg font-bold text-gray-900">Promo Codes</h6>

            <Button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 rounded-none"
            >
              <Plus size={16} />
              Add Promo Code
            </Button>
          </div>

          {/* CREATE FORM (TOP) */}
          {showForm && (
            <div className="mb-6 border  p-4 bg-neutral-50">
              <h6 className="font-semibold mb-4">Create Promo Code</h6>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

                {/* Start Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">
                    Start Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="cursor-pointer rounded-none"
                  />
                </div>

                {/* Expiry Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="cursor-pointer rounded-none"
                  />
                </div>

                {/* Promo Code */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">
                    Promo Code
                  </label>
                  <Input
                    className='rounded-none'
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  />
                </div>

                {/* Discount Type */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">
                    Discount Type
                  </label>
                  <select
                    className="border -md px-2 h-9 text-sm"
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">
                    Discount Value
                  </label>
                  <Input
                    className='rounded-none'
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                  />
                </div>

                {/* Usage Limit */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">
                    Usage Limit
                  </label>
                  <Input
                  className='rounded-none'
                    value={usageLimit}
                    onChange={e => setUsageLimit(e.target.value)}
                  />
                </div>

              </div>

              <div className="mt-4 flex gap-2">
                <Button className='rounded-none' onClick={createPromo}>Save</Button>
                <Button className='rounded-none' variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto border ">
            <Table className="w-full text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center bg-neutral-100">S.L</TableHead>
                  <TableHead className="text-center bg-neutral-100">Actions</TableHead>
                  <TableHead className="text-center bg-neutral-100">Promo Code</TableHead>
                  <TableHead className="text-center bg-neutral-100">Type</TableHead>
                  <TableHead className="text-center bg-neutral-100">Value</TableHead>
                  <TableHead className="text-center bg-neutral-100">Usage Limit</TableHead>
                  <TableHead className="text-center bg-neutral-100">Start Date</TableHead>
                  <TableHead className="text-center bg-neutral-100">Expiry Date</TableHead>
                  <TableHead className="text-center bg-neutral-100">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-4 text-center">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}

                {!loading && rows.map((pc, i) => (
                  <Fragment key={pc.id}>
                    <TableRow>
                      <TableCell className="text-center">{i + 1}</TableCell>

                      <TableCell className="text-center">
                        <Button size="icon" variant="ghost" onClick={() => deletePromo(pc.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>

                        <span
                          onClick={() => (editingId === pc.id ? closeEdit() : openEdit(pc))}
                          className="cursor-pointer"
                          title="Edit"
                        >
                          {editingId === pc.id ? (
                            <X className="h-3.5 w-3.5" />
                          ) : (
                            <Pencil className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </TableCell>

                      <TableCell className="text-center font-semibold text-blue-600">
                        {pc.promo_code}
                      </TableCell>

                      <TableCell className="text-center">{pc.discount_type}</TableCell>

                      <TableCell className="text-center">
                        {pc.discount_type === "percentage"
                          ? `${pc.discount_value}%`
                          : `£${pc.discount_value}`}
                      </TableCell>

                      <TableCell className="text-center">
                        {pc.usage_limit ?? "Unlimited"}
                      </TableCell>

                      <TableCell className="text-center">
                        {formatFullDate(pc.start_date)}
                      </TableCell>

                      <TableCell className="text-center">
                        {formatFullDate(pc.expiry_date)}
                      </TableCell>

                      <TableCell className="text-center font-medium">
                        {(() => {
                          const status = getPromoStatus(pc.start_date, pc.expiry_date);

                          if (status === "Active") return (
                            <span className="text-green-600">Active</span>
                          );

                          if (status === "Coming") return (
                            <span className="text-yellow-600">Coming</span>
                          );

                          return (
                            <span className="text-red-600">Expired</span>
                          );
                        })()}
                      </TableCell>
                    </TableRow>

                    {editingId === pc.id && (
                      <TableRow className="bg-neutral-50">
                        <TableCell colSpan={9}>
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3">

                            <Input
                              value={editData.promo_code || ""}
                              onChange={e => setEditData({ ...editData, promo_code: e.target.value })}
                              placeholder="Promo Code"
                            />

                            <select
                              className="border h-9 px-2 text-sm"
                              value={editData.discount_type}
                              onChange={e =>
                                setEditData({ ...editData, discount_type: e.target.value as any })
                              }
                            >
                              <option value="fixed">Fixed</option>
                              <option value="percentage">Percentage</option>
                            </select>

                            <Input
                              type="number"
                              value={Number(editData.discount_value ?? 0)}
                              onChange={e =>
                                setEditData({ ...editData, discount_value: Number(e.target.value) })
                              }
                              placeholder="Discount"
                            />

                            <Input
                              type="number"
                              value={(editData.usage_limit ?? "") as any}
                              onChange={e =>
                                setEditData({
                                  ...editData,
                                  usage_limit: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                              placeholder="Usage Limit"
                            />

                            <Input
                              type="datetime-local"
                              value={(editData.start_date as string) || ""}
                              onChange={e =>
                                setEditData({ ...editData, start_date: e.target.value })
                              }
                              onClick={(e) => e.currentTarget.showPicker?.()}
                            />

                            <Input
                              type="datetime-local"
                              value={(editData.expiry_date as string) || ""}
                              onChange={e =>
                                setEditData({ ...editData, expiry_date: e.target.value })
                              }
                              onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                          </div>

                          <div className="flex gap-2 px-3 pb-3">
                            <Button className='rounded-none' size="sm" onClick={() => updatePromo(pc.id)}>
                              Save
                            </Button>
                            <Button className='rounded-none' size="sm" variant="outline" onClick={closeEdit}>
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

          {errMsg ? (
            <div className="mt-3 text-sm text-red-600">{errMsg}</div>
          ) : null}

        </div>
      </div>
    </ProtectedRoute>
  );
}
