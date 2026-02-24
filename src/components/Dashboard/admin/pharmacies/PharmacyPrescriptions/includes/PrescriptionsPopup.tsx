'use client';

import { Offcanvas, OffcanvasProps } from 'react-bootstrap';
import { PrescriptionDetailGroup } from '@/components/Dashboard/admin/pharmacies/PharmacyPrescriptions/includes/PrescriptionDetailGroup';
import { Prescription } from '@/store/slices/pharmaciesApiSlice';

interface Props extends OffcanvasProps {
  prescription?: Prescription;
}

export function PrescriptionsPopup({ prescription, ...props }: Readonly<Props>) {
  return (
    <Offcanvas {...props} className='prescription_popup' scroll placement='end'>
      <Offcanvas.Header closeButton className='align-items-start' />
      <Offcanvas.Body className='d-flex flex-column gap-4 pt-0'>
        <div className='d-flex align-items-center gap-3'>
          <span className='text-xl fw-medium'>Prescription Overview</span>
          <span
            className={`status-badge text-nowrap text-capitalize rounded-pill py-6px text-xs px-3 ${prescription?.status?.toLowerCase()}`}
          >
            {prescription?.status?.split('_')?.join('-')?.toLowerCase()}
          </span>
        </div>
        <PrescriptionDetailGroup prescription={prescription} title={'Prescription'} />
        <PrescriptionDetailGroup prescription={prescription} title={'Patient Details'} />
        {/* <PrescriptionDetailGroup prescription={prescription} title={'Address'} /> */}
        <PrescriptionDetailGroup prescription={prescription} title={'Prescriber'} />
      </Offcanvas.Body>
    </Offcanvas>
  );
}
