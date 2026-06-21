
"use client";

import { LocaleSwitch } from "@/components/shared/locale-switch";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { NavBar } from "./nav-bar";

export function Header() {
  const [isTop, setIsTop] = useState(true);
  const debouncedScroll = useDebounceCallback(
    () => {
      setIsTop(window.scrollY < 20);
    },
    150,
    {
      maxWait: 150,
    },
  );

  useEffect(() => {
    window.addEventListener("scroll", debouncedScroll);
    debouncedScroll();
    return () => {
      window.removeEventListener("scroll", debouncedScroll);
    };
  }, [debouncedScroll]);

  return(
  <header className={cn("fixed top-0 w-full items-center gap-4 px-4 md:px-6 z-50 h-16 transition-all duration-200 flex backdrop-blur-[40px] bg-white/60 border-b border-white/60", isTop ? "shadow-none" : "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]")}>
    <NavBar />
    <div className="flex items-center justify-end gap-3 md:ml-auto text-primary">
      <LocaleSwitch />
      <ModeToggle />
    </div>
  </header>
  )
}