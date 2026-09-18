"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import AddTaskForm from "@/components/add-task-form";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <div>
        <p className="text-sm">Signed in as {session.user?.email}</p>
        <AddTaskForm />
      </div>
    );
  }

  return (
    <Button onClick={() => signIn("google")}>Connect Google Calender</Button>
  );
}
