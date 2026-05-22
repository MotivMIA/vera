export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

export type LegalDocument = {
  slug: string;
  title: string;
  description: string;
  lastUpdated: string;
  blocks: LegalBlock[];
};

const BRAND = "Visual Era";
const CONTACT_EMAIL = "hello@visual-era.com";
const PRIVACY_EMAIL = "privacy@visual-era.com";
const DMCA_EMAIL = "legal@visual-era.com";

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    slug: "terms",
    title: "Terms and Conditions",
    description: "Terms governing use of Visual Era creator onboarding and management services.",
    lastUpdated: "May 21, 2026",
    blocks: [
      {
        type: "paragraph",
        text: `These Terms govern your use of services provided by ${BRAND}, a creator management platform operating under Florida law.`,
      },
      { type: "heading", text: "1. Eligibility" },
      {
        type: "paragraph",
        text: "You must be at least 18 years old. Age and identity verification may be required under applicable law, including 18 U.S.C. § 2257 where relevant.",
      },
      { type: "heading", text: "2. Services" },
      {
        type: "paragraph",
        text: "Services include onboarding, identity verification coordination, document signing, compliance support, and creator management tools. Earnings and outcomes are not guaranteed.",
      },
      { type: "heading", text: "3. Responsibilities" },
      {
        type: "paragraph",
        text: "You must provide accurate information, comply with laws and platform rules, and ensure all content you create or distribute is legal and consensual.",
      },
      { type: "heading", text: "4. Compensation" },
      {
        type: "paragraph",
        text: "Compensation and revenue share terms are defined in your signed management or client agreements with Visual Era.",
      },
      { type: "heading", text: "5. Intellectual Property" },
      {
        type: "paragraph",
        text: "You retain ownership of your content while granting Visual Era a limited license to manage, promote, and operate accounts as described in your agreements.",
      },
      { type: "heading", text: "6. Confidentiality" },
      {
        type: "paragraph",
        text: "Confidential business, financial, and personal information shared during onboarding must not be disclosed without authorization.",
      },
      { type: "heading", text: "7. Termination" },
      {
        type: "paragraph",
        text: "Either party may terminate according to the terms of your management agreement or applicable law.",
      },
      { type: "heading", text: "8. Limitation of Liability" },
      {
        type: "paragraph",
        text: 'Services are provided "as is." To the fullest extent permitted by law, liability is limited to direct damages arising from our gross negligence or willful misconduct.',
      },
      { type: "heading", text: "9. Disputes" },
      {
        type: "paragraph",
        text: "These Terms are governed by Florida law. Disputes will be resolved through binding arbitration in Miami-Dade County, Florida. Class actions are waived.",
      },
      { type: "heading", text: "10. Privacy" },
      {
        type: "paragraph",
        text: "See our Privacy Policy at /legal/privacy for how we collect and use personal data.",
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description: "How Visual Era collects, uses, and protects personal information.",
    lastUpdated: "May 21, 2026",
    blocks: [
      {
        type: "paragraph",
        text: `${BRAND} respects your privacy and complies with applicable data protection laws, including the Florida Information Protection Act.`,
      },
      { type: "heading", text: "Information we collect" },
      {
        type: "paragraph",
        text: "We collect information necessary for account access, identity verification status, document signing, audit logging, and legal compliance. DIDIT processes identity documents; Visual Era stores verification status and metadata, not raw ID images.",
      },
      { type: "heading", text: "How we use data" },
      {
        type: "paragraph",
        text: "Data is used to operate onboarding, verify eligibility, maintain audit trails, communicate with you, and meet legal obligations.",
      },
      { type: "heading", text: "Security" },
      {
        type: "paragraph",
        text: "We use reasonable technical and organizational safeguards. No system is completely secure.",
      },
      { type: "heading", text: "Retention" },
      {
        type: "paragraph",
        text: "Records are retained as required by law, contractual obligations, and legitimate business needs.",
      },
      { type: "heading", text: "Your rights" },
      {
        type: "paragraph",
        text: `You may request access, correction, or deletion of your data by contacting ${PRIVACY_EMAIL}.`,
      },
    ],
  },
  {
    slug: "code-of-conduct",
    title: "Code of Conduct",
    description: "Professional and content standards for Visual Era creators and partners.",
    lastUpdated: "May 21, 2026",
    blocks: [
      { type: "heading", text: "General conduct" },
      {
        type: "paragraph",
        text: "All participants must behave professionally, lawfully, and respectfully toward staff, partners, and other creators.",
      },
      { type: "heading", text: "Content rules" },
      {
        type: "paragraph",
        text: "Content must be original where represented as such, consensual, adult-only where applicable, and compliant with platform rules and law.",
      },
      { type: "heading", text: "Compliance" },
      {
        type: "paragraph",
        text: "Parties must cooperate with age verification, record-keeping, and platform compliance requirements.",
      },
      { type: "heading", text: "Consequences" },
      {
        type: "paragraph",
        text: "Violations may result in suspension, termination, or referral to appropriate authorities.",
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility Statement",
    description: "Visual Era commitment to accessible digital experiences.",
    lastUpdated: "May 21, 2026",
    blocks: [
      {
        type: "paragraph",
        text: `${BRAND} is committed to accessibility and strives to meet WCAG 2.1 Level AA where practicable.`,
      },
      {
        type: "paragraph",
        text: `If you encounter accessibility barriers, contact ${CONTACT_EMAIL} with the page URL and a description of the issue.`,
      },
    ],
  },
  {
    slug: "dmca",
    title: "DMCA Takedown Policy",
    description: "Copyright infringement notice procedures.",
    lastUpdated: "May 21, 2026",
    blocks: [
      {
        type: "paragraph",
        text: `${BRAND} respects intellectual property rights and complies with the Digital Millennium Copyright Act (17 U.S.C. § 512).`,
      },
      { type: "heading", text: "1. Reporting infringement" },
      {
        type: "paragraph",
        text: `Send DMCA notices to ${DMCA_EMAIL}. Include your signature, identification of the copyrighted work, location of infringing material, contact information, a good-faith statement, and a statement under penalty of perjury.`,
      },
      { type: "heading", text: "2. Our response" },
      {
        type: "paragraph",
        text: "We will promptly remove or disable access to reported material where appropriate and notify affected parties.",
      },
      { type: "heading", text: "3. Counter-notices" },
      {
        type: "paragraph",
        text: "Counter-notices must comply with the DMCA and consent to jurisdiction in Miami-Dade County, Florida.",
      },
      { type: "heading", text: "4. Repeat infringers" },
      {
        type: "paragraph",
        text: "Accounts with repeated valid infringement claims may be terminated.",
      },
    ],
  },
  {
    slug: "refunds",
    title: "Refund and Payment Policy",
    description: "Payment terms, chargebacks, and refund requests.",
    lastUpdated: "May 21, 2026",
    blocks: [
      {
        type: "paragraph",
        text: `${BRAND} payment terms are defined in your signed management or service agreements. This policy describes general practices for onboarding and platform fees where applicable.`,
      },
      { type: "heading", text: "Billing" },
      {
        type: "paragraph",
        text: "Fees, revenue share, and payout schedules are disclosed in your contract. Third-party processors may apply their own terms.",
      },
      { type: "heading", text: "Refund requests" },
      {
        type: "paragraph",
        text: `Submit refund inquiries in writing to ${CONTACT_EMAIL} with your account email, transaction details, and reason. We review requests within 5–10 business days.`,
      },
      { type: "heading", text: "Chargebacks" },
      {
        type: "paragraph",
        text: "Unauthorized or fraudulent chargebacks may result in account suspension pending investigation.",
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact Us",
    description: "How to reach Visual Era for support and legal notices.",
    lastUpdated: "May 21, 2026",
    blocks: [
      {
        type: "paragraph",
        text: "For general inquiries, onboarding support, legal notices, or data requests, contact us using the channels below.",
      },
      { type: "heading", text: "General and business inquiries" },
      {
        type: "paragraph",
        text: `Email: ${CONTACT_EMAIL}`,
      },
      { type: "heading", text: "Privacy and data rights" },
      {
        type: "paragraph",
        text: `Email: ${PRIVACY_EMAIL}. Include your full name, account email, and the specific request (access, correction, or deletion).`,
      },
      { type: "heading", text: "DMCA and legal notices" },
      {
        type: "paragraph",
        text: `Email: ${DMCA_EMAIL}`,
      },
      {
        type: "paragraph",
        text: "We aim to respond within 3–5 business days. Urgent legal notices should use the DMCA or legal email above.",
      },
    ],
  },
];

export function getLegalDocument(slug: string) {
  return LEGAL_DOCUMENTS.find((doc) => doc.slug === slug) ?? null;
}

export function getLegalSlugs() {
  return LEGAL_DOCUMENTS.map((doc) => doc.slug);
}
