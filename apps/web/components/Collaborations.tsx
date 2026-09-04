"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://gcc-portal-api-production.gcc-portal.workers.dev";
const elegantEase = [0.16, 1, 0.3, 1] as const;

interface CollaborationItem {
  id: string;
  title: string;
  institution: string;
  description: string;
  mou_file_url?: string;
  image_url?: string;
  status: string;
}



const NetworkVisual = () => {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nodes = [
    { id: 1, x: "20%", y: "40%", label: "Erasmus+ Program", info: "Student Exchange MoU" },
    { id: 2, x: "65%", y: "25%", label: "International Cell", info: "Research Lab Partnership" },
    { id: 3, x: "45%", y: "65%", label: "Global Consortium", info: "Higher Education MoU" },
    { id: 4, x: "80%", y: "55%", label: "Partner Universities", info: "Academic Exchange" },
  ];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none md:pointer-events-auto" ref={containerRef}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#68d32f" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#68d32f" stopOpacity="0" />
          </radialGradient>
        </defs>

        <motion.path
          d="M -100 300 Q 300 400 600 200 T 1400 500"
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
        />

        <motion.line
          x1="20%" y1="40%" x2="45%" y2="65%"
          stroke={activeNode === 1 || activeNode === 3 ? "rgba(104,211,47,0.3)" : "rgba(255,255,255,0.05)"}
          strokeWidth="1"
        />
        <motion.line
          x1="65%" y1="25%" x2="80%" y2="55%"
          stroke={activeNode === 2 || activeNode === 4 ? "rgba(104,211,47,0.3)" : "rgba(255,255,255,0.05)"}
          strokeWidth="1"
        />
      </svg>

      {nodes.map((node) => (
        <div 
          key={node.id}
          className="absolute"
          style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
          onMouseEnter={() => setActiveNode(node.id)}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="relative group cursor-pointer w-12 h-12 flex items-center justify-center">
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full z-10"
              animate={{ 
                scale: activeNode === node.id ? 1.5 : 1,
                backgroundColor: activeNode === node.id ? "#68d32f" : "#fff" 
              }}
              transition={{ duration: 0.3 }}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: activeNode === node.id ? 1 : 0, 
                y: activeNode === node.id ? 0 : 10,
              }}
              transition={{ duration: 0.4, ease: elegantEase }}
              className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 border border-white/10 px-4 py-2 rounded-lg pointer-events-none z-20"
            >
              <p className="text-[#68d32f] text-xs font-mono tracking-widest uppercase mb-1">{node.label}</p>
              <p className="text-white/70 text-xs">{node.info}</p>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Collaborations() {
  const [items, setItems] = useState<CollaborationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollaborations() {
      try {
        const resp = await fetch(`${API_BASE}/api/v1/collaborations`);
        if (resp.ok) {
          const resData = await resp.json();
          if (resData.success && Array.isArray(resData.data.collaborations)) {
            setItems(resData.data.collaborations);
          }
        }
      } catch (err) {
        console.error("Failed to load collaborations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCollaborations();
  }, []);

  return (
    <section
      id="collaborations"
      className="relative min-h-screen overflow-hidden bg-[#050608] px-6 py-32 text-white md:px-12 lg:px-20"
    >
      <NetworkVisual />

      <div className="relative z-10 mx-auto max-w-[1400px]">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: elegantEase }}
          className="mb-6 text-xs uppercase tracking-[0.3em] text-[#68d32f]"
        >
          Institutional MoUs & Partnerships
        </motion.p>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: elegantEase, delay: 0.1 }}
          className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl lg:text-8xl"
        >
          COLLABORATIONS.
          <br />
          <span className="text-[#68d32f]">GLOBAL REACH.</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: elegantEase, delay: 0.2 }}
          className="mt-8 max-w-2xl text-base leading-7 text-white/55 md:text-lg"
        >
          Browse active MoUs, institutional agreements, and global partnerships published by the Executive Council and Research Team.
        </motion.p>

        {/* Dynamic Collaboration cards */}
        {loading ? (
          <div className="mt-16 p-16 text-center rounded-3xl border border-white/10 bg-[#0a0c0a] max-w-xl mx-auto space-y-3">
            <div className="w-8 h-8 border-2 border-[#68d32f] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-white/50">Loading institutional MoUs...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-16 p-16 text-center rounded-3xl border border-white/10 bg-[#0a0c0a] max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#68d32f]/10 text-[#68d32f] flex items-center justify-center mx-auto text-2xl">
              🤝
            </div>
            <h3 className="text-xl font-semibold text-white">No Institutional MoUs Published Yet</h3>
            <p className="text-xs text-white/50 leading-relaxed max-w-md mx-auto">
              Official institutional MoUs, international partnerships, and collaboration agreements will appear here once published by the Executive Council or Research &amp; Publication team.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {items.map((item, index) => (
              <motion.div
                key={item.id ?? index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: elegantEase }}
                className="group border border-white/10 rounded-2xl bg-white/[0.03] p-6 hover:border-[#68d32f]/60 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono tracking-widest text-[#68d32f] uppercase px-2.5 py-1 rounded bg-[#68d32f]/10 border border-[#68d32f]/20">
                    {item.status || "MOU SIGNED"}
                  </span>
                  <span className="text-xs text-white/40">0{index + 1}</span>
                </div>

                <h3 className="mt-6 text-xl font-semibold text-white group-hover:text-[#68d32f] transition-colors">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs text-[#68d32f]/80 font-medium">
                  🏛 {item.institution}
                </p>

                <p className="mt-4 text-xs leading-relaxed text-white/50 line-clamp-4">
                  {item.description}
                </p>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                  {item.mou_file_url ? (
                    <a
                      href={item.mou_file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#68d32f] hover:underline font-semibold flex items-center gap-1"
                    >
                      View Official MoU Document ↗
                    </a>
                  ) : (
                    <span className="text-xs text-white/40 font-mono">Verified Institutional MoU</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}