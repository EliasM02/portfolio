"use client";

import { useEffect, useState } from "react";
import styles from "./Hero.module.css";
import Terminal from "./Terminal";
import { useLanguage } from "@/context/LanguageContext";
import { personalInfo } from "@/data/portfolio";

export default function Hero() {
    const { t } = useLanguage();
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

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className={styles.hero} id="hero">
            <div className={styles.content}>
                <div className={styles.centered}>
                    <div className={styles.greeting}>
                        <span className={styles.prompt}>guest@portfolio:~$</span>
                        <span className={styles.command}>./whoami</span>
                    </div>

                    <h1 className={styles.name}>
                        {text}
                        <span className={styles.cursor}>_</span>
                    </h1>

                    <h2 className={styles.title}>{t.hero.title}</h2>
                    <p className={styles.subtitle}>{t.hero.subtitle}</p>

                    <div className={styles.actions}>
                        <button
                            onClick={() => scrollToSection("projects")}
                            className="btn btn-primary"
                        >
                            {t.hero.cta_projects}
                        </button>
                        <button
                            onClick={() => scrollToSection("contact")}
                            className="btn btn-secondary"
                        >
                            {t.hero.cta_contact}
                        </button>
                    </div>
                </div>

                <div className={styles.terminalWrapper}>
                    <Terminal />
                </div>
            </div>

            <div className={styles.scrollHint}>
                <div className={styles.mouse}>
                    <div className={styles.wheel}></div>
                </div>
                <span className={styles.scrollText}>{t.hero.scroll}</span>
            </div>
        </section>
    );
}
