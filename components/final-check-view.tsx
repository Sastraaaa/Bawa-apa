"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useChecklistStore } from "@/lib/store/checklist";
import { getTrip } from "@/lib/db/queries";
import { strings } from "@/lib/strings/id";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function FinalCheckView({ tripId }: { tripId: string }) {
  const router = useRouter();
  const { trip, loadTrip, toggleItem } = useChecklistStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getTrip(tripId)
      .then((found) => {
        if (!active) return;
        if (found) loadTrip(found);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tripId, loadTrip]);

  if (loading || !trip) {
    return <p className="text-sm text-muted">{strings.home.thinking}</p>;
  }

  // Hanya barang penting (Wajib) yang belum dicentang (Mode Saya Mau Berangkat).
  const pending = trip.items.filter(
    (i) => i.priority === "required" && !i.checked,
  );

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button onClick={() => router.back()} aria-label={strings.common.back}>
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold">{strings.checklist.imLeaving}</h1>
      </header>

      {pending.length === 0 ? (
        <Card className="text-center">
          <p className="text-base">{strings.finalCheck.allReady}</p>
        </Card>
      ) : (
        <>
          <p className="text-sm font-medium">
            {strings.finalCheck.title(pending.length)}
          </p>
          <Card className="divide-y divide-border py-0">
            {pending.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(item.id)}
                  className="size-5 accent-brand"
                />
                {item.name}
              </label>
            ))}
          </Card>
        </>
      )}

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => router.push(`/checklist/${trip.id}`)}
      >
        {strings.finalCheck.back}
      </Button>
    </div>
  );
}
