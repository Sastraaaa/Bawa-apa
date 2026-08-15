"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, LayoutGrid, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { strings } from "@/lib/strings/id";

const NAV = [
  { href: "/", label: strings.nav.home, icon: Home },
  { href: "/history", label: strings.nav.history, icon: Clock },
  { href: "/templates", label: strings.nav.templates, icon: LayoutGrid },
  { href: "/settings", label: strings.nav.settings, icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs",
                active ? "text-brand" : "text-muted",
              )}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
