import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import AboutTerminal from "@/components/AboutTerminal";
import ProjectCards from "@/components/ProjectCard";
import Writeups from "@/components/Writeups";
import ProcessCV from "@/components/ProcessCV";
import Contact from "@/components/Contact";
import MatrixBackground from "@/components/MatrixBackground";
import { personalInfo } from "@/data/portfolio";

export default function Home() {
  return (
    <>
      <MatrixBackground />
      <Navbar />
      <main>
        <Hero />

        {/* About / BloodHound Graph */}
        <Section id="about" label="cat profile.json" title="About">
          <AboutTerminal />
        </Section>

        {/* Projects */}
        <Section id="projects" label="ls ~/projects" title="Projects">
          <ProjectCards />
        </Section>

        {/* Writeups */}
        <Section id="writeups" label="ls ~/writeups" title="CTF Writeups">
          <Writeups />
        </Section>

        {/* CV (Process List) */}
        <Section id="cv" label="ps aux | grep work" title="Process List">
          <ProcessCV />
        </Section>

        {/* Contact */}
        <Section id="contact" label="netcat -lvnp 1337" title="Establish Connection">
          <Contact />
        </Section>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "40px 24px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border-color)",
          background: "var(--bg-secondary)",
        }}
      >
        <p>
          <span style={{ color: "var(--accent-blue)" }}>Kali Linux</span> Inspired Portfolio
        </p>
        <p style={{ marginTop: 4 }}>© {new Date().getFullYear()} {personalInfo.handle}</p>
      </footer>
    </>
  );
}
