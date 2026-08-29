import { BookOpen, Globe, Calendar, Lightbulb, Rocket, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WhatWeDoPage() {
  const activities = [
    {
      title: "University Collaborations & MoUs",
      icon: Globe,
      desc: "Establishing formal tie-ups with global universities for dual-degree paths, student mobility, and credit transfers.",
      points: ["Semester Exchange Programs", "Faculty Exchange Initiatives", "Joint Academic Summits"],
    },
    {
      title: "Research & Publication Desk",
      icon: BookOpen,
      desc: "Supporting undergraduate research papers, co-authoring with international scholars, and indexing papers in IEEE/Scopus.",
      points: ["International Paper Guidance", "Research Fellowship Matching", "Patent & Innovation Support"],
    },
    {
      title: "Events & Global Workshops",
      icon: Calendar,
      desc: "Organizing summits, guest lectures by foreign academicians, hackathons, and interactive global webinars.",
      points: ["Global Opportunities Summit", "Foreign Higher Ed Bootcamps", "International Student Orientation"],
    },
    {
      title: "Digital Operations & Tech Desk",
      icon: Rocket,
      desc: "Developing secure registration systems, QR check-ins, attendance tracking, and portal infrastructure.",
      points: ["QR Verification System", "Automated Feedback Capture", "Digital Certificate Management"],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="default" className="gap-2">
          <Lightbulb className="w-4 h-4 text-blue-400" /> What We Do
        </Badge>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Comprehensive <span className="gradient-text">Global Initiatives</span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          From drafting MoUs with foreign universities to managing digital event portals, GCC operates across specialized student desks to deliver seamless global exposure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {activities.map((act, idx) => (
          <div key={idx} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <act.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">{act.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{act.desc}</p>
            <ul className="space-y-2 pt-2">
              {act.points.map((p, pIdx) => (
                <li key={pIdx} className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
