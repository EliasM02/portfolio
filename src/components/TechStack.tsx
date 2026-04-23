"use client";

import { useState } from "react";
import { personalInfo, skills } from "@/data/portfolio";
import styles from "./TechStack.module.css";
import Image from "next/image";

type Tab = "overview" | "stack" | "hardware";

export default function TechStack() {
    const [activeTab, setActiveTab] = useState<Tab>("overview");

    return (
        <div className={styles.window}>
            <div className={styles.titleBar}>
                <div className={styles.buttons}>
                    <div className={styles.close} />
                    <div className={styles.min} />
                    <div className={styles.max} />
                </div>
                <span className={styles.title}>kali@portfolio: ~/system-info</span>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "overview" ? styles.active : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    Overview
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "stack" ? styles.active : ""}`}
                    onClick={() => setActiveTab("stack")}
                >
                    Tech Stack
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "hardware" ? styles.active : ""}`}
                    onClick={() => setActiveTab("hardware")}
                >
                    Hardware
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === "overview" && (
                    <div className={`${styles.pane} ${styles.fadeIn}`}>
                        <div className={styles.row}>
                            <span className={styles.label}>HOST:</span>
                            <span className={styles.value}>{personalInfo.name}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>ROLE:</span>
                            <span className={styles.value}>{personalInfo.title}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>LOC:</span>
                            <span className={styles.value}>{personalInfo.location}</span>
                        </div>
                        <div className={styles.divider} />
                        <div className={styles.bio}>
                            {personalInfo.bio.map((line, i) => (
                                <p key={i} className={styles.bioLine}>
                                    <span className={styles.prompt}>$</span> {line}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "stack" && (
                    <div className={`${styles.pane} ${styles.fadeIn}`}>
                        <div className={styles.grid}>
                            {skills.map((skill) => (
                                <div key={skill.name} className={styles.skillBadge}>
                                    <span className={styles.skillIcon}>
                                        {skill.category === "Languages" && "📝"}
                                        {skill.category === "Tools" && "🛠️"}
                                        {skill.category === "Security" && "🔐"}
                                    </span>
                                    <span className={styles.skillName}>{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "hardware" && (
                    <div className={`${styles.pane} ${styles.fadeIn}`}>
                        {/* Hardcoded placeholders - User can edit this file to update */}
                        <div className={styles.row}>
                            <span className={styles.label}>OS:</span>
                            <span className={styles.value}>Kali Linux / Windows 11</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>CPU:</span>
                            <span className={styles.value}>AMD Ryzen 7</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>RAM:</span>
                            <span className={styles.value}>32GB DDR4</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>GPU:</span>
                            <span className={styles.value}>NVIDIA RTX 3070</span>
                        </div>
                        <div className={styles.note}>
              // Edit TechStack.tsx to update your actual hardware setup
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
