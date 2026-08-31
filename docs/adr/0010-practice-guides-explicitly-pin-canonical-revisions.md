# ADR 0010 — Practice guides explicitly pin canonical revisions

- **Status:** Accepted
- **Date:** 2026-08-31
- **PRD:** [../product/PRD.md](../product/PRD.md) §§12.2, 13.1–13.3, open decision OD-4

## Context

Canonical Guide Templates are versioned as `GuideTemplateRevision` records. A Practice Guide is a practice’s enabled configuration of one template, including section overrides and additions.

If a published Practice Guide always followed the latest published canonical revision, a Care Guide library update would silently change patient-visible content for every practice already live on that template. Aftercare is health-related. Practices must be able to review and adopt a revision rather than inherit it automatically.

The opposite extreme — copying canonical text into a practice-owned fork — would lose provenance and make platform-wide template maintenance impossible.

## Decision

A Practice Guide **explicitly pins** one `GuideTemplateRevision`.

- Publishing a new canonical revision does **not** alter an existing published Practice Guide.
- The patient-visible composed guide is always the pinned revision, plus that practice’s overrides and additions.
- Adopting a newer revision is an explicit later operator action (out of Phase 1A scope).

Automatic “always latest published revision” is rejected for Phase 1 and for the MVP product contract.

## Integrity

`PracticeGuide.guideTemplateId` must equal `PracticeGuide.pinnedRevision.guideTemplateId`.

This is enforced in PostgreSQL with a composite foreign key:

```text
PracticeGuide(pinnedRevisionId, guideTemplateId)
  → GuideTemplateRevision(id, guideTemplateId)
```

A Practice Guide for template A cannot pin a revision that belongs to template B.

## Consequences

- Practices can stay on a reviewed revision while Care Guide prepares the next library version.
- Operator admin (Phase 2+) needs an adopt/pin workflow and preview against the candidate revision.
- Analytics, QR, and public URLs stay attached to the Practice Guide identity, not to a floating “latest” pointer.

## Future possibility

A **governed hybrid** remains possible later: for example notify practices of a new revision, open a draft pointing at it, and require explicit publish. That would still pin a revision; it would not silently rewrite live patient pages. OD-4 in the PRD stays open for rollout UX, not for the pin invariant.
