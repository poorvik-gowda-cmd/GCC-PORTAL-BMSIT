"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Calendar, MapPin, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { GccEvent } from "@gcc-portal/contracts";

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<GccEvent | null>(null);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    collegeName: "BMSIT&M",
    usn: "",
    department: "Computer Science & Engineering",
  });

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
    fetch(`${apiBase}/api/v1/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        const resData = data as { success: boolean; data?: { event: GccEvent }; error?: { message?: string } };
        if (resData.success && resData.data) {
          setEvent(resData.data.event);
        } else {
          setError(resData.error?.message || "Event not found");
        }
      })
      .catch(() => {
        setError("Could not load event details. Please try again later.");
      })
      .finally(() => {
        setFetching(false);
      });
  }, [eventId]);

  useEffect(() => {
    const win = window as unknown as {
      onTurnstileSuccess?: (token: string) => void;
    };
    win.onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };
    return () => {
      delete win.onTurnstileSuccess;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError("Please complete the bot security check.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
      const resp = await fetch(`${apiBase}/api/v1/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turnstileToken,
          ...formData,
        }),
      });

      const data = (await resp.json()) as { success: boolean; data?: { registrationId: string }; error?: { message?: string } };

      if (!resp.ok || !data.success) {
        setError(data.error?.message || "Registration failed. Please try again.");
        const win = window as unknown as {
          turnstile?: { reset: () => void };
        };
        if (win.turnstile) {
          win.turnstile.reset();
        }
        setTurnstileToken(null);
      } else if (data.data) {
        setSuccess(`Registration successful! Your Registration ID is ${data.data.registrationId}.`);
      }
    } catch {
      setError("Unable to connect to event registration server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400" />
        <p className="text-slate-400 text-sm">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <p className="text-slate-400 text-sm">{error || "The requested event could not be found."}</p>
        <Link href="/events" className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to All Events
        </Link>
      </div>
    );
  }

  const isClosed = event.registrationStatus !== "OPEN";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      <Link href="/events" className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to All Events
      </Link>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="default">EVENT ID: {event.eventId}</Badge>
          <Badge variant={event.registrationStatus === "OPEN" ? "success" : "secondary"}>
            {event.registrationStatus === "OPEN" ? "Registration Open" : event.registrationStatus === "FULL" ? "Event Full" : "Registration Closed"}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {event.title}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-400" />
            {new Date(event.startDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-400" /> {event.venue}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
          {event.fullDescription}
        </p>
      </div>

      <Card className={`glass-panel border-blue-500/30 ${isClosed ? "opacity-60" : ""}`}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" /> Event Registration Form
          </CardTitle>
          <CardDescription className="text-xs">
            {isClosed ? "Registration is currently closed for this event." : "Complete your registration directly below. Powered by GCC's verified registration system."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-lg text-white">Registration Confirmed</h4>
              <p className="text-xs leading-relaxed">{success}</p>
              <Button variant="outline" size="sm" onClick={() => { setSuccess(null); setTurnstileToken(null); }} className="mt-2 text-xs">
                Register Another Participant
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Full Name *</label>
                  <Input
                    required
                    disabled={isClosed}
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Email Address *</label>
                  <Input
                    type="email"
                    required
                    disabled={isClosed}
                    placeholder="e.g. rahul.sharma@bmsit.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Phone Number *</label>
                  <Input
                    required
                    disabled={isClosed}
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">USN / Roll Number</label>
                  <Input
                    disabled={isClosed}
                    placeholder="e.g. 1BY22CS001"
                    value={formData.usn}
                    onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">College / Institution</label>
                <Input
                  disabled={isClosed}
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Department</label>
                <Input
                  disabled={isClosed}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              {!isClosed && (
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
                  <div
                    className="cf-turnstile"
                    data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                    data-callback="onTurnstileSuccess"
                    data-theme="dark"
                  />
                  <span className="flex items-center gap-2 text-[10px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Protected by Cloudflare Turnstile Bot Guard
                  </span>
                </div>
              )}

              <Button type="submit" variant="gradient" className="w-full justify-center text-sm py-2.5" disabled={loading || isClosed || !turnstileToken}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isClosed ? "Registration Closed" : "Complete Registration"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}