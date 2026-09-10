"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";

import {
  publishGuideAction,
  saveGuideDraftAction,
  type GuideActionState,
} from "@/app/(staff)/(clinic-portal)/guides/actions";
import type { PracticeGuideEditorRecord } from "@/lib/clinic-portal/load-practice-guide-editor";
import type { GuideSectionKind } from "@/lib/aftercare/types";

const ADDITIONAL_KINDS: GuideSectionKind[] = [
  "INTRODUCTION",
  "IMMEDIATE_CARE",
  "FIRST_24_HOURS",
  "WHAT_IS_NORMAL",
  "PAIN",
  "RESTRICTIONS",
  "MEDICATIONS",
  "SITE_CARE",
  "WHAT_TO_AVOID",
  "CUSTOM",
];

const WARNING_KINDS: GuideSectionKind[] = [
  "WARNING_SIGNS",
  "CONTACT_PRACTICE",
  "EMERGENCY",
];

interface EditorSection {
  key: string;
  kind: GuideSectionKind;
  title: string;
  body: string;
  periodLabel: string;
  startDay: string;
  endDay: string;
}

const emptyAction: GuideActionState = {};

function toEditorSections(
  sections: PracticeGuideEditorRecord["sections"]
): EditorSection[] {
  return sections.map((section) => ({
    key: section.key,
    kind: section.kind,
    title: section.title,
    body: section.body,
    periodLabel: section.periodLabel ?? "",
    startDay:
      typeof section.startDay === "number" ? String(section.startDay) : "",
    endDay: typeof section.endDay === "number" ? String(section.endDay) : "",
  }));
}

function newKey(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GuideEditor({
  guide,
  patientUrlExample,
  canEdit,
}: {
  guide: PracticeGuideEditorRecord;
  patientUrlExample: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(guide.title);
  const [publicSlug, setPublicSlug] = useState(guide.publicSlug);
  const [introduction, setIntroduction] = useState(guide.introduction ?? "");
  const [sections, setSections] = useState(() =>
    toEditorSections(guide.sections)
  );
  const [saveState, saveAction, saving] = useActionState(
    saveGuideDraftAction,
    emptyAction
  );
  const [publishState, publishAction, publishing] = useActionState(
    publishGuideAction,
    emptyAction
  );

  useEffect(() => {
    if (saveState.ok || publishState.ok) {
      router.refresh();
    }
  }, [saveState.ok, publishState.ok, router]);

  const serialized = useMemo(
    () =>
      JSON.stringify({
        title,
        publicSlug,
        introduction,
        sections,
      }),
    [title, publicSlug, introduction, sections]
  );
  const initialSerialized = useMemo(
    () =>
      JSON.stringify({
        title: guide.title,
        publicSlug: guide.publicSlug,
        introduction: guide.introduction ?? "",
        sections: toEditorSections(guide.sections),
      }),
    [guide]
  );
  const dirty = serialized !== initialSerialized;

  useEffect(() => {
    if (!dirty) {
      return;
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const timeline = sections.filter(
    (section) => section.kind === "RECOVERY_TIMELINE"
  );
  const additional = sections.filter((section) =>
    ADDITIONAL_KINDS.includes(section.kind)
  );
  const warnings = sections.filter((section) =>
    WARNING_KINDS.includes(section.kind)
  );

  function replaceGroup(
    predicate: (section: EditorSection) => boolean,
    nextGroup: EditorSection[]
  ) {
    setSections((current) => [
      ...current.filter((section) => !predicate(section)),
      ...nextGroup,
    ]);
  }

  function payloadSections(): unknown[] {
    return [...timeline, ...additional, ...warnings].map((section) => ({
      key: section.key,
      kind: section.kind,
      title: section.title,
      body: section.body,
      periodLabel: section.periodLabel || null,
      startDay: section.startDay === "" ? null : Number(section.startDay),
      endDay: section.endDay === "" ? null : Number(section.endDay),
    }));
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-staff-muted">
            Guide editor
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {guide.title}
          </h1>
          <p className="mt-2 text-sm text-staff-muted">
            {guide.statusLabel}
            {guide.template
              ? ` · Template ${guide.template.title}`
              : " · Custom guide"}
            {dirty ? " · Unsaved changes" : ""}
          </p>
        </div>
        <Link
          href={`/guides/${guide.id}/preview`}
          className="inline-flex h-10 items-center justify-center rounded-md border border-staff-line px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
        >
          Preview draft
        </Link>
      </header>

      <form action={saveAction} className="flex flex-col gap-8">
        <input type="hidden" name="guideId" value={guide.id} />
        <input
          type="hidden"
          name="sections"
          value={JSON.stringify(payloadSections())}
        />

        <EditorSectionHeading title="Basics">
          <Field label="Guide title" htmlFor="title">
            <input
              id="title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={!canEdit}
              className={fieldClass}
            />
          </Field>
          <Field label="Public slug" htmlFor="publicSlug">
            <input
              id="publicSlug"
              name="publicSlug"
              value={publicSlug}
              onChange={(event) => setPublicSlug(event.target.value)}
              disabled={!canEdit || guide.isPublished}
              className={fieldClass}
            />
            <p className="text-sm text-staff-muted">
              Patient URL:{" "}
              {patientUrlExample.replace(/\/[^/]*$/, `/${publicSlug || "…"}`)}
            </p>
            {guide.isPublished ? (
              <p className="text-sm text-staff-muted">
                The published public URL is protected so existing patient links
                keep working.
              </p>
            ) : null}
          </Field>
          <Field label="Short introduction" htmlFor="introduction">
            <textarea
              id="introduction"
              name="introduction"
              value={introduction}
              onChange={(event) => setIntroduction(event.target.value)}
              disabled={!canEdit}
              rows={4}
              className={`${fieldClass} h-auto py-2`}
            />
          </Field>
        </EditorSectionHeading>

        <EditorSectionHeading title="Timeline">
          <TimelineEditor
            stages={timeline}
            disabled={!canEdit}
            onChange={(next) =>
              replaceGroup(
                (section) => section.kind === "RECOVERY_TIMELINE",
                next
              )
            }
          />
        </EditorSectionHeading>

        <EditorSectionHeading title="Additional guidance">
          <GenericSectionEditor
            sections={additional}
            kinds={ADDITIONAL_KINDS}
            disabled={!canEdit}
            addLabel="Add guidance"
            onChange={(next) =>
              replaceGroup(
                (section) => ADDITIONAL_KINDS.includes(section.kind),
                next
              )
            }
          />
        </EditorSectionHeading>

        <EditorSectionHeading title="Warnings / contact">
          <GenericSectionEditor
            sections={warnings}
            kinds={WARNING_KINDS}
            disabled={!canEdit}
            addLabel="Add warning or contact section"
            onChange={(next) =>
              replaceGroup(
                (section) => WARNING_KINDS.includes(section.kind),
                next
              )
            }
          />
        </EditorSectionHeading>

        {saveState.error ? (
          <p className="text-sm text-red-600" role="alert">
            {saveState.error}
          </p>
        ) : null}

        {canEdit ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-md bg-staff-brand px-4 text-sm font-medium text-staff-on-brand hover:bg-staff-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-staff-muted">
            Staff can view this guide but cannot edit it.
          </p>
        )}
      </form>

      {canEdit ? (
        <form
          action={publishAction}
          className="rounded-xl border border-staff-line bg-staff-panel p-5"
        >
          <input type="hidden" name="guideId" value={guide.id} />
          <h2 className="text-base font-semibold">Preview / publication</h2>
          <p className="mt-2 text-sm leading-6 text-staff-muted">
            Save draft first. Publishing pins an immutable revision as the
            public patient page. It does not happen automatically on save.
          </p>
          {publishState.error ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {publishState.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={publishing || dirty}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-staff-brand px-4 text-sm font-medium text-staff-on-brand hover:bg-staff-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand disabled:opacity-60"
          >
            {publishing ? "Publishing…" : "Publish guide"}
          </button>
          {dirty ? (
            <p className="mt-2 text-sm text-staff-muted">
              Save the current draft before publishing.
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}

const fieldClass =
  "h-11 w-full rounded-md border border-staff-line bg-staff-panel px-3 text-sm text-staff-ink focus:border-staff-brand focus:ring-2 focus:ring-staff-brand/20 focus-visible:outline-none disabled:opacity-60";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

function EditorSectionHeading({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-staff-line bg-staff-panel p-5">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function TimelineEditor({
  stages,
  disabled,
  onChange,
}: {
  stages: EditorSection[];
  disabled: boolean;
  onChange: (stages: EditorSection[]) => void;
}) {
  function update(index: number, patch: Partial<EditorSection>) {
    onChange(
      stages.map((stage, current) =>
        current === index ? { ...stage, ...patch } : stage
      )
    );
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= stages.length) {
      return;
    }
    const copy = [...stages];
    const [removed] = copy.splice(index, 1);
    copy.splice(next, 0, removed);
    onChange(copy);
  }

  return (
    <div className="flex flex-col gap-4">
      {stages.map((stage, index) => (
        <article
          key={stage.key}
          className="flex flex-col gap-3 rounded-lg border border-staff-line p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Period label" htmlFor={`${stage.key}-period`}>
              <input
                id={`${stage.key}-period`}
                value={stage.periodLabel}
                onChange={(event) =>
                  update(index, { periodLabel: event.target.value })
                }
                disabled={disabled}
                className={fieldClass}
              />
            </Field>
            <Field label="Title" htmlFor={`${stage.key}-title`}>
              <input
                id={`${stage.key}-title`}
                value={stage.title}
                onChange={(event) =>
                  update(index, { title: event.target.value })
                }
                disabled={disabled}
                className={fieldClass}
              />
            </Field>
            <Field label="Start day" htmlFor={`${stage.key}-start`}>
              <input
                id={`${stage.key}-start`}
                inputMode="numeric"
                value={stage.startDay}
                onChange={(event) =>
                  update(index, { startDay: event.target.value })
                }
                disabled={disabled}
                className={fieldClass}
              />
            </Field>
            <Field label="End day" htmlFor={`${stage.key}-end`}>
              <input
                id={`${stage.key}-end`}
                inputMode="numeric"
                value={stage.endDay}
                onChange={(event) =>
                  update(index, { endDay: event.target.value })
                }
                disabled={disabled}
                className={fieldClass}
              />
            </Field>
          </div>
          <Field label="Instructions" htmlFor={`${stage.key}-body`}>
            <textarea
              id={`${stage.key}-body`}
              value={stage.body}
              onChange={(event) => update(index, { body: event.target.value })}
              disabled={disabled}
              rows={4}
              className={`${fieldClass} h-auto py-2`}
            />
          </Field>
          {disabled ? null : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => move(index, -1)}
                className="h-10 rounded-md border border-staff-line px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
              >
                Move up
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                className="h-10 rounded-md border border-staff-line px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
              >
                Move down
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange(stages.filter((_, current) => current !== index))
                }
                className="h-10 rounded-md border border-staff-line px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
              >
                Remove stage
              </button>
            </div>
          )}
        </article>
      ))}
      {disabled ? null : (
        <button
          type="button"
          onClick={() =>
            onChange([
              ...stages,
              {
                key: newKey("stage"),
                kind: "RECOVERY_TIMELINE",
                title: "New stage",
                body: "Add recovery instructions for this period.",
                periodLabel: "",
                startDay: "",
                endDay: "",
              },
            ])
          }
          className="h-10 self-start rounded-md border border-staff-line px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
        >
          Add stage
        </button>
      )}
    </div>
  );
}

function GenericSectionEditor({
  sections,
  kinds,
  disabled,
  addLabel,
  onChange,
}: {
  sections: EditorSection[];
  kinds: GuideSectionKind[];
  disabled: boolean;
  addLabel: string;
  onChange: (sections: EditorSection[]) => void;
}) {
  function update(index: number, patch: Partial<EditorSection>) {
    onChange(
      sections.map((section, current) =>
        current === index ? { ...section, ...patch } : section
      )
    );
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= sections.length) {
      return;
    }
    const copy = [...sections];
    const [removed] = copy.splice(index, 1);
    copy.splice(next, 0, removed);
    onChange(copy);
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section, index) => (
        <article
          key={section.key}
          className="flex flex-col gap-3 rounded-lg border border-staff-line p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Section type" htmlFor={`${section.key}-kind`}>
              <select
                id={`${section.key}-kind`}
                value={section.kind}
                onChange={(event) =>
                  update(index, {
                    kind: event.target.value as GuideSectionKind,
                  })
                }
                disabled={disabled}
                className={fieldClass}
              >
                {kinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind.replaceAll("_", " ").toLowerCase()}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title" htmlFor={`${section.key}-title`}>
              <input
                id={`${section.key}-title`}
                value={section.title}
                onChange={(event) =>
                  update(index, { title: event.target.value })
                }
                disabled={disabled}
                className={fieldClass}
              />
            </Field>
          </div>
          <Field label="Guidance" htmlFor={`${section.key}-body`}>
            <textarea
              id={`${section.key}-body`}
              value={section.body}
              onChange={(event) => update(index, { body: event.target.value })}
              disabled={disabled}
              rows={4}
              className={`${fieldClass} h-auto py-2`}
            />
          </Field>
          {disabled ? null : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => move(index, -1)}
                className="h-10 rounded-md border border-staff-line px-3 text-sm"
              >
                Move up
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                className="h-10 rounded-md border border-staff-line px-3 text-sm"
              >
                Move down
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange(sections.filter((_, current) => current !== index))
                }
                className="h-10 rounded-md border border-staff-line px-3 text-sm"
              >
                Remove
              </button>
            </div>
          )}
        </article>
      ))}
      {disabled ? null : (
        <button
          type="button"
          onClick={() =>
            onChange([
              ...sections,
              {
                key: newKey("section"),
                kind: kinds[0] ?? "CUSTOM",
                title: "New section",
                body: "Add clinic-provided guidance.",
                periodLabel: "",
                startDay: "",
                endDay: "",
              },
            ])
          }
          className="h-10 self-start rounded-md border border-staff-line px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}
