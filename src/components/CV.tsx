"use client";

import { experience, education } from "@/data/portfolio";
import styles from "./CV.module.css";

interface TimelineProps {
    title: string;
    entries: typeof experience;
}

function Timeline({ title, entries }: TimelineProps) {
    return (
        <div className={styles.timeline}>
            <h3 className={styles.timelineTitle}>
                <span className={styles.prefix}>#</span> {title}
            </h3>
            <div className={styles.entries}>
                {entries.map((entry, i) => (
                    <div key={i} className={styles.entry}>
                        <div className={styles.dot} />
                        <div className={styles.line} />
                        <div className={styles.entryContent}>
                            <span className={styles.period}>{entry.period}</span>
                            <h4 className={styles.entryTitle}>{entry.title}</h4>
                            <span className={styles.org}>{entry.organization}</span>
                            <p className={styles.desc}>{entry.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function CV() {
    return (
        <div className={styles.grid}>
            <Timeline title="Experience" entries={experience} />
            <Timeline title="Education" entries={education} />
        </div>
    );
}
