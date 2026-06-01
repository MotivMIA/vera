import { cn } from "@/lib/utils";

/**
 * Footer main band: left stack (brand + download) | menus right.
 * Stays two columns from sm up; only stacks on the narrowest viewports.
 * Download always left-aligned with the brand block when it sits below socials.
 */
export const footerMainBandClass = cn(
  "grid min-w-0 grid-cols-1 items-start gap-x-8 gap-y-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-10 lg:gap-x-12",
);

/** Brand + download share the left column (rows 1 and 2). */
export const footerBrandGridClass = "sm:col-start-1 sm:row-start-1";

export const footerDownloadGridClass = "sm:col-start-1 sm:row-start-2";

/** Menus stay on the right from sm+; centered when the band stacks vertically. */
export const footerMenusGridClass = cn(
  "flex min-w-0 justify-center sm:col-start-2 sm:row-start-1 sm:row-span-2 sm:justify-end sm:self-start",
);

/** Stacked (&lt;sm): centered; two-column (sm+): left column alignment. */
export const footerBrandCellClass = cn(
  "flex min-w-0 w-full flex-col items-center text-center sm:items-start sm:text-left",
);

export const footerDownloadCellClass = cn(
  "flex min-w-0 w-full flex-col items-center text-center sm:items-start sm:text-left",
);

/** Social row + badge row follow the same breakpoint flip. */
export const footerBrandSocialClass =
  "mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start";

export const footerDownloadBadgesClass = "mt-3 flex w-full min-w-0 justify-center sm:justify-start";

export const footerMenuNavClass =
  "grid w-max max-w-full grid-cols-3 items-start gap-x-8 text-left sm:gap-x-10 md:gap-x-12";

export function footerDisclaimerGridClass(columnCount: 1 | 2 | 3): string {
  if (columnCount <= 1) return "grid-cols-1";
  if (columnCount === 2) return "md:grid-cols-2";
  return "md:grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)]";
}
