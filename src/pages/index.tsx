"use client"

import Image from "next/image";
import ImageCarousel from '../components/ImageCarousel';
import { signIn, signOut, useSession } from 'next-auth/react';
import SignInComponent from "../components/signin";
import { nftimages } from "../assets/nftimages";

export default function Home() {
  const session = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 lg:p-24">
      <SignInComponent />
      {session && session.status !== "unauthenticated" &&
        <div className="w-full h-full md:h-[70vh] lg:h-[80vh] flex items-center justify-center">
          <ImageCarousel images={nftimages} />
        </div>}
      {session && session.status === "unauthenticated" &&
        <div className="w-full h-full md:h-[70vh] lg:h-[80vh] flex items-center justify-center">
          <h1>PLEASE LOG IN</h1>
        </div>}
    </main>);
}
