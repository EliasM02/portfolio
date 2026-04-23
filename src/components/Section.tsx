"use client";

import { useEffect, useRef, ReactNode } from "react";

interface SectionProps {
    id: string;
    label: string;
    title: string;
    children: ReactNode;
}

export default function Section({ id, label, title, children }: SectionProps) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            },
            { threshold: 0.1 }
        );

        const fadeEls = ref.current?.querySelectorAll(".fade-in");
        fadeEls?.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <section id={id} ref={ref} className="section">
            <div className="container">
                <div className="section-header fade-in">
                    <p className="section-label">{label}</p>
                    <h2 className="section-title">{title}</h2>
                    <div className="section-divider" />
                </div>
                <div className="fade-in">{children}</div>
            </div>
        </section>
    );
}
