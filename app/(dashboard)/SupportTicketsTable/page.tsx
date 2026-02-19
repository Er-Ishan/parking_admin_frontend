"use client";

import { useEffect, useState, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Eye, X } from "lucide-react";
import { Download } from 'lucide-react';
const STATUSES = ['Open', 'Pending', 'In Progress', 'On Hold', 'Resolved', 'Closed'] as const;
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
import { Mail } from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText } from 'lucide-react';


const API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/support-ticket`;

type Ticket = {
    id: number;
    ticket_no: string;
    customer_name: string;
    ref_no: string;
    customer_email: string;
    customer_phone: string;
    subject: string;
    message: string;
    status: string;
    priority: string;
    assigned_to: string;
    category: string;
    source: string;
    created_at?: string;
    service_type?: string;
};

type ChatMessage = Ticket & {
    sender?: "customer" | "admin";
};


export default function SupportTicketsTable() {

    const [rows, setRows] = useState<Ticket[]>([]);
    const [activeTab, setActiveTab] = useState<"guest" | "registered">("guest");

    const [openRowId, setOpenRowId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({} as Ticket);
    const [search, setSearch] = useState("");

    const [priority, setPriority] = useState("");
    const [localReplies, setLocalReplies] = useState<Record<string, ChatMessage[]>>({});

    const [status, setStatus] = useState("");
    const [service_type, setService] = useState("");

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [replyOpen, setReplyOpen] = useState(false);
    const [replyTicket, setReplyTicket] = useState<Ticket | null>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [sendingReply, setSendingReply] = useState(false);


    const [pattern, setPattern] = useState("booked");

    const today = new Date().toISOString().split("T")[0];
    const [rangeFromDisplay, setRangeFromDisplay] = useState(today);
    const [rangeFrom, setRangeFrom] = useState("");
    const [dropoffFromDisplay, setDropoffFromDisplay] = useState(today);
    const [dropoffFrom, setDropoffFrom] = useState("");

    const [returnFromDisplay, setReturnFromDisplay] = useState(today);
    const [returnFrom, setReturnFrom] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);




    const fields: Array<keyof Ticket> = [
        "customer_name", "customer_email", "customer_phone", "subject",
        "message", "status", "priority", "assigned_to",
        "category", "source"
    ];

    const fetchData = async () => {
        setLoading(true);
        const res = await fetch(API, { credentials: "include", });
        const json = await res.json();
        setRows(json);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const openEdit = (row: Ticket) => {
        setOpenRowId(openRowId === row.id ? null : row.id);
        setForm(row);
    };



    const downloadPDF = () => {
        if (!filteredRows.length) {
            alert("No data to export");
            return;
        }

        const doc = new jsPDF("landscape");

        doc.setFontSize(14);
        doc.text("Support Tickets Report", 14, 15);

        const tableColumn = [
            "Ticket No",
            "Name",
            "Email",
            "Subject",
            "Category",
            "Status",
            "Priority",
            "Created At"
        ];

        const tableRows = filteredRows.map(row => [
            row.ticket_no,
            row.customer_name,
            row.customer_email,
            row.subject,
            row.category,
            row.status,
            row.priority,
            row.created_at
                ? new Date(row.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })
                : "-"
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            styles: {
                fontSize: 8,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [79, 70, 229], // indigo
                textColor: 255,
            },
            alternateRowStyles: {
                fillColor: [245, 247, 255],
            },
        });

        doc.save("support_tickets.pdf");
    };

    const supportTicketUserReply = async () => {
        if (!replyTicket || !replyMessage.trim()) {
            alert("Message is required");
            return;
        }

        const newReply: ChatMessage = {
            ...replyTicket,
            id: Date.now(), // temp id
            message: replyMessage,
            created_at: new Date().toISOString(),
            sender: "admin",
        };

        // 🔥 Show instantly like chatbot
        setLocalReplies(prev => ({
            ...prev,
            [replyTicket.customer_email]: [
                ...(prev[replyTicket.customer_email] || []),
                newReply,
            ],
        }));

        setChatMessages(prev => [...prev, newReply]);

        setReplyMessage("");

        try {
            setSendingReply(true);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/support-ticket/support-ticket-user-reply`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: replyTicket.customer_email,
                        ticket_no: replyTicket.ticket_no,
                        subject: replyTicket.subject,
                        message: newReply.message,
                    }),
                }
            );

            if (!res.ok) throw new Error("Failed to send reply");

        } catch (err) {
            alert("Failed to send reply");
        } finally {
            setSendingReply(false);
        }
    };




    const exportToCSV = () => {
        if (!filteredRows.length) return alert("No data to export");

        const headers = [
            "Ticket No",
            "Name",
            "Email",
            "Subject",
            "Category",
            "Message",
            "Status",
            "Priority",
            "Created At"
        ];

        const rowsData = filteredRows.map(row => [
            row.ticket_no,
            row.customer_name,
            row.customer_email,
            row.subject,
            row.category,
            row.message,
            row.status,
            row.priority,
            row.created_at
                ? new Date(row.created_at).toLocaleString("en-GB")
                : ""
        ]);

        const csvContent =
            [headers, ...rowsData]
                .map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
                .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "support_tickets.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getConversationByEmail = (
        allTickets: Ticket[],
        email: string
    ) => {
        return allTickets
            .filter(t => t.customer_email === email)
            .sort(
                (a, b) =>
                    new Date(a.created_at || "").getTime() -
                    new Date(b.created_at || "").getTime()
            );
    };



    const handleChange = (name: keyof Ticket, value: any) =>
        setForm(prev => ({ ...prev, [name]: value }));

    const saveUpdate = async (id: number) => {
        setSaving(true);
        await fetch(`${API}/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });
        setSaving(false);
        setOpenRowId(null);
        fetchData();
    };

    const updateTicketField = async (
        id: number,
        field: "status" | "priority",
        value: string
    ) => {
        try {
            await fetch(`${API}/${id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    [field]: value,
                }),
            });

            // Optimistic UI update (optional but recommended)
            setRows((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, [field]: value } : row
                )
            );

            setOpenRowId(null);
        } catch (err) {
            console.error("Update failed", err);
        }
    };


    const deleteRow = async (id: number) => {
        if (!confirm("Delete ticket?")) return;
        await fetch(`${API}/${id}`, { method: "DELETE", credentials: "include", });
        fetchData();
    };

    const getSection = (row: Ticket): "Guest" | "Registered" => {
        return row.ref_no ? "Registered" : "Guest";
    };



    // ---------------- FILTER LOGIC -----------------
    const filteredRows = rows.filter(row => {

        const section = getSection(row);

        // TAB FILTER (FIXED LOCATION)
        if (activeTab === "guest" && section !== "Guest") return false;
        if (activeTab === "registered" && section !== "Registered") return false;

        // Search
        if (
            search &&
            !Object.values(row)
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        ) return false;

        // Priority filter
        if (priority && row.priority !== priority) return false;

        // Status filter
        if (status && row.status !== status) return false;

        // Service filter
        if (service_type && row.service_type !== service_type) return false;

        // Date range
        if (rangeFrom && new Date(row.created_at!) < new Date(rangeFrom)) return false;
        if (returnFrom && new Date(row.created_at!) > new Date(returnFrom)) return false;

        return true;
    });

    const sendEmail = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/support-ticket/email-excel`,
                {
                    method: "POST",
                    credentials: "include", // ✅ REQUIRED
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status,
                        priority,
                        from: rangeFrom || null,
                        to: returnFrom || null,
                    }),
                }
            );

            // 🔴 If backend sends HTML, stop here
            const text = await res.text();

            // Debug safety
            if (!res.ok) {
                console.error("Server response:", text);
                throw new Error("Email request failed");
            }

            // ✅ Only parse JSON if valid
            const data = JSON.parse(text);
            alert(data.message);

        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to send email");
        }
    };






    return (
        <div className="w-full min-h-screen px-3 md:px-1 pt-4">

            <div className="text-xs text-muted-foreground mb-3">
                <span className="font-semibold">Support Ticket</span>{' '}
            </div>

            {/* CLIENT TABS */}
            <div className="flex gap-2 mb-3 border-b">
                <button
                    onClick={() => setActiveTab("guest")}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition
            ${activeTab === "guest"
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-muted-foreground hover:text-indigo-600"
                        }`}
                >
                    Guest Client
                </button>

                <button
                    onClick={() => setActiveTab("registered")}
                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition
            ${activeTab === "registered"
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-muted-foreground hover:text-indigo-600"
                        }`}
                >
                    Registered Client
                </button>
            </div>


            {/* FILTERS */}
            <div className="mb-2 w-full border-b pb-2">
                <div className="flex flex-wrap items-end gap-3">


                    <select
                        className="h-9 min-w-[150px] border  px-2 text-sm"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>

                    <select
                        className="h-9 min-w-[150px] border  px-2 text-sm"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="">All Priority</option>
                        {PRIORITIES.map(s => <option key={s}>{s}</option>)}
                    </select>

                    {/* <Input
                        type="date"
                        className="h-9 text-sm w-40 sm:w-30 cursor-pointer rounded-none"
                        value={rangeFromDisplay}
                        onChange={(e) => {
                            setRangeFromDisplay(e.target.value); // UI
                            setRangeFrom(e.target.value);        // filter
                        }}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                    /> */}

                    {/* <Input
                        type="date"
                        className="h-9 text-sm w-40 sm:w-30 cursor-pointer rounded-none"
                        value={returnFromDisplay}
                        onChange={(e) => {
                            setReturnFromDisplay(e.target.value); // UI
                            setReturnFrom(e.target.value);        // filter
                        }}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                    /> */}




                    <div className="flex flex-col flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search…"
                            className="h-9 border rounded-none px-2 text-sm w-full"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                        />
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="h-9 rounded-none text-sm"
                            onClick={exportToCSV}
                        >
                            <Download />
                        </Button>

                        <Button
                            variant="outline"
                            className="h-9 rounded-none text-sm"
                            onClick={downloadPDF}
                        >
                            <FileText />
                        </Button>

                        <Button
                            className="h-9 text-sm rounded-none bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={sendEmail}
                        >
                            <Mail />
                        </Button>

                    </div>


                </div>
            </div>

            <div className="overflow-x-auto border  w-full">
                <Table className="w-full text-xs border-separate border-spacing-0">

                    <TableHeader>
                        <TableRow>
                            <TableHead className=" bg-neutral-100 text-center">S.L.</TableHead>
                            <TableHead className="bg-neutral-100 text-center">
                                Reply
                            </TableHead>

                            <TableHead className=" bg-blue-300 text-center">Ticket No</TableHead>
                            {activeTab === "registered" && (
                                <TableHead className="bg-amber-300 text-center">
                                    Ref No
                                </TableHead>
                            )}

                            <TableHead className=" bg-neutral-100 text-center">Name</TableHead>
                            <TableHead className=" bg-neutral-100 text-center">Email</TableHead>
                            <TableHead className=" bg-violet-300 text-center">Subject</TableHead>
                            <TableHead className=" bg-cyan-300 text-center">Category</TableHead>
                            <TableHead className=" bg-indigo-300 text-center ">Message</TableHead>
                            <TableHead className=" bg-neutral-100 text-center">Created At</TableHead>
                            <TableHead className=" bg-neutral-100 text-center">Status</TableHead>
                            <TableHead className=" bg-neutral-100 text-center">Priority</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredRows.map((row, i) => {

                            const inline = openRowId === row.id;


                            return (
                                <Fragment key={row.id}>
                                    <TableRow className="bg-neutral-50">
                                        <TableCell className="text-center">{i + 1}</TableCell>
                                        <TableCell className="text-center ">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="rounded-none"
                                                onClick={() => {
                                                    setReplyTicket(row);
                                                    setReplyMessage("");
                                                    setReplyOpen(true);

                                                    const customerMessages: ChatMessage[] =
                                                        getConversationByEmail(rows, row.customer_email).map(msg => ({
                                                            ...msg,
                                                            sender: "customer",
                                                        }));

                                                    const adminMessages =
                                                        localReplies[row.customer_email] || [];

                                                    // ✅ merge & sort by time
                                                    const merged = [...customerMessages, ...adminMessages].sort(
                                                        (a, b) =>
                                                            new Date(a.created_at || "").getTime() -
                                                            new Date(b.created_at || "").getTime()
                                                    );

                                                    setChatMessages(merged);
                                                }}


                                            >
                                                <Mail className="h-4 w-4" />
                                            </Button>

                                        </TableCell>

                                        <TableCell className="text-blue-700 text-center bg-blue-50">{row.ticket_no}</TableCell>
                                        {activeTab === "registered" && (
                                            <TableCell className="text-center bg-amber-50 text-amber-700">
                                                {row.ref_no || "-"}
                                            </TableCell>
                                        )}

                                        <TableCell className="text-center">{row.customer_name}</TableCell>
                                        <TableCell className="text-center">{row.customer_email}</TableCell>
                                        <TableCell className="text-center bg-violet-50 text-violet-800">{row.subject}</TableCell>
                                        <TableCell className="text-center bg-cyan-50 text-cyan-700">{row.category}</TableCell>
                                        <TableCell
                                            className="
    bg-indigo-50
    text-indigo-800
    px-4 py-3
    max-w-[500px]
    whitespace-normal
    break-words
    text-left
    align-top
  "
                                        >
                                            {row.message}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {row.created_at
                                                ? new Date(row.created_at).toLocaleString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: false,
                                                })
                                                : "-"}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <select
                                                className="
    h-8 px-2 text-xs font-medium
     border
    bg-blue-50 text-blue-700
    border-blue-200
    hover:bg-blue-100
    focus:outline-none focus:ring-2 focus:ring-blue-300
    transition
  "
                                                value={row.status}
                                                onChange={(e) => {
                                                    updateTicketField(row.id, "status", e.target.value);
                                                }}
                                            >
                                                {STATUSES.map(status => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>

                                        </TableCell>

                                        <TableCell className="text-center">
                                            <select
                                                className="
    h-8 px-2 text-xs font-medium
     border
    bg-orange-50 text-orange-700
    border-orange-200
    hover:bg-orange-100
    focus:outline-none focus:ring-2 focus:ring-orange-300
    transition
  "
                                                value={row.priority}
                                                onChange={(e) => {
                                                    updateTicketField(row.id, "priority", e.target.value);
                                                }}
                                            >
                                                {PRIORITIES.map(priority => (
                                                    <option key={priority} value={priority}>
                                                        {priority}
                                                    </option>
                                                ))}
                                            </select>

                                        </TableCell>


                                    </TableRow>
                                </Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {replyOpen && replyTicket && (
                <div className="fixed inset-0 z-50 flex justify-center bg-black/40 overflow-y-auto">
                    <div className="bg-white w-full max-w-6xl rounded shadow-xl overflow-hidden max-h-[90vh] flex flex-col">

                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-100">
                            <h3 className="text-sm font-semibold">
                                Support Conversation — {replyTicket.customer_email}
                            </h3>
                            <button onClick={() => setReplyOpen(false)}>
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 flex-1 min-h-0">

                            {/* LEFT — CUSTOMER / TICKET INFO */}
                            <div className="md:col-span-1 border-r bg-gray-50 p-4 text-xs flex flex-col gap-4">

                                {/* CUSTOMER CARD */}
                                <div className="bg-white border rounded-none p-3">
                                    <div className="text-[11px] font-semibold text-gray-500 uppercase mb-2">
                                        Customer
                                    </div>

                                    <div className="font-semibold text-gray-800">
                                        {replyTicket.customer_name}
                                    </div>

                                    <div className="text-gray-500 break-all">
                                        {replyTicket.customer_email}
                                    </div>

                                </div>

                                {/* TICKET META */}
                                <div className="bg-white border rounded-none p-3">
                                    <div className="text-[11px] font-semibold text-gray-500 uppercase mb-2">
                                        Ticket Details
                                    </div>

                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-500">Ticket No</span>
                                        <span className="font-medium">{replyTicket.ticket_no}</span>
                                    </div>

                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-500">Category</span>
                                        <span className="font-medium">{replyTicket.category}</span>
                                    </div>

                                    <div className="flex justify-between mb-1">
                                        <span className="text-gray-500">Status</span>
                                        <span
                                            className={`
                    px-2 py-[2px] rounded-full text-[10px] font-semibold
                    ${replyTicket.status === "Open" && "bg-blue-100 text-blue-700"}
                    ${replyTicket.status === "Pending" && "bg-yellow-100 text-yellow-700"}
                    ${replyTicket.status === "Resolved" && "bg-green-100 text-green-700"}
                    ${replyTicket.status === "Closed" && "bg-gray-200 text-gray-700"}
                `}
                                        >
                                            {replyTicket.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Priority</span>
                                        <span
                                            className={`
                    px-2 py-[2px] rounded-full text-[10px] font-semibold
                    ${replyTicket.priority === "Low" && "bg-gray-100 text-gray-700"}
                    ${replyTicket.priority === "Medium" && "bg-blue-100 text-blue-700"}
                    ${replyTicket.priority === "High" && "bg-orange-100 text-orange-700"}
                    ${replyTicket.priority === "Urgent" && "bg-red-100 text-red-700"}
                `}
                                        >
                                            {replyTicket.priority}
                                        </span>
                                    </div>
                                </div>

                                {/* SUBJECT */}
                                <div className="bg-white border rounded-none p-3">
                                    <div className="text-[11px] font-semibold text-gray-500 uppercase mb-2">
                                        Subject
                                    </div>

                                    <div className="text-gray-800 leading-relaxed">
                                        {replyTicket.subject}
                                    </div>
                                </div>

                            </div>


                            {/* RIGHT — CHAT */}
                            <div className="md:col-span-3 flex flex-col min-h-0">

                                {/* ✅ MESSAGES AREA — ONLY SCROLLABLE PART */}
                                <div
                                    className="
      flex-1
      min-h-0
      overflow-y-auto
      p-4
      space-y-4
      bg-white
      scrollbar-thin
      scrollbar-thumb-gray-300
      scrollbar-track-transparent
    "
                                >
                                    {chatMessages.map(msg => {
                                        const isAdmin = msg.sender === "admin";

                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`
              max-w-[70%] px-4 py-3 rounded-lg text-sm
              ${isAdmin
                                                            ? "bg-indigo-600 text-white rounded-br-none"
                                                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                                                        }
            `}
                                                >
                                                    <div className="text-[10px] opacity-70 mb-1">
                                                        {isAdmin ? "Support Team" : msg.ticket_no} •{" "}
                                                        {new Date(msg.created_at || "").toLocaleString("en-GB")}
                                                    </div>

                                                    <div className="whitespace-pre-wrap">
                                                        {msg.message}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ✅ REPLY BOX — FIXED, NEVER MOVES */}
                                <div className="border-t p-4 bg-gray-50 shrink-0">
                                    <textarea
                                        className="w-full min-h-[110px] border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        placeholder="Type your reply to the customer..."
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                    />

                                    <div className="flex justify-end gap-2 mt-3">
                                        <Button className="rounded-none" size="sm" variant="outline" onClick={() => setReplyOpen(false)}>
                                            Cancel
                                        </Button>

                                        <Button className="rounded-none" size="sm" onClick={supportTicketUserReply} disabled={sendingReply}>
                                            {sendingReply ? "Sending..." : "Send Reply"}
                                        </Button>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            )}





        </div>
    );
}
