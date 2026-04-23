"use client";

import { useState } from "react";
import styles from "./NetworkGraph.module.css";
import { skills, certificates, experience, education } from "@/data/portfolio";

interface GraphNode {
    id: string;
    label: string;
    type: "central" | "group";
    x: number;
    y: number;
    icon: string;
    color: string;
}

interface GraphEdge {
    from: string;
    to: string;
    label: string;
}

interface DetailItem {
    label: string;
    sub?: string;
    url?: string;
}

const NODES: GraphNode[] = [
    { id: "me", label: "Elias Mähler", type: "central", x: 50, y: 50, icon: "👤", color: "#27c93f" },
    { id: "languages", label: "Languages", type: "group", x: 50, y: 10, icon: "💻", color: "#2d89ef" },
    { id: "tools", label: "Tools", type: "group", x: 85, y: 28, icon: "🔧", color: "#00bcd4" },
    { id: "security", label: "Security", type: "group", x: 85, y: 72, icon: "🛡️", color: "#ff5f57" },
    { id: "certs", label: "Certifications", type: "group", x: 50, y: 90, icon: "📜", color: "#7c4dff" },
    { id: "career", label: "Experience", type: "group", x: 15, y: 72, icon: "⚡", color: "#28c840" },
    { id: "education", label: "Education", type: "group", x: 15, y: 28, icon: "🎓", color: "#febc2e" },
];

const EDGES: GraphEdge[] = [
    { from: "me", to: "languages", label: "HasSkill" },
    { from: "me", to: "tools", label: "Uses" },
    { from: "me", to: "security", label: "Specializes" },
    { from: "me", to: "certs", label: "CertifiedBy" },
    { from: "me", to: "career", label: "WorkedAt" },
    { from: "me", to: "education", label: "StudiedAt" },
];

const NODE_DETAILS: Record<string, DetailItem[]> = {
    languages: skills.filter(s => s.category === "Languages").map(s => ({ label: s.name })),
    tools: skills.filter(s => s.category === "Tools").map(s => ({ label: s.name })),
    security: skills.filter(s => s.category === "Security").map(s => ({ label: s.name })),
    certs: certificates.map(c => ({ label: c.name, sub: `${c.issuer} • ${c.date}`, url: c.url })),
    career: experience.map(e => ({ label: e.title, sub: `${e.organization} — ${e.period}` })),
    education: education.map(e => ({ label: e.title, sub: `${e.organization} — ${e.period}` })),
};

export default function NetworkGraph() {
    const [activeNode, setActiveNode] = useState<string | null>(null);

    const handleNodeClick = (nodeId: string) => {
        if (nodeId === "me") return;
        setActiveNode(activeNode === nodeId ? null : nodeId);
    };

    return (
        <div className={styles.graphContainer} onClick={(e) => {
            if ((e.target as HTMLElement).closest(`.${styles.node}`)) return;
            setActiveNode(null);
        }}>
            {/* BloodHound Header */}
            <div className={styles.header}>
                <span className={styles.headerIcon}>🐕</span>
                <span className={styles.headerTitle}>BloodHound</span>
                <span className={styles.headerSep}>|</span>
                <span className={styles.headerPath}>Query: Shortest Path to Domain Admin</span>
            </div>

            {/* SVG Edge Layer */}
            <svg className={styles.edgeSvg}>
                {EDGES.map((edge, i) => {
                    const from = NODES.find(n => n.id === edge.from)!;
                    const to = NODES.find(n => n.id === edge.to)!;
                    const midX = (from.x + to.x) / 2;
                    const midY = (from.y + to.y) / 2;
                    const isActive = activeNode === edge.to;

                    return (
                        <g key={i}>
                            <line
                                x1={`${from.x}%`} y1={`${from.y}%`}
                                x2={`${to.x}%`} y2={`${to.y}%`}
                                className={`${styles.edgeLine} ${isActive ? styles.edgeActive : ""}`}
                                style={{ stroke: isActive ? to.color : `${to.color}55` }}
                            />
                            <text
                                x={`${midX}%`} y={`${midY}%`}
                                className={styles.edgeLabel}
                            >
                                {edge.label}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Nodes */}
            {NODES.map(node => {
                const isActive = activeNode === node.id;
                const details = NODE_DETAILS[node.id];

                return (
                    <div
                        key={node.id}
                        className={`${styles.node} ${styles[node.type]} ${isActive ? styles.nodeActive : ""}`}
                        style={{
                            left: `${node.x}%`,
                            top: `${node.y}%`,
                            "--node-color": node.color,
                        } as React.CSSProperties}
                        onClick={() => handleNodeClick(node.id)}
                    >
                        <div className={styles.nodeCircle}>
                            <span className={styles.nodeIcon}>{node.icon}</span>
                        </div>
                        <div className={styles.nodeLabel}>{node.label}</div>

                        {/* Detail Panel */}
                        {isActive && details && (
                            <div
                                className={styles.detailPanel}
                                style={{
                                    ...(node.x > 50 ? { right: "100%", marginRight: "16px" } : { left: "100%", marginLeft: "16px" }),
                                    ...(node.y > 60 ? { bottom: "0" } : { top: "0" }),
                                }}
                            >
                                <div className={styles.panelHeader}>
                                    <span>{node.icon}</span> {node.label}
                                </div>
                                <div className={styles.panelItems}>
                                    {details.map((item, j) => (
                                        item.url ? (
                                            <a key={j} href={item.url} target="_blank" rel="noopener noreferrer" className={styles.panelLink}>
                                                <span>{item.label}</span>
                                                {item.sub && <span className={styles.panelSub}>{item.sub}</span>}
                                                <span className={styles.linkArrow}>↗</span>
                                            </a>
                                        ) : (
                                            <div key={j} className={styles.panelItem}>
                                                <span>{item.label}</span>
                                                {item.sub && <span className={styles.panelSub}>{item.sub}</span>}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* TryHackMe Badge */}
            <div className={styles.badgeCorner}>
                <iframe
                    src="https://tryhackme.com/api/v2/badges/public-profile?userPublicId=3914176"
                    style={{ border: "none", width: "350px", height: "90px" }}
                    title="TryHackMe Badge"
                />
            </div>
        </div>
    );
}
