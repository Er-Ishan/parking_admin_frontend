"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, X, ExternalLink, Plus } from "lucide-react";
import { Eye } from 'lucide-react';
import ProtectedRoute from "@/components/ProtectedRoute";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const API = `${API_BASE_URL}/api/data`;

type Terminal = {
    terminal_id: number;
    terminal_name: string;
    terminal_code: string;
    availability: string;
    gate_count: number;
    operational_status: string;
};


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

type Airport = {
    airport_id: number;
    airport_name: string;
    iata_code: string;
    icao_code: string;
    country: string;
    city: string;
    total_terminals: number;
    airport_type: string;
    website: string;
};

export default function AirportsPage() {
    const [rows, setRows] = useState<Airport[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [total, setTotal] = useState(0);

    const [openRow, setOpenRow] = useState<number | null>(null);
    const [form, setForm] = useState<any>({});
    const [saveMsg, setSaveMsg] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);

    const [openTerminalAirport, setOpenTerminalAirport] = useState<number | null>(null);
    const [terminalName, setTerminalName] = useState("");
    const [terminalMsg, setTerminalMsg] = useState("");

    const [selectedAirport, setSelectedAirport] = useState<number | null>(null);
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [terminalLoading, setTerminalLoading] = useState(false);

    const [terminalCode, setTerminalCode] = useState("");
    const [availability, setAvailability] = useState("Available");
    const [gateCount, setGateCount] = useState(0);
    const [operationalStatus, setOperationalStatus] = useState("Operational");


    const fetchTerminals = async (airport_id: number) => {
        setTerminalLoading(true);
        setSelectedAirport(airport_id);

        const res = await fetch(
            `${API_BASE_URL}/api/data/parking-terminals/${airport_id}`,{credentials: "include",}
        );

        const data = await res.json();
        setTerminals(data);
        setTerminalLoading(false);
    };




    const [newAirport, setNewAirport] = useState({
        airport_name: "",
        iata_code: "",
        icao_code: "",
        country: "",
        city: "",
        total_terminals: 0,
        airport_type: "",
        website: "",
    });

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

    // -----------------------------------------------------
    // FETCH DATA
    // -----------------------------------------------------
    const fetchData = async () => {
        setLoading(true);

        const res = await fetch(`${API_BASE}/api/data/airport-data`,{credentials: "include",});
        const json = await res.json();

        let filtered = json.filter((a: Airport) =>
            a.airport_name.toLowerCase().includes(search.toLowerCase()) ||
            a.city.toLowerCase().includes(search.toLowerCase()) ||
            a.country.toLowerCase().includes(search.toLowerCase()) ||
            a.iata_code.toLowerCase().includes(search.toLowerCase())
        );

        setTotal(filtered.length);

        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);

        setRows(paginated);
        setLoading(false);
    };

    const deleteTerminal = async (terminal_id: number) => {
        if (!confirm("Delete this terminal?")) return;

        const res = await fetch(
            `${API_BASE_URL}/api/data/delete-parking-terminal/${terminal_id}`,
            {
                method: "DELETE",
                credentials: "include",
            }
        );

        if (res.ok && selectedAirport) {
            fetchTerminals(selectedAirport); // refresh terminals list
        } else {
            alert("Failed to delete terminal");
        }
    };


    const submitTerminal = async (airport_id: number) => {
        if (!terminalName) {
            alert("Terminal name is required");
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE_URL}/api/insert/parking-terminals`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        airport_id,
                        terminal_name: terminalName,
                        terminal_code: terminalCode,
                        availability,
                        gate_count: gateCount,
                        operational_status: operationalStatus,
                    }),

                }
            );

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            setTerminalMsg("Terminal added ✓");
            setTerminalName("");

            setTimeout(() => {
                setTerminalMsg("");
                setOpenTerminalAirport(null);
                fetchData();
            }, 800);

        } catch (err: any) {
            alert(err.message);
        }
    };


    useEffect(() => {
        fetchData();
    }, [page, search]);

    // -----------------------------------------------------
    // OPEN EDIT ROW
    // -----------------------------------------------------
    const openEdit = (row: Airport) => {
        setForm(row);
        setOpenRow(openRow === row.airport_id ? null : row.airport_id);
    };

    // -----------------------------------------------------
    // SAVE EDIT
    // -----------------------------------------------------
    const saveEdit = async (id: number) => {
        setSaveMsg("Saving...");

        const res = await fetch(`${API_BASE}/api/data/update-airport/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            setSaveMsg("Saved ✓");
            fetchData();
            setTimeout(() => setSaveMsg(""), 800);
            setOpenRow(null);
        } else {
            setSaveMsg("Error saving");
        }
    };

    // -----------------------------------------------------
    // DELETE AIRPORT
    // -----------------------------------------------------
    const deleteAirport = async (id: number) => {
        if (!confirm("Delete this airport?")) return;

        const res = await fetch(`${API_BASE}/api/data/delete-airport/${id}`, { method: "DELETE",credentials: "include", });

        if (res.ok) fetchData();
    };

    // -----------------------------------------------------
    // ADD AIRPORT SUBMIT FORM
    // -----------------------------------------------------
    const submitNewAirport = async () => {
        const res = await fetch(`${API_BASE}/api/data/add-my-airport`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAirport),
        });

        if (res.ok) {
            alert("Airport Added Successfully!");

            setShowAddForm(false);

            setNewAirport({
                airport_name: "",
                iata_code: "",
                icao_code: "",
                country: "",
                city: "",
                total_terminals: 0,
                airport_type: "",
                website: "",
            });

            fetchData();
        } else {
            alert("Failed to add airport");
        }
    };

    const addTerminal = (airport_id: number) => {
        setOpenTerminalAirport(
            openTerminalAirport === airport_id ? null : airport_id
        );
        setTerminalName("");
        setTerminalMsg("");
        setTerminalCode("");
        setAvailability("Available");
        setGateCount(0);
        setOperationalStatus("Operational");

    };


    return (
        <ProtectedRoute>
            <div className="w-full min-h-screen p-4">
                <div className="mx-auto">

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Airports</h2>



                        <div className="flex items-center gap-2">



                            <Input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-[300px] rounded-none text-sm"
                            />

                            <Button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="flex rounded-none gap-1 items-center bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Plus className="h-4" /> Add Airport
                            </Button>
                        </div>
                    </div>

                    {/* ADD AIRPORT FORM */}
                    {showAddForm && (
                        <div className="border p-4 bg-neutral-50  mb-4 shadow-sm">
                            <h3 className="text-base font-semibold mb-3">Add New Airport</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                {Object.keys(newAirport).map((field) => (
                                    <div key={field}>
                                        <label className="text-xs font-semibold">
                                            {field.replace(/_/g, " ").toUpperCase()}
                                        </label>

                                        <Input
                                            className="h-9 text-xs"
                                            type={field === "total_terminals" ? "number" : "text"}
                                            value={(newAirport as any)[field]}
                                            onChange={(e) =>
                                                setNewAirport({
                                                    ...newAirport,
                                                    [field]:
                                                        field === "total_terminals"
                                                            ? Number(e.target.value)
                                                            : e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                ))}

                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button size="sm" onClick={submitNewAirport}>Submit</Button>
                                <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                            </div>
                        </div>
                    )}

                    {openTerminalAirport && (
                        <div className="mb-6  border bg-white shadow-sm">

                            {/* HEADER */}
                            <div className="flex items-center justify-between px-5 py-3 border-b bg-neutral-50 ">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Add Terminal
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Airport ID: {openTerminalAirport}
                                    </p>
                                </div>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setOpenTerminalAirport(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* BODY */}
                            <div className="px-5 py-4">
                                <div
                                    className="
      grid
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-5
      gap-4
      w-full
    "
                                >
                                    {/* Terminal Name */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Terminal Name
                                        </label>
                                        <Input
                                            value={terminalName}
                                            onChange={(e) => setTerminalName(e.target.value)}
                                            className="h-9 text-sm"
                                        />
                                    </div>

                                    {/* Terminal Code */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Terminal Code
                                        </label>
                                        <Input
                                            value={terminalCode}
                                            onChange={(e) => setTerminalCode(e.target.value)}
                                            className="h-9 text-sm"
                                        />
                                    </div>

                                    {/* Availability */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Availability
                                        </label>
                                        <select
                                            className="w-full h-9 border  px-2 text-sm"
                                            value={availability}
                                            onChange={(e) => setAvailability(e.target.value)}
                                        >
                                            <option>Available</option>
                                            <option>Unavailable</option>
                                        </select>
                                    </div>

                                    {/* Gate Count */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Gate Count
                                        </label>
                                        <Input
                                            type="text"
                                            value={gateCount}
                                            onChange={(e) => setGateCount(Number(e.target.value))}
                                            className="h-9 text-sm"
                                        />
                                    </div>

                                    {/* Operational Status */}
                                    <div>
                                        <label className="block text-xs font-medium mb-1">
                                            Operational Status
                                        </label>
                                        <select
                                            className="w-full h-9 border  px-2 text-sm"
                                            value={operationalStatus}
                                            onChange={(e) => setOperationalStatus(e.target.value)}
                                        >
                                            <option>Operational</option>
                                            <option>Maintenance</option>
                                            <option>Closed</option>
                                        </select>
                                    </div>
                                </div>

                                {terminalMsg && (
                                    <p className="text-xs text-green-600 mt-2">{terminalMsg}</p>
                                )}
                            </div>



                            {/* FOOTER */}
                            <div className="flex justify-end gap-2 px-5 py-3 border-t bg-neutral-50 -b-xl">
                                <Button
                                    size="sm"
                                    onClick={() => submitTerminal(openTerminalAirport)}
                                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                    Save
                                </Button>


                            </div>

                        </div>
                    )}


                    {/* TABLE */}
                    <div className="border  overflow-x-auto">
                        <Table className="text-xs w-full">

                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center bg-neutral-100">S.L</TableHead>
                                    <TableHead className="text-center bg-neutral-100">Actions</TableHead>
                                    <TableHead className="text-center bg-neutral-100">Name</TableHead>
                                    <TableHead className="text-center bg-neutral-100">IATA</TableHead>
                                    <TableHead className="text-center bg-neutral-100">ICAO</TableHead>
                                    <TableHead className="text-center bg-neutral-100">Country</TableHead>
                                    <TableHead className="text-center bg-neutral-100">City</TableHead>
                                    {/* <TableHead className="text-center bg-neutral-100">Terminals</TableHead> */}
                                    <TableHead className="text-center bg-neutral-100">Type</TableHead>
                                    <TableHead className="text-center bg-neutral-100">Website</TableHead>
                                    <TableHead className="text-center bg-neutral-100">Add Terminal</TableHead>
                                    <TableHead className="text-center bg-neutral-100">
                                        View Terminals
                                    </TableHead>

                                </TableRow>
                            </TableHeader>

                            <TableBody>

                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={12} className="text-center py-3">
                                            Loading…
                                        </TableCell>
                                    </TableRow>
                                )}

                                {rows.map((a, i) => {
                                    const sl = (page - 1) * limit + (i + 1);
                                    const isOpen = openRow === a.airport_id;

                                    return (
                                        <Fragment key={a.airport_id}>
                                            <TableRow>
                                                <TableCell className="text-center">{sl}</TableCell>

                                                {/* ACTION BUTTONS */}
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center items-center gap-3">

                                                        {/* EDIT ICON */}
                                                        <span
                                                            onClick={() => openEdit(a)}
                                                            title={isOpen ? "Close Edit" : "Edit Airport"}
                                                            className="cursor-pointer text-blue-600 hover:text-blue-600 transition"
                                                        >
                                                            {isOpen ? (
                                                                <X className="h-4 w-4" />
                                                            ) : (
                                                                <Pencil className="h-4 w-4" />
                                                            )}
                                                        </span>

                                                        {/* DELETE ICON */}
                                                        <span
                                                            onClick={() => deleteAirport(a.airport_id)}
                                                            title="Delete Airport"
                                                            className="cursor-pointer text-red-600 hover:text-red-600 transition"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </span>

                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-center">{a.airport_name}</TableCell>

                                                <TableCell className="text-center">{a.iata_code}</TableCell>
                                                <TableCell className="text-center">{a.icao_code}</TableCell>
                                                <TableCell className="text-center">{a.country}</TableCell>
                                                <TableCell className="text-center">{a.city}</TableCell>
                                                {/* <TableCell className="text-center">{a.total_terminals}</TableCell> */}
                                                <TableCell className="text-center">{a.airport_type}</TableCell>

                                                <TableCell className="text-center">
                                                    {a.website ? (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                window.open(
                                                                    a.website.startsWith("http") ? a.website : `https://${a.website}`,
                                                                    "_blank"
                                                                )
                                                            }
                                                        >
                                                            <ExternalLink className="h-4 text-blue-600" />
                                                        </Button>
                                                    ) : "-"}
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <span
                                                        onClick={() => addTerminal(a.airport_id)}
                                                        title="Add Terminal"
                                                        className="inline-flex items-center justify-center cursor-pointer
               text-green-600 hover:text-green-600 transition"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </span>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <span
                                                        onClick={() => fetchTerminals(a.airport_id)}
                                                        title="View Terminals"
                                                        className="inline-flex items-center justify-center cursor-pointer
               text-blue-600 hover:text-blue-600 transition"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </span>
                                                </TableCell>



                                            </TableRow>



                                            {/* EDIT ROW */}
                                            {isOpen && (
                                                <TableRow>
                                                    <TableCell colSpan={12}>
                                                        <div className="border p-4 bg-neutral-50  mt-3 shadow-sm">

                                                            <h3 className="text-base font-semibold mb-4">Edit Airport</h3>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                                                {Object.keys(newAirport).map((field) => (
                                                                    <div key={field}>
                                                                        <label className="text-xs font-semibold">
                                                                            {field.replace(/_/g, " ").toUpperCase()}
                                                                        </label>

                                                                        <Input
                                                                            className="h-9 text-xs"
                                                                            type={field === "total_terminals" ? "number" : "text"}
                                                                            value={form[field]}
                                                                            onChange={(e) =>
                                                                                setForm({
                                                                                    ...form,
                                                                                    [field]:
                                                                                        field === "total_terminals"
                                                                                            ? Number(e.target.value)
                                                                                            : e.target.value,
                                                                                })
                                                                            }
                                                                        />
                                                                    </div>
                                                                ))}

                                                            </div>

                                                            <div className="flex justify-end gap-2 mt-4">
                                                                <Button size="sm" onClick={() => saveEdit(a.airport_id)}>Save</Button>

                                                                <Button size="sm" variant="outline" onClick={() => setOpenRow(null)}>
                                                                    Cancel
                                                                </Button>
                                                            </div>

                                                            {saveMsg && <p className="text-xs mt-1">{saveMsg}</p>}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                        </Fragment>
                                    );
                                })}

                            </TableBody>
                        </Table>

                        {selectedAirport && (
                            <div className="mt-6 border  shadow-sm">
                                <div className="px-4 py-3 border-b bg-neutral-50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Terminals for Airport ID: {selectedAirport}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Total: {terminals.length}
                                        </p>
                                    </div>

                                    <span
                                        onClick={() => setSelectedAirport(null)}
                                        title="Close"
                                        className="inline-flex items-center justify-center cursor-pointer
             text-gray-600 hover:text-gray-800 transition"
                                    >
                                        <X className="h-4 w-4" />
                                    </span>

                                </div>

                                <Table className="text-xs w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-center bg-neutral-100">S. L.</TableHead>
                                            <TableHead className="text-center bg-neutral-100">Name</TableHead>
                                            <TableHead className="text-center bg-neutral-100">Status</TableHead>
                                            <TableHead className="text-center bg-neutral-100">Actions</TableHead>

                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {terminalLoading && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center py-3">
                                                    Loading…
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {!terminalLoading && terminals.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center py-3">
                                                    No terminals found
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {terminals.map((t, i) => (
                                            <TableRow key={t.terminal_id}>
                                                <TableCell className="text-center">{i + 1}</TableCell>

                                                <TableCell className="text-center">{t.terminal_name}</TableCell>
                                                <TableCell className="text-center">{t.operational_status}</TableCell>

                                                <TableCell className="text-center">
                                                    <span
                                                        onClick={() => deleteTerminal(t.terminal_id)}
                                                        className="cursor-pointer text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 inline" />
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                    </TableBody>
                                </Table>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </ProtectedRoute>
    );
}
