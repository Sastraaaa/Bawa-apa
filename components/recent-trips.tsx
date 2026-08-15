"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Trip } from "@/lib/types";
import { listTrips } from "@/lib/db/queries";
import { strings } from "@/lib/strings/id";
import { Card } from "@/components/ui/card";

export function RecentTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    listTrips()
      .then((all) => setTrips(all.slice(0, 3)))
      .catch(() => setTrips([]))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || trips.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-muted">{strings.home.recent}</h2>
      <div className="space-y-2">
        {trips.map((trip) => (
          <Link key={trip.id} href={`/checklist/${trip.id}`}>
            <Card className="flex items-center justify-between">
              <div>
                <p className="font-medium">{trip.title}</p>
                <p className="text-xs text-muted">
                  {strings.history.items(trip.items.length)}
                </p>
              </div>
              <span className="text-sm text-muted">{trip.progress}%</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
