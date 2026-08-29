"use client";

import { useState, useEffect } from "react";
import { Globe, Building2, ShieldAlert, Loader2, AlertCircle, Handshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MouRecord } from "@gcc-portal/contracts";

export default function CollaborationsPage() {
  const [mous, setMous] = useState<MouRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

    (async () => {
      try {
        const resp = await fetch(`${apiBase}/api/v1/mous`);
        const json = (await resp.json()) as { success: boolean; data?: { mous: MouRecord[] }; error?: { message?: string } };
        if (active) {
          if (json.success && json.data) {
            setMous(json.data.mous || []);
          } else {
            setError(json.error?.message || "Failed to load collaborations.");
          }
        }
      } catch {
        if (active) {
          setError("Unable to connect to the collaborations registry server.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="default" className="gap-2">
          <Globe className="w-4 h-4 text-blue-400" /> Public Showcase
        </Badge>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          MoUs & Partner <span className="gradient-text">Institutions</span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          Official Memorandum of Understanding (MoU) agreements established between BMSIT&M and premier global academic institutions.
        </p>
      </div>

      {loading && (
        <div className="min-h-[30vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading verified MoU agreements...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-center gap-2 max-w-lg mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && mous.length === 0 && (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3 max-w-lg mx-auto">
          <Handshake className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No MoU Agreements Published Yet</h3>
          <p className="text-xs text-slate-400">
            Official institutional partnership agreements will appear here once approved and synchronized with the registry.
          </p>
        </div>
      )}

      {!loading && !error && mous.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mous.map((m) => (
            <div key={m.mouId} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">{m.country}</Badge>
                <Badge variant="success">{m.status}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{m.partnerInstitution}</h3>
              </div>
              <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                <div><span className="font-semibold text-slate-400">Collaboration Area: </span>{m.collaborationArea}</div>
                <div><span className="font-semibold text-slate-400">Agreement Year: </span>{m.startYear}{m.endYear ? ` - ${m.endYear}` : ""}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel p-4 rounded-xl border border-amber-500/30 text-xs text-amber-300 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
        <span>
          <strong>Notice:</strong> Detailed MoU legal documents and private administrative records are protected under GCC access policies and available exclusively to authorized Executive Council members in the GCC Private Portal.
        </span>
      </div>
    </div>
  );
}