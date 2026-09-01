export type MemberSocial = {
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  github?: string;
};

export type Member = {
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
  social?: MemberSocial;
};

/** Stable layout id for Framer Motion shared-element transitions */
export function memberPortraitLayoutId(memberId: string) {
  return `member-portrait-${memberId}`;
}

export const members: Member[] = [
  {
    id: "suchetha",
    name: "Suchetha",
    role: "President, Marketing Lead",
    chapter: "GCC",
    photo: "/images/logo/members/suchetha.png",
    department: "Marketing & Strategy",
    year: "2025",
    team: "Executive Council",
    bio: "Leading the Global Collaboration Cell with a vision for impactful cross-border partnerships and strategic marketing initiatives that amplify student voices on the international stage.",
    animePhoto: "/images/logo/members/anime/suchetha.jpg",
  },
  {
    id: "rishu-aryan",
    name: "Rishu Aryan",
    role: "Marketing Associate",
    chapter: "GCC",
    photo: "/images/logo/members/2.png",
    department: "Marketing & Media",
    year: "2025",
    team: "Marketing Division",
    bio: "Driving brand awareness and creative campaigns that position GCC as a leading student-driven global collaboration initiative.",
    animePhoto: "/images/logo/members/anime/2.jpg",
  },
  {
    id: "mohit-yadav",
    name: "Mohit Yadav",
    role: "Marketing Associate",
    chapter: "GCC",
    photo: "/images/logo/members/3.png",
    department: "Marketing & Media",
    year: "2025",
    team: "Marketing Division",
    bio: "Crafting compelling narratives and visual content that communicate GCC's mission to audiences across multiple platforms.",
    animePhoto: "/images/logo/members/anime/3.jpg",
  },
  {
    id: "vaibhavi-vk",
    name: "Vaibhavi vk",
    role: "Research Associate",
    chapter: "GCC",
    photo: "/images/logo/members/4.png",
    department: "Research & Development",
    year: "2025",
    team: "Research Division",
    bio: "Exploring emerging trends in global education and identifying research collaboration opportunities that connect BMSIT with international institutions.",
    animePhoto: "/images/logo/members/anime/4.jpg",
  },
  {
    id: "poorvik",
    name: "Poorvik",
    role: "Digital Creative Associate",
    chapter: "GCC",
    photo: "/images/logo/members/5.png",
    department: "Creative & Design",
    year: "2025",
    team: "Creative Division",
    bio: "Transforming ideas into impactful digital experiences through creative design, multimedia storytelling, and innovative visual communication.",
    animePhoto: "/images/logo/members/anime/5.jpg",
  },
  {
    id: "ahana-shrothri",
    name: "Ahana Shrothri",
    role: "Department Lead",
    chapter: "GCC",
    photo: "/images/logo/members/6.png",
    department: "Operations & Coordination",
    year: "2025",
    team: "Department Leads",
    bio: "Orchestrating cross-functional initiatives and ensuring seamless collaboration between GCC departments to deliver meaningful outcomes.",
    animePhoto: "/images/logo/members/anime/6.jpg",
  },
  {
    id: "harsha",
    name: "Harsha",
    role: "Social Media Coordinator",
    chapter: "GCC",
    photo: "/images/logo/members/7.png",
    department: "Marketing & Media",
    year: "2025",
    team: "Marketing Division",
    bio: "Building GCC's digital presence across social platforms with strategic content, community engagement, and data-driven social media campaigns.",
    animePhoto: "/images/logo/members/anime/harsha.jpg",
  },
  {
    id: "sumukh-r",
    name: "Sumukh R",
    role: "Managing Director",
    chapter: "GCC",
    photo: "/images/logo/members/8.png",
    department: "Executive Management",
    year: "2025",
    team: "Executive Council",
    bio: "Steering the operational strategy and long-term vision of GCC, ensuring the organization delivers measurable impact for every student it touches.",
    animePhoto: "/images/logo/members/anime/sumukh-r.jpg",
  },
  {
    id: "manvil-g-shetty",
    name: "Manvil G Shetty",
    role: "Director of External Relations",
    chapter: "Kappa Alpha",
    photo: "/images/logo/members/9.png",
    department: "External Relations",
    year: "2025",
    team: "Executive Council",
    bio: "Cultivating strategic partnerships with international organizations, universities, and industry leaders to expand GCC's global network.",
    animePhoto: "/images/logo/members/anime/manvil-g-shetty.jpg",
  },
  {
    id: "namratha-r-bagade",
    name: "Namratha R Bagade",
    role: "President and Events Lead",
    chapter: "Zeta",
    photo: "/images/logo/members/10.png",
    department: "Events & Programming",
    year: "2025",
    team: "Executive Council",
    bio: "Designing and executing world-class events that bring global thought leaders, innovators, and students together for transformative experiences.",
    animePhoto: "/images/logo/members/anime/namratha-r-bagade.jpg",
  },
];

export function getMemberById(id: string): Member | undefined {
  return members.find((member) => member.id === id);
}
