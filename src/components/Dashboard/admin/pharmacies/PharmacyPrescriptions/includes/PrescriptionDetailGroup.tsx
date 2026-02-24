'use client';

import { Fragment, useMemo } from 'react';
import { genderFullForm, genderFullFormRender } from '@/constants';
import { capitalizeFirst, formatUSPhoneWithoutPlusOne, getAge, removePlusSign } from '@/lib/helper';
import { Prescription } from '@/store/slices/pharmaciesApiSlice';
import { formatProviderFirstName, formatProviderLastName } from '@/lib/utils/providerName';
import { formatUSDate } from '@/helpers/dateFormatter';

interface Props {
  prescription?: Prescription;
  title: 'Patient Details' | 'Prescriber' | 'Prescription' | 'Address';
}

export function PrescriptionDetailGroup({ prescription, title }: Readonly<Props>) {
  const { patient, doctor } = prescription || {};

  const items = useMemo(() => {
    switch (title) {
      case 'Patient Details':
        return [
          { key: 'First Name', value: patient?.firstName || 'N/A' },
          { key: 'Last Name', value: patient?.lastName || 'N/A' },
          { key: 'Age', value: getAge(patient?.dob) || 'N/A' },
          {
            key: 'Gender',
            value:
              genderFullForm[patient?.gender?.toUpperCase() as keyof typeof genderFullForm] ||
              genderFullForm[patient?.gender?.toLowerCase() as keyof typeof genderFullForm] ||
              genderFullFormRender[patient?.gender?.toLowerCase() as keyof typeof genderFullFormRender] ||
              'N/A',
          },
          { key: 'Email', value: patient?.email || 'N/A' },
          { key: 'Phone', value: formatUSPhoneWithoutPlusOne(removePlusSign(patient?.phone ?? '')) },
          {
            key: 'Date Of Birth',
            value: patient?.dob ? formatUSDate(patient.dob) : 'N/A',
          },
          { key: 'Allergies', value: patient?.allergies || 'N/A' },
          { key: 'Medication List', value: patient?.medicationList || 'N/A' },
          {
            title: 'Billing Address',
            items: [
              { key: 'Address Line 1', value: patient?.address?.billing?.address1 || 'N/A' },
              { key: 'Address Line 2', value: patient?.address?.billing?.address2 || 'N/A' },
              { key: 'City', value: patient?.address?.billing?.city || 'N/A' },
              { key: 'State', value: patient?.address?.billing?.state },
              { key: 'Zip', value: patient?.address?.billing?.zip || 'N/A' },
            ],
          },
          {
            title: 'Shipping Address',
            items: [
              { key: 'Address Line 1', value: patient?.address?.shipping?.address1 || 'N/A' },
              { key: 'Address Line 2', value: patient?.address?.shipping?.address2 || 'N/A' },
              { key: 'City', value: patient?.address?.shipping?.city || 'N/A' },
              { key: 'State', value: patient?.address?.shipping?.state },
              { key: 'Zip', value: patient?.address?.shipping?.zip || 'N/A' },
            ],
          },
        ];
      case 'Prescriber':
        return [
          { key: 'First Name', value: formatProviderFirstName(doctor?.firstName) },
          { key: 'Last Name', value: formatProviderLastName(doctor?.lastName) },
          { key: 'NPI', value: doctor?.npi ?? 'N/A' },
          {
            key: 'Phone',
            value: doctor?.phone ? formatUSPhoneWithoutPlusOne(removePlusSign(doctor?.phone ?? '')) : 'N/A',
          },
          { key: 'Email', value: doctor?.email || 'N/A' },

          { key: 'DEA', value: doctor?.dea || 'N/A' },
          { key: 'License Number', value: doctor?.licenseNumber || 'N/A' },
          { key: 'State', value: doctor?.state || 'N/A' },
        ];
      case 'Prescription':
        return [
          // { key: 'Order ID', value: prescription?.orderId ?? 'N/A' },
          { key: 'Courier', value: prescription?.courier.toUpperCase() || 'N/A' },
          { key: 'Tracking ID', value: prescription?.trackingId || 'N/A' },
          {
            key: 'Last Visit',
            value: prescription?.patientLastVisit ? formatUSDate(prescription.patientLastVisit) : 'N/A',
          },
          {
            key: 'Shipping Method',
            value: prescription?.shippingMethod ? capitalizeFirst(prescription?.shippingMethod) : 'N/A',
          },
          {
            key: 'Updated At',
            value: prescription?.updatedAt ? formatUSDate(prescription.updatedAt) : 'N/A',
          },
        ];
      default:
        return [];
    }
  }, [prescription, title]);

  const products = useMemo(() => {
    return (
      prescription?.productDetails?.map((product, index) => ({
        id: index + 1,
        drugName: product.drugName,
        drugStrength: product.drugStrength,
        productForm: product.productForm,
        quantity: product.quantity,
        directions: product.directions,
        refills: product.refills,
        docNote: product.docNote,
        dateWritten: product.dateWritten,
      })) || []
    );
  }, [prescription]);

  const renderProductsSection = () => {
    if (title !== 'Prescription') return null;

    return (
      <div className='row gy-3'>
        {/* Order Details */}
        <div className='col-12'>
          <div className='row gy-2 text-xs'>
            {items.map((item) => (
              <Fragment key={item.key}>
                <div className='col-6 text-placeholder'>{item.key}</div>
                <div className='col-6'>{item.value}</div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Products Section */}
        {products.length > 0 && (
          <div className='col-12'>
            <div className='fw-medium text-sm mb-3'>Products</div>
            <div className='row gy-3'>
              {products.map((product) => (
                <div key={product.id} className='col-12'>
                  <div className='row gy-1 text-xs'>
                    <div className='col-6 text-placeholder'>Product Name</div>
                    <div className='col-6'>{product.drugName || 'N/A'}</div>
                    <div className='col-6 text-placeholder'>Quantity</div>
                    <div className='col-6'>{product.quantity || 'N/A'}</div>
                    <div className='col-6 text-placeholder'>Refills</div>
                    <div className='col-6'>{product.refills ?? 'N/A'}</div>
                    <div className='col-6 text-placeholder'>Instructions</div>
                    <div className='col-6 text-pre-line'>{product.directions || 'N/A'}</div>
                    <div className='col-6 text-placeholder'>Doctor Note</div>
                    <div className='col-6 text-pre-line'>{product.docNote || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (title === 'Prescription') {
      return renderProductsSection();
    }
    return (
      <div className='row gy-2 text-xs'>
        {items.map(({ key, value, title, items: internalItems }) =>
          title ? (
            <Fragment key={title || key}>
              <div className='fw-medium text-sm mb-2 mt-4'>{title}</div>
              <div className='row gy-2 text-xs'>
                {internalItems.map((item) => (
                  <Fragment key={item.key}>
                    <div className='col-6 text-placeholder'>{item.key}</div>
                    <div className='col-6'>{item.value}</div>
                  </Fragment>
                ))}
              </div>
            </Fragment>
          ) : (
            <Fragment key={key}>
              <div className='col-6 text-placeholder'>{key}</div>
              <div className='col-6'>{value}</div>
            </Fragment>
          )
        )}
      </div>
    );
  };

  return (
    <div className='rounded-12 p-12 border border-c-light'>
      <div className='mb-4'>
        <span className='fw-medium'>{title}</span>
      </div>

      {renderContent()}
    </div>
  );
}
