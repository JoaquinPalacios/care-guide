"use client";

import {
  newEditorKey,
  type EditorSection,
} from "@/app/(staff)/(clinic-portal)/guides/editor-types";
import {
  stageExcerpt,
  stageIssueMessage,
  stageSummary,
} from "@/app/(staff)/(clinic-portal)/guides/stage-issues";

const fieldClass = "staffField";

export function TimelineStageEditor({
  stages,
  disabled,
  openKey,
  onOpenKeyChange,
  onChange,
}: {
  stages: EditorSection[];
  disabled: boolean;
  openKey: string | null;
  onOpenKeyChange: (key: string | null) => void;
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

  function addStage() {
    const key = newEditorKey("stage");
    onChange([
      ...stages,
      {
        key,
        kind: "RECOVERY_TIMELINE",
        title: "New stage",
        body: "Add recovery instructions for this period.",
        periodLabel: "",
        startDay: "",
        endDay: "",
      },
    ]);
    onOpenKeyChange(key);
  }

  return (
    <div className="staffStageList">
      {stages.map((stage, index) => {
        const open = openKey === stage.key;
        const panelId = `stage-panel-${stage.key}`;
        const summary = stageSummary(stage);
        const issue = stageIssueMessage(stage, stages);
        const excerpt = stageExcerpt(stage);

        return (
          <article
            key={stage.key}
            className="staffStage"
            data-stage-key={stage.key}
            data-open={open ? "true" : "false"}
          >
            <button
              type="button"
              className="staffStageHeader"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => onOpenKeyChange(open ? null : stage.key)}
            >
              <span>
                <p className="staffStageWhen">{summary.when}</p>
                <p className="staffStageWhat">{summary.what}</p>
                {open || !excerpt ? null : (
                  <p className="staffStageExcerpt">{excerpt}</p>
                )}
                {issue ? (
                  <p className="staffStageAlert" data-stage-alert="">
                    {issue}
                  </p>
                ) : null}
              </span>
            </button>
            <div
              id={panelId}
              className="staffStagePanel"
              data-open={open ? "true" : "false"}
              inert={!open || undefined}
            >
              <div className="staffStagePanelInner">
                <div className="staffStageFields">
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
                        className={`${fieldClass} staffFieldTiny`}
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
                        className={`${fieldClass} staffFieldTiny`}
                      />
                    </Field>
                  </div>
                  <Field label="Instructions" htmlFor={`${stage.key}-body`}>
                    <textarea
                      id={`${stage.key}-body`}
                      value={stage.body}
                      onChange={(event) =>
                        update(index, { body: event.target.value })
                      }
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
                          onChange(
                            stages.filter((_, current) => current !== index)
                          )
                        }
                        className="staffBtn staffBtnSecondary"
                      >
                        Remove stage
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
      {disabled ? null : (
        <button
          type="button"
          onClick={addStage}
          className="staffBtn staffBtnSecondary self-start"
        >
          Add stage
        </button>
      )}
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
