"use client";

import { writeups } from "@/data/portfolio";
import styles from "./Writeups.module.css";

const difficultyColor: Record<string, string> = {
    Easy: "var(--accent-green)",
    Medium: "var(--accent-orange)",
    Hard: "var(--accent-red)",
    Insane: "var(--accent-purple)",
};

export default function Writeups() {
    return (
        <div className={styles.list}>
            {writeups.map((w, i) => (
                <a
                    key={i}
                    href={w.link ?? "#"}
                    className={styles.item}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div className={styles.left}>
                        <span className={styles.platform}>{w.platform}</span>
                        <span className={styles.title}>{w.title}</span>
                        <span className={styles.category}>{w.category}</span>
                    </div>
                    <span
                        className={styles.difficulty}
                        style={{ color: difficultyColor[w.difficulty] }}
                    >
                        {w.difficulty}
                    </span>
                </a>
            ))}
        </div>
    );
}
