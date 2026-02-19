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
import { CircleDashed } from 'lucide-react';
import { Circle } from 'lucide-react';
import { MapPin } from 'lucide-react';


/* ---------- ENUM options from SQL ---------- */
const SOURCES = ['Supplier', 'Website'] as const;
const AIRPORTS = ['LHR', 'LGW', 'STN', 'LTN', 'MAN', 'BHX', 'Other'] as const;
const SERVICES = ['Meet & Greet', 'Park & Ride', 'Meet & Greet (Indoor)'] as const;
const STATUSES = ['Active', 'Cancelled', 'Completed', 'No Show', 'Refunded'] as const;

/* ---------- Types ---------- */
type Booking = {
  terminal_id: number;
  terminal_name: string;
  terminal_code: string;
  city: string;
  country: string;
  description: string;
  gates_count: Number;
  status: string | null;
  floor_count: Number;
  built_year: Number;
  checkin_counters: Number;
  security_lanes: Number;
  parking_capacity: Number;
  operational_status: string;
  contact_phone: string;
  operating_hours: string;
  airline_count: number;
  emergency_exits: number;
  map_url: string;
  geo_zone: string;
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
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);

  /* ---------- Filters ---------- */
  const [status, setStatus] = useState('');
  const [airport, setAirport] = useState('');
  const [source, setSource] = useState('');
  const [service, setService] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [selectedDate, setSelectedDate] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");


  /* ---------- Inline Editing ---------- */
  const [openRowId, setOpenRowId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [form, setForm] = useState({
    terminal_name: "",
    terminal_code: "",
    city: "",
    gates_count: 0,
    floor_count: 0,
    parking_capacity: 0
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

      const res = await fetch(`${API_BASE_URL}/api/data/terminals-data`, {
        cache: 'no-store',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      if (!res.ok) throw new Error(await res.text());

      const json = await res.json();

      setRows(json.data || []);
      setTotal(json.total || 0);

    } catch (e) {
      console.error(e);
      setErrMsg('Failed to load terminals.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [
    page,
    status,
    airport,
    source,
    service,
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
    if (openRowId === b.terminal_id) {
      setOpenRowId(null);
      return;
    }
    setOpenRowId(b.terminal_id);
    setForm({
      terminal_name: b.terminal_name,
      terminal_code: b.terminal_code,
      city: b.city,
      gates_count: Number(b.gates_count),
      floor_count: Number(b.floor_count),
      parking_capacity: Number(b.parking_capacity),
    });

  };

  const saveEdit = async (id: number) => {
    setSaving(true);
    setSaveMsg("Saving...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/data/terminals-data/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(await res.text());

      setSaveMsg("Saved ✓");
      await fetchData();
      setTimeout(() => setSaveMsg(""), 1000);
      setOpenRowId(null);

    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };


  const deleteRow = async (id: number) => {
    if (!confirm("Delete this terminal?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/data/terminals-data/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Deleted");
      fetchData();

    } catch (err: any) {
      alert(err.message);
    }
  };


  return (
    <div className="w-full min-h-screen px-3 md:px-1">
      <div className="w-full pt-4">

        <div className="mb-3">
          <h6 className="text-sm md:text-lg lg:text-xl font-bold text-gray-900 tracking-wide">
            Heathrow International Airport, London
          </h6>
        </div>


        {/* TABLE */}
        <div className="overflow-x-auto border rounded-lg w-full">
          <Table className="w-full text-xs border-separate border-spacing-0">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center bg-neutral-100">S.L</TableHead>
                <TableHead className="text-center bg-neutral-100">Actions</TableHead>
                <TableHead className="text-center bg-neutral-100">Name</TableHead>
                <TableHead className="text-center bg-neutral-100">Code</TableHead>

                <TableHead className="text-center bg-neutral-100">City</TableHead>
                <TableHead className="text-center bg-neutral-100">Country</TableHead>
                <TableHead className="text-center bg-neutral-100">Gates</TableHead>
                <TableHead className="text-center bg-neutral-100">Floor</TableHead>
                {/* <TableHead className="text-center bg-neutral-100">Year</TableHead> */}
                {/* <TableHead className="text-center bg-neutral-100">Counters</TableHead> */}
                {/* <TableHead className="text-center bg-neutral-100">Lanes</TableHead> */}
                <TableHead className="text-center bg-neutral-100">Capacity</TableHead>
                {/* <TableHead className="text-center bg-neutral-100">Contact</TableHead> */}
                {/* <TableHead className="text-center bg-neutral-100">Hours</TableHead> */}
                {/* <TableHead className="text-center bg-neutral-100">Airline</TableHead> */}
                {/* <TableHead className="text-center bg-neutral-100">Exists</TableHead> */}
                <TableHead className="text-center bg-neutral-100">Map</TableHead>
                <TableHead className="text-center bg-neutral-100">Geo Zone</TableHead>
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
                    No Terminals found.
                  </TableCell>
                </TableRow>
              )}

              {!loading && rows.map((b, i) => {
                const sl = (page - 1) * limit + (i + 1);
                const editorOpen = openRowId === b.terminal_id;

                return (
                  <Fragment key={b.terminal_id}>

                    <TableRow key={`row-${b.terminal_id}`}>
                      <TableCell className="text-center py-2">{sl}</TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">



                          {/* EDIT BUTTON */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={() => openEdit(b)}
                          >
                            {editorOpen ? (
                              <X className="h-3.5 w-3.5" />
                            ) : (
                              <Pencil className="h-3.5 w-3.5" />
                            )}
                          </Button>

                          {/* DELETE BUTTON */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteRow(b.terminal_id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>

                          {/* NOTES BUTTON */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                key={`notes-${b.terminal_id}`}
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                              >
                                <Lightbulb
                                  className={`h-3.5 w-3.5 ${b.description && b.description.trim() !== ""
                                    ? "text-red-500"
                                    : "text-green-600"
                                    }`}
                                />
                              </Button>
                            </TooltipTrigger>

                            <TooltipContent className="max-w-xs text-xs">
                              {b.description && b.description.trim() !== ""
                                ? b.description
                                : "No notes"}
                            </TooltipContent>
                          </Tooltip>


                          {/* STATUS CIRCLE WITH TOOLTIP */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                key={`status-${b.terminal_id}`}
                                className="flex ml-2 items-center justify-center p-0 m-0 bg-transparent border-none"
                              >
                                <Circle
                                  className={`h-4 w-4 
                                                                            ${b.operational_status === "Operational"
                                      ? "text-green-500"
                                      : b.operational_status === "Under Maintenance"
                                        ? "text-yellow-500"
                                        : b.operational_status === "Closed"
                                          ? "text-red-500"
                                          : "text-gray-400"
                                    }`}
                                />
                              </button>
                            </TooltipTrigger>

                            <TooltipContent className="text-xs">
                              {b.operational_status || "Unknown Status"}
                            </TooltipContent>
                          </Tooltip>


                        </div>
                      </TableCell>




                      <TableCell className="text-center">{b.terminal_name}</TableCell>
                      <TableCell className="text-center text-blue-400">{b.terminal_code}</TableCell>
                      <TableCell className="text-center">{b.city}</TableCell>
                      <TableCell className="text-center">{b.country}</TableCell>
                      <TableCell className="text-center">{`${b.gates_count}`}</TableCell>
                      <TableCell className="text-center">{`${b.floor_count}`}</TableCell>
                      {/* <TableCell className="text-center">{`${b.built_year}`}</TableCell> */}
                      {/* <TableCell className="text-center">{`${b.checkin_counters}`}</TableCell> */}
                      {/* <TableCell className="text-center">{`${b.security_lanes}`}</TableCell> */}
                      <TableCell className="text-center">{`${b.parking_capacity}`}</TableCell>
                      {/* <TableCell className="text-center">{`${b.contact_phone}`}</TableCell> */}
                      {/* <TableCell className="text-center">{`${b.operating_hours}`}</TableCell> */}
                      {/* <TableCell className="text-center">{`${b.airline_count}`}</TableCell> */}
                      {/* <TableCell className="text-center">{`${b.emergency_exits}`}</TableCell> */}
                      <TableCell className="text-center">
                        <a
                          href={b.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center"
                        >
                          <MapPin className="h-4 w-4 text-blue-600 cursor-pointer hover:scale-110 transition" />
                        </a>
                      </TableCell>

                      <TableCell className="text-center">{`${b.geo_zone}`}</TableCell>
                    </TableRow>

                    {/* INLINE EDITOR */}


                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>



      </div>
    </div>
  );
}
