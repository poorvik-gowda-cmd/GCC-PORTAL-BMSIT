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
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGet, API_BASE } from "@/lib/api";

const DRIVE_ROOT_URL = "https://drive.google.com/drive/u/0/folders/1LafIbcge-2_pTd2KROcZ_X6wn9c_j9UT";

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
    description: "Central command desk for GCC Presidents and Executive Members to oversee global task allocation and legal MoUs.",
    icon: ShieldCheck,
    color: "text-amber-400 border-amber-500/30",
  },
  RESEARCH_PUBLICATION: {
    name: "Research & Publication Desk",
    badge: "RESEARCH & KNOWLEDGE",
    description: "Academic knowledge hub for managing collaborative research documentation, papers, and Google Drive archives.",
    icon: FileText,
    color: "text-indigo-400 border-indigo-500/30",
  },
  EVENTS_OPERATIONS: {
    name: "Events & Operations Desk",
    badge: "EVENT LOGISTICS & OPS",
    description: "Operational management hub for candidate registration rosters, attendance tracking, and feedback tools.",
    icon: Calendar,
    color: "text-blue-400 border-blue-500/30",
  },
  TECHNICAL: {
    name: "Technical Desk",
    badge: "DIGITAL & SYSTEMS",
    description: "Tech operations desk for event creation, web management, and dynamic QR code registries.",
    icon: Globe,
    color: "text-cyan-400 border-cyan-500/30",
  },
  MARKETING: {
    name: "Marketing Desk",
    badge: "PROMOTIONS & OUTREACH",
    description: "Campaign operations desk for event poster QR registries, public schedules, and outreach materials.",
    icon: Users,
    color: "text-emerald-400 border-emerald-500/30",
  },
  DESIGN: {
    name: "Design Desk",
    badge: "CREATIVE & BRANDING",
    description: "Visual design workspace for managing GCC design assets and Google Drive creative archives.",
    icon: Palette,
    color: "text-purple-400 border-purple-500/30",
  },
  PHOTOGRAPHY: {
    name: "Photography Desk",
    badge: "MEDIA ARCHIVE & COVERAGE",
    description: "Media coverage desk for event coverage scheduling, photo galleries, and video drive archives.",
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
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="default" className="mb-2">{meta.badge}</Badge>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Icon className={`w-6 h-6 ${meta.color.split(" ")[0]}`} /> {meta.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{meta.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={DRIVE_ROOT_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open {meta.name.replace(" Desk", "")} Drive
          </a>
          <Link href="/portal/tasks">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-slate-800 text-slate-200">
              <CheckSquare className="w-3.5 h-3.5" /> Department Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 1. EXECUTIVE COUNCIL DESK ── */}
      {deptKey === "EXECUTIVE_COUNCIL" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/portal/tasks" className="block">
            <Card className="glass-panel border-amber-500/30 hover:border-amber-500/60 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" /> Global Task Summary & Allocation
                  </span>
                  <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">6 DEPARTMENTS</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Delegate tasks across all departments, set deadlines, and monitor execution progress across the council.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/collaborations" className="block">
            <Card className="glass-panel border-emerald-500/30 hover:border-emerald-500/60 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" /> Legal MoU Document References
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">INSTITUTIONAL</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Access legal contracts, partner university MoUs, fellowship agreements, and official institutional documentation.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      )}

      {/* ── 2. TECHNICAL DESK ── */}
      {deptKey === "TECHNICAL" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/portal/events" className="block">
            <Card className="glass-panel border-cyan-500/30 hover:border-cyan-500/60 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" /> Event Registration & Creation Desk
                  </span>
                  <Badge variant="outline" className="text-[9px] text-cyan-400 border-cyan-500/30">FULL ACCESS</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Create new events, toggle draft/published status, open or close public registrations, and manage capacity.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/portal/qr" className="block">
            <Card className="glass-panel border-blue-500/30 hover:border-blue-500/60 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-blue-400" /> Dynamic QR Code Registries
                  </span>
                  <Badge variant="outline" className="text-[9px] text-blue-400 border-blue-500/30">TOOL</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Generate high-resolution QR codes for event check-in desks, poster promotion, and landing pages.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      )}

      {/* ── 3. EVENTS & OPERATIONS DESK ── */}
      {deptKey === "EVENTS_OPERATIONS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/portal/registrations" className="block">
            <Card className="glass-panel border-blue-500/30 hover:border-blue-500/60 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" /> Event Candidate Registrations Hub
                  </span>
                  <Badge variant="outline" className="text-[9px] text-blue-400 border-blue-500/30">ROSTER</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  View live candidate rosters for all events, monitor registration limits, and export participant CSV data.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <a href="https://forms.google.com" target="_blank" rel="noreferrer" className="block">
            <Card className="glass-panel border-emerald-500/30 hover:border-emerald-500/60 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" /> Attendance Check-in & Feedback Tools
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">FORMS TOOL</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Launch Google Forms specifically designed for event attendance check-ins and candidate feedback collection.
                </CardDescription>
              </CardHeader>
            </Card>
          </a>
        </div>
      )}

      {/* ── 4. MARKETING DESK ── */}
      {deptKey === "MARKETING" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/portal/qr" className="block">
            <Card className="glass-panel border-emerald-500/30 hover:border-emerald-500/60 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-400" /> Event QR Codes
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">POSTER QR</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Download high-res QR code PNGs for marketing posters and social media outreach.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/events" className="block">
            <Card className="glass-panel border-cyan-500/30 hover:border-cyan-500/60 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" /> Public Event Schedule
                  </span>
                  <Badge variant="outline" className="text-[9px] text-cyan-400 border-cyan-500/30">SCHEDULE</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  View published event schedules and copy direct registration URLs for promotional campaigns.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/portal/events" className="block">
            <Card className="glass-panel border-blue-500/30 hover:border-blue-500/60 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-blue-400 text-xs" /> Event Desk (Read-Only)
                  </span>
                  <Badge variant="outline" className="text-[9px] text-blue-400 border-blue-500/30">VIEW ONLY</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Inspect internal schedules and upcoming event timelines.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      )}

      {/* ── 5. PHOTOGRAPHY DESK ── */}
      {deptKey === "PHOTOGRAPHY" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/portal/events" className="block">
            <Card className="glass-panel border-rose-500/30 hover:border-rose-500/60 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-rose-400" /> Event Coverage Photography Calendar
                  </span>
                  <Badge variant="outline" className="text-[9px] text-rose-400 border-rose-500/30">SCHEDULE</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Check upcoming event dates to assign photographers and videographers for media coverage.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <a href={DRIVE_ROOT_URL} target="_blank" rel="noreferrer" className="block">
            <Card className="glass-panel border-amber-500/30 hover:border-amber-500/60 transition-colors h-full">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-amber-400" /> Drive Media Archive Folder
                  </span>
                  <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">RAW & RECAPS</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Open the official Photography Google Drive folder to upload high-res RAW photos and recap videos.
                </CardDescription>
              </CardHeader>
            </Card>
          </a>
        </div>
      )}

      {/* Department Resource Files Card — Interactive File Manager */}
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

  const handleDownload = (fileId: string) => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("gcc_session_token") : null;
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
          <CardDescription className="text-xs text-slate-400">
            Files are securely proxied through Cloudflare Workers. All access is audit-logged.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 border-slate-800 text-slate-200"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 text-blue-400" />}
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
            <Button variant="outline" size="sm" className="text-xs border-slate-800" onClick={fetchFiles}>
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
            <h4 className="text-sm font-semibold text-white">No Files Uploaded Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Drag & drop files here, or click <strong>Upload File</strong> above to add documents to this department&apos;s Google Drive branch.
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
                <div className="col-span-2 text-[11px] text-slate-400 truncate">
                  {file.mimeType.split("/").pop() || "file"}
                </div>
                <div className="col-span-2 text-[11px] text-slate-400">
                  {formatSize(file.size)}
                </div>
                <div className="col-span-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    onClick={() => handleDownload(file.id)}
                  >
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