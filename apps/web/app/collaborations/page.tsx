import Navbar from "@/components/Navbar";
import Collaborations from "@/components/Collaborations";
import Footer from "@/components/Footer";

export default function CollaborationsPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <Navbar />
      <div className="pt-24">
        <Collaborations />
      </div>
      <Footer />
    </main>
  );
}