"use client";

import {
  GCC_PRESIDENT,
  EXECUTIVE_COUNCIL_MEMBERS,
  GCC_DEPARTMENTS,
  buildHierarchyMemberMap,
  toMember,
} from "@/data/gccHierarchy";
import type { Member } from "@/data/members";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  LayoutGroup,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MemberCard from "./members/MemberCard";
import MemberProfileOverlay from "./members/MemberProfileOverlay";
import { elegantEase } from "./members/constants";
import { Award, ShieldCheck } from "lucide-react";

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

// ─── Hierarchy card grid using the real MemberCard ───────────────────────────
function HierarchyGrid({
  members: cardMembers,
  hoveredId,
  selectedId,
  isProfileOpen,
  imageY,
  onSelect,
  onHover,
  cols = "xl:grid-cols-4",
}: {
  members: Member[];
  hoveredId: string | null;
  selectedId: string | null;
  isProfileOpen: boolean;
  imageY: MotionValue<string>;
  onSelect: (m: Member) => void;
  onHover: (id: string | null) => void;
  cols?: string;
}) {
  return (
    <motion.div
      className={`relative z-20 grid grid-cols-1 gap-5 md:grid-cols-2 ${cols}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={containerVariants}
    >
      {cardMembers.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          isHovered={hoveredId === member.id}
          isOtherHovered={hoveredId !== null && hoveredId !== member.id}
          isSelected={selectedId === member.id}
          isProfileOpen={isProfileOpen}
          imageY={imageY}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </motion.div>
  );
}

// ─── Department tab content ───────────────────────────────────────────────────
function DepartmentSection({
  dept,
  hoveredId,
  selectedId,
  isProfileOpen,
  imageY,
  onSelect,
  onHover,
}: {
  dept: (typeof GCC_DEPARTMENTS)[0];
  hoveredId: string | null;
  selectedId: string | null;
  isProfileOpen: boolean;
  imageY: MotionValue<string>;
  onSelect: (m: Member) => void;
  onHover: (id: string | null) => void;
}) {
  const leadMember = dept.lead
    ? toMember(dept.lead, dept.name, dept.name, dept.clubName)
    : null;
  const deptMembers = dept.members.map((m) =>
    toMember(m, dept.name, dept.name, dept.clubName)
  );

  return (
    <motion.div
      key={dept.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: elegantEase }}
      className="space-y-10"
    >
      {/* Dept header */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium uppercase tracking-[0.25em] text-[#5eea19]">
          {dept.clubName}
        </span>
        <h3 className="text-3xl font-bold uppercase leading-tight tracking-[-0.03em] text-white md:text-4xl">
          {dept.name}
        </h3>
        <div className="mt-1 h-[1px] w-14 bg-[#5eea19]/60" />
      </div>

      {/* Team Lead */}
      {leadMember && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-[#5eea19]" />
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Team Lead
            </p>
          </div>
          <HierarchyGrid
            members={[leadMember]}
            hoveredId={hoveredId}
            selectedId={selectedId}
            isProfileOpen={isProfileOpen}
            imageY={imageY}
            onSelect={onSelect}
            onHover={onHover}
            cols="xl:grid-cols-3"
          />
        </div>
      )}

      {/* Members */}
      {deptMembers.length > 0 && (
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/40">
            Department Members
          </p>
          <HierarchyGrid
            members={deptMembers}
            hoveredId={hoveredId}
            selectedId={selectedId}
            isProfileOpen={isProfileOpen}
            imageY={imageY}
            onSelect={onSelect}
            onHover={onHover}
            cols="xl:grid-cols-4"
          />
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

  // Build hierarchy member lookup once
  const hierarchyMap = useMemo(() => buildHierarchyMemberMap(), []);

  // Convert hierarchy members to Member shape for use with MemberCard
  const presidentMember = useMemo(
    () => toMember(GCC_PRESIDENT, "Executive Council", "Executive Council", "KAPPA ALPHA"),
    []
  );
  const ecMembers = useMemo(
    () =>
      EXECUTIVE_COUNCIL_MEMBERS.map((m) =>
        toMember(m, "Executive Council", "Executive Council", "KAPPA ALPHA")
      ),
    []
  );

  // Direct lookup from hierarchy members
  const findMemberById = useCallback(
    (id: string): Member | undefined => {
      return hierarchyMap.get(id);
    },
    [hierarchyMap]
  );

  // Preload anime images for zero-latency instant transitions
  useEffect(() => {
    hierarchyMap.forEach((member) => {
      if (member.animePhoto) {
        const img = new window.Image();
        img.src = member.animePhoto;
      }
    });
  }, [hierarchyMap]);

  const selectedMember = selectedMemberId
    ? findMemberById(selectedMemberId)
    : null;

  const handleSelectMember = useCallback((member: Member) => {
    setSelectedMemberId(member.id);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setSelectedMemberId(null);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  const isProfileOpen = selectedMemberId !== null;
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

        {/* ════════════════════════════════════════
            SECTION A — EXECUTIVE COUNCIL
        ════════════════════════════════════════ */}
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
          </motion.div>

          {/* President */}
          <motion.div variants={fadeUp}>
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5eea19]" />
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                President
              </p>
            </div>
            <HierarchyGrid
              members={[presidentMember]}
              hoveredId={hoveredMemberId}
              selectedId={selectedMemberId}
              isProfileOpen={isProfileOpen}
              imageY={imageY}
              onSelect={handleSelectMember}
              onHover={setHoveredMemberId}
              cols="xl:grid-cols-3"
            />
          </motion.div>

          {/* EC Members */}
          <motion.div variants={fadeUp}>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/40">
              Council Members
            </p>
            <HierarchyGrid
              members={ecMembers}
              hoveredId={hoveredMemberId}
              selectedId={selectedMemberId}
              isProfileOpen={isProfileOpen}
              imageY={imageY}
              onSelect={handleSelectMember}
              onHover={setHoveredMemberId}
              cols="xl:grid-cols-4"
            />
          </motion.div>
        </motion.div>

        {/* ════════════════════════════════════════
            SECTION B — DEPARTMENTS
        ════════════════════════════════════════ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
          className="mb-28 space-y-10"
        >
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
                      ? "text-black/55"
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
              <DepartmentSection
                key={activeDept.id}
                dept={activeDept}
                hoveredId={hoveredMemberId}
                selectedId={selectedMemberId}
                isProfileOpen={isProfileOpen}
                imageY={imageY}
                onSelect={handleSelectMember}
                onHover={setHoveredMemberId}
              />
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* Cinematic profile overlay — works for ALL cards now */}
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
