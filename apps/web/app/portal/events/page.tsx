"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Calendar, Plus, Eye, Loader2, AlertCircle, CheckCircle2, X, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, ApiError } from "@/lib/api";

interface GccEvent {
  eventId: string;
  title: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
  eventStatus: string;
  registrationStatus: string;
  capacity: number | null;
}

interface CreateEventPayload {
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
  capacity?: number;
}

interface UserProfile {
  id: string;
  roles: string[];
  departments: string[];
  permissions: string[];
}

export default function PortalEventsPage() {
  const [events, setEvents] = useState<GccEvent[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [togglingRegId, setTogglingRegId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const canCreateEvents =
    user?.permissions?.includes("EVENT_CREATE") ||
    user?.roles?.includes("EXECUTIVE_COUNCIL") ||
    user?.roles?.includes("SYSTEM_SUPER_ADMIN") ||
    user?.departments?.includes("TECHNICAL");

  const canManageEvents =
    user?.permissions?.includes("EVENT_EDIT") ||
    user?.permissions?.includes("EVENT_PUBLISH") ||
    user?.roles?.includes("EXECUTIVE_COUNCIL") ||
    user?.roles?.includes("SYSTEM_SUPER_ADMIN") ||
    user?.departments?.includes("TECHNICAL");

  const [form, setForm] = useState<CreateEventPayload>({
    title: "",
    shortDescription: "",
    fullDescription: "",
    category: "SUMMIT",
    venue: "",
    startDate: "",
    endDate: "",
    capacity: undefined,
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ events: GccEvent[] }>("/api/v1/events/all");
      setEvents(data.events);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        setForbidden(true);
        setError("You do not have permission to manage events.");
      } else if (err instanceof ApiError && err.statusCode === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load events. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [userData, eventsData] = await Promise.all([
          apiGet<{ user: UserProfile }>("/api/v1/auth/me").catch(() => null),
          apiGet<{ events: GccEvent[] }>("/api/v1/events/all"),
        ]);

        if (active) {
          if (userData?.user) setUser(userData.user);
          setEvents(eventsData.events);
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.statusCode === 403) {
            setForbidden(true);
            setError("You do not have permission to access events.");
          } else if (err instanceof ApiError && err.statusCode === 401) {
            setError("Session expired. Please log in again.");
          } else {
            setError("Failed to load events. Please try again.");
          }
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

  const handlePublishToggle = async (evt: GccEvent) => {
    const publish = evt.eventStatus !== "PUBLISHED";
    setPublishingId(evt.eventId);
    try {
      await apiPost(`/api/v1/events/${evt.eventId}/publish`, { publish });
      showToast("success", `Event ${publish ? "published" : "set to draft"} successfully.`);
      await loadEvents();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Action failed. Please try again.";
      showToast("error", msg);
    } finally {
      setPublishingId(null);
    }
  };

  const handleRegToggle = async (evt: GccEvent) => {
    const newStatus = evt.registrationStatus === "OPEN" ? "CLOSED" : "OPEN";
    setTogglingRegId(evt.eventId);
    try {
      await apiPost(`/api/v1/events/${evt.eventId}/registration-status`, { status: newStatus });
      showToast("success", `Registration ${newStatus === "OPEN" ? "opened" : "closed"} for event.`);
      await loadEvents();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to change registration status.";
      showToast("error", msg);
    } finally {
      setTogglingRegId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        ...form,
        startDate: form.startDate.includes('T') ? form.startDate : new Date(`${form.startDate}T00:00:00`).toISOString(),
        endDate: form.endDate.includes('T') ? form.endDate : new Date(`${form.endDate}T23:59:59`).toISOString(),
        capacity: form.capacity && form.capacity > 0 ? form.capacity : undefined,
      };
      const data = await apiPost<{ eventId: string }>("/api/v1/events", payload);
      showToast("success", `Event created: ${data.eventId}`);
      setShowCreate(false);
      setForm({ title: "", shortDescription: "", fullDescription: "", category: "SUMMIT", venue: "", startDate: "", endDate: "", capacity: undefined });
      await loadEvents();
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Failed to create event.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-xs font-medium ${
          toast.type === "success" ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300" : "bg-red-500/20 border border-red-500/40 text-red-300"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" /> Event Management Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, configure, and publish official GCC events.
          </p>
        </div>
        {canCreateEvents && (
          <Button variant="gradient" size="sm" className="gap-1.5 text-xs" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> Create New Event
          </Button>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg glass-panel border-blue-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white text-lg">Create New Event</CardTitle>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-3">
                {createError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {createError}
                  </div>
                )}
                {[
                  { label: "Title *", key: "title", placeholder: "e.g. GCC Global Summit 2026", required: true },
                  { label: "Short Description *", key: "shortDescription", placeholder: "One-line summary", required: true },
                  { label: "Venue *", key: "venue", placeholder: "e.g. BMSIT&M Main Auditorium", required: true },
                ].map(({ label, key, placeholder, required }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">{label}</label>
                    <Input
                      required={required}
                      placeholder={placeholder}
                      value={(form as unknown as Record<string, string | undefined>)[key] ?? ""}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Full Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Detailed event description..."
                    className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
                    value={form.fullDescription}
                    onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Category *</label>
                    <select
                      className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {["SUMMIT", "WORKSHOP", "ORIENTATION", "SEMINAR", "CULTURAL", "COMPETITION", "OTHER"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Capacity (blank = unlimited)</label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 200"
                      value={form.capacity ?? ""}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Start Date *</label>
                    <Input type="date" required value={form.startDate ? form.startDate.split('T')[0] : ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">End Date *</label>
                    <Input type="date" required value={form.endDate ? form.endDate.split('T')[0] : ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="text-xs text-white" />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" size="sm" className="flex-1 text-xs" disabled={creating}>
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Event (Draft)"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-3 text-center">
          {forbidden ? <Lock className="w-8 h-8 text-amber-400" /> : <AlertCircle className="w-8 h-8 text-red-400" />}
          <p className="text-sm font-semibold text-white">{forbidden ? "Access Restricted" : "Failed to Load Events"}</p>
          <p className="text-xs text-slate-400">{error}</p>
          {!forbidden && (
            <Button variant="outline" size="sm" className="text-xs mt-1" onClick={loadEvents}>
              Retry
            </Button>
          )}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          No events yet. Click <strong className="text-white">Create New Event</strong> to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((evt) => (
            <Card key={evt.eventId} className="glass-panel border-slate-800 flex flex-col justify-between">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <Badge variant={evt.eventStatus === "PUBLISHED" ? "success" : "secondary"}>
                    {evt.eventStatus}
                  </Badge>
                  <span className="text-xs font-mono text-blue-400">{evt.eventId}</span>
                </div>
                <CardTitle className="text-base text-white leading-snug">{evt.title}</CardTitle>
                <CardDescription className="text-xs text-slate-400 space-y-0.5">
                  <div>📍 {evt.venue}</div>
                  <div>🗓 {new Date(evt.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  {evt.capacity && <div>👥 Capacity: {evt.capacity}</div>}
                  <div className="pt-1">
                    Registration:{" "}
                    <Badge variant={evt.registrationStatus === "OPEN" ? "success" : evt.registrationStatus === "FULL" ? "destructive" : "secondary"} className="text-[9px]">
                      {evt.registrationStatus}
                    </Badge>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-2">
                {canManageEvents && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={evt.eventStatus === "PUBLISHED" ? "outline" : "gradient"}
                      size="sm"
                      onClick={() => handlePublishToggle(evt)}
                      disabled={publishingId === evt.eventId}
                      className="w-full text-xs"
                    >
                      {publishingId === evt.eventId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : evt.eventStatus === "PUBLISHED" ? (
                        "Set Draft"
                      ) : (
                        "Publish"
                      )}
                    </Button>
                    <Button
                      variant={evt.registrationStatus === "OPEN" ? "destructive" : "gradient"}
                      size="sm"
                      onClick={() => handleRegToggle(evt)}
                      disabled={togglingRegId === evt.eventId}
                      className="w-full text-xs"
                    >
                      {togglingRegId === evt.eventId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : evt.registrationStatus === "OPEN" ? (
                        "Close Reg"
                      ) : (
                        "Open Reg"
                      )}
                    </Button>
                  </div>
                )}
                <Link href={`/portal/events/${evt.eventId}/registrations`} className="block">
                  <Button variant="secondary" size="sm" className="w-full text-xs gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> View Registrations
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}