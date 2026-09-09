"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import styles from "../patient.module.css";

type DemoView = "today" | "timeline";

interface DemoTab {
  id: DemoView;
  label: string;
}

const TABS: DemoTab[] = [
  { id: "today", label: "Today" },
  { id: "timeline", label: "Timeline" },
];

export function PatientDemoExperience({
  today,
  timeline,
  printHref,
}: {
  today: ReactNode;
  timeline: ReactNode;
  printHref: string;
}) {
  const [view, setView] = useState<DemoView>("today");
  const baseId = useId();
  const tabRefs = useRef<Partial<Record<DemoView, HTMLButtonElement | null>>>(
    {}
  );

  function selectView(next: DemoView) {
    setView(next);
    tabRefs.current[next]?.focus();
  }

  function onTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    event.preventDefault();
    const last = TABS.length - 1;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowRight"
            ? (index + 1) % TABS.length
            : (index - 1 + TABS.length) % TABS.length;
    const next = TABS[nextIndex];
    if (next) {
      selectView(next.id);
    }
  }

  return (
    <div className={styles.demoExperience} data-demo-view={view}>
      <div className={styles.demoNav}>
        <div
          role="tablist"
          aria-label="Recovery views"
          className={styles.demoTabs}
        >
          {TABS.map((tab, index) => {
            const selected = view === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${baseId}-${tab.id}`}
                aria-controls={`${baseId}-${tab.id}-panel`}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                className={styles.demoTab}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                onClick={() => setView(tab.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <a
          className={styles.demoPrint}
          href={printHref}
          aria-label="Print / Save PDF"
        >
          Print / Save PDF
        </a>
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-today-panel`}
        aria-labelledby={`${baseId}-today`}
        hidden={view !== "today"}
      >
        {today}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-timeline-panel`}
        aria-labelledby={`${baseId}-timeline`}
        hidden={view !== "timeline"}
      >
        {timeline}
      </div>
    </div>
  );
}
