"use client";
import { appConfig } from "@/config";

export function Footer() {
  return (
    <footer className="container py-12 text-center text-sm text-muted-foreground mt-20 border-t border-border">
      <span className="font-light">
        © {new Date().getFullYear()} {appConfig.appName}
      </span>
    </footer>
  );
}
