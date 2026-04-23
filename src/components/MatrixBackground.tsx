"use client";

import { useEffect, useRef } from "react";

export default function MatrixBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const columns = Math.floor(width / 20);
        const drops: number[] = new Array(columns).fill(1);

        // Kali colors: Blue, Purple, Cyan. Mostly blue.
        const colors = ["#2d89ef", "#7c4dff", "#00d4ff"];

        const draw = () => {
            // Semi-transparent black to create trail effect
            ctx.fillStyle = "rgba(8, 12, 16, 0.05)";
            ctx.fillRect(0, 0, width, height);

            ctx.font = "15px 'JetBrains Mono'";

            for (let i = 0; i < drops.length; i++) {
                const text = String.fromCharCode(0x30a0 + Math.random() * 96); // Katakana or random chars

                // Random color from Kali palette
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

                // Draw the character
                ctx.fillText(text, i * 20, drops[i] * 20);

                // Reset drop to top randomly
                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: -1,
                opacity: 0.15, // Subtle
                pointerEvents: "none",
            }}
        />
    );
}
