"use client"
import Link from "next/link";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "../ui/navigation-menu";
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "../mode-toggle/toggle";

export default function Navbar(){
    return (
        <NavigationMenu className="flex justify-between min-w-full list-none h-16 sticky top-0 p-5 h-[60px]">
            <div className="flex items-center">
                <h1 className="mr-4 font-bold text-2xl bg-gradient-to-b from-neutral-200 via-neutral-400 to-neutral-800 bg-clip-text text-transparent">Journee</h1>
            {/* </div>
            <div className="flex"> */}
                <NavigationMenuItem className="mx-4 hover:underline">
                    <Link href="/trips">
                        Trips
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem className="mx-4 hover:underline">
                    <Link href="/explore">
                        Explore
                    </Link>
                </NavigationMenuItem>
            </div>
            <div className="flex">
                <div className="mx-4">
                    <ModeToggle/>
                </div>
                <SignedIn>
                    <UserButton/>
                </SignedIn>
            </div>

            
        </NavigationMenu>
    )
}