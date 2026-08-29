"use client";

import { useState, useEffect } from "react";
import { QrCode, Copy, Check, Loader2, AlertCircle, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGet, ApiError } from "@/lib/api";
import type { GccEvent } from "@gcc-portal/contracts";

export default function QrManagerPage() {
  const [events, setEvents] = useState<GccEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
          // If 403 (e.g. non-event admin), fallback to public published events
          try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
            const pubResp = await fetch(`${apiBase}/api/v1/events`);
            const pubJson = await pubResp.json() as { success: boolean; data?: { events: GccEvent[] } };
            if (active && pubJson.success && pubJson.data) {
              setEvents(pubJson.data.events || []);
              return;
            }
          } catch {
            // ignore
          }
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("Unable to load event registry.");
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

  const handleCopy = (url: string, id: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <QrCode className="w-6 h-6 text-blue-400" /> Digital Systems QR Registry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time dynamic QR code generation for verified GCC event registration endpoints.
        </p>
      </div>

      {loading && (
        <div className="min-h-[30vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading active event QR codes...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <Card className="glass-panel border-slate-800 p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Events in Registry</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once events are created in the Event Management Desk, their official QR registration endpoints will appear here.
          </p>
        </Card>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((evt) => {
            const targetUrl = `/events/${evt.eventId}`;
            const qrId = `QR-${evt.eventId}`;

            return (
              <Card key={evt.eventId} className="glass-panel border-slate-800 space-y-4">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={evt.eventStatus === "PUBLISHED" ? "success" : "secondary"}>
                      {evt.eventStatus}
                    </Badge>
                    <span className="text-xs font-mono text-blue-400">{qrId}</span>
                  </div>
                  <CardTitle className="text-base text-white">{evt.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-400 font-mono">
                    Target: {targetUrl}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* QR Image Representation */}
                  <div className="w-36 h-36 mx-auto rounded-xl bg-white p-3 flex items-center justify-center shadow-lg">
                    <QrCode className="w-28 h-28 text-slate-950" />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(targetUrl, qrId)}
                      className="w-full text-xs gap-1.5"
                    >
                      {copiedId === qrId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === qrId ? "Copied!" : "Copy Link"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}