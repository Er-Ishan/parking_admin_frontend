"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import ProtectedRoute from "../ProtectedRoute";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Charge = {
  id: number;
  charge_name: string;
  price: number;
  is_enabled: number;
};

export default function AmendedCharges() {
  const [rows, setRows] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    charge_name: "",
    price: "",
    is_enabled: true,
  });

  /* ---------------- GET ---------------- */
  const fetchCharges = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/charges/amended`);
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  /* ---------------- ADD ---------------- */
  const addCharge = async () => {
    if (!form.charge_name.trim()) {
      alert("Charge name required");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/charges/amended`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        charge_name: form.charge_name,
        price: Number(form.price) || 0,
        is_enabled: form.is_enabled ? 1 : 0,
      }),
    });

    const json = await res.json();
    if (json?.data) setRows((prev) => [...prev, json.data]);

    setForm({ charge_name: "", price: "", is_enabled: true });
    setShowForm(false);
  };

  /* ---------------- UPDATE PRICE ---------------- */
  const updatePrice = async (id: number, price: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, price } : r))
    );

    await fetch(`${API_BASE_URL}/api/charges/${id}/price`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
  };

  /* ---------------- TOGGLE ---------------- */
  const toggleAccess = async (c: Charge) => {
    const value = c.is_enabled ? 0 : 1;

    setRows((prev) =>
      prev.map((r) => (r.id === c.id ? { ...r, is_enabled: value } : r))
    );

    await fetch(`${API_BASE_URL}/api/charges/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_enabled: value }),
    });
  };

  /* ---------------- DELETE ---------------- */
  const deleteCharge = async (id: number) => {
    if (!confirm("Delete this charge?")) return;

    setRows((prev) => prev.filter((r) => r.id !== id));

    await fetch(`${API_BASE_URL}/api/charges/${id}`, {
      method: "DELETE",
    });
  };

  return (
    <ProtectedRoute>
      <div className="w-full mb-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3 border-b py-2">
          <h2 className="text-lg font-semibold">Amended Charges</h2>
          <Button
            className="h-8 px-3 text-xs rounded-none"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Charge
          </Button>
        </div>

        {/* ADD FORM */}
        {showForm && (
          <div className="mb-4 p-4 bg-gray-50 border">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Charge Name"
                className="w-64"
                value={form.charge_name}
                onChange={(e) =>
                  setForm({ ...form, charge_name: e.target.value })
                }
              />

              <Input
                type="number"
                placeholder="Price"
                className="w-32"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
              />

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.is_enabled}
                  onChange={() =>
                    setForm({ ...form, is_enabled: !form.is_enabled })
                  }
                />
                <div className="w-10 h-5 bg-gray-300 peer-checked:bg-green-500 relative after:absolute after:content-[''] after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
              </label>

              <Button size="sm" onClick={addCharge}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="border bg-white overflow-x-auto">
          <Table className="w-full text-sm table-fixed">
            <TableHeader>
              <TableRow className="bg-neutral-100">
                <TableHead className="w-10 text-center">S.L.</TableHead>
                <TableHead className="w-20">Charge Name</TableHead>
                <TableHead className="w-32 text-center">Price</TableHead>
                <TableHead className="w-24 text-center">Enabled</TableHead>
                <TableHead className="w-20 text-center">Delete</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((c, i) => (
                <TableRow key={c.id} className="h-12">
                  <TableCell className="text-center">{i + 1}</TableCell>

                  <TableCell className="truncate">
                    {c.charge_name}
                  </TableCell>

                  <TableCell className="text-center">
                    <Input
                      type="number"
                      className="w-24 text-right mx-auto"
                      value={c.price}
                      onChange={(e) =>
                        updatePrice(c.id, Number(e.target.value))
                      }
                    />
                  </TableCell>

                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={!!c.is_enabled}
                      onChange={() => toggleAccess(c)}
                    />
                  </TableCell>

                  <TableCell className="text-center">
                    <button onClick={() => deleteCharge(c.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}

              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No charges found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
