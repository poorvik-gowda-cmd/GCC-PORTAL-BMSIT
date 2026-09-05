"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { X, ExternalLink, FileText, Building2 } from "lucide-react";

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

function getMoUPhotoUrl(item: CollaborationItem): string | null {
  if (item.image_url && item.image_url.trim() !== "") {
    const driveMatch = item.image_url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || item.image_url.match(/id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1200`;
    }
    return item.image_url;
  }
  if (item.mou_file_url && item.mou_file_url.trim() !== "") {
    const driveMatch = item.mou_file_url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || item.mou_file_url.match(/id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1200`;
    }
    if (/\.(jpeg|jpg|png|webp|svg)(\?.*)?$/i.test(item.mou_file_url)) {
      return item.mou_file_url;
    }
  }
  return null;
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
  const [selectedItem, setSelectedItem] = useState<CollaborationItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [imgError, setImgError] = useState(false);

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

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setSelectedItem(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [selectedItem]);

  // Reset image error state whenever selected item changes
  useEffect(() => {
    setImgError(false);
  }, [selectedItem]);

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
                onClick={() => {
                  setSelectedIndex(index);
                  setSelectedItem(item);
                }}
                className="group cursor-pointer border border-white/10 rounded-2xl bg-white/[0.03] p-6 hover:border-[#68d32f]/60 hover:bg-white/[0.06] transition-all flex flex-col justify-between hover:shadow-[0_0_30px_rgba(104,211,47,0.12)] relative"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono tracking-widest text-[#68d32f] uppercase px-2.5 py-1 rounded bg-[#68d32f]/10 border border-[#68d32f]/20">
                      {item.status || "ACTIVE"}
                    </span>
                    <span className="text-xs text-white/40 font-mono">0{index + 1}</span>
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-white group-hover:text-[#68d32f] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-[#68d32f]/90 font-medium flex items-center gap-1.5">
                    🏛 {item.institution}
                  </p>

                  <p className="mt-4 text-xs leading-relaxed text-white/50 line-clamp-4">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-[#68d32f] font-semibold flex items-center gap-1 group-hover:underline">
                    View MoU Photo &amp; Details ↗
                  </span>
                  <span className="text-[11px] text-white/40 font-mono">
                    Click to open
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive MoU Photo & Details Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: elegantEase }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/15 bg-[#0a0c10] shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col md:flex-row"
            >
              {/* Close Button Top Right */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-20 rounded-full bg-white/10 p-2 text-white/70 hover:bg-[#68d32f] hover:text-black transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column: Photo / Document Preview */}
              <div className="w-full md:w-1/2 bg-black/60 p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10">
                {getMoUPhotoUrl(selectedItem) && !imgError ? (
                  <div className="relative w-full h-[260px] md:h-[480px] flex items-center justify-center rounded-2xl overflow-hidden bg-black/40 border border-white/10 group">
                    <img
                      src={getMoUPhotoUrl(selectedItem)!}
                      alt={selectedItem.title}
                      onError={() => setImgError(true)}
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] text-white/80 border border-white/10">
                      Official MoU Image
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[240px] md:h-[480px] rounded-2xl border border-dashed border-white/20 bg-white/[0.02] flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#68d32f]/10 text-[#68d32f] flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-semibold text-white">Official Signed Document</h4>
                    <p className="text-xs text-white/50 mt-2 max-w-xs leading-relaxed">
                      Institutional agreement on record between BMSIT&amp;M and {selectedItem.institution}.
                    </p>
                    {selectedItem.mou_file_url && (
                      <a
                        href={selectedItem.mou_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#68d32f]/10 border border-[#68d32f]/30 text-[#68d32f] hover:bg-[#68d32f] hover:text-black text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Document File
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Full Detailed Content */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono tracking-widest text-[#68d32f] uppercase px-3 py-1 rounded-full bg-[#68d32f]/10 border border-[#68d32f]/20">
                      {selectedItem.status || "ACTIVE"}
                    </span>
                    <span className="text-xs font-mono text-white/40">
                      MoU 0{selectedIndex + 1}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-white leading-tight tracking-tight">
                    {selectedItem.title}
                  </h3>

                  <div className="flex items-start gap-2.5 text-xs md:text-sm text-[#68d32f] font-medium bg-[#68d32f]/5 p-3 rounded-xl border border-[#68d32f]/15">
                    <Building2 className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{selectedItem.institution}</span>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                      Scope &amp; Objectives
                    </p>
                    <div className="text-xs md:text-sm text-white/75 leading-relaxed whitespace-pre-line max-h-[200px] md:max-h-[280px] overflow-y-auto pr-3">
                      {selectedItem.description}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
                  {selectedItem.mou_file_url ? (
                    <a
                      href={selectedItem.mou_file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#68d32f] px-5 py-3 text-xs font-semibold text-black hover:bg-[#5bc027] transition-all shadow-[0_0_20px_rgba(104,211,47,0.3)]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Official Document in Drive ↗
                    </a>
                  ) : null}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-5 py-3 rounded-xl border border-white/15 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}