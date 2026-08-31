"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Loader2,
  ServerCrash,
  UserCheck,
  FolderGit2,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGet, ApiError } from "@/lib/api";

interface UserProfile {
  id: string;
  fullName: string;
  roles: string[];
  departments: string[];
  permissions: string[];
}

interface Task {
  taskId: string;
  title: string;
  department: string;
  deadline: string;
  status: string;
  priority: string;
}

interface GccEvent {
  eventId: string;
  title: string;
  registrationStatus: string;
  eventStatus: string;
}

const PRIORITY_VARIANT: Record<string, "destructive" | "secondary" | "warning"> = {
  CRITICAL: "destructive",
  HIGH: "warning",
  MEDIUM: "secondary",
  LOW: "secondary",
};

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: "text-amber-400",
  OVERDUE: "text-rose-400 font-bold",
  COMPLETED: "text-emerald-400",
  NOT_STARTED: "text-slate-400",
};

export default function PortalDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<GccEvent[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ user: UserProfile }>("/api/v1/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    apiGet<{ tasks: Task[] }>("/api/v1/tasks")
      .then((d) => setTasks(d.tasks.slice(0, 5)))
      .catch((err) => {
        if (err instanceof ApiError && err.statusCode === 403) {
          setTaskError("No task access");
        } else {
          setTaskError("Could not load tasks");
        }
      })
      .finally(() => setLoadingTasks(false));
  }, []);

  useEffect(() => {
    apiGet<{ events: GccEvent[] }>("/api/v1/events/all")
      .then((d) => setEvents(d.events))
      .catch(() =>
        apiGet<{ events: GccEvent[] }>("/api/v1/events")
          .then((d) => setEvents(d.events))
          .catch(() => setEventError("Could not load events"))
      )
      .finally(() => setLoadingEvents(false));
  }, []);

  const overdueTasks = tasks.filter((t) => t.status === "OVERDUE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const publishedEvents = events.filter((e) => e.eventStatus === "PUBLISHED").length;

  const isSuperAdmin = user?.roles.includes("SYSTEM_SUPER_ADMIN");
  const isExecCouncil = user?.roles.includes("EXECUTIVE_COUNCIL");

  const stats = [
    { label: "Assigned Tasks", value: tasks.length.toString(), icon: CheckSquare, color: "text-blue-400" },
    { label: "In Progress", value: inProgressTasks.toString(), icon: Clock, color: "text-amber-400" },
    { label: "Overdue", value: overdueTasks.toString(), icon: AlertTriangle, color: overdueTasks > 0 ? "text-rose-400 font-bold" : "text-slate-400" },
    { label: "Completed", value: completedTasks.toString(), icon: CheckCircle2, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl glass-panel border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default">{user?.roles?.[0] || "MEMBER"}</Badge>
            <Badge variant="outline">{user?.departments?.[0] || "GENERAL"}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.fullName || "GCC Member"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isSuperAdmin
              ? "System Super Admin Command Hub — Full organization management, user onboarding, and security audit control."
              : isExecCouncil
              ? "Executive Council Leadership Desk — Overseeing all 6 departments, global tasks, and institutional MoUs."
              : `Department Dashboard — Managing tasks and activities for ${user?.departments?.[0] || "your department"}.`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isSuperAdmin && (
            <Link href="/portal/system-admin">
              <Button variant="gradient" size="sm" className="gap-1.5 text-xs">
                <UserCheck className="w-4 h-4" /> System Admin Panel
              </Button>
            </Link>
          )}
          {isExecCouncil && !isSuperAdmin && (
            <Link href="/portal/departments">
              <Button variant="gradient" size="sm" className="gap-1.5 text-xs">
                <FolderGit2 className="w-4 h-4" /> Oversee Departments
              </Button>
            </Link>
          )}
          <Link href="/portal/tasks">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <CheckSquare className="w-4 h-4" /> View Task Tracker
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <Card key={idx} className="glass-panel border-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                {loadingTasks ? (
                  <Loader2 className="w-5 h-5 text-slate-600 animate-spin mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold text-white mt-1">{s.value}</h3>
                )}
              </div>
              <s.icon className={`w-8 h-8 ${s.color} opacity-80`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tasks Card */}
        <Card className="glass-panel border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-white">Active Deliverables</CardTitle>
              <CardDescription className="text-xs">
                {isExecCouncil || isSuperAdmin ? "Global tasks across all departments" : "Your priority deliverables"}
              </CardDescription>
            </div>
            <Link href="/portal/tasks">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                All Tasks <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingTasks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            ) : taskError ? (
              <div className="flex items-center gap-2 py-6 text-xs text-slate-400">
                <ServerCrash className="w-4 h-4" /> {taskError}
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active tasks assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((t) => (
                  <div
                    key={t.taskId}
                    className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      t.status === "OVERDUE"
                        ? "bg-rose-950/30 border-rose-500/50"
                        : "bg-slate-950/60 border-slate-800/80"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-blue-400">{t.taskId}</span>
                        <Badge variant={PRIORITY_VARIANT[t.priority] ?? "secondary"}>{t.priority}</Badge>
                      </div>
                      <h4 className="font-semibold text-white text-sm">{t.title}</h4>
                      <p className="text-[11px] text-slate-400">Dept: {t.department}</p>
                    </div>
                    <span className={`text-xs font-semibold ${STATUS_COLORS[t.status] ?? "text-slate-400"}`}>
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events Overview Card */}
        <Card className="glass-panel border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-white">Events Overview</CardTitle>
              <CardDescription className="text-xs">
                {publishedEvents} published · {events.length} total
              </CardDescription>
            </div>
            <Link href="/portal/events">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingEvents ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              </div>
            ) : eventError ? (
              <div className="flex items-center gap-2 py-6 text-xs text-slate-400">
                <ServerCrash className="w-4 h-4" /> {eventError}
              </div>
            ) : events.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No events found.</p>
            ) : (
              <div className="space-y-2">
                {events.slice(0, 5).map((evt) => (
                  <Link key={evt.eventId} href={`/portal/events/${evt.eventId}`} className="block">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 hover:border-blue-500/40 transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-white">{evt.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{evt.eventId}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Badge variant={evt.eventStatus === "PUBLISHED" ? "success" : "secondary"} className="text-[9px]">
                          {evt.eventStatus}
                        </Badge>
                        <Badge variant={evt.registrationStatus === "OPEN" ? "success" : evt.registrationStatus === "FULL" ? "destructive" : "secondary"} className="text-[9px]">
                          Reg: {evt.registrationStatus}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}