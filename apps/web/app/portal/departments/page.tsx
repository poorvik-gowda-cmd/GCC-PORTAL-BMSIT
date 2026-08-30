"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderGit2, ArrowRight, ShieldCheck, Users, Calendar, CheckSquare, FileText, Camera, Palette, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    name: "Executive Council",
    description: "Core leadership and operations coordination overseeing all GCC activities, MoUs, and task allocations.",
    icon: ShieldCheck,
    color: "text-amber-400 border-amber-500/30",
    badge: "LEADERSHIP",
    features: ["Global Task Assignment", "MoU Document Access", "All Department Overview", "President Remarks"],
  },
  {
    id: "EVENTS_OPERATIONS",
    name: "Events & Operations",
    description: "Event planning, registration management, operational planning, attendance tracking, and feedback collection.",
    icon: Calendar,
    color: "text-blue-400 border-blue-500/30",
    badge: "OPERATIONS",
    features: ["Event Management", "Attendance Forms", "Feedback Responses", "Logistics Coordination"],
  },
  {
    id: "TECHNICAL",
    name: "Technical",
    description: "Event technology, website development, system maintenance, QR code registries, and tech project tracking.",
    icon: Globe,
    color: "text-cyan-400 border-cyan-500/30",
    badge: "TECH & DIGITAL",
    features: ["Web & System Projects", "QR Registries", "Tech Support", "Digital Infrastructure"],
  },
  {
    id: "MARKETING",
    name: "Marketing",
    description: "Brand communication, promotional campaigns, social media outreach, and event promotion.",
    icon: Users,
    color: "text-emerald-400 border-emerald-500/30",
    badge: "OUTREACH",
    features: ["Event Campaigns", "Registration Links", "Outreach Tracking", "Promotional Tasks"],
  },
  {
    id: "DESIGN",
    name: "Design",
    description: "Visual design, poster creation, banners, creative requests, and visual brand assets.",
    icon: Palette,
    color: "text-purple-400 border-purple-500/30",
    badge: "CREATIVE",
    features: ["Poster Requests", "Banner Assets", "Creative Guidelines", "Visual Deliverables"],
  },
  {
    id: "PHOTOGRAPHY",
    name: "Photography",
    description: "Media coverage, event photography, videography archiving, and visual content management.",
    icon: Camera,
    color: "text-rose-400 border-rose-500/30",
    badge: "MEDIA ARCHIVE",
    features: ["Event Photo Coverage", "Media Archive Drive", "Video Assets", "Coverage Schedules"],
  },
];

export default function DepartmentsIndexPage() {
  return (
    <div className="space-y-8">
      <div>
        <Badge variant="default" className="mb-2">ORGANIZATION DIRECTORY</Badge>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FolderGit2 className="w-6 h-6 text-blue-400" /> GCC Department Desks
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore specialized organizational desks, operational tasks, and resource hubs across GCC.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {DEPARTMENTS.map((dept) => {
          const Icon = dept.icon;
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
                  <Button variant="gradient" size="sm" className="w-full justify-between text-xs">
                    Open Department Desk <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
