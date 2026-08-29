import { Award, Globe, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OpportunitiesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="default" className="gap-2">
          <Award className="w-4 h-4 text-blue-400" /> International Directory
        </Badge>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Global <span className="gradient-text">Opportunities</span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          Discover verified international exchange programs, summer research fellowships, scholarships, and international hackathons open for BMSIT&M students.
        </p>
      </div>

      {/* Empty state — real opportunities will be populated from the database */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mx-auto">
          <Globe className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-white">No opportunities listed yet</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          International exchange programs, fellowships, and scholarships will appear here once published by the GCC admin team.
        </p>
      </div>
    </div>
  );
}
