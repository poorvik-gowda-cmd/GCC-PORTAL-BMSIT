"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Loader2, AlertCircle, Lock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { apiGet, ApiError } from "@/lib/api";

interface Registration {
  registrationId: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  collegeName: string | null;
  usn: string | null;
  department: string | null;
  registeredAt: string;
}

export default function EventRegistrationsPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    apiGet<{ registrations: Registration[]; count: number }>(`/api/v1/events/${eventId}/registrations`)
      .then((data) => {
        setRegistrations(data.registrations);
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.statusCode === 401) setError("Session expired. Please log in again.");
          else if (err.statusCode === 403) {
            setForbidden(true);
            setError("You do not have permission to view registrations (requires REGISTRATION_VIEW).");
          } else if (err.statusCode === 404) {
            setError("Event not found.");
          } else {
            setError("Failed to load registrations. Please try again.");
          }
        } else {
          setError("Network error. Please check your connection.");
        }
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  // CSV export — client-side, no extra endpoint needed
  const handleExportCsv = () => {
    const header = ["Registration ID", "Full Name", "Email", "Phone", "College", "USN", "Department", "Registered At"];
    const rows = registrations.map((r) => [
      r.registrationId,
      r.fullName,
      r.email,
      r.phone,
      r.collegeName ?? "",
      r.usn ?? "",
      r.department ?? "",
      new Date(r.registeredAt).toLocaleString("en-US"),
    ]);
    const csvContent = [header, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${eventId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/portal/events"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Events
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" /> Event Registrations
          </h1>
          <p className="text-xs font-mono text-blue-400">{eventId}</p>
        </div>
        {!loading && !error && registrations.length > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExportCsv}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        )}
      </div>

      <Card className="glass-panel border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg">Registered Participants</CardTitle>
            {!loading && !error && (
              <Badge variant="default" className="text-xs">
                {registrations.length} total
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Data is fetched live from D1. Export to CSV for offline analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              {forbidden ? (
                <Lock className="w-10 h-10 text-amber-400" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-400" />
              )}
              <p className="text-sm font-semibold text-white">
                {forbidden ? "Access Restricted" : "Failed to Load"}
              </p>
              <p className="text-xs text-slate-400 max-w-xs">{error}</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No registrations yet for this event.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-xs text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-6 py-3 font-medium">Registration ID</th>
                    <th className="px-4 py-3 font-medium">Full Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">College</th>
                    <th className="px-4 py-3 font-medium">USN</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r, i) => (
                    <tr
                      key={r.registrationId}
                      className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors ${
                        i % 2 === 0 ? "" : "bg-slate-900/20"
                      }`}
                    >
                      <td className="px-6 py-3 font-mono text-blue-400 whitespace-nowrap">{r.registrationId}</td>
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{r.fullName}</td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.email}</td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.phone}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{r.collegeName || "—"}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono whitespace-nowrap">{r.usn || "—"}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{r.department || "—"}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(r.registeredAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
