"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api";
import { ResponseInfo } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import ImageCode from "../../shared/image-code";
import { Results } from "./results";

const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;

const FormValueSchema = z.object({
  domain: z.string().regex(domainRegex, "请输入有效的域名")
}); 
type FormValues = z.infer<typeof FormValueSchema>;

export function Main() {
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<any>(false); 
  const [info, setInfo] = useState<ResponseInfo | null>(null); 
  const defaultValues: FormValues = { 
    domain: ""  
  }
  const [values, setValues] = useState<FormValues>(defaultValues); 

  const form = useForm<FormValues>({
    resolver: zodResolver(FormValueSchema),
    defaultValues
  });

  const { domain } = values;

  const handleSubmit = (values: FormValues) => {
    setFetching(true);
    setError(false); 
    setInfo(null); 
    setValues(values);
    apiClient.get(`/favicon/${values.domain}`)
      .then((res) => { 
        const responseInfo = res as any;
        setInfo(responseInfo);
        setFetching(false);
        
        // Set image URLs
        if (responseInfo?.host) {
          const baseUrl = responseInfo.host;
          const domain = baseUrl.replace(/^https?:\/\//, '');
          setHost(baseUrl);
          setImageDefaultUrl(`${baseUrl}/favicon/${domain}?size=default`);
          setImageLargerUrl(`${baseUrl}/favicon/${domain}?size=larger`);
        }
      })
      .catch((error) => {
        setError(error.message);
        setFetching(false);
      });
  };

  const [host, setHost] = useState<string | undefined>(undefined);
  const [imageDefaultUrl, setImageDefaultUrl] = useState<string | undefined>(undefined);
  const [imageLargerUrl, setImageLargerUrl] = useState<string | undefined>(undefined);

  const images = [
    {
      src: imageDefaultUrl,
      alt: `${domain} favicon 默认尺寸`,
      title: "默认尺寸",
      host,
      size: "default" as const
    },
    {
      src: imageLargerUrl,
      alt: `${domain} favicon 较大尺寸`,
      title: "较大尺寸",
      host,
      size: "larger" as const
    },
  ].filter(i => i.src);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Favicon 下载器</h1>
          <p className="text-sm text-muted-foreground mt-1">输入域名，获取网站图标</p>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Input form */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <FormControl>
                        <Input
                          type="text"
                          className="flex-1 h-12 text-base"
                          placeholder="example.com"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="submit"
                        className="h-12 px-8 sm:w-auto w-full"
                        disabled={!field.value || fetching}
                      >
                        {fetching ? "获取中..." : "获取图标"}
                      </Button>
                    </div>
                    {field.value && <FormMessage />}
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-8 bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-destructive">
            <p className="font-medium">获取失败</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Results */}
        {info && (
          <div className="mt-8">
            <Results info={info} />
          </div>
        )}

        {/* API Documentation */}
        {host && images.length > 0 && (
          <div className="mt-12 space-y-8">
            <h2 className="text-xl font-semibold text-foreground">API 调用说明</h2>
            {images.map(image => (
              <ImageCode {...image} key={image.src} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Favicon Downloader API
          </p>
        </div>
      </footer>
    </div>
  );
}
