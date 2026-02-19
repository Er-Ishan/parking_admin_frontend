'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Booking = {
  id: number;
  ref_no: string;
  source: string;
  airport: string;
  service_type: string;
  customer_name: string;
  contact_no: string | null;
  customer_email: string | null;
  booked_on: string;
  dropoff_datetime: string;
  return_datetime: string;
  vehicle_reg_no: string | null;
  price: number;
  status: string;
  notes: string | null;
};

type BookingListResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Booking[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const SOURCES = ['Supplier','Direct','Partner','Website','Call Centre'] as const;
const AIRPORTS = ['Heathrow','Gatwick','Stansted','Luton','Manchester','Birmingham','Other'] as const;
const SERVICES = ['Meet & Greet','Park & Ride','Meet & Greet (Indoor)'] as const;
const STATUSES = ['Booking Active','Cancelled','Completed','No Show','Refunded','Pending'] as const;

/** cookie helper */
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
    weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}
function money(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(n);
  } catch {
    return `£${Number(n || 0).toFixed(2)}`;
  }
}
function todayYMD() {
  const d = new Date();
  const pad = (n:number) => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // table state
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'booked_on'|'dropoff'|'return'|'price'|'created_at'>('booked_on');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('desc');

  // filter state (bound to URL)
  const [q, setQ]               = useState('');
  const [source, setSource]     = useState<string | ''>('');
  const [airport, setAirport]   = useState<string | ''>('');
  const [service, setService]   = useState<string | ''>('');
  const [status, setStatus]     = useState<string | ''>('');
  const [from, setFrom]         = useState<string>(''); // YYYY-MM-DD
  const [to, setTo]             = useState<string>(''); // YYYY-MM-DD

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  // Load initial filters from URL (and handle preset)
  useEffect(() => {
    const sp = new URLSearchParams(searchParams?.toString() || '');

    // preset handling
    const preset = sp.get('preset');
    if (preset === 'today') {
      const t = todayYMD();
      sp.set('from', t);
      sp.set('to',   t);
      sp.delete('preset');
      router.replace(`/bookings?${sp.toString()}`, { scroll: false });
    }
    if (preset === 'search') {
      // just focus search field
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }

    // apply to state
    setQ(sp.get('q') || '');
    setSource(sp.get('source') || '');
    setAirport(sp.get('airport') || '');
    setService(sp.get('service_type') || '');
    setStatus(sp.get('status') || '');
    setFrom(sp.get('from') || '');
    setTo(sp.get('to') || '');
    setPage(Number(sp.get('page') || 1));
    setLimit(Number(sp.get('limit') || 50));
    setSortBy((sp.get('sortBy') as any) || 'booked_on');
    setSortOrder((sp.get('sortOrder') as any) || 'desc');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // keep URL in sync when filters change (debounced for q)
  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (source) sp.set('source', source);
    if (airport) sp.set('airport', airport);
    if (service) sp.set('service_type', service);
    if (status) sp.set('status', status);
    if (from) sp.set('from', from);
    if (to) sp.set('to', to);
    sp.set('page', String(page));
    sp.set('limit', String(limit));
    sp.set('sortBy', sortBy);
    sp.set('sortOrder', sortOrder);
    router.replace(`/bookings?${sp.toString()}`, { scroll: false });
  }, [q, source, airport, service, status, from, to, page, limit, sortBy, sortOrder, router]);

  // fetch
  const fetchData = async () => {
    setLoading(true);
    setErrMsg('');
    try {
      const token =
        (typeof window !== 'undefined' && localStorage.getItem('authToken')) ||
        getCookie('token') || '';

      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (q)        qs.set('q', q);
      if (source)   qs.set('source', source);
      if (airport)  qs.set('airport', airport);
      if (service)  qs.set('service_type', service);
      if (status)   qs.set('status', status);
      if (from)     qs.set('from', from);
      if (to)       qs.set('to', to);

      const res = await fetch(`${API_BASE_URL}/api/bookings?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Failed to fetch (${res.status})`);
      }
      const data: BookingListResponse = await res.json();
      setRows(data.data || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setErrMsg(e?.message || 'Failed to fetch');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, source, airport, service, status, from, to, page, limit, sortBy, sortOrder]);

  const handleSort = (key: 'booked_on'|'dropoff'|'return'|'price'|'created_at') => {
    if (sortBy === key) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(key); setSortOrder('asc'); }
    setPage(1);
  };

  const resetFilters = () => {
    setQ('');
    setSource('');
    setAirport('');
    setService('');
    setStatus('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const SortBadge = ({ active }: { active: boolean }) => (
    <span className="ml-1 text-[10px] font-medium text-muted-foreground">
      {active ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
    </span>
  );

  return (
    <div className="w-full min-h-screen p-3 md:p-4">
      {/* FILTER BAR (compact; mirrors your screenshot options) */}
      <div className="mb-3 grid grid-cols-1 lg:grid-cols-12 gap-2">
        <div className="lg:col-span-2">
          <select className="h-8 w-full rounded-md border bg-background px-2 text-xs" value={airport} onChange={(e)=>{ setAirport(e.target.value); setPage(1); }}>
            <option value="">All Airports</option>
            {AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          <select className="h-8 w-full rounded-md border bg-background px-2 text-xs" value={service} onChange={(e)=>{ setService(e.target.value); setPage(1); }}>
            <option value="">All Service Type</option>
            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          <input type="date" className="h-8 w-full rounded-md border bg-background px-2 text-xs" value={from} onChange={(e)=>{ setFrom(e.target.value); setPage(1); }} />
        </div>
        <div className="lg:col-span-2">
          <input type="date" className="h-8 w-full rounded-md border bg-background px-2 text-xs" value={to} onChange={(e)=>{ setTo(e.target.value); setPage(1); }} />
        </div>
        <div className="lg:col-span-2">
          <select className="h-8 w-full rounded-md border bg-background px-2 text-xs" value={status} onChange={(e)=>{ setStatus(e.target.value); setPage(1); }}>
            <option value="">All Bookings</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2 flex gap-2">
          <Input
            ref={searchInputRef}
            value={q}
            onChange={(e)=>{ setQ(e.target.value); setPage(1); }}
            placeholder="reference, vehicle reg, name, phone…"
            className="h-8 text-xs"
          />
          <Button className="h-8 text-xs" onClick={()=>fetchData()}>Search</Button>
        </div>
      </div>

      {/* small row with counters / controls */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          Page <span className="font-medium">{page}</span> /{' '}
          <span className="font-medium">{Math.max(1, Math.ceil(total / limit))}</span>{' '}
          — <span className="font-medium">{total}</span> total
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="h-8 rounded-md border bg-background px-2 text-xs" value={limit} onChange={(e)=>{ setLimit(Number(e.target.value)); setPage(1); }}>
            {[20, 50, 100, 200].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
          <Button variant="outline" className="h-8 text-xs" onClick={resetFilters}>Reset</Button>
          <div className="flex items-center">
            <button className="h-8 rounded-l-md border px-3 text-xs disabled:opacity-50" onClick={()=>setPage(p=>Math.max(1, p-1))} disabled={page<=1 || loading}>Prev</button>
            <button className="h-8 rounded-r-md border border-l-0 px-3 text-xs disabled:opacity-50" onClick={()=>setPage(p=>Math.min(totalPages, p+1))} disabled={page>=totalPages || loading}>Next</button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto rounded-lg border">
        <Table className="table-auto w-full text-[12px] md:text-xs border-separate border-spacing-0">
          <TableHeader>
            <TableRow className="border-0 sticky top-0 z-10">
              <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 rounded-tl-lg">S.L</TableHead>
              <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">ID</TableHead>
              <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">Ref No</TableHead>
              <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">Customer Name</TableHead>
              <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">Contact No</TableHead>
              <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">Airport</TableHead>
              <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">Service</TableHead>

              <TableHead onClick={()=>handleSort('booked_on')}
                className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 cursor-pointer select-none"
                aria-sort={sortBy==='booked_on' ? (sortOrder==='asc'?'ascending':'descending') : 'none'}
                title="Sort by Booked On">
                <span className="inline-flex items-center">Booked On <SortBadge active={sortBy==='booked_on'} /></span>
              </TableHead>

              <TableHead onClick={()=>handleSort('dropoff')}
                className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 cursor-pointer select-none"
                aria-sort={sortBy==='dropoff' ? (sortOrder==='asc'?'ascending':'descending') : 'none'}
                title="Sort by Drop-off">
                <span className="inline-flex items-center">Drop-off Date Time <SortBadge active={sortBy==='dropoff'} /></span>
              </TableHead>

              <TableHead onClick={()=>handleSort('return')}
                className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 cursor-pointer select-none"
                aria-sort={sortBy==='return' ? (sortOrder==='asc'?'ascending':'descending') : 'none'}
                title="Sort by Return">
                <span className="inline-flex items-center">Return Date Time <SortBadge active={sortBy==='return'} /></span>
              </TableHead>

              <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700">Reg No</TableHead>

              <TableHead onClick={()=>handleSort('price')}
                className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 cursor-pointer select-none"
                aria-sort={sortBy==='price' ? (sortOrder==='asc'?'ascending':'descending') : 'none'}
                title="Sort by Price">
                <span className="inline-flex items-center">Amount <SortBadge active={sortBy==='price'} /></span>
              </TableHead>

              <TableHead className="px-4 h-12 text-center bg-neutral-100 dark:bg-slate-700 rounded-tr-lg">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow key="loading">
                <TableCell colSpan={13} className="py-6 px-4 text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            ) : errMsg ? (
              <TableRow key="error">
                <TableCell colSpan={13} className="py-6 px-4 text-center text-red-600">{errMsg}</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow key="empty">
                <TableCell colSpan={13} className="py-6 px-4 text-center text-muted-foreground">No bookings found.</TableCell>
              </TableRow>
            ) : (
              rows.map((b, i) => {
                const sl = (page - 1) * limit + (i + 1);
                const isLast = i === rows.length - 1;
                return (
                  <TableRow key={`row-${b.id}`}>
                    <TableCell className={`py-3 px-4 text-center ${isLast ? 'rounded-bl-lg' : ''}`}>{String(sl).padStart(2,'0')}</TableCell>
                    <TableCell className="py-3 px-4 text-center">{b.id}</TableCell>
                    <TableCell className="py-3 px-4 text-center text-primary">{b.ref_no}</TableCell>
                    <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.customer_name}</TableCell>
                    <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.contact_no || '-'}</TableCell>
                    <TableCell className="py-3 px-4 text-center">{b.airport || '-'}</TableCell>
                    <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.service_type}</TableCell>
                    <TableCell className="py-3 px-4 text-center whitespace-nowrap">{fmtDT(b.booked_on)}</TableCell>
                    <TableCell className="py-3 px-4 text-center whitespace-nowrap">{fmtDT(b.dropoff_datetime)}</TableCell>
                    <TableCell className="py-3 px-4 text-center whitespace-nowrap">{fmtDT(b.return_datetime)}</TableCell>
                    <TableCell className="py-3 px-4 text-center whitespace-nowrap">{b.vehicle_reg_no || '-'}</TableCell>
                    <TableCell className="py-3 px-4 text-center whitespace-nowrap">{money(Number(b.price || 0))}</TableCell>
                    <TableCell className={`py-3 px-4 text-center ${isLast ? 'rounded-br-lg' : ''}`}>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          b.status === 'Booking Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : b.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : b.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-neutral-100 text-neutral-700 dark:bg-slate-700 dark:text-neutral-100'
                        }`}
                      >
                        {b.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
