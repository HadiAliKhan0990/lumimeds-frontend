'use client';

import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { clearActivityLog } from '@/store/slices/activityLogSlice';
import { ActivityLogPayload } from '@/store/slices/activityLogsApiSlice';
import { Badge, Offcanvas } from 'react-bootstrap';
import { HiOutlineUser } from 'react-icons/hi';
import { formatUSDateTime } from '@/helpers/dateFormatter';

interface ActivityLogModalProps {
  show: boolean;
  onHide: () => void;
}

export function ActivityLogModal({ show, onHide }: ActivityLogModalProps) {
  const dispatch = useDispatch();
  const activityLog = useSelector((state: RootState) => state.activityLog.current);

  const handleClose = () => {
    dispatch(clearActivityLog());
    onHide();
  };

  const getStatusBadgeVariant = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 400) return 'danger';
    return 'warning';
  };

  const formatJson = (value: ActivityLogPayload) => {
    if (value === null || typeof value === 'undefined') {
      return 'No data';
    }

    if (typeof value === 'string') {
      return value || 'No data';
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value.length ? JSON.stringify(value, null, 2) : 'No data';
    }

    if (typeof value === 'object') {
      return Object.keys(value as Record<string, unknown>).length ? JSON.stringify(value, null, 2) : 'No data';
    }

    return 'No data';
  };

  if (!activityLog) return null;

  // Check if this action was performed by an admin (impersonation)
  const requestBodyData = activityLog.requestBody as Record<string, unknown> | null;
  const adminId = requestBodyData?.adminId as string | undefined;
  const adminEmail = requestBodyData?.adminEmail as string | undefined;
  const adminName = requestBodyData?.adminName as string | undefined;
  const impersonationSessionId = requestBodyData?.impersonationSessionId as string | undefined;

  return (
    <Offcanvas
      show={show}
      onHide={handleClose}
      placement='end'
      className='activity-log-sidebar'
      style={{ width: '600px' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Activity Log Details</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {/* User Icon */}
        <div className='d-flex justify-content-center mb-4'>
          <div
            className='d-flex align-items-center justify-content-center rounded-circle text-white fw-bold bg-secondary'
            style={{
              width: '80px',
              height: '80px',
            }}
          >
            <HiOutlineUser size={40} />
          </div>
        </div>

        {/* Activity Details */}
        <div className='d-flex flex-column gap-3'>
          <div className='d-flex justify-content-between align-items-center'>
            <span className='fw-semibold'>User:</span>
            <span>{activityLog.userEmail}</span>
          </div>

          <div className='d-flex justify-content-between align-items-center'>
            <span className='fw-semibold'>Action:</span>
            <span className='tw-max-w-[25rem]'>
              {activityLog.method} {activityLog.endpoint}
            </span>
          </div>

          <div className='d-flex justify-content-between align-items-center'>
            <span className='fw-semibold'>Status Code:</span>
            <Badge bg={getStatusBadgeVariant(activityLog.statusCode)}>{activityLog.statusCode}</Badge>
          </div>

          <div className='d-flex justify-content-between align-items-center'>
            <span className='fw-semibold'>Date & Time:</span>
            <span>{formatUSDateTime(activityLog.createdAt)}</span>
          </div>

          {/* Performed By - Only show if adminId exists */}
          {adminId && (
            <div className='d-flex flex-column gap-2 p-3 bg-light rounded'>
              <div className='d-flex align-items-center gap-2 mb-2'>
                <Badge bg='info'>Performed by Admin</Badge>
              </div>
              <div className='d-flex justify-content-between align-items-center'>
                <span className='fw-semibold'>Admin Name:</span>
                <span>{adminName || 'N/A'}</span>
              </div>
              <div className='d-flex justify-content-between align-items-center'>
                <span className='fw-semibold'>Admin Email:</span>
                <span>{adminEmail || 'N/A'}</span>
              </div>
              <div className='d-flex justify-content-between align-items-center'>
                <span className='fw-semibold'>Admin ID:</span>
                <span className='font-monospace small'>{adminId}</span>
              </div>
              {impersonationSessionId && (
                <div className='d-flex justify-content-between align-items-center'>
                  <span className='fw-semibold'>Session ID:</span>
                  <span className='font-monospace small'>{impersonationSessionId}</span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          <div className='d-flex justify-content-between align-items-start'>
            <span className='fw-semibold'>Error:</span>
            <span className='text-danger'>{activityLog.errorMessage || 'No error message'}</span>
          </div>

          {/* Request Body */}
          <div className='d-flex flex-column'>
            <span className='fw-semibold mb-2'>Request Body:</span>
            <div className='bg-light p-3 rounded'>
              <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                {formatJson(activityLog.requestBody)}
              </pre>
            </div>
          </div>

          {/* Query Parameters */}
          <div className='d-flex flex-column'>
            <span className='fw-semibold mb-2'>Query Parameters:</span>
            <div className='bg-light p-3 rounded'>
              <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                {formatJson(activityLog.requestQuery)}
              </pre>
            </div>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
