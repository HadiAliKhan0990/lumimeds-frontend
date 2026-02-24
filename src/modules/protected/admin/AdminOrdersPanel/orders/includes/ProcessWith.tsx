'use client';

import toast from 'react-hot-toast';
import { Order, OrderProvider } from '@/store/slices/orderSlice';
import { useDispatch, useSelector } from 'react-redux';
import { formatProviderNameFromString } from '@/lib/utils/providerName';
import { ProvidersSelect } from './ProvidersSelect';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { capitalizeFirst } from '@/lib/helper';
import { useAssignOrderToDoctorMutation } from '@/store/slices/ordersApiSlice';
import { updateSingleOrder, setOrdersData } from '@/store/slices/ordersSlice';
import { RootState } from '@/store';
import { useMemo, useState } from 'react';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';

interface Props {
  order: Order;
  onTriageClick?: () => void;
  isProcessingTriage?: boolean;
  onProviderChange?: (provider: OrderProvider) => void;
  onClick?: (disabled: boolean) => void;
  loading?: boolean;
}

export function ProcessWith({ order, onTriageClick, isProcessingTriage = false, onProviderChange, onClick, loading = false }: Readonly<Props>) {
  const dispatch = useDispatch();
  const [isAssigning, setIsAssigning] = useState(false);

  const [mutateAsync] = useAssignOrderToDoctorMutation();
  const ordersState = useSelector((state: RootState) => state.orders);
  
  // Get providers list from the order data
  const providersData = order?.providers || [];

  const handleProviderChange = async (provider: OrderProvider | null) => {
    if (!provider || !order?.id || !order?.patient?.id) {
      toast.error('Invalid order or provider data');
      return;
    }

    try {
      setIsAssigning(true);
      const { success, message } = await mutateAsync({
        orderId: order.id,
        providerId: provider.id,
        patientId: order.patient.id,
      }).unwrap();

      if (success) {
        dispatch(
          updateSingleOrder({
            id: order.id,
            status: 'Assigned',
            assignedProvider: {
              id: provider.id,
              name: provider.name,
              email: provider.email,
              phoneNumber: provider.phoneNumber,
              npiNumber: provider.npiNumber,
            },
            assignedAt: new Date().toISOString(),
          })
        );
        // Optimistically update the assigned provider in the orders table without refetching
        const currentData = ordersState?.data || [];
        const mapped = currentData.map((o) =>
          o.id === order.id
            ? { ...o, assignedProvider: provider, status: 'Assigned', assignedAt: new Date().toISOString() }
            : o
        );
        dispatch(setOrdersData({ meta: ordersState.meta, data: mapped, statusCounts: ordersState.statusCounts }));

        toast.success('Order assigned to provider successfully');
        onProviderChange?.(provider);
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as Error).data.message || 'An error occurred while assigning the order to the provider'
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const isTelepathOrder = order?.isTelepathOrder ?? false;

  const isQueueEligible = order?.isQueueEligible ?? false;

  const orderStatus = order?.status ?? '';

  const disabled = useMemo(() => {
    return (
      orderStatus === 'Drafted' ||
      orderStatus === 'processing' ||
      isAssigning ||
      isTelepathOrder ||
      !isQueueEligible ||
      isProcessingTriage ||
      loading
    );
  }, [orderStatus, isAssigning, isTelepathOrder, isQueueEligible, isProcessingTriage, loading]);

  return order?.processWith ? (
    <span
      onClick={(e) => e.stopPropagation()}
      className='text-start text-capitalize form-select py-12 text-sm shadow-none rounded disabled'
    >
      {formatProviderNameFromString(order?.processWith)}
    </span>
  ) : (
    <OverlayTrigger
      placement='top'
      overlay={<Tooltip>{capitalizeFirst(order.assignedProvider?.name) || 'N/A'}</Tooltip>}
    >
      <div className={loading ? 'tw-animate-pulse' : ''}>
        <ProvidersSelect
          onClick={() => onClick?.(disabled)}
          providers={providersData}
          selectedProviderId={order?.assignedProvider?.id}
          onProviderChange={handleProviderChange}
          onNASelect={onTriageClick}
          disabled={disabled}
          isLoading={isProcessingTriage}
        />
      </div>
    </OverlayTrigger>
  );
}
