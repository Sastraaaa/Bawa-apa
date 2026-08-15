"use client";

import { useState } from "react";
import { Info, Trash2, GripVertical } from "lucide-react";
import type { Item } from "@/lib/types";
import { strings } from "@/lib/strings/id";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";

type Props = {
  item: Item;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ItemRow({ item, onToggle, onDelete }: Props) {
  const [showReason, setShowReason] = useState(false);

  return (
    <div className="flex items-center gap-3 py-2.5">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => onToggle(item.id)}
        className="size-5 shrink-0 accent-brand"
        aria-label={item.name}
      />
      <button
        onClick={() => onToggle(item.id)}
        className={cn(
          "flex-1 text-left text-sm",
          item.checked && "text-muted line-through",
        )}
      >
        {item.name}
      </button>

      {item.source === "ai" && (
        <span className="rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
          {strings.checklist.aiBadge}
        </span>
      )}

      {item.reason && (
        <button
          onClick={() => setShowReason(true)}
          className="text-muted"
          aria-label={strings.checklist.reason}
        >
          <Info className="size-4" />
        </button>
      )}

      <button
        onClick={() => onDelete(item.id)}
        className="text-muted hover:text-red-500"
        aria-label={strings.history.delete}
      >
        <Trash2 className="size-4" />
      </button>

      <BottomSheet
        open={showReason}
        onClose={() => setShowReason(false)}
        title={item.name}
      >
        <p className="text-sm text-muted">{item.reason}</p>
      </BottomSheet>
    </div>
  );
}

export { GripVertical };
