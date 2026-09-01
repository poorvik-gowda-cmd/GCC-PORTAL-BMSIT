import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Opportunities from "@/components/Opportunities";
import Footer from "@/components/Footer";

export default function WhatWeDoPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <Navbar />
      <div className="pt-24">
        <About />
        <Opportunities />
      </div>
      <Footer />
    </main>
  );
}
