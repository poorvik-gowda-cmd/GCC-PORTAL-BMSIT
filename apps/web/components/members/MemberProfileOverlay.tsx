"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Member } from "@/data/members";
import {
  elegantEase,
  PROFILE_TIMELINE,
  PORTRAIT_PARALLAX,
  BACKGROUND_PARALLAX,
} from "./constants";
import AnimePortrait from "./AnimePortrait";
import MemberProfileTransition, {
  useProfileItemVariants,
} from "./MemberProfileTransition";

interface MemberProfileOverlayProps {
  member: Member;
  onClose: () => void;
}

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  twitter: "X",
  github: "GitHub",
};

export default function MemberProfileOverlay({
  member,
  onClose,
}: MemberProfileOverlayProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    setIsMobile(window.innerWidth < 1024);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", onMotionChange);

    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);

    return () => {
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const itemVariants = useProfileItemVariants(prefersReducedMotion);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(onClose, prefersReducedMotion ? 200 : 550);
  }, [isClosing, onClose, prefersReducedMotion]);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!overlayRef.current || prefersReducedMotion || isMobile) return;
      const rect = overlayRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePos({ x, y });
    },
    [prefersReducedMotion, isMobile]
  );

  const portraitParallaxX = mousePos.x * PORTRAIT_PARALLAX;
  const portraitParallaxY = mousePos.y * (PORTRAIT_PARALLAX * 0.8);
  const bgParallaxX = mousePos.x * BACKGROUND_PARALLAX;
  const bgParallaxY = mousePos.y * BACKGROUND_PARALLAX;

  const socialEntries = member.social
    ? Object.entries(member.social).filter(([, url]) => url)
    : [];

  return (
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center profile-overlay"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: elegantEase }}
    >
      {/* Dark cinematic backdrop */}
      <motion.div
        className="absolute inset-0 bg-[#030405]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0.15 : 0.45,
          delay: prefersReducedMotion ? 0 : PROFILE_TIMELINE.bgDarken,
          ease: elegantEase,
        }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Atmospheric green glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none profile-atmosphere"
        style={{ x: bgParallaxX, y: bgParallaxY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.8,
          delay: PROFILE_TIMELINE.bgDarken,
          ease: elegantEase,
        }}
        aria-hidden="true"
      />

      {/* Faint geometric lines */}
      <div
        className="absolute inset-0 pointer-events-none profile-geometry"
        aria-hidden="true"
      />

      {/* Film grain */}
      <div className="absolute inset-0 pointer-events-none profile-grain" aria-hidden="true" />

      {/* Close button */}
      <motion.button
        onClick={handleClose}
        className="absolute top-6 right-6 z-[110] flex items-center justify-center w-12 h-12 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-[#5eea19]/40 hover:shadow-[0_0_16px_rgba(94,234,25,0.15)] transition-all duration-300"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ delay: 0.5, duration: 0.4, ease: elegantEase }}
        aria-label="Close profile"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 2L14 14M14 2L2 14" />
        </svg>
      </motion.button>

      {/* Main content */}
      <motion.div
        className="relative z-[105] w-full max-w-[1400px] mx-auto px-6 md:px-10 h-full flex items-center"
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name} profile`}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : 0.55,
          delay: prefersReducedMotion ? 0 : PROFILE_TIMELINE.cardExpand,
          ease: elegantEase,
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full max-h-[90vh] overflow-y-auto lg:overflow-visible py-20 lg:py-0">
          {/* Left — Portrait with anime transformation */}
          <div className="relative flex items-center justify-center">
            <AnimePortrait
              member={member}
              isOpen={!isClosing}
              isClosing={isClosing}
              parallaxX={portraitParallaxX}
              parallaxY={portraitParallaxY}
              prefersReducedMotion={prefersReducedMotion}
            />

            {/* Decorative corner accents */}
            <motion.div
              className="absolute -top-3 -left-3 w-14 h-14 border-t border-l border-[#68d32f]/25 pointer-events-none"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ delay: 0.75, duration: 0.5, ease: elegantEase }}
            />
            <motion.div
              className="absolute -bottom-3 -right-3 w-14 h-14 border-b border-r border-[#68d32f]/25 pointer-events-none"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ delay: 0.85, duration: 0.5, ease: elegantEase }}
            />
          </div>

          {/* Right — Member info */}
          <MemberProfileTransition
            isClosing={isClosing}
            prefersReducedMotion={prefersReducedMotion}
          >
            <div className="flex flex-col justify-center">
              <motion.p
                variants={itemVariants.eyebrow}
                className="text-xs font-medium uppercase tracking-[0.3em] text-[#68d32f] mb-4"
              >
                GCC Member
              </motion.p>

              <motion.h2
                variants={itemVariants.name}
                className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[0.95] tracking-[-0.03em] mb-4"
              >
                {member.name}
              </motion.h2>

              <motion.p
                variants={itemVariants.role}
                className="text-lg md:text-xl text-white/60 font-light mb-2"
              >
                {member.role}
              </motion.p>

              <motion.p
                variants={itemVariants.department}
                className="text-sm text-white/40 uppercase tracking-[0.15em] mb-8"
              >
                {member.department}
              </motion.p>

              <motion.div
                variants={itemVariants.bio}
                className="w-12 h-px bg-[#68d32f]/40 mb-8"
              />

              <motion.p
                variants={itemVariants.bio}
                className="text-base md:text-lg leading-8 text-white/55 max-w-lg mb-10"
              >
                {member.bio}
              </motion.p>

              {/* Metadata */}
              <motion.div
                variants={itemVariants.metadata}
                className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 border-t border-white/10 pt-6"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">
                    Department
                  </p>
                  <p className="text-sm text-white/80">{member.department}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">
                    Role
                  </p>
                  <p className="text-sm text-white/80">{member.role}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">
                    Team
                  </p>
                  <p className="text-sm text-white/80">{member.team}</p>
                </div>
              </motion.div>

              {/* Social links */}
              {socialEntries.length > 0 && (
                <motion.div
                  variants={itemVariants.social}
                  className="flex flex-wrap gap-4 mb-10"
                >
                  {socialEntries.map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase tracking-[0.15em] text-white/40 hover:text-[#5eea19] hover:translate-x-0.5 transition-all duration-300"
                    >
                      {SOCIAL_LABELS[key] ?? key}
                    </a>
                  ))}
                </motion.div>
              )}

              {/* Back button */}
              <motion.button
                variants={itemVariants.back}
                onClick={handleClose}
                className="group inline-flex items-center gap-3 text-sm text-white/50 hover:text-white hover:translate-x-0.5 transition-all duration-300 w-fit hover:drop-shadow-[0_0_8px_rgba(94,234,25,0.2)]"
              >
                <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
                Back to Members
              </motion.button>
            </div>
          </MemberProfileTransition>
        </div>
      </motion.div>
    </motion.div>
  );
}
