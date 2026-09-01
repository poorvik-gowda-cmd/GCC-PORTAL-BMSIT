"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderGit2, ArrowRight, ShieldCheck, Users, Calendar, Globe, FileText, Camera, Palette, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";

interface DepartmentCard {
  id: string;
  name: string;
  description: string;
  icon: typeof FolderGit2;
  color: string;
  badge: string;
  features: string[];
}

const DEPARTMENTS: DepartmentCard[] = [
  {
    id: "EXECUTIVE_COUNCIL",
    name: "Executive Council Desk",
    description: "Core leadership and operations coordination overseeing all GCC activities, MoUs, and task allocations.",
    icon: ShieldCheck,
    color: "text-amber-400 border-amber-500/30",
    badge: "LEADERSHIP",
    features: ["Global Task Assignment", "MoU Document Access", "All Department Overview", "President Remarks"],
  },
  {
    id: "RESEARCH_PUBLICATION",
    name: "Research & Publication Desk",
    description: "Academic research papers, joint publications, international collaborations, and knowledge dissemination.",
    icon: FileText,
    color: "text-indigo-400 border-indigo-500/30",
    badge: "RESEARCH",
    features: ["Research Paper Tracking", "Publication Pipeline", "Joint Collaboration Docs", "Journal Submissions"],
  },
  {
    id: "EVENTS_OPERATIONS",
    name: "Events & Operations Desk",
    description: "Event planning, registration management, operational planning, attendance tracking, and feedback collection.",
    icon: Calendar,
    color: "text-blue-400 border-blue-500/30",
    badge: "OPERATIONS",
    features: ["Event Management", "Attendance Forms", "Feedback Responses", "Logistics Coordination"],
  },
  {
    id: "TECHNICAL",
    name: "Technical Desk",
    description: "Event technology, website development, system maintenance, QR code registries, and tech project tracking.",
    icon: Globe,
    color: "text-[#68d32f] border-[#68d32f]/30",
    badge: "TECH & DIGITAL",
    features: ["Web & System Projects", "QR Registries", "Tech Support", "Digital Infrastructure"],
  },
  {
    id: "MARKETING",
    name: "Marketing Desk",
    description: "Brand communication, promotional campaigns, social media outreach, and event promotion.",
    icon: Users,
    color: "text-emerald-400 border-emerald-500/30",
    badge: "OUTREACH",
    features: ["Event Campaigns", "Registration Links", "Outreach Tracking", "Promotional Tasks"],
  },
  {
    id: "DESIGN",
    name: "Design Desk",
    description: "Visual design, poster creation, banners, creative requests, and visual brand assets.",
    icon: Palette,
    color: "text-purple-400 border-purple-500/30",
    badge: "CREATIVE",
    features: ["Poster Requests", "Banner Assets", "Creative Guidelines", "Visual Deliverables"],
  },
  {
    id: "PHOTOGRAPHY",
    name: "Photography Desk",
    description: "Media coverage, event photography, videography archiving, and visual content management.",
    icon: Camera,
    color: "text-rose-400 border-rose-500/30",
    badge: "MEDIA ARCHIVE",
    features: ["Event Photo Coverage", "Media Archive Drive", "Video Assets", "Coverage Schedules"],
  },
];

export default function DepartmentsIndexPage() {
  const [userDepts, setUserDepts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ user: { departments: string[] } }>("/api/v1/auth/me")
      .then((d) => {
        if (d?.user?.departments) {
          setUserDepts(d.user.departments.map((dep) => dep.toUpperCase().replace("-", "_")));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const assignedDepts = DEPARTMENTS.filter((d) => userDepts.includes(d.id));

  return (
    <div className="space-y-10 text-white">
      {/* Header */}
      <div>
        <Badge variant="default" className="mb-2">ORGANIZATION DIRECTORY</Badge>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FolderGit2 className="w-7 h-7 text-[#68d32f]" /> GCC Department Desks
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Select which departmental desk workspace you would like to enter today.
        </p>
      </div>

      {/* --- MULTI-DEPARTMENT SELECTION SECTION --- */}
      {assignedDepts.length > 0 && (
        <div className="space-y-4 p-6 rounded-3xl border border-[#68d32f]/30 bg-[#68d32f]/5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-[#68d32f] text-black font-semibold text-[10px]">
                {assignedDepts.length > 1 ? "MULTI-DEPARTMENT MEMBER" : "YOUR ASSIGNED DESK"}
              </Badge>
              <h2 className="text-xl font-bold text-white mt-1">
                {assignedDepts.length > 1 ? "Choose Which Department Workspace To Enter" : "Your Department Desk"}
              </h2>
            </div>
            <span className="text-xs text-[#68d32f] font-mono">
              {assignedDepts.length} Assigned {assignedDepts.length > 1 ? "Departments" : "Department"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {assignedDepts.map((dept) => {
              const Icon = dept.icon;
              return (
                <Card key={dept.id} className={`glass-panel ${dept.color} flex flex-col justify-between border-2 bg-slate-950/80`}>
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="outline" className="text-[10px] text-[#68d32f] border-[#68d32f]/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#68d32f]" /> ASSIGNED TO YOU
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-white">{dept.name}</CardTitle>
                    <CardDescription className="text-xs text-slate-300 leading-relaxed">
                      {dept.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <Link href={`/portal/departments/${dept.id}`} className="block">
                      <Button variant="default" size="lg" className="w-full justify-between text-xs font-bold bg-[#68d32f] text-black hover:bg-[#58b826]">
                        Enter {dept.name} Workspace <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* --- ALL DEPARTMENTS DIRECTORY --- */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-300 uppercase tracking-wider text-xs">
          All GCC Department Desks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon;
            const isAssigned = userDepts.includes(dept.id);
            return (
              <Card key={dept.id} className={`glass-panel ${dept.color} flex flex-col justify-between`}>
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px]">{dept.badge}</Badge>
                  </div>
                  <CardTitle className="text-lg text-white">{dept.name}</CardTitle>
                  <CardDescription className="text-xs text-slate-400 leading-relaxed">
                    {dept.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                    {dept.features.map((feat, idx) => (
                      <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {feat}
                      </div>
                    ))}
                  </div>

                  <Link href={`/portal/departments/${dept.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full justify-between text-xs border-slate-800 text-slate-200">
                      Open Department Desk <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
