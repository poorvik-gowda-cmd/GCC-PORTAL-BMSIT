import Navbar from "@/components/Navbar";
import Members from "@/components/Members";
import Footer from "@/components/Footer";

export default function MembersPage() {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <Navbar />
      <div className="pt-24">
        <Members />
      </div>
      <Footer />
    </main>
  );
}