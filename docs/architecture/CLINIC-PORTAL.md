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

Account/sign-out stay below Appearance.

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

Page header is a normal document header: `Guides / {title} / Edit`, the guide title, and status pills (`Draft` / `Published` / `Draft changes`) plus source.

Desktop uses a two-column layout: editor (~60–65%) and a sticky right rail (~35–40%) with Cancel (quiet), Save draft (secondary), Publish guide (primary), save status, and a live patient timeline preview. The previous full-width sticky editor action chrome is gone.

Timeline stages are an exclusive accordion (one open at a time). Add stage creates and opens the new stage. Collapse does not auto-save. Errors remain visible on the collapsed header as “Needs attention”.

The live preview reuses the presentational recovery timeline list used by the public patient renderer. It reflects the current unsaved editor state. Public patient routes stay server-first.

Mobile: editor first, compact sticky bottom actions, collapsible “Preview patient timeline”.

Authenticated draft preview uses a staff toolbar outside `PatientPage`, including the same status pills. Public tenant URLs never render that toolbar.

Cancel returns to `/guides`. Unsaved edits open a discard confirmation (Keep editing / Discard changes). Save draft does not change the public pinned revision. Publish asks for confirmation, then pins an immutable snapshot.

### Practice

One route with internal sections: Practice identity, Branding, Contact, Emergency / urgent help, Patient presentation.

Header uses portal spacing (eyebrow / title / description, then ~2.25rem before the form). Desktop has a section index with consistent row height, hover/focus, and `aria-current` for the section in view (IntersectionObserver). Section-nav clicks smooth-scroll unless `prefers-reduced-motion: reduce`. Sections use `scroll-margin-top`.

Colour fields are one native colour control plus a hex input. Portal selects use extra padding for the chevron (`staffSelect`). Save status and Save changes sit compactly at the top of the form column (sticky within the scrolling document, not a full-bleed marketing bar).

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

Upload is **blocked** until production object storage exists. Practice shows the current mark plus “Upload logo — coming before launch”. There is no file input. See [ADR 0019](../adr/0019-clinic-logo-upload-requires-object-storage.md).
