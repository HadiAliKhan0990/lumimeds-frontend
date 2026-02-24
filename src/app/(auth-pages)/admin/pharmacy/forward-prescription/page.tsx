import PatientForm from '@/components/Dashboard/admin/pharmacies/PatientForm';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import BackButton from './BackButton';

interface Props {
  searchParams: Promise<{
    pharmacyId?: string;
    orderId?: string;
    showExistingPatientsModal?: string;
    returnUrl?: string;
  }>;
}

export default async function ForwardPrescription({ searchParams }: Readonly<Props>) {
  const { pharmacyId, orderId, showExistingPatientsModal, returnUrl } = await searchParams;

  return (
    <>
      <MobileHeader title='Forward Prescription' className='mb-4 d-lg-none' />

      <div className='d-lg-block text-2xl fw-semibold d-none'>Forward Prescription</div>
      <BackButton returnUrl={returnUrl} />
      <div className='card rounded-12 border-light p-md-2'>
        <div className='card-body'>
          <PatientForm
            pharmacyId={pharmacyId}
            orderId={orderId}
            showExistingPatientsModal={showExistingPatientsModal === 'true'}
          />
        </div>
      </div>
    </>
  );
}
