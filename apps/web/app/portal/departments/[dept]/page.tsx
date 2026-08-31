"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  Download,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGet, API_BASE } from "@/lib/api";

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
  RESEARCH_PUBLICATION: {
    name: "Research & Publication Desk",
    badge: "RESEARCH & KNOWLEDGE",
    description: "Academic knowledge hub for tracking research papers, joint international publications, manuscript submissions, and collaborative research documentation.",
    icon: FileText,
    color: "text-indigo-400 border-indigo-500/30",
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

      {/* ── 2. RESEARCH & PUBLICATION DESK ── */}
      {deptKey === "RESEARCH_PUBLICATION" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-panel border-indigo-500/30">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Research Papers & Publication Pipeline
              </CardTitle>
              <CardDescription className="text-xs">
                Track ongoing research, manuscript submissions, and joint international publications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-colors">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">Research Paper Tracker</h4>
                  <Badge variant="outline" className="text-[9px] text-indigo-400 border-indigo-500/30">PIPELINE</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Track submitted, under-review, and published research papers with co-author details.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-white">International Collaboration Docs</h4>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">JOINT RESEARCH</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Archive joint research documents, co-authored papers, and partner university submissions.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-slate-800">
            <CardHeader>
              <CardTitle className="text-base text-white">Publication Status Overview</CardTitle>
              <CardDescription className="text-xs">Research progress metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Document Repository</span>
                <span className="font-bold text-indigo-400">Google Drive Synced</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Journal Submissions</span>
                <span className="font-bold text-amber-400">Track via Pipeline</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span>Collaboration Network</span>
                <span className="font-bold text-emerald-400">Active MoU Partners</span>
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

      {/* Department Resource Files Card — Interactive */}
      <DepartmentFilesSection departmentId={deptKey} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive Google Drive File Manager Component                     */
/* ------------------------------------------------------------------ */
interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
}

function DepartmentFilesSection({ departmentId }: { departmentId: string }) {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<{ files: DriveFileItem[] }>(`/api/v1/files/list?departmentId=${departmentId}`);
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("departmentId", departmentId);

      const token = typeof window !== "undefined" ? sessionStorage.getItem("gcc_session_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Fetch CSRF token
      try {
        const csrfResp = await fetch(`${API_BASE}/api/v1/auth/csrf-token`, {
          method: "GET",
          credentials: "include",
          headers,
        });
        if (csrfResp.ok) {
          const csrfData = await csrfResp.json();
          if (csrfData?.data?.csrfToken) {
            headers["X-CSRF-Token"] = csrfData.data.csrfToken;
          }
        }
      } catch {}

      const resp = await fetch(`${API_BASE}/api/v1/files/upload`, {
        method: "POST",
        credentials: "include",
        headers,
        body: formData,
      });
      const result = await resp.json();
      if (!resp.ok || !result.success) {
        throw new Error(result.error?.message || "Upload failed");
      }
      setUploadMsg(`✓ ${file.name} uploaded successfully`);
      await fetchFiles();
    } catch (err: any) {
      setUploadMsg(`✗ ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (fileId: string, fileName: string) => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("gcc_session_token") : null;
    // Open a download link — the API proxies the Drive file securely
    const url = `${API_BASE}/api/v1/files/download/${fileId}` + (token ? `?token=${encodeURIComponent(token)}` : "");
    window.open(url, "_blank");
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleUpload(droppedFile);
    },
    [departmentId]
  );

  const formatSize = (bytes?: string) => {
    if (!bytes) return "—";
    const b = parseInt(bytes, 10);
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="glass-panel border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg text-white">Departmental Files & Google Drive</CardTitle>
          <CardDescription className="text-xs">
            Files are securely proxied through Cloudflare Workers. All access is audit-logged.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
            e.target.value = "";
          }}
        />
      </CardHeader>
      <CardContent>
        {uploadMsg && (
          <div
            className={`mb-4 p-2.5 rounded-lg text-xs font-medium ${
              uploadMsg.startsWith("✓")
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {uploadMsg}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Loading department files…</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-xs text-red-400">{error}</p>
            <Button variant="outline" size="sm" className="text-xs" onClick={fetchFiles}>
              Retry
            </Button>
          </div>
        ) : files.length === 0 ? (
          <div
            className={`p-12 text-center space-y-3 border-2 border-dashed rounded-xl transition-colors ${
              dragOver ? "border-blue-500 bg-blue-500/5" : "border-slate-800"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <UploadCloud className={`w-10 h-10 mx-auto ${dragOver ? "text-blue-400" : "text-slate-500"}`} />
            <h4 className="text-sm font-semibold text-white">No Files Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Drag & drop files here, or click <strong>Upload File</strong> above to add documents,
              images, or media assets to this department&apos;s folder.
            </p>
          </div>
        ) : (
          <div
            className={`space-y-1 ${
              dragOver ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 rounded-lg" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              <span className="col-span-6">Name</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-2">Size</span>
              <span className="col-span-2 text-right">Action</span>
            </div>

            {files.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="col-span-6 flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs text-white truncate" title={file.name}>
                    {file.name}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 truncate">
                    {file.mimeType?.split("/").pop()?.toUpperCase() || "FILE"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400">{formatSize(file.size)}</span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px] gap-1 text-blue-400 hover:text-blue-300"
                    onClick={() => handleDownload(file.id, file.name)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}