"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "./ProtectedRoute";

type CancelPopupProps = {
    open: boolean;
    onClose: () => void;
    booking: any;
    refresh: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CancelPopup({
    open,
    onClose,
    booking,
    refresh
}: CancelPopupProps) {

    const today = new Date().toISOString().split("T")[0];
    const [cancelDate] = useState(today);

    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [difference, setDifference] = useState<number>(0);

    const [action, setAction] = useState("");
    const [option, setOption] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [note, setNote] = useState("");

    const [emailCustomer, setEmailCustomer] = useState(false);
    const [emailCarPark, setEmailCarPark] = useState(false);
    const [cancelCover, setCover] = useState(0);

    const [loading, setLoading] = useState(false);
    const [fullBooking, setFullBooking] = useState<any>(null);

    // Calculation states
    const [quote, setQuote] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [extraFee, setExtraFee] = useState(0);
    const [net, setNet] = useState(0);

    const allowedHours = fullBooking?.nonflex === "Flexible" ? 72 : 24;

    /* ------------------------------------------------
       INIT VALUES FROM BOOKING
    ------------------------------------------------ */
    useEffect(() => {
        if (booking) {
            const paid = Number(booking.total_payable || 0);
            const disc = Number(booking.discount || 0);
            const cover = Number(booking.cancellation_cover || 0);

            setRefundAmount(0);
            setDifference(paid);
            setCover(cover);
            setQuote(paid);
            setDiscount(disc);
            setExtraFee(0);
            setNet(paid);
        }
    }, [booking]);

    const round2 = (n: number) =>
        Math.round((Number(n) + Number.EPSILON) * 100) / 100;


    /* ------------------------------------------------
       AUTO CALCULATION (UI ONLY)
    ------------------------------------------------ */
    useEffect(() => {
        const n = round2(quote - discount + extraFee - cancelCover);
        const d = round2(n - refundAmount);

        setNet(n);
        setDifference(d);
    }, [quote, discount, extraFee, cancelCover, refundAmount]);


    /* ------------------------------------------------
       LOAD FULL BOOKING DETAILS
    ------------------------------------------------ */
    const handleLoadDetails = async () => {
        if (!booking?.id) return;

        try {
            const res = await fetch(
                `${API_BASE_URL}/api/cancellations/parking-booking/${booking.id}/details`,
                {
                    credentials: "include",
                }
            );
            const data = await res.json();
            setFullBooking(data);
        } catch (err) {
            console.error("DETAILS API ERROR:", err);
        }
    };

    // ✅ FIXED DEPENDENCY ARRAY (THIS FIXES YOUR ERROR)
    useEffect(() => {
        if (open && booking) {
            handleLoadDetails();
        }
    }, [open, booking]);

    if (!open || !booking) return null;

    /* ------------------------------------------------
       SUBMIT CANCEL + REFUND
    ------------------------------------------------ */
    const handleSubmit = async () => {
        try {
            setLoading(true);

            const payload = {
                id: booking.id,
                refundAmount,
                difference,
                action,
                refund_type: option,
                cancel_reason: cancelReason,
                cancel_date: cancelDate,
                action_note: note,
                email_customer: emailCustomer,
                email_carpark: emailCarPark,
                cancellation_cover: cancelCover,
            };

            const res = await fetch(
                `${API_BASE_URL}/api/cancel-and-refund`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            const result = await res.json();

            if (!res.ok) {
                alert(result.error || "Something went wrong");
                return;
            }

            alert(result.message);
            refresh();
            onClose();

        } catch {
            alert("Unable to connect to backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>

            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
                <div className="bg-white w-full sm:w-[90%] md:w-[70%] lg:w-[55%] xl:w-[45%] p-6 rounded-xl shadow-xl">

                    <h2 className="text-xl font-semibold mb-3">
                        Cancel Booking – <span className="text-blue-600">{booking.ref_no}</span>
                    </h2>

                    {fullBooking?.nonflex === "Non-Refundable" && (
                        <div className="p-3 mb-4 rounded-md bg-red-200 text-red-800 border border-red-400 text-sm">
                            <strong>This Booking Cannot Be Cancelled.</strong><br />
                            Cancel Short Notice is {allowedHours} Hours.
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-neutral-100 rounded-md text-sm">
                            <p><strong>Name:</strong> {`${booking.first_name} ${booking.last_name}`}</p>
                            <p><strong>Email:</strong> {booking.email}</p>
                            <p><strong>Phone:</strong> {booking.mobile}</p>
                            <p><strong>Reg No:</strong> {booking.vehicle_registration}</p>
                            <p><strong>Booking Type:</strong> {booking.service}</p>

                            {/* <p><strong>Price:</strong> £{booking.discount}</p> */}
                        </div>

                        <div className="p-4 bg-neutral-100 rounded-md text-sm">
                            <p><strong>Quote Amount:</strong> £{booking.quote_amount}</p>
                            <p><strong>Booking Fee:</strong> £{booking.booking_fee}</p>
                            <p><strong>Discount:</strong> £{booking.discount}</p>
                            <p><strong>Total Amount:</strong> £{booking.total_payable}</p>
                            {/* <p><strong>Flexibility:</strong> {booking.flexibility}</p> */}
                            {/* <p><strong>Service:</strong> {fullBooking?.service_type}</p> */}
                            {/* <p><strong>Allowed Hours:</strong> {fullBooking?.book_short_hours}</p> */}
                            {/* <p><strong>Cancellation Date:</strong> {cancelDate}</p> */}
                        </div>
                    </div>

                    {/* 4 ITEMS IN FIRST ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-medium">Amount</label>
                            <Input className="h-9 text-sm" value={quote}
                                onChange={(e) => setQuote(Number(e.target.value))} readOnly />
                        </div>

                        <div>
                            <label className="text-xs font-medium">Discount</label>
                            <Input className="h-9 text-sm" value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))} readOnly />
                        </div>

                        <div>
                            <label className="text-xs font-medium">Extra Fees</label>
                            <Input className="h-9 text-sm" value={extraFee}
                                onChange={(e) => setExtraFee(Number(e.target.value))} />
                        </div>

                        <div>
                            <label className="text-xs font-medium">Cancellation Cover</label>
                            <Input className="h-9 text-sm" value={cancelCover}
                                onChange={(e) => setCover(Number(e.target.value))} />
                        </div>
                    </div>

                    {/* SECOND ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-medium">Net Amount</label>
                            <Input className="h-9 text-sm" readOnly value={net} />
                        </div>

                        <div>
                            <label className="text-xs font-medium">Difference</label>
                            <Input className="h-9 text-sm" readOnly value={difference} />
                        </div>

                        <div>
                            <label className="text-xs font-medium">Refund Amount</label>
                            <Input
                                type="number"
                                step="0.01"
                                className="h-9 text-sm"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(round2(Number(e.target.value)))}
                            />

                        </div>

                        <div>
                            <label className="text-xs font-medium">Action</label>
                            <select className="h-9 border rounded-md px-2 text-sm w-full"
                                value={action}
                                onChange={(e) => setAction(e.target.value)}>
                                <option value="">Select Action</option>
                                <option value="cancel">Cancel</option>
                                <option value="refund">Refund</option>
                                <option value="cancel_refund">Cancel + Refund</option>
                            </select>
                        </div>
                    </div>

                    {/* THIRD ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-medium">Cancel Reason</label>
                            <select className="h-9 border rounded-md px-2 text-sm w-full"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}>
                                <option value="">Select</option>
                                <option value="customer_request">On customer request</option>
                                <option value="car_park_request">On car park request</option>
                                <option value="no_service">No service provided</option>
                                <option value="dispute">Dispute</option>
                                <option value="other">Others</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-medium">Refund Types</label>
                            <select className="h-9 border rounded-md px-2 text-sm w-full"
                                value={option}
                                onChange={(e) => setOption(e.target.value)}>
                                <option value="">Select Option</option>
                                <option value="full">Full refund</option>
                                <option value="partial">Partial refund</option>
                                <option value="none">No Refund</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="text-xs font-medium">Action Note</label>
                        <Input className="h-9 text-sm" value={note}
                            onChange={(e) => setNote(e.target.value)} />
                    </div>

                    <div className="mt-4 flex items-center gap-6 text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={emailCustomer}
                                onChange={(e) => setEmailCustomer(e.target.checked)} />
                            Email Customer
                        </label>

                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={emailCarPark}
                                onChange={(e) => setEmailCarPark(e.target.checked)} />
                            Email Car Park
                        </label>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button disabled={loading}
                            onClick={async () => {
                                if (window.confirm("Are you sure?")) {
                                    await handleSubmit();
                                }
                            }}>
                            Take Action
                        </Button>
                    </div>

                </div>
            </div>
        </ProtectedRoute>
    );
}
