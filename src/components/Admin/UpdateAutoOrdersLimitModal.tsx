'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useUpdateAutoOrdersLimitMutation } from '@/store/slices/providersApiSlice';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';

interface UpdateAutoOrdersLimitModalProps {
  show: boolean;
  onHide: () => void;
  providerId: string;
  providerName?: string;
  currentLimit?: number;
  onUpdateAutoOrdersLimit?: (providerId: string, autoOrdersLimit: number) => void;
}

export const UpdateAutoOrdersLimitModal = ({
  show,
  onHide,
  providerId,
  providerName,
  currentLimit = 0,
  onUpdateAutoOrdersLimit,
}: UpdateAutoOrdersLimitModalProps) => {
  const [autoOrdersLimit, setAutoOrdersLimit] = useState<number>(currentLimit);
  const [updateAutoOrdersLimit, { isLoading }] = useUpdateAutoOrdersLimitMutation();

  useEffect(() => {
    setAutoOrdersLimit(currentLimit);
  }, [currentLimit, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const limitValue = isNaN(autoOrdersLimit) ? 0 : autoOrdersLimit;

    if (limitValue < 0 || !Number.isInteger(limitValue)) {
      toast.error('Auto orders limit must be a non-negative integer');
      return;
    }

    try {
      const response = await updateAutoOrdersLimit({
        providerId,
        autoOrdersLimit: limitValue,
      }).unwrap();

      if (response.success) {
        if (onUpdateAutoOrdersLimit) {
          onUpdateAutoOrdersLimit(providerId, limitValue);
        }
        toast.success(response.message || 'Auto orders limit updated successfully');
        onHide();
      } else {
        toast.error(response.message || 'Failed to update auto orders limit');
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message
        : (error as Error).data?.message || 'Failed to update auto orders limit';
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onHide();
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      <Modal.Header closeButton>
        <Modal.Title>Update Auto Orders Limit</Modal.Title>
      </Modal.Header>
      <Modal.Body onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        {providerName && (
          <p className="mb-3">
            Update auto orders limit for <strong>{providerName}</strong>
          </p>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="autoOrdersLimit">
            <Form.Label className="fw-medium">Auto Orders Limit</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="1"
              value={autoOrdersLimit===0 ? '' : autoOrdersLimit}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setAutoOrdersLimit(0);
                } else {
                  const numValue = parseInt(value, 10);
                  if (!isNaN(numValue)) {
                    setAutoOrdersLimit(numValue);
                  }
                }
              }}
              disabled={isLoading}
              placeholder="Enter auto orders limit"
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading}
          className="d-flex align-items-center justify-content-center gap-2"
        >
          {isLoading && <Spinner size="sm" />}
          Update Limit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

