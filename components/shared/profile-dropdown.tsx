"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import userImg from "@/public/assets/images/user.png";
import Logout from "@/components/auth/logout";

export default function ProfileDropdown() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="rounded-full w-10 h-10 bg-gray-200 hover:bg-gray-300 border-0"
        >
          <Image
            src={user?.image || userImg}
            className="rounded-full"
            width={40}
            height={40}
            alt="User"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60 p-4 rounded-2xl shadow-xl"
        side="bottom"
        align="end"
      >
        <div className="py-3 px-4 bg-blue-100 rounded-lg mb-4">
          <h6 className="text-lg font-bold text-gray-900">
            {user?.name || "User"}
          </h6>
          <span className="text-sm text-gray-600">{user?.email}</span>
        </div>

        <ul className="flex flex-col gap-3">
          <li>
            <Logout />
          </li>
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
