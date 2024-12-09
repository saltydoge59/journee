"use client"

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { insertUser } from "../../../utils/supabaseRequest";


export default function Home() {
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
        <div>Hello!</div>
    )
}