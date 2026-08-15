"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { strings } from "@/lib/strings/id";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500/15 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
      <WifiOff className="size-4" />
      <span>{strings.common.offline}</span>
    </div>
  );
}
