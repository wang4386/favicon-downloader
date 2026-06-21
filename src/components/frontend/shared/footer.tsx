"use client";
import { appConfig } from "@/config";

export function Footer() {
  return (
    <footer className="container py-8 text-center text-xs text-gray-500 mt-16">
      <span>
        © {new Date().getFullYear()} {appConfig.appName}
      </span>
    </footer>
  );
}
