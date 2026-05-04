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
        live: "https://cybersecteach.eliasmahler.com",
        featured: true,
    },
    {
        title: "E-Commerce BI Dashboard",
        description:
            "Power BI analysis of 89K orders from Brazilian e-commerce platform Olist (2016–2018). Built a star-schema data model with DAX measures across 5 dashboard pages covering revenue KPIs, product categories, geographic distribution, seasonal trends, and payment behaviour.",
        tech: ["Power BI", "DAX", "SQL", "Data Modelling"],
        live: "/PowerBI_Project_Rapport.pdf",
        featured: true,
    },
    {
        title: "Attack & Defend Lab",
        description:
            "A Python simulation framework modelling the full attacker–defender lifecycle. Includes attacker personas (fast/stealthy scanner), a real-time detection engine, threat hunting analytics with reputation scoring and baseline analysis, and incident narrative generation.",
        tech: ["Python", "TCP Sockets", "Matplotlib", "Multithreading"],
        github: "https://github.com/EliasM02/AttackDefendLab",
        featured: true,
    },
];

export interface Writeup {
    title: string;
    slug: string;
    platform: string;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard" | "Insane";
    date: string;
    filename: string;
    summary: string;
}

export const writeups: Writeup[] = [
    {
        title: "Interceptor",
        slug: "interceptor",
        platform: "TryHackMe",
        category: "Web / SSRF",
        difficulty: "Medium",
        date: "May 2, 2026",
        filename: "Interceptor.md",
        summary:
            "A medium web challenge focused on traffic interception and request manipulation. Backup file exposure revealed hardcoded admin credentials. Burp Suite was used to flip a JSON login response (ok:false → ok:true), and Firefox DevTools to inject is_verified=true into the 2FA POST request — bypassing both layers entirely. Final flag retrieved via SSRF using the file:// protocol in an Import Feed feature to read /var/www/user.txt.",
    },
    {
        title: "Mustacchio",
        slug: "mustacchio",
        platform: "TryHackMe",
        category: "XXE / Privilege Escalation",
        difficulty: "Easy",
        date: "May 4, 2026",
        filename: "Mustacchio.md",
        summary:
            "A classic boot2root. Gobuster revealed a .bak file exposing an admin SHA1 hash, cracked to bulldog19. A full port scan uncovered an admin panel on port 8765 with an XXE-vulnerable comment field — exploited to leak Barry's encrypted SSH private key. After cracking the passphrase with john, a SUID binary (live_log) calling tail without an absolute path was abused for PATH hijacking to spawn a root shell.",
    },
    {
        title: "TryHeartMe",
        slug: "tryheartme",
        platform: "TryHackMe",
        category: "Web / JWT",
        difficulty: "Easy",
        date: "April 15, 2026",
        filename: "TryHeartMe.md",
        summary:
            "A web challenge centered around JWT cookie manipulation. By decoding the session cookie, modifying the role to Admin and inflating the credit balance, then re-encoding and replacing the cookie, access to a hidden shop item was gained — demonstrating the danger of trusting unsigned or weakly-signed tokens.",
    },
    {
        title: "Agent T",
        slug: "agent-t",
        platform: "TryHackMe",
        category: "Web / RCE",
        difficulty: "Easy",
        date: "April 15, 2026",
        filename: "Agent T.md",
        summary:
            "An Nmap scan revealed a PHP development server (8.1.0-dev) exposed on port 80. This specific version contains a backdoor CVE that allows unauthenticated remote code execution via a crafted User-Agentt header. Running a public exploit script immediately yielded a root shell.",
    },
    {
        title: "Brooklyn Nine Nine",
        slug: "b99",
        platform: "TryHackMe",
        category: "Privilege Escalation",
        difficulty: "Easy",
        date: "April 14, 2026",
        filename: "B99 Writeup.md",
        summary:
            "Enumeration revealed FTP with anonymous login enabled, exposing a note hinting at a weak password. Hydra was used to brute-force SSH credentials for the user Jake. Once in, sudo -l showed Jake could run `less` as root — a classic GTFOBins escalation path that dropped a full root shell and exposed both flags.",
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
