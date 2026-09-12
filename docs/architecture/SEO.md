# Launch SEO and indexing — River Aftercare

Pre-launch search policy for Phase 2A.5. This is not a content-acquisition programme.

## Surfaces

| Surface                                           | Host                            | Index  | Follow | Sitemap | Notes                                                      |
| ------------------------------------------------- | ------------------------------- | ------ | ------ | ------- | ---------------------------------------------------------- |
| Marketing `/`, `/pricing`, `/contact`             | apex / `localhost`              | yes    | yes    | yes     | Title, description, canonical, Open Graph, Twitter summary |
| Staff portal `/dashboard`, `/guides`, `/practice` | `app.<root>`                    | no     | no     | no      | Authenticated clinic chrome                                |
| Operator `/operator/*`                            | `app.<root>`                    | no     | no     | no      | Platform control plane                                     |
| Authenticated draft preview                       | `app.<root>/guides/:id/preview` | no     | no     | no      | Never a public canonical                                   |
| Parked chairside `/display`, `/sessions`          | `app.<root>`                    | no     | no     | no      | Existing anti-index posture                                |
| Tenant home and published guides                  | `<clinic>.<root>`               | **no** | yes    | **no**  | Shareable aftercare documents; not SEO inventory           |
| Internal rewrites `/_marketing`, `/_sites`        | n/a                             | no     | no     | no      | Blocked from the public Host                               |

`robots.txt` allows the three marketing paths and disallows authenticated/internal prefixes. Page-level Next.js `robots` metadata is the real noindex control. Do not rely on `robots.txt` alone.

## Tenant metadata

Resolved from published clinic/guide content, then HTML-stripped:

- Title: `{Guide title} {instruction noun} | {Practice}`
  Example (AFTERCARE terminology): `Tooth Extraction Aftercare | Riverside Dental`
  Demo clinic uses POST_TREATMENT: `Tooth Extraction Post-treatment | Riverside Dental Demo`
- Description: `{instruction label} for {guide title} from {Practice}.`
  Example: `Aftercare instructions for tooth extraction from Riverside Dental.`
- Canonical: actual tenant hostname + public slug. Never `/_sites/...`.
- Open Graph / Twitter: same title/description/canonical for messaging apps.

Do not invent medical claims. Draft and unpublished guides 404 on the tenant host and must not emit a public canonical.

Print routes reuse the **guide** canonical (not `/print`) and stay noindex.

## Future search visibility

Launch default is **private from search**. Do not add a Prisma field until a clinic can actually opt in.

Likely later contract:

```
searchVisibility: PRIVATE_FROM_SEARCH | INDEXABLE
```

Default: `PRIVATE_FROM_SEARCH`. A clinic admin may opt a **published** guide into indexing. Operator may set platform defaults/policies. Until then, tenant `noindex` stays in metadata.

## Where SEO fields belong

Do **not** add a standalone Operator “SEO” tab.

Content architecture:

```
Platform canonical Guide Template
  → default title/description/social
Clinic enabled Guide
  → optional clinic overrides
Practice-level defaults
  → clinic identity used in titles
Published patient page
```

SEO/search metadata should attach to those resources when CMS work lands.

## Operator as content/control plane

Operator is evolving into the platform CMS: Clinics now; Templates / content management later. SEO controls stay contextual inside those resources. Do not ship empty Templates or SEO navigation.

## Structured data

Marketing already emits `SoftwareApplication` without ratings, offers, or certifications.

Do **not** add `MedicalWebPage`, `MedicalProcedure`, doctor identity, clinical review, or ratings schema. Current product data does not support accreditation or named clinicians. `Organization` / clinic identity may be appropriate later when Practice fields are treated as a public business profile.

## Implementation map

| Concern                | Location                                                  |
| ---------------------- | --------------------------------------------------------- |
| Marketing metadata     | `lib/marketing/metadata.ts`, `app/(marketing)/layout.tsx` |
| Tenant metadata        | `lib/aftercare/tenant-metadata.ts`                        |
| Robots constants       | `lib/seo/robots-policy.ts`                                |
| HTML stripping         | `lib/seo/metadata-text.ts`                                |
| `robots.txt` / sitemap | `app/robots.ts`, `app/sitemap.ts`                         |
| Icon                   | `public/icon.svg`                                         |
