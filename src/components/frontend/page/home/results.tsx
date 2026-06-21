"use client";
import { Button } from '@/components/ui/button';
import { getBase64MimeType, getImageMimeType, isBrowser } from '@/lib/utils';
import { ResponseInfo } from '@/types';
import { SearchCheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

function fetchImage(url: string): Promise<{ blob: Blob, extension: string }> {
  return fetch(url).then(response => {
    const contentType = response.headers.get('Content-Type') || '';
    const extension = getImageMimeType(contentType);
    return response.blob().then(blob => ({ blob, extension }));
  });
}

const downloadImagesAsZip = (icons: { href: string, sizes?: string }[], domain: string) => {
  if (typeof window === 'undefined' || !window.navigator) {
    console.warn('Download is not available in this environment');
    return;
  }

  Promise.all([
    import('jszip'),
    import('file-saver')
  ]).then(([JSZipModule, FileSaverModule]) => {
    const JSZip = JSZipModule.default;
    const zip = new JSZip();
    const folder = zip.folder(`${domain}-images`);
    const saveAs =  FileSaverModule.default || FileSaverModule.saveAs;
    if (typeof saveAs !== 'function') {
      console.error('saveAs is not a function', FileSaverModule);
      return;
    }

    const addBase64Image = ({ base64Data, index, sizes }: { base64Data: string; index: number, sizes?: string; }) => {
      const data = base64Data.split(',')[1];
      const extension = getBase64MimeType(base64Data);
      const filename = `favicon-${domain}-${index + 1}-${sizes}.${extension}`;
      folder!.file(filename, data, { base64: true });
    };

    const addUrlImage = ({ href, index, sizes }: { href: string; index: number, sizes?: string; }): Promise<void> => {
      return fetchImage(href).then(({ blob, extension }) => {
        const filename = `favicon-${domain}-${index + 1}-${sizes}.${extension}`;
        folder!.file(filename, blob);
      });
    };

    const imagePromises = icons.map(({ href, sizes }, index) => {
      if (/^data:image\//.test(href)) {
        return addBase64Image({ base64Data: href, index, sizes });
      } else {
        return addUrlImage({ href: `/download/${href}`, index, sizes });
      }
    });

    Promise.all(imagePromises)
      .then(() => zip.generateAsync({ type: 'blob' }))
      .then(content => saveAs(content, `${domain}-favicons.zip`))
      .catch(error => {
        console.error('Error creating or saving zip:', error);
      });
  }).catch(error => {
    console.error('Failed to load required modules:', error);
  });
};

const IconImage = ({ icon, index, onLoad, domain }: { icon: any; index: number; domain: string; onLoad?: (sizes: string) => void }) => {
  const [sizes, setSizes] = useState<string>(icon.sizes);
  const imgRef = useRef<HTMLImageElement>(null);
  const t = useTranslations();

  const downloadBase64Image = useCallback(({ base64Data, domain }: { base64Data: string, domain: string }) => {
    if (typeof window === 'undefined' || !window.navigator) {
      console.warn('Download is not available in this environment');
      return;
    }
    const link = document.createElement('a');
    let imgType = getBase64MimeType(base64Data);
    link.href = base64Data;
    link.download = `favicon-${domain}.${imgType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  useEffect(() => {
    if (isBrowser() && imgRef.current) {
      const img = imgRef.current;
      const handleImageLoad = () => {
        const newSizes = `${img.naturalWidth}x${img.naturalHeight}`;
        setSizes(newSizes);
        if (onLoad) onLoad(newSizes);
      };

      img.addEventListener('load', handleImageLoad);
      return () => {
        img.removeEventListener('load', handleImageLoad);
      };
    }
  }, [onLoad]);

  return (
    <div className="bg-card p-4 text-sm rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <a href={icon.href} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <img
            ref={imgRef}
            src={icon.href}
            className="h-[50px] w-[50px] rounded-lg border border-border"
            alt={`Icon ${index + 1}`}
          />
        </a>
        <div className="flex flex-col text-sm min-w-0">
          <span className="font-medium text-foreground">
            {index + 1}. {sizes}
          </span>
          <a href={/^data:image\//.test(icon.href) ? icon.href : `/download/${icon.href}`}
            onClick={(e) => {
              if (/^data:image\//.test(icon.href)) {
                e.preventDefault();
                downloadBase64Image({ domain, base64Data: icon.href });
              }
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 mt-auto font-medium transition-colors"
          >
            {t('frontend.home.download')}
          </a>
        </div>
      </div>
    </div>
  );
};

export const Results = ({ info }: { info: ResponseInfo }) => {
  const t = useTranslations();
  const [iconInfo, setIconInfo] = useState<ResponseInfo>(info);

  const handleDownloadZip = useCallback(() => {
    if (typeof window === 'undefined' || !window.navigator) {
      console.warn('Download is not available in this environment');
      return;
    }
    downloadImagesAsZip(iconInfo.icons, iconInfo.host);
  }, [iconInfo.icons, iconInfo.host]);

  const iconOnLoad = useCallback(({ sizes, iconIndex }: { sizes: string; iconIndex: number }) => {
    setIconInfo(prevInfo => ({
      ...prevInfo,
      icons: prevInfo.icons.map((icon, index) =>
        index === iconIndex ? { ...icon, sizes } : icon
      )
    }));
  }, []);

  return (
    <div className="bg-secondary/30 p-6 text-base flex flex-col gap-6 mb-10 rounded-xl border border-border">
      <div className="font-semibold flex items-center text-lg">
        {t('frontend.home.results_for')}: <span className="text-primary ml-2">{iconInfo.host}</span>
        <SearchCheckIcon size={24} className="ml-2 text-success" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {iconInfo.icons.map((icon, index) => (
          <div key={index}>
            <IconImage
              domain={iconInfo.host}
              icon={icon}
              index={index}
              onLoad={(sizes) => iconOnLoad({ sizes, iconIndex: index })}
            />
          </div>
        ))}
      </div>
      <Button
        onClick={handleDownloadZip}
        className="rounded-full w-64 mx-auto font-medium shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all"
      >
        {t('frontend.home.download_zip')}
      </Button>
    </div>
  );
};