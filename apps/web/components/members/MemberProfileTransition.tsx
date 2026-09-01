"use client";

import { motion, type Variants } from "framer-motion";
import { elegantEase, PROFILE_TIMELINE } from "./constants";

interface MemberProfileTransitionProps {
  children: React.ReactNode;
  isClosing: boolean;
  prefersReducedMotion: boolean;
}

function buildContentVariants(prefersReducedMotion: boolean): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.06,
        delayChildren: prefersReducedMotion ? 0 : PROFILE_TIMELINE.nameReveal,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  };
}

function buildItemVariants(
  prefersReducedMotion: boolean,
  revealAt: number
): Variants {
  return {
    hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: elegantEase,
        delay: prefersReducedMotion
          ? 0
          : revealAt - PROFILE_TIMELINE.nameReveal,
      },
    },
    exit: {
      opacity: 0,
      y: -12,
      filter: "blur(4px)",
      transition: { duration: 0.25, ease: elegantEase },
    },
  };
}

export default function MemberProfileTransition({
  children,
  isClosing,
  prefersReducedMotion,
}: MemberProfileTransitionProps) {
  return (
    <motion.div
      variants={buildContentVariants(prefersReducedMotion)}
      initial="hidden"
      animate={isClosing ? "exit" : "visible"}
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

export function useProfileItemVariants(prefersReducedMotion: boolean) {
  return {
    eyebrow: buildItemVariants(prefersReducedMotion, PROFILE_TIMELINE.nameReveal),
    name: buildItemVariants(prefersReducedMotion, PROFILE_TIMELINE.nameReveal),
    role: buildItemVariants(prefersReducedMotion, PROFILE_TIMELINE.roleReveal),
    department: buildItemVariants(
      prefersReducedMotion,
      PROFILE_TIMELINE.roleReveal
    ),
    bio: buildItemVariants(prefersReducedMotion, PROFILE_TIMELINE.bioReveal),
    metadata: buildItemVariants(
      prefersReducedMotion,
      PROFILE_TIMELINE.bioReveal
    ),
    back: buildItemVariants(prefersReducedMotion, PROFILE_TIMELINE.bioReveal),
    social: buildItemVariants(prefersReducedMotion, PROFILE_TIMELINE.bioReveal),
  };
}
