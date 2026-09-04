"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://gcc-portal-api-production.gcc-portal.workers.dev";
const PHOTOGRAPHY_DRIVE_URL = "https://drive.google.com/drive/u/0/folders/1JWpSQUYZPS9lFjf4TpK_ySriv2Ah9dl_";

interface LiveEvent {
  id: string | number;
  title: string;
  shortDescription?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  venue?: string;
  status?: string;
  bannerImageRef?: string;
  photos?: string[];
}

export default function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState<LiveEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PREVIOUS">("UPCOMING");
  const [selectedPastEvent, setSelectedPastEvent] = useState<LiveEvent | null>(null);

  useEffect(() => {
    async function loadLiveEvents() {
      try {
        setLoading(true);
        const resp = await fetch(`${API_BASE}/api/v1/events`);
        if (resp.ok) {
          const resData = await resp.json();
          if (resData.success && Array.isArray(resData.data.events)) {
            const now = new Date();
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const upcoming: LiveEvent[] = [];
            const previous: LiveEvent[] = [];

            resData.data.events.forEach((e: any) => {
              const mapped: LiveEvent = {
                id: e.eventId || e.id,
                title: e.title,
                shortDescription: e.shortDescription,
                description: e.shortDescription || e.fullDescription || e.description,
                startDate: e.startDate,
                endDate: e.endDate,
                date: e.startDate
                  ? new Date(e.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : e.date || "Scheduled",
                venue: e.venue || "BMSIT Campus",
                status: e.eventStatus || e.status,
                bannerImageRef: e.bannerImageRef,
              };

              const start = e.startDate ? new Date(e.startDate) : null;
              const end = e.endDate ? new Date(e.endDate) : null;

              // Conductance Criteria:
              // An event is in the past if:
              // 1. Explicitly marked as COMPLETED
              // 2. OR end time is in the past
              // 3. OR start time is prior to today's date
              const isPast =
                e.eventStatus === "COMPLETED" ||
                (end && end < now) ||
                (start && start < todayStart);

              if (isPast) {
                previous.push(mapped);
              } else {
                upcoming.push(mapped);
              }
            });

            setUpcomingEvents(upcoming);
            setPastEvents(previous);
          }
        }
      } catch (e) {
        console.error("Failed to load live events:", e);
      } finally {
        setLoading(false);
      }
    }
    loadLiveEvents();
  }, []);

  return (
    <section
      id="events"
      className="relative min-h-screen overflow-hidden bg-[#050608] px-6 py-24 text-white md:px-12 lg:px-20"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#68d32f]/10 blur-[140px]" />

      <div className="relative mx-auto max-w-[1400px]">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-[#68d32f]">
            Events &amp; Media Gallery
          </p>

          <h2 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl lg:text-[6rem]">
            CONNECT.
            <br />
            <span className="text-[#68d32f]">COLLABORATE.</span>
          </h2>

          <p className="mt-8 max-w-2xl text-base leading-7 text-white/55 md:text-lg">
            Discover upcoming workshops, global summits, and browse media photo galleries from our past international events.
          </p>
        </motion.div>

        {/* Tab Filters Card Bar */}
        <div className="mt-12 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("UPCOMING")}
            className={`rounded-full px-8 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "UPCOMING"
                ? "bg-[#68d32f] text-black shadow-[0_0_25px_rgba(104,211,47,0.3)]"
                : "border border-white/15 text-white/80 hover:border-[#68d32f] hover:text-white"
            }`}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("PREVIOUS")}
            className={`rounded-full px-8 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "PREVIOUS"
                ? "bg-[#68d32f] text-black shadow-[0_0_25px_rgba(104,211,47,0.3)]"
                : "border border-white/15 text-white/80 hover:border-[#68d32f] hover:text-white"
            }`}
          >
            Previous Events &amp; Photos 📸 ({pastEvents.length})
          </button>
        </div>

        {/* --- UPCOMING EVENTS GRID --- */}
        {activeTab === "UPCOMING" && (
          <div className="mt-12">
            {loading ? (
              <div className="p-16 text-center rounded-3xl border border-white/10 bg-[#0a0c0a] max-w-xl mx-auto space-y-3">
                <div className="w-8 h-8 border-2 border-[#68d32f] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-white/50">Loading upcoming events...</p>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="p-16 text-center rounded-3xl border border-white/10 bg-[#0a0c0a] max-w-xl mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#68d32f]/10 text-[#68d32f] flex items-center justify-center mx-auto text-2xl">
                  📅
                </div>
                <h3 className="text-xl font-semibold text-white">No Upcoming Events Scheduled</h3>
                <p className="text-xs text-white/50 leading-relaxed max-w-md mx-auto">
                  New workshops, international summits, and technical sessions organized by the GCC team will appear here once scheduled.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event, index) => (
                  <Link key={event.id ?? index} href={`/events/${event.id}`}>
                    <motion.article
                      data-cursor="VIEW"
                      variants={{
                        hidden: { opacity: 0, y: 40 },
                        visible: { 
                          opacity: 1, 
                          y: 0, 
                          transition: { duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] } 
                        },
                        hover: {
                          y: -6,
                          borderColor: "rgba(104, 211, 47, 0.4)",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                        }
                      }}
                      initial="hidden"
                      whileInView="visible"
                      whileHover="hover"
                      viewport={{ once: true, margin: "-50px" }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 cursor-pointer h-full flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/35 font-mono">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <motion.span 
                            variants={{
                              hidden: { opacity: 0, scale: 0.5 },
                              visible: { opacity: 0, scale: 0.5 },
                              hover: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
                            }}
                            className="h-2 w-2 rounded-full bg-[#68d32f]" 
                          />
                        </div>

                        <div className="mt-12">
                          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#68d32f]">
                            {event.date}
                          </p>

                          <h3 className="text-2xl font-medium tracking-tight md:text-3xl text-white group-hover:text-[#68d32f] transition-colors">
                            {event.title}
                          </h3>

                          <p className="mt-4 text-sm leading-6 text-white/50 line-clamp-3">
                            {event.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="text-sm text-white/50 group-hover:text-[#68d32f] transition-colors">
                          Register For Event
                        </span>

                        <motion.span 
                          variants={{
                            hover: { x: 6, color: "#68d32f", transition: { duration: 0.3 } }
                          }}
                          className="text-xl"
                        >
                          →
                        </motion.span>
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- PREVIOUS EVENTS GRID (INTERACTIVE PHOTOS MODAL) --- */}
        {activeTab === "PREVIOUS" && (
          <div className="mt-12">
            {loading ? (
              <div className="p-16 text-center rounded-3xl border border-white/10 bg-[#0a0c0a] max-w-xl mx-auto space-y-3">
                <div className="w-8 h-8 border-2 border-[#68d32f] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-white/50">Loading conducted events...</p>
              </div>
            ) : pastEvents.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-white/10 bg-[#0a0c0a] max-w-xl mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#68d32f]/10 text-[#68d32f] flex items-center justify-center mx-auto text-2xl">
                  📸
                </div>
                <h3 className="text-xl font-semibold text-white">No Past Events Recorded Yet</h3>
                <p className="text-xs text-white/50 leading-relaxed max-w-md mx-auto">
                  Once scheduled events pass their conductance date, they will appear here automatically with photo galleries from the Photography team.
                </p>
                <a
                  href={PHOTOGRAPHY_DRIVE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-white hover:bg-[#68d32f] hover:text-black hover:border-[#68d32f] transition-all cursor-pointer"
                >
                  Browse Photography Google Drive ↗
                </a>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event, index) => (
                  <motion.article
                    key={event.id ?? index}
                    onClick={() => setSelectedPastEvent(event)}
                    variants={{
                      hidden: { opacity: 0, y: 40 },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        transition: { duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] } 
                      },
                      hover: {
                        y: -6,
                        borderColor: "rgba(104, 211, 47, 0.4)",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                      }
                    }}
                    initial="hidden"
                    whileInView="visible"
                    whileHover="hover"
                    viewport={{ once: true, margin: "-50px" }}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                          CONDUCTED
                        </span>

                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          📸 Photos Gallery
                        </span>
                      </div>

                      <div className="mt-12">
                        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#68d32f]">
                          {event.date}
                        </p>

                        <h3 className="text-2xl font-medium tracking-tight md:text-3xl text-white group-hover:text-[#68d32f] transition-colors">
                          {event.title}
                        </h3>

                        <p className="mt-4 text-sm leading-6 text-white/50 line-clamp-3">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5">
                      <span className="text-sm text-white/70 group-hover:text-[#68d32f] transition-colors flex items-center gap-1.5 font-medium">
                        📸 Inspect Event Photos
                      </span>

                      <motion.span 
                        variants={{
                          hover: { x: 6, color: "#68d32f", transition: { duration: 0.3 } }
                        }}
                        className="text-xl"
                      >
                        →
                      </motion.span>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- PAST EVENT PHOTOS MODAL --- */}
      {selectedPastEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#0a0c0a] p-6 sm:p-8 shadow-2xl space-y-6 text-white">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPastEvent(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Conducted Event
                </span>
                {selectedPastEvent.date && (
                  <span className="text-xs text-white/50 font-mono">📅 {selectedPastEvent.date}</span>
                )}
                {selectedPastEvent.venue && (
                  <span className="text-xs text-white/50 font-mono">📍 {selectedPastEvent.venue}</span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">{selectedPastEvent.title}</h3>
              {selectedPastEvent.description && (
                <p className="mt-2 text-xs leading-relaxed text-white/60">{selectedPastEvent.description}</p>
              )}
            </div>

            {/* Photos Inspection Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-widest text-[#68d32f] font-mono font-semibold">
                  Event Media &amp; Photos
                </h4>
                <a
                  href={PHOTOGRAPHY_DRIVE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  Open Photography Drive ↗
                </a>
              </div>

              {selectedPastEvent.bannerImageRef ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <img
                      src={selectedPastEvent.bannerImageRef}
                      alt={selectedPastEvent.title}
                      className="w-full max-h-[380px] object-cover rounded-2xl"
                    />
                  </div>
                  <div className="flex justify-end">
                    <a
                      href={selectedPastEvent.bannerImageRef}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#68d32f] hover:underline font-medium"
                    >
                      View High Resolution Image ↗
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-2xl">
                    📸
                  </div>
                  <h5 className="text-sm font-semibold text-white">No Photos Available Yet</h5>
                  <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                    The Photography &amp; Visual Media team has not uploaded media archives for this event yet. Photos will appear here once attached.
                  </p>
                  <div className="pt-2">
                    <a
                      href={PHOTOGRAPHY_DRIVE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white hover:bg-[#68d32f] hover:text-black hover:border-[#68d32f] transition-all cursor-pointer"
                    >
                      Browse General Photography Drive ↗
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPastEvent(null)}
                className="px-6 py-2.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}