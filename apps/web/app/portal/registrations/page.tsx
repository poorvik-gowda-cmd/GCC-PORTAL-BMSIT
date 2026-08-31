"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Calendar, Eye, Loader2, AlertCircle, Lock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGet, ApiError } from "@/lib/api";
import type { GccEvent } from "@gcc-portal/contracts";

export default function EventRegistrationsHubPage() {
  const [events, setEvents] = useState<GccEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiGet<{ events: GccEvent[] }>("/api/v1/events/all");
        if (active) {
          setEvents(data.events || []);
        }
      } catch (err) {
        if (active) {
          if (err instanceof ApiError && err.statusCode === 403) {
            setForbidden(true);
            setError("You do not have permission to view registrations hub (requires REGISTRATION_VIEW).");
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" /> Event Registrations Hub
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Centralized registration records for Technical Desk & Executive Council. Select any event to view candidate lists & export CSV data.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-3 text-center">
          {forbidden ? <Lock className="w-10 h-10 text-amber-400" /> : <AlertCircle className="w-10 h-10 text-red-400" />}
          <p className="text-sm font-semibold text-white">{forbidden ? "Access Restricted" : "Failed to Load Registrations Hub"}</p>
          <p className="text-xs text-slate-400 max-w-md">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <Card className="glass-panel border-slate-800 p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Event Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once events are created in the Event Desk, their registration registries will be accessible here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((evt) => (
            <Card key={evt.eventId} className="glass-panel border-slate-800 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <Badge variant={evt.registrationStatus === "OPEN" ? "success" : evt.registrationStatus === "FULL" ? "destructive" : "secondary"}>
                    Reg: {evt.registrationStatus}
                  </Badge>
                  <span className="text-xs font-mono text-blue-400">{evt.eventId}</span>
                </div>
                <CardTitle className="text-base text-white leading-snug">{evt.title}</CardTitle>
                <CardDescription className="text-xs text-slate-400 space-y-1">
                  <div>📍 {evt.venue}</div>
                  <div>🗓 {new Date(evt.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  <div className="text-slate-300 font-medium pt-1">
                    👥 Registered Candidates:{" "}
                    <span className="text-blue-400 font-bold font-mono">
                      {evt.registeredCount ?? 0}
                    </span>
                    {evt.capacity ? ` / ${evt.capacity}` : ""}
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <Link href={`/portal/events/${evt.eventId}/registrations`} className="block">
                  <Button variant="gradient" size="sm" className="w-full text-xs gap-1.5 justify-between">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> View Candidates List
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
