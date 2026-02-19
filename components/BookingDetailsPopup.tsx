"use client";

import { X } from "lucide-react";

type Props = {
    open: boolean;
    booking: any;
    onClose: () => void;
};

const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const date = new Date(dateString);

    // Use UTC to avoid timezone shifting
    const day = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    return `${day} ${month}, ${year}`;
};


const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between py-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-900 text-right">
            {value || "-"}
        </span>
    </div>
);

const SectionTitle = ({ title }: { title: string }) => (
    <h4 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b">
        {title}
    </h4>
);

export default function BookingDetailsPopup({
    open,
    booking,
    onClose,
}: Props) {
    if (!open || !booking) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-3xl shadow-2xl  border">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                    <h3 className="text-sm font-semibold tracking-wide text-gray-800">
                        Booking Details –{" "}
                        <span className="text-blue-600">{booking.ref_no}</span>
                    </h3>

                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200  transition"
                    >
                        <X className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-8 text-xs max-h-[70vh] overflow-y-auto">

                    {/* ================= ROW 1 ================= */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Travel Info */}
                        <div>
                            <SectionTitle title="Travel Info" />
                            <InfoRow
                                label="Booked On"
                                value={formatDate(booking.booked_on) || "TBC"}
                            />

                            <InfoRow
                                label="Drop-off"
                                value={formatDate(booking.dropoff_datetime) || "TBC"}
                            />
                            <InfoRow
                                label="Return"
                                value={formatDate(booking.return_datetime) || "TBC"}
                            />
                        </div>

                        {/* Booking Info */}
                        <div>
                            <SectionTitle title="Booking Info" />
                            <InfoRow label="Product" value={booking.product_name || "TBC"} />
                            <InfoRow label="Airport" value={booking.travelling_from || "TBC"} />
                            <InfoRow label="Service" value={booking.service || "TBC"} />


                        </div>

                    </div>

                    {/* ================= ROW 2 ================= */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Customer Info */}
                        <div>
                            <SectionTitle title="Customer Info" />
                            <InfoRow label="Name" value={booking.customer_name || "TBC"} />
                            <InfoRow label="Phone" value={booking.contact_no || "TBC"} />
                            <InfoRow label="Email" value={booking.customer_email || "TBC"} />
                        </div>

                        {/* Flight Info */}
                        <div>
                            <SectionTitle title="Flight Info" />
                            <InfoRow label="Depart Flight" value={booking.depart_flight || "TBC"} />
                            <InfoRow label="Depart Terminal" value={booking.depart_terminal || "TBC"} />
                            <InfoRow label="Return Flight" value={booking.return_flight || "TBC"} />
                            <InfoRow label="Return Terminal" value={booking.return_terminal || "TBC"} />
                        </div>

                    </div>

                    {/* ================= VEHICLE FULL WIDTH ================= */}
                    {/* ================= VEHICLE FULL WIDTH ================= */}
                    <div>
                        <SectionTitle title="Vehicle Details" />

                        <div className="border  overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Make
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Model
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Colour
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Reg
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr className="border-t">
                                        <td className="px-4 text-center py-2 font-medium">
                                            {booking.vehicle_make || "TBC"}
                                        </td>
                                        <td className="px-4 text-center py-2 font-medium">
                                            {booking.vehicle_model || "TBC"}
                                        </td>
                                        <td className="px-4 text-center py-2 font-medium">
                                            {booking.color || "TBC"}
                                        </td>
                                        <td className="px-4 text-center py-2 font-semibold text-blue-700">
                                            {booking.vehicle_reg_no || "TBC"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ================= PAYMENT FULL WIDTH ================= */}
                    <div>
                        <SectionTitle title="Payment Summary" />

                        <div className="border  overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Quote
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Booking Fee
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Discount
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Total Paid
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Transaction ID
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr className="border-t">
                                        <td className="px-4 text-center py-2 font-medium">
                                            £{booking.quote_amount || "0.00"}
                                        </td>
                                        <td className="px-4 text-center py-2 font-medium">
                                            £{booking.booking_fee || "0.00"}
                                        </td>
                                        <td className="px-4 text-center py-2 font-medium">
                                            £{booking.discount || "0.00"}
                                        </td>
                                        <td className="px-4 text-center py-2">
                                            £{booking.total_payable || "0.00"}
                                        </td>
                                        <td className="px-4 text-center py-2 font-bold ">
                                            {booking.transaction_id || "TBC"}
                                        </td>
                                        <td className="px-4 text-center py-2 font-bold text-green-700">
                                            {
                                                <span
                                                    className={`px-2 py-0.5  text-xs font-medium ${booking.status === "Confirmed" || booking.status === "Active"
                                                        ? "bg-emerald-700 text-white"
                                                        : booking.status === "Cancelled"
                                                            ? "bg-red-600 text-white"
                                                            : booking.status === "Pending"
                                                                ? "bg-amber-500 text-white"
                                                                : booking.status === "Extended"
                                                                    ? "bg-orange-700 text-white"
                                                                    : "bg-gray-200 text-gray-700"
                                                        }`}
                                                >
                                                    {booking.status || "TBC"}
                                                </span>
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ================= EXTENDED PAYMENT (CONDITIONAL) ================= */}

                    {/* ================= EXTENDED PAYMENT ================= */}
                    <div>
                        <SectionTitle title="Extended Payment Summary" />

                        <div className="border  overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Quote
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Optional
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Extra Charge
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Total Payable
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Extended Transaction ID
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr className="border-t">
                                        <td className="px-4 text-center py-2 font-medium">
                                            £{booking.quote_amount || "0.00"}
                                        </td>
                                        <td className="px-4 text-center py-2 font-medium">
                                            £{booking.optional || "0.00"}
                                        </td>
                                        <td className="px-4 text-center py-2 font-medium">
                                            £{booking.extra_charge || "0.00"}
                                        </td>
                                        <td className="px-4 text-center py-2">
                                            £{booking.total_payable || "0.00"}
                                        </td>
                                        <td className="px-4 text-center py-2 font-bold ">
                                            {booking.extended_transaction_id || "TBC"}
                                        </td>
                                        <td className="px-4 text-center py-2 font-bold text-green-700">
                                            {
                                                <span
                                                    className={`px-2 py-0.5  text-xs font-medium ${booking.status === "Confirmed" || booking.status === "Active"
                                                        ? "bg-emerald-700 text-white"
                                                        : booking.status === "Cancelled"
                                                            ? "bg-red-600 text-white"
                                                            : booking.status === "Pending"
                                                                ? "bg-amber-500 text-white"
                                                                : booking.status === "Extended"
                                                                    ? "bg-orange-700 text-white"
                                                                    : "bg-gray-200 text-gray-700"
                                                        }`}
                                                >
                                                    {booking.status || "TBC"}
                                                </span>
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>


                </div>

                {/* FOOTER */}
                <div className="flex justify-end border-t px-6 py-4 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs border  bg-white hover:bg-gray-100 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
