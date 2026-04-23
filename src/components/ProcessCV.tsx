"use client";

import styles from "./ProcessCV.module.css";
import { education, experience } from "@/data/portfolio";
import { useLanguage } from "@/context/LanguageContext";

export default function ProcessCV() {
    const { t } = useLanguage();

    return (
        <div className={styles.container}>
            {/* Experience Table */}
            <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>⚡</span>
                <h3 className={styles.sectionTitle}>{t.cv.experience}</h3>
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.colTime}>TIME</th>
                            <th className={styles.colUser}>USER (COMPANY)</th>
                            <th className={styles.colCmd}>COMMAND (ROLE)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {experience.map((job, i) => (
                            <tr key={i} className={styles.row}>
                                <td className={styles.colTime}>{job.period}</td>
                                <td className={styles.colUser}>{job.organization}</td>
                                <td className={styles.colCmd}>
                                    <div className={styles.cmdTitle}>{job.title}</div>
                                    <div className={styles.cmdDesc}>{job.description}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Education Table */}
            <div className={styles.sectionHeader} style={{ marginTop: "40px" }}>
                <span className={styles.sectionIcon}>🎓</span>
                <h3 className={styles.sectionTitle}>{t.cv.education}</h3>
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.colTime}>TIME</th>
                            <th className={styles.colUser}>USER (SCHOOL)</th>
                            <th className={styles.colCmd}>COMMAND (DEGREE)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {education.map((edu, i) => (
                            <tr key={i} className={styles.row}>
                                <td className={styles.colTime}>{edu.period}</td>
                                <td className={styles.colUser}>{edu.organization}</td>
                                <td className={styles.colCmd}>{edu.title}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
