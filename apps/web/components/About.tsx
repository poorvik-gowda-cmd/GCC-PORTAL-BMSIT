"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section
      id="about"
      className="relative min-h-screen overflow-hidden bg-[#050608] px-6 py-24 text-white md:px-12 lg:px-20"
    >
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Green glow */}
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#68d32f]/10 blur-[150px]" />

      <div className="relative mx-auto max-w-[1400px]">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-8 flex items-center gap-4"
        >
          <span className="h-px w-10 bg-[#68d32f]" />
          <span className="text-sm font-medium tracking-[0.3em] text-[#68d32f]">
            ABOUT GCC
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h2
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl text-[clamp(2.8rem,6vw,6rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
        >
          CONNECTING
          <br />
          <span className="text-[#68d32f]">MINDS.</span>
          <br />
          CREATING
          <br />
          <span className="text-[#68d32f]">IMPACT.</span>
        </motion.h2>

        {/* Content */}
        <div className="mt-20 grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p className="max-w-xl text-xl leading-8 text-white/65 md:text-2xl">
              The Global Collaboration Cell at BSMIT creates a bridge between
              ambitious students and the world.
            </p>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/45 md:text-lg">
              We bring together students, institutions, researchers and
              organizations to create meaningful international collaborations,
              discover opportunities and turn ideas into real-world impact.
            </p>

            <div className="mt-10">
              <a
                href="#collaborations"
                className="group inline-flex items-center gap-5 rounded-full border border-white/25 px-7 py-4 text-sm transition-all duration-300 hover:border-[#68d32f] hover:bg-[#68d32f] hover:text-black"
              >
                Discover GCC
                <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </motion.div>

          {/* Right - Principles */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="space-y-0"
          >
            {[
              {
                number: "01",
                title: "GLOBAL CONNECTIONS",
                text: "Building meaningful connections beyond borders.",
              },
              {
                number: "02",
                title: "STUDENT OPPORTUNITIES",
                text: "Opening pathways to international learning and growth.",
              },
              {
                number: "03",
                title: "REAL-WORLD IMPACT",
                text: "Turning collaboration into projects that matter.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="group border-t border-white/10 py-8 transition-colors duration-300 hover:border-[#68d32f]"
              >
                <div className="flex gap-7">
                  <span className="pt-1 font-mono text-xs text-[#68d32f]">
                    {item.number}
                  </span>

                  <div>
                    <h3 className="text-lg font-medium tracking-wide md:text-xl">
                      {item.title}
                    </h3>

                    <p className="mt-3 max-w-md text-sm leading-6 text-white/40 md:text-base">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom statement */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 border-t border-white/10 pt-8"
        >
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <p className="text-xs uppercase tracking-[0.25em] text-white/35">
              GLOBAL COLLABORATION CELL · BSMIT
            </p>

            <p className="text-sm text-white/30">
              Connecting locally. Thinking globally.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}