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
    <div className={cn("max-w-4xl mx-auto w-full leading-relaxed text-base pt-24 pb-16 px-4")}>
      {/* Impeccable: editorial hero with eyebrow pill */}
      <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border mb-6">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">在线工具</span>
        </div>
        <h1 className="text-5xl md:text-6xl mb-4 font-medium tracking-tight text-foreground">
          Favicon <span className="italic text-primary">下载器</span>
        </h1>
        <p className="text-xl font-light text-muted-foreground mb-8 max-w-2xl">{t('frontend.home.h1')}</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem nospace={true} className="mb-8">
                  <div className="flex flex-col md:flex-row w-full gap-3">
                    <FormControl>
                      <Input
                        type="search"
                        className="flex-1 rounded-xl h-14 text-base bg-background border-input shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all aria-[describedby*=-form-item-message]:border-destructive"
                        placeholder="输入域名（例如：example.com）"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      loading={fetching}
                      className="h-14 rounded-full px-8 bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:translate-y-[-2px] font-medium md:w-auto w-full"
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
          <div className="rounded-xl border-2 border-destructive/20 bg-destructive/5 p-6 mb-8">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}
        {fetching && <Skeleton className="h-72 w-full rounded-xl mb-8 bg-muted" />}
        {info && isBrowser() && <Results info={info} />}
      </div>

      {/* API 接口调用说明 */}
      {host && (
        <div className="mt-12 bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          {images.map(image => <ImageCode {...image} key={image.src} />)}
        </div>
      )}
    </div>
  );
}
