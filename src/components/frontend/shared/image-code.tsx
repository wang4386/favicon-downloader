"use client";
import CodeCopyBtn from "@/components/shared/CodeCopyBtn";
import { Skeleton } from "@/components/ui/skeleton";
import { isBrowser } from "@/lib/utils";
import { useEffect, useState } from "react";
 

const ImageCode = ({ alt, title, src, codeStr, className}: { src: string; codeStr: string; title: string; alt: string; className?: string; }) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (src && isBrowser()) {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        setDimensions({ width: 100, height: 100 });
      };
    }
  }, [src]);

  if (!dimensions) {
    return(
      <div className="mb-5">
        <Skeleton className="h-10 w-52 rounded-md mb-5" />
        <Skeleton className="h-36 w-36 rounded-md mb-5" />
        <Skeleton className="h-16 w-full rounded-md mb-5" />
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div>
          <div className="max-w-[300px] mb-4">
            <img
              src={src}
              alt={alt}
              width={dimensions.width}
              height={dimensions.height}
              className="bg-secondary rounded-xl border border-border min-w-[50px] min-h-[50px]"
              loading="lazy"
            />
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>尺寸:</strong> {dimensions.width} × {dimensions.height}</p>
            <p><strong>格式:</strong> {src.includes('.svg') ? 'SVG' : src.includes('.png') ? 'PNG' : src.includes('.ico') ? 'ICO' : '图片'}</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">API 调用示例</h3>
          <pre className="bg-muted/50 p-4 rounded-xl flex items-start overflow-x-auto relative border border-border">
            <code className="text-xs font-mono whitespace-pre">
              {codeStr}
            </code>
            <CodeCopyBtn>{codeStr}</CodeCopyBtn>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ImageCode;
