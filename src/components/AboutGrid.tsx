"use client";

import styles from "./AboutGrid.module.css";
import { personalInfo, skills, certificates, type Skill } from "@/data/portfolio";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutGrid() {
    const { t } = useLanguage();

    return (
        <div className={styles.grid}>
            {/* Bio Card */}
            <div className={`${styles.card} ${styles.bioCard}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.icon}>👋</span>
                    <h3 className={styles.cardTitle}>{t.about.bio}</h3>
                </div>
                <div className={styles.cardContent}>
                    {personalInfo.bio.map((line, i) => (
                        <p key={i} className={styles.bioLine}>{line}</p>
                    ))}
                </div>
            </div>

            {/* Tech Stack Card */}
            <div className={`${styles.card} ${styles.stackCard}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.icon}>🛠️</span>
                    <h3 className={styles.cardTitle}>{t.about.tabs.stack}</h3>
                </div>
                <div className={styles.skillsGrid}>
                    {skills.map((skill: Skill) => (
                        <div key={skill.name} className={styles.skillTag}>
                            {skill.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Certificates Card */}
            <div className={`${styles.card} ${styles.certCard}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.icon}>📜</span>
                    <h3 className={styles.cardTitle}>{t.about.tabs.certs}</h3>
                </div>
                <div className={styles.certList}>
                    {certificates?.map((cert, i) => (
                        <a
                            key={i}
                            href={cert.url || "#"}
                            target={cert.url ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            className={styles.certItem}
                        >
                            <div className={styles.certName}>{cert.name}</div>
                            <div className={styles.certIssuer}>
                                {cert.issuer} • <span className={styles.certDate}>{cert.date}</span>
                            </div>
                        </a>
                    )) || <p className={styles.placeholder}>No certificates listed.</p>}
                </div>
            </div>

            {/* TryHackMe Badge Card */}
            <div className={`${styles.card} ${styles.badgeCard}`}>
                <div className={styles.cardHeader}>
                    <span className={styles.icon}>🏆</span>
                    <h3 className={styles.cardTitle}>TryHackMe</h3>
                </div>
                <div className={styles.badgeWrapper}>
                    <iframe
                        src="https://tryhackme.com/api/v2/badges/public-profile?userPublicId=3914176"
                        style={{ border: "none", width: "120%", height: "100px" }}
                        title="TryHackMe Badge"
                    />
                </div>
            </div>

        </div>
    );
}
