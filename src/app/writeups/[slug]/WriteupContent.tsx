"use client";

import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import styles from "./page.module.css";

const syntaxStyle: React.CSSProperties = {
    background: "var(--bg-terminal)",
    border: "1px solid var(--border-color)",
    borderRadius: "6px",
    padding: "20px",
    margin: "28px 0",
    overflowX: "auto",
    fontSize: "0.85rem",
    lineHeight: "1.6",
};

const components: Components = {
    pre({ children }) {
        const child = React.Children.toArray(children)[0];
        if (React.isValidElement(child) && child.type === "code") {
            const { className, children: code } = child.props as {
                className?: string;
                children: string;
            };
            const match = /language-(\w+)/.exec(className || "");
            if (match) {
                return (
                    <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="pre"
                        customStyle={syntaxStyle}
                        codeTagProps={{ style: { background: "none" } }}
                    >
                        {String(code).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                );
            }
        }
        return <pre>{children}</pre>;
    },
    code({ className, children, ...props }) {
        return (
            <code className={className} {...props}>
                {children}
            </code>
        );
    },
};

export default function WriteupContent({ content }: { content: string }) {
    return (
        <div className={styles.content}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
