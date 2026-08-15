import { strings } from "@/lib/strings/id";
import { cn } from "@/lib/utils";

type Props = { progress: number; total: number; done: number };

export function ProgressBar({ progress, total, done }: Props) {
  const status =
    progress >= 100
      ? strings.progress.readyToGo
      : progress >= 50
        ? strings.progress.almostReady
        : strings.progress.notReady;

  const barColor =
    progress >= 100
      ? "bg-green-500"
      : progress >= 50
        ? "bg-amber-500"
        : "bg-zinc-400";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{strings.progress.ready(done, total)}</span>
        <span className="text-muted">{status}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
