"use client";

import { useEffect, useState } from "react";
import styles from "./Hero.module.css";
import { personalInfo } from "@/data/portfolio";

const focusItems = [
    "CTF challenges & writeups on TryHackMe",
    "Web application, AD & physical penetration testing",
    "Network security & Cisco certifications",
    "Building offensive security tools in Python",
];

export default function Hero() {
    const [text, setText] = useState("");
    const fullText = personalInfo.name;
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        let index = 0;
        if (isTyping) {
            const interval = setInterval(() => {
                setText(fullText.slice(0, index + 1));
                index++;
                if (index === fullText.length) {
                    setIsTyping(false);
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isTyping, fullText]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 70;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    return (
        <section className={styles.hero} id="hero">
            <div className={styles.content}>
                {/* Left — intro */}
                <div className={styles.centered}>
                    <div className={styles.greeting}>
                        <span className={styles.prompt}>guest@portfolio:~$</span>
                        <span className={styles.command}>./whoami</span>
                    </div>

                    <h1 className={styles.name}>
                        {text}
                        <span className={styles.cursor}>_</span>
                    </h1>

                    <h2 className={styles.title}>{personalInfo.title}</h2>
                    <p className={styles.subtitle}>Exploiting vulnerabilities &amp; building secure systems.</p>

                    <div className={styles.actions}>
                        <button onClick={() => scrollToSection("projects")} className="btn btn-primary">
                            View Projects
                        </button>
                        <button onClick={() => scrollToSection("contact")} className="btn">
                            Contact Me
                        </button>
                    </div>
                </div>

                {/* Right — focus card */}
                <div className={styles.focusCard}>
                    <h3 className={styles.focusTitle}>What I&apos;m working on</h3>
                    <ul className={styles.focusList}>
                        {focusItems.map((item, i) => (
                            <li key={i} className={styles.focusItem}>
                                <span className={styles.focusBullet}>▸</span>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <div className={styles.badge}>
                        <iframe
                            src="https://tryhackme.com/api/v2/badges/public-profile?userPublicId=3914176"
                            style={{ border: "none", width: "100%", height: "90px" }}
                            title="TryHackMe Badge"
                        />
                    </div>
                </div>
            </div>

            <div className={styles.scrollHint}>
                <div className={styles.mouse}>
                    <div className={styles.wheel}></div>
                </div>
                <span className={styles.scrollText}>scroll down</span>
            </div>
        </section>
    );
}
