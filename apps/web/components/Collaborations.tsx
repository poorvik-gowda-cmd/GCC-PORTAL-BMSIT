"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const elegantEase = [0.16, 1, 0.3, 1] as const;

const NetworkVisual = () => {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nodes = [
    { id: 1, x: "20%", y: "40%", label: "MIT Partnership", info: "Joint Research Program" },
    { id: 2, x: "65%", y: "25%", label: "CERN", info: "Data Analysis Exchange" },
    { id: 3, x: "45%", y: "65%", label: "Stanford", info: "Innovation Lab" },
    { id: 4, x: "80%", y: "55%", label: "Oxford", info: "Student Exchange" },
  ];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none md:pointer-events-auto" ref={containerRef}>
      {/* Background abstract connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#68d32f" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#68d32f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Global Connection lines */}
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
        <motion.path
          d="M 200 700 Q 500 500 900 650 T 1600 300"
          fill="none"
          stroke="rgba(255,255,255,0.02)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Inter-node connections */}
        <motion.line
          x1="20%" y1="40%" x2="45%" y2="65%"
          stroke={activeNode === 1 || activeNode === 3 ? "rgba(104,211,47,0.3)" : "rgba(255,255,255,0.05)"}
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 1 }}
        />
        <motion.line
          x1="65%" y1="25%" x2="80%" y2="55%"
          stroke={activeNode === 2 || activeNode === 4 ? "rgba(104,211,47,0.3)" : "rgba(255,255,255,0.05)"}
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 1.2 }}
        />
        <motion.line
          x1="45%" y1="65%" x2="80%" y2="55%"
          stroke={activeNode === 3 || activeNode === 4 ? "rgba(104,211,47,0.3)" : "rgba(255,255,255,0.05)"}
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 1.4 }}
        />
      </svg>

      {/* Interactive Nodes */}
      {nodes.map((node) => (
        <div 
          key={node.id}
          className="absolute"
          style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
          onMouseEnter={() => setActiveNode(node.id)}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="relative group cursor-pointer w-12 h-12 flex items-center justify-center">
            {/* Core point */}
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full z-10"
              animate={{ 
                scale: activeNode === node.id ? 1.5 : 1,
                backgroundColor: activeNode === node.id ? "#68d32f" : "#fff" 
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Glow pulse */}
            <motion.div 
              className="absolute w-6 h-6 rounded-full bg-[#68d32f]/20"
              animate={{ 
                scale: activeNode === node.id ? [1, 2, 1.5] : [1, 1.2, 1],
                opacity: activeNode === node.id ? 0.8 : 0.3
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
            />

            {/* Tooltip Info */}
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ 
                opacity: activeNode === node.id ? 1 : 0, 
                y: activeNode === node.id ? 0 : 10,
                filter: activeNode === node.id ? "blur(0px)" : "blur(4px)" 
              }}
              transition={{ duration: 0.4, ease: elegantEase }}
              className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg pointer-events-none"
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
  return (
    <section
      id="collaborations"
      className="relative min-h-screen overflow-hidden bg-[#050608] px-6 py-32 text-white md:px-12 lg:px-20"
    >
      <NetworkVisual />

      <div className="relative z-10 mx-auto max-w-[1400px] pointer-events-none">

        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: elegantEase }}
          className="mb-6 text-xs uppercase tracking-[0.3em] text-[#68d32f]"
        >
          Global Network
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
          GCC builds meaningful connections between students, institutions,
          organizations and global partners to create opportunities for
          collaboration and growth.
        </motion.p>

        {/* Collaboration cards */}
        <div className="mt-16 grid gap-5 md:grid-cols-3 pointer-events-auto">

          {[
            {
              number: "01",
              title: "Institutional Partnerships",
              text: "Building strong academic connections with institutions across the world.",
            },
            {
              number: "02",
              title: "Global Organizations",
              text: "Connecting students with organizations, communities and industry partners.",
            },
            {
              number: "03",
              title: "Student Networks",
              text: "Creating a network where students can collaborate, learn and grow together.",
            },
          ].map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: elegantEase }}
              variants={{
                hover: {
                  y: -5,
                  transition: { duration: 0.4, ease: elegantEase }
                }
              }}
              whileHover="hover"
              className="group border-t border-white/15 pt-6 cursor-pointer"
            >
              <span className="text-sm text-[#68d32f] transition-colors duration-300 group-hover:text-white">
                {item.number}
              </span>

              <h3 className="mt-5 text-2xl font-medium transition-colors duration-300 group-hover:text-[#68d32f]">
                {item.title}
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">
                {item.text}
              </p>

              <div className="mt-8 h-px w-full bg-white/10 transition-all duration-500 group-hover:bg-[#68d32f]" />
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}