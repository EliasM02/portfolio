"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface Child {
    id: string;
    text: string;
}

interface Section {
    id: string;
    text: string;
    children: Child[];
}

export default function TableOfContents() {
    const [sections, setSections] = useState<Section[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [activeSectionId, setActiveSectionId] = useState<string>("");

    useEffect(() => {
        const elements = Array.from(
            document.querySelectorAll<HTMLElement>("h1[id], h2[id]")
        );

        // Build section tree
        const built: Section[] = [];
        let current: Section | null = null;
        for (const el of elements) {
            const level = parseInt(el.tagName[1]);
            const item = { id: el.id, text: el.textContent || "" };
            if (level === 1) {
                current = { ...item, children: [] };
                built.push(current);
            } else if (level === 2 && current) {
                current.children.push(item);
            }
        }
        setSections(built);
        if (built.length > 0) {
            setActiveSectionId(built[0].id);
            setActiveId(built[0].id);
        }

        // Scroll-based tracking
        const allHeadings = Array.from(
            document.querySelectorAll<HTMLElement>("h1[id], h2[id]")
        );
        const h1Headings = allHeadings.filter((el) => el.tagName === "H1");

        const onScroll = () => {
            const scrollY = window.scrollY + 120;

            // Active heading (any level)
            let currentId = allHeadings[0]?.id || "";
            for (const el of allHeadings) {
                if (el.offsetTop <= scrollY) currentId = el.id;
            }
            setActiveId(currentId);

            // Active section (H1 only)
            let currentSection = h1Headings[0]?.id || "";
            for (const el of h1Headings) {
                if (el.offsetTop <= scrollY) currentSection = el.id;
            }
            setActiveSectionId(currentSection);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (sections.length === 0) return null;

    return (
        <nav className={styles.toc}>
            <p className={styles.tocTitle}>Contents</p>
            <ul className={styles.tocList}>
                {sections.map((section) => (
                    <li key={section.id} className={styles.tocSection}>
                        <a
                            href={`#${section.id}`}
                            className={[
                                styles.tocLink,
                                activeId === section.id ? styles.tocLinkActive : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            {section.text}
                        </a>
                        {activeSectionId === section.id &&
                            section.children.length > 0 && (
                                <ul className={styles.tocChildren}>
                                    {section.children.map((child) => (
                                        <li key={child.id}>
                                            <a
                                                href={`#${child.id}`}
                                                className={[
                                                    styles.tocChildLink,
                                                    activeId === child.id
                                                        ? styles.tocLinkActive
                                                        : "",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                            >
                                                {child.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
