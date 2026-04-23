"use client";

import styles from "./Contact.module.css";
import { contact } from "@/data/portfolio";
import { useLanguage } from "@/context/LanguageContext";

export default function Contact() {
    const { t } = useLanguage();

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
                            Establish connection...<br />
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
                    <h3 className={styles.formTitle}>{t.contact.title}</h3>
                    <form className={styles.form} action={`mailto:${contact.email}`} method="post" encType="text/plain">
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.label}>{t.contact.name}</label>
                            <input type="text" id="name" name="name" className={styles.input} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>{t.contact.email}</label>
                            <input type="email" id="email" name="email" className={styles.input} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="message" className={styles.label}>{t.contact.message}</label>
                            <textarea id="message" name="message" rows={4} className={styles.textarea} required></textarea>
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                            {t.contact.send}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
