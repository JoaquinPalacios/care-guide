"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  publishGuideAction,
  saveGuideDraftAction,
  type GuideActionState,
} from "@/app/(staff)/(clinic-portal)/guides/actions";
import { EditorTimelinePreview } from "@/app/(staff)/(clinic-portal)/guides/editor-timeline-preview";
import {
  ADDITIONAL_KINDS,
  WARNING_KINDS,
  newEditorKey,
  type EditorSection,
} from "@/app/(staff)/(clinic-portal)/guides/editor-types";
import { TimelineStageEditor } from "@/app/(staff)/(clinic-portal)/guides/timeline-stage-editor";
import { ConfirmDialog } from "@/app/(staff)/components/confirm-dialog";
import { PortalBreadcrumb } from "@/app/(staff)/components/portal-breadcrumb";
import { SaveStatus } from "@/app/(staff)/components/save-status";
import { StatusPills } from "@/app/(staff)/components/status-pills";
import { useUnsavedChangesGuard } from "@/app/(staff)/components/use-unsaved-changes-guard";
import { formSaveStatus } from "@/lib/clinic-portal/form-save-status";
import type { PracticeGuideEditorRecord } from "@/lib/clinic-portal/load-practice-guide-editor";
import type { GuideSectionKind } from "@/lib/aftercare/types";

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

export function GuideEditor({
  guide,
  patientUrlExample,
  canEdit,
  previewThemeStyle,
}: {
  guide: PracticeGuideEditorRecord;
  patientUrlExample: string;
  canEdit: boolean;
  previewThemeStyle?: CSSProperties;
}) {
  const router = useRouter();
  const errorSummaryRef = useRef<HTMLParagraphElement>(null);
  const pendingSnapshot = useRef<string>("");
  const [title, setTitle] = useState(guide.title);
  const [publicSlug, setPublicSlug] = useState(guide.publicSlug);
  const [introduction, setIntroduction] = useState(guide.introduction ?? "");
  const [sections, setSections] = useState(() =>
    toEditorSections(guide.sections)
  );
  const [openStageKey, setOpenStageKey] = useState<string | null>(() => {
    const firstTimeline = guide.sections.find(
      (section) => section.kind === "RECOVERY_TIMELINE"
    );
    return firstTimeline?.key ?? null;
  });
  const [publishOpen, setPublishOpen] = useState(false);
  const [saveState, saveAction, saving] = useActionState(
    saveGuideDraftAction,
    emptyAction
  );
  const [publishState, publishAction, publishing] = useActionState(
    publishGuideAction,
    emptyAction
  );

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
  const serverSerialized = useMemo(
    () =>
      JSON.stringify({
        title: guide.title,
        publicSlug: guide.publicSlug,
        introduction: guide.introduction ?? "",
        sections: toEditorSections(guide.sections),
      }),
    [guide]
  );
  const [confirmed, setConfirmed] = useState(serverSerialized);
  const dirty = serialized !== confirmed;
  const saveStatus = formSaveStatus({ dirty, pending: saving });
  const {
    open: discardOpen,
    requestLeave,
    keepEditing,
    discard,
  } = useUnsavedChangesGuard(dirty);

  useEffect(() => {
    setConfirmed(serverSerialized);
  }, [serverSerialized]);

  useEffect(() => {
    if (saveState.ok) {
      setConfirmed(pendingSnapshot.current);
      router.refresh();
    }
  }, [saveState, router]);

  useEffect(() => {
    if (publishState.ok) {
      router.refresh();
    }
  }, [publishState, router]);

  useEffect(() => {
    if (!saveState.error && !saveState.fieldErrors) {
      return;
    }
    const first = document.querySelector<HTMLElement>(
      "[data-guide-field][aria-invalid='true']"
    );
    if (first) {
      first.focus();
      return;
    }
    errorSummaryRef.current?.focus();
  }, [saveState]);

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

  const sourceLabel = guide.template
    ? `Template · ${guide.template.title}`
    : "Custom guide";

  const actions = (
    <>
      <button
        type="button"
        className="staffBtn staffBtnQuiet"
        onClick={() => requestLeave("/guides")}
      >
        Cancel
      </button>
      {canEdit ? (
        <>
          <button
            type="submit"
            form="guide-draft-form"
            disabled={saving}
            className="staffBtn staffBtnSecondary"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={publishing || dirty}
            title={
              dirty ? "Save the current draft before publishing." : undefined
            }
            className="staffBtn staffBtnPrimary"
            onClick={() => setPublishOpen(true)}
          >
            {publishing ? "Publishing…" : "Publish guide"}
          </button>
        </>
      ) : null}
    </>
  );

  const preview = (
    <EditorTimelinePreview stages={timeline} themeStyle={previewThemeStyle} />
  );

  const saveFeedback = (
    <SaveStatus
      status={saveStatus}
      error={saveState.error ?? publishState.error}
      success={
        publishState.ok
          ? "Guide published. Patients now see this version."
          : saveState.ok && !dirty
            ? "Draft saved. The public guide is unchanged until you publish."
            : undefined
      }
    />
  );

  return (
    <div className="staffEditorPage mx-auto flex w-full max-w-6xl flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <PortalBreadcrumb
          items={[
            { href: "/guides", label: "Guides" },
            { label: title || guide.title },
            { label: "Edit" },
          ]}
        />
        <Link
          href={`/guides/${guide.id}/preview`}
          className="staffBtn staffBtnQuiet"
        >
          Preview
        </Link>
      </header>

      <div className="staffEditorToolbar">
        <div className="staffEditorToolbarStart">
          <h1 className="staffEditorToolbarTitle">
            {title || guide.title || "Edit guide"}
          </h1>
          <div className="staffEditorToolbarMeta">
            <StatusPills pills={guide.statusPills} />
            <p className="staffEditorToolbarContext">{sourceLabel}</p>
            {saveFeedback}
          </div>
        </div>
        <div className="staffEditorToolbarActions">{actions}</div>
      </div>

      <div className="staffComposer">
        <form
          id="guide-draft-form"
          action={saveAction}
          className="staffComposerMain"
          onSubmit={() => {
            pendingSnapshot.current = serialized;
          }}
        >
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
                data-guide-field
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={!canEdit}
                aria-invalid={saveState.fieldErrors?.title ? "true" : "false"}
                className="staffField"
              />
              <FieldError message={saveState.fieldErrors?.title} />
            </Field>
            <Field label="Public slug" htmlFor="publicSlug">
              <input
                id="publicSlug"
                name="publicSlug"
                data-guide-field
                value={publicSlug}
                onChange={(event) => setPublicSlug(event.target.value)}
                disabled={!canEdit || guide.isPublished}
                aria-invalid={
                  saveState.fieldErrors?.publicSlug ? "true" : "false"
                }
                className="staffField staffFieldNarrow"
              />
              <p className="text-sm text-staff-muted">
                Patient URL:{" "}
                {patientUrlExample.replace(/\/[^/]*$/, `/${publicSlug || "…"}`)}
              </p>
              {guide.isPublished ? (
                <p className="text-sm text-staff-muted">
                  The published public URL is protected so existing patient
                  links keep working.
                </p>
              ) : null}
              <FieldError message={saveState.fieldErrors?.publicSlug} />
            </Field>
            <Field label="Short introduction" htmlFor="introduction">
              <textarea
                id="introduction"
                name="introduction"
                data-guide-field
                value={introduction}
                onChange={(event) => setIntroduction(event.target.value)}
                disabled={!canEdit}
                rows={4}
                aria-invalid={
                  saveState.fieldErrors?.introduction ? "true" : "false"
                }
                className="staffField h-auto py-2"
              />
              <FieldError message={saveState.fieldErrors?.introduction} />
            </Field>
          </EditorSectionHeading>

          <EditorSectionHeading title="Timeline">
            <TimelineStageEditor
              stages={timeline}
              disabled={!canEdit}
              openKey={openStageKey}
              onOpenKeyChange={setOpenStageKey}
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

          {saveState.error || saveState.fieldErrors?.sections ? (
            <p
              ref={errorSummaryRef}
              className="text-sm text-red-600"
              role="alert"
              tabIndex={-1}
            >
              {saveState.error ?? saveState.fieldErrors?.sections}
            </p>
          ) : null}

          {canEdit ? null : (
            <p className="text-sm text-staff-muted">
              Staff can view this guide but cannot edit it.
            </p>
          )}
        </form>

        <aside
          className="staffComposerRail"
          aria-label="Patient timeline preview"
        >
          <details className="staffPreviewDetails" open>
            <summary>Preview patient timeline</summary>
            <div className="staffPreviewDetailsBody">{preview}</div>
          </details>
        </aside>
      </div>

      {canEdit ? (
        <form id="guide-publish-form" action={publishAction} className="hidden">
          <input type="hidden" name="guideId" value={guide.id} />
        </form>
      ) : null}

      <div className="staffEditorActionsMobile">{actions}</div>

      <ConfirmDialog
        open={discardOpen}
        title="Discard unsaved changes?"
        description="Your latest changes haven't been saved."
        cancelLabel="Keep editing"
        confirmLabel="Discard changes"
        confirmTone="danger"
        onCancel={keepEditing}
        onConfirm={discard}
      />
      <ConfirmDialog
        open={publishOpen}
        title="Publish this guide?"
        description="Patients using the public guide will see this version."
        cancelLabel="Cancel"
        confirmLabel="Publish guide"
        confirmTone="primary"
        onCancel={() => setPublishOpen(false)}
        onConfirm={() => {
          setPublishOpen(false);
          const form = document.getElementById(
            "guide-publish-form"
          ) as HTMLFormElement | null;
          form?.requestSubmit();
        }}
      />
    </div>
  );
}

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

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return <p className="text-sm text-red-600">{message}</p>;
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
                className="staffSelect"
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
                className="staffField"
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
              className="staffField h-auto py-2"
            />
          </Field>
          {disabled ? null : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => move(index, -1)}
                className="staffBtn staffBtnSecondary"
              >
                Move up
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                className="staffBtn staffBtnSecondary"
              >
                Move down
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange(sections.filter((_, current) => current !== index))
                }
                className="staffBtn staffBtnSecondary"
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
                key: newEditorKey("section"),
                kind: kinds[0] ?? "CUSTOM",
                title: "New section",
                body: "Add clinic-provided guidance.",
                periodLabel: "",
                startDay: "",
                endDay: "",
              },
            ])
          }
          className="staffBtn staffBtnSecondary self-start"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
}
