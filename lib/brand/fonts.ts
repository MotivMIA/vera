import { Syne } from "next/font/google";

/** Display face for “Visual Era” wordmark (logo lockups, auth header). */
export const brandDisplayFont = Syne({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-brand-display",
  display: "swap",
});
