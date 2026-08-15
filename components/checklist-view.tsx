"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlusCircle, Sparkles, Save, DoorOpen } from "lucide-react";
import type { Item, Priority } from "@/lib/types";
import { useChecklistStore } from "@/lib/store/checklist";
import { getTrip, saveTemplate } from "@/lib/db/queries";
import { aiReview } from "@/lib/ai/client";
import { strings } from "@/lib/strings/id";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ProgressBar } from "@/components/progress-bar";
import { ItemRow } from "@/components/item-row";

const GROUPS: { key: Priority; label: string }[] = [
  { key: "required", label: strings.checklist.required },
  { key: "recommended", label: strings.checklist.recommended },
  { key: "optional", label: strings.checklist.optional },
];

export function ChecklistView({ tripId }: { tripId: string }) {
  const router = useRouter();
  const {
    trip,
    aiStatus,
    loadTrip,
    toggleItem,
    addItem,
    deleteItem,
    enrichWithAi,
  } = useChecklistStore();

  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [findings, setFindings] = useState<string[]>([]);

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

  // Perkaya dengan AI sekali saat checklist dibuka (best-effort, hemat AI).
  useEffect(() => {
    if (trip && !trip.aiEnriched) void enrichWithAi();
  }, [trip, enrichWithAi]);

  if (loading) {
    return <p className="text-sm text-muted">{strings.home.thinking}</p>;
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">{strings.checklist.notFound}</p>
        <Link href="/" className="text-brand">
          {strings.common.back}
        </Link>
      </div>
    );
  }

  const done = trip.items.filter((i) => i.checked).length;

  async function runReview() {
    if (!trip) return;
    setReviewOpen(true);
    setReviewing(true);
    const result = await aiReview(
      trip.context,
      trip.items.map((i) => i.name),
    );
    setFindings(result);
    setReviewing(false);
  }

  async function handleSaveTemplate() {
    if (!trip) return;
    await saveTemplate({
      id: `tpl_${Date.now().toString(36)}`,
      name: trip.title,
      items: trip.items.map((i) => ({ ...i, checked: false })),
      createdAt: new Date().toISOString(),
    });
    alert(strings.checklist.templateSaved);
  }

  function submitNewItem() {
    if (newItem.trim() === "") return;
    addItem(newItem, "recommended");
    setNewItem("");
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button onClick={() => router.back()} aria-label={strings.common.back}>
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold">{trip.title}</h1>
      </header>

      <Card>
        <ProgressBar progress={trip.progress} total={trip.items.length} done={done} />
      </Card>

      {aiStatus === "loading" && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Sparkles className="size-4 animate-pulse" />
          {strings.checklist.checkingAi}
        </p>
      )}
      {aiStatus === "unavailable" && (
        <p className="text-sm text-muted">{strings.checklist.aiOffline}</p>
      )}

      {trip.items.length === 0 && (
        <p className="text-sm text-muted">{strings.checklist.emptyItems}</p>
      )}

      {GROUPS.map(({ key, label }) => {
        const items = trip.items.filter((i) => i.priority === key);
        if (items.length === 0) return null;
        return (
          <section key={key}>
            <h2 className="mb-1 text-sm font-semibold text-muted">{label}</h2>
            <Card className="divide-y divide-border py-0">
              {items.map((item: Item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                />
              ))}
            </Card>
          </section>
        );
      })}

      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitNewItem()}
          placeholder={strings.checklist.addItemPlaceholder}
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <Button variant="secondary" onClick={submitNewItem}>
          <PlusCircle className="size-4" />
          {strings.common.add}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={runReview}>
          <Sparkles className="size-4" />
          {strings.checklist.whatsMissing}
        </Button>
        <Button variant="secondary" onClick={handleSaveTemplate}>
          <Save className="size-4" />
          {strings.checklist.saveAsTemplate}
        </Button>
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={() => router.push(`/checklist/${trip.id}/final`)}
      >
        <DoorOpen className="size-5" />
        {strings.checklist.imLeaving}
      </Button>

      <BottomSheet
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title={strings.checklist.reviewTitle}
      >
        {reviewing ? (
          <p className="text-sm text-muted">{strings.checklist.checkingAi}</p>
        ) : findings.length === 0 ? (
          <p className="text-sm text-muted">{strings.checklist.reviewNoFindings}</p>
        ) : (
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        )}
      </BottomSheet>
    </div>
  );
}
