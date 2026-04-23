"use client";

import { skills, type Skill } from "@/data/portfolio";
import styles from "./SkillBar.module.css";

const categories = ["Languages", "Tools", "Security"] as const;

const categoryIcons: Record<string, string> = {
    Languages: "💻",
    Frameworks: "⚙️",
    Tools: "🔧",
    Security: "🔒",
};

function SkillLevel({ level }: { level: number }) {
    return (
        <div className={styles.level}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span
                    key={i}
                    className={`${styles.block} ${i <= level ? styles.filled : ""}`}
                />
            ))}
        </div>
    );
}

export default function SkillBar() {
    const grouped = categories.map((cat) => ({
        category: cat,
        icon: categoryIcons[cat],
        items: skills.filter((s: Skill) => s.category === cat),
    }));

    return (
        <div className={styles.grid}>
            {grouped.map((group) => (
                <div key={group.category} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.icon}>{group.icon}</span>
                        <span className={styles.catName}>{group.category}</span>
                    </div>
                    <div className={styles.list}>
                        {group.items.map((skill) => (
                            <div key={skill.name} className={styles.skillRow}>
                                <span className={styles.skillName}>{skill.name}</span>
                                <SkillLevel level={skill.level} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
