"use client"

import ImageCarousel from '../../components/ImageCarousel';
import { useSession } from 'next-auth/react';
import SignInComponent from "../../components/signin";
import { nftimages } from "../../assets/nftcandidates";
import { useRouter } from 'next/router';

export default function Home() {
    const session = useSession();
    const router = useRouter();
    const { imagename } = router.query;

    if (typeof imagename !== 'string') {
        return null; // still loading
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 lg:p-24">
            <SignInComponent />
            {session && session.status !== "unauthenticated" &&
                <div className="w-full h-full md:h-[70vh] lg:h-[80vh] flex items-center justify-center">
                    <ImageCarousel images={nftimages} startImage={imagename} />
                </div>}
            {session && session.status === "unauthenticated" &&
                <div className="w-full h-full md:h-[70vh] lg:h-[80vh] flex items-center justify-center">
                    <h1>PLEASE LOG IN</h1>
                </div>}
        </main>);
}
