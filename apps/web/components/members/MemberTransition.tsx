"use client";

import { useEffect, useState, useId } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Member } from "@/data/members";
import { elegantEase } from "./constants";

export interface MemberTransitionProps {
  member: Member;
  isOpen: boolean;
  isClosing: boolean;
  prefersReducedMotion?: boolean;
  parallaxX?: number;
  parallaxY?: number;
  className?: string;
  onTransformationComplete?: () => void;
}

type TransformationStage = "photo" | "transforming" | "anime";

export default function MemberTransition({
  member,
  isOpen,
  isClosing,
  prefersReducedMotion = false,
  parallaxX = 0,
  parallaxY = 0,
  className = "",
  onTransformationComplete,
}: MemberTransitionProps) {
  const [stage, setStage] = useState<TransformationStage>("photo");
  const [displacementScale, setDisplacementScale] = useState(0);
  const filterId = useId().replace(/:/g, "-");
  const animeSrc = member.animePhoto ?? member.photo;
  const hasAnime = Boolean(member.animePhoto);

  useEffect(() => {
    if (!isOpen) {
      setStage("photo");
      setDisplacementScale(0);
      return;
    }

    if (isClosing) {
      // Smoothly reverse to original photo during close
      setStage("transforming");
      setDisplacementScale(prefersReducedMotion ? 0 : 8);

      const reverseTimer = setTimeout(() => {
        setStage("photo");
        setDisplacementScale(0);
      }, prefersReducedMotion ? 100 : 250);

      return () => clearTimeout(reverseTimer);
    }

    if (prefersReducedMotion) {
      setStage("anime");
      setDisplacementScale(0);
      onTransformationComplete?.();
      return;
    }

    // Forward transformation sequence (Total ~750ms)
    // 0ms: Real photo displayed as card expands
    // 180ms: Begin metamorphosis (displacement + light sweep + emergence)
    const t1 = setTimeout(() => {
      setStage("transforming");
      setDisplacementScale(14);
    }, 180);

    // 420ms: Displacement eases down as anime artwork crystallizes
    const t2 = setTimeout(() => {
      setDisplacementScale(5);
    }, 420);

    // 620ms: Metamorphosis completes, anime portrait locked in
    const t3 = setTimeout(() => {
      setStage("anime");
      setDisplacementScale(0);
      onTransformationComplete?.();
    }, 620);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, isClosing, prefersReducedMotion, onTransformationComplete, member.id]);

  const isTransforming = stage === "transforming";
  const isAnime = stage === "anime";

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{
        transform: prefersReducedMotion
          ? "none"
          : `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
        transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* SVG Displacement Filter for subtle futuristic metamorphosis distortion */}
      {!prefersReducedMotion && (
        <svg
          className="absolute w-0 h-0 pointer-events-none opacity-0"
          aria-hidden="true"
        >
          <defs>
            <filter
              id={`gcc-metamorph-${filterId}`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.04 0.08"
                numOctaves="2"
                result="warpNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="warpNoise"
                scale={displacementScale}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* 1. Base Layer: Real Photograph */}
      <motion.div
        className="absolute inset-0 z-10"
        animate={{
          opacity: isAnime && hasAnime ? 0 : 1,
          scale: isTransforming ? 1.03 : 1,
          filter: isTransforming
            ? "blur(4px) brightness(1.1) contrast(1.05)"
            : "blur(0px) brightness(1) contrast(1)",
        }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : isClosing ? 0.35 : 0.55,
          ease: elegantEase,
        }}
      >
        <Image
          src={member.photo}
          alt={member.name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover object-center"
        />
      </motion.div>

      {/* 2. Transform Layer: Anime Artwork Emergence */}
      <motion.div
        className="absolute inset-0 z-20"
        style={{
          filter:
            displacementScale > 0 && !prefersReducedMotion
              ? `url(#gcc-metamorph-${filterId})`
              : "none",
        }}
        animate={{
          opacity: isAnime ? 1 : isTransforming ? 0.75 : 0,
          scale: isTransforming ? 1.02 : 1,
          clipPath:
            prefersReducedMotion || isAnime
              ? "inset(0% 0% 0% 0%)"
              : isTransforming
                ? "inset(0% 0% 0% 0%)"
                : isClosing
                  ? "inset(100% 0% 0% 0%)"
                  : "inset(0% 0% 100% 0%)",
        }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : isClosing ? 0.4 : 0.6,
          ease: elegantEase,
        }}
      >
        <Image
          src={animeSrc}
          alt={`${member.name} illustrated portrait`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 480px"
          className={`object-cover object-center ${
            !hasAnime
              ? "filter contrast-125 saturate-120 hue-rotate-15 brightness-95"
              : ""
          }`}
        />
      </motion.div>

      {/* 3. Cinematic Light Sweep across transition moment */}
      <AnimatePresence>
        {isTransforming && !prefersReducedMotion && (
          <motion.div
            key="light-sweep"
            className="absolute inset-0 z-30 pointer-events-none"
            initial={{
              x: isClosing ? "120%" : "-120%",
              opacity: 0,
            }}
            animate={{
              x: isClosing ? "-120%" : "120%",
              opacity: [0, 0.85, 0.9, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: isClosing ? 0.35 : 0.5,
              ease: elegantEase,
            }}
            style={{
              background:
                "linear-gradient(110deg, transparent 15%, rgba(94, 234, 25, 0.0) 35%, rgba(94, 234, 25, 0.3) 46%, rgba(255, 255, 255, 0.75) 50%, rgba(255, 60, 60, 0.28) 54%, rgba(94, 234, 25, 0.15) 60%, transparent 80%)",
              mixBlendMode: "screen",
            }}
          />
        )}
      </AnimatePresence>

      {/* 4. Transient Micro-Grain & Subtle Ion Drift (only during metamorphosis) */}
      <AnimatePresence>
        {isTransforming && !prefersReducedMotion && (
          <motion.div
            key="transition-grain"
            className="absolute inset-0 z-30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.18, 0.08, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.48, ease: "easeOut" }}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.7'/%3E%3C/svg%3E\")",
              mixBlendMode: "overlay",
            }}
          />
        )}
      </AnimatePresence>

      {/* 5. GCC Futuristic Vignette & Neon Edge Treatment */}
      <div
        className="absolute inset-0 z-40 rounded-2xl pointer-events-none"
        style={{
          boxShadow:
            "inset -2px 0 20px rgba(94, 234, 25, 0.12), inset 0 0 70px rgba(3, 4, 5, 0.6)",
        }}
      />

      {/* Bottom atmospheric fade */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 z-40 bg-gradient-to-t from-[#030405] via-[#030405]/50 to-transparent pointer-events-none" />

      {/* Top subtle green flare */}
      <div className="absolute inset-x-0 top-0 h-1/4 z-40 bg-gradient-to-b from-[#5eea19]/[0.07] to-transparent pointer-events-none" />
    </div>
  );
}
