"use client";

import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

const elegantEase = [0.16, 1, 0.3, 1] as const;

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const springValue = useSpring(0, {
    damping: 40,
    stiffness: 100,
    mass: 1,
  });

  const display = useTransform(springValue, (current) => 
    Math.floor(current).toString() + suffix
  );

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, springValue, value]);

  return <motion.div ref={ref}>{display}</motion.div>;
}

export default function ImpactStats() {
  return (
    <section
      id="impact"
      className="relative bg-[#050608] px-6 py-24 text-white md:px-12 lg:px-20 overflow-hidden"
    >
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: elegantEase }}
          className="mb-10 flex items-center gap-4"
        >
          <motion.span 
            initial={{ width: 0 }}
            whileInView={{ width: 40 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: elegantEase, delay: 0.2 }}
            className="h-px bg-[#68d32f]" 
          />

          <span className="text-sm tracking-[0.3em] text-[#68d32f]">
            GLOBAL IMPACT
          </span>
        </motion.div>

        <div className="grid grid-cols-2 relative md:grid-cols-4">
          {/* Animated top line */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: elegantEase }}
            className="absolute top-0 left-0 right-0 h-px bg-white/10 origin-left"
          />

          {[
            { num: 1200, suffix: "+", label: "Members" },
            { num: 25, suffix: "+", label: "Institutions" },
            { num: 40, suffix: "+", label: "Countries" },
            { num: 100, suffix: "+", label: "Projects" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: elegantEase }}
              className="border-b border-white/10 px-4 py-10 md:border-b-0 md:border-r md:px-8 md:py-12 last:border-r-0 relative"
            >
              <div className="text-4xl font-medium tracking-tight md:text-6xl flex">
                <AnimatedCounter value={item.num} suffix={item.suffix} />
              </div>

              <div className="mt-3 text-sm text-white/40 md:text-base">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}