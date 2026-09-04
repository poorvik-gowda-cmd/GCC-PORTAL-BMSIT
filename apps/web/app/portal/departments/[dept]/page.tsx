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
  Plus,
  Award,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, API_BASE } from "@/lib/api";

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
    description: "Central command desk for GCC Presidents and Executive Members to oversee global task allocation, publish partner MoUs, and post opportunity announcements.",
    icon: ShieldCheck,
    color: "text-amber-400 border-amber-500/30",
  },
  RESEARCH_PUBLICATION: {
    name: "Research & Publication Desk",
    badge: "RESEARCH & KNOWLEDGE",
    description: "Academic knowledge hub for managing collaborative research documentation, publishing institutional MoUs, and posting fellowship opportunities.",
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

  // Publishing form state for MoUs and Opportunities
  const [showMouModal, setShowMouModal] = useState(false);
  const [showOppModal, setShowOppModal] = useState(false);
  const [mouForm, setMouForm] = useState({ title: "", institution: "", description: "", mouFileUrl: "" });
  const [oppForm, setOppForm] = useState({ title: "", category: "FELLOWSHIP", description: "", deadline: "", applyUrl: "", attachmentUrl: "" });
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);

  // Live items state for MoUs and Opportunities
  const [liveMous, setLiveMous] = useState<any[]>([]);
  const [liveOpps, setLiveOpps] = useState<any[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLiveItems = useCallback(async () => {
    if (deptKey !== "EXECUTIVE_COUNCIL" && deptKey !== "RESEARCH_PUBLICATION") return;
    setLoadingLive(true);
    try {
      const [mouRes, oppRes] = await Promise.all([
        apiGet<{ collaborations: any[] }>("/api/v1/collaborations"),
        apiGet<{ opportunities: any[] }>("/api/v1/opportunities"),
      ]);
      setLiveMous(mouRes.collaborations || []);
      setLiveOpps(oppRes.opportunities || []);
    } catch (err) {
      console.error("Failed to fetch live items:", err);
    } finally {
      setLoadingLive(false);
    }
  }, [deptKey]);

  useEffect(() => {
    fetchLiveItems();
  }, [fetchLiveItems]);

  const meta = DEPT_META[deptKey] || {
    name: `${deptKey.replace("_", " ")} Desk`,
    badge: "DEPARTMENT DESK",
    description: "Authorized departmental resources and task tracking.",
    icon: FolderGit2,
    color: "text-blue-400 border-slate-800",
  };

  const Icon = meta.icon;

  const handlePublishMou = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setPublishMsg(null);
    try {
      await apiPost("/api/v1/collaborations", mouForm);
      setPublishMsg("✓ Partner MoU published successfully to main website!");
      setMouForm({ title: "", institution: "", description: "", mouFileUrl: "" });
      setShowMouModal(false);
      await fetchLiveItems();
    } catch (err: any) {
      setPublishMsg(`✗ ${err.message || "Failed to publish MoU"}`);
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setPublishMsg(null);
    try {
      await apiPost("/api/v1/opportunities", oppForm);
      setPublishMsg("✓ Opportunity announcement published successfully to main website!");
      setOppForm({ title: "", category: "FELLOWSHIP", description: "", deadline: "", applyUrl: "", attachmentUrl: "" });
      setShowOppModal(false);
      await fetchLiveItems();
    } catch (err: any) {
      setPublishMsg(`✗ ${err.message || "Failed to publish opportunity"}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteMou = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove MoU: "${title}"?`)) return;
    setDeletingId(id);
    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("gcc_session_token") : null;
      const res = await fetch(`${API_BASE}/api/v1/collaborations/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to delete MoU");
      setPublishMsg(`✓ Removed MoU "${title}"`);
      await fetchLiveItems();
    } catch (err: any) {
      setPublishMsg(`✗ ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteOpp = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove announcement: "${title}"?`)) return;
    setDeletingId(id);
    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("gcc_session_token") : null;
      const res = await fetch(`${API_BASE}/api/v1/opportunities/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Failed to delete opportunity");
      setPublishMsg(`✓ Removed opportunity "${title}"`);
      await fetchLiveItems();
    } catch (err: any) {
      setPublishMsg(`✗ ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

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

      {publishMsg && (
        <div
          className={`p-3 rounded-lg text-xs font-medium ${
            publishMsg.startsWith("✓")
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {publishMsg}
        </div>
      )}

      {/* ── 1. EXECUTIVE COUNCIL DESK & RESEARCH DESK PUBLISHING ── */}
      {(deptKey === "EXECUTIVE_COUNCIL" || deptKey === "RESEARCH_PUBLICATION") && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-panel border-emerald-500/30 hover:border-emerald-500/60 transition-colors">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" /> Publish Partner MoU
                  </span>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">WEBSITE LIVE</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mb-4">
                  Publish institutional MoUs, agreements, and document photos directly to the public Collaborations page.
                </CardDescription>
                <Button
                  size="sm"
                  className="w-full text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={() => setShowMouModal(!showMouModal)}
                >
                  <Plus className="w-3.5 h-3.5" /> {showMouModal ? "Cancel Form" : "Publish New Partner MoU"}
                </Button>
              </CardHeader>
            </Card>

            <Card className="glass-panel border-purple-500/30 hover:border-purple-500/60 transition-colors">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" /> Post Opportunity Announcement
                  </span>
                  <Badge variant="outline" className="text-[9px] text-purple-400 border-purple-500/30">WEBSITE LIVE</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mb-4">
                  Post international fellowships, research grants, and exchange announcements to the Opportunities page.
                </CardDescription>
                <Button
                  size="sm"
                  className="w-full text-xs gap-1.5 bg-purple-600 hover:bg-purple-500 text-white"
                  onClick={() => setShowOppModal(!showOppModal)}
                >
                  <Plus className="w-3.5 h-3.5" /> {showOppModal ? "Cancel Form" : "Post Opportunity"}
                </Button>
              </CardHeader>
            </Card>

            <Link href="/portal/tasks" className="block">
              <Card className="glass-panel border-amber-500/30 hover:border-amber-500/60 transition-colors h-full">
                <CardHeader>
                  <CardTitle className="text-base text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" /> Global Task Allocation
                    </span>
                    <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30">TASKS</Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Delegate tasks across all departments, set deadlines, and monitor execution progress.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Inline MoU Form */}
          {showMouModal && (
            <Card className="glass-panel border-emerald-500/40 bg-slate-950/80 p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Publish New Partner MoU to Collaborations Page
              </h3>
              <form onSubmit={handlePublishMou} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">MoU Title</label>
                    <Input
                      required
                      placeholder="e.g. Global Student Exchange & Research Mobility MoU"
                      value={mouForm.title}
                      onChange={(e) => setMouForm({ ...mouForm, title: e.target.value })}
                      className="bg-slate-900 border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Partner Institution / University</label>
                    <Input
                      required
                      placeholder="e.g. Erasmus+ Consortium & Partner European Universities"
                      value={mouForm.institution}
                      onChange={(e) => setMouForm({ ...mouForm, institution: e.target.value })}
                      className="bg-slate-900 border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Description & Scope of Agreement</label>
                  <Textarea
                    required
                    rows={3}
                    placeholder="Describe the scope of student exchange, joint research grants, or academic mobility..."
                    value={mouForm.description}
                    onChange={(e) => setMouForm({ ...mouForm, description: e.target.value })}
                    className="bg-slate-900 border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">MoU PDF / Photo Document URL (Optional Drive Link)</label>
                  <Input
                    placeholder="https://drive.google.com/..."
                    value={mouForm.mouFileUrl}
                    onChange={(e) => setMouForm({ ...mouForm, mouFileUrl: e.target.value })}
                    className="bg-slate-900 border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setShowMouModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={publishing} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                    {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Publish MoU to Website"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Inline Opportunity Form */}
          {showOppModal && (
            <Card className="glass-panel border-purple-500/40 bg-slate-950/80 p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" /> Post New Opportunity Announcement
              </h3>
              <form onSubmit={handlePublishOpp} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Opportunity Title</label>
                    <Input
                      required
                      placeholder="e.g. Erasmus+ European Academic Mobility Fellowship 2026"
                      value={oppForm.title}
                      onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
                      className="bg-slate-900 border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Category</label>
                    <select
                      className="w-full h-9 rounded-md bg-slate-900 border border-slate-800 text-xs text-white px-3"
                      value={oppForm.category}
                      onChange={(e) => setOppForm({ ...oppForm, category: e.target.value })}
                    >
                      <option value="FELLOWSHIP">Fellowship Grant</option>
                      <option value="RESEARCH_GRANT">Research Grant</option>
                      <option value="EXCHANGE_PROGRAM">International Exchange</option>
                      <option value="INTERNSHIP">Global Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Application Deadline (Optional)</label>
                    <Input
                      placeholder="e.g. Dec 31, 2026"
                      value={oppForm.deadline}
                      onChange={(e) => setOppForm({ ...oppForm, deadline: e.target.value })}
                      className="bg-slate-900 border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Direct Application URL</label>
                    <Input
                      placeholder="https://gcc.bmsit.in/apply"
                      value={oppForm.applyUrl}
                      onChange={(e) => setOppForm({ ...oppForm, applyUrl: e.target.value })}
                      className="bg-slate-900 border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Description & Eligibility Criteria</label>
                  <Textarea
                    required
                    rows={3}
                    placeholder="Details about grant funding, candidate eligibility, and application procedure..."
                    value={oppForm.description}
                    onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                    className="bg-slate-900 border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Announcement Photo / PDF Attachment URL (Drive Link)</label>
                  <Input
                    placeholder="https://drive.google.com/..."
                    value={oppForm.attachmentUrl}
                    onChange={(e) => setOppForm({ ...oppForm, attachmentUrl: e.target.value })}
                    className="bg-slate-900 border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => setShowOppModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={publishing} className="text-xs bg-purple-600 hover:bg-purple-500 text-white">
                    {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Post Opportunity to Website"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Live Published MoUs & Opportunities Management Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* MoUs Management */}
            <Card className="glass-panel border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" /> Active MoUs on Collaborations Page
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-400">
                    Live partnerships visible to the public. You can remove them at any time.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                  {liveMous.length} LIVE
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingLive ? (
                  <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> Loading MoUs…
                  </div>
                ) : liveMous.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center border border-dashed border-slate-800 rounded-lg">
                    No active MoUs published yet. Click &quot;Publish New Partner MoU&quot; above to add one.
                  </p>
                ) : (
                  liveMous.map((mou) => (
                    <div
                      key={mou.id}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">{mou.title}</span>
                        </div>
                        <p className="text-[11px] text-emerald-400/80 truncate">🏛 {mou.institution}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === mou.id}
                        onClick={() => handleDeleteMou(mou.id, mou.title)}
                        className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                      >
                        {deletingId === mou.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        <span className="ml-1">Remove</span>
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Opportunities Management */}
            <Card className="glass-panel border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" /> Live Opportunity Announcements
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-400">
                    Live fellowships &amp; grants visible to students. You can remove them at any time.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/30">
                  {liveOpps.length} LIVE
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingLive ? (
                  <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> Loading opportunities…
                  </div>
                ) : liveOpps.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center border border-dashed border-slate-800 rounded-lg">
                    No announcements posted yet. Click &quot;Post Opportunity Announcement&quot; above to add one.
                  </p>
                ) : (
                  liveOpps.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">{opp.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="text-purple-400 font-mono text-[10px]">{opp.category}</span>
                          {opp.deadline && <span>• 📅 {opp.deadline}</span>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === opp.id}
                        onClick={() => handleDeleteOpp(opp.id, opp.title)}
                        className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                      >
                        {deletingId === opp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        <span className="ml-1">Remove</span>
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
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
  const [folderId, setFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<{ files: DriveFileItem[]; folderId?: string }>(`/api/v1/files/list?departmentId=${departmentId}`);
      setFiles(data.files || []);
      if (data.folderId) setFolderId(data.folderId);
    } catch (err: any) {
      setError(err.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const driveFolderUrl = folderId
    ? `https://drive.google.com/drive/folders/${folderId}`
    : DRIVE_ROOT_URL;

  const handleDownload = (fileId: string) => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("gcc_session_token") : null;
    const url = `${API_BASE}/api/v1/files/download/${fileId}` + (token ? `?token=${encodeURIComponent(token)}` : "");
    window.open(url, "_blank");
  };

  const formatSize = (bytes?: string) => {
    if (!bytes) return "—";
    const b = parseInt(bytes, 10);
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="glass-panel border-slate-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-blue-400" /> Departmental Files & Google Drive
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-1">
            Files are synced with Google Drive and securely proxied through Cloudflare Workers.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 border-slate-800 text-slate-300 hover:text-white"
            onClick={fetchFiles}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Files
          </Button>
          <a
            href={driveFolderUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Drop / Upload in Drive ↗
          </a>
        </div>
      </CardHeader>
      <CardContent>
        {/* Direct Browser Drop Tip Banner */}
        <div className="mb-5 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-3">
          <UploadCloud className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              Direct Browser Drop — 100% Free & Unlimited Quota
            </div>
            <p className="text-slate-400 leading-relaxed">
              Click <strong className="text-blue-300">Drop / Upload in Drive ↗</strong> to open this department&apos;s folder in Google Drive. Drag & drop your photos, PDFs, or files directly in your browser using your free personal Google quota. Once dropped, click <strong className="text-blue-300">Refresh Files</strong> to view and download them right here!
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Loading department files from Google Drive…</p>
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
          <div className="p-10 text-center space-y-3 border-2 border-dashed rounded-xl border-slate-800 bg-slate-950/30">
            <UploadCloud className="w-10 h-10 mx-auto text-blue-400/60" />
            <h4 className="text-sm font-semibold text-white">No Files Uploaded Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Drop event photos, posters, research documents, or department archives directly into Google Drive.
            </p>
            <div className="pt-2">
              <a
                href={driveFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Google Drive & Drop Files ↗
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
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