<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Care Guide product contract

Authoritative product requirements: `docs/product/PRD.md` (v1.0 — Aftercare SaaS).

Care Guide’s **product direction** is branded aftercare SaaS for healthcare practices. The **current codebase** is staff auth, a **parked** chairside procedure-session product, and the Phase 1A aftercare data/domain foundation (no public tenant routes yet). Do not treat chairside sessions as the aftercare architecture. Aftercare must not depend on `ProcedureSession`. Do not claim aftercare MVP features are implemented until they exist.
