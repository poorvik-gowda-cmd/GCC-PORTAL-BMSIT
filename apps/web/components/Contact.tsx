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
            Get in touch
          </span>

          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: elegantEase, delay: 0.2 }}
            className="h-px flex-1 bg-white/10 origin-left" 
          />
        </motion.div>

        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left */}
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
              Have an idea, collaboration proposal or opportunity?
              Connect with the Global Collaboration Cell and let's
              create something meaningful together.
            </motion.p>

            <motion.div variants={textReveal} className="mt-14 space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Email
                </p>
                <p className="mt-2 text-xl text-white/80">
                  gcc@bsmit.in
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Location
                </p>
                <p className="mt-2 text-xl text-white/80">
                  BMS Institute of Technology and Management
                  <br />Bengaluru, Karnataka
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.4, ease: elegantEase }}
            className="rounded-3xl border border-white/5 bg-[#0a0c0a] p-8 md:p-12 shadow-2xl"
          >
            <div className="grid gap-8 md:grid-cols-2">

              <div>
                <label className="mb-3 block text-[11px] uppercase tracking-wider text-white/40">
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/20 focus:border-[#68d32f] transition-colors"
                />
              </div>

              <div>
                <label className="mb-3 block text-[11px] uppercase tracking-wider text-white/40">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/20 focus:border-[#68d32f] transition-colors"
                />
              </div>

            </div>

            <div className="mt-10">
              <label className="mb-3 block text-[11px] uppercase tracking-wider text-white/40">
                Subject
              </label>

              <input
                type="text"
                placeholder="How can we collaborate?"
                className="w-full border-b border-white/10 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/20 focus:border-[#68d32f] transition-colors"
              />
            </div>

            <div className="mt-10">
              <label className="mb-3 block text-[11px] uppercase tracking-wider text-white/40">
                Message
              </label>

              <textarea
                rows={5}
                placeholder="Tell us about your idea..."
                className="w-full resize-none border-b border-white/10 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/20 focus:border-[#68d32f] transition-colors"
              />
            </div>

            <button
              type="submit"
              data-cursor="BUTTON"
              className="mt-12 flex items-center gap-8 rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.03] hover:bg-[#68d32f]"
            >
              Send Message
              <span className="text-lg">→</span>
            </button>
          </motion.form>
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
            Global Collaboration Cell · BSMIT
          </p>
        </motion.div>

      </div>
    </section>
  );
}