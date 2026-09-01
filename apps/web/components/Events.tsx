"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { events as staticEvents } from "@/data/events";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://gcc-portal-api-production.gcc-portal.workers.dev";

interface LiveEvent {
  id: string | number;
  title: string;
  shortDescription?: string;
  description?: string;
  startDate?: string;
  date?: string;
  venue?: string;
}

export default function Events() {
  const [eventList, setEventList] = useState<LiveEvent[]>(staticEvents);

  useEffect(() => {
    async function loadLiveEvents() {
      try {
        const resp = await fetch(`${API_BASE}/api/v1/events`);
        if (resp.ok) {
          const resData = await resp.json();
          if (resData.success && Array.isArray(resData.data.events) && resData.data.events.length > 0) {
            const mapped = resData.data.events.map((e: any) => ({
              id: e.eventId || e.id,
              title: e.title,
              description: e.shortDescription || e.fullDescription || e.description,
              date: e.startDate ? new Date(e.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : e.date || "Upcoming",
            }));
            setEventList(mapped);
          }
        }
      } catch (e) {
        console.error("Failed to load live events:", e);
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
            Events
          </p>

          <h2 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl lg:text-[6rem]">
            CONNECT.
            <br />
            <span className="text-[#68d32f]">COLLABORATE.</span>
          </h2>

          <p className="mt-8 max-w-2xl text-base leading-7 text-white/55 md:text-lg">
            Discover events, workshops and experiences that bring our
            community together and create meaningful global connections.
          </p>
        </motion.div>

        {/* Events */}
        <div className="mt-20 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {eventList.map((event, index) => (
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
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 cursor-pointer"
              >
                {/* Number */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/35">
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

                {/* Content */}
                <div className="mt-16">
                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#68d32f]">
                    {event.date}
                  </p>

                  <h3 className="text-2xl font-medium tracking-tight md:text-3xl">
                    {event.title}
                  </h3>

                  <motion.p 
                    variants={{
                      hover: { color: "rgba(255, 255, 255, 0.7)" }
                    }}
                    className="mt-4 text-sm leading-6 text-white/50 line-clamp-3"
                  >
                    {event.description}
                  </motion.p>
                </div>

                {/* Arrow */}
                <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-sm text-white/50 group-hover:text-[#68d32f] transition-colors">
                    Register for event
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
      </div>
    </section>
  );
}