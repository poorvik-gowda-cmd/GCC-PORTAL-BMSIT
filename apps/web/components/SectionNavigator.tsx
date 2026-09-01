"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const sections = [
  { id: "hero", label: "01 HOME" },
  { id: "about", label: "02 ABOUT" },
  { id: "events", label: "03 EVENTS" },
  { id: "opportunities", label: "04 OPPORTUNITIES" },
  { id: "collaborations", label: "05 COLLABORATIONS" },
  { id: "members", label: "06 MEMBERS" },
  { id: "contact", label: "07 CONTACT" },
];

export default function SectionNavigator() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the intersecting entry with the highest intersection ratio
        let maxRatio = 0;
        let activeId = activeSection;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            activeId = entry.target.id;
          }
        });
        
        if (activeId !== activeSection) {
          setActiveSection(activeId);
        }
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [activeSection]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed right-10 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-4 xl:flex mix-blend-difference pointer-events-auto">
      {sections.map(({ id, label }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="group relative flex items-center justify-end text-[10px] font-medium tracking-[0.2em]"
            aria-label={`Scroll to ${label}`}
            data-cursor="GO"
          >
            <span
              className={`mr-4 transition-colors duration-500 ${
                isActive ? "text-[#5eea19]" : "text-white/30 group-hover:text-white/70"
              }`}
            >
              {label}
            </span>
            <div className="relative h-[1px] w-6 overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="absolute inset-y-0 right-0 bg-[#5eea19]"
                initial={false}
                animate={{
                  width: isActive ? "100%" : "0%",
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
