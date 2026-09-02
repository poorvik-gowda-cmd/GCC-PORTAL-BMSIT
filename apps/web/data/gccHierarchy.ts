// =============================================================
// GCC Public Website — Organizational Hierarchy Data
// apps/web/data/gccHierarchy.ts
//
// PURPOSE: Static data for the public Members page hierarchy.
// COMPLETELY SEPARATE from the member portal user system.
//
// HOW TO ADD A REAL MEMBER:
//   1. Replace `name` with the actual name.
//   2. Replace `photo: null` with the image path.
//   3. Replace `intro` placeholder string with a real bio.
//   4. Add social links if available.
// =============================================================

export interface HierarchyMember {
  id: string;
  name: string;
  role: string;
  photo: string | null;
  animePhoto?: string;     // styled GCC "MEET THE TEAM" branded card — same as members.ts
  intro: string;
  social?: {
    linkedin?: string;
    instagram?: string;
  };
}

export interface HierarchyDepartment {
  id: string;
  name: string;
  clubName: string;
  lead: HierarchyMember;
  members: HierarchyMember[];
}

// ──────────────────────────────────────────────
// EXECUTIVE COUNCIL  |  Club: KAPPA ALPHA
// ──────────────────────────────────────────────

export const GCC_PRESIDENT: HierarchyMember = {
  id: "ec-president",
  name: "Abhyuday",
  role: "President & Global Director",
  photo: "/images/logo/members/abhyuday.png",
  intro: "Leading the Global Collaboration Cell as President and Global Director, driving GCC's mission to build cross-border partnerships and create transformative opportunities for students at BMSIT.",
  social: {},
};

export const EXECUTIVE_COUNCIL_MEMBERS: HierarchyMember[] = [
  {
    id: "ec-sumukh",
    name: "Sumukh R",
    role: "Managing Director",
    photo: "/images/logo/members/8.png",
    animePhoto: "/images/logo/members/anime/sumukh-r.jpg",
    intro: "Steering the operational strategy and long-term vision of GCC, ensuring the organization delivers measurable impact for every student it touches.",
    social: {},
  },
  {
    id: "ec-manvil",
    name: "Manvil G Shetty",
    role: "Director of External Relations",
    photo: "/images/logo/members/9.png",
    animePhoto: "/images/logo/members/anime/manvil-g-shetty.jpg",
    intro: "Cultivating strategic partnerships with international organizations, universities, and industry leaders to expand GCC's global network.",
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
      name: "Aditya",
      role: "Research & Publication — Research Head",
      photo: "/images/logo/members/aditya.jpg",
      intro: "Heading the Research & Publication desk at GCC, driving academic collaborations, publication initiatives, and knowledge-sharing programs across borders.",
      social: {},
    },
    members: [
      {
        id: "research-vaibhavi",
        name: "Vaibhavi VK",
        role: "Research Associate",
        photo: "/images/logo/members/4.png",
        animePhoto: "/images/logo/members/anime/4.jpg",
        intro: "Exploring emerging trends in global education and identifying research collaboration opportunities that connect BMSIT with international institutions.",
        social: {},
      },
      {
        id: "research-member-2",
        name: "Navneeth M N",
        role: "Research Associate",
        photo: "/images/logo/members/navneeth.png",
        intro: "Contributing to GCC's research initiatives with enthusiasm and dedication, exploring global education trends and collaboration opportunities.",
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
      id: "events-namratha",
      name: "Namratha R Bagade",
      role: "Events & Operations — Team Lead",
      photo: "/images/logo/members/10.png",
      animePhoto: "/images/logo/members/anime/namratha-r-bagade.jpg",
      intro: "Designing and executing world-class events that bring global thought leaders, innovators, and students together for transformative experiences.",
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
      id: "marketing-suchetha",
      name: "Suchetha",
      role: "Marketing & Outreach — Team Lead",
      photo: "/images/logo/members/suchetha.png",
      animePhoto: "/images/logo/members/anime/suchetha.jpg",
      intro: "Leading GCC's marketing vision with impactful cross-border campaigns and strategic initiatives that amplify student voices on the international stage.",
      social: {},
    },
    members: [
      {
        id: "marketing-rishu",
        name: "Rishu Aryan",
        role: "Marketing Associate",
        photo: "/images/logo/members/2.png",
        animePhoto: "/images/logo/members/anime/2.jpg",
        intro: "Driving brand awareness and creative campaigns that position GCC as a leading student-driven global collaboration initiative.",
        social: {},
      },
      {
        id: "marketing-mohit",
        name: "Mohit Yadav",
        role: "Marketing Associate",
        photo: "/images/logo/members/3.png",
        animePhoto: "/images/logo/members/anime/3.jpg",
        intro: "Crafting compelling narratives and visual content that communicate GCC's mission to audiences across multiple platforms.",
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
        id: "design-poorvik",
        name: "Poorvik",
        role: "Digital Creative Associate",
        photo: "/images/logo/members/5.png",
        animePhoto: "/images/logo/members/anime/5.jpg",
        intro: "Transforming ideas into impactful digital experiences through creative design, multimedia storytelling, and innovative visual communication.",
        social: {},
      },
      {
        id: "design-manvil",
        name: "Manvil G Shetty",
        role: "Design Member",
        photo: "/images/logo/members/9.png",
        animePhoto: "/images/logo/members/anime/manvil-g-shetty.jpg",
        intro: "Bringing an eye for detail and global perspective to every design project, helping GCC communicate its mission visually with impact.",
        social: {},
      },
      {
        id: "design-ahana",
        name: "Ahana Shrothri",
        role: "Design Member",
        photo: "/images/logo/members/6.png",
        animePhoto: "/images/logo/members/anime/6.jpg",
        intro: "Orchestrating cross-functional creative initiatives and ensuring seamless visual collaboration across GCC departments.",
        social: {},
      },
      {
        id: "design-vaibhavi",
        name: "Vaibhavi VK",
        role: "Design Member",
        photo: "/images/logo/members/4.png",
        animePhoto: "/images/logo/members/anime/4.jpg",
        intro: "Combining research insights with design thinking to create visually compelling materials that resonate with global audiences.",
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
      id: "social-namratha",
      name: "Namratha R Bagade",
      role: "Social Media & Digital Integration — Team Lead",
      photo: "/images/logo/members/10.png",
      animePhoto: "/images/logo/members/anime/namratha-r-bagade.jpg",
      intro: "Driving GCC's digital presence and innovation agenda, connecting student talent with global opportunities through strategic social platforms.",
      social: {},
    },
    members: [
      {
        id: "social-mohit",
        name: "Mohit Yadav",
        role: "Social Media Associate",
        photo: "/images/logo/members/3.png",
        animePhoto: "/images/logo/members/anime/3.jpg",
        intro: "Crafting engaging digital content and managing GCC's social media presence to maximize reach and community engagement.",
        social: {},
      },
      {
        id: "social-harsha",
        name: "Harsha",
        role: "Social Media Coordinator",
        photo: "/images/logo/members/7.png",
        animePhoto: "/images/logo/members/anime/harsha.jpg",
        intro: "Building GCC's digital presence across social platforms with strategic content, community engagement, and data-driven campaigns.",
        social: {},
      },
      {
        id: "social-member-3",
        name: "Chiranth C",
        role: "Digital Content Coordinator",
        photo: "/images/logo/members/chiranth.jpg",
        intro: "Coordinating digital content strategy across GCC's social media channels, ensuring consistent and engaging communication with the GCC community.",
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
      name: "Chiranth C",
      role: "Photography & Visual Media — Team Lead",
      photo: "/images/logo/members/chiranth.jpg",
      intro: "Leading GCC's Photography and Visual Media team, capturing the moments and stories that define the GCC experience through compelling visual storytelling.",
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

// ──────────────────────────────────────────────
// ADAPTER — HierarchyMember → Member
// Converts hierarchy data to the Member shape so
// the existing MemberCard + MemberProfileOverlay
// cinematic system works identically for all cards.
// ──────────────────────────────────────────────
export const PLACEHOLDER_PHOTO = "/images/logo/gcc-logo.png";

export interface Member {
  id: string;
  name: string;
  role: string;
  chapter: string;
  photo: string;
  animePhoto?: string;
  department: string;
  year: string;
  team: string;
  bio: string;
  social?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    github?: string;
  };
}

export function toMember(
  hm: HierarchyMember,
  department: string,
  team: string,
  chapter: string
): Member {
  return {
    id: hm.id,
    name: hm.name,
    role: hm.role,
    chapter,
    photo: hm.photo ?? PLACEHOLDER_PHOTO,
    animePhoto: hm.animePhoto,
    department,
    year: "2025",
    team,
    bio: hm.intro.endsWith("PLACEHOLDER") || hm.intro === ""
      ? "Bio coming soon — check back for updates."
      : hm.intro,
    social: hm.social,
  };
}

/** Build a flat lookup map of all hierarchy members by id */
export function buildHierarchyMemberMap(): Map<string, Member> {
  const map = new Map<string, Member>();

  const addMember = (hm: HierarchyMember, dept: string, team: string, chapter: string) => {
    if (!map.has(hm.id)) {
      map.set(hm.id, toMember(hm, dept, team, chapter));
    }
  };

  addMember(GCC_PRESIDENT, "Executive Council", "Executive Council", "KAPPA ALPHA");
  EXECUTIVE_COUNCIL_MEMBERS.forEach((m) =>
    addMember(m, "Executive Council", "Executive Council", "KAPPA ALPHA")
  );

  GCC_DEPARTMENTS.forEach((dept) => {
    addMember(dept.lead, dept.name, dept.name, dept.clubName);
    dept.members.forEach((m) =>
      addMember(m, dept.name, dept.name, dept.clubName)
    );
  });

  return map;
}

