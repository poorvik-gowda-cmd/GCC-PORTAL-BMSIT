"use client";

import {
  GCC_PRESIDENT,
  EXECUTIVE_COUNCIL_MEMBERS,
  GCC_DEPARTMENTS,
  type HierarchyMember,
  type HierarchyDepartment,
} from "@/data/gccHierarchy";
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
import { ExternalLink, Award, ShieldCheck, ChevronRight } from "lucide-react";

// ─── Animation variants (unchanged from original) ───────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const textRevealVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: elegantEase },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: elegantEase },
  },
};

// ─── Hierarchy Member Card ────────────────────────────────────────────────────
function HierarchyCard({
  member,
  variant = "member",
  index = 0,
}: {
  member: HierarchyMember;
  variant?: "president" | "lead" | "member";
  index?: number;
}) {
  const isPresident = variant === "president";
  const isLead = variant === "lead";

  const initials = member.name
    .split("_")[0]
    .slice(0, 2)
    .toUpperCase();

  const isPlaceholder =
    member.name.endsWith("_NAME") ||
    member.name.endsWith("PLACEHOLDER") ||
    member.name === "PRESIDENT_NAME";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.0, ease: elegantEase, delay: index * 0.08 }}
      whileHover={{ y: -6, scale: 1.015 }}
      className={`group relative overflow-hidden rounded-2xl border bg-[#080b09] transition-all duration-500 ${
        isPresident
          ? "border-[#5eea19]/60 shadow-[0_0_48px_rgba(94,234,25,0.18),0_0_90px_rgba(94,234,25,0.06)]"
          : isLead
          ? "border-white/20 shadow-[0_0_24px_rgba(255,255,255,0.04)]"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      {/* Accent stripe */}
      {isPresident && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#5eea19] via-[#a3f45b] to-[#5eea19]" />
      )}
      {isLead && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-white/30 via-white/60 to-white/30" />
      )}

      {/* Photo / Avatar */}
      <div
        className={`relative overflow-hidden bg-[#101310] ${
          isPresident ? "h-[360px]" : isLead ? "h-[300px]" : "h-[260px]"
        }`}
      >
        {member.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo}
            alt={member.name}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          /* Initials placeholder — replaced when photo is added */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0d1a0d] to-[#050608]">
            <div
              className={`rounded-full flex items-center justify-center font-bold tracking-wider text-[#5eea19] border border-[#5eea19]/30 ${
                isPresident
                  ? "w-24 h-24 text-3xl"
                  : isLead
                  ? "w-20 h-20 text-2xl"
                  : "w-16 h-16 text-xl"
              }`}
            >
              {isPlaceholder ? "?" : initials}
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/20">
              Photo Coming Soon
            </p>
          </div>
        )}
        {/* Gradient fade to card body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050605] via-transparent to-transparent" />

        {/* Badge */}
        <div className="absolute top-4 left-4">
          {isPresident ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[#5eea19] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
              <ShieldCheck className="w-3 h-3" /> President
            </span>
          ) : isLead ? (
            <span className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
              <Award className="w-3 h-3 text-[#5eea19]" /> Team Lead
            </span>
          ) : null}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="mb-1.5 text-[10px] uppercase tracking-[0.22em] text-[#5eea19]">
          GCC
        </p>
        <h3
          className={`font-semibold text-white leading-tight ${
            isPresident ? "text-2xl" : isLead ? "text-xl" : "text-lg"
          }`}
        >
          {isPlaceholder ? (
            <span className="text-white/25 italic">Name Placeholder</span>
          ) : (
            member.name
          )}
        </h3>
        <p className="mt-1.5 text-sm text-white/45">{member.role}</p>

        {member.intro && !member.intro.endsWith("PLACEHOLDER") && (
          <p className="mt-3 text-xs leading-6 text-white/35 line-clamp-3">
            {member.intro}
          </p>
        )}

        {/* Social */}
        {(member.social?.linkedin || member.social?.instagram) && (
          <div className="mt-4 flex gap-3">
            {member.social.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-white/30 hover:text-[#5eea19] transition-colors"
                aria-label="LinkedIn"
              >
                <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
              </a>
            )}
            {member.social.instagram && (
              <a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-white/30 hover:text-[#5eea19] transition-colors"
                aria-label="Instagram"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Instagram
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Department Section ───────────────────────────────────────────────────────
function DepartmentSection({ dept }: { dept: HierarchyDepartment }) {
  return (
    <motion.div
      key={dept.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: elegantEase }}
      className="space-y-10"
    >
      {/* Dept header */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium uppercase tracking-[0.25em] text-[#5eea19]">
          {dept.clubName}
        </span>
        <h3 className="text-3xl font-bold uppercase leading-tight tracking-[-0.03em] text-white md:text-4xl">
          {dept.name}
        </h3>
        <div className="mt-1 h-[1px] w-16 bg-[#5eea19]/60" />
      </div>

      {/* Team Lead */}
      <div>
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/30">
          Department Lead
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <HierarchyCard member={dept.lead} variant="lead" index={0} />
        </div>
      </div>

      {/* Members */}
      {dept.members.length > 0 && (
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/30">
            Department Members
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {dept.members.map((m, i) => (
              <HierarchyCard key={m.id} member={m} variant="member" index={i} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Members Component ───────────────────────────────────────────────────
export default function Members() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeDeptId, setActiveDeptId] = useState<string>(GCC_DEPARTMENTS[0].id);

  // Preload anime images for zero-latency transitions (unchanged)
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

  const activeDept = GCC_DEPARTMENTS.find((d) => d.id === activeDeptId)!;

  return (
    <LayoutGroup id="members-layout">
      <section
        ref={sectionRef}
        id="members"
        className="relative isolate z-10 px-6 py-24 md:px-10 lg:px-20"
      >
        {/* ── Hero Header (unchanged from original) ── */}
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

        {/* ════════════════════════════════════════════════
            SECTION A — EXECUTIVE COUNCIL / KAPPA ALPHA
        ════════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          className="mb-28 space-y-12"
        >
          {/* EC heading */}
          <motion.div variants={fadeUp} className="space-y-2">
            <span className="text-sm font-medium uppercase tracking-[0.25em] text-[#5eea19]">
              KAPPA ALPHA
            </span>
            <h2 className="text-4xl font-bold uppercase leading-tight tracking-[-0.04em] text-white md:text-5xl">
              Executive Council
            </h2>
            {/* Hierarchy flow indicator */}
            <div className="mt-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/25">
              <span className="px-2 py-1 rounded border border-[#5eea19]/30 text-[#5eea19]/70">President</span>
              <ChevronRight className="w-3 h-3" />
              <span className="px-2 py-1 rounded border border-white/15">Executive Council</span>
              <ChevronRight className="w-3 h-3" />
              <span className="px-2 py-1 rounded border border-white/15">Departments</span>
            </div>
          </motion.div>

          {/* President — full-width prominent card */}
          <motion.div variants={fadeUp}>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/30">
              President
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <HierarchyCard
                member={GCC_PRESIDENT}
                variant="president"
                index={0}
              />
            </div>
          </motion.div>

          {/* EC Members */}
          <motion.div variants={fadeUp}>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/30">
              Council Members
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
              {EXECUTIVE_COUNCIL_MEMBERS.map((m, i) => (
                <HierarchyCard
                  key={m.id}
                  member={m}
                  variant="member"
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            SECTION B — DEPARTMENTS
        ════════════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
          className="space-y-10"
        >
          {/* Section heading */}
          <motion.div variants={fadeUp} className="space-y-2">
            <span className="text-sm font-medium uppercase tracking-[0.25em] text-[#5eea19]">
              Departments
            </span>
            <h2 className="text-4xl font-bold uppercase leading-tight tracking-[-0.04em] text-white md:text-5xl">
              Our Teams.
            </h2>
          </motion.div>

          {/* Department Tab Pills */}
          <motion.div
            variants={fadeUp}
            className="relative z-20 flex flex-wrap gap-3"
          >
            {GCC_DEPARTMENTS.map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => setActiveDeptId(dept.id)}
                className={`group flex flex-col items-start rounded-2xl px-5 py-3.5 text-left transition-all duration-300 ${
                  activeDeptId === dept.id
                    ? "bg-[#5eea19] text-black shadow-[0_0_24px_rgba(94,234,25,0.35)]"
                    : "border border-white/15 text-white/70 hover:border-[#5eea19]/60 hover:text-white"
                }`}
              >
                <span className="text-sm font-semibold leading-tight">
                  {dept.name}
                </span>
                <span
                  className={`mt-0.5 text-[10px] uppercase tracking-[0.2em] font-medium ${
                    activeDeptId === dept.id
                      ? "text-black/60"
                      : "text-white/30 group-hover:text-[#5eea19]/70"
                  }`}
                >
                  {dept.clubName}
                </span>
              </button>
            ))}
          </motion.div>

          {/* Active Department Content */}
          <div className="relative z-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              <DepartmentSection key={activeDept.id} dept={activeDept} />
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════
            SECTION C — EXISTING MEMBERS GRID (unchanged)
            The original members[] array cards are preserved
            below, so existing data/cards are not removed.
        ════════════════════════════════════════════════ */}
        <motion.div
          className="mt-28 space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={fadeUp}>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-[#5eea19]">
              All Members
            </p>
            <h2 className="text-3xl font-bold uppercase leading-tight tracking-[-0.03em] text-white">
              The Full Team.
            </h2>
          </motion.div>

          <motion.div
            className="relative z-20 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
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
        </motion.div>
      </section>

      {/* Cinematic profile overlay (unchanged) */}
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
