"use client";

import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import {
  DEMO_CHECK_IN_FEELINGS,
  type DemoCheckInFeeling,
} from "@/lib/aftercare/demo-tenant";

import styles from "../patient.module.css";

type DemoView = "today" | "timeline" | "check-in";

interface DemoTab {
  id: DemoView;
  label: string;
}

export function PatientDemoExperience({
  today,
  timeline,
  checkInEnabled,
  printHref,
}: {
  today: ReactNode;
  timeline: ReactNode;
  checkInEnabled: boolean;
  printHref: string;
}) {
  const [view, setView] = useState<DemoView>("today");
  const baseId = useId();
  const tabRefs = useRef<Partial<Record<DemoView, HTMLButtonElement | null>>>(
    {}
  );
  const tabs: DemoTab[] = [
    { id: "today", label: "Today" },
    { id: "timeline", label: "Timeline" },
    ...(checkInEnabled ? [{ id: "check-in" as const, label: "Check-in" }] : []),
  ];

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
    const last = tabs.length - 1;
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowRight"
            ? (index + 1) % tabs.length
            : (index - 1 + tabs.length) % tabs.length;
    const next = tabs[nextIndex];
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
          {tabs.map((tab, index) => {
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
        <a className={styles.demoPrint} href={printHref}>
          Print / Care Plan
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
      {checkInEnabled ? (
        <div
          role="tabpanel"
          id={`${baseId}-check-in-panel`}
          aria-labelledby={`${baseId}-check-in`}
          hidden={view !== "check-in"}
        >
          <DemoCheckIn />
        </div>
      ) : null}
    </div>
  );
}

function DemoCheckIn() {
  const [feeling, setFeeling] = useState<DemoCheckInFeeling | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className={styles.checkIn} aria-labelledby="check-in-heading">
      <h2 id="check-in-heading" className={styles.sectionTitle}>
        How are you feeling today?
      </h2>
      <p className={styles.checkInHint}>Demo response · Not saved</p>
      {submitted ? (
        <p className={styles.checkInConfirm} role="status">
          Thanks. This demo response stays on this page only and is discarded
          when you refresh. It is not sent to the clinic.
        </p>
      ) : (
        <form className={styles.checkInForm} onSubmit={onSubmit}>
          <fieldset className={styles.feelingFieldset}>
            <legend className={styles.vh}>How are you feeling today?</legend>
            <div className={styles.feelingList}>
              {DEMO_CHECK_IN_FEELINGS.map((option) => {
                const inputId = `check-in-${option.value}`;
                return (
                  <label key={option.value} className={styles.feelingChoice}>
                    <input
                      id={inputId}
                      type="radio"
                      name="demo-feeling"
                      value={option.value}
                      checked={feeling === option.value}
                      onChange={() => setFeeling(option.value)}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <label className={styles.noteLabel} htmlFor="demo-check-in-note">
            Anything you'd like your clinic to know?
          </label>
          <textarea
            id="demo-check-in-note"
            className={styles.noteField}
            name="demo-note"
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            autoComplete="off"
          />
          <p className={styles.checkInHint}>Demo response · Not saved</p>
          <button
            type="submit"
            className={`${styles.action} ${styles.primary}`}
            disabled={feeling === null}
          >
            Save demo response
          </button>
        </form>
      )}
    </section>
  );
}
