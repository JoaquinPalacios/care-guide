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

### Guide editor

Cancel returns to `/guides`. Unsaved edits open a discard confirmation (Keep editing / Discard changes). Save draft does not change the public pinned revision. Publish asks for confirmation, then pins an immutable snapshot.

Authenticated draft preview uses a staff toolbar outside `PatientPage`. Public tenant URLs never render that toolbar.

### Practice

One route with internal sections: Practice identity, Branding, Contact, Emergency / urgent help, Patient presentation. Save-state is `Saved` / `Unsaved changes` / `Saving…`.

### Permissions

| Actor               | Portal                    | Guides                       | Practice                       | Operator      |
| ------------------- | ------------------------- | ---------------------------- | ------------------------------ | ------------- |
| Clinic `ADMIN`      | Yes                       | Create, edit, save, publish  | Edit identity/branding/contact | Not found     |
| Clinic `STAFF`      | Overview + Guides         | View + draft/public preview  | Not found                      | Not found     |
| Platform `OPERATOR` | Redirected to All Clinics | No clinic membership locally | No                             | `/operator/*` |

Mutations authorize on the server: authenticated user → clinic membership → `ADMIN` → resource `clinicId` from membership, never from the form.

## Guide lifecycle

Canonical template or custom guide → working draft (`PracticeGuideRevision` version 0) → authenticated preview at `/guides/[id]/preview` → explicit Publish copies an immutable snapshot → tenant URL serves that pin.

See [ADR 0017](../adr/0017-clinic-owned-practice-revisions-pin-public-documents.md).

## Logo

Upload is **blocked** until production object storage exists. Practice shows the current mark plus “Upload logo — coming before launch”. There is no file input. See [ADR 0019](../adr/0019-clinic-logo-upload-requires-object-storage.md).
