import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GCC Portal — Global Collaboration Cell | BMSIT&M",
  description: "Global Collaboration Cell at BMSIT&M — Connecting students with international opportunities, research, university partnerships, and global innovation.",
  keywords: ["GCC", "BMSIT&M", "Global Collaboration Cell", "International Education", "Research Fellowships", "University Partnerships"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#050608] text-white flex flex-col`}>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
