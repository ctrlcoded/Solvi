"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: "dashboard" },
    { name: "NeetCode 150", href: "/questions", icon: "format_list_bulleted" },
    { name: "Study Plan", href: "/plan", icon: "auto_awesome" },
    { name: "Today's Reviews", href: "/reviews", icon: "event_repeat" },
    { name: "Cheatsheet", href: "/journal", icon: "menu_book" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant bg-surface flex flex-col py-[24px] z-50">
      <div className="px-6 mb-8 flex flex-col">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02] -ml-4 -mt-2">
          <img src="/solvi_logo.png" alt="Solvi Logo" className="h-[90px] w-[200px] object-cover object-left" />
        </Link>
        <p className="font-label-md text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-semibold pl-4">
          Interview Prep Companion
        </p>
      </div>
      <nav className="flex-grow flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-6 py-3 transition-colors duration-200",
                isActive
                  ? "text-primary font-bold border-r-2 border-primary bg-surface-container-high"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md"
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 mt-auto">
        <p className="text-[11px] text-on-surface-variant/40 font-mono">v1.0 · NeetCode 150</p>
      </div>
    </aside>
  );
}
