import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function VisionPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <Navbar />
      <div className="pt-24">
        <About />
      </div>
      <Footer />
    </main>
  );
}
