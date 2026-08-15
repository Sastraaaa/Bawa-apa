"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { PRESETS } from "@/lib/engine/presets";
import { useChecklistStore } from "@/lib/store/checklist";
import { strings } from "@/lib/strings/id";
import { Button } from "@/components/ui/button";
import { RecentTrips } from "@/components/recent-trips";

export default function HomePage() {
  const router = useRouter();
  const createFromInput = useChecklistStore((s) => s.createFromInput);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(value: string) {
    const input = value.trim();
    if (input === "" || busy) return;
    setBusy(true);
    try {
      const trip = await createFromInput(input);
      router.push(`/checklist/${trip.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{strings.app.name}</h1>
        <p className="text-sm text-muted">{strings.app.taglineSerious}</p>
      </header>

      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={strings.home.inputPlaceholder}
          rows={3}
          className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-base outline-none focus:border-brand"
        />
        <p className="text-xs text-muted">{strings.home.inputHint}</p>
        <Button
          size="lg"
          className="w-full"
          onClick={() => submit(text)}
          disabled={busy || text.trim() === ""}
        >
          <Sparkles className="size-5" />
          {busy ? strings.home.thinking : strings.home.createChecklist}
        </Button>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted">{strings.home.presets}</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => submit(preset.label)}
              disabled={busy}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-brand"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <RecentTrips />
    </div>
  );
}
