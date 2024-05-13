"use client"

import { signIn, signOut, useSession } from 'next-auth/react';
import SignInComponent from "../components/signin";

export default function Home() {
    const session = useSession();

    // fetch statistics

    // show in table

    // add button that exports images + 


    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 lg:p-24">
            <SignInComponent />
            {session && session.status !== "unauthenticated" &&
                <div className="w-full h-full md:h-[70vh] lg:h-[80vh] flex items-center justify-center">
                    <h1>RATING OVERVIEW HERE</h1>
                </div>}
            {session && session.status === "unauthenticated" &&
                <div className="w-full h-full md:h-[70vh] lg:h-[80vh] flex items-center justify-center">
                    <h1>PLEASE LOG IN</h1>
                </div>}
        </main>);
}
