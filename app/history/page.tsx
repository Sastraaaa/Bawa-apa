"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Trash2 } from "lucide-react";
import type { Trip } from "@/lib/types";
import { listTrips, deleteTrip, duplicateTrip } from "@/lib/db/queries";
import { strings } from "@/lib/strings/id";
import { Card } from "@/components/ui/card";

export default function HistoryPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function refresh() {
    const all = await listTrips().catch(() => []);
    setTrips(all);
    setLoaded(true);
  }

  useEffect(() => {
    let active = true;
    listTrips()
      .then((all) => {
        if (!active) return;
        setTrips(all);
        setLoaded(true);
      })
      .catch(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  const filtered = trips.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()),
  );

  async function handleDelete(id: string) {
    await deleteTrip(id);
    void refresh();
  }

  async function handleDuplicate(id: string) {
    await duplicateTrip(id);
    void refresh();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{strings.history.title}</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={strings.history.search}
        className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand"
      />

      {loaded && filtered.length === 0 && (
        <p className="text-sm text-muted">{strings.history.empty}</p>
      )}

      <div className="space-y-2">
        {filtered.map((trip) => (
          <Card key={trip.id} className="flex items-center gap-3">
            <Link href={`/checklist/${trip.id}`} className="min-w-0 flex-1">
              <p className="truncate font-medium">{trip.title}</p>
              <p className="text-xs text-muted">
                {new Date(trip.createdAt).toLocaleDateString("id-ID")} ·{" "}
                {strings.history.items(trip.items.length)} · {trip.progress}%
              </p>
            </Link>
            <button
              onClick={() => handleDuplicate(trip.id)}
              className="text-muted hover:text-foreground"
              aria-label={strings.history.duplicate}
            >
              <Copy className="size-4" />
            </button>
            <button
              onClick={() => handleDelete(trip.id)}
              className="text-muted hover:text-red-500"
              aria-label={strings.history.delete}
            >
              <Trash2 className="size-4" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
