"use client"

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { insertUser } from "../../../utils/supabaseRequest";
import { IconCat } from "@tabler/icons-react";
import Link from "next/link";


export default function Trips() {
    const { userId, getToken } = useAuth(); // Destructure userId and getToken from useAuth
    const { user } = useUser(); // Destructure user object from useUser to access user details
    const username = user?.username;

    useEffect(() => {
        const insertUserToSupabase = async () => {
        try {
            const token = await getToken({template:"supabase"}); // Fetch the token asynchronously
            if (userId && token && username) {
            // Ensure both userId and token are available before making the request
            const error = await insertUser({ userId, token, username }); // Call insertUser function with userId and token
            
            if (error) {
                console.error("Error inserting user:", error);
            } else {
                console.log("User inserted successfully");
            }
            }
        } catch (error) {
            console.error("Error fetching token or inserting user:", error);
        }
        };
        insertUserToSupabase(); // Call the function inside useEffect

    }, [userId, getToken, username]); // Add userId and getToken as dependencies to the effect
    return (
        <div className="h-screen w-screen flex justify-center items-center">
            <div className="flex flex-col items-center">
                <span className="text-4xl">😴</span>
                <h4 className="mt-1">No Trips yet...</h4>
                <button className="p-[3px] relative mt-4 block mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                    <div className="px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent md:text-lg text-md">
                        <Link href="/add_trip">
                            Add Trip
                        </Link>
                    </div>
                </button>
            </div>
        </div>
    )
}