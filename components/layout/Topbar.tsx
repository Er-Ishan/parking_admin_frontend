"use client";
// Changed by Qasim - 2025-02-20

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/assets/images/EliteLogo.png";

import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Bell,
  AlertCircle,
  LayoutDashboard,
  CirclePlus,
  FileText,
  Package,
  BadgePoundSterling,
  Tag,
  Settings,
  Link2,
  PlaneTakeoff,
  User,
  Building,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProfileDropdown from "@/components/shared/profile-dropdown";
import ProtectedRoute from "../ProtectedRoute";




/* ---------------- TYPES ---------------- */

type ChildItem = {
  title: string;
  url: string;
  icon?: any;
  permission?: string;   
};

type NavSection = {
  id: string;
  title: string;
  url: string;
  icon?: any;
  permission?: string;   
  items?: ChildItem[];
};

/* ---------------- NAV DATA ---------------- */

export const NAV_SECTIONS: NavSection[] = [
  { id: "dashboard", title: "", url: "/dashboard", icon: LayoutDashboard },

  {
    id: "addnew",
    title: "Add Bookings",
    url: "/AddBookings",
    icon: CirclePlus,
    permission: "access_admin_booking",
  },

  {
    id: "bookings",
    title: "Bookings",
    url: "/maurice-bookings",
    icon: FileText,
    items: [
      { title: "All Bookings", url: "/maurice-bookings", icon: FileText, permission: "access_all_bookings", },
      { title: "Cancelled Bookings", url: "/refund-bookings", icon: FileText, permission: "access_cancelled_bookings",},
    ],
  },

  // { id: "invoice", title: "Website", url: "/thomson-invoice", icon: FileText },

  {
    id: "websitebookings",
    title: "Website",
    url: "/thomson-invoice",
    icon: FileText,
    items: [
      { title: "Website Bookings", url: "/websiteData", icon: FileText, permission: "access_website_bookings", },
      { title: "Admin Booking", url: "/mobile-bookings", icon: FileText, permission: "access_admin_booking", },
      { title: "Incomplete Booking", url: "/maurice-incomplete", icon: FileText, permission: "access_incomplete_booking", },
      { title: "refunded date bookings", url: "/refund-bookings", icon: FileText, permission: "access_refunded_bookings", },
      { title: "Invoice", url: "/thomson-invoice", icon: FileText, permission: "access_invoice", },
    ],
  },


  {
    id: "supplier",
    title: "Supplier",
    url: "/supplier",
    icon: Building,
    items: [
      { title: "Supplier Booking", url: "/Suppliers-Info", icon: FileText, permission: "access_supplier_booking", },
      { title: "Supplier List", url: "/suppliersList", icon: FileText, permission: "access_supplier_list", },
      { title: "Report", url: "/supplier-report-new", icon: FileText, permission: "access_supplier_report", },
      { title: "Invoice", url: "/supplierInvoice", icon: FileText, permission: "access_supplier_invoice", },
    ],
  },

  {
    id: "reportdata",
    title: "Report",
    url: "/supplier",
    icon: Building,
    items: [
      { title: "Depart", url: "/depart-report", icon: FileText, permission: "access_depart_report", },
      { title: "Return", url: "/return-report", icon: FileText, permission: "access_return_report", },
      { title: "Depart & Return", url: "/depart-return-report", icon: FileText, permission: "access_depart_return_report", },
      { title: "Depart Cards Only", url: "/depart-cards-report", icon: FileText, permission: "access_depart_cards_report", },
    ],
  },

  {
    id: "product",
    title: "Product",
    url: "/viewProducts",
    icon: Package,
    
  },

  {
    id: "promo",
    title: "Promo Codes",
    url: "/promo-codes",
    icon: BadgePoundSterling,
  },

  {
    id: "support",
    title: "Support Ticket",
    url: "/SupportTicketsTable",
    icon: Tag,
  },
  // {
  //   id: "seo",
  //   title: "SEO & Pages",
  //   url: "/webPagesSEO",
  //   icon: Tag,
  //    items: [
  //     { title: "Features", url: "/webPagesSEO", icon: Link2 }
  //   ],
  // },

  {
    id: "settings",
    title: "Settings",
    url: "/ChargesTable",
    icon: Settings,
    items: [
      { title: "Website Settings", url: "/ChargesTable", icon: Link2,permission: "access_depart_cards_report",  },
      { title: "Airport Settings", url: "/airport-data", icon: PlaneTakeoff,permission: "access_depart_cards_report",  },
      { title: "Admin Settings", url: "/users-data", icon: User,permission: "access_depart_cards_report",  },
    ],
  },
];

/* ---------------- COMPONENT ---------------- */

export default function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [activeSection, setActiveSection] =
    React.useState<NavSection | null>(null);

  const [navCounts, setNavCounts] = React.useState<Record<string, number>>({});
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/session/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data));
  }, []);


  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/navbar-counts`
        );
        if (!res.ok) return;

        const data = await res.json();
        setNavCounts(data);
      } catch (err) {
        console.error("Navbar counts error", err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // auto refresh
    return () => clearInterval(interval);
  }, []);



  const CountBadge = ({ count }: { count?: number }) => {
    if (!count || count <= 0) return null;

    return (
      <span className="
      ml-2 min-w-[18px] h-[18px]
      px-1 rounded-full
      bg-blue-600 text-white
      text-[10px] font-semibold
      flex items-center justify-center
    ">
        {count}
      </span>
    );
  };


  // 🔗 MAP SUB MENU URL → COUNT KEY
  const getBookingCount = (title: string) => {
    switch (title) {
      case "All Bookings":
        return navCounts.total || 0;

      case "Active Bookings":
        return navCounts.active || 0;

      case "Supplier Booking":
        return navCounts.supplier || 0;

      case "Website Booking":
        return navCounts.website || 0;

      case "Incomplete Booking":
        return navCounts.incomplete || 0;

      case "Refund Bookings":
        return navCounts.refunds || 0;

      case "Admin Booking":
        return navCounts.admin || 0;

      default:
        return 0;
    }
  };




  // Auto-close subnav when route changes to non-child page
  React.useEffect(() => {
    const section = NAV_SECTIONS.find(
      (s) =>
        s.items?.some((i) => pathname.startsWith(i.url)) ||
        pathname.startsWith(s.url)
    );

    setActiveSection(section?.items ? section : null);
  }, [pathname]);

  const hasSubNav = Boolean(activeSection?.items?.length);

  const NavButton = ({ section }: { section: NavSection }) => {
    const isOpen = activeSection?.id === section.id;
    const isActive =
      pathname.startsWith(section.url) ||
      section.items?.some(i => pathname.startsWith(i.url));


    const count = navCounts[section.id]; // 👈 ID-BASED COUNT

    return (
      <button
        onClick={() => {
          if (!section.items) {
            router.push(section.url);
            setActiveSection(null);
            return;
          }

          setActiveSection(prev =>
            prev?.id === section.id ? null : section
          );
        }}
        className={cn(
          "relative border-2 inline-flex items-center gap-1 px-3 py-2 text-sm transition-all",
          "hover:bg-purple-400 hover:text-black:",

          // Active route
          isActive && "font-semibold bg-purple-400",

          // Dropdown OPEN state (IMPORTANT)
          isOpen && "bg-purple-400 text-black shadow-sm"
        )}

      >
        {section.icon && <section.icon size={16} />}
        <span>{section.title}</span>

        {/* 🔔 COUNT */}
        {!section.items && <CountBadge count={count} />}

        {section.items && (
          <ChevronDown
            size={14}
            className={cn(
              "transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>
    );
  };

  return (
    <ProtectedRoute>
      <>
        {/* ================= FIXED NAVBAR ================= */}
        <header className="fixed inset-x-0 top-0 z-50  dark:bg-purple-900/80 backdrop-blur border-b">
          {/* MAIN NAVBAR */}
          <div className="h-16 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative h-10 w-[55px]">
                  <Image
                    src={Logo}
                    alt="Thomson Parking"
                    width={180}
                    height={30}
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>


              <nav className="hidden md:flex gap-3">
                {NAV_SECTIONS.map((s) => (
                  <NavButton key={s.id} section={s} />
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">

              {/* <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/thomson-incomplete")}
              >
                <AlertCircle size={18} />
              </Button> */}

              <ProfileDropdown />
            </div>
          </div>

          {/* SUB NAVBAR */}
          {hasSubNav && activeSection && (
            <div className="border-t dark:bg-slate-900/90  backdrop-blur transition-all duration-300">
              <div className="h-12 flex items-center justify-center gap-4  px-4 overflow-x-auto">
                {activeSection.items!.map((item) => {
                  const count = getBookingCount(item.title);

                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      className={cn(
                        "flex items-center border-2 gap-2 px-3 py-2 text-sm whitespace-nowrap",
                        "hover:bg-purple-400 transition",
                        pathname === item.url && "bg-purple-400 font-semibold"
                      )}
                    >
                      {item.icon && <item.icon size={16} />}
                      <span>{item.title}</span>

                      {/* 🔴 COUNT BADGE */}
                      <CountBadge count={count} />
                    </Link>
                  );
                })}


              </div>
            </div>
          )}

          {/* MOBILE SEARCH */}
          <div className="px-4 pb-3 md:hidden">
            <Input placeholder="Search…" className="h-9" />
          </div>
        </header>

        {/* ================= SPACER ================= */}
        <div
          className={cn(
            "transition-all duration-300",
            hasSubNav ? "h-[112px]" : "h-16"
          )}
        />
      </>
    </ProtectedRoute>
  );
}
