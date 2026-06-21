"use client";

import { Markdown } from "@/components/shared/markdown";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { appConfig } from "@/config";
import apiClient from "@/lib/api";
import { cn, isBrowser } from "@/lib/utils";
import { ResponseInfo } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Faqs } from "../../shared/faqs";
import ImageCode from "../../shared/image-code";
import { Results } from "./results";

// Regular expression to validate a domain name
const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;

const FormValueSchema = z.object({
  domain: z.string().regex(domainRegex, "Invalid domain name")
}); 
type FormValues = z.infer<typeof FormValueSchema>;

export function Main({
  markdownContents
}: Readonly<{  
  markdownContents: Record<string, string | undefined>;
}>) {
  const { block1 } = markdownContents;
  const t = useTranslations();
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<any>(false); 
  const [info, setInfo] = useState<ResponseInfo | null>(null); 
  const defaultValues: FormValues = { 
    domain: "openai.com"  
  }
  const [values, setValues] = useState<FormValues>(defaultValues); 

  const form = useForm<FormValues>({
    resolver: zodResolver(FormValueSchema),
    defaultValues
  });

  const faqs = [
    {
      question: t('frontend.home.faq.qa1.question'),
      answer: t('frontend.home.faq.qa1.answer')
    },
    {
      question: t('frontend.home.faq.qa2.question'),
      answer: t('frontend.home.faq.qa2.answer')
    },
    {
      question: t('frontend.home.faq.qa3.question'),
      answer: t('frontend.home.faq.qa3.answer')
    },
    {
      question: t('frontend.home.faq.qa4.question'),
      answer: t('frontend.home.faq.qa4.answer')
    },
    {
      question: t('frontend.home.faq.qa5.question'),
      answer: t('frontend.home.faq.qa5.answer')
    },
  ];

  const { domain } = values;

  const handleSubmit = (values: FormValues) => {
    setFetching(true);
    setError(false); 
    setInfo(null); 
    setValues(values);
    apiClient.get(`/favicon/${values.domain}`)
      .then((res) => { 
        setInfo(res as any);
        setFetching(false);
      })
      .catch((error) => {
        setError(error.message);
        console.log("error", error);
        setFetching(false);
      });
  };

  const textCls = "text-primary font-medium";
  const [host, setHost] = useState<string | undefined>(undefined);
  const [imageDefaultUrl, setImageDefaultUrl] = useState<string | undefined>(undefined);
  const [imageLargerUrl, setImageLargerUrl] = useState<string | undefined>(undefined);
 
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentHost = window.location.host;
      const protocol = window.location.protocol; 
      setHost(currentHost); 
      setImageDefaultUrl(`${protocol}//${currentHost}/favicon/${domain}`);
      setImageLargerUrl(`${protocol}//${currentHost}/favicon/${domain}?larger=true`);
    }
  }, [domain]);

  const imageDefaultCoce = imageDefaultUrl ? `<img alt="Favicon" src="${imageDefaultUrl}" />` : "";
  const imageLargerCoce = imageLargerUrl ? `<img alt="Favicon" src="${imageLargerUrl}" />` : "";

  const images: {
    src: string;
    title: string;
    codeStr: string;
    alt: string;
  }[] = [
    {
      src: imageDefaultUrl || "",
      title: t("frontend.home.default_size"),
      codeStr: imageDefaultCoce,
      alt: t("frontend.home.default_size_alt", { domain })
    },
    {
      src: imageLargerUrl || "",
      title: t("frontend.home.larger_size"),
      codeStr: imageLargerCoce,
      alt: t("frontend.home.larger_size_alt", { domain })
    },
  ]; 

  return (
    <div className={cn("max-w-4xl mx-auto w-full leading-9 text-base pt-24 pb-16")}>
      <div className="backdrop-blur-[60px] bg-white/80 rounded-[40px] p-8 md:p-12 border border-white/60 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)]">
        <div className="inline-block px-4 py-1 rounded-full bg-[#1C1C1E]/5 border border-[#1C1C1E]/10 mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1C1C1E]/60">在线工具</span>
        </div>
        <h1 className="text-5xl mb-4 font-extrabold tracking-tight text-[#1C1C1E]">{appConfig.appName}</h1>
        <p className={`${textCls} text-lg font-normal text-[#1C1C1E]/70 mb-8`}>{t('frontend.home.h1')}</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem nospace={true} className="mb-8">
                  <div className="flex w-full gap-3">
                    <FormControl>
                      <Input
                        type="search"
                        className="rounded-[28px] h-14 text-lg bg-gray-100/50 border-gray-200/40 shadow-inner backdrop-blur-xl focus:bg-white/90 transition-all aria-[describedby*=-form-item-message]:ring-red-400"
                        placeholder="输入域名（例如：example.com）"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      loading={fetching}
                      className="h-14 rounded-full px-8 bg-[#1C1C1E] hover:bg-[#1C1C1E]/90 active:scale-[0.98] transition-all shadow-lg font-semibold"
                      disabled={!field.value || fetching}
                    >
                      {t('frontend.home.get_favicons')}
                    </Button>
                  </div>
                  {field.value && <FormMessage /> }
                </FormItem>
              )}
            />
          </form>
        </Form>

        {error && (
          <div className="rounded-[28px] border-2 border-red-500/30 bg-red-50/50 p-6 mb-8 backdrop-blur-xl">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}
        {fetching && <Skeleton className="h-72 w-full rounded-[28px] mb-8 bg-gray-100/50" />}
        {info && isBrowser() && <Results info={info} />}
      </div>

      {host && (
        <div className="mt-8 backdrop-blur-[60px] bg-white/80 rounded-[40px] p-8 md:p-12 border border-white/60 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)]">
          {images.map(image => <ImageCode {...image} key={image.src} />)}
        </div>
      )}

      {block1 && (
        <div className="mt-8 backdrop-blur-[60px] bg-white/80 rounded-[40px] p-8 md:p-12 border border-white/60 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)]">
          <Markdown content={block1} className="" />
        </div>
      )}

      <div className="mt-8 backdrop-blur-[60px] bg-white/80 rounded-[40px] p-8 md:p-12 border border-white/60 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)]">
        <Faqs faqs={faqs} title={t('frontend.home.faq.title')} />
      </div>
    </div>
  );
}
