"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user?.email}</p>
        {/* Show your app content here */}
      </div>
    );
  }

  return <Button onClick={() => signIn("google")}>Connect Google Calender</Button>;

}
