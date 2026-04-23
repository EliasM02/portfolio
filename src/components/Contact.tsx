"use client";

import { useState } from "react";
import styles from "./Contact.module.css";
import { contact } from "@/data/portfolio";

type Status = "idle" | "sending" | "success" | "error";

export default function Contact() {
    const [status, setStatus] = useState<Status>("idle");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("sending");

        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));

        const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ ...data, access_key: "4729a32e-72f3-4d11-9f9b-a406669d6bec" }),
        });

        if (res.ok) {
            setStatus("success");
            form.reset();
        } else {
            setStatus("error");
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {/* Contact Info Side */}
                <div className={styles.infoSide}>
                    <div className={styles.terminalHeader}>
                        <div className={styles.dots}>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                        </div>
                        <div className={styles.title}>connection_request.sh</div>
                    </div>

                    <div className={styles.terminalBody}>
                        <div className={styles.line}>
                            <span className={styles.prompt}>root@portfolio:~#</span> ./connect --target=elias
                        </div>
                        <div className={styles.output}>
                            Establishing connection...<br />
                            Target acquired: <a href={`mailto:${contact.email}`} className={styles.link}>{contact.email}</a><br />
                        </div>

                        <div className={styles.socials}>
                            {contact.social.map((link) => (
                                <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                    <span className={styles.socialIcon}>➜</span> {link.platform}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className={styles.formSide}>
                    <h3 className={styles.formTitle}>Send a Message</h3>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.label}>Name</label>
                            <input type="text" id="name" name="name" className={styles.input} placeholder="Your name" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>Email</label>
                            <input type="email" id="email" name="email" className={styles.input} placeholder="your@email.com" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="message" className={styles.label}>Message</label>
                            <textarea id="message" name="message" rows={4} className={styles.textarea} placeholder="Write your message here..." required></textarea>
                        </div>

                        {status === "success" && (
                            <p className={styles.successMsg}>Message sent — I&apos;ll get back to you soon.</p>
                        )}
                        {status === "error" && (
                            <p className={styles.errorMsg}>Something went wrong. Try emailing me directly.</p>
                        )}

                        <button type="submit" className={styles.submitBtn} disabled={status === "sending"}>
                            {status === "sending" ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
