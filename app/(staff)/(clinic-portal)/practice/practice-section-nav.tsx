"use client";

import { useEffect, useState, type MouseEvent } from "react";

export const PRACTICE_SECTIONS = [
  { id: "practice-identity", label: "Identity" },
  { id: "practice-branding", label: "Branding" },
  { id: "practice-contact", label: "Contact" },
  { id: "practice-emergency", label: "Emergency" },
  { id: "practice-presentation", label: "Presentation" },
] as const;

export type PracticeSectionId = (typeof PRACTICE_SECTIONS)[number]["id"];

export function PracticeSectionNav() {
  const [active, setActive] = useState<string>(PRACTICE_SECTIONS[0].id);

  useEffect(() => {
    const elements = PRACTICE_SECTIONS.map((section) =>
      document.getElementById(section.id)
    ).filter((node): node is HTMLElement => Boolean(node));

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .toSorted(
            (left, right) => right.intersectionRatio - left.intersectionRatio
          )[0];
        if (visible?.target.id) {
          setActive(visible.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  function goToSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    setActive(id);
  }

  return (
    <nav aria-label="Practice sections" className="staffPracticeNav">
      <ul className="staffNavGroup">
        {PRACTICE_SECTIONS.map((section) => {
          const current = active === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={current ? "true" : undefined}
                className={`staffNavRow staffPracticeNavLink ${
                  current
                    ? "text-staff-brand"
                    : "text-staff-muted hover:bg-staff-panel hover:text-staff-ink"
                }`}
                onClick={(event) => goToSection(event, section.id)}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
