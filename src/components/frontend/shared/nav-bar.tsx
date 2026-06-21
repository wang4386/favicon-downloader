"use client";

import { Link } from "@/lib/i18n";
import { appConfig } from "@/config";
import Image from "next/image";

export function NavBar() {
  const Logo = () => {
    return (
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-bold tracking-tight"
      >
        <Image alt={appConfig.appName} src={"/logo.png"} width={28} height={28} className="h-7 w-7 rounded-xl" />
        <span className="text-foreground">{appConfig.appName}</span>
      </Link>
    )
  }
  return (
    <div className="w-full">
      <nav className="flex flex-row items-center">
        <Logo />
      </nav>
    </div>
  );
}
