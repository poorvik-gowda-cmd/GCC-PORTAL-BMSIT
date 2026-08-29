import { Globe, Target, Eye, Compass, Award, HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VisionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="default" className="gap-2">
          <Compass className="w-4 h-4 text-blue-400" /> Vision & Mission
        </Badge>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Empowering Students to Excel <span className="gradient-text">Globally</span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          The Global Collaboration Cell (GCC) at BMSIT&M serves as the central hub for international academic partnerships, research opportunities, and global career pathways.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-panel border-blue-500/30 p-4">
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Eye className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl text-white">Our Vision</CardTitle>
            <CardDescription className="text-sm text-slate-300 leading-relaxed">
              To transform BMSIT&M into a premier internationally recognized institution where every student has seamless access to global learning, cross-border research collaborations, and world-class career opportunities regardless of geographical boundaries.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass-panel border-indigo-500/30 p-4">
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Target className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl text-white">Our Mission</CardTitle>
            <CardDescription className="text-sm text-slate-300 leading-relaxed">
              To establish strategic Memorandum of Understanding (MoU) partnerships with leading international universities, facilitate student exchange initiatives, encourage high-impact research publications, and nurture student leaders to represent BMSIT&M on global forums.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Objectives */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white text-center">Strategic Objectives</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-xl space-y-3">
            <Globe className="w-6 h-6 text-blue-400" />
            <h3 className="font-semibold text-white">Global University MoUs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Forming formal academic ties with QS-ranked universities across Europe, North America, and Asia for exchange programs and joint research projects.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl space-y-3">
            <Award className="w-6 h-6 text-indigo-400" />
            <h3 className="font-semibold text-white">Scholarships & Fellowships</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Providing guidance and mentorship to students applying for prestigious international scholarships like Erasmus+, Fulbright, DAAD, and Chevening.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl space-y-3">
            <HeartHandshake className="w-6 h-6 text-amber-400" />
            <h3 className="font-semibold text-white">Cultural & Professional Growth</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cultivating global mindsets, cross-cultural competence, and professional ethics required for success in multi-national research and corporate environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
