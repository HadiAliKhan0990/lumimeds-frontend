'use client';

import AsyncImgLoader from '@/components/AsyncImgLoader';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AiFillFilePdf } from 'react-icons/ai';
import { client } from '@/lib/baseQuery';
import { Blur } from 'transitions-kit';
import { AsyncImage } from 'loadable-image';
import { extractFileNameFromUrl } from '@/lib/helper';

const PDFPreviewModal = dynamic(
  () => import('@/components/Dashboard/PDFPreviewModal').then((mod) => mod.PDFPreviewModal),
  { ssr: false }
);

const urlCache = new Map<string, { url: string; expiresAt: number }>();
const MAX_RETRY_ATTEMPTS = 3;

interface Props {
  answer: string;
  onPdfPreview?: (url: string) => void;
}

export const FileAnswer = ({ answer, onPdfPreview }: Readonly<Props>) => {
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchPromiseRef = useRef<Promise<string | undefined> | null>(null);
  const retryCountRef = useRef(0);

  const [url, setUrl] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [internalPdfOpen, setInternalPdfOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const isExternalPdfPreview = useMemo(() => typeof onPdfPreview === 'function', [onPdfPreview]);

  const fetchFileUrl = useCallback(
    async (force = false): Promise<string | undefined> => {
      const fileKey = answer;
      if (!fileKey) return undefined;

      if (!force) {
        const cached = urlCache.get(fileKey);
        if (cached && Date.now() < cached.expiresAt) {
          setUrl(cached.url);
          return cached.url;
        }
      }

      // If already fetching, return the existing promise so callers can await it
      if (fetchPromiseRef.current) {
        return fetchPromiseRef.current;
      }

      setIsLoading(true);

      const fetchPromise = (async (): Promise<string | undefined> => {
        try {
          const { data } = await client.get(`/surveys/file-url?key=${fileKey}`);
          if (!mountedRef.current) return undefined;

          const newUrl: string | undefined = data.data?.url;
          if (newUrl) {
            const expiresAt = Date.now() + 5 * 60 * 1000;
            urlCache.set(fileKey, { url: newUrl, expiresAt });
            setUrl(newUrl);
            setFetchError('');
            retryCountRef.current = 0;

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                fetchPromiseRef.current = null;
                fetchFileUrl(true);
              }
            }, 4.5 * 60 * 1000);
          }

          return newUrl;
        } catch (error) {
          console.error('Error fetching file URL:', error);
          if (!fetchError) {
            setFetchError('Unable to load file. Please try again later.');
          }
          return undefined;
        } finally {
          if (mountedRef.current) {
            setIsLoading(false);
          }
          fetchPromiseRef.current = null;
        }
      })();

      fetchPromiseRef.current = fetchPromise;
      return fetchPromise;
    },
    [answer, fetchError]
  );

  const resolveUrl = useCallback(async () => {
    const latest = await fetchFileUrl();
    return latest || url;
  }, [fetchFileUrl, url]);

  useEffect(() => {
    mountedRef.current = true;
    fetchFileUrl();
    setInternalPdfOpen(false);
    setImageOpen(false);

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fetchFileUrl, retryKey]);

  const handleFileError = useCallback(() => {
    if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
      setFetchError('Unable to load file after multiple attempts.');
      return;
    }

    retryCountRef.current += 1;
    if (answer) {
      urlCache.delete(answer);
    }
    setRetryKey((prev) => prev + 1);
  }, [answer]);

  const handleImageClick = useCallback(async () => {
    const latestUrl = await resolveUrl();
    if (latestUrl) {
      setImageOpen(true);
    }
  }, [resolveUrl]);

  const handlePdfClick = useCallback(async () => {
    const latestUrl = await resolveUrl();
    if (!latestUrl) return;

    if (isExternalPdfPreview) {
      onPdfPreview?.(latestUrl);
    } else {
      setInternalPdfOpen(true);
    }
  }, [resolveUrl, onPdfPreview, isExternalPdfPreview]);

  const imagePattern = /\.(jpeg|jpg|png|gif|webp)$/i;
  const isImage = imagePattern.test(answer);

  if (isImage) {
    if (!url) {
      return (
        <div className='placeholder-glow file_image rounded overflow-hidden'>
          <span className='placeholder h-100 col-12' />
        </div>
      );
    }

    return (
      <>
        <Lightbox
          plugins={[Zoom]}
          render={{ iconPrev: () => null, iconNext: () => null }}
          open={imageOpen}
          zoom={{
            maxZoomPixelRatio: 3,
            zoomInMultiplier: 2,
            doubleTapDelay: 300,
            doubleClickDelay: 300,
            doubleClickMaxStops: 2,
            keyboardMoveDistance: 50,
            wheelZoomDistanceFactor: 100,
            pinchZoomDistanceFactor: 100,
            scrollToZoom: true,
          }}
          close={() => setImageOpen(false)}
          slides={[{ src: url }]}
          controller={{ closeOnPullDown: false, closeOnBackdropClick: true }}
        />
        <div className={'file_image' + (isLoading ? ' rounded overflow-hidden' : '')}>
          {isLoading ? (
            <div className='placeholder-glow w-100 h-100'>
              <span className='placeholder h-100 col-12' />
            </div>
          ) : (
            <AsyncImage
              key={retryKey}
              onClick={handleImageClick}
              onError={handleFileError}
              Transition={Blur}
              loader={<AsyncImgLoader />}
              src={url}
              alt='Uploaded file'
              className='file_image'
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <button
        type='button'
        disabled={isLoading || !!fetchError}
        onClick={handlePdfClick}
        className='btn btn-link d-flex align-items-center gap-2 text-sm btn-no-style text-primary'
      >
        <AiFillFilePdf size={20} color='red' />
        {extractFileNameFromUrl(url) || 'View Uploaded File'}
      </button>
      {fetchError && <div className='text-danger text-xs mt-1'>{fetchError}</div>}
      {!isExternalPdfPreview && url && (
        <PDFPreviewModal open={internalPdfOpen} setOpen={setInternalPdfOpen} url={url} />
      )}
    </>
  );
};
