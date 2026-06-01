import Image from "next/image";
import { notFound } from "next/navigation";
import { SocialSpriteIcon } from "@/components/marketing/social-sprite-icon";
import spriteReport from "@/docs/social-sprite-report.json";
import { ICONEXA_LEGACY_PATH } from "@/lib/brand/brand-social-icons";
import { SOCIAL_SPRITE_PATH } from "@/lib/brand/social-sprite";
import type { SiteSocialIconId } from "@/lib/brand/site-social-icons";

const JPG_SPRITE_PATH = "/brand/social-sprite.jpg";

type MissingSpriteIcon = { id: string; slug: string };

export default function SocialSpritesDevPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const icons = spriteReport.icons;
  const missingIcons = spriteReport.missingIcons as MissingSpriteIcon[];
  const sampleId = icons[0]?.id ?? "google";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="brand-page-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8">
        <header className="mb-10 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Dev only
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Social sprite preview</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Site list:{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-foreground">
              lib/brand/site-social-icons.ts
            </code>{" "}
            ({spriteReport.generated} of {spriteReport.requested} symbols). Mono sprite:{" "}
            <a className="text-accent underline-offset-4 hover:underline" href={SOCIAL_SPRITE_PATH}>
              {SOCIAL_SPRITE_PATH}
            </a>
            . Legacy reference:{" "}
            <a className="text-accent underline-offset-4 hover:underline" href={ICONEXA_LEGACY_PATH}>
              {ICONEXA_LEGACY_PATH}
            </a>
            .
          </p>
        </header>

        <section className="mb-12 rounded-xl border border-border bg-card/60 p-6">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Legacy vs SVG (sample)</h2>
          <div className="flex flex-wrap items-end gap-8">
            <figure className="space-y-2">
              <figcaption className="text-xs text-muted-foreground">iconexa (legacy)</figcaption>
              <Image
                src={ICONEXA_LEGACY_PATH}
                alt="Iconexa social icon pack reference"
                width={280}
                height={99}
                className="max-w-full rounded border border-border object-contain"
                unoptimized
              />
            </figure>
            <figure className="space-y-2">
              <figcaption className="text-xs text-muted-foreground">Raster sheet (older)</figcaption>
              <Image
                src={JPG_SPRITE_PATH}
                alt="Legacy social sprite JPG"
                width={120}
                height={120}
                className="rounded border border-border object-contain"
                unoptimized
              />
            </figure>
            <figure className="space-y-2">
              <figcaption className="text-xs text-muted-foreground">
                Color <code className="text-foreground">{sampleId}</code>
              </figcaption>
              <SocialSpriteIcon variant={sampleId as SiteSocialIconId} className="size-12" />
            </figure>
            <figure className="space-y-2">
              <figcaption className="text-xs text-muted-foreground">
                Mono <code className="text-foreground">#{sampleId}</code>
              </figcaption>
              <SocialSpriteIcon
                variant={sampleId as SiteSocialIconId}
                tone="mono"
                className="size-12 text-foreground"
              />
            </figure>
          </div>
        </section>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {icons.map(({ id, title }) => (
            <li
              key={id}
              className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card/40 p-4 text-center"
            >
              <SocialSpriteIcon variant={id as SiteSocialIconId} className="size-8" />
              <SocialSpriteIcon
                variant={id as SiteSocialIconId}
                tone="mono"
                className="size-8 text-foreground"
              />
              <span className="font-mono text-[10px] leading-tight text-muted-foreground" title={title}>
                {id}
              </span>
            </li>
          ))}
        </ul>

        {missingIcons.length > 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Missing from sprite ({missingIcons.length}):{" "}
            {missingIcons.map((m) => m.id).join(", ")}
          </p>
        ) : null}
      </div>
    </main>
  );
}
