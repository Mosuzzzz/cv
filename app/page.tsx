"use client";

import Image from "next/image";
import { useEffect, useState, type KeyboardEvent } from "react";
import { profile } from "./profile";

function GitHubIcon() {
  return <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.111.82-.261.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.762-1.604-2.665-.304-5.467-1.333-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.323 3.301 1.23A11.53 11.53 0 0 1 12 5.804c1.02.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.216.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z" />
  </svg>;
}

function EmailIcon() {
  return <svg className="email-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>;
}

type GitHubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  fork: boolean;
  archived: boolean;
  size: number;
  stargazers_count: number;
  pushed_at: string;
  created_at: string;
};

type ContributionDay = { date: string; level: number; count: number | null } | null;

function ContributionCard() {
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contributions", { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("Calendar request failed");
        return response.json() as Promise<{ days: ContributionDay[]; total: number | null }>;
      })
      .then(data => {
        setDays(data.days);
        setTotal(data.total);
        setStatus("ready");
      })
      .catch(error => { if (error.name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, []);

  const cells = status === "ready" ? days : Array<ContributionDay>(371).fill(null);
  const monthLabels: { name: string; week: number }[] = [];
  let previousMonth = "";
  days.forEach((day, index) => {
    if (!day) return;
    const month = day.date.slice(0, 7);
    if (month !== previousMonth) {
      monthLabels.push({
        name: new Date(day.date + "T00:00:00Z").toLocaleString("en", { month: "short", timeZone: "UTC" }),
        week: Math.floor(index / 7),
      });
      previousMonth = month;
    }
  });
  const selectedDay = selectedIndex === null ? null : days[selectedIndex];
  const selectedLabel = selectedDay
    ? new Date(selectedDay.date + "T00:00:00Z").toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
      + ": " + (selectedDay.count === null ? "activity level " + selectedDay.level : selectedDay.count + " contributions")
    : null;

  function handleCalendarKey(event: KeyboardEvent<HTMLDivElement>) {
    const movement: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };
    if (event.key === "Escape") { setSelectedIndex(null); return; }
    if (!(event.key in movement)) return;
    event.preventDefault();
    const firstDay = days.findIndex(day => day !== null);
    if (firstDay < 0) return;
    if (selectedIndex === null) { setSelectedIndex(firstDay); return; }
    let next = Math.max(0, Math.min(days.length - 1, (selectedIndex ?? firstDay) + movement[event.key]));
    while (next >= 0 && next < days.length && !days[next]) next += movement[event.key] > 0 ? 1 : -1;
    if (next >= 0 && next < days.length) setSelectedIndex(next);
  }

  return <section className="contributions" aria-label="GitHub contributions">
    {status !== "error" && <div className="calendar-viewport"><div className="calendar-inner">
      <div className="months" aria-hidden="true">{monthLabels.map(month => <span key={month.name + month.week} style={{ gridColumn: month.week + 1 }}>{month.name}</span>)}</div>
      <div className="graph-row">
        <div className="weekdays" aria-hidden="true"><span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span /></div>
        <div className="graph" tabIndex={status === "ready" ? 0 : -1} role="group" aria-label="GitHub activity calendar. Use arrow keys to inspect days." onKeyDown={handleCalendarKey} onMouseLeave={() => setSelectedIndex(null)}>
          {cells.map((day, index) => <span key={index} className={"day l" + (day?.level ?? 0) + (day ? "" : " empty") + (selectedIndex === index ? " selected" : "")} onMouseEnter={() => day && setSelectedIndex(index)} aria-hidden="true" />)}
        </div>
      </div>
    </div></div>}
    <div className="graph-footer">
      <span aria-live="polite">{status === "error" ? <>GitHub activity is unavailable. <a href={profile.github} target="_blank" rel="noopener noreferrer">View it on GitHub</a>.</> : <>{selectedLabel || (status === "loading" ? "Loading GitHub activity…" : total === null ? "Activity in the last year" : `${total.toLocaleString()} contributions in the last year`)} on <a href={profile.github} target="_blank" rel="noopener noreferrer">@{profile.githubUsername}</a></>}</span>
      {status !== "error" && <span className="legend" aria-label="Activity level from less to more"><span>Less</span>{[0, 1, 2, 3, 4].map(level => <i className={"day l" + level} key={level} />)}<span>More</span></span>}
    </div>
    <div className="actions">
      <span className="callout">{profile.bookingUrl || profile.email ? "Building something? Let's talk." : "Explore the work behind the graph."}</span>
      {profile.bookingUrl && <a href={profile.bookingUrl}>▣ &nbsp; Book an intro call</a>}
      {profile.email && <a className="email-action" href={"mailto:" + profile.email}><EmailIcon /> Send an email</a>}
      {!profile.bookingUrl && !profile.email && <a href={profile.github} target="_blank" rel="noopener noreferrer">View GitHub</a>}
    </div>
  </section>;
}

function GitHubProjects() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.github.com/users/${profile.githubUsername}/repos?type=owner&sort=updated&per_page=100`, {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then(response => {
        if (!response.ok) throw new Error("GitHub request failed");
        return response.json() as Promise<GitHubRepo[]>;
      })
      .then(data => setRepos(data))
      .catch(() => { /* Names and links remain visible if GitHub details cannot load. */ });
    return () => controller.abort();
  }, []);

  const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    <section className="content" id="work">
      <h2>things i&apos;ve built.</h2>
      <div className="projects">{profile.featuredRepos.map(project => {
        const repo = repos.find(item => normalize(item.name) === normalize(project.name));
        return <article className="project" key={project.name}>
          <div className="project-head"><a href={repo?.html_url || `${profile.github}/${encodeURIComponent(project.name)}`} target="_blank" rel="noopener noreferrer">{project.name}</a><span>{repo ? new Date(repo.created_at).getFullYear() : ""}</span></div>
          {repo?.language && <p className="meta">{repo.language}{repo.stargazers_count > 0 ? ` · ★ ${repo.stargazers_count}` : ""}</p>}
          <p>{repo?.description || project.summary}</p>
        </article>;
      })}</div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="page light">
      <div className="side-art side-art-left" aria-hidden="true">
        <Image src="/lotus-art.png" alt="" width={1448} height={1086} sizes="400px" />
      </div>
      <div className="side-art side-art-right" aria-hidden="true">
        <Image src="/yoga-art.png" alt="" width={1254} height={1254} sizes="350px" />
      </div>
      <header className="topbar">
        <div className="identity">
          <Image src="/mosu-avatar.png" alt="Mosu's avatar" width={44} height={44} className="avatar-image" />
          <div><div className="name">{profile.name}</div><div className="role">{profile.role}</div></div>
        </div>
      </header>

      <section className="intro" id="about">
        <div className="intro-text">
          <p className="eyebrow">about me.</p>
          <h1>Hey, I&apos;m {profile.nickname}!</h1>
          <p>{profile.intro}</p>
          {profile.location && <div className="status"><span className="online">{profile.location}</span></div>}
        </div>
      </section>

      <figure className="hero-art">
        <Image
          src="/lotus-art.png"
          alt="A pale green meditating character surrounded by pink lotus petals"
          width={1448}
          height={1086}
          sizes="440px"
        />
      </figure>

      <ContributionCard />
      <GitHubProjects />

      {profile.certificates.length > 0 && (
        <section className="content certificates" aria-labelledby="certificates-title">
          <h2 id="certificates-title">certificates.</h2>
          <div className="certificate-grid">
            {profile.certificates.map(certificate => (
              <a className="polaroid" href={certificate.pdf} target="_blank" rel="noopener noreferrer" key={certificate.pdf} aria-label={`Open ${certificate.title} certificate PDF`}>
                <Image src={certificate.image} alt={`${certificate.title} certificate${certificate.issuer ? ` from ${certificate.issuer}` : ""}`} width={certificate.width} height={certificate.height} sizes="200px" />
                <span className="polaroid-caption">
                  <strong>{certificate.title}</strong>
                  {(certificate.issuer || certificate.date) && <small>{certificate.issuer}{certificate.issuer && certificate.date ? " · " : ""}{certificate.date}</small>}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {profile.experience.length > 0 && (
        <section className="content">
          <h2>where i&apos;ve been.</h2>
          <div className="timeline">
            {profile.experience.map((job, index) => (
              <article className="job" key={job.company + job.dates}>
                <div className="date">{job.dates}</div>
                <div className={index === 0 ? "job-info active" : "job-info"}>
                  <div className="company">{job.company}</div>
                  <h3>{job.title}</h3>
                  {job.detail && <p>{job.detail}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {(profile.email || profile.github || profile.linkedin) && (
        <section className="content profile-links">
          <h2>contact me.</h2>
          <div>
            {profile.email && <a className="email-contact" href={"mailto:" + profile.email}><EmailIcon /> {profile.email}</a>}
            {profile.github && <a className="github-contact" href={profile.github} target="_blank" rel="noopener noreferrer"><GitHubIcon /> GitHub</a>}
            {profile.linkedin && <a href={profile.linkedin}>LinkedIn</a>}
          </div>
        </section>
      )}
    </main>
  );
}
