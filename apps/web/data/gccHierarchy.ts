// =============================================================
// GCC Public Website — Organizational Hierarchy Data
// apps/web/data/gccHierarchy.ts
//
// PURPOSE: Static data for the public Members page hierarchy.
// This is COMPLETELY SEPARATE from the member portal user system.
// DO NOT fetch from or connect to the portal DB/API.
//
// HOW TO ADD A REAL MEMBER:
//   1. Replace `name` with the actual name.
//   2. Replace `photo` null with the image path e.g. "/images/members/ec/name.png".
//   3. Replace `intro` with a short bio sentence.
//   4. Add social links if available.
// =============================================================

export interface HierarchyMember {
  id: string;
  name: string;
  role: string;
  photo: string | null;   // null → shows initials avatar until real photo added
  intro: string;
  social?: {
    linkedin?: string;
    instagram?: string;
  };
}

export interface HierarchyDepartment {
  id: string;
  name: string;
  clubName: string;       // Greek-letter club name shown as secondary branding
  lead: HierarchyMember;
  members: HierarchyMember[];
}

// ──────────────────────────────────────────────
// EXECUTIVE COUNCIL  |  Club: KAPPA ALPHA
// ──────────────────────────────────────────────

export const GCC_PRESIDENT: HierarchyMember = {
  id: "ec-president",
  name: "PRESIDENT_NAME",
  role: "President",
  photo: null,
  intro: "PRESIDENT_INTRO_PLACEHOLDER",
  social: {},
};

export const EXECUTIVE_COUNCIL_MEMBERS: HierarchyMember[] = [
  {
    id: "ec-member-1",
    name: "EC_MEMBER_1_NAME",
    role: "EC_MEMBER_1_ROLE",
    photo: null,
    intro: "EC_MEMBER_1_INTRO_PLACEHOLDER",
    social: {},
  },
  {
    id: "ec-member-2",
    name: "EC_MEMBER_2_NAME",
    role: "EC_MEMBER_2_ROLE",
    photo: null,
    intro: "EC_MEMBER_2_INTRO_PLACEHOLDER",
    social: {},
  },
  {
    id: "ec-member-3",
    name: "EC_MEMBER_3_NAME",
    role: "EC_MEMBER_3_ROLE",
    photo: null,
    intro: "EC_MEMBER_3_INTRO_PLACEHOLDER",
    social: {},
  },
  {
    id: "ec-member-4",
    name: "EC_MEMBER_4_NAME",
    role: "EC_MEMBER_4_ROLE",
    photo: null,
    intro: "EC_MEMBER_4_INTRO_PLACEHOLDER",
    social: {},
  },
  {
    id: "ec-member-5",
    name: "EC_MEMBER_5_NAME",
    role: "EC_MEMBER_5_ROLE",
    photo: null,
    intro: "EC_MEMBER_5_INTRO_PLACEHOLDER",
    social: {},
  },
];

// ──────────────────────────────────────────────
// DEPARTMENTS
// ──────────────────────────────────────────────

export const GCC_DEPARTMENTS: HierarchyDepartment[] = [
  // 1. RESEARCH & PUBLICATION  |  DELTA NU
  {
    id: "research",
    name: "Research & Publication",
    clubName: "DELTA NU",
    lead: {
      id: "research-lead",
      name: "RESEARCH_LEAD_NAME",
      role: "Research & Publication — Team Lead",
      photo: null,
      intro: "RESEARCH_LEAD_INTRO_PLACEHOLDER",
      social: {},
    },
    members: [
      {
        id: "research-member-1",
        name: "RESEARCH_MEMBER_1_NAME",
        role: "Research Associate",
        photo: null,
        intro: "RESEARCH_MEMBER_1_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "research-member-2",
        name: "RESEARCH_MEMBER_2_NAME",
        role: "Research Associate",
        photo: null,
        intro: "RESEARCH_MEMBER_2_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "research-member-3",
        name: "RESEARCH_MEMBER_3_NAME",
        role: "Research Associate",
        photo: null,
        intro: "RESEARCH_MEMBER_3_INTRO_PLACEHOLDER",
        social: {},
      },
    ],
  },

  // 2. EVENTS & OPERATIONS  |  ZETA
  {
    id: "events",
    name: "Events & Operations",
    clubName: "ZETA",
    lead: {
      id: "events-lead",
      name: "EVENTS_LEAD_NAME",
      role: "Events & Operations — Team Lead",
      photo: null,
      intro: "EVENTS_LEAD_INTRO_PLACEHOLDER",
      social: {},
    },
    members: [
      {
        id: "events-member-1",
        name: "EVENTS_MEMBER_1_NAME",
        role: "Events Associate",
        photo: null,
        intro: "EVENTS_MEMBER_1_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "events-member-2",
        name: "EVENTS_MEMBER_2_NAME",
        role: "Events Associate",
        photo: null,
        intro: "EVENTS_MEMBER_2_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "events-member-3",
        name: "EVENTS_MEMBER_3_NAME",
        role: "Events Associate",
        photo: null,
        intro: "EVENTS_MEMBER_3_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "events-member-4",
        name: "EVENTS_MEMBER_4_NAME",
        role: "Events Associate",
        photo: null,
        intro: "EVENTS_MEMBER_4_INTRO_PLACEHOLDER",
        social: {},
      },
    ],
  },

  // 3. MARKETING & OUTREACH  |  SIGMA PI
  {
    id: "marketing",
    name: "Marketing & Outreach",
    clubName: "SIGMA PI",
    lead: {
      id: "marketing-lead",
      name: "MARKETING_LEAD_NAME",
      role: "Marketing & Outreach — Team Lead",
      photo: null,
      intro: "MARKETING_LEAD_INTRO_PLACEHOLDER",
      social: {},
    },
    members: [
      {
        id: "marketing-member-1",
        name: "MARKETING_MEMBER_1_NAME",
        role: "Marketing Associate",
        photo: null,
        intro: "MARKETING_MEMBER_1_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "marketing-member-2",
        name: "MARKETING_MEMBER_2_NAME",
        role: "Marketing Associate",
        photo: null,
        intro: "MARKETING_MEMBER_2_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "marketing-member-3",
        name: "MARKETING_MEMBER_3_NAME",
        role: "Marketing Associate",
        photo: null,
        intro: "MARKETING_MEMBER_3_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "marketing-member-4",
        name: "MARKETING_MEMBER_4_NAME",
        role: "Marketing Associate",
        photo: null,
        intro: "MARKETING_MEMBER_4_INTRO_PLACEHOLDER",
        social: {},
      },
    ],
  },

  // 4. DESIGN & CREATIVE  |  GAMMA PHI
  {
    id: "design",
    name: "Design & Creative",
    clubName: "GAMMA PHI",
    lead: {
      id: "design-lead",
      name: "DESIGN_LEAD_NAME",
      role: "Design & Creative — Team Lead",
      photo: null,
      intro: "DESIGN_LEAD_INTRO_PLACEHOLDER",
      social: {},
    },
    members: [
      {
        id: "design-member-1",
        name: "DESIGN_MEMBER_1_NAME",
        role: "Design Associate",
        photo: null,
        intro: "DESIGN_MEMBER_1_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "design-member-2",
        name: "DESIGN_MEMBER_2_NAME",
        role: "Design Associate",
        photo: null,
        intro: "DESIGN_MEMBER_2_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "design-member-3",
        name: "DESIGN_MEMBER_3_NAME",
        role: "Design Associate",
        photo: null,
        intro: "DESIGN_MEMBER_3_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "design-member-4",
        name: "DESIGN_MEMBER_4_NAME",
        role: "Design Associate",
        photo: null,
        intro: "DESIGN_MEMBER_4_INTRO_PLACEHOLDER",
        social: {},
      },
    ],
  },

  // 5. SOCIAL MEDIA, INNOVATION & DIGITAL INTEGRATION  |  OMEGA PSI
  {
    id: "social",
    name: "Social Media, Innovation & Digital Integration",
    clubName: "OMEGA PSI",
    lead: {
      id: "social-lead",
      name: "SOCIAL_LEAD_NAME",
      role: "Social Media & Digital — Team Lead",
      photo: null,
      intro: "SOCIAL_LEAD_INTRO_PLACEHOLDER",
      social: {},
    },
    members: [
      {
        id: "social-member-1",
        name: "SOCIAL_MEMBER_1_NAME",
        role: "Social Media Associate",
        photo: null,
        intro: "SOCIAL_MEMBER_1_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "social-member-2",
        name: "SOCIAL_MEMBER_2_NAME",
        role: "Social Media Associate",
        photo: null,
        intro: "SOCIAL_MEMBER_2_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "social-member-3",
        name: "SOCIAL_MEMBER_3_NAME",
        role: "Social Media Associate",
        photo: null,
        intro: "SOCIAL_MEMBER_3_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "social-member-4",
        name: "SOCIAL_MEMBER_4_NAME",
        role: "Social Media Associate",
        photo: null,
        intro: "SOCIAL_MEMBER_4_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "social-member-5",
        name: "SOCIAL_MEMBER_5_NAME",
        role: "Social Media Associate",
        photo: null,
        intro: "SOCIAL_MEMBER_5_INTRO_PLACEHOLDER",
        social: {},
      },
    ],
  },

  // 6. PHOTOGRAPHY & VISUAL MEDIA  |  PHI RHO
  {
    id: "photography",
    name: "Photography & Visual Media",
    clubName: "PHI RHO",
    lead: {
      id: "photo-lead",
      name: "PHOTO_LEAD_NAME",
      role: "Photography & Visual Media — Team Lead",
      photo: null,
      intro: "PHOTO_LEAD_INTRO_PLACEHOLDER",
      social: {},
    },
    members: [
      {
        id: "photo-member-1",
        name: "PHOTO_MEMBER_1_NAME",
        role: "Photography Associate",
        photo: null,
        intro: "PHOTO_MEMBER_1_INTRO_PLACEHOLDER",
        social: {},
      },
      {
        id: "photo-member-2",
        name: "PHOTO_MEMBER_2_NAME",
        role: "Photography Associate",
        photo: null,
        intro: "PHOTO_MEMBER_2_INTRO_PLACEHOLDER",
        social: {},
      },
    ],
  },
];
