"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FolderGit2,
  ShieldCheck,
  Calendar,
  Globe,
  Users,
  Palette,
  Camera,
  CheckSquare,
  FileText,
  UploadCloud,
  QrCode,
  ArrowRight,
  ExternalLink,
  Plus,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DEPT_META: Record<
  string,
  {
    name: string;
    badge: string;
    description: string;
    icon: typeof FolderGit2;
    color: string;
  }
> = {
  EXECUTIVE_COUNCIL: {
    name: "Executive Council Desk",
    badge: "LEADERSHIP & GOVERNANCE",
    description: "Central command desk for GCC Presidents and Executive Members to oversee all high-level approvals, global task summaries, and legal MoUs.",
    icon: ShieldCheck,
    color: "text-amber-400 border-amber-500/30",
  },
  EVENTS_OPERATIONS: {
    name: "Events & Operations Desk",
    badge: "EVENT LOGISTICS & OPS",
    description: "Operational management hub for event management shortcuts, live registration responses, attendance tracking, and feedback links.",
    icon: Calendar,
    color: "text-blue-400 border-blue-500/30",
  },
  TECHNICAL: {
    name: "Technical Desk",
    badge: "DIGITAL & SYSTEMS",
    description: "Tech operations desk for web/system projects tracker, technical issue board, QR code registries, and digital infrastructure status.",
    icon: Globe,
    color: "text-cyan-400 border-cyan-500/30",
  },
  MARKETING: {
    name: "Marketing Desk",
    badge: "PROMOTIONS & OUTREACH",
    description: "Campaign operations desk for campaign schedules, public registration links, and promotional outreach tasks.",
    icon: Users,
    color: "text-emerald-400 border-emerald-500/30",
  },
  DESIGN: {
    name: "Design Desk",
    badge: "CREATIVE & BRANDING",
    description: "Visual design workspace for poster/banner creative requests, brand guidelines, and design asset status.",
    icon: Palette,
    color: "text-purple-400 border-purple-500/30",
  },
  PHOTOGRAPHY: {
    name: "Photography Desk",
    badge: "MEDIA ARCHIVE & COVERAGE",
    description: "Media coverage desk for event coverage calendar, video archives, and photo drive references.",
    icon: Camera,
    color: "text-rose-400 border-rose-500/30",
  },
};

export default function DepartmentDeskPage() {
  const params = useParams();
  const rawDept = (params?.dept as string) || "TECHNICAL";
  const deptKey = rawDept.toUpperCase().replace("-", "_");

  const meta = DEPT_META[deptKey] || {
    name: `${deptKey.replace("_", " ")} Desk`,
    badge: "DEPARTMENT DESK",
    description: "Authorized departmental resources and task tracking.",
    icon: FolderGit2,
    color: "text-blue-400 border-slate-800",
  };

  const Icon = meta.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="default" className="mb-2">{meta.badge}</Badge>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Icon className={`w-6 h-6 ${meta.color.split(" ")[0]}`} /> {meta.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{meta.description}</p>
        </div>

        <div className="flex gap-2">
          <Link href="/portal/tasks">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <CheckSquare className="w-3.5 h-3.5" /> Department Task Tracker
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 1. EXECUTIVE COUNCIL DESK ── */}
      {deptKey === "EXECUTIVE_COUNCIL" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-panel border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" /> High-Level Approvals & Governance
              </CardTitle>
              <CardDescription className="text-xs">
                Executive decisions and leadership approval controls across GCC.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/portal/tasks" className="block p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-colors">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Global Task Summary & Allocation</h4>
                  <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">6 DEPARTMENTS</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Delegate tasks across all departments and monitor execution progress.</p>
              </Link>

              <Link href="/collaborations" className="block p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-colors">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Legal MoU Document References</h4>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">INSTITUTIONAL</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Access legal contracts, partner university MoUs, and fellowship agreements.</p>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-panel border-slate-800">
            <CardHeader>
              <CardTitle className="text-base text-white">Executive Approval Status</CardTitle>
              <CardDescription className="text-xs">Active oversight metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>MoU Signatures Verified</span>
                <span className="font-bold text-emerald-400">Synced to Drive</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Task Allocation Authority</span>
                <span className="font-bold text-amber-400">Global Read / Write / Remark</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Presidential Remarks</span>
                <span className="font-bold text-blue-400">Enabled on All Tasks</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 2. EVENTS & OPERATIONS DESK ── */}
      {deptKey === "EVENTS_OPERATIONS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-panel border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" /> Event Management Shortcuts & Responses
              </CardTitle>
              <CardDescription className="text-xs">
                Operational tools for event logistics, registrations, and feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/portal/events" className="block p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Event Registration Responses & CSV Export</h4>
                  <Badge variant="outline" className="text-[9px] text-blue-400 border-blue-500/30">LIVE DATA</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">View real-time event signups, participant capacity, and export rosters.</p>
              </Link>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Attendance Check-In & Feedback Links</h4>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">OPERATIONAL</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">QR check-in scanners and post-event survey collection links.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-slate-800">
            <CardHeader>
              <CardTitle className="text-base text-white">Operations Readiness</CardTitle>
              <CardDescription className="text-xs">Logistics & venue status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Auditorium & Venue Bookings</span>
                <span className="font-semibold text-blue-400">Confirmed</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Participant Check-In Systems</span>
                <span className="font-semibold text-emerald-400">QR Ready</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 3. TECHNICAL DESK ── */}
      {deptKey === "TECHNICAL" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-panel border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" /> Web & System Projects Tracker
              </CardTitle>
              <CardDescription className="text-xs">
                Digital infrastructure, technical issue board, and developer tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/portal/qr" className="block p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-colors">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Dynamic QR Code Registries</h4>
                  <Badge variant="outline" className="text-[9px] text-cyan-400 border-cyan-500/30">TOOL</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Generate high-res QR codes for event check-in and landing pages.</p>
              </Link>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Technical Issue & System Board</h4>
                  <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">INFRASTRUCTURE</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Monitor API latency, Workers runtime logs, and D1 database queries.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-slate-800">
            <CardHeader>
              <CardTitle className="text-base text-white">Digital Infrastructure Status</CardTitle>
              <CardDescription className="text-xs">Cloudflare & Edge stack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>D1 Database Connection</span>
                <span className="font-semibold text-emerald-400">Connected (Active)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Google Sheets Live Adapter</span>
                <span className="font-semibold text-emerald-400">Synced</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Turnstile Bot Protection</span>
                <span className="font-semibold text-emerald-400">Enforced</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 4. MARKETING DESK ── */}
      {deptKey === "MARKETING" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-panel border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Campaign Schedules & Registration Links
              </CardTitle>
              <CardDescription className="text-xs">
                Social media outreach and promotional tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/events" className="block p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Public Event Registration Links</h4>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">PROMOTIONAL</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Copy official links for Instagram, LinkedIn, and poster QR integration.</p>
              </Link>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Outreach & Campaign Schedule</h4>
                  <Badge variant="outline" className="text-[9px] text-blue-400 border-blue-500/30">SCHEDULE</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Coordinate post release timelines and college announcement broadcasts.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-slate-800">
            <CardHeader>
              <CardTitle className="text-base text-white">Outreach Guidelines</CardTitle>
              <CardDescription className="text-xs">Official GCC Branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Official Tagline</span>
                <span className="font-semibold text-emerald-400">Global Collaboration Cell BMSIT&M</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Official Hashtag</span>
                <span className="font-semibold text-emerald-400">#GCCBMSIT #GlobalExcellence</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 5. DESIGN DESK ── */}
      {deptKey === "DESIGN" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-panel border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" /> Creative Requests & Design Assets
              </CardTitle>
              <CardDescription className="text-xs">
                Poster/banner creative requests and design asset status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Poster & Banner Creative Requests</h4>
                  <Badge variant="outline" className="text-[9px] text-purple-400 border-purple-500/30">WORKFLOW</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Receive banner dimensions, text copy, and deadlines from Events & Operations.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Design & Vector Asset Storage</h4>
                  <Badge variant="outline" className="text-[9px] text-cyan-400 border-cyan-500/30">FIGMA / DRIVE</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Figma templates and vector assets stored in GCC Google Drive workspace.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-slate-800">
            <CardHeader>
              <CardTitle className="text-base text-white">Brand Palette & Standards</CardTitle>
              <CardDescription className="text-xs">Official Colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Primary Color</span>
                <span className="font-semibold text-blue-400">Electric Blue (#2563EB)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Secondary Accent</span>
                <span className="font-semibold text-purple-400">Deep Violet (#7C3AED)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 6. PHOTOGRAPHY DESK ── */}
      {deptKey === "PHOTOGRAPHY" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-panel border-rose-500/30">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-400" /> Event Coverage Calendar & Media Archive
              </CardTitle>
              <CardDescription className="text-xs">
                Photography slots, video archives, and media drive references.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Event Coverage Photography Calendar</h4>
                  <Badge variant="outline" className="text-[9px] text-rose-400 border-rose-500/30">SCHEDULE</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Assign photographers and videographers to upcoming GCC event dates.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Google Drive Media Archive</h4>
                  <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">DRIVE ARCHIVE</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Upload high-res RAW photos and edited recap videos into GCC Drive folders.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-slate-800">
            <CardHeader>
              <CardTitle className="text-base text-white">Coverage Protocol</CardTitle>
              <CardDescription className="text-xs">Event Photo Uploads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>RAW Archive Storage</span>
                <span className="font-semibold text-rose-400">Google Drive Service Account</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Turnaround Time</span>
                <span className="font-semibold text-slate-300">24 Hours Post-Event</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Resource Files Card */}
      <Card className="glass-panel border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Departmental Files & Google Drive Synchronization</CardTitle>
          <CardDescription className="text-xs">
            Private drive links are proxied securely through Cloudflare Workers. Access is recorded in Audit Logs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-12 text-center space-y-3">
            <UploadCloud className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-semibold text-white">Department Folder Ready</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Documents, manuscripts, and media assets will appear here once uploaded via the Google Drive client.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}