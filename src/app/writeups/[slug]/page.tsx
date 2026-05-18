import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { writeups } from "@/data/portfolio";
import WriteupContent from "./WriteupContent";
import TableOfContents from "./TableOfContents";
import styles from "./page.module.css";

export function generateStaticParams() {
    return writeups.map((w) => ({ slug: w.slug }));
}

const difficultyColor: Record<string, string> = {
    Easy: "var(--accent-green)",
    Medium: "var(--accent-orange, #f97316)",
    Hard: "var(--accent-red)",
    Insane: "var(--accent-purple)",
};

export default async function WriteupPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const writeup = writeups.find((w) => w.slug === slug);
    if (!writeup) notFound();

    let content = "";
    try {
        if (writeup.files && writeup.files.length > 0) {
            const parts = writeup.files.map((filename) => {
                const filePath = path.join(process.cwd(), "public", "writeups", filename);
                return fs.readFileSync(filePath, "utf-8");
            });
            content = parts.join("\n\n");
        } else if (writeup.filename) {
            const filePath = path.join(process.cwd(), "public", "writeups", writeup.filename);
            content = fs.readFileSync(filePath, "utf-8");
        }
    } catch {
        notFound();
    }

    const processed = content
        .replace(
            /!\[\[([^\]]+)\]\]/g,
            (_, name: string) =>
                `![${name}](/writeups/${name.replace(/ /g, "%20")})`
        )
        .replace(
            /^(Level|Date|Target IP):(.+)$/gm,
            (_, key: string, val: string) => `${key}:${val}  `
        );

    return (
        <div className={styles.page}>
            <div className={styles.pageInner}>
                <div className={styles.container}>
                    <Link href="/#writeups" className={styles.back}>
                        ← Back
                    </Link>
                    <header className={styles.header}>
                        <span className={styles.platform}>{writeup.platform}</span>
                        <h1 className={styles.title}>{writeup.title}</h1>
                        <div className={styles.meta}>
                            <span className={styles.category}>
                                {writeup.category}
                            </span>
                            <span
                                className={styles.difficulty}
                                style={{ color: difficultyColor[writeup.difficulty] }}
                            >
                                {writeup.difficulty}
                            </span>
                            <span className={styles.date}>{writeup.date}</span>
                        </div>
                    </header>
                    <WriteupContent content={processed} />
                    <div className={styles.summary}>
                        <span className={styles.summaryLabel}>// summary</span>
                        <p>{writeup.summary}</p>
                    </div>
                </div>
                <TableOfContents />
            </div>
        </div>
    );
}
