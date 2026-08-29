import Link from "next/link";
export const dynamic = "force-dynamic";

import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GccEvent } from "@gcc-portal/contracts";

async function fetchEvents(): Promise<GccEvent[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  try {
    const res = await fetch(`${apiBase}/api/v1/events`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch events");
    const data = await res.json();
    return data.success ? data.data.events : [];
  } catch (err) {
    console.error("[EventsPage] Fetch error:", err);
    return [];
  }
}

export default async function EventsPage() {
  const events = await fetchEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="default" className="gap-2">
          <Calendar className="w-4 h-4 text-blue-400" /> GCC Event Calendar
        </Badge>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Upcoming <span className="gradient-text">GCC Events</span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          Register directly on our official GCC website. No external forms or third-party links required.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No upcoming events scheduled at this time. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((evt) => (
            <Card key={evt.eventId} className="glass-panel border-slate-800 flex flex-col justify-between">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{evt.category}</Badge>
                  <Badge variant={evt.registrationStatus === "OPEN" ? "success" : "secondary"}>
                    {evt.registrationStatus === "OPEN" ? "Registration Open" : evt.registrationStatus === "FULL" ? "Event Full" : "Registration Closed"}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-white">{evt.title}</CardTitle>
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />{" "}
                    {new Date(evt.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-400" /> {evt.venue}</div>
                </div>
                <CardDescription className="text-xs text-slate-300 leading-relaxed">
                  {evt.shortDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={`/events/${evt.eventId}`}>
                  <Button variant="gradient" className="w-full justify-center text-xs gap-2">
                    Register for Event <ArrowRight className="w-4 h-4" />
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
