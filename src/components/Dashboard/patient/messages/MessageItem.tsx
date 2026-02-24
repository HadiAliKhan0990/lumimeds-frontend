'use client';

import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import dynamic from 'next/dynamic';
import parse, { DOMNode } from 'html-react-parser';
import { useCallback, useEffect, useState, useRef, CSSProperties, Fragment } from 'react';
import { parseLinks, renderLinks, parseAndRenderLinks } from '@/lib/linkUtils';
import { Blur } from 'transitions-kit';
import { AsyncImage } from 'loadable-image';
import { client } from '@/lib/baseQuery';
import { AiFillFilePdf } from 'react-icons/ai';
import { extractFileNameFromUrl } from '@/lib/helper';
import { useDynamicImageSize } from '@/hooks/useDynamicImageSize';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatUSDateTime, formatRelativeDateWithTime } from '@/helpers/dateFormatter';
import { ChatMessages } from '@/store/slices/chatSlice';
import { formatProviderName } from '@/lib/utils/providerName';
import { ConversationBreakdown } from '@/store/slices/patientChatSlice';

const PDFPreviewModal = dynamic(
  () => import('@/components/Dashboard/PDFPreviewModal').then((mod) => mod.PDFPreviewModal),
  {
    ssr: false,
  }
);

interface Props {
  message: ChatMessages;
  selectedProvider?: ConversationBreakdown | null;
}

const urlCache = new Map<string, { url: string; expiresAt: number }>();

export function MessageItem({ message, selectedProvider }: Readonly<Props>) {
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const fetchPromiseRef = useRef<Promise<void> | null>(null);

  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

  const { isLoading: isImageLoading, height } = useDynamicImageSize(url, 200);

  const profile = useSelector((state: RootState) => state.patientProfile);
  const currentUserId = profile?.user?.id;

  const messageSenderId = message.senderId || message.sender?.id;
  const isSender = currentUserId ? currentUserId === messageSenderId : !message.metadata?.adminName;

  const senderName = isSender
    ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'You'
    : selectedProvider && message.senderId === selectedProvider.providerUserId
    ? formatProviderName(selectedProvider.providerName)
    : message.metadata?.adminName || 'Admin';

  const fetchFileUrl = useCallback(
    async (force = false) => {
      const fileKey = message.metadata?.fileUrl;
      if (!fileKey) return;

      if (!force) {
        const cached = urlCache.get(fileKey);
        if (cached && Date.now() < cached.expiresAt) {
          setUrl(cached.url);
          return;
        }
      }

      // If already fetching, return the existing promise so callers can await it
      if (fetchPromiseRef.current) {
        return fetchPromiseRef.current;
      }

      setIsLoading(true);

      const fetchPromise = (async () => {
        try {
          const { data } = await client.get(`/chat/file-url?key=${fileKey}`);
          if (!mountedRef.current) return;

          if (data.data?.url) {
            const newUrl = data.data.url;
            const expiresAt = Date.now() + 5 * 60 * 1000;
            urlCache.set(fileKey, { url: newUrl, expiresAt });
            setUrl(newUrl);

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                fetchPromiseRef.current = null;
                fetchFileUrl(true);
              }
            }, 4.5 * 60 * 1000);
          }
        } catch (error) {
          console.error('Error fetching file URL:', error);
        } finally {
          if (mountedRef.current) setIsLoading(false);
          fetchPromiseRef.current = null;
        }
      })();

      fetchPromiseRef.current = fetchPromise;
      return fetchPromise;
    },
    [message.metadata?.fileUrl]
  );

  const handleFileError = useCallback(() => {
    if (url) {
      const fileKey = message.metadata?.fileUrl;
      if (fileKey) {
        urlCache.delete(fileKey);
        fetchFileUrl(true);
      }
    }
  }, [url, message.metadata?.fileUrl, fetchFileUrl]);

  const isImage = message.metadata?.fileUrl?.match(/\.(jpeg|jpg|png|gif|webp)$/i);

  const checkExpirationAndOpen = useCallback(
    async (type: 'pdf' | 'image') => {
      const fileKey = message.metadata?.fileUrl;
      if (!fileKey) return;

      const cached = urlCache.get(fileKey);
      if (!cached || Date.now() >= cached.expiresAt) {
        try {
          await fetchFileUrl(true);
          const updatedCache = urlCache.get(fileKey);
          if (updatedCache?.url)
            if (type === 'image') {
              setImageOpen(true);
            } else {
              setPdfOpen(true);
            }
        } catch (error) {
          console.error('Failed to refresh URL:', error);
        }
      } else if (type === 'image') {
        setImageOpen(true);
      } else {
        setPdfOpen(true);
      }
    },
    [message.metadata?.fileUrl, fetchFileUrl]
  );

  const renderFileContent = () => {
    if (!message.metadata?.fileUrl) {
      if (!message.content || message.content.trim() === '') {
        return <span className='fw-medium'>Sent an attachment 📎</span>;
      }
      
      // Check if content contains HTML tags
      const isHtmlContent = message.content?.includes('<') && message.content?.includes('>');
      
      if (isHtmlContent) {
        // For HTML content, parse HTML and apply link detection to text nodes
        const replaceOptions = {
          replace: (domNode: DOMNode) => {
            if (domNode.type === 'text' && domNode.data) {
              const linkParts = parseLinks(domNode.data);
              return <Fragment>{renderLinks(linkParts)}</Fragment>;
            }
          },
        };
        return <div>{parse(message.content, replaceOptions)}</div>;
      }
      
      // Plain text - apply link detection directly
      return <div>{parseAndRenderLinks(message.content)}</div>;
    }

    if (isImage) {
      if (!url)
        return (
          <div className='d-flex flex-column gap-2'>
            <span className='fw-medium'>Sent an attachment 📎</span>
            <div
              style={{ '--dynamic-height': `${height || 200}px` } as CSSProperties}
              className='placeholder-glow chat_image rounded'
            >
              <span className='placeholder h-100 col-12' />
            </div>
          </div>
        );

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

          <div
            className={'chat_image' + (isLoading ? ' rounded overflow-hidden' : '')}
            style={{ '--dynamic-height': `${height || 200}px` } as CSSProperties}
          >
            {isLoading || isImageLoading ? (
              <div className='placeholder-glow w-100 h-100'>
                <span className='placeholder h-100 col-12' />
              </div>
            ) : (
              <AsyncImage
                onClick={() => checkExpirationAndOpen('image')}
                onError={handleFileError}
                Transition={Blur}
                loader={
                  <div className='placeholder-glow w-100 h-100'>
                    <span className='placeholder h-100 col-12' />
                  </div>
                }
                src={url}
                alt='Uploaded file'
                style={{ '--dynamic-height': `${height || 200}px` } as CSSProperties}
                className='chat_image cursor-pointer rounded'
              />
            )}
          </div>
        </>
      );
    }

    if (!url)
      return (
        <div className='d-flex flex-column gap-2'>
          <span className='fw-medium'>Sent an attachment 📎</span>
          <div className='placeholder-glow w-150px'>
            <span className='placeholder col-12 py-12' />
          </div>
        </div>
      );

    return (
      <>
        <button
          onClick={() => checkExpirationAndOpen('pdf')}
          className={
            'btn btn-link d-flex align-items-center gap-2 text-sm btn-no-style ' +
            (isSender ? 'tw-text-primary' : 'text-dark')
          }
        >
          <AiFillFilePdf size={20} color='red' />
          {extractFileNameFromUrl(url) || 'View Uploaded PDF'}
        </button>

        <PDFPreviewModal open={pdfOpen} setOpen={setPdfOpen} url={url} />
      </>
    );
  };

  useEffect(() => {
    mountedRef.current = true;
    if (message.metadata?.fileUrl && !url) fetchFileUrl();
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [message.metadata?.fileUrl, url, fetchFileUrl]);

  return (
    <div className={'d-flex rich-content ' + (isSender ? '' : 'flex-row-reverse')}>
      <div className='flex-grow-1' />
      <div className={'d-flex flex-column ' + (isSender ? 'align-items-end' : 'align-items-start')}>
        <div
          className={
            'p-12 mb-1 text-sm d-flex flex-column message-width ' +
            (isSender
              ? 'sender_message tw-bg-light-blue tw-text-charcoal-gray'
              : 'receiver_message bg-pale-gray text-dark align-items-start')
          }
        >
          {isSender ? (
            <span className='text-capitalize align-self-end fw-semibold mb-1'>{senderName}</span>
          ) : (
            <span className='text-capitalize text-grey mb-1'>{senderName}</span>
          )}
          {renderFileContent()}
        </div>
        <div title={formatUSDateTime(message.createdAt)} className='text-xs text-muted-gray-blue'>
          {formatRelativeDateWithTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
