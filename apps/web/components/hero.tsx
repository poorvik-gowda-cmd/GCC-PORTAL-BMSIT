"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import FlightPaths from "./FlightPaths";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const blur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(10px)"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  return (
    <section
      ref={containerRef}
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-[#050608]"
    >
      {/* Earth Video */}
      <motion.video
        style={{ opacity }}
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/videos/earth.mp4" type="video/mp4" />
      </motion.video>

      {/* Main cinematic overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Dark left gradient for typography */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#050608]/75 to-transparent z-10" />

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#050608] to-transparent z-10" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.85)] z-10 pointer-events-none" />

      {/* Flight Paths Layer */}
      <FlightPaths scrollYProgress={scrollYProgress} />

      {/* Transition overlay for seamless scroll to next section */}
      <motion.div 
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-[#050608] pointer-events-none z-10" 
      />

      {/* Hero Content */}
      <motion.div 
        style={{ opacity, y, filter: blur }}
        className="relative z-20 mx-auto w-full max-w-[1500px] px-6 pt-28 md:px-10 lg:pt-20"
      >
        <div className="max-w-[700px]">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 text-sm font-medium tracking-[0.35em] text-[#68d32f]"
          >
        
          </motion.p>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15 }}
            className="text-[clamp(2.8rem,5vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.045em]"
          >
            GLOBAL
            <br />
            CONNECTIONS.
            <br />
            <span className="text-[#68d32f]">LOCAL IMPACT.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-8 max-w-xl text-base leading-8 text-white/65 md:text-lg"
          >
            GCC at BSMIT connects ambitious students with global
            opportunities, research, collaborations and real-world impact.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <a
              href="#about"
              className="group rounded-full bg-[#68d32f] px-7 py-4 font-medium text-black transition-all duration-300 hover:scale-[1.03] hover:bg-[#7ae63e]"
            >
              Explore GCC
              <span className="ml-4 inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>

            <a
              href="#opportunities"
              className="group rounded-full border border-black/35 bg-black/10 px-7 py-4 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
            >
              Explore Opportunities
              <span className="ml-4 inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-16 max-w-2xl"
          >
            <p className="mb-4 text-xs font-medium tracking-[0.25em] text-[#68d32f]">
              GLOBAL IMPACT
            </p>

            <div className="grid grid-cols-2 border-t border-black/20 pt-5 md:grid-cols-4">
              <Stat value="10+" label="Members" />
              <Stat value="06" label="Departments" />
              <Stat value="∞" label="Opportunities" />
              <Stat value="01" label="Global Vision" />
            </div>
          </motion.div>
        </div>
      </motion.div>

     

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2 text-center"
      >
        <div className="mx-auto mb-3 flex h-11 w-7 items-center justify-center rounded-full border border-white/30">
          <div className="h-2.5 w-1 rounded-full bg-white/70" />
        </div>

        <p className="text-xs text-white/50">Scroll to explore</p>
      </motion.div>
    </section>
  );
}

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="border-r border-white/15 px-4 first:pl-0 last:border-r-0">
      <div className="text-2xl font-medium md:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-white/50 md:text-sm">{label}</div>
    </div>
  );
}