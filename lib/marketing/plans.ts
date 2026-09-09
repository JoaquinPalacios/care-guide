export const PRICING_DISCLAIMER =
  "Working Australian pricing. Provisional, and not a final commercial contract.";

export const LAUNCH_PLANS = [
  {
    id: "essential",
    name: "Essential",
    price: "A$79",
    cadence: "per month",
    position: "For a small practice getting started.",
    recommended: false,
    ctaLabel: "Request a demo",
    ctaHref: "/contact",
    features: [
      "1 practice / location",
      "Branded clinic aftercare page",
      "Controlled branding",
      "Curated dental guide library",
      "Permanent guide URLs",
      "QR-ready sharing from durable links",
      "Print / Save PDF",
      "Clinic contact and emergency information",
      "Light, dark, and system patient presentation",
    ],
  },
  {
    id: "practice",
    name: "Practice",
    price: "A$149",
    cadence: "per month",
    position: "The main plan for an established clinic.",
    recommended: true,
    ctaLabel: "Request a demo",
    ctaHref: "/contact",
    features: [
      "Everything in Essential",
      "Broader dental template library, enabled with you at onboarding",
      "Clinic section overrides",
      "Local instructions and clinic additions",
      "Custom clinic guides, prepared during onboarding",
      "Richer branding controls",
      "Operator-led clinic setup for launch",
      "Option to hide Aftercare Guide attribution",
    ],
  },
  {
    id: "group",
    name: "Group",
    price: "Custom pricing",
    cadence: null,
    position: "For multi-location groups that need a tailored rollout.",
    recommended: false,
    ctaLabel: "Talk to us",
    ctaHref: "/contact",
    features: [
      "Multiple locations",
      "Centralised management",
      "Custom onboarding",
      "Priority support",
    ],
  },
] as const;

export const COMING_AFTER_LAUNCH = [
  "Patient check-ins",
  "Advanced follow-up",
  "Connected recovery plans",
  "Messaging and integrations",
] as const;

export const PRICING_NOTES = [
  {
    title: "Assisted onboarding",
    body: "Assisted onboarding is available. Setup is handled with you rather than as a self-serve wizard.",
  },
  {
    title: "Billing",
    body: "These are working monthly prices in Australian dollars. Self-serve billing and an annual option are not published yet.",
  },
  {
    title: "Launch scope",
    body: "Active plans describe aftercare pages, branding, templates, and clinic-controlled publishing. They do not include live clinical monitoring, persisted patient check-ins, CRM, messaging, or PMS integrations.",
  },
] as const;
