"use client";

import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import ThemeToggle from "./ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");
    const [mobileOpen, setMobileOpen] = useState(false);
    const { t, language, setLanguage } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        const sections = document.querySelectorAll("section");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5 }
        );

        sections.forEach((section) => observer.observe(section));

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    const scrollToSection = (id: string) => {
        setMobileOpen(false);
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

    const links = [
        { name: t.nav.about, to: "about" },
        { name: t.nav.projects, to: "projects" },
        { name: t.nav.writeups, to: "writeups" },
        { name: t.nav.cv, to: "cv" },
        { name: t.nav.contact, to: "contact" },
    ];

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
            <div className={styles.inner}>
                <button onClick={() => scrollToSection("hero")} className={styles.logo}>
                    <span className={styles.logoSymbol}>$</span>
                    <span className={styles.logoText}>~/portfolio</span>
                </button>

                {/* Desktop Links */}
                <div className={`${styles.links} ${mobileOpen ? styles.open : ""}`}>
                    {links.map((link) => (
                        <button
                            key={link.to}
                            onClick={() => scrollToSection(link.to)}
                            className={`${styles.link} ${activeSection === link.to ? styles.active : ""}`}
                        >
                            <span className={styles.linkPrefix}>./</span>
                            {link.name}
                        </button>
                    ))}
                </div>

                <div className={styles.right}>
                    {/* Language Toggle */}
                    <button
                        onClick={() => setLanguage(language === "en" ? "sv" : "en")}
                        className={styles.langBtn}
                        title="Switch Language"
                    >
                        {language === "en" ? "SV" : "EN"}
                    </button>

                    <ThemeToggle />

                    <button
                        className={styles.hamburger}
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`${styles.bar} ${mobileOpen ? styles.bar1 : ""}`}></span>
                        <span className={`${styles.bar} ${mobileOpen ? styles.bar2 : ""}`}></span>
                        <span className={`${styles.bar} ${mobileOpen ? styles.bar3 : ""}`}></span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
