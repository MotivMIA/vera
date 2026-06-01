"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

type TestimonialCarouselProps = {
  items: Testimonial[];
};

export function TestimonialCarousel({ items }: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = items.length;
  const current = items[index]!;

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  return (
    <div className="relative mx-auto min-w-0 max-w-3xl">
      <article className="landing-card px-6 py-8 text-center md:px-10 md:py-10">
        <Quote className="mx-auto mb-4 size-8 text-[var(--landing-accent-orange)]" aria-hidden />
        <blockquote className="text-lg font-medium leading-relaxed text-[var(--landing-text)] md:text-xl">
          &ldquo;{current.quote}&rdquo;
        </blockquote>
        <footer className="mt-6">
          <p className="text-sm font-semibold text-[var(--landing-text)]">{current.name}</p>
          <p className="mt-0.5 text-xs text-[var(--landing-muted)]">{current.role}</p>
        </footer>
      </article>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={prev}
          className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] transition hover:border-[var(--landing-border-strong)] hover:shadow-sm"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex gap-1.5" role="tablist" aria-label="Testimonials">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "size-2 rounded-full transition",
                i === index ? "bg-[var(--landing-accent-orange)]" : "bg-[var(--landing-skeleton)]",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface)] text-[var(--landing-text)] transition hover:border-[var(--landing-border-strong)] hover:shadow-sm"
          aria-label="Next testimonial"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
