import Navbar from "@/components/Navbar";
import Hero from "@/components/hero";
import About from "@/components/About";
import ImpactStats from "@/components/ImpactStats";
import Opportunities from "@/components/Opportunities";
import Events from "@/components/Events";
import Collaborations from "@/components/Collaborations";
import Members from "@/components/Members";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <Navbar />
      <Hero />
      <About />
      <ImpactStats />
      <Opportunities />
      <Events />
      <Collaborations />
      <Members />
      <Contact />
      <Footer />
    </main>
  );
}
