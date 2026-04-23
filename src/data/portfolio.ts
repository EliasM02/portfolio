// ================================================
// Portfolio Data — Edit this file to personalize!
// ================================================

export const personalInfo = {
    name: "Elias Mähler",
    handle: "Elias Mähler",
    title: "Cybersecurity Enthusiast & Developer",
    email: "e02.mahler@gmail.com",
    location: "Sweden",
    bio: [
        "Passionate about cybersecurity, CTFs, and building cool things.",
        "Currently exploring offensive security and web development.",
        "I love solving puzzles, breaking things (ethically), and automating everything.",
    ],
    social: {
        github: "https://github.com/EliasM02",
        linkedin: "https://www.linkedin.com/in/elias-mahler/",
        tryhackme: "https://tryhackme.com/p/EliasMahler", // Added TryHackMe
    },
};

export interface Skill {
    name: string;
    category: "Languages" | "Frameworks" | "Tools" | "Security" | "Other";
    level: number; // 1-5
}

export const skills: Skill[] = [
    // Languages
    { name: "Python", category: "Languages", level: 5 },
    { name: "PowerShell", category: "Languages", level: 3 }, // Added
    { name: "Bash", category: "Languages", level: 3 },
    { name: "SQL", category: "Languages", level: 3 },

    // Tools
    { name: "Git", category: "Tools", level: 4 },
    { name: "Linux", category: "Tools", level: 3 },
    { name: "Active Directory", category: "Tools", level: 4 }, // Added
    { name: "VS Code", category: "Tools", level: 5 },
    { name: "Wireshark", category: "Tools", level: 3 },

    // Security
    { name: "Burp Suite", category: "Security", level: 4 },
    { name: "Nmap", category: "Security", level: 4 },
    { name: "Metasploit", category: "Security", level: 3 },
    { name: "John the Ripper", category: "Security", level: 3 },
    { name: "OWASP Top 10", category: "Security", level: 4 },
];

export interface Project {
    title: string;
    description: string;
    tech: string[];
    github?: string;
    live?: string;
    featured: boolean;
}

export const projects: Project[] = [
    {
        title: "CyberSecTeach",
        description:
            "An interactive educational platform that teaches cybersecurity concepts using real-world analogies and animations — no technical background required.",
        tech: ["React", "Framer Motion", "Vite", "CSS"],
        github: "https://github.com/EliasM02/CyberSecTeach",
        featured: true,
    },
    {
        title: "Attack and Defend Lab",
        description:
            "A lab environment for practicing offensive security and defensive security.",
        tech: ["Python", "Nmap", "Detection", "Analysis"],
        github: "https://github.com/EliasM02/AttackDefendLab",
        featured: true,
    },
    {
        title: "CTF Writeup Platform",
        description:
            "A web platform for publishing CTF writeups with markdown support, syntax highlighting, and tagging system.",
        tech: ["Next.js", "TypeScript", "MDX", "PostgreSQL"],
        github: "https://github.com/yourusername/ctf-writeups",
        live: "https://writeups.example.com",
        featured: true,
    },
    {
        title: "Password Manager CLI",
        description:
            "A secure command-line password manager with AES-256 encryption, key derivation, and clipboard integration.",
        tech: ["Python", "Cryptography", "SQLite", "Click"],
        github: "https://github.com/yourusername/pass-cli",
        featured: true,
    },
    {
        title: "Homelab Dashboard",
        description:
            "A self-hosted dashboard for monitoring homelab services, resource usage, and container health.",
        tech: ["React", "Docker", "Prometheus", "Grafana"],
        github: "https://github.com/yourusername/homelab-dash",
        featured: false,
    },
];

export interface Writeup {
    title: string;
    platform: string;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Insane";
    link?: string;
}

export const writeups: Writeup[] = [
    {
        title: "TryHackMe: Room Name",
        platform: "TryHackMe",
        category: "Privilege Escalation",
        difficulty: "Easy",
        link: "#",
    },
];

export interface CVEntry {
    period: string;
    title: string;
    organization: string;
    description: string;
}

export const experience: CVEntry[] = [
    {
        period: "2024 — Present",
        title: "Security Analyst Intern",
        organization: "Company Name",
        description:
            "Conducting vulnerability assessments, penetration testing, and security audits for web applications.",
    },
    {
        period: "2025 — Present",
        title: "Teaching Assistant",
        organization: "University of Borås",
        description:
            "Mentored students in python programming and calculus, graded assignments, and assisted in lab sessions.",
    },
];

export const education: CVEntry[] = [
    {
        period: "2023 — Present",
        title: "BSc Computer Science",
        organization: "University of Borås",
        description:
            "Focusing on cybersecurity, networking, and infrastructure.",
    },
    // ... (Education array ends here)
];

export interface Certificate {
    name: string;
    issuer: string;
    date: string;
    url?: string;
}

export const certificates: Certificate[] = [
    {
        name: "CCNA: Enterprise Networking, Security, and Automation",
        issuer: "Cisco",
        date: "2026",
        url: "https://www.credly.com/earner/earned/badge/04a2594f-44fb-46d0-bb27-9ef55554fa1b",
    },
    {
        name: "CCNA: Switching, Routing, and Wireless Essentials",
        issuer: "Cisco",
        date: "2026",
        url: "https://www.credly.com/earner/earned/badge/bc87c94c-baf8-467d-832b-16c6b0fe7193",
    },
    {
        name: "CCNA: Introduction to Networks",
        issuer: "Cisco",
        date: "2026",
        url: "https://www.credly.com/earner/earned/badge/b920602c-083f-4332-9be1-edbb77453b1c",
    },
    {
        name: "Cyber Security 101",
        issuer: "TryHackMe",
        date: "2026",
        url: "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-YDPSNAKNWJ.pdf",
    },
    {
        name: "Pre Security",
        issuer: "TryHackMe",
        date: "2025",
        url: "https://tryhackme-certificates.s3-eu-west-1.amazonaws.com/THM-YRIL73RHYV.pdf",
    },
];

export const contact = {
    email: personalInfo.email,
    social: [
        { platform: "GitHub", url: personalInfo.social.github },
        { platform: "LinkedIn", url: personalInfo.social.linkedin },
        { platform: "TryHackMe", url: personalInfo.social.tryhackme },
    ],
};


export const terminalCommands: Record<string, string[]> = {
    help: [
        "Available commands:",
        "",
        "  whoami      — About me",
        "  ls          — List sections",
        "  skills      — View my skills",
        "  projects    — View my projects",
        "  contact     — Contact information",
        "  social      — Social media links",
        "  clear       — Clear terminal",
        "  help        — Show this message",
    ],
    whoami: [
        `┌──────────────────────────────────────┐`,
        `│  ${personalInfo.name}`,
        `│  @${personalInfo.handle}`,
        `│  ${personalInfo.title}`,
        `│  📍 ${personalInfo.location}`,
        `├──────────────────────────────────────┤`,
        ...personalInfo.bio.map((line) => `│  ${line}`),
        `└──────────────────────────────────────┘`,
    ],
    ls: [
        "drwxr-xr-x  whoami/",
        "drwxr-xr-x  skills/",
        "drwxr-xr-x  projects/",
        "drwxr-xr-x  writeups/",
        "drwxr-xr-x  cv/",
        "drwxr-xr-x  contact/",
        "-rw-r--r--  README.md",
    ],
    skills: [
        "cat skills.json | jq '.categories[]'",
        "",
        ...["Languages", "Frameworks", "Tools", "Security"].map((cat) => {
            const catSkills = skills
                .filter((s) => s.category === cat)
                .map((s) => s.name)
                .join(", ");
            return `  ${cat}: ${catSkills}`;
        }),
    ],
    projects: [
        ...projects.map(
            (p) => `  📁 ${p.title} — ${p.tech.slice(0, 3).join(", ")}`
        ),
        "",
        "  → Scroll down to see project details",
    ],
    contact: [
        `  📧 ${personalInfo.email}`,
        `  🐙 ${personalInfo.social.github}`,
        `  💼 ${personalInfo.social.linkedin}`,
    ],
    social: [
        `  GitHub:     ${personalInfo.social.github}`,
        `  LinkedIn:   ${personalInfo.social.linkedin}`,
        `  TryHackMe:  ${personalInfo.social.tryhackme}`,
    ],
};
