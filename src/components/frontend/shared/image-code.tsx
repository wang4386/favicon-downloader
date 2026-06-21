"use client";

import CodeCopyBtn from "@/components/shared/CodeCopyBtn";

interface ImageCodeProps {
  src?: string;
  alt: string;
  title: string;
  host?: string;
  size: "default" | "larger";
  className?: string;
}

export default function ImageCode({
  src,
  alt,
  title,
  host,
  size,
  className = "mb-12"
}: ImageCodeProps) {
  if (!src || !host) return null;

  const dimensions = {
    width: size === "larger" ? 128 : 64,
    height: size === "larger" ? 128 : 64
  };

  const codeStr = `${host}/favicon/${host.replace(/^https?:\/\//, '')}?size=${size}`;

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
        {/* Left: Image preview */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-secondary/30 rounded-lg p-4 border border-border">
            <img 
              src={src} 
              alt={alt} 
              width={dimensions.width} 
              height={dimensions.height} 
              className="block"
              loading="lazy" 
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {dimensions.width} × {dimensions.height} px
            </p>
          </div>
        </div>

        {/* Right: API call example */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground mb-2">API 调用地址</h3>
          <div className="relative">
            <pre className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto">
              <code className="text-xs font-mono text-foreground break-all">
                {codeStr}
              </code>
            </pre>
            <div className="absolute top-2 right-2">
              <CodeCopyBtn>{codeStr}</CodeCopyBtn>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            将此 URL 用于您的应用、文档或设计工具中。支持直接访问或 API 调用。
          </p>
        </div>
      </div>
    </div>
  );
}
