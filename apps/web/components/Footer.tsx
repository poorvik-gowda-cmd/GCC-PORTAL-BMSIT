"use client";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050608] px-6 py-12 text-white md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1400px]">

        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">

          {/* Brand */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#68d32f]">
              Global Collaboration Cell
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              GCC<span className="text-[#68d32f]">.</span>
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/40">
              Connecting ambitious students with global opportunities,
              collaborations and real-world impact.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/50">
            <a href="#about" className="transition hover:text-white">
              About
            </a>

            <a href="#opportunities" className="transition hover:text-white">
              Opportunities
            </a>

            <a href="#events" className="transition hover:text-white">
              Events
            </a>

            <a href="#members" className="transition hover:text-white">
              Members
            </a>

            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/30 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Global Collaboration Cell. All
            rights reserved.
          </p>

          <p>
            BSMIT · Global Connections. Local Impact.
          </p>
        </div>

      </div>
    </footer>
  );
}