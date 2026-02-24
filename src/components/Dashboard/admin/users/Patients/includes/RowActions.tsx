'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Error, Response } from '@/lib/types';
import { isAxiosError } from 'axios';
import { useForgotPasswordMutation } from '@/store/slices/userApiSlice';
import { Patient } from '@/store/slices/patientSlice';
import { Dropdown, DropdownItem } from '@/components/elements';
import { Form, Spinner } from 'react-bootstrap';
import { TfiMoreAlt } from 'react-icons/tfi';
import { useGeneratePatientPasswordMutation, useGenerateTrustpilotLinkMutation } from '@/store/slices/patientsApiSlice';
import { ImpersonationModal } from '@/components/Admin/GenerateImpersonationLink';

type ToggleStatus = 'unresponsive' | 'disputed';

interface RowActionsProps {
  patient: Patient;
  onBanClick: (patient: Patient) => void;
  onUnbanClick: (patient: Patient) => void;
  onViewBanReasonClick: (patient: Patient) => void;
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
  onToggleStatus?: (patient: Patient, targetStatus: ToggleStatus, enabled: boolean) => void;
  statusUpdatingId?: string | null;
  isUpdatingStatus?: boolean;
}

export const RowActions = ({
  patient,
  onBanClick,
  onUnbanClick,
  onViewBanReasonClick,
  isSuperAdmin,
  isAdmin,
  onToggleStatus,
  statusUpdatingId,
  isUpdatingStatus,
}: Readonly<RowActionsProps>) => {
  const [mutateAsync, { isLoading }] = useForgotPasswordMutation();
  const [generatePassword, { isLoading: isGeneratingPassword }] = useGeneratePatientPasswordMutation();
  const [generateTrustpilotLink, { isLoading: isGeneratingTrustpilotLink }] = useGenerateTrustpilotLinkMutation();
  const [showImpersonationModal, setShowImpersonationModal] = useState(false);
  const normalizedStatus = patient.status?.toLowerCase();
  const isUnresponsive = normalizedStatus === 'unresponsive';
  const isDisputed = normalizedStatus === 'disputed';
  const updatingKey = patient.id ?? patient.userId ?? null;
  const isStatusUpdating = Boolean(isUpdatingStatus && statusUpdatingId && statusUpdatingId === updatingKey);

  const handleResetPassword = async () => {
    const resetPromise = mutateAsync({
      email: patient.email ?? '',
      role: 'patient',
    }).unwrap();

    toast.promise(resetPromise, {
      loading: 'Sending reset link...',
      success: (data: Response) => {
        return data.message || 'Reset link sent successfully';
      },
      error: (error) => {
        return isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data?.message || 'Error while resetting password';
      },
    });
  };

  const handleGeneratePassword = async () => {
    if (!patient.id) {
      toast.error('Patient ID is required');
      return;
    }

    try {
      const result = await generatePassword(patient.id).unwrap();
      const password = result.password;

      // Copy password to clipboard
      if (navigator?.clipboard?.writeText) {
        await navigator?.clipboard?.writeText(password);
        toast.success(`Password generated and copied to clipboard!`, {
          duration: 5000,
          icon: '🔐',
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = password;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          const copied = document?.execCommand('copy');
          if (copied) {
            toast.success(`Password generated and copied to clipboard!`, {
              duration: 5000,
              icon: '🔐',
            });
          } else {
            // If clipboard copy fails, show password in toast
            toast.success(`Password generated: ${password}`, {
              duration: 10000,
              icon: '🔐',
            });
          }
        } catch {
          // If clipboard copy fails, show password in toast
          toast.success(`Password generated: ${password}`, {
            duration: 10000,
            icon: '🔐',
          });
        } finally {
          textArea?.remove();
        }
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : (error as Error).data?.message || 'Error generating password';
      toast.error(errorMessage);
    }
  };

  const handleGenerateTrustpilotLink = async () => {
    if (!patient.id) {
      toast.error('Patient ID is required');
      return;
    }

    try {
      const result = await generateTrustpilotLink(patient.id).unwrap();
      const link = result.link;

      // Copy password to clipboard
      if (navigator?.clipboard?.writeText) {
        await navigator?.clipboard?.writeText(link);
        toast.success(`Trustpilot link generated and copied to clipboard!`, {
          duration: 5000,
          icon: '🔐',
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          const copied = document?.execCommand('copy');
          if (copied) {
            toast.success(`Trustpilot link generated and copied to clipboard!`, {
              duration: 5000,
              icon: '🔐',
            });
          } else {
            // If clipboard copy fails, show password in toast
            toast.success(`Trustpilot link generated: ${link}`, {
              duration: 10000,
              icon: '🔐',
            });
          }
        } catch {
          // If clipboard copy fails, show password in toast
          toast.success(`Trustpilot link generated: ${link}`, {
            duration: 10000,
            icon: '🔐',
          });
        } finally {
          textArea?.remove();
        }
      }
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : (error as Error).data?.message || 'Error generating Trustpilot link';
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Dropdown trigger={<TfiMoreAlt size={20} />} align='right'>
        <DropdownItem
          as='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!patient.email) {
              toast.error('Patient email is required');
              return;
            }

            handleResetPassword();
          }}
          disabled={isLoading || !patient.email}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </DropdownItem>
        <DropdownItem
          as='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleGeneratePassword();
          }}
          disabled={isGeneratingPassword || !patient.id}
        >
          {isGeneratingPassword ? 'Generating...' : 'Generate Password'}
        </DropdownItem>
        <DropdownItem
          as='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleGenerateTrustpilotLink();
          }}
          disabled={isGeneratingTrustpilotLink || !patient.id}
        >
          {isGeneratingTrustpilotLink ? 'Generating...' : 'Generate Trustpilot Link'}
        </DropdownItem>
        {(isAdmin || isSuperAdmin) && patient.userId && (
          <DropdownItem
            as='button'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowImpersonationModal(true);
            }}
          >
            Login as Patient
          </DropdownItem>
        )}
        <DropdownItem
          as='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (patient.isBanned) {
              onUnbanClick(patient);
            } else {
              onBanClick(patient);
            }
          }}
          disabled={isLoading || isGeneratingPassword}
        >
          {patient.isBanned ? 'Unban Patient' : 'Ban Patient'}
        </DropdownItem>
        {patient.isBanned && patient.banReason && (
          <DropdownItem
            as='button'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onViewBanReasonClick(patient);
            }}
            disabled={isLoading || isGeneratingPassword}
          >
            View Ban Reason
          </DropdownItem>
        )}
        <DropdownItem
          as='div'
          className='py-2 px-3'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className='d-flex align-items-center justify-content-between gap-2'>
            <span className='text-nowrap'>Unresponsive</span>
            <Form.Check
              className='ps-0 status-toggle'
              type='switch'
              id={`unresponsive-${patient.id ?? patient.userId}`}
              checked={isUnresponsive}
              disabled={!onToggleStatus || isStatusUpdating || !patient.userId}
              onChange={(event) => onToggleStatus?.(patient, 'unresponsive', event.target.checked)}
            />
          </div>
        </DropdownItem>
        <DropdownItem
          as='div'
          className='py-2 px-3'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className='d-flex align-items-center justify-content-between gap-2'>
            <span className='text-nowrap'>Disputed</span>
            <Form.Check
              className='ps-0 status-toggle'
              type='switch'
              id={`disputed-${patient.id ?? patient.userId}`}
              checked={isDisputed}
              disabled={!onToggleStatus || isStatusUpdating || !patient.userId}
              onChange={(event) => onToggleStatus?.(patient, 'disputed', event.target.checked)}
            />
          </div>
        </DropdownItem>
        {isStatusUpdating && (
          <DropdownItem as='div' className='py-2 px-3 text-muted d-flex align-items-center gap-2'>
            <Spinner animation='border' size='sm' />
            <span className='text-xs'>Updating status...</span>
          </DropdownItem>
        )}
      </Dropdown>

      {/* Modal rendered outside dropdown to persist when dropdown closes */}
      {patient.userId && (
        <ImpersonationModal
          show={showImpersonationModal}
          onHide={() => setShowImpersonationModal(false)}
          targetUserId={patient.userId}
          targetUserEmail={patient.email ?? undefined}
          targetUserRole='patient'
        />
      )}
    </>
  );
};
