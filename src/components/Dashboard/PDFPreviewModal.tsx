'use client';

import { extractFileNameFromUrl } from '@/lib/helper';
import { useState, useCallback } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { LuFileWarning } from 'react-icons/lu';

interface Props {
  open: boolean;
  setOpen: (ag: boolean) => void;
  url: string;
}

type LoadState = 'loading' | 'loaded' | 'error';

export const PDFPreviewModal = ({ open, setOpen, url }: Props) => {
  const [loadState, setLoadState] = useState<LoadState>('loading');

  const handleLoad = useCallback(() => {
    setLoadState('loaded');
  }, []);

  const handleError = useCallback(() => {
    setLoadState('error');
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setLoadState('loading');
  }, [setOpen]);

  const fileName = extractFileNameFromUrl(url) || 'PDF Preview';

  return (
    <Modal scrollable show={open} onHide={handleClose} size="xl" centered>
      <Modal.Header className="border-0 pdf_previwer" closeButton>
        <Modal.Title className="text-center">{fileName}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex flex-column align-items-center min-h-300px pt-0 position-relative">
        {/* Loading Indicator */}
        {loadState === 'loading' && (
          <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center gap-3 z-1">
            <Spinner animation="border" variant="primary" />
            <span className="text-muted">Loading document...</span>
          </div>
        )}

        {/* Error State */}
        {loadState === 'error' && (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5">
            <LuFileWarning size={64} className="text-muted mb-3" />
            <h5 className="text-muted mb-2">Unable to load PDF</h5>
            <p className="text-muted text-center mb-4" style={{ maxWidth: '400px' }}>
              The document couldn&apos;t be displayed. Please try again later.
            </p>
          </div>
        )}

        {/* PDF Viewer - Native browser rendering */}
        {url && loadState !== 'error' && (
          <iframe
            src={url}
            title={`PDF Preview - ${fileName}`}
            className="tw-w-full tw-h-[90vh]"
            style={{
              opacity: loadState === 'loaded' ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </Modal.Body>
    </Modal>
  );
};
