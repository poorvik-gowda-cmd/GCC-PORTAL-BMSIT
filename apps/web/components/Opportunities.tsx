"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://gcc-portal-api-production.gcc-portal.workers.dev";
const elegantEase = [0.16, 1, 0.3, 1] as const;

interface OpportunityItem {
  id: string;
  title: string;
  category: string;
  description: string;
  deadline?: string;
  apply_url?: string;
  attachment_url?: string;
}

const fallbackOpportunities: OpportunityItem[] = [
  {
    id: "opp-1",
    title: "Erasmus+ European Academic Mobility Fellowship 2026",
    category: "FELLOWSHIP",
    description: "Fully funded 6-month research & study mobility grant for BMSIT students at partner European universities.",
    deadline: "Dec 31, 2026",
    apply_url: "https://gcc.bmsit.in",
  },
  {
    id: "opp-2",
    title: "International Joint Research & Publication Grant",
    category: "RESEARCH_GRANT",
    description: "Seed funding grant up to $5,000 for undergraduate student research papers co-authored with global faculty.",
    deadline: "Nov 15, 2026",
    apply_url: "https://gcc.bmsit.in",
  },
  {
    id: "opp-3",
    title: "Global Summer Tech & Innovation Exchange",
    category: "EXCHANGE_PROGRAM",
    description: "3-week international summer school on AI ethics, quantum computing, and sustainable tech in Europe.",
    deadline: "Oct 30, 2026",
    apply_url: "https://gcc.bmsit.in",
  },
];

export default function Opportunities() {
  const [items, setItems] = useState<OpportunityItem[]>(fallbackOpportunities);

  useEffect(() => {
    async function loadOpportunities() {
      try {
        const resp = await fetch(`${API_BASE}/api/v1/opportunities`);
        if (resp.ok) {
          const resData = await resp.json();
          if (resData.success && Array.isArray(resData.data.opportunities) && resData.data.opportunities.length > 0) {
            setItems(resData.data.opportunities);
          }
        }
      } catch {}
    }
    loadOpportunities();
  }, []);

  return (
    <section
      id="opportunities"
      className="relative min-h-screen bg-[#050608] px-6 py-24 text-white md:px-12 lg:px-20 overflow-hidden"
    >
      <div className="pointer-events-none absolute -left-40 top-40 h-[500px] w-[500px] rounded-full bg-[#68d32f]/10 blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-[1400px]">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: elegantEase }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#68d32f]">
            Fellowships & Research Announcements
          </p>

          <h2 className="text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            BUILD.
            <br />
            <span className="text-[#68d32f]">CONNECT.</span>
            <br />
            CREATE IMPACT.
          </h2>

          <p className="mt-8 max-w-2xl text-base leading-8 text-white/60 md:text-lg">
            Discover international fellowships, exchange programs, research grants, and student initiatives published by GCC leadership.
          </p>
        </motion.div>

        {/* Opportunity Cards Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {items.map((opp, index) => (
            <motion.div
              key={opp.id ?? index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: elegantEase }}
              className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0a0c0a] p-8 shadow-2xl transition-all duration-500 hover:border-[#68d32f]/60 hover:bg-[#0f140f]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-widest px-3 py-1 rounded-full bg-[#68d32f]/10 text-[#68d32f] border border-[#68d32f]/30">
                    {opp.category.replace("_", " ")}
                  </span>
                  {opp.deadline && (
                    <span className="text-[11px] text-amber-400 font-mono">
                      📅 {opp.deadline}
                    </span>
                  )}
                </div>

                <h3 className="mt-6 text-2xl font-bold text-white group-hover:text-[#68d32f] transition-colors leading-snug">
                  {opp.title}
                </h3>

                <p className="mt-4 text-xs leading-relaxed text-white/50 line-clamp-4">
                  {opp.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
                {opp.attachment_url && (
                  <a
                    href={opp.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    📎 Download Announcement Photo / PDF ↗
                  </a>
                )}

                <a
                  href={opp.apply_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between w-full px-5 py-3 rounded-full bg-white/10 text-white font-medium text-xs hover:bg-[#68d32f] hover:text-black transition-all cursor-pointer"
                >
                  <span>Apply For Opportunity</span>
                  <span>→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}