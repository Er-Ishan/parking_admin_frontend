"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SquarePen, Trash } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

interface BidItem {
    itemImage: string;
    itemTitle: string;
    itemOwner: string;
    price: string;
    yourOffer: string;
    recentOfferImage: string;
    recentOfferPrice: string;
    timeLeft: string;
}

const initialBidData: BidItem[] = [
    {
        itemImage: "/assets/images/nft/nft-items-img1.png",
        itemTitle: "Spanky & Friends",
        itemOwner: "Owned by ABC",
        price: "1.44 ETH",
        yourOffer: "3.053 ETH",
        recentOfferImage: "/assets/images/nft/nft-offer-img1.png",
        recentOfferPrice: "1.44.00 ETH",
        timeLeft: "2h 5m 40s",
    },
    {
        itemImage: "/assets/images/nft/nft-items-img2.png",
        itemTitle: "Nike Air Shoe",
        itemOwner: "Owned by ABC",
        price: "1.44 ETH",
        yourOffer: "3.053 ETH",
        recentOfferImage: "/assets/images/nft/nft-offer-img2.png",
        recentOfferPrice: "1.44.00 ETH",
        timeLeft: "2h 5m 40s",
    },
    {
        itemImage: "/assets/images/nft/nft-items-img3.png",
        itemTitle: "Woman Dresses",
        itemOwner: "Owned by ABC",
        price: "1.44 ETH",
        yourOffer: "3.053 ETH",
        recentOfferImage: "/assets/images/nft/nft-offer-img3.png",
        recentOfferPrice: "1.44.00 ETH",
        timeLeft: "2h 5m 40s",
    },
    {
        itemImage: "/assets/images/nft/nft-items-img4.png",
        itemTitle: "Smart Watch",
        itemOwner: "Owned by ABC",
        price: "1.44 ETH",
        yourOffer: "3.053 ETH",
        recentOfferImage: "/assets/images/nft/nft-offer-img4.png",
        recentOfferPrice: "1.44.00 ETH",
        timeLeft: "2h 5m 40s",
    },
    {
        itemImage: "/assets/images/nft/nft-items-img5.png",
        itemTitle: "Hoodie Rose",
        itemOwner: "Owned by ABC",
        price: "1.44 ETH",
        yourOffer: "3.053 ETH",
        recentOfferImage: "/assets/images/nft/nft-offer-img5.png",
        recentOfferPrice: "1.44.00 ETH",
        timeLeft: "2h 5m 40s",
    },
    {
        itemImage: "/assets/images/nft/nft-items-img6.png",
        itemTitle: "Hoodie Rose",
        itemOwner: "Owned by ABC",
        price: "1.44 ETH",
        yourOffer: "3.053 ETH",
        recentOfferImage: "/assets/images/nft/nft-offer-img6.png",
        recentOfferPrice: "1.44.00 ETH",
        timeLeft: "2h 5m 40s",
    },
    {
        itemImage: "/assets/images/nft/nft-items-img2.png",
        itemTitle: "Hoodie Rose",
        itemOwner: "Owned by ABC",
        price: "1.44 ETH",
        yourOffer: "3.053 ETH",
        recentOfferImage: "/assets/images/nft/nft-offer-img7.png",
        recentOfferPrice: "1.44.00 ETH",
        timeLeft: "2h 5m 40s",
    },
];

const RecentBidTable = () => {
    const [bids, setBids] = useState<BidItem[]>(initialBidData);

    const handleRemove = (index: number) => {
        setBids((prev) => prev.filter((_, i) => i !== index));
        toast.success('Table item deleted successfully!')
    }

    return (
        <Table className="table-auto border-spacing-0 border-separate">
            <TableHeader>
                <TableRow className="border-0">
                    <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-t border-s border-neutral-200 dark:border-slate-600 text-start rounded-tl-lg">
                        Items
                    </TableHead>
                    <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-t border-neutral-200 dark:border-slate-600">
                        Price
                    </TableHead>
                    <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-t border-neutral-200 dark:border-slate-600">
                        Your Offer
                    </TableHead>
                    <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-t border-neutral-200 dark:border-slate-600">
                        Recent Offer
                    </TableHead>
                    <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-t border-neutral-200 dark:border-slate-600">
                        Time Left
                    </TableHead>
                    <TableHead className="bg-neutral-100 dark:bg-slate-700 text-base px-4 h-12 border-t border-e border-neutral-200 dark:border-slate-600 text-center rounded-tr-lg">
                        Action
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bids.map((item, index) => {
                    const isLast = index === bids.length - 1;
                    return (
                        <TableRow key={index}>
                            <TableCell
                                className={`py-3 px-4 first:border-s last:border-e border-b border-neutral-200 dark:border-slate-600 text-start ${isLast ? "rounded-bl-lg" : ""
                                    }`}
                            >
                                <div className="flex items-center">
                                    <Image
                                        src={item.itemImage}
                                        alt={item.itemTitle}
                                        width={40}
                                        height={40}
                                        className="flex-shrink-0 w-10 h-10 rounded-full me-3"
                                    />
                                    <div className="flex-grow">
                                        <h6 className="text-base mb-0 font-semibold">
                                            {item.itemTitle}
                                        </h6>
                                        <span className="text-sm text-neutral-500 dark:text-neutral-300 font-normal">
                                            {item.itemOwner}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600">
                                {item.price}
                            </TableCell>

                            <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600">
                                {item.yourOffer}
                            </TableCell>

                            <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600">
                                <div className="flex items-center">
                                    <Image
                                        src={item.recentOfferImage}
                                        alt={item.recentOfferPrice}
                                        width={40}
                                        height={40}
                                        className="flex-shrink-0 w-10 h-10 rounded-full me-3"
                                    />
                                    <div className="flex-grow">
                                        <h6 className="text-base mb-0 font-semibold text-[#0a0a0a] dark:text-white">
                                            {item.recentOfferPrice}
                                        </h6>
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell className="py-3 px-4 border-b border-neutral-200 dark:border-slate-600">
                                {item.timeLeft}
                            </TableCell>

                            <TableCell className={`py-3 px-4 border-b border-e border-neutral-200 dark:border-slate-600 text-center ${isLast ? "rounded-br-2xl" : ""
                                }`} >
                                <div className="inline-flex items-center gap-3">
                                    <Button
                                        type="button"
                                        className={cn(`bg-transparent !p-0 shadow-none hover:bg-transparent text-xl text-green-500 dark:text-green-500`)}
                                    >
                                        <SquarePen width={18} />
                                    </Button>
                                    <Button
                                        type="button"
                                        className={cn(`bg-transparent !p-0 shadow-none hover:bg-transparent text-xl text-red-600 dark:text-red-500 remove-btn`)}
                                        onClick={() => handleRemove(index)}
                                    >
                                        <Trash width={18} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

export default RecentBidTable;
