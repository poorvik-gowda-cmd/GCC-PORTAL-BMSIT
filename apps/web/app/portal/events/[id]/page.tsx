"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Eye,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Download,
  QrCode,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type { GccEvent } from "@gcc-portal/contracts";

export default function InternalEventDetailsPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<GccEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadEvent = async () => {
    if (!eventId) return;
    try {
      const data = await apiGet<{ event: GccEvent }>(`/api/v1/events/${eventId}`);
      setEvent(data.event);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        setError("Event not found.");
      } else {
        setError("Failed to load event details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const handlePublishToggle = async () => {
    if (!event) return;
    const publish = event.eventStatus !== "PUBLISHED";
    setPublishing(true);
    try {
      await apiPost(`/api/v1/events/${event.eventId}/publish`, { publish });
      showToast("success", `Event ${publish ? "published" : "set to draft"} successfully.`);
      await loadEvent();
    } catch (err) {
      showToast("error", err instanceof ApiError ? err.message : "Failed to change event status.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-4 text-center py-16">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Event Unavailable</h2>
        <p className="text-xs text-slate-400">{error || "Event not found"}</p>
        <Link href="/portal/events">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Event Desk
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-xs font-medium ${
          toast.type === "success" ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300" : "bg-red-500/20 border border-red-500/40 text-red-300"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/portal/events" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Events Desk
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" /> {event.title}
          </h1>
          <p className="text-xs font-mono text-blue-400">{event.eventId}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={event.eventStatus === "PUBLISHED" ? "outline" : "gradient"}
            size="sm"
            onClick={handlePublishToggle}
            disabled={publishing}
            className="text-xs gap-1.5"
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : event.eventStatus === "PUBLISHED" ? "Set to Draft" : "Publish to Website"}
          </Button>
          <Link href={`/portal/events/${event.eventId}/registrations`}>
            <Button variant="secondary" size="sm" className="text-xs gap-1.5">
              <Eye className="w-3.5 h-3.5" /> View Registrations
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-panel border-slate-800">
          <CardContent className="p-5">
            <p className="text-xs text-slate-400">Event Status</p>
            <div className="mt-2">
              <Badge variant={event.eventStatus === "PUBLISHED" ? "success" : "secondary"}>
                {event.eventStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800">
          <CardContent className="p-5">
            <p className="text-xs text-slate-400">Registration Status</p>
            <div className="mt-2">
              <Badge variant={event.registrationStatus === "OPEN" ? "success" : "secondary"}>
                {event.registrationStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800">
          <CardContent className="p-5">
            <p className="text-xs text-slate-400">Event Venue & Date</p>
            <p className="text-xs font-semibold text-white mt-1">📍 {event.venue}</p>
            <p className="text-[10px] text-slate-400">
              🗓 {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Details Card */}
      <Card className="glass-panel border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Event Overview & Description</CardTitle>
          <CardDescription className="text-xs">Category: {event.category}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-300">
          <div>
            <h4 className="font-semibold text-white mb-1">Short Description</h4>
            <p className="text-slate-400">{event.shortDescription}</p>
          </div>
          <div className="border-t border-slate-800 pt-3">
            <h4 className="font-semibold text-white mb-1">Full Details</h4>
            <p className="leading-relaxed whitespace-pre-wrap text-slate-300">{event.fullDescription}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
