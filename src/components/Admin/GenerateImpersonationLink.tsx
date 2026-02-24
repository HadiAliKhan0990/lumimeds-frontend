'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { FaCopy, FaExternalLinkAlt, FaClock } from 'react-icons/fa';
import { useGenerateImpersonationLinkMutation } from '@/store/slices/impersonationApiSlice';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';

interface ImpersonationModalProps {
  show: boolean;
  onHide: () => void;
  targetUserId: string;
  targetUserEmail?: string;
  targetUserRole: 'patient' | 'provider';
}

// Modal component that can be rendered outside the dropdown
export const ImpersonationModal = ({
  show,
  onHide,
  targetUserId,
  targetUserEmail,
  targetUserRole,
}: ImpersonationModalProps) => {
  const [linkData, setLinkData] = useState<{
    link: string;
    token: string;
    expiresAt: string;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  const [generateLink, { isLoading }] = useGenerateImpersonationLinkMutation();

  const roleLabel = targetUserRole === 'patient' ? 'Patient' : 'Provider';

  // Calculate time remaining
  const calculateTimeRemaining = useCallback(() => {
    if (!linkData?.expiresAt) return;

    const now = new Date().getTime();
    const expiry = new Date(linkData.expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      setTimeRemaining('Expired');
      setIsExpired(true);
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    setTimeRemaining(`${minutes}m ${seconds}s`);
    setIsExpired(false);
  }, [linkData?.expiresAt]);

  // Update countdown every second
  useEffect(() => {
    if (!linkData?.expiresAt) return;

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [linkData?.expiresAt, calculateTimeRemaining]);

  // Reset state when modal closes
  useEffect(() => {
    if (!show) {
      const timer = setTimeout(() => {
        setLinkData(null);
        setTimeRemaining('');
        setIsExpired(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleGenerateLink = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      const response = await generateLink({ targetUserId, targetUserRole }).unwrap();

      if (response.success && response.data) {
        setLinkData({
          link: response.data.link,
          token: response.data.token,
          expiresAt: response.data.expiresAt,
        });
        setIsExpired(false);
      } else {
        toast.error(response.message || 'Failed to generate impersonation link');
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message
        : (error as Error).data?.message || 'Failed to generate impersonation link';
      toast.error(errorMessage);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!linkData?.link) return;

    try {
      await navigator.clipboard.writeText(linkData.link);
      toast.success('Link copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = linkData.link;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      } finally {
        textArea.remove();
      }
    }
  };

  const handleOpenLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!linkData?.link || isExpired) return;
    window.open(linkData.link, '_blank', 'noopener');
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      <Modal.Header closeButton>
        <Modal.Title>Login as {roleLabel}</Modal.Title>
      </Modal.Header>
      <Modal.Body onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {!linkData ? (
          <div className="text-center py-4">
            <p className="mb-4">
              Generate a one-time magic link to login as{' '}
              <strong>{targetUserEmail || `this ${roleLabel.toLowerCase()}`}</strong>.
            </p>
            <p className="text-muted small mb-4">
              The link will expire in 15 minutes and can only be used once.
              You will need to verify your login password to complete the impersonation.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={handleGenerateLink}
              disabled={isLoading}
              className="d-flex align-items-center justify-content-center gap-2 mx-auto"
            >
              {isLoading && <Spinner size="sm" />}
              Generate Impersonation Link
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-medium">Magic Link</span>
                <span
                  className={`d-flex align-items-center gap-1 small ${
                    isExpired ? 'text-danger' : 'text-success'
                  }`}
                >
                  <FaClock size={12} />
                  {timeRemaining}
                </span>
              </div>
              <Form.Control
                as="textarea"
                readOnly
                value={linkData.link}
                rows={3}
                className="font-monospace small"
                style={{ resize: 'none' }}
              />
            </div>

            <div className="d-flex gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={handleCopyLink}
                disabled={isExpired}
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
              >
                <FaCopy size={14} />
                Copy Link
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleOpenLink}
                disabled={isExpired}
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
              >
                <FaExternalLinkAlt size={14} />
                Open Link
              </Button>
            </div>

            {isExpired && (
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline-primary"
                  onClick={handleGenerateLink}
                  disabled={isLoading}
                  className="w-100 d-flex align-items-center justify-content-center gap-2"
                >
                  {isLoading && <Spinner size="sm" />}
                  Generate New Link
                </Button>
              </div>
            )}

            <div className="alert alert-info mt-3 mb-0 small">
              <strong>Note:</strong> When you open this link, you will be asked to enter your login password
              to verify your identity before the session starts.
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

