"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import {
  BriefcaseBusinessIcon,
  CalendarClockIcon,
  FolderOpenIcon,
  HandshakeIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"

import { BrandMark } from "@/components/layout/brand"

/* All names, companies and numbers here are fictional. */

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)")
      query.addEventListener("change", notify)
      return () => query.removeEventListener("change", notify)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

/** True once the element has scrolled into view (stays true). */
export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element || inView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true)
      },
      { threshold },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [inView, threshold])
  return [ref, inView] as const
}

/** An app frame: the IamCandidate mark, the screen title and a sync indicator. */
export function AppWindow({
  title,
  children,
  className,
  bodyClassName,
}: {
  title?: string
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-[0_0_0_0.5px_rgb(0_0_0/0.06),0_30px_80px_-28px_color-mix(in_oklch,var(--brand)_40%,transparent)] dark:border-white/10",
        className,
      )}
    >
      <div className="flex h-10 items-center gap-2.5 border-b border-foreground/[0.07] bg-[var(--window)] px-3.5">
        <BrandMark className="size-5 rounded-md [&_svg]:size-3" />
        {title && <p className="truncate text-[12px] font-medium text-muted-foreground">{title}</p>}
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success" /> Synced
        </span>
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------ app chrome */

const SIDEBAR: Array<{ icon: LucideIcon; label: string }> = [
  { icon: LayoutDashboardIcon, label: "Dashboard" },
  { icon: BriefcaseBusinessIcon, label: "Applications" },
  { icon: UsersIcon, label: "Contacts" },
  { icon: HandshakeIcon, label: "Referrals" },
  { icon: CalendarClockIcon, label: "Interviews" },
  { icon: LayoutTemplateIcon, label: "Templates" },
  { icon: FolderOpenIcon, label: "Documents" },
]

/* --------------------------------------------------------------- scenes */

/** Screenshots of the demo account on the light theme, 1920×1200. */
const SCENES = [
  { id: "pipeline", tab: "Pipeline", title: "Applications", caption: "Drag roles from wishlist to offer.", src: "/showcase/pipeline.webp" },
  { id: "dashboard", tab: "Dashboard", title: "Dashboard", caption: "See your week at a glance.", src: "/showcase/dashboard.webp" },
  { id: "referrals", tab: "Referrals", title: "Referrals", caption: "Know who's referring you, and when to nudge.", src: "/showcase/referrals.webp" },
  { id: "interviews", tab: "Interviews", title: "Interviews", caption: "Every interview on one agenda.", src: "/showcase/interviews.webp" },
]

const SCENE_MS = 5600

/** The hero: the app in a frame, cycling through scenes with progress tabs. */
export function AppShowcase({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ref, inView] = useInView<HTMLDivElement>(0.2)
  const running = inView && !paused && !reduced

  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % SCENES.length), SCENE_MS)
    return () => window.clearTimeout(timer)
  }, [running, index])

  const scene = SCENES[index] ?? SCENES[0]!
  return (
    <div ref={ref} className={cn("relative mx-auto mt-16 max-w-5xl", className)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div aria-hidden className="absolute -inset-x-6 -bottom-6 top-10 rounded-[2rem] bg-gradient-to-b from-brand/25 to-transparent blur-2xl" />
      <AppWindow title={`IamCandidate — ${scene.title}`} className="relative" bodyClassName="relative aspect-[16/10] bg-background">
        {/* All four stay mounted so switching tabs cross-fades without a load. */}
        {SCENES.map((s, i) => (
          <Image
            key={s.id}
            src={s.src}
            alt={`The IamCandidate ${s.title} screen, with demo data`}
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            priority={i === 0}
            aria-hidden={i !== index}
            className={cn("object-cover object-top transition-opacity duration-500", i === index ? "opacity-100" : "opacity-0")}
          />
        ))}
      </AppWindow>

      <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="App tour">
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => setIndex(i)}
            className={cn("group text-left transition-opacity", i === index ? "opacity-100" : "opacity-60 hover:opacity-90")}
          >
            <div className="h-0.5 overflow-hidden rounded-full bg-foreground/10">
              <div
                className={cn("h-full bg-brand", i === index && running ? "animate-[showcase-progress_linear_forwards]" : "")}
                style={{
                  width: i === index ? (running ? undefined : "100%") : i < index ? "100%" : "0%",
                  animationDuration: `${SCENE_MS}ms`,
                }}
              />
            </div>
            <p className="mt-2 text-sm font-medium">{s.tab}</p>
            <p className="text-xs text-muted-foreground">{s.caption}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------------------------------- gallery screens */

function ContactsScreen({ shown }: { shown: boolean }) {
  const rows = [
    ["Maya Patel", "Technical Recruiter", "Ledgerline", "Recruiter", "bg-chart-3/15 text-chart-3", "In 3 days"],
    ["Jordan Reyes", "Senior Software Engineer", "Relay API", "Referral", "bg-success/15 text-success", "In 2 days"],
    ["Elias Weber", "Engineering Manager", "Teamforge", "Hiring Manager", "bg-chart-5/15 text-chart-5", "Tomorrow"],
    ["Nina Kapoor", "HR Business Partner", "Northwind Labs", "Recruiter", "bg-chart-3/15 text-chart-3", "Today"],
    ["Sam Okafor", "Staff Engineer", "Paywise", "Professional", "bg-muted text-muted-foreground", "—"],
  ]
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-2 border-b px-3 py-2 text-[10px] font-medium text-muted-foreground">
        <span>Name</span>
        <span>Company</span>
        <span>Relationship</span>
        <span>Follow-up</span>
      </div>
      {rows.map(([name, role, company, rel, tone, follow], i) => (
        <div
          key={name}
          className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] items-center gap-2 border-b px-3 py-2 transition-all duration-500 last:border-0"
          style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(6px)", transitionDelay: `${i * 90}ms` }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[9px] font-semibold text-brand">
              {String(name).split(" ").map((p) => p[0]).join("")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium">{name}</p>
              <p className="truncate text-[9px] text-muted-foreground">{role}</p>
            </div>
          </div>
          <span className="truncate text-[10px]">{company}</span>
          <span className={cn("w-fit rounded-full px-1.5 py-0.5 text-[9px] font-medium", tone)}>{rel}</span>
          <span className="text-[10px]">{follow}</span>
        </div>
      ))}
    </div>
  )
}

function TemplatesScreen({ shown }: { shown: boolean }) {
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="inline-flex w-fit rounded-md bg-foreground/[0.06] p-0.5 text-[10px] dark:bg-white/[0.08]">
        <span className="rounded px-2 py-0.5 text-muted-foreground">Email 10</span>
        <span className="rounded bg-background px-2 py-0.5 font-medium shadow-sm dark:bg-white/15">LinkedIn 7</span>
      </div>
      <div className="flex min-h-0 flex-1 gap-2.5">
        <div className="hidden w-36 space-y-1.5 sm:block">
          {["Connection request: referral", "Referral request", "Referral follow-up", "Thanks for the referral"].map((name, i) => (
            <div key={name} className={cn("rounded-lg border bg-card p-2", i === 0 && "border-foreground/20 bg-muted/60")}>
              <p className="truncate text-[10px] font-medium">{name}</p>
              <p className="text-[9px] text-muted-foreground">Referral</p>
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col rounded-xl border bg-card p-3">
          <p className="text-[11px] font-semibold">Connection request: referral</p>
          <div className="mt-2 flex flex-wrap gap-1 border-b pb-2 font-mono text-[9px] text-muted-foreground">
            {["name", "company", "role", "jobUrl", "senderName"].map((v) => (
              <span key={v} className="rounded bg-muted px-1">{v}</span>
            ))}
          </div>
          <p className="mt-2 flex-1 text-[11px] leading-relaxed">
            Hi <span className="rounded bg-brand/15 px-0.5 text-brand">{"{{name}}"}</span>, I&apos;m applying for the{" "}
            <span className="rounded bg-brand/15 px-0.5 text-brand">{"{{role}}"}</span> role at{" "}
            <span className="rounded bg-brand/15 px-0.5 text-brand">{"{{company}}"}</span> and would love to connect. I&apos;d really
            appreciate a referral if you think I&apos;d be a good fit. Thank you!
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Fits a connection note</span>
            <span className="tabular-nums transition-opacity duration-700" style={{ opacity: shown ? 1 : 0 }}>
              197 / 300
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function IntegrationsScreen({ shown }: { shown: boolean }) {
  const items = [
    ["Google Drive", "Connected", true],
    ["Google Calendar", "Synced 2 min ago", true],
    ["GitHub", "@alexmorgan-demo", true],
    ["LinkedIn", "214 contacts imported", true],
    ["SMTP", "Sending from your mailbox", true],
    ["AWS S3", "Backed up today", true],
  ] as const
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(([name, meta], i) => (
        <div
          key={name}
          className="rounded-xl border bg-card p-2.5 transition-all duration-500"
          style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "scale(0.96)", transitionDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-medium">{name}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-1.5 text-[9px] font-medium text-success">
              <span className="size-1 rounded-full bg-success" /> On
            </span>
          </div>
          <p className="mt-1 truncate text-[10px] text-muted-foreground">{meta}</p>
        </div>
      ))}
    </div>
  )
}

const LATEX = [
  ["\\section", "{Experience}"],
  ["\\textbf", "{Senior Frontend Engineer} \\hfill 2023 -- now"],
  ["\\item", " Led the design system used by 40 engineers"],
  ["\\item", " Cut page load time by 38\\%"],
  ["\\section", "{Skills}"],
  ["", "React, TypeScript, Next.js, GraphQL"],
] as const

function ResumeScreen({ shown }: { shown: boolean }) {
  return (
    <div className="grid h-full grid-cols-2 gap-2.5">
      <div className="rounded-xl border bg-[oklch(0.2_0.01_265)] p-3 font-mono text-[9.5px] leading-relaxed text-white/85">
        {LATEX.map(([cmd, rest], i) => (
          <p key={i} className="truncate transition-opacity duration-300" style={{ opacity: shown ? 1 : 0, transitionDelay: `${i * 140}ms` }}>
            <span className="text-[#ff7ab2]">{cmd}</span>
            {rest}
          </p>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-3 text-zinc-900 shadow-sm">
        <p className="text-[12px] font-semibold">Alex Morgan</p>
        <p className="text-[8px] text-zinc-500">Frontend Engineer · alex.morgan@example.com</p>
        <p className="mt-2 border-b border-zinc-200 text-[9px] font-semibold uppercase tracking-wide">Experience</p>
        <p className="mt-1 text-[9px] font-semibold">Senior Frontend Engineer</p>
        <p className="text-[8px] text-zinc-600">• Led the design system used by 40 engineers</p>
        <p className="text-[8px] text-zinc-600">• Cut page load time by 38%</p>
        <p className="mt-2 border-b border-zinc-200 text-[9px] font-semibold uppercase tracking-wide">Skills</p>
        <p className="mt-1 text-[8px] text-zinc-600">React, TypeScript, Next.js, GraphQL</p>
      </div>
    </div>
  )
}

const GALLERY = {
  contacts: { title: "Contacts", sidebar: "Contacts", Screen: ContactsScreen },
  templates: { title: "Templates", sidebar: "Templates", Screen: TemplatesScreen },
  integrations: { title: "Integrations", sidebar: "", Screen: IntegrationsScreen },
  resume: { title: "Resume — Frontend", sidebar: "Documents", Screen: ResumeScreen },
} as const

/** One app screen in a frame; it animates in when scrolled into view. */
export function GalleryWindow({
  screen,
  delay = 0,
  className,
}: {
  screen: keyof typeof GALLERY
  delay?: number
  className?: string
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.2)
  const reduced = usePrefersReducedMotion()
  const shown = inView || reduced
  const { title, sidebar, Screen } = GALLERY[screen]
  return (
    <div
      ref={ref}
      className={cn("transition-all duration-700 ease-out motion-reduce:transition-none", shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <AppWindow title={`IamCandidate — ${title}`} className="transition-transform duration-500 hover:-translate-y-1">
        <div className="flex h-[300px] bg-background">
          <aside className="hidden w-36 shrink-0 p-1.5 sm:block">
            <div className="glass flex h-full flex-col rounded-xl border p-1.5">
              {SIDEBAR.map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex h-6 items-center gap-1.5 rounded-md px-1.5 text-[10px] text-sidebar-foreground/85",
                    item.label === sidebar && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className={cn("size-3", item.label === sidebar ? "text-brand" : "text-muted-foreground")} /> {item.label}
                </div>
              ))}
            </div>
          </aside>
          <div className="min-w-0 flex-1 overflow-hidden p-3">
            <p className="mb-2.5 text-[13px] font-semibold">{title}</p>
            <Screen shown={shown} />
          </div>
        </div>
      </AppWindow>
    </div>
  )
}
