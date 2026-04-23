"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { terminalCommands } from "@/data/portfolio";
import styles from "./Terminal.module.css";

interface HistoryEntry {
    command: string;
    output: string[];
}

export default function Terminal() {
    const [history, setHistory] = useState<HistoryEntry[]>([
        {
            command: "",
            output: [
                "Welcome to the portfolio terminal!",
                'Type "help" for available commands.',
                "",
            ],
        },
    ]);
    const [currentInput, setCurrentInput] = useState("");
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [history]);

    const handleCommand = (cmd: string) => {
        const trimmed = cmd.trim().toLowerCase();

        if (trimmed === "clear") {
            setHistory([]);
            return;
        }

        let output: string[];

        if (trimmed === "") {
            output = [];
        } else if (terminalCommands[trimmed]) {
            output = terminalCommands[trimmed];
        } else {
            output = [`bash: ${trimmed}: command not found`, 'Try "help" for a list of commands.'];
        }

        setHistory((prev) => [...prev, { command: cmd, output }]);
        setCommandHistory((prev) => [cmd, ...prev]);
        setHistoryIndex(-1);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleCommand(currentInput);
            setCurrentInput("");
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setCurrentInput(commandHistory[newIndex]);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setCurrentInput(commandHistory[newIndex]);
            } else {
                setHistoryIndex(-1);
                setCurrentInput("");
            }
        }
    };

    const focusInput = () => {
        inputRef.current?.focus();
    };

    return (
        <div className={styles.terminal} onClick={focusInput}>
            {/* Title bar */}
            <div className={styles.titleBar}>
                <div className={styles.buttons}>
                    <span className={styles.btnRed}></span>
                    <span className={styles.btnYellow}></span>
                    <span className={styles.btnGreen}></span>
                </div>
                <span className={styles.titleText}>guest@portfolio:~</span>
                <div className={styles.titleSpacer}></div>
            </div>

            {/* Terminal body */}
            <div className={styles.body} ref={terminalRef}>
                {history.map((entry, i) => (
                    <div key={i} className={styles.entry}>
                        {entry.command !== "" && (
                            <div className={styles.commandLine}>
                                <span className={styles.prompt}>
                                    <span className={styles.promptLine1}>
                                        <span className={styles.icon}>┌──(</span>
                                        <span className={styles.user}>guest</span>
                                        <span className={styles.icon}>㉿</span>
                                        <span className={styles.host}>portfolio</span>
                                        <span className={styles.icon}>)-[</span>
                                        <span className={styles.path}>~</span>
                                        <span className={styles.icon}>]</span>
                                    </span>
                                    <span className={styles.promptLine2}>
                                        <span className={styles.icon}>└─</span>
                                        <span className={styles.dollar}>$</span>
                                    </span>
                                </span>
                                <span className={styles.commandText}>{entry.command}</span>
                            </div>
                        )}
                        {entry.output.map((line, j) => (
                            <div key={j} className={styles.outputLine}>
                                {line || "\u00A0"}
                            </div>
                        ))}
                    </div>
                ))}

                {/* Active input line */}
                <div className={styles.commandLine}>
                    <span className={styles.prompt}>
                        <span className={styles.promptLine1}>
                            <span className={styles.icon}>┌──(</span>
                            <span className={styles.user}>guest</span>
                            <span className={styles.icon}>㉿</span>
                            <span className={styles.host}>portfolio</span>
                            <span className={styles.icon}>)-[</span>
                            <span className={styles.path}>~</span>
                            <span className={styles.icon}>]</span>
                        </span>
                        <span className={styles.promptLine2}>
                            <span className={styles.icon}>└─</span>
                            <span className={styles.dollar}>$</span>
                        </span>
                    </span>
                    <input
                        ref={inputRef}
                        className={styles.input}
                        type="text"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        autoComplete="off"
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
}
