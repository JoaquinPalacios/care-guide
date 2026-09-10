# Marketing clinic enquiry delivery

Platform `/contact` submits a clinic enquiry through a server action. There is no client-side fake success: the confirmation state is returned only after `deliverMarketingContactEnquiry` succeeds.

This is business contact information, not patient health information. The form asks practices not to include patient or clinical details.

## Fields

Required:

- Full name
- Email (user-facing label; the internal field name remains `workEmail`)
- Practice / clinic name

Optional:

- Phone
- Anything you'd like us to know?

The form does **not** ask for number of locations, patient information, or clinical details.

## Launch mailbox recommendation

Use a brand-domain inbox once the public domain is secured. Do not hard-code a guessed commercial domain in the app.

| Address                        | Use                                                    |
| ------------------------------ | ------------------------------------------------------ |
| `hello@<brand-domain>`         | Primary public commercial mailbox for clinic enquiries |
| `support@<brand-domain>`       | Future customer support                                |
| `notifications@<brand-domain>` | Future automated service email                         |

Local / documentation examples only:

```bash
MARKETING_CONTACT_TO_EMAIL=hello@example.test
MARKETING_CONTACT_FROM_EMAIL=website@example.test
```

## Environment

Server-only. Never commit credentials.

| Variable                       | Purpose                                                  |
| ------------------------------ | -------------------------------------------------------- |
| `MARKETING_CONTACT_TO_EMAIL`   | Destination inbox (`hello@<brand-domain>` in production) |
| `MARKETING_CONTACT_FROM_EMAIL` | Envelope From (`website@<brand-domain>`)                 |
| `MARKETING_CONTACT_MAILER`     | `smtp` (default) or `memory` (local/E2E sink only)       |
| `SMTP_HOST`                    | SMTP host                                                |
| `SMTP_PORT`                    | Defaults to `587` when unset and host is present         |
| `SMTP_USER`                    | Optional SMTP username                                   |
| `SMTP_PASSWORD`                | Optional SMTP password                                   |
| `SMTP_SECURE`                  | `true` / `1` for implicit TLS                            |

`MARKETING_CONTACT_EMAIL` remains a local fallback for the **to** address only.

Production delivery requires real `TO` / `FROM` values plus working SMTP credentials. Cursor Cloud does not provision that infrastructure. Until those are set, the form validates and the server returns a configuration error — it does not claim the enquiry was sent.

`MARKETING_CONTACT_MAILER=memory` is for local development and Playwright. Do not use it in production.

## Abuse baseline

- Server Zod validation and maximum lengths
- Honeypot field (`website`)
- In-process throttle: 5 attempts / 10 minutes per client IP
- HTML is escaped in the HTML email part; fields are treated as plain text
- No CAPTCHA or Turnstile in this pass

A **Cloudflare Turnstile** (or equivalent) challenge is **HIGH PRIORITY before launch or immediately after launch**. Do not implement it from a marketing polish task. When it is added:

- Verify the token **server-side**. A client widget alone is not protection.
- Fail gracefully: the form must not silently drop legitimate clinic enquiries if the challenge provider is down or the token check errors.
- Keep the form accessible (Turnstile has an accessibility mode). Do not block keyboard or screen-reader users.
- This remains a business enquiry form. Do not collect patient or clinical information.

See [POST-LAUNCH-ROADMAP.md](../product/POST-LAUNCH-ROADMAP.md).

## Client boundary

`app/(marketing)/components/contact-form.tsx` is the only Contact client island. Inline validation uses `lib/marketing/contact-fields.ts` (no Zod). Server validation still uses Zod in `contact-enquiry.ts` before the mailer runs.

## Architecture

```text
ContactForm
  → submitMarketingContactAction
  → ContactEnquiry (Zod, server-only)
  → MarketingContactMailer (SMTP or memory)
```
