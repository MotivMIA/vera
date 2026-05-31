import { PDFDocument, type PDFFont, type PDFPage, StandardFonts, rgb } from "pdf-lib";
import type { InternalDocumentType } from "@/types/onboarding";
import { MANAGER_ALIAS } from "@/lib/contracts/constants";

type SignatureMethod = "draw" | "type";

type SharedPayload = {
  signerName: string;
  signerEmail: string;
  signatureName: string;
  signatureMethod?: SignatureMethod;
  signatureImageDataUrl?: string;
  signedAt: string;
};

type ClientAgreementPayload = SharedPayload & {
  creatorAlias: string;
  clientHandle?: string;
  termsAccepted: true;
  esignAccepted: true;
};

type ReleasePayload = SharedPayload & {
  idType: string;
  idNumber: string;
  idIssuedBy: string;
  dateOfBirth: string;
  ageConfirmed: true;
};

const CLIENT_SECTIONS: Array<{ heading: string; items: string[] }> = [
  {
    heading: "1. PURPOSE",
    items: [
      "1.1 Engagement. Client desires to develop, operate, and monetize personal brand accounts across digital subscription platforms, social media platforms, and other monetized fan-based services (collectively, the Platforms).",
      "1.2 Services. Manager agrees to provide management and strategic services in connection with such Platforms as detailed in Section 2.",
    ],
  },
  {
    heading: "2. SCOPE OF SERVICES",
    items: [
      "2.1 Management Duties. Manager shall provide account setup and optimization, branding strategy, content planning, monetization and pricing strategy, and promotional growth campaigns.",
      "2.2 Engagement. Manager may manage subscriber engagement and communicate with platform support teams if specifically authorized by Client.",
      "2.3 Performance Tracking. Manager shall provide regular performance tracking and reporting of account growth and revenue.",
      "2.4 Final Approval. Client retains final approval over all content posted to the Platforms.",
    ],
  },
  {
    heading: "3. COMPENSATION",
    items: [
      "3.1 Commission. Manager shall receive 30% of Net Revenue generated through managed Platforms.",
      "3.2 Net Revenue Defined. Gross earnings minus platform fees, processing fees, refunds, chargebacks, and pre-approved advertising expenses.",
      "3.3 Payment Schedule. Commissions are calculated monthly and due within 10 days following month-end.",
    ],
  },
  {
    heading: "4. TERM",
    items: [
      "4.1 Initial Term. This Agreement shall continue for twelve (12) months unless earlier terminated per Section 5.",
      "4.2 Content Rights. Upon expiration or termination, all rights and control of content revert to Client and account access must be transferred within five (5) business days.",
    ],
  },
  {
    heading: "5. GOVERNING LAW",
    items: ["5.1 This Agreement is governed by the laws of the State of Florida."],
  },
];

const RELEASE_LINES = [
  "This release form applies to any media content which features me that is posted on the platform by Nathan Williams d/b/a Visual Era (the Creator) for as long as their account is available on the platform.",
  "I am a participant in sexually explicit and/or non-sexually explicit media content intended to be posted on the Platform.",
  "I was at least 18 years old when all such media content was created.",
  "I give the Platform the absolute right and permission to allow the Creator to create, upload, use, re-use, display, publish and distribute such content on the Platform.",
  "I am aware that this content may be used for commercial reasons.",
  "I acknowledge and agree that I am not entitled to payments from the Platform regarding publication of such content, and that the Platform is not party to agreements between me and the Creator.",
  "I can withdraw consent at any time by contacting Platform support in writing.",
];

type DrawContext = {
  page: PDFPage;
  font: PDFFont;
  boldFont: PDFFont;
  maxWidth: number;
  left: number;
  lineHeight: number;
  y: number;
};

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawParagraph(ctx: DrawContext, text: string, size = 10) {
  const lines = wrapText(text, ctx.font, size, ctx.maxWidth);
  for (const line of lines) {
    ctx.page.drawText(line, { x: ctx.left, y: ctx.y, font: ctx.font, size, color: rgb(0.92, 0.92, 0.92) });
    ctx.y -= ctx.lineHeight;
  }
  ctx.y -= 4;
}

function drawHeading(ctx: DrawContext, text: string, size = 12) {
  ctx.page.drawText(text, { x: ctx.left, y: ctx.y, font: ctx.boldFont, size, color: rgb(1, 1, 1) });
  ctx.y -= ctx.lineHeight + 2;
}

async function drawSignatureBlock(ctx: DrawContext, payload: SharedPayload, document: PDFDocument) {
  const signedDate = new Date(payload.signedAt).toLocaleDateString("en-US");

  drawHeading(ctx, "Signature", 11);
  ctx.page.drawText(`Signer: ${payload.signerName}`, { x: ctx.left, y: ctx.y, font: ctx.font, size: 10, color: rgb(0.92, 0.92, 0.92) });
  ctx.y -= ctx.lineHeight;
  ctx.page.drawText(`Email: ${payload.signerEmail}`, { x: ctx.left, y: ctx.y, font: ctx.font, size: 10, color: rgb(0.92, 0.92, 0.92) });
  ctx.y -= ctx.lineHeight;
  ctx.page.drawText(`Signed at: ${signedDate}`, { x: ctx.left, y: ctx.y, font: ctx.font, size: 10, color: rgb(0.92, 0.92, 0.92) });
  ctx.y -= ctx.lineHeight + 4;

  if (payload.signatureMethod === "draw" && payload.signatureImageDataUrl?.startsWith("data:image/")) {
    const [meta, b64] = payload.signatureImageDataUrl.split(",");
    if (b64) {
      const bytes = Uint8Array.from(Buffer.from(b64, "base64"));
      const isPng = meta.includes("png");
      const image = isPng ? await document.embedPng(bytes) : await document.embedJpg(bytes);
      const width = 180;
      const scale = width / image.width;
      const height = image.height * scale;
      ctx.page.drawImage(image, { x: ctx.left, y: ctx.y - height + 12, width, height });
      ctx.y -= height + 6;
      return;
    }
  }

  ctx.page.drawText(`Typed signature: ${payload.signatureName}`, {
    x: ctx.left,
    y: ctx.y,
    font: ctx.font,
    size: 10,
    color: rgb(0.92, 0.92, 0.92),
  });
  ctx.y -= ctx.lineHeight;
}

function ensurePage(ctx: DrawContext, document: PDFDocument) {
  if (ctx.y > 90) return ctx;
  const page = document.addPage([612, 792]);
  return { ...ctx, page, y: 752 };
}

export async function buildSignedDocumentPdf(input: {
  documentType: InternalDocumentType;
  payload: ClientAgreementPayload | ReleasePayload;
}) {
  const document = await PDFDocument.create();
  const page = document.addPage([612, 792]);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
  const left = 48;
  const right = 48;
  const maxWidth = 612 - left - right;
  let ctx: DrawContext = { page, font, boldFont, maxWidth, left, lineHeight: 14, y: 752 };

  const title = input.documentType === "content_release" ? "Visual Era - Content Release Form" : "Visual Era - Client Management Agreement";
  drawHeading(ctx, title, 16);
  drawParagraph(ctx, `Document generated on ${new Date().toLocaleDateString("en-US")} for secure record retention.`, 9);
  ctx.y -= 6;

  if (input.documentType === "content_release") {
    drawHeading(ctx, "Release Terms", 12);
    for (const line of RELEASE_LINES) {
      ctx = ensurePage(ctx, document);
      drawParagraph(ctx, `- ${line}`, 10);
    }
    ctx = ensurePage(ctx, document);
    const payload = input.payload as ReleasePayload;
    drawHeading(ctx, "Identity Details", 11);
    drawParagraph(ctx, `Full legal name on ID: ${payload.signerName}`, 10);
    drawParagraph(ctx, `Email: ${payload.signerEmail}`, 10);
    drawParagraph(ctx, `Date of birth: ${payload.dateOfBirth}`, 10);
    drawParagraph(ctx, `ID type: ${payload.idType}`, 10);
    drawParagraph(ctx, `ID number: ${payload.idNumber}`, 10);
    drawParagraph(ctx, `ID issued by: ${payload.idIssuedBy}`, 10);
  } else {
    const payload = input.payload as ClientAgreementPayload;
    drawHeading(ctx, "Parties", 12);
    drawParagraph(ctx, `Manager: ${MANAGER_ALIAS}`, 10);
    drawParagraph(ctx, `Client: ${payload.signerName}`, 10);
    drawParagraph(ctx, `Client email: ${payload.signerEmail}`, 10);
    if (payload.clientHandle) drawParagraph(ctx, `Optional handle: ${payload.clientHandle}`, 10);
    ctx.y -= 6;

    for (const section of CLIENT_SECTIONS) {
      ctx = ensurePage(ctx, document);
      drawHeading(ctx, section.heading, 11);
      for (const item of section.items) {
        ctx = ensurePage(ctx, document);
        drawParagraph(ctx, item, 10);
      }
    }
  }

  ctx = ensurePage(ctx, document);
  await drawSignatureBlock(ctx, input.payload, document);
  return document.save();
}
