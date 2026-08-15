"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { Template } from "@/lib/types";
import { PRESETS } from "@/lib/engine/presets";
import { listTemplates, deleteTemplate } from "@/lib/db/queries";
import { useChecklistStore } from "@/lib/store/checklist";
import { strings } from "@/lib/strings/id";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TemplatesPage() {
  const router = useRouter();
  const createFromInput = useChecklistStore((s) => s.createFromInput);
  const [templates, setTemplates] = useState<Template[]>([]);

  async function refresh() {
    setTemplates(await listTemplates().catch(() => []));
  }

  useEffect(() => {
    let active = true;
    listTemplates()
      .then((all) => active && setTemplates(all))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function openFromLabel(label: string) {
    const trip = await createFromInput(label);
    router.push(`/checklist/${trip.id}`);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{strings.templates.title}</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted">
          {strings.templates.builtIn}
        </h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => openFromLabel(preset.label)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-brand"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted">
          {strings.templates.yours}
        </h2>
        {templates.length === 0 ? (
          <p className="text-sm text-muted">{strings.templates.empty}</p>
        ) : (
          <div className="space-y-2">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{tpl.name}</p>
                  <p className="text-xs text-muted">
                    {strings.history.items(tpl.items.length)}
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => openFromLabel(tpl.name)}>
                  {strings.templates.use}
                </Button>
                <button
                  onClick={async () => {
                    await deleteTemplate(tpl.id);
                    void refresh();
                  }}
                  className="text-muted hover:text-red-500"
                  aria-label={strings.templates.delete}
                >
                  <Trash2 className="size-4" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
