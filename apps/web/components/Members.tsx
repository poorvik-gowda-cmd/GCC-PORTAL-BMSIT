"use client";

import { members, getMemberById } from "@/data/members";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  LayoutGroup,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import MemberCard from "./members/MemberCard";
import MemberProfileOverlay from "./members/MemberProfileOverlay";
import { elegantEase } from "./members/constants";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const textRevealVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: elegantEase,
    },
  },
};

export default function Members() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Preload anime images on mount for zero-latency instant transitions
  useEffect(() => {
    members.forEach((member) => {
      if (member.animePhoto) {
        const img = new window.Image();
        img.src = member.animePhoto;
      }
    });
  }, []);

  const selectedMember = selectedMemberId
    ? getMemberById(selectedMemberId)
    : null;

  const handleSelectMember = useCallback((memberId: string) => {
    setSelectedMemberId(memberId);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setSelectedMemberId(null);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <LayoutGroup id="members-layout">
      <section
        ref={sectionRef}
        id="members"
        className="relative isolate z-10 px-6 py-24 md:px-10 lg:px-20"
      >
        {/* Header */}
        <motion.div
          className="mb-16 grid gap-10 lg:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div>
            <motion.p
              variants={textRevealVariants}
              className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-[#5eea19]"
            >
              Members
            </motion.p>

            <h2 className="text-6xl font-bold uppercase leading-[0.85] tracking-[-0.05em] text-white md:text-7xl lg:text-8xl">
              <motion.span variants={textRevealVariants} className="block">
                Our
              </motion.span>
              <motion.span
                variants={textRevealVariants}
                className="block text-[#5eea19]"
              >
                Members.
              </motion.span>
            </h2>
          </div>

          <div className="flex items-end">
            <motion.p
              variants={textRevealVariants}
              className="max-w-xl text-base leading-8 text-white/55 md:text-lg"
            >
              Meet the students, leaders and creators building the Global
              Collaboration Cell and creating meaningful impact across borders.
            </motion.p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: elegantEase, delay: 0.3 }}
          className="relative z-20 mb-14 flex flex-wrap gap-3"
        >
          <button
            type="button"
            className="rounded-full bg-[#5eea19] px-7 py-4 text-sm font-medium text-black"
          >
            Executive Council
          </button>

          <button
            type="button"
            className="rounded-full border border-white/15 px-7 py-4 text-sm text-white/80 transition hover:border-[#5eea19]"
          >
            Department Leads
          </button>

          <button
            type="button"
            className="rounded-full border border-white/15 px-7 py-4 text-sm text-white/80 transition hover:border-[#5eea19]"
          >
            All Members
          </button>
        </motion.div>

        {/* Members Grid */}
        <motion.div
          className="relative z-20 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {members.map((member) => {
            const isHovered = hoveredMemberId === member.id;
            const isOtherHovered =
              hoveredMemberId !== null && hoveredMemberId !== member.id;
            const isSelected = selectedMemberId === member.id;
            const isProfileOpen = selectedMemberId !== null;

            return (
              <MemberCard
                key={member.id}
                member={member}
                isHovered={isHovered}
                isOtherHovered={isOtherHovered}
                isSelected={isSelected}
                isProfileOpen={isProfileOpen}
                imageY={imageY}
                onSelect={(selected) => handleSelectMember(selected.id)}
                onHover={setHoveredMemberId}
              />
            );
          })}
        </motion.div>
      </section>

      {/* Cinematic profile overlay */}
      <AnimatePresence>
        {selectedMember && (
          <MemberProfileOverlay
            key={selectedMember.id}
            member={selectedMember}
            onClose={handleCloseProfile}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
