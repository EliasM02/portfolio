"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface Heading {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents() {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const elements = Array.from(
            document.querySelectorAll<HTMLElement>("h1[id], h2[id]")
        );

        setHeadings(
            elements.map((el) => ({
                id: el.id,
                text: el.textContent || "",
                level: parseInt(el.tagName[1]),
            }))
        );

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) setActiveId(visible[0].target.id);
            },
            { rootMargin: "-80px 0px -55% 0px", threshold: 0 }
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    if (headings.length === 0) return null;

    return (
        <nav className={styles.toc}>
            <p className={styles.tocTitle}>Contents</p>
            <ul className={styles.tocList}>
                {headings.map(({ id, text, level }) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            className={[
                                styles.tocLink,
                                level === 2 ? styles.tocLinkH2 : "",
                                activeId === id ? styles.tocLinkActive : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            {text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
