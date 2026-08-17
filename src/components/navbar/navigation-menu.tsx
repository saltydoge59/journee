"use client"

import { Link, useLocation } from "react-router-dom";
import { NavigationMenu, NavigationMenuItem} from "../ui/navigation-menu";
import { UserButton } from "@clerk/react";
import { ModeToggle } from "../mode-toggle/toggle";
import { IconMapQuestion, IconPlaneDeparture } from "@tabler/icons-react";
import { useState, useEffect } from "react";

export default function Navbar(){
    const [page, setPage] = useState<string>('Trips')
    const { pathname } = useLocation();

    // Update the `page` state based on the current route
    useEffect(() => {
        if (pathname === '/trips') {
            setPage('Trips');
        } else if (pathname === '/snapspot') {
            setPage('Snapspot');
        }
    }, [pathname]);
    
    return (
        <div>
            <NavigationMenu className="flex justify-between min-w-full list-none hidden sm:flex relative top-0 p-5 h-[60px] border-b border-border">
                <div className="flex items-center">
                    <Link to="/trips">
                        <h1 className="mr-6 font-serif-display text-2xl italic text-foreground">Journee</h1>
                    </Link>
                    <NavigationMenuItem className={`font-mono-label mx-4 text-xs uppercase ${page==="Trips"?"text-primary":"text-muted-foreground hover:text-foreground"}`}>
                        <Link to="/trips">
                            Trips
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem className={`font-mono-label mx-4 text-xs uppercase ${page==="Snapspot"?"text-primary":"text-muted-foreground hover:text-foreground"}`}>
                        <Link to="/snapspot">
                            Snapspot
                        </Link>
                    </NavigationMenuItem>
                </div>
                <div className="flex items-center justify-center">
                    <div className="mx-4">
                        <ModeToggle/>
                    </div>
                    <div className="ml-2">
                        <UserButton/>
                    </div>

                </div>
            </NavigationMenu>

            <NavigationMenu className="flex sm:hidden top-0 h-[60px] p-5 justify-between min-w-full list-none border-b border-border">
                <Link to="/trips">
                    <span className="font-serif-display text-xl italic text-foreground">Journee</span>
                </Link>
                <NavigationMenuItem>
                    <ModeToggle/>
                </NavigationMenuItem>
            </NavigationMenu>

            <NavigationMenu className="flex sm:hidden fixed bg-card border-t border-border bottom-0 h-[60px] p-5 justify-between min-w-full list-none">
                <NavigationMenuItem className="mx-4">
                    <div className={`flex flex-col items-center font-mono-label text-[11px] uppercase ${page=="Trips"?"text-primary":"text-muted-foreground"}`}>
                        <Link to='/trips' onClick={()=>setPage('Trips')}>
                            <IconPlaneDeparture/>
                        </Link>
                        <span>Trips</span>
                    </div>
                </NavigationMenuItem>
                <NavigationMenuItem className="mx-4">
                    <div className={`flex flex-col items-center font-mono-label text-[11px] uppercase ${page=="Snapspot"?"text-primary":"text-muted-foreground"}`}>
                        <Link to='/snapspot' onClick={()=>setPage('Snapspot')}>
                            <div><IconMapQuestion/></div>
                        </Link>
                        <span>Snapspot</span>
                    </div>
                </NavigationMenuItem>
                <NavigationMenuItem className="mx-4">
                    <div className="flex flex-col items-center font-mono-label text-[11px] uppercase text-muted-foreground">
                        <UserButton/>
                        Profile
                    </div>
                </NavigationMenuItem>
            </NavigationMenu>
        </div>
    )
}