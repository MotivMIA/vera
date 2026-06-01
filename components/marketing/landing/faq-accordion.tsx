"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type FaqItem = { id: string; question: string; answer: string };

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-[var(--landing-border)] rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-surface)] shadow-[var(--landing-shadow)]">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="min-w-0">
            <button
              type="button"
              className="flex w-full min-w-0 items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--landing-surface-hover)] md:px-6 md:py-5"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <span className="text-sm font-semibold text-[var(--landing-text)] md:text-base">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-[var(--landing-muted)] transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="landing-subhead px-5 pb-4 text-sm leading-relaxed md:px-6 md:pb-5">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
