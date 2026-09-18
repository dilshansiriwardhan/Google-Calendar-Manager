import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Providers from "@/components/Providers";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Calendar Manage",
  description: "This app manage your google calender tasks for you",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className={cn("dark", "font-sans", inter.variable)} suppressHydrationWarning>
      <body className="p-10">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
