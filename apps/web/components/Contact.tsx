"use client";

import { motion } from "framer-motion";

const elegantEase = [0.16, 1, 0.3, 1] as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const textReveal = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: elegantEase } 
  }
};

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-black px-6 py-32 text-white md:px-12 lg:px-20 min-h-screen flex items-center"
    >
      <div className="pointer-events-none absolute right-[-200px] top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#68d32f]/5 blur-[180px]" />

      <div className="relative mx-auto w-full max-w-[1400px]">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: elegantEase }}
          className="mb-10 flex items-center gap-4"
        >
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#68d32f]">
            Get in touch & Follow Us
          </span>

          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: elegantEase, delay: 0.2 }}
            className="h-px flex-1 bg-white/10 origin-left" 
          />
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2 items-center">

          {/* Left info column */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-[clamp(3.5rem,6vw,7rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">
              <motion.span variants={textReveal} className="block text-white/50">Let's</motion.span>
              <motion.span variants={textReveal} className="block text-[#68d32f]">Connect.</motion.span>
            </h2>

            <motion.p 
              variants={textReveal}
              className="mt-10 max-w-lg text-lg leading-8 text-white/50"
            >
              Have an idea, collaboration proposal, or research opportunity?
              Follow our official channels or reach out directly to the Global Collaboration Cell.
            </motion.p>

            <motion.div variants={textReveal} className="mt-12 space-y-6">
              <a
                href="mailto:gccresearchandoperations@gmail.com"
                className="group/mail block p-6 rounded-2xl border border-white/10 bg-[#0a0c0a] hover:border-[#68d32f]/60 hover:bg-white/[0.04] transition-all"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#68d32f]">
                  Official Email
                </p>
                <p className="mt-2 text-base sm:text-lg md:text-xl font-semibold text-white group-hover/mail:text-[#68d32f] transition-colors break-all flex items-center justify-between">
                  <span>gccresearchandoperations@gmail.com</span>
                  <span className="text-xs text-[#68d32f] opacity-0 group-hover/mail:opacity-100 transition-opacity ml-2">↗</span>
                </p>
              </a>

              <div className="p-6 rounded-2xl border border-white/10 bg-[#0a0c0a]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#68d32f]">
                  Campus Location
                </p>
                <p className="mt-2 text-lg text-white/90">
                  BMS Institute of Technology and Management
                </p>
                <p className="mt-1 text-xs text-white/50">
                  Avalahalli, Yelahanka, Bengaluru, Karnataka 560064
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column: 2 Large Prominent Social Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.3, ease: elegantEase }}
            className="space-y-6"
          >
            {/* Instagram Large Card */}
            <a
              href="https://www.instagram.com/gcc_bms?igsi=NTB2NnZmYTc1eXdh"
              target="_blank"
              rel="noreferrer"
              className="group block rounded-3xl border border-white/10 bg-[#0a0c0a] p-8 md:p-10 shadow-2xl transition-all duration-500 hover:border-[#68d32f]/60 hover:bg-[#0f140f] hover:shadow-[0_0_50px_rgba(104,211,47,0.15)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-2xl shadow-lg">
                  📸
                </div>
                <span className="text-2xl text-white/30 group-hover:text-[#68d32f] group-hover:translate-x-2 transition-all">
                  →
                </span>
              </div>

              <div className="mt-8">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#68d32f] font-semibold">
                  INSTAGRAM COMMUNITY
                </span>
                <h3 className="mt-2 text-3xl font-bold text-white group-hover:text-[#68d32f] transition-colors">
                  @gcc_bms
                </h3>
                <p className="mt-3 text-sm text-white/60 leading-relaxed">
                  Follow us for event announcements, recap reels, campus workshops, and international student highlights.
                </p>
              </div>
            </a>

            {/* LinkedIn Large Card */}
            <a
              href="https://www.linkedin.com/company/global-collaboration-cell-bmsit-m/"
              target="_blank"
              rel="noreferrer"
              className="group block rounded-3xl border border-white/10 bg-[#0a0c0a] p-8 md:p-10 shadow-2xl transition-all duration-500 hover:border-[#68d32f]/60 hover:bg-[#0f140f] hover:shadow-[0_0_50px_rgba(104,211,47,0.15)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0077b5] text-white font-bold text-2xl shadow-lg">
                  in
                </div>
                <span className="text-2xl text-white/30 group-hover:text-[#68d32f] group-hover:translate-x-2 transition-all">
                  →
                </span>
              </div>

              <div className="mt-8">
                <span className="text-[10px] uppercase tracking-[0.25em] text-blue-400 font-semibold">
                  LINKEDIN PROFESSIONAL NETWORK
                </span>
                <h3 className="mt-2 text-2xl font-bold text-white group-hover:text-[#68d32f] transition-colors">
                  GCC BMSIT&M
                </h3>
                <p className="mt-3 text-sm text-white/60 leading-relaxed">
                  Connect with our official institutional network for research partnerships, global university MoUs, and career opportunities.
                </p>
              </div>
            </a>
          </motion.div>

        </div>

        {/* Bottom */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 border-t border-white/5 pt-8"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Global Collaboration Cell · BMSIT&M
          </p>
        </motion.div>

      </div>
    </section>
  );
}