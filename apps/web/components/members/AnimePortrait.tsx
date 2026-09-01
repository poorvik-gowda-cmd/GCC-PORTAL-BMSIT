"use client";

import Image from "next/image";
import { motion, type MotionValue } from "framer-motion";
import type { Member } from "@/data/members";
import { memberPortraitLayoutId } from "@/data/members";
import { elegantEase } from "./constants";
import MemberTransition from "./MemberTransition";

interface AnimePortraitProps {
  member: Member;
  isOpen: boolean;
  isClosing: boolean;
  parallaxX: number;
  parallaxY: number;
  prefersReducedMotion: boolean;
  onTransformationComplete?: () => void;
}

export default function AnimePortrait({
  member,
  isOpen,
  isClosing,
  parallaxX,
  parallaxY,
  prefersReducedMotion,
  onTransformationComplete,
}: AnimePortraitProps) {
  return (
    <motion.div
      className="relative w-full max-w-[480px] aspect-[3/4] rounded-2xl overflow-hidden bg-[#080b09] shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/10"
      layoutId={memberPortraitLayoutId(member.id)}
      transition={{
        duration: prefersReducedMotion ? 0.2 : 0.75,
        ease: elegantEase,
      }}
    >
      <MemberTransition
        member={member}
        isOpen={isOpen}
        isClosing={isClosing}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        prefersReducedMotion={prefersReducedMotion}
        onTransformationComplete={onTransformationComplete}
      />
    </motion.div>
  );
}

/** Card-only portrait wrapper */
export function CardPortrait({
  member,
  imageY,
  isHovered,
  isTransitioning,
}: {
  member: Member;
  imageY: MotionValue<string>;
  isHovered: boolean;
  isTransitioning: boolean;
}) {
  return (
    <motion.div
      className="absolute inset-0 h-[110%] w-full -top-[5%]"
      layoutId={memberPortraitLayoutId(member.id)}
      initial={{ scale: 1.1, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      animate={{
        scale: isHovered ? 1.03 : 1,
        opacity: isTransitioning ? 0 : 1,
      }}
      transition={{ duration: 0.6, ease: elegantEase }}
      style={{ y: imageY }}
    >
      <Image
        src={member.photo}
        alt={member.name}
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
      />
    </motion.div>
  );
}
export { default as MemberTransition } from "./MemberTransition";

