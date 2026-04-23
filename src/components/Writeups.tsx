"use client";

import Link from "next/link";
import { writeups } from "@/data/portfolio";
import styles from "./Writeups.module.css";

const difficultyColor: Record<string, string> = {
    Easy: "var(--accent-green)",
    Medium: "var(--accent-orange, #f97316)",
    Hard: "var(--accent-red)",
    Insane: "var(--accent-purple)",
};

export default function Writeups() {
    return (
        <div className={styles.list}>
            {writeups.map((w, i) => (
                <Link
                    key={i}
                    href={`/writeups/${w.slug}`}
                    className={styles.item}
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
                </Link>
            ))}
        </div>
    );
}
