# Marketing clinic enquiry delivery

Platform `/contact` submits a clinic enquiry through a server action. There is no client-side fake success: the confirmation state is returned only after `deliverMarketingContactEnquiry` succeeds.

This is business contact information, not patient health information. The form asks practices not to include patient or clinical details.

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
- No CAPTCHA in this pass

Revisit rate limiting or CAPTCHA when real traffic warrants it.

## Architecture

```text
ContactForm
  → submitMarketingContactAction
  → ContactEnquiry (Zod)
  → MarketingContactMailer (SMTP or memory)
```
