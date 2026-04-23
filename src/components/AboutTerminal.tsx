"use client";

import styles from "./AboutTerminal.module.css";
import { personalInfo, skills, certificates, experience, education } from "@/data/portfolio";

const languages = skills.filter(s => s.category === "Languages").map(s => s.name).join(", ");
const tools = skills.filter(s => s.category === "Tools").map(s => s.name).join(", ");

function Line({ label, value }: { label: string; value: string }) {
    return (
        <div className={styles.line}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{value}</span>
        </div>
    );
}

function Command({ cmd }: { cmd: string }) {
    return (
        <div className={styles.prompt}>
            <span className={styles.dollar}>$</span>
            <span className={styles.cmd}>{cmd}</span>
        </div>
    );
}

function Divider() {
    return <div className={styles.divider} />;
}

export default function AboutTerminal() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.terminal}>
                {/* Title bar */}
                <div className={styles.titleBar}>
                    <div className={styles.dots}>
                        <span className={styles.dot} style={{ background: "#ff5f57" }} />
                        <span className={styles.dot} style={{ background: "#febc2e" }} />
                        <span className={styles.dot} style={{ background: "#28c840" }} />
                    </div>
                    <span className={styles.titleText}>guest@portfolio:~</span>
                </div>

                <div className={styles.body}>
                    {/* whoami */}
                    <Command cmd="whoami" />
                    <div className={styles.block}>
                        <Line label="Name"     value={personalInfo.name} />
                        <Line label="Title"    value={personalInfo.title} />
                        <Line label="Location" value={personalInfo.location} />
                        <Line label="Email"    value={personalInfo.email} />
                        {personalInfo.bio.map((line, i) => (
                            <div key={i} className={styles.bioLine}>{line}</div>
                        ))}
                    </div>

                    <Divider />

                    {/* skills */}
                    <Command cmd="skills --list" />
                    <div className={styles.block}>
                        <Line label="Languages" value={languages} />
                        <Line label="Tools"     value={tools} />
                    </div>

                    <Divider />

                    {/* certifications */}
                    <Command cmd="ls ~/certifications" />
                    <div className={styles.block}>
                        {certificates.map((c, i) => (
                            c.url ? (
                                <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className={styles.certItem}>
                                    <span className={styles.check}>[✓]</span>
                                    <span className={styles.certName}>{c.name}</span>
                                    <span className={styles.certMeta}>— {c.issuer} ({c.date}) ↗</span>
                                </a>
                            ) : (
                                <div key={i} className={styles.certItem}>
                                    <span className={styles.check}>[✓]</span>
                                    <span className={styles.certName}>{c.name}</span>
                                    <span className={styles.certMeta}>— {c.issuer} ({c.date})</span>
                                </div>
                            )
                        ))}
                    </div>

                    <Divider />

                    {/* experience */}
                    <Command cmd="cat experience.log" />
                    <div className={styles.block}>
                        {experience.map((e, i) => (
                            <div key={i} className={styles.entry}>
                                <span className={styles.entryTitle}>{e.title}</span>
                                <span className={styles.entrySub}>{e.organization} · {e.period}</span>
                            </div>
                        ))}
                    </div>

                    <Divider />

                    {/* education */}
                    <Command cmd="cat education.log" />
                    <div className={styles.block}>
                        {education.map((e, i) => (
                            <div key={i} className={styles.entry}>
                                <span className={styles.entryTitle}>{e.title}</span>
                                <span className={styles.entrySub}>{e.organization} · {e.period}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.prompt} style={{ marginTop: 20 }}>
                        <span className={styles.dollar}>$</span>
                        <span className={styles.cursor} />
                    </div>
                </div>
            </div>

        </div>
    );
}
