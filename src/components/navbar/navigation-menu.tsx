import Link from "next/link";
import { NavigationMenu, NavigationMenuItem} from "../ui/navigation-menu";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "../mode-toggle/toggle";
import { IconMapQuestion, IconPlaneDeparture } from "@tabler/icons-react";
import { useState } from "react";
import { useTheme } from "next-themes";

export default function Navbar(){
    const [page, setPage] = useState<string>('Trips')
    const { resolvedTheme } = useTheme();
    
    return (
        <div>
            <NavigationMenu className="flex justify-between min-w-full list-none hidden sm:flex relative top-0 p-5 h-[60px]">
                <div className="flex items-center">
                    <h1 className="mr-4 font-bold text-2xl bg-gradient-to-b from-neutral-200 via-neutral-400 to-neutral-800 bg-clip-text text-transparent">Journee</h1>
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
                <div className="flex items-center justify-center">
                    <div className="mx-4">
                        <ModeToggle/>
                    </div>
                    <div className="ml-2">
                        <UserButton/>                        
                    </div>

                </div>
            </NavigationMenu>

            <NavigationMenu className="flex sm:hidden top-0 h-[60px] p-5 justify-end min-w-full list-none">
                <NavigationMenuItem>
                    <ModeToggle/>
                </NavigationMenuItem>
            </NavigationMenu>
            
            <NavigationMenu className={`flex sm:hidden fixed ${resolvedTheme==='dark'?"bg-black":"bg-white"} bottom-0 h-[60px] p-5 justify-between min-w-full list-none`}>
                <NavigationMenuItem className="mx-4">
                    <div className={`flex flex-col items-center ${page=="Trips"?"text-indigo-500":""}`}>
                        <Link href='/trips' onClick={()=>setPage('Trips')}>
                            <IconPlaneDeparture/>
                        </Link>  
                        <span>Trips</span>
                    </div>
                </NavigationMenuItem>
                <NavigationMenuItem className="mx-4">
                    <div className={`flex flex-col items-center ${page=="Explore"?"text-indigo-500":""}`}>
                        <Link href='/explore' onClick={()=>setPage('Explore')}>
                            <div><IconMapQuestion/></div>
                        </Link> 
                        <span>Explore</span>
                    </div>
                </NavigationMenuItem>
                <NavigationMenuItem className="mx-4">
                    <div className="flex flex-col items-center">
                        <UserButton/>
                        Profile
                    </div>                   
                </NavigationMenuItem>
            </NavigationMenu>
        </div>
    )
}