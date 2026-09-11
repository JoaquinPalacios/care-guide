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

Visible role labels (text, not colour-only):

| Membership / platform role | Product-facing label |
| -------------------------- | -------------------- |
| Clinic `ADMIN`             | Clinic admin         |
| Clinic `STAFF`             | Clinic staff         |
| Platform `OPERATOR`        | Platform operator    |

Clinic admin is not a platform administrator. Operator chrome uses **Platform operator**.

Desktop portal/operator shells use `100dvh`: the sidebar is viewport-tall and independently scrollable; main content scrolls on its own. Mobile keeps the drawer/menu.

### Guides list

Title, then status pills (`Draft` / `Published` / `Draft changes`) plus source, then slug and updated date. Edit is the principal row action; Preview is secondary; View patient guide is a quiet external utility. STAFF has no Edit.

### Draft delete / discard

| Guide state                        | Destructive action    |
| ---------------------------------- | --------------------- |
| Never published                    | Delete draft          |
| Published with newer draft changes | Discard draft changes |
| Published with no draft changes    | None in this phase    |

Delete removes an unpublished clinic guide after confirmation. Discard restores the working draft from the current published revision; the public pin is unchanged. Unpublish/archive of a public guide is deferred because durable patient URLs may already exist. STAFF cannot delete or discard. Server mutations require session + clinic membership + ADMIN + membership `clinicId`.

### Guide editor

Desktop: editor column (~60–65%) plus a sticky right rail (~35–40%) for status, Cancel / Save draft / Publish, and a live patient timeline preview. The old full-width sticky editor chrome is gone. Mobile/tablet: editor first, compact bottom action bar, collapsible patient-timeline preview.

Timeline stages are an accordion (one open at a time). Add stage opens the new stage. Collapsed cards show when/what plus **Needs attention** when invalid. Draft save stays explicit.

The live preview reuses `GuideTimeline` (compact) from the patient surface, fed from the same editor island state. The public patient route remains server-first.

### Practice

One route with internal sections: Practice identity, Branding, Contact, Emergency / urgent help, Patient presentation. Section index uses IntersectionObserver for the active section, smooth scrolling (instant when `prefers-reduced-motion: reduce`), and `scroll-margin-top`. Colour controls are one native picker plus hex input. Native selects keep keyboard behaviour with extra chevron padding. Save-state is a compact sticky row: `Saved` / `Unsaved changes` / `Saving…` plus Save changes.

### Permissions

| Actor               | Portal                    | Guides                                                                        | Practice                       | Operator      |
| ------------------- | ------------------------- | ----------------------------------------------------------------------------- | ------------------------------ | ------------- |
| Clinic `ADMIN`      | Yes                       | Create, edit, save, publish, delete unpublished drafts, discard draft changes | Edit identity/branding/contact | Not found     |
| Clinic `STAFF`      | Overview + Guides         | View + draft/public preview                                                   | Not found                      | Not found     |
| Platform `OPERATOR` | Redirected to All Clinics | No clinic membership locally                                                  | No                             | `/operator/*` |

Mutations authorize on the server: authenticated user → clinic membership → `ADMIN` → resource `clinicId` from membership, never from the form.

## Guide lifecycle

Canonical template or custom guide → working draft (`PracticeGuideRevision` version 0) → authenticated preview at `/guides/[id]/preview` → explicit Publish copies an immutable snapshot → tenant URL serves that pin.

See [ADR 0017](../adr/0017-clinic-owned-practice-revisions-pin-public-documents.md).

## Dates

Generic public guides use relative recovery language (`Day 0 · Procedure day`, `Days 2–3`). They must not treat the browser's current date as Day 0. Calendar dates belong to a future `RecoveryPlan.startedAt` / procedure date. The `demodental` interactive demo may show a calendar label only from an **explicit** `simulatedStartDate` fixture.

## Logo

Upload is **blocked** until production object storage exists. Practice shows the current mark plus “Upload logo — coming before launch”. There is no file input. See [ADR 0019](../adr/0019-clinic-logo-upload-requires-object-storage.md).
