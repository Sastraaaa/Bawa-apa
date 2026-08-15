"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/lib/types";
import { getSettings, saveSettings, clearAllData } from "@/lib/db/queries";
import { strings } from "@/lib/strings/id";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ToggleKey = "notifications" | "aiEnabled" | "weatherEnabled";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  async function toggle(key: ToggleKey) {
    if (!settings) return;
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    await saveSettings(next);
  }

  async function handleClear() {
    if (!confirm(strings.settings.clearDataConfirm)) return;
    await clearAllData();
    alert(strings.settings.cleared);
  }

  const rows: { key: ToggleKey; label: string; hint?: string }[] = [
    { key: "notifications", label: strings.settings.notifications },
    { key: "aiEnabled", label: strings.settings.ai, hint: strings.settings.aiHint },
    { key: "weatherEnabled", label: strings.settings.weather },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{strings.settings.title}</h1>

      <Card className="divide-y divide-border py-0">
        {rows.map(({ key, label, hint }) => (
          <div key={key} className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-sm font-medium">{label}</p>
              {hint && <p className="text-xs text-muted">{hint}</p>}
            </div>
            <button
              onClick={() => toggle(key)}
              disabled={!settings}
              className={
                "relative h-6 w-11 rounded-full transition " +
                (settings?.[key] ? "bg-brand" : "bg-border")
              }
              aria-label={label}
              role="switch"
              aria-checked={settings?.[key] ?? false}
            >
              <span
                className={
                  "absolute top-0.5 size-5 rounded-full bg-white transition " +
                  (settings?.[key] ? "left-[22px]" : "left-0.5")
                }
              />
            </button>
          </div>
        ))}
      </Card>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted">{strings.settings.privacy}</h2>
        <p className="text-xs text-muted">
          Data kamu disimpan hanya di perangkat ini. Tidak ada akun, tidak ada server penyimpanan.
        </p>
        <Button variant="danger" className="w-full" onClick={handleClear}>
          {strings.settings.clearData}
        </Button>
      </section>
    </div>
  );
}
