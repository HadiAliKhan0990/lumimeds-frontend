import { formatUSDate } from '@/helpers/dateFormatter';
import { format } from 'date-fns';
import Logo from '@/assets/logo.svg';
import Image from 'next/image';
import { InfoItem } from '@/components/Dashboard/admin/pharmacies/PatientForm/includes/PrescriptionConfirmationModal/includes/InforItem';
import { ScriptInfoItem } from '@/components/Dashboard/admin/pharmacies/PatientForm/includes/PrescriptionConfirmationModal/includes/ScriptInfoItem';
import { DetailsInfoSectionColumn } from '@/components/Dashboard/admin/pharmacies/PatientForm/includes/PrescriptionConfirmationModal/includes/DetailsInfoSectionColumn';
import { DetailsInfoSectionContainer } from '@/components/Dashboard/admin/pharmacies/PatientForm/includes/PrescriptionConfirmationModal/includes/DetailsInfoSectionContainer';
import { DetailsInfoSection } from '@/components/Dashboard/admin/pharmacies/PatientForm/includes/PrescriptionConfirmationModal/includes/DetailsInfoSection';
import { PatientPrescriptionData } from './types';

interface Props {
  prescriptionData: PatientPrescriptionData;
}

const formatText = (text: string) => {
  if (!text) return '';
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
};

const renderLogo = () => {
  return (
    <div className='d-flex justify-content-center align-items-center py-3 mb-3'>
      <Image src={Logo} alt='Logo' width={200} height={60} className='object-contain' />
    </div>
  );
};

const renderPhysicianDetails = (physician: PatientPrescriptionData['physician']) => {
  if (!physician) return null;

  return (
    <div className='tw-break-inside-avoid'>
      <DetailsInfoSection title='Prescriber Details'>
        <DetailsInfoSectionContainer>
          <DetailsInfoSectionColumn>
            <InfoItem title='Prescriber' value={physician.name || 'N/A'} />
            <InfoItem title='NPI' value={physician.npi || 'N/A'} />
          </DetailsInfoSectionColumn>
        </DetailsInfoSectionContainer>
      </DetailsInfoSection>
    </div>
  );
};

const renderPatientDetails = (patient: PatientPrescriptionData['patient']) => {
  if (!patient) return null;

  return (
    <div className='tw-break-inside-avoid'>
      <DetailsInfoSection title='Patient Details'>
        <DetailsInfoSectionContainer>
          <DetailsInfoSectionColumn>
            <InfoItem title='Name' value={`${patient.firstName} ${patient.lastName}`} />
            <InfoItem
              title='Date Of Birth'
              value={patient.dob ? formatUSDate(patient.dob) : 'N/A'}
            />
            <InfoItem title='Phone' value={patient.phone || 'N/A'} />
            <InfoItem title='Allergies' value={formatText(patient.allergies || 'None')} />
            <InfoItem title='Medications' value={formatText(patient.medicationList || 'None')} />
          </DetailsInfoSectionColumn>
          <DetailsInfoSectionColumn>
            {patient.address?.shipping && (
              <>
                <InfoItem
                  title='Address Line 1'
                  value={patient.address.shipping.street || 'N/A'}
                />
                {patient.address.shipping.street2 && (
                  <InfoItem title='Address Line 2' value={patient.address.shipping.street2} />
                )}
                <InfoItem title='City' value={patient.address.shipping.city || 'N/A'} />
                <InfoItem title='State' value={patient.address.shipping.state || 'N/A'} />
                <InfoItem title='Zip' value={patient.address.shipping.zip || 'N/A'} />
              </>
            )}
          </DetailsInfoSectionColumn>
        </DetailsInfoSectionContainer>
      </DetailsInfoSection>
    </div>
  );
};

const renderScriptDetails = (products: PatientPrescriptionData['products']) => {
  if (!products || products.length === 0) return null;

  return (
    <div title='Script' className='tw-break-inside-avoid tw-break-before-auto'>
      <p className='fw-semibold mb-2'>Script</p>
      <div className='p-3 d-flex flex-column gap-1 border rounded-2 tw-break-inside-avoid'>
        {products.map((product, index) => (
          <div key={index}>
            {index > 0 && <div className='my-2 border-top'></div>}
            <ScriptInfoItem
              title='Drug'
              className='text-normal'
              value={product.productName || 'N/A'}
            />
            {product.route ? (
              <>
                <ScriptInfoItem
                  title='Route'
                  value={
                    product.route.toUpperCase() === 'IM'
                      ? 'IM (Intramuscular)'
                      : product.route.toUpperCase() === 'SQ'
                      ? 'SQ (Subcutaneous)'
                      : product.route.toUpperCase()
                  }
                />
                {product.drugStrength && (
                  <ScriptInfoItem title='Starting Dose' value={`${product.drugStrength} mg`} />
                )}
              </>
            ) : (
              <ScriptInfoItem title='Quantity' value={product.totalQuantity?.toString() || 'N/A'} />
            )}
            <ScriptInfoItem
              title='Date Written'
              value={
                product.dateWritten ? format(new Date(product.dateWritten), 'MMM d, yyyy') : 'N/A'
              }
            />
            <ScriptInfoItem title='Product Form' value={product.productForm || 'N/A'} />
            <ScriptInfoItem
              className='text-pre-line text-normal'
              title='Directions'
              value={formatText(product.directions || 'N/A')}
            />
            {product.docNotes && (
              <ScriptInfoItem
                className='text-pre-line text-normal'
                title='Doctor Notes'
                value={formatText(product.docNotes)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const renderShippingDetails = (shipping: PatientPrescriptionData['shipping']) => {
  if (!shipping) return null;

  return (
    <div className='tw-break-inside-avoid'>
      <DetailsInfoSection title='Shipping Information'>
        <DetailsInfoSectionContainer>
          <DetailsInfoSectionColumn>
            <InfoItem
              title='Status'
              value={shipping.status || 'N/A'}
              className='text-capitalize'
            />
            <InfoItem title='Courier' value={shipping.courier || 'N/A'} />
            <InfoItem title='Tracking Number' value={shipping.trackingNumber || 'N/A'} />
          </DetailsInfoSectionColumn>
        </DetailsInfoSectionContainer>
      </DetailsInfoSection>
    </div>
  );
};

export const PatientPrescriptionContent = ({ prescriptionData }: Props) => {
  return (
    <>
      <div id='electronic-prescription-content' className='d-flex flex-column gap-2'>
        <div className='d-flex flex-column gap-2 rounded-1 px-4 py-4'>
          {renderLogo()}
          {renderPhysicianDetails(prescriptionData?.physician)}
          {renderPatientDetails(prescriptionData?.patient)}
          {renderScriptDetails(prescriptionData?.products)}
          {renderShippingDetails(prescriptionData?.shipping)}
        </div>
      </div>
    </>
  );
};
