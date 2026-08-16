/**
 * Single source of truth for all portfolio content.
 * Edit the values in `portfolioData` below to update the site — no component
 * code changes required.
 */

export interface NavLink {
  label: string;
  fragment: string;
}

export interface StatEntry {
  /** Big headline number, e.g. "3+", "8+". Kept as a string so it can include "+"/"%". */
  value: string;
  label: string;
}

export interface HeroData {
  name: string;
  title: string;
  tagline: string;
  /** Profile photo shown in the sticky profile card and the intro preloader. Falls back to initials if this fails to load. */
  profileImageUrl: string;
}

export interface AboutData {
  /** One entry per paragraph. */
  bio: string[];
  location: string;
  avatarUrl: string | null;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  /** Omit if not applicable. */
  location?: string;
  dates: string;
  bullets: string[];
  tech: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  /** Omit if not applicable. */
  location?: string;
  dates: string;
  field: string;
  cgpa: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  tech: string[];
  /** Omit to hide the "Live Demo" button. */
  demoUrl?: string;
  /** Omit to hide the "Code / GitHub" button. */
  githubUrl?: string;
  /** Screenshot shown as the card thumbnail. Omit to show a default Material icon instead. */
  image?: string;
}

export interface CertificateEntry {
  title: string;
  issuer: string;
  /** Omit if there's no meaningful issue date to show. */
  date?: string;
  /** Link to the credential/verification page. Makes the whole card clickable when present. */
  url?: string;
  /** Certificate image shown at the top of the card. Omit to show a default Material icon instead. */
  image?: string;
}

export interface StackEntry {
  name: string;
  /** Devicon CSS class, e.g. "devicon-typescript-plain colored". */
  icon: string;
}

export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

export interface ContactData {
  email: string;
  github: string;
  linkedin: string;
  socials: SocialLink[];
}

export interface FooterData {
  copyright: string;
}

export interface PortfolioData {
  navLinks: NavLink[];
  hero: HeroData;
  stats: StatEntry[];
  about: AboutData;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certificates: CertificateEntry[];
  projects: ProjectEntry[];
  stack: StackEntry[];
  contact: ContactData;
  footer: FooterData;
}

export const portfolioData: PortfolioData = {
  navLinks: [
    { label: 'Home', fragment: 'home' },
    { label: 'About', fragment: 'about' },
    { label: 'Experience', fragment: 'experience' },
    { label: 'Education', fragment: 'education' },
    { label: 'Projects', fragment: 'projects' },
    { label: 'Certifications', fragment: 'certificates' },
    { label: 'Skills', fragment: 'stack' },
    { label: 'Contact', fragment: 'contact' },
  ],

  hero: {
    name: 'Haziq Izzuddin',
    title: 'Full-Stack Developer',
    tagline: 'I build clean, reliable web apps from front to back.',
    // Background-removed cutout (transparent PNG), served from the site root
    // as "profile.png". Shown as a large portrait cutout in the sticky
    // profile card, and as a small circle in the intro preloader; falls back
    // to initials if missing.
    profileImageUrl: 'profile.png',
  },

  stats: [
    { value: '3+', label: 'Projects Built' },
    { value: '8+', label: 'Technologies' },
    { value: '1', label: 'Internships' },
  ],

  about: {
    bio: [
      "I'm Haziq Izzuddin, a software engineer and recent graduate with a BSc (Hons) in Software Engineering from Multimedia University (MMU), Cyberjaya. I enjoy building full-stack web applications and turning real-world requirements into working, reliable software — from designing the data model to shipping the interface.",
      'During my degree and industrial training I worked across the stack with technologies like ASP.NET, C#, Blazor, SQL, and modern web tools such as TypeScript and Next.js. I care about writing clean, maintainable code and understanding the reasoning behind a system, not just how to build it. I\'m currently looking for a junior software engineer role where I can keep learning and contribute to products that make a difference.',
    ],
    location: 'Kuala Lumpur, Malaysia',
    avatarUrl: null,
  },

  experience: [
    {
      role: 'Software Engineer Intern (Industrial Trainee)',
      company: 'HeiTech Padu Berhad',
      location: 'Malaysia',
      // TODO: replace with exact months, e.g. "Mar 2025 – Aug 2025".
      dates: '2025',
      bullets: [
        'Worked on the KPD Access system — an integrated digital platform for Koperasi Polis Diraja Malaysia (KPDRM) — across both its documentation and system maintenance phases.',
        'Prepared System Design Documents (SDD) and System Requirement Specifications (SRS) for the Akaun (Accounts), Billing, and Human Resource modules, ensuring the documentation met government standards through regular reviews with my supervisor.',
        'Maintained and enhanced the system (built with ASP.NET, C#, and Blazor): gathered requirements from users and system analysts, fixed User Acceptance Testing (UAT) issues, and deployed changes to production.',
        "Managed and queried the system's database using DBeaver and SQL, and documented system architecture, workflows, and data-flow diagrams.",
      ],
      tech: ['ASP.NET', 'C#', 'Blazor', 'SQL', 'DBeaver'],
    },
  ],

  education: [
    {
      degree: 'Bachelor of Computer Science (Hons) in Software Engineering',
      institution: 'Multimedia University',
      location: 'Cyberjaya, Selangor, Malaysia',
      dates: 'August 2023 — July 2026',
      field: 'Software Engineering',
      cgpa: '3.48',
    },
    {
      degree: 'Foundation in Information Technology',
      institution: 'Multimedia University',
      location: 'Cyberjaya, Selangor, Malaysia',
      dates: 'August 2022 — July 2023',
      field: 'Information Technology',
      cgpa: '3.44',
    },
  ],

  certificates: [
    {
      title: 'ICDL Documents',
      issuer: 'ICDL Asia',
      url: 'https://profile.icdlasia.org/01318f22-90cb-4892-8745-fee01a9bd2c7#acc.rfpJLgDe',
      image: 'certificates/icdl-1.png',
    },
    {
      title: 'ICDL Spreadsheets',
      issuer: 'ICDL Asia',
      url: 'https://profile.icdlasia.org/367efa92-db06-43bf-adee-d6e222962d63#acc.oq5AtpC8',
      image: 'certificates/icdl-2.png',
    },
    {
      title: 'ICDL Teamwork',
      issuer: 'ICDL Asia',
      url: 'https://profile.icdlasia.org/dcdc5f0a-5eb2-46a7-87b8-3cf0dbd32260#acc.7XaK1zkC',
      image: 'certificates/icdl-3.png',
    },
    {
      title: 'ICDL Presentation',
      issuer: 'ICDL Asia',
      url: 'https://profile.icdlasia.org/d9b6eed8-13bd-4be9-b42d-c5716bcab276#acc.1p04ftnA',
      image: 'certificates/icdl-4.png',
    },
    {
      title: 'ICDL Digital Marketing',
      issuer: 'ICDL Asia',
      url: 'https://profile.icdlasia.org/dd85dcfb-d80c-4f9f-bd72-8f210d5d46f7#acc.qj5nr0x4',
      image: 'certificates/icdl-5.png',
    },
  ],

  projects: [
    {
      name: 'EduWork',
      description:
        'A full-stack student platform built as my Final Year Project, connecting students with work and learning opportunities. Built with a TypeScript/Next.js front end and a PostgreSQL database, deployed on Vercel.',
      tech: ['Next.js', 'TypeScript', 'React', 'PostgreSQL', 'Vercel'],
      demoUrl: 'https://edu-work-fyphaziq.vercel.app/',
      githubUrl: 'https://github.com/izzuddinhaziq3009-beep/EduWork',
      image: 'projects/eduwork.png',
    },
    {
      name: 'Robot War Simulator',
      description:
        'A terminal-based robot battle simulator written in C++, where different robot types fight on a grid until one survives.',
      tech: ['C++', 'OOP', 'Data Structures'],
      githubUrl: 'https://github.com/izzuddinhaziq3009-beep/RobotWarSimulator',
      image: 'projects/robot-war-simulator.png',
    },
    {
      name: 'Habo (Habit Tracker App)',
      description: 'Enhancing Habo by xpavle00, an open-source habit tracker, with new features and improvements.',
      tech: ['Flutter', 'Dart', 'Mobile'],
      githubUrl: 'https://github.com/izzuddinhaziq3009-beep/HaboAssignment',
      image: 'projects/habo.png',
    },
  ],

  stack: [
    { name: 'C++', icon: 'devicon-cplusplus-plain colored' },
    { name: 'Java', icon: 'devicon-java-plain colored' },
    { name: 'Python', icon: 'devicon-python-plain colored' },
    { name: 'TypeScript', icon: 'devicon-typescript-plain colored' },
    { name: 'React', icon: 'devicon-react-original colored' },
    { name: 'Next.js', icon: 'devicon-nextjs-original' },
    { name: 'JavaScript', icon: 'devicon-javascript-plain colored' },
    { name: 'Git', icon: 'devicon-git-plain colored' },
    { name: 'Vercel', icon: 'devicon-vercel-original' },
    { name: 'ASP.NET', icon: 'devicon-dotnetcore-plain colored' },
    { name: 'C#', icon: 'devicon-csharp-plain colored' },
    { name: 'Blazor', icon: 'devicon-blazor-plain colored' },
    { name: 'SQL', icon: 'devicon-microsoftsqlserver-plain colored' },
    { name: 'DBeaver', icon: 'devicon-dbeaver-plain colored' },
  ],

  contact: {
    email: 'haziq@example.com',
    github: 'https://github.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername',
    socials: [
      { label: 'GitHub', url: 'https://github.com/yourusername', icon: 'code' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/yourusername', icon: 'work' },
      { label: 'Email', url: 'mailto:haziq@example.com', icon: 'mail' },
    ],
  },

  footer: {
    copyright: '© 2026 Haziq Izzuddin',
  },
};
