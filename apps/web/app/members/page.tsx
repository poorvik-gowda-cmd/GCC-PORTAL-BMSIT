"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, AlertCircle, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RoleId, DepartmentId } from "@gcc-portal/contracts";

interface MemberItem {
  id: string;
  fullName: string;
  email: string;
  profilePhotoReference?: string | null;
  roleNames: string[];
  departmentNames: string[];
  roles: RoleId[];
  departments: DepartmentId[];
}

export default function MembersPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

    (async () => {
      try {
        const resp = await fetch(`${apiBase}/api/v1/members`);
        const json = await resp.json() as { success: boolean; data?: { members: MemberItem[] }; error?: { message?: string } };
        if (active) {
          if (json.success && json.data) {
            setMembers(json.data.members);
          } else {
            setError(json.error?.message || "Failed to load directory.");
          }
        }
      } catch {
        if (active) {
          setError("Unable to connect to the GCC member directory server.");
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
          <Users className="w-4 h-4 text-blue-400" /> GCC Leadership & Members
        </Badge>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          GCC Team <span className="gradient-text">Directory</span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          Official directory of verified faculty leads, student chairs, and departmental members managing GCC initiatives.
        </p>
      </div>

      {loading && (
        <div className="min-h-[30vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading verified team members...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-center gap-2 max-w-lg mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && members.length === 0 && (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3 max-w-lg mx-auto">
          <UserCheck className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Members Listed Yet</h3>
          <p className="text-xs text-slate-400">
            Verified leadership and active member profiles will appear here once onboarded by the administration.
          </p>
        </div>
      )}

      {!loading && !error && members.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {members.map((m) => {
            const initials = m.fullName
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            const primaryRole = m.roleNames[0] || "Member";
            const primaryDept = m.departmentNames[0] || (m.departments[0] ? m.departments[0].replace("_", " ") : "General Council");

            return (
              <div key={m.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 text-center hover:border-slate-700 transition-all">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                  {initials || "GCC"}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{m.fullName}</h3>
                  <p className="text-xs text-blue-400 font-medium">{primaryRole}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-300">
                    {primaryDept}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}