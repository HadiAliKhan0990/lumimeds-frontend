'use client';

import { Offcanvas } from '@/components/elements';
import { AcceptRejectRXForm } from '@/components/ProvidersModule/PendingEncounters/includes/AcceptRejectRXForm';
import { AcceptRejectRxSchema } from '@/lib/schema/acceptRejectRx';
import type { Error } from '@/lib/types';
import { OrderStatus, PharmacyType, SingleOrder } from '@/lib/types';
import { OrderDetailGroup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderDetailGroup';
import { RootState } from '@/store';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';
import { Agent } from '@/store/slices/agentApiSlice';
import { setModal } from '@/store/slices/modalSlice';
import {
  ApprovePrescriptionPayload,
  RejectPrescriptionPayload,
  useApprovePrescriptionMutation,
  useGetSingleOrderQuery,
  useRejectPrescriptionMutation,
  useUpdateOrderAgentMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
} from '@/store/slices/ordersApiSlice';
import { incrementApprovedStats } from '@/store/slices/providerSlice';
import { useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { toast } from 'react-hot-toast';
import { BiSolidUserDetail } from 'react-icons/bi';
import { BsChatDots } from 'react-icons/bs';
import { GoPin } from 'react-icons/go';
import { useDispatch, useSelector } from 'react-redux';
import OrderAttachments from './OrderAttachments';
import { isAxiosError } from 'axios';
import { TrackingLogsModal } from './TrackingLogsModal';
import { TrackingNumberModal } from './TrackingNumberModal';

export interface OrderPopupProps {
  show?: boolean;
  onHide?: () => void;
  showAcceptRejectRXForm?: boolean;
  showAcceptRejectRXFormActionButtons?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onUpdateOrderAgent?: (agent: Agent | null, orderId: string) => Promise<void>;
  onUpdateOrderStatus?: (status: OrderStatus) => void;
  onPharmacyChange?: (pharmacy?: PublicPharmacy | PharmacyType) => void;
  onVialShipmentUpdate?: (newShippedVials: number) => void;
  onUpdateTrackingNumber?: (trackingNumber: string, courierService: string) => void;
  onPatientClick?: (order: { patient?: SingleOrder['patient']; id?: string }) => void;
  orderUniqueId?: string | null;
  hidePatientBtn?: boolean;
}

export function OrderPopup({
  show = false,
  onHide,
  showAcceptRejectRXForm,
  showAcceptRejectRXFormActionButtons,
  onUpdateOrderAgent,
  onAccept,
  onReject,
  onUpdateOrderStatus,
  onPharmacyChange,
  onVialShipmentUpdate,
  onUpdateTrackingNumber,
  onPatientClick,
  orderUniqueId,
  hidePatientBtn = false,
}: Readonly<OrderPopupProps>) {
  const dispatch = useDispatch();

  const order = useSelector((state: RootState) => state.order);

  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showTrackingLogsModal, setShowTrackingLogsModal] = useState(false);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierService, setCourierService] = useState('');
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [approvePrescription] = useApprovePrescriptionMutation();
  const [updateOrderAgent] = useUpdateOrderAgentMutation();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const { data: localOrderData, isFetching } = useGetSingleOrderQuery(order.id ?? '', {
    skip: !order.id || !show,
    refetchOnMountOrArgChange: true,
  });

  const handleUpdateOrderAgent = async (agent: Agent | null) => {
    if (!order.id) {
      toast.error('Order ID is required');
      return;
    }

    try {
      if (onUpdateOrderAgent) {
        // Call parent handler which handles the mutation and list update
        await onUpdateOrderAgent(agent, order.id);
      } else {
        const currentAgentId = localOrderData?.order?.agent?.id || '';
        const payload = agent
          ? { id: order.id, agentId: agent.id, removeCurrentAgentId: false, agent }
          : { id: order.id, agentId: currentAgentId, removeCurrentAgentId: true, agent: null };

        const { success, message } = await updateOrderAgent(payload).unwrap();

        if (!success) {
          toast.error(message || 'Failed to update agent');
        }
      }
    } catch (error) {
      toast.error(
        isAxiosError(error) ? error.response?.data?.message : (error as Error).data?.message || 'Failed to update agent'
      );
    }
  };

  const handleUpdateOrderStatus = async (status: OrderStatus) => {
    // Pass the original status to parent callback (it expects OrderStatus from OrderDetailGroup)
    onUpdateOrderStatus?.(status);

    try {
      // Mutation expects OrderStatus from lib/types
      await updateOrderStatus({ id: order?.id ?? '', status }).unwrap();
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as Error).data?.message || 'Failed to update order status'
      );
    }
  };

  const [rejectPrescription] = useRejectPrescriptionMutation();

  const popupOrderUniqueId = (localOrderData?.order?.orderUniqueId ?? orderUniqueId ?? order?.orderUniqueId) || null;

  const handleAcceptPrescription = async (values: AcceptRejectRxSchema) => {
    if (!order.id) {
      toast.error('Order ID is required');
      return;
    }

    try {
      const payload: ApprovePrescriptionPayload = {
        orderId: order.id,
        prescriptionInstructions: [
          {
            medication: values.medication || order.requestedProductName || '',
            dosage: parseFloat(values.dosage) || 0,
            notesToPatient: values.notes || '',
            notesToStaff: values.notes || '',
          },
        ],
      };

      await approvePrescription(payload).unwrap();
      toast.success('Prescription approved successfully');

      // Update dashboard stats - increment approved stats
      dispatch(incrementApprovedStats());

      onAccept?.();
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as Error).data?.message || 'Failed to approve prescription'
      );
    }
  };

  const handleRejectPrescription = async (rejectionReason: string) => {
    if (!order.id) {
      toast.error('Order ID is required');
      return;
    }

    try {
      const payload: RejectPrescriptionPayload = {
        orderId: order.id,
        rejectionReason,
      };

      await rejectPrescription(payload).unwrap();
      toast.success('Prescription rejected successfully');
      onReject?.();
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as Error).data?.message || 'Failed to reject prescription'
      );
    }
  };

  return (
    <>
      <Offcanvas
        isOpen={show}
        onClose={() => {
          setShowTrackingModal(false);
          setTrackingNumber('');
          setCourierService('');
          onHide?.();
        }}
        position='right'
        size='popup'
        showCloseButton={true}
        closeOnBackdropClick={true}
        closeOnEscape={true}
        bodyClassName='tw-space-y-4'
        isLoading={isFetching || !localOrderData}
        loadingText='Loading order details...'
      >
        {/* Header with patient info */}

        {/* Patient profile link */}

        <div className='d-flex align-items-center justify-content-between flex-wrap gap-3 tw-pr-6'>
          <div className='d-flex align-items-center gap-3 flex-wrap'>
            <div className='d-flex align-items-center gap-3 flex-wrap'>
              {popupOrderUniqueId ? (
                <span className='text-muted fw-medium text-sm'>Order ID: {popupOrderUniqueId}</span>
              ) : null}
            </div>
            {hidePatientBtn ? (
              <span className='tw-font-medium tw-capitalize tw-text-xl'>
                {localOrderData?.patient?.firstName
                  ? `${localOrderData.patient.firstName} ${localOrderData.patient.lastName}`
                  : localOrderData?.patient?.email}
              </span>
            ) : (
              <button
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onPatientClick && localOrderData?.order && localOrderData?.patient) {
                    // SingleOrder has order and patient at top level
                    // Pass order with patient data
                    onPatientClick({
                      ...localOrderData.order,
                      patient: localOrderData.patient,
                    });
                  }
                }}
                className='chat-header-name text-dark text-decoration-none d-flex align-items-center gap-2 text-capitalize text-xl fw-medium border-0 bg-transparent p-0'
              >
                <span className='fw-medium'>
                  {localOrderData?.patient?.firstName
                    ? `${localOrderData.patient.firstName} ${localOrderData.patient.lastName}`
                    : localOrderData?.patient?.email}
                </span>
                <OverlayTrigger placement='right' overlay={<Tooltip id='user-details-tooltip'>Show Details</Tooltip>}>
                  <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <BiSolidUserDetail size={40} />
                  </div>
                </OverlayTrigger>
              </button>
            )}
          </div>
          <button
            type='button'
            className='btn btn-outline-primary btn-sm d-flex align-items-center gap-2'
            onClick={() => {
              dispatch(
                setModal({
                  modalType: 'Provider Patient Chat',
                  ctx: {
                    patientId: localOrderData?.patient?.id,
                    providerId: localOrderData?.order?.provider?.id,
                    providerName: localOrderData?.order?.provider
                      ? `${localOrderData.order.provider.firstName || ''} ${
                          localOrderData.order.provider.lastName || ''
                        }`.trim()
                      : 'Provider',
                  },
                })
              );
            }}
          >
            <BsChatDots size={16} />
            Provider–Patient Chat Logs
          </button>
        </div>

        {/* View toggle buttons */}

        {/* Right Content - Order Details */}
        <div className={`col-12 d-flex flex-column gap-3 overflow-auto d-block`}>
          <OrderDetailGroup data={localOrderData} title='General' />
          <OrderDetailGroup data={localOrderData} title='Patient Details' />
          <OrderDetailGroup
            data={localOrderData}
            title='Order Details'
            onAgentSelect={handleUpdateOrderAgent}
            onOrderStatusChange={handleUpdateOrderStatus}
            onPharmacyChange={(pharmacy) => {
              onPharmacyChange?.(pharmacy);
            }}
            onVialShipmentUpdate={onVialShipmentUpdate}
            actionButton={
              <button
                className='tw-bg-transparent !tw-py-1 tw-text-primary !tw-border !tw-border-primary hover:tw-bg-primary hover:tw-text-white tw-transition-all'
                onClick={() => setShowTrackingLogsModal(true)}
              >
                View Tracking Logs
              </button>
            }
          />
          {((localOrderData?.order?.type || order.type) === 'refill' ||
            (localOrderData?.order?.type || order.type) === 'renewal') && (
            <OrderDetailGroup data={localOrderData} title='Refill Details' fullWidth />
          )}
          <OrderDetailGroup data={localOrderData} title='Prescription Details' fullWidth />
          <OrderDetailGroup
            data={localOrderData}
            title='Remarks'
            fullWidth
            // actionButton={
            //   <button className='btn-outline' style={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}>
            //     <CgNotes />
            //     <p className='m-0'>Add Note</p>
            //   </button>
            // }
          />
          <OrderDetailGroup
            data={localOrderData}
            title='Billing'
            actionButton={
              <button
                className={'btn-no-style text-sm fw-medium ' + (false ? '' : 'text-primary notes-btn')}
                disabled={false}
                onClick={() => {
                  dispatch(
                    setModal({
                      modalType: 'Edit Patient Address',
                      ctx: {
                        billingAddress: localOrderData?.order?.address?.billingAddress,
                        shippingAddress: localOrderData?.order?.address?.shippingAddress,
                        orderId: localOrderData?.order?.id,
                        productName: localOrderData?.order?.productName || '',
                        isPatientView: false,
                      },
                    })
                  );
                }}
              >
                Manage
              </button>
            }
          />
          <OrderDetailGroup
            data={localOrderData}
            title='Tracking and Shipping/Courier Service'
            fullWidth
            actionButton={
              <button
                className='btn btn-outline-primary text-sm rounded-1 d-flex align-items-center gap-2'
                onClick={() => {
                  setShowTrackingModal(true);
                  setTrackingNumber(localOrderData?.order?.trackingNumber ?? '');
                  setCourierService(localOrderData?.order?.courierService ?? '');
                }}
              >
                <GoPin />
                Add Tracking Number / Courier Service
              </button>
            }
          />

          <OrderDetailGroup
            data={localOrderData}
            title='Coupon Affiliate'
            fullWidth
            // actionButton={
            //   <button className='btn-outline' style={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}>
            //     <VscGraph />
            //     <p className='m-0'>View Affiliate Dashboard</p>
            //   </button>
            // }
          />
          {localOrderData?.order?.id && localOrderData?.patient?.id && (
            <OrderAttachments orderId={localOrderData.order.id} patientId={localOrderData.patient.id} />
          )}
          {showAcceptRejectRXForm && (
            <div className='mt-4'>
              <AcceptRejectRXForm
                productImage={order?.requestedProductName ?? ''}
                productName={order?.metadata?.productName ?? ''}
                orderId={order.id ?? ''}
                showActionButtons={showAcceptRejectRXFormActionButtons}
                onAccept={handleAcceptPrescription}
                onReject={handleRejectPrescription}
              />
            </div>
          )}
        </div>
      </Offcanvas>

      {/* Tracking Logs Modal */}
      {order.id && (
        <TrackingLogsModal
          show={showTrackingLogsModal}
          onHide={() => setShowTrackingLogsModal(false)}
          orderId={order.id}
        />
      )}

      {/* Tracking Number Modal */}
      <TrackingNumberModal
        isOpen={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        trackingNumber={trackingNumber}
        setTrackingNumber={setTrackingNumber}
        courierService={courierService}
        setCourierService={setCourierService}
        isUpdating={isUpdating}
        onSave={async (trackingNumber, courierService) => {
          const response = await updateOrder({ id: order.id || '', trackingNumber, courierService }).unwrap();
          if (response.success) {
            onUpdateTrackingNumber?.(trackingNumber, courierService);
            toast.success('Tracking number updated successfully');
          } else {
            toast.error(response?.message || 'Failed to update tracking number');
            throw new Error(response?.message || 'Failed to update tracking number');
          }
        }}
      />
    </>
  );
}
