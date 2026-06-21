"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api";
import { ResponseInfo } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Copy, Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,24}?$/;

const FormValueSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(1, "请输入网址或域名")
    .transform((value) => normalizeDomain(value))
    .refine((value) => domainRegex.test(value), "请输入有效的网址或域名，例如 openai.com"),
});

type FormValues = z.input<typeof FormValueSchema>;
type NormalizedValues = z.output<typeof FormValueSchema>;

type ApiCard = {
  title: string;
  label: string;
  description: string;
  url: string;
  preview: string;
  sizeNote: string;
};

function normalizeDomain(value: string) {
  const raw = value.trim();
  if (!raw) return raw;
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProtocol).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].toLowerCase();
  }
}

function getOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://icon.qninq.cn";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/55 bg-white/45 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white/70 hover:text-slate-950"
      aria-label="复制 API 地址"
    >
      {copied ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
      {copied ? "已复制" : "复制"}
    </button>
  );
}

function ApiGlassCard({ card }: { card: ApiCard }) {
  return (
    <section className="group relative overflow-hidden rounded-[2rem] border border-white/55 bg-white/40 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/55 hover:shadow-[0_30px_90px_rgba(15,23,42,0.14)] sm:p-6">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-sky-300/25 blur-3xl transition group-hover:bg-sky-300/35" />

      <div className="relative flex items-start gap-5">
        <div className="flex size-24 shrink-0 items-center justify-center rounded-[1.6rem] border border-white/60 bg-white/50 shadow-inner shadow-white/60 backdrop-blur-xl sm:size-28">
          <img
            src={card.preview}
            alt={card.title}
            className="size-14 rounded-2xl object-contain drop-shadow-sm sm:size-16"
            loading="lazy"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky-200/70 bg-sky-100/60 px-2.5 py-1 text-xs font-semibold text-sky-700">
              {card.label}
            </span>
            <span className="text-xs text-slate-500">{card.sizeNote}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{card.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
        </div>
      </div>

      <div className="relative mt-5 rounded-2xl border border-white/55 bg-slate-950/90 p-3 shadow-inner shadow-black/20">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-400">API 地址</span>
          <CopyButton text={card.url} />
        </div>
        <code className="block overflow-x-auto whitespace-nowrap pb-1 text-xs leading-6 text-sky-100 sm:text-sm">
          {card.url}
        </code>
      </div>
    </section>
  );
}

export function Main() {
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<ResponseInfo | null>(null);
  const [domain, setDomain] = useState("openai.com");

  const form = useForm<FormValues>({
    resolver: zodResolver(FormValueSchema),
    defaultValues: { domain: "openai.com" },
  });

  const origin = getOrigin();
  const defaultUrl = `${origin}/favicon/${domain}`;
  const largerUrl = `${origin}/favicon/${domain}?larger=true`;

  const cards = useMemo<ApiCard[]>(
    () => [
      {
        title: "默认尺寸",
        label: "Default",
        description: "适合列表、按钮、文档引用和轻量级展示，优先返回站点默认 favicon。",
        url: defaultUrl,
        preview: defaultUrl,
        sizeNote: "站点默认图标",
      },
      {
        title: "较大尺寸",
        label: "Larger",
        description: "适合封面、卡片、应用入口等更醒目的场景，优先获取更清晰的大图标。",
        url: largerUrl,
        preview: largerUrl,
        sizeNote: "更高清晰度",
      },
    ],
    [defaultUrl, largerUrl]
  );

  const handleSubmit = (values: NormalizedValues) => {
    setFetching(true);
    setError(null);
    setDomain(values.domain);

    apiClient
      .get(`/favicon/${values.domain}`)
      .then((res) => {
        setInfo(res as unknown as ResponseInfo);
        setFetching(false);
      })
      .catch((error) => {
        setError(error?.message || "获取失败，请稍后重试");
        setInfo(null);
        setFetching(false);
      });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,rgba(125,211,252,0.30),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(196,181,253,0.30),transparent_28%),linear-gradient(135deg,#f8fbff_0%,#eef6ff_45%,#f8fafc_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.38)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-white/45 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col justify-center py-10">
        <section className="relative overflow-hidden rounded-[2.4rem] border border-white/60 bg-white/38 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-sky-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-0 size-80 rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/65 bg-white/45 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-xl">
                <Sparkles className="size-4 text-sky-500" />
                Favicon Downloader API
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                输入网址，获取网站图标。
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                默认中文界面，保留 OpenAI 示例。输入任意域名，即可生成默认尺寸与较大尺寸两种 favicon API 调用地址。
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-8">
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <div className="rounded-[1.7rem] border border-white/65 bg-white/48 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:flex sm:items-center sm:gap-2">
                          <FormControl>
                            <Input
                              type="text"
                              className="h-14 rounded-[1.25rem] border-0 bg-transparent px-4 text-base font-medium text-slate-950 shadow-none outline-none ring-0 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                              placeholder="openai.com"
                              autoComplete="off"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="submit"
                            disabled={fetching}
                            className="mt-2 h-13 w-full rounded-[1.25rem] bg-slate-950 px-6 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:bg-slate-800 sm:mt-0 sm:h-14 sm:w-auto"
                          >
                            {fetching ? <Loader2 className="size-4 animate-spin" /> : <span className="inline-flex items-center gap-2">获取图标 <ArrowRight className="size-4" /></span>}
                          </Button>
                        </div>
                        <FormMessage className="pl-4 pt-2 text-sm text-rose-500" />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-200/70 bg-rose-50/60 px-4 py-3 text-sm text-rose-600 backdrop-blur-xl">
                  {error}
                </div>
              )}

              {info && !error && (
                <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/65 px-4 py-2 text-sm font-medium text-emerald-700 backdrop-blur-xl">
                  <CheckCircle2 className="size-4" />
                  已获取 {info.host}，共发现 {info.icons?.length || 0} 个图标
                </div>
              )}
            </div>

            <div className="relative mx-auto flex w-full max-w-sm items-center justify-center lg:justify-end">
              <div className="absolute size-72 rounded-full bg-gradient-to-br from-sky-300/35 to-indigo-300/25 blur-3xl" />
              <div className="relative flex size-64 items-center justify-center rounded-[3rem] border border-white/65 bg-white/42 shadow-[0_30px_90px_rgba(15,23,42,0.13)] backdrop-blur-2xl sm:size-72">
                <div className="absolute inset-3 rounded-[2.55rem] border border-white/55" />
                <img
                  src={defaultUrl}
                  alt={`${domain} favicon`}
                  className="size-28 rounded-[2rem] object-contain drop-shadow-[0_22px_32px_rgba(15,23,42,0.18)] sm:size-32"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          {cards.map((card) => (
            <ApiGlassCard key={card.label} card={card} />
          ))}
        </section>
      </div>
    </main>
  );
}
