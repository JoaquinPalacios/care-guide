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

Desktop: a slim sticky application toolbar (about 56–64px) holds the guide title, Draft status pill, quiet save-state (`Saved` / `Unsaved changes` / `Saving…`), and Cancel / Save draft / Publish guide. The right column is the live patient timeline preview, sticky, with viewport-based max-height. Status and actions no longer live in a large preview-rail card.

Mobile/tablet: heading plus Draft/Saved state stay with the editor; the compact bottom action bar remains; patient-timeline preview is a collapsible section. There is no sticky horizontal toolbar that consumes phone height.

Timeline stages are an accordion (one open at a time). Add stage opens the new stage. Collapsed cards show when/what plus **Needs attention** when invalid. Draft save stays explicit.

The live preview reuses `GuideTimeline` (compact) from the patient surface, fed from the same editor island state. Empty preview copy is quiet on the patient-preview surface. The public patient route remains server-first.

Destructive confirmations use the native `<dialog>` element with Aftercare Guide application chrome (not a browser/native alert look). One `ConfirmDialog` covers dirty cancel, publish, delete draft, and discard draft changes.

### Practice

One route with internal sections: Practice identity, Branding, Contact, Emergency / urgent help, Patient presentation. Section index uses IntersectionObserver for the active section, smooth scrolling (instant when `prefers-reduced-motion: reduce`), and `scroll-margin-top`. Colour controls are one native picker plus hex input. Native selects keep keyboard behaviour with extra chevron padding. Save-state is a compact sticky row: `Saved` / `Unsaved changes` / `Saving…` plus Save changes. The form column is width-capped so large screens do not stretch fields unnecessarily. Grid/flex children use `min-width: 0` so the page does not overflow horizontally.

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
