'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Provider } from '@/store/slices/providerSlice';
import { Dropdown, DropdownItem } from '@/components/elements';
import { TfiMoreAlt } from 'react-icons/tfi';
import { ImpersonationModal } from '@/components/Admin/GenerateImpersonationLink';
import { UpdateAutoOrdersLimitModal } from '@/components/Admin/UpdateAutoOrdersLimitModal';
import {
  useInviteProvidersMutation,
  useSuspendProviderMutation,
  useUnsuspendProviderMutation,
  useToggleProviderAutomationMutation,
} from '@/store/slices/providersApiSlice';
import { Error as ApiError } from '@/lib/types';
import { SuspendProviderModal } from './SuspendProviderModal';
import { UnsuspendProviderModal } from './UnsuspendProviderModal';
import { Form } from 'react-bootstrap';

interface RowActionsProps {
  provider: Provider;
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
  onProviderSuspended?: (provider: Provider) => void;
  onProviderAutomationToggled?: (providerId: string, toggleAutomation: boolean) => void;
  onUpdateAutoOrdersLimit?: (providerId: string, autoOrdersLimit: number) => void;
}

export const RowActions = ({ provider, isSuperAdmin, isAdmin, onProviderSuspended,onProviderAutomationToggled, onUpdateAutoOrdersLimit }: Readonly<RowActionsProps>) => {
  const [showImpersonationModal, setShowImpersonationModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
  const [inviteProvider, { isLoading }] = useInviteProvidersMutation();
  const [showUpdateAutoOrdersLimitModal, setShowUpdateAutoOrdersLimitModal] = useState(false);
  const [suspendProvider, { isLoading: isSuspending }] = useSuspendProviderMutation();
  const [unsuspendProvider, { isLoading: isUnsuspending }] = useUnsuspendProviderMutation();
  const [toggleProviderAutomation, { isLoading: isTogglingAutomation }] = useToggleProviderAutomationMutation();

  // Only show dropdown if user is admin or super admin
  if (!isAdmin && !isSuperAdmin) {
    return null;
  }

  // Get the user ID from the provider - could be in different locations
  const userId = provider.id || (provider as unknown as { userId?: string })?.userId;

  const providerId = provider.provider?.id;

  const providerName =
    provider.provider?.firstName && provider.provider?.lastName
      ? `${provider.provider.firstName} ${provider.provider.lastName}`
      : undefined;

  const currentLimit = (provider.provider as unknown as { autoOrdersLimit?: number })?.autoOrdersLimit ?? 0;

  const handleReInvite = async () => {
    if (!provider.email) {
      toast.error('Provider email is required');
      return;
    }

    try {
      const { success, message } = await inviteProvider(provider.email).unwrap();
      if (success) {
        toast.success(message || 'Provider has been re-invited successfully');
      } else {
        toast.error(message || 'Failed to send invitation to provider');
      }
    } catch (error) {
      const errorMessage = (error as ApiError).data?.message || 'Failed to send invitation to provider';
      toast.error(errorMessage);
    }
  };

  const handleSuspendProvider = async (suspendReason: string) => {
    if (!userId) {
      toast.error('Provider ID not found');
      return;
    }

    try {
      const { success, message } = await suspendProvider({
        userId,
        suspendReason,
      }).unwrap();

      if (success) {
        toast.success(message || 'Provider has been suspended successfully');
        setShowSuspendModal(false);

        if (onProviderSuspended) {
          onProviderSuspended({
            ...provider,
            isSuspended: true,
            status: 'suspended',
            suspendReason,
          });
        }
      } else {
        toast.error(message || 'Failed to suspend provider');
      }
    } catch (error) {
      const errorMessage = (error as ApiError).data?.message || 'Failed to suspend provider';
      toast.error(errorMessage);
    }
  };

  const handleToggleAutomation = async (e: React.ChangeEvent<HTMLInputElement>, provider: Provider) => {
    e.stopPropagation();
    const providerId = provider.provider?.id;
    if (!providerId) {
      toast.error('Provider ID not found');
      return;
    }
    const newToggleAutomation = !(provider.provider?.toggleAutomation ?? false);
    try {
      const { success, message } = await toggleProviderAutomation({
        providerId,
        toggleAutomation: newToggleAutomation,
      }).unwrap();
      if (success) {
        toast.success(message || 'Automation toggled successfully');
        if (onProviderAutomationToggled) {
          onProviderAutomationToggled(providerId, newToggleAutomation);
        }
      } else {
        toast.error(message || 'Failed to toggle automation');
      }
    } catch (error) {
      const errorMessage = (error as ApiError).data?.message || 'Failed to toggle automation';
      toast.error(errorMessage);
    }
  };

  const handleUnsuspendProvider = async () => {
    if (!userId) {
      toast.error('Provider ID not found');
      return;
    }

    try {
      const { success, message } = await unsuspendProvider({
        userId,
      }).unwrap();

      if (success) {
        toast.success(message || 'Provider has been unsuspended successfully');
        setShowUnsuspendModal(false);

        if (onProviderSuspended) {
          onProviderSuspended({
            ...provider,
            isSuspended: false,
            status: 'active',
            suspendReason: undefined,
          });
        }
      } else {
        toast.error(message || 'Failed to unsuspend provider');
      }
    } catch (error) {
      const errorMessage = (error as ApiError).data?.message || 'Failed to unsuspend provider';
      toast.error(errorMessage);
    }
  };

  // Check if provider status allows re-invite
  const providerStatus = provider.status?.toLowerCase();
  const canReInvite = providerStatus === 'blocked' || providerStatus === 'rejected' || providerStatus === 'invited';

  const canSuspend = providerStatus === 'active';
  const canUnsuspend = providerStatus === 'suspended' || provider.isSuspended;

  return (
    <>
      <Dropdown trigger={<TfiMoreAlt size={20} />} align='right'>
        {/* Re-invite - shown to both admin and super admin, disabled when status doesn't allow */}
        <DropdownItem
          as='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (canReInvite) {
              handleReInvite();
            }
          }}
          disabled={isLoading || !canReInvite}
        >
          {isLoading ? 'Sending...' : 'Re-invite'}
        </DropdownItem>

        <DropdownItem
          as='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (providerId) {
              setShowUpdateAutoOrdersLimitModal(true);
            } else {
              toast.error('Provider ID not found');
            }
          }}
          disabled={!providerId || providerStatus !== 'active'}
        >
          Update Auto Orders Limit
        </DropdownItem>
        {(isAdmin || isSuperAdmin) && canSuspend && (
          <DropdownItem
            as='button'
            onClick={(e) => {
              e.preventDefault();
              setShowSuspendModal(true);
            }}
            disabled={isSuspending || isUnsuspending}
            className='text-danger'
          >
            {isSuspending ? 'Suspending...' : 'Suspend Provider'}
          </DropdownItem>
        )}

        {(isAdmin || isSuperAdmin) && canUnsuspend && (
          <DropdownItem
            as='button'
            onClick={(e) => {
              e.preventDefault();
              setShowUnsuspendModal(true);
            }}
            disabled={isSuspending || isUnsuspending}
            className='text-success'
          >
            {isUnsuspending ? 'Unsuspending...' : 'Unsuspend Provider'}
          </DropdownItem>
        )}

        {/* Login as Provider - shown only to super admin */}
        {isSuperAdmin && userId && (
          <DropdownItem
            as='button'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowImpersonationModal(true);
            }}
          >
            Login as Provider
          </DropdownItem>
        )}

        {isAdmin && (
          <DropdownItem disabled={isTogglingAutomation || provider.status?.toLowerCase() !== 'active'}>
            {isTogglingAutomation ? 'Toggling...' : 'Toggle Automation'}
            <Form.Check
              className='ps-0 status-toggle'
              type='switch'
              checked={provider.provider?.toggleAutomation ?? false}
              onChange={(e) => handleToggleAutomation(e, provider)}
            />
          </DropdownItem>
        )}
      </Dropdown>

      {/* Modals rendered outside dropdown to persist when dropdown closes */}
      {isSuperAdmin && userId && (
        <ImpersonationModal
          show={showImpersonationModal}
          onHide={() => setShowImpersonationModal(false)}
          targetUserId={userId}
          targetUserEmail={provider.email ?? undefined}
          targetUserRole='provider'
        />
      )}
      {providerId && (
        <UpdateAutoOrdersLimitModal
          show={showUpdateAutoOrdersLimitModal}
          onHide={() => setShowUpdateAutoOrdersLimitModal(false)}
          providerId={providerId}
          providerName={providerName}
          currentLimit={currentLimit}
          onUpdateAutoOrdersLimit={onUpdateAutoOrdersLimit}
        />
      )}

      <SuspendProviderModal
        show={showSuspendModal}
        onHide={() => setShowSuspendModal(false)}
        onConfirm={handleSuspendProvider}
        provider={provider}
        loading={isSuspending}
      />

      <UnsuspendProviderModal
        show={showUnsuspendModal}
        onHide={() => setShowUnsuspendModal(false)}
        onConfirm={handleUnsuspendProvider}
        provider={provider}
        loading={isUnsuspending}
      />
    </>
  );
};

