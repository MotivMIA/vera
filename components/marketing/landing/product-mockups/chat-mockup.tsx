/** AI copilot chat mockup */
export function ChatMockup() {
  return (
    <div className="landing-card min-w-0 overflow-hidden rounded-[var(--landing-radius-lg)]" aria-hidden>
      <div className="border-b border-[var(--landing-border)] bg-[var(--landing-surface-muted)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[var(--landing-accent-lavender)] text-xs font-bold">
            AI
          </span>
          <div>
            <p className="text-xs font-semibold text-[var(--landing-text)]">Visual Era Copilot</p>
            <p className="text-[10px] text-[var(--landing-muted)]">Beta · Suggest replies & summaries</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[var(--landing-surface-inset)] px-3 py-2 text-xs leading-relaxed text-[var(--landing-text)]">
          Summarize top spenders this week and draft a thank-you message.
        </div>
        <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[var(--landing-accent-lavender)] px-3 py-2 text-xs leading-relaxed text-[var(--landing-text)]">
          <p className="font-medium">Top 3 fans</p>
          <ul className="mt-1 list-inside list-disc text-[var(--landing-muted)]">
            <li>@alex — $840</li>
            <li>@jordan — $620</li>
            <li>@sam — $510</li>
          </ul>
          <p className="mt-2 border-t border-[var(--landing-chat-border)] pt-2 text-[var(--landing-text)]">
            Draft: &ldquo;Thank you for an amazing week…&rdquo;
          </p>
        </div>
        <div className="flex gap-2 pt-1">
          <span className="h-9 min-w-0 flex-1 rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)]" />
          <span className="inline-flex h-9 shrink-0 items-center rounded-xl bg-[var(--landing-accent-orange)] px-3 text-[10px] font-semibold text-[var(--landing-cta-fg)]">
            Send
          </span>
        </div>
      </div>
    </div>
  );
}
