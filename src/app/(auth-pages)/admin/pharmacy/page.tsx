'use client';

import ReactSelect from 'react-select';
import Link from 'next/link';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { Card, Dropdown, Spinner } from 'react-bootstrap';
import { ROUTES } from '@/constants';
import { useLazyGetPharmaciesListQuery } from '@/store/slices/pharmaciesApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setPharmacyType, setSearch, setSearchString, setSortField, setSortOrder } from '@/store/slices/sortSlice';
import { PharmacyPrescriptions } from '@/components/Dashboard/admin/pharmacies/PharmacyPrescriptions';
import { PharmacySkeletonLoading } from '@/components/Dashboard/admin/pharmacies/PharmacyPrescriptions/includes/PharmacySkeletonLoading';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';
import { EditPharmacyModal } from '@/components/Dashboard/modals/includes/EditPharmacyModal';

export default function Page() {
  const [showEditModal, setShowEditModal] = useState(false);

  const dispatch = useDispatch();

  const [getPharmaciesList, { isFetching }] = useLazyGetPharmaciesListQuery();

  const pharmacies = useSelector((state: RootState) => state.adminPharmacies.pharmacies);

  const pharmacyType = useSelector((state: RootState) => state.sort.pharmacyType);

  const [exportHandler, setExportHandler] = useState<(() => Promise<void>) | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const redirectionPathToForwardPrescription = `${
    ROUTES.ADMIN_PHARMACY_FORWARD_PRESCRIPTION
  }?pharmacyId=${pharmacyType}&showExistingPatientsModal=${encodeURIComponent(true)}`;

  const selectedPhamacy = useMemo(() => {
    return pharmacies.find((pharmacy) => pharmacy.id === pharmacyType);
  }, [pharmacies, pharmacyType]);

  const handleExportButton = useCallback((handler: () => Promise<void>) => {
    setExportHandler(() => handler);
  }, []);

  const handleExportClick = useCallback(async () => {
    if (exportHandler && !isExporting) {
      setIsExporting(true);
      try {
        await exportHandler();
      } catch (error) {
        console.error('Export error:', error);
      } finally {
        setIsExporting(false);
      }
    }
  }, [exportHandler, isExporting]);

  useEffect(() => {
    if (!pharmacies.length) {
      void getPharmaciesList();
    }
  }, [getPharmaciesList, pharmacies.length]);

  useEffect(() => {
    if (pharmacies.length > 0) {
      const hasSelectedPharmacy = pharmacyType && pharmacies.some((pharmacy) => pharmacy.id === pharmacyType);

      if (!hasSelectedPharmacy) {
        dispatch(setPharmacyType(pharmacies[0].id));
      }
    }
  }, [pharmacies, pharmacyType, dispatch]);

  return (
    <>
      <MobileHeader
        title='Pharmacy & Prescriptions'
        className='mb-4 d-lg-none'
        actions={
          <>
            <Dropdown.Item as={Link} href={redirectionPathToForwardPrescription}>
              Forward Prescription +
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setShowEditModal(true)} disabled={!selectedPhamacy}>
              Edit Pharmacy Settings
            </Dropdown.Item>
            <Dropdown.Item
              as='button'
              onClick={handleExportClick}
              disabled={isExporting || !exportHandler}
              className='d-flex align-items-center gap-2'
            >
              {isExporting ? (
                <>
                  <Spinner className='border-2' size='sm' />
                  Exporting...
                </>
              ) : (
                'Export to Excel'
              )}
            </Dropdown.Item>
          </>
        }
      />
      <div className='d-none d-lg-flex align-items-center justify-content-between gap-2 flex-wrap mb-4'>
        <span className='text-2xl fw-semibold'>Pharmacy & Prescriptions</span>
        <div className='d-flex gap-2'>
          <button
            onClick={() => setShowEditModal(true)}
            className='btn btn-light border border-secondary'
            disabled={!selectedPhamacy}
          >
            Edit Pharmacy Settings
          </button>
          <button
            className='btn btn-light border border-secondary'
            onClick={handleExportClick}
            disabled={isExporting || !exportHandler}
          >
            {isExporting ? (
              <>
                <Spinner className='border-2 me-2' size='sm' />
                Exporting...
              </>
            ) : (
              'Export to Excel'
            )}
          </button>
          <Link href={redirectionPathToForwardPrescription} className='btn btn-light border border-secondary'>
            Forward Prescription +
          </Link>
        </div>
      </div>

      <Card body className='rounded-12 border-light zero-styles-mobile'>
        {isFetching ? (
          <PharmacySkeletonLoading />
        ) : (
          <>
            <div className='mb-4'>
              <ReactSelect
                value={selectedPhamacy}
                onChange={(selectedOption: unknown) => {
                  dispatch(setSortField(undefined));
                  dispatch(setSortOrder(undefined));
                  dispatch(setSearch(''));
                  dispatch(setSearchString(''));
                  dispatch(setPharmacyType((selectedOption as PublicPharmacy)?.id ?? ''));
                }}
                options={pharmacies}
                getOptionLabel={(pharmacy: PublicPharmacy) => pharmacy.name}
                getOptionValue={(pharmacy: PublicPharmacy) => pharmacy.id}
                placeholder='Select a pharmacy...'
                isSearchable={true}
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    textTransform: 'capitalize',
                    width: '300px',
                    maxWidth: '100%',
                  }),
                  container: (baseStyles) => ({
                    ...baseStyles,
                    textTransform: 'capitalize',
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    textTransform: 'capitalize',
                    zIndex: 9999,
                    width: '300px',
                    maxWidth: '100%',
                  }),
                }}
              />
            </div>
            {pharmacyType && selectedPhamacy && (
              <PharmacyPrescriptions pharmacy={selectedPhamacy} onExportButton={handleExportButton} />
            )}
          </>
        )}
      </Card>

      {showEditModal && selectedPhamacy && (
        <EditPharmacyModal
          pharmacy={
            selectedPhamacy as PublicPharmacy & {
              practiceId?: string;
              practiceName?: string;
              vendorId?: string;
              locationId?: string;
              apiNetworkId?: string;
              apiNetworkName?: string;
              headers?: Array<{ key: string; value: string }>;
              quantity?: string[];
              medicineCategories?: string[];
              supplyDays?: number[];
              dosage?: Record<string, number[]>;
              notes?: Array<{
                day_supply: number;
                dosage: string;
                group: string;
                category: string;
                medication: string;
                notes: string[];
              }>;
              clinicalNotes?: Record<
                string,
                Array<{
                  is_default?: boolean;
                  id: number;
                  note: string;
                  drug: string;
                }>
              >;
            }
          }
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
