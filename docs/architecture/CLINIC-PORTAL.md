# Clinic portal and platform operator — Phase 2A

Staff/admin UI for Aftercare Guide. Patient tenant rendering remains the source of truth for branding and guide documents.

## Hosts

| Host               | Audience               | Surface                                   |
| ------------------ | ---------------------- | ----------------------------------------- |
| Apex / `localhost` | Public                 | Marketing (`/`, `/pricing`, `/contact`)   |
| `app.<root>`       | Clinic staff, operator | Clinic portal, operator, parked chairside |
| `<slug>.<root>`    | Patients               | Branded aftercare only                    |

## Clinic portal

Primary navigation (one group, identical row treatment):

1. Overview — `/dashboard`
2. Guides — `/guides`
3. Practice — `/practice` (clinic `ADMIN` only)

Utility action, separated by a divider:

- View patient site ↗ — real tenant origin, new tab

Preferences, separated by a divider, above account:

- Appearance — System / Light / Dark for the **staff/operator shell**. Stored as `aftercare-guide-portal-theme` on this device. Does **not** change `ClinicProfile.themeMode` (patient presentation).

Account/sign-out stay below Appearance. Sign out uses the same full-row hit area as other sidebar utility rows (minimum 44px). It is account navigation, not a high-prominence destructive action.

### User-facing role labels

Raw enums never appear in the UI. Role is always accessible text (not colour-only).

| Actor                     | Product label         | Notes                                                   |
| ------------------------- | --------------------- | ------------------------------------------------------- |
| Clinic membership `ADMIN` | **Clinic admin**      | Clinic mutations only. Not a platform administrator.    |
| Clinic membership `STAFF` | **Clinic staff**      | Read-only guides. No Edit, delete/discard, or Practice. |
| Platform `OPERATOR`       | **Platform operator** | Operator surface only (`/operator/*`).                  |

Sidebar account area shows the person's name (or email) plus that role on a second line.

### Desktop shell

From Phase 2A.2 the desktop portal is an application shell:

- Sidebar is viewport height (`100dvh`), anchored, and does not scroll away with the document.
- Main content scrolls independently.
- If the sidebar cannot fit on a short viewport, it may scroll internally.
- Mobile keeps the responsive drawer. The fixed desktop layout is not forced below the `md` breakpoint.

### Guide editor

Desktop: a slim sticky application toolbar (about 56–64px) holds the guide title, Draft status pill, quiet save-state (`Saved` / `Unsaved changes` / `Saving…`), and Cancel / Save draft / Publish guide. The right column is the live patient timeline preview, sticky, with viewport-based max-height. Status and actions no longer live in a large preview-rail card.

Mobile/tablet: heading plus Draft/Saved state stay with the editor; the compact bottom action bar remains; patient-timeline preview is a collapsible section. There is no sticky horizontal toolbar that consumes phone height.

Timeline stages are an exclusive accordion (one open at a time). Add stage creates and opens the new stage. Collapse does not auto-save. Errors remain visible on the collapsed header as “Needs attention”.

The live preview reuses the presentational recovery timeline list used by the public patient renderer. It reflects the current unsaved editor state. Empty preview copy is quiet on the patient-preview surface. Public patient routes stay server-first.

Authenticated draft preview uses a staff toolbar outside `PatientPage`, including the same status pills. Public tenant URLs never render that toolbar.

Cancel returns to `/guides`. Unsaved edits open a discard confirmation (Keep editing / Discard changes). Save draft does not change the public pinned revision. Publish asks for confirmation, then pins an immutable snapshot.

Destructive confirmations use the native `<dialog>` element with Aftercare Guide application chrome (not a browser/native alert look). One `ConfirmDialog` covers dirty cancel, publish, delete draft, and discard draft changes.

### Practice

One route with internal sections: Practice identity, Branding, Contact, Emergency / urgent help, Patient presentation.

Header uses portal spacing (eyebrow / title / description, then ~2.25rem before the form). Desktop has a section index with consistent row height, hover/focus, and `aria-current` for the section in view (IntersectionObserver). Section-nav clicks smooth-scroll unless `prefers-reduced-motion: reduce`. Sections use `scroll-margin-top`.

Colour fields are one native colour control plus a hex input. Portal selects use extra padding for the chevron (`staffSelect`). Save status and Save changes sit compactly at the top of the form column (sticky within the scrolling document, not a full-bleed marketing bar). The form column is width-capped so large screens do not stretch fields unnecessarily. Grid/flex children use `min-width: 0` so the page does not overflow horizontally.

### Permissions

| Actor               | Portal                    | Guides                                      | Practice                       | Operator      |
| ------------------- | ------------------------- | ------------------------------------------- | ------------------------------ | ------------- |
| Clinic `ADMIN`      | Yes                       | Create, edit, save, publish, delete/discard | Edit identity/branding/contact | Not found     |
| Clinic `STAFF`      | Overview + Guides         | View + draft/public preview                 | Not found                      | Not found     |
| Platform `OPERATOR` | Redirected to All Clinics | No clinic membership locally                | No                             | `/operator/*` |

Mutations authorize on the server: authenticated user → clinic membership → `ADMIN` → resource `clinicId` from membership, never from the form.

## Guide lifecycle

Canonical template or custom guide → working draft (`PracticeGuideRevision` version 0) → authenticated preview at `/guides/[id]/preview` → explicit Publish copies an immutable snapshot → tenant URL serves that pin.

See [ADR 0017](../adr/0017-clinic-owned-practice-revisions-pin-public-documents.md).

### Draft delete and discard (Phase 2A.2)

| State                           | Destructive action                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Never published                 | **Delete draft** — removes the clinic guide after confirmation                                     |
| Published + newer draft changes | **Discard draft changes** — working draft restored to the published snapshot; public pin unchanged |
| Published with no draft changes | None this phase. Unpublish/archive is deferred because durable URLs may exist                      |

STAFF never sees these actions. Server functions scope by session membership `clinicId`; cross-clinic delete is impossible.

Templates already enabled show **Already in your guides** and cannot be duplicated.

## Generic guide dates

Public generic guides have no patient-specific treatment date. Timeline copy stays relative (`Day 0 · Procedure day`, period labels such as “Days 2–3”). Do **not** derive Day 0 from `Date.now()` or the browser calendar. Actual calendar dates require a future `RecoveryPlan.startedAt` / procedureDate. The interactive `demodental` demo may show a calendar caption only from an **explicit** `simulatedStartDate` fixture (`2026-09-10`) plus `simulatedDay: 1`.

## Logo

Upload is **blocked** until production object storage is provisioned. Practice shows the current mark and an explicit unavailable state. There is no file input. See [ADR 0019](../adr/0019-clinic-logo-upload-requires-object-storage.md) and [CLINIC-ASSETS.md](CLINIC-ASSETS.md).

## Operator console

The operator console is the Aftercare Guide operational control plane. Page identity is **PLATFORM / All Clinics**. Local seed identity may show **Demo Operator** as the account name; that is not a demo product.

Current primary destination: **Clinics**. Do not add dead navigation. Canonical **Templates** management is the next operator-console capability and is not implemented here.

All Clinics may show real derived counts: total clinics, configured clinics, published guides, needs attention. No invented analytics.

Clinic table rows use a real practice link that covers the row for pointer users while remaining a semantic link.

## Clinic seats (provisional policy — not enforced)

Do not share one clinic login. Named membership accounts are required for accountability, revocation, ADMIN vs STAFF, and future audit.

| Plan      | Named users included |
| --------- | -------------------- |
| Essential | 2                    |
| Practice  | 5                    |
| Group     | custom               |

Current roles remain Clinic ADMIN and Clinic STAFF only. Invitations, seat-limit enforcement, and Team / Users management are later portal work.

## Application architecture

Launch backend remains Next.js App Router + Server Actions + Prisma. See [APPLICATION.md](APPLICATION.md). NestJS is not part of MVP.
