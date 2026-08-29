import Link from "next/link";
import { Globe, Award, Calendar, ArrowRight, ShieldCheck, Sparkles, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 bg-grid-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-slate-950/80 to-slate-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <Badge variant="default" className="px-4 py-1.5 text-sm gap-2 border-blue-500/30">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Global Collaboration Cell — BMSIT&M
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Bridging Students with <br />
            <span className="gradient-text">Global Opportunities</span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
            Empowering BMSIT&M students through international university partnerships, global research fellowships, student exchange programs, and world-class innovation networks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/opportunities">
              <Button size="lg" variant="gradient" className="gap-2 text-base">
                Explore Opportunities
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline" className="gap-2 text-base">
                <Calendar className="w-5 h-5 text-blue-400" />
                Upcoming Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white">Our Core Pillars</h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Fostering global excellence through structured international engagement, academic research, and professional networking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="glass-panel glass-panel-hover border-slate-800">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Globe className="w-6 h-6" />
              </div>
              <CardTitle>International Collaborations</CardTitle>
              <CardDescription>
                Facilitating MoUs, joint degree programs, and semester exchange initiatives with renowned universities across Europe, the US, and Asia.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-panel glass-panel-hover border-slate-800">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <BookOpenCheck className="w-6 h-6" />
              </div>
              <CardTitle>Research & Publications</CardTitle>
              <CardDescription>
                Guiding students toward international research internships, peer-reviewed journal papers, and global conference presentations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-panel glass-panel-hover border-slate-800">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Award className="w-6 h-6" />
              </div>
              <CardTitle>Global Career Pathways</CardTitle>
              <CardDescription>
                Connecting students with international scholarships, higher study mentorship, and global competitive hackathons.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Opportunities & Events CTAs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel rounded-2xl p-8 border border-slate-800 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Global Opportunities</h3>
              <p className="text-slate-400 text-sm mt-1">International internships, fellowships, and exchange programs for BMSIT&M students.</p>
            </div>
            <Link href="/opportunities">
              <Button variant="outline" className="gap-2 text-xs w-fit">
                Browse Opportunities <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="glass-panel rounded-2xl p-8 border border-slate-800 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Events & Workshops</h3>
              <p className="text-slate-400 text-sm mt-1">Summits, workshops, and seminars. Register directly on our official portal.</p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="gap-2 text-xs w-fit">
                View Upcoming Events <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Member Portal Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-8 md:p-12 border border-blue-500/20 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <Badge variant="default" className="gap-1.5">
              <ShieldCheck className="w-4 h-4" /> GCC Member Portal
            </Badge>
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Are you an authorized GCC Member or Faculty Lead?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Access your department desk, manage assigned tasks, track event registrations, and view operational resources. Login requires a pre-existing GCC database account.
            </p>
          </div>
          <Link href="/portal/login" className="shrink-0">
            <Button variant="gradient" size="lg" className="gap-2">
              Sign In to Portal <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
