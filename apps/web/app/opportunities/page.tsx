import Navbar from "@/components/Navbar";
import Opportunities from "@/components/Opportunities";
import Footer from "@/components/Footer";

export default function OpportunitiesPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <Navbar />
      <div className="pt-24">
        <Opportunities />
      </div>
      <Footer />
    </main>
  );
}
