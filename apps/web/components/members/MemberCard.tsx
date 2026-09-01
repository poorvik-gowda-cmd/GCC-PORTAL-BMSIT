"use client";

import { motion, type MotionValue } from "framer-motion";
import type { Member } from "@/data/members";
import { elegantEase } from "./constants";
import { CardPortrait } from "./AnimePortrait";

interface MemberCardProps {
  member: Member;
  isHovered: boolean;
  isOtherHovered: boolean;
  isSelected: boolean;
  isProfileOpen: boolean;
  imageY: MotionValue<string>;
  onSelect: (member: Member) => void;
  onHover: (memberId: string | null) => void;
}

export default function MemberCard({
  member,
  isHovered,
  isOtherHovered,
  isSelected,
  isProfileOpen,
  imageY,
  onSelect,
  onHover,
}: MemberCardProps) {
  const handleSelect = () => {
    onSelect(member);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect();
    }
  };

  const isTransitioning = isSelected && isProfileOpen;

  return (
    <motion.article
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(member.id)}
      onBlur={() => onHover(null)}
      role="button"
      tabIndex={0}
      aria-label={`View profile for ${member.name}, ${member.role}`}
      aria-expanded={isSelected && isProfileOpen}
      animate={{
        scale: isSelected ? 1.025 : isProfileOpen ? 0.95 : isOtherHovered ? 0.97 : 1,
        opacity: isProfileOpen && !isSelected ? 0.22 : isOtherHovered ? 0.65 : 1,
        filter: isProfileOpen && !isSelected ? "blur(2px)" : "blur(0px)",
        y: isHovered && !isProfileOpen ? -6 : 0,
        borderColor: isSelected
          ? "rgba(94, 234, 25, 0.75)"
          : isHovered
            ? "rgba(255, 255, 255, 0.25)"
            : "rgba(255, 255, 255, 0.1)",
        boxShadow: isSelected
          ? "0 0 36px rgba(94, 234, 25, 0.28), 0 0 72px rgba(94, 234, 25, 0.1)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
      variants={{
        hidden: { opacity: 0, y: 60, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 1.2, ease: elegantEase },
        },
      }}
      transition={{ duration: 0.5, ease: elegantEase }}
      className="group relative z-10 overflow-hidden rounded-2xl border bg-[#080b09] cursor-pointer outline-none pointer-events-auto focus-visible:ring-2 focus-visible:ring-[#5eea19]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050608]"
    >
      {/* Photo — full clickable area */}
      <div className="relative h-[420px] overflow-hidden bg-[#101310] pointer-events-none">
        <CardPortrait
          member={member}
          imageY={imageY}
          isHovered={isHovered}
          isTransitioning={isTransitioning}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#050605] via-transparent to-transparent" />
      </div>

      {/* Info */}
      <motion.div
        className="relative z-10 p-6 pointer-events-none"
        animate={{ y: isHovered && !isProfileOpen ? -3 : 0 }}
        transition={{ duration: 0.4, ease: elegantEase }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: elegantEase, delay: 0.2 }}
          className="mb-2 text-xs uppercase tracking-[0.2em] text-[#5eea19]"
        >
          GCC
        </motion.p>

        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: elegantEase, delay: 0.3 }}
          className="text-2xl font-medium text-white"
        >
          {member.name}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: elegantEase, delay: 0.4 }}
          className="mt-2 text-sm text-white/45"
        >
          {member.role}
        </motion.p>
      </motion.div>
    </motion.article>
  );
}
