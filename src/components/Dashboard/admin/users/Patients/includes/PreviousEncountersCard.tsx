'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import EncounterDetailsModal from './EncounterDetailsModal';
import { MdOutlineConfirmationNumber as MdNumbers } from "react-icons/md";
import { useLazyGetPatientOrdersLatestPerSubscriptionQuery } from '@/store/slices/ordersApiSlice';
import { clearLatestOrdersPerSubscription } from '@/store/slices/patientOrdersSlice';
import { PreviousEncountersCardSkeleton } from './PreviousEncountersCardSkeleton';

interface PrescriptionProduct {
  prodName?: string;
  drugName?: string;
  directions?: string;
  docNote?: string;
  quantity?: number;
  refills?: number;
  vials?: string;
  dateWritten?: string;
  file?: string;
  concentration?: string;
}

interface PrescriptionDetails {
  rxNumber?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  products?: PrescriptionProduct[];
  file?: string;
}

interface Order {
  id: string;
  requestedPharmacy?: string;
  orderUniqueId?: string;
  createdAt: string;
  providerName?: string;
  providerInfo?: {
    firstName: string;
    lastName: string;
  };
  prescriptionDetails?: PrescriptionDetails;
  status?: string;
  concentration?: string;
  prescriptionInstructions?: Array<{
    medication?: string;
    dosage?: number;
    dateWritten?: string;
    notesToStaff?: string;
    notesToPatient?: string;
  }>;
}

interface PreviousEncounter {
  id: string;
  uniqueId?: string;
  medication: string;
  date: string;
  directions: string;
  notes: string;
  prescriber: string;
  orderId: string;
  status: string;
  rxNumber?: string;
  quantity?: number;
  refills?: number;
  vials?: string;
  productName?: string;
  concentration?: string;
  createdAt?: string;
  updatedAt?: string;
  dateWritten?: string;
  file?: string;
}

interface PreviousEncountersCardProps {
  encounters?: PreviousEncounter[];
  currentOrderId?: string;
}

export const PreviousEncountersCard: React.FC<PreviousEncountersCardProps> = ({ encounters = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<PreviousEncounter | null>(null);
  const dispatch = useDispatch();

  const patientOrders = useSelector((state: RootState) => state.patientOrders.latestOrdersPerSubscription?.data) ?? [];
  const userId = useSelector((state: RootState) => state.chat.userId) ?? '';

  const [triggerGetPatientOrdersLatestPerSubscription, { isFetching: isFetchingLatestOrders }] =
    useLazyGetPatientOrdersLatestPerSubscriptionQuery();

  useEffect(() => {
    triggerGetPatientOrdersLatestPerSubscription({ userId })
    return () => {
      dispatch(clearLatestOrdersPerSubscription());
    }
  }, [userId]);



  // Helper function to format text with proper line breaks for bullets
  const formatTextWithBullets = (text: string) => {
    if (!text) return text;
    // Ensure bullet points start on new line without adding extra bullets
    return text
      .replace(/\n\s*•/g, '\n•') // Ensure bullets start on new line
      .replace(/\n\s*-\s*/g, '\n- ') // Ensure dashes start on new line
      .replace(/\n\s*\*\s*/g, '\n* '); // Ensure asterisks start on new line
  };

  const transformOrdersToEncounters = (orders: Order[]): PreviousEncounter[] => {
    if (!orders || orders.length === 0) return [];

    // Process all orders and flatten the results
    const allEncounters: PreviousEncounter[] = [];

    orders.forEach((order) => {
      const hasPharmacy = order?.requestedPharmacy ?? '';
      const rx = order.prescriptionInstructions?.[0];
      const rxMedication = rx?.medication?.trim();
      const rxDosage = rx?.dosage;
      const rxTitle =
        rxMedication && rxDosage !== undefined
          ? `${rxMedication} ${rxDosage}mg weekly`
          : ``;

      const products = order.prescriptionDetails?.products || [];

      if (products.length > 0 && hasPharmacy) {
        products.forEach((product, idx) => {
          const medFromProduct = product.prodName || product.drugName || 'Unknown Medication';
          const dosageFromRx = rxDosage !== undefined ? ` ${rxDosage}` : '';
          const title = rxTitle || `${medFromProduct}${dosageFromRx}`;
          allEncounters.push({
            id: `${order.id}-${idx}`,
            orderId: order.id,
            uniqueId: order.orderUniqueId,
            medication: title,
            date: new Date(order.createdAt).toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
            }),
            directions: product.directions || 'Use as directed by your healthcare provider',
            notes: product.docNote || rx?.notesToPatient || 'No additional notes',
            prescriber:
              order.providerName ||
              (order.providerInfo
                ? `${order.providerInfo.firstName} ${order.providerInfo.lastName}`
                : 'Unknown Provider') ||
              'Unknown Provider',
            status: order.prescriptionDetails?.status || order.status || 'Unknown',
            rxNumber: order.prescriptionDetails?.rxNumber,
            quantity: product.quantity,
            refills: product.refills,
            vials: product.vials,
            productName: medFromProduct,
            createdAt: order.prescriptionDetails?.createdAt || order.createdAt,
            dateWritten: rx?.dateWritten || product.dateWritten,
            file: product.file || order.prescriptionDetails?.file,
            concentration: product.concentration || order.concentration,
          });
        });
      } else if (rxTitle && rx && hasPharmacy) {

        allEncounters.push({
          id: order.id,
          orderId: order.id,
          uniqueId: order.orderUniqueId,
          medication: rxTitle,
          date: new Date(order.createdAt).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          }),
          directions: rx?.notesToStaff || 'Use as directed by your healthcare provider',
          notes: rx?.notesToPatient || 'No additional notes',
          prescriber:
            order.providerName ||
            (order.providerInfo
              ? `${order.providerInfo.firstName} ${order.providerInfo.lastName}`
              : 'Unknown Provider') ||
            'Unknown Provider',
          status: order.status || 'Unknown',
          rxNumber: order.prescriptionDetails?.rxNumber,
          productName: rxMedication || 'Unknown Medication',
          concentration: order.concentration,
          dateWritten: rx?.dateWritten,
          file: order.prescriptionDetails?.file,
        });
      }
    });

    return allEncounters;
  };

  // Use provided encounters or transform from orders data
  const displayEncounters =
    encounters.length > 0 ? encounters : transformOrdersToEncounters((patientOrders as Order[]) || []);

  // Show skeleton while fetching
  if (isFetchingLatestOrders) {
    return <PreviousEncountersCardSkeleton />;
  }

  return (
    <div className='tw-rounded-lg tw-p-3 tw-border tw-border-gray-200 tw-h-full'>
      {/* Header */}
      <div className='tw-flex tw-justify-between tw-items-center tw-mb-4'>
        <h3 className='tw-text-base tw-font-medium tw-text-gray-800'>Pharmacy Prescriptions</h3>
      </div>

      {/* Encounters List */}
      <div className={`tw-max-h-[400px] tw-overflow-y-auto tw-flex tw-flex-col tw-gap-4`}>
        {displayEncounters.map((encounter) => (
          <div key={encounter.id} className={`tw-border tw-border-gray-200 tw-rounded-md tw-p-2 tw-bg-[#FFFDF6]`}>
            {/* Medication and Date Row */}
            <div className='tw-flex tw-justify-between tw-items-start'>
              <div className='tw-flex-1'>
                <h4 className='tw-font-semibold tw-text-gray-800 tw-text-base tw-leading-tight'>
                  {encounter.medication}
                </h4>
              </div>
              <div className='tw-text-gray-800 tw-text-base tw-ml-4'>{encounter.date}</div>
            </div>

            {/* Directions and Notes */}
            <div className='tw-mb-3'>
              <p className='tw-text-gray-500 tw-text-sm tw-mb-1' style={{ whiteSpace: 'pre-line' }}>
                {formatTextWithBullets(encounter.directions)}
              </p>
              <p className='tw-text-gray-500 tw-text-sm' style={{ whiteSpace: 'pre-line' }}>
                {formatTextWithBullets(encounter.notes)}
              </p>
            </div>
            <div className='tw-flex tw-justify-between tw-items-center tw-mb-2 tw-gap-2'>
              <div className='tw-flex tw-items-center tw-gap-2'>

                <MdNumbers className='tw-w-4 tw-h-4 tw-text-gray-800' />

                <span className='tw-text-gray-800 tw-text-sm'>Order Id</span>
              </div>
              <span className='tw-text-sm'>{encounter.uniqueId}</span>
            </div>
            {/* Prescriber and View Action */}
            <div className='tw-flex tw-justify-between tw-items-start sm:tw-items-center'>
              <div className='tw-flex tw-items-start sm:tw-items-center tw-gap-2'>
                <div className='tw-w-4 tw-h-4 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0'>
                  <Image
                    src='/assets/svg/medical-kit.svg'
                    alt='Medical kit icon'
                    width={16}
                    height={16}
                    className='tw-w-4 tw-h-4'
                  />
                </div>
                <span className='tw-text-gray-800 tw-text-sm tw-line-clamp-1'>Prescribed by {encounter.prescriber}</span>
              </div>
              <button
                className='tw-flex-shrink-0 tw-text-black-600 tw-text-sm tw-underline hover:tw-text-blue-800 tw-transition-colors !tw-p-0'
                onClick={() => {
                  setSelectedEncounter(encounter);
                  setShowModal(true);
                }}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayEncounters.length === 0 && (
        <div className='tw-text-center tw-py-8'>
          <p className='tw-text-gray-500 tw-text-sm'>No pharmacy prescriptions found.</p>
        </div>
      )}

      {/* Encounter Details Modal */}
      <EncounterDetailsModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedEncounter(null);
        }}
        encounter={selectedEncounter}
      />
    </div>
  );
};

export default PreviousEncountersCard;
