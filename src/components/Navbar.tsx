"use client";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CircleUser, Settings } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "convex-helpers/react";
import { api } from "../../convex/_generated/api";
import {
  AlertDialog,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import SettingsOverlay from "./SettingsOverlay";

export default function Navbar() {
  const { user, logout } = useAuth0();
  const { isPending: fetchingUser, data: convexUser } = useQuery(
    api.users.getUser,
  );

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Image
          src={"/moodle-icon.png"}
          alt={"logo"}
          width={32}
          height={32}
        ></Image>
        <span className="">Web Services API Reference</span>
      </Link>
      <div className="flex flex-row justify-between gap-2">
        {!fetchingUser && convexUser?.isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <SettingsOverlay />
          </AlertDialog>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user ? (
              <>
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>{" "}
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuItem
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: window.location.origin,
                  },
                })
              }
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
