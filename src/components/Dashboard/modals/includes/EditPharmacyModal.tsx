import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useUpdatePharmacyMutation } from '@/store/slices/pharmaciesApiSlice';
import { PublicPharmacy, PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { getChangedFields } from '@/helpers/pharmacy-edit-utils';
import ConfirmationModal from '@/components/ConfirmationModal';
import Tabs from '../../Tabs';
import { BasicInfoTab } from '../../pharmacies/components/tabs/BasicInfoTab';
import { StatesTab } from '../../pharmacies/components/tabs/StatesTab';
import { ShippingTab } from '../../pharmacies/components/tabs/ShippingTab';
import { ProductsTab } from '../../pharmacies/components/tabs/ProductsTab';
import { NotesTab } from '../../pharmacies/components/tabs/NotesTab';
import { ClinicalNotesTab } from '../../pharmacies/components/tabs/ClinicalNotesTab';
import PharmacyprioritiesTab from '../../pharmacies/components/tabs/PharmacyprioritiesTab';

type EditPharmacyModalProps = {
  pharmacy: PublicPharmacy & {
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
    products?: PharmacyProduct[];
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
    type?: string;
  };
  onClose: () => void;
};

export const EditPharmacyModal: React.FC<EditPharmacyModalProps> = ({ pharmacy, onClose }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [formData, setFormData] = useState(pharmacy);
  const [originalData] = useState(pharmacy);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasPharmacyPriorityChanges, setHasPharmacyPriorityChanges] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const [updatePharmacy, { isLoading }] = useUpdatePharmacyMutation();

  // Add refs to access tab validations
  const basicInfoTabRef = React.useRef<{ validate: () => boolean }>(null);
  const shippingTabRef = React.useRef<{ validate: () => boolean }>(null);
  const productsTabRef = React.useRef<{ validate: () => boolean }>(null);
  const notesTabRef = React.useRef<{ validate: () => boolean }>(null);
  const clinicalNotesTabRef = React.useRef<{ validate: () => boolean }>(null);
  const pharmacyPrioritiesTabRef = React.useRef<{
    validate: () => boolean;
    getPharmacyOrder: () => string[];
    updatePriorities: () => Promise<void>;
  }>(null);

  useEffect(() => {
    const changes = getChangedFields(originalData, formData);

    // If we're on the Pharmacy Priorities tab, only consider pharmacy priority changes
    if (activeTabIndex === 6) {
      setHasChanges(hasPharmacyPriorityChanges);
    } else {
      // For all other tabs, ONLY consider form changes (ignore pharmacy priority changes)
      setHasChanges(changes !== null);
    }
  }, [formData, originalData, hasPharmacyPriorityChanges, activeTabIndex]);

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // If we're on the Pharmacy Priorities tab (index 6), validate ALL tabs first
    if (activeTabIndex === 6) {
      // Validate ALL tabs before updating pharmacy priorities
      let hasValidationErrors = false;

      // Validate BasicInfoTab (index 0)
      if (basicInfoTabRef.current) {
        const isValid = basicInfoTabRef.current.validate();
        if (!isValid) hasValidationErrors = true;
      }

      // Validate ShippingTab (index 2)
      if (shippingTabRef.current) {
        const isValid = shippingTabRef.current.validate();
        if (!isValid) hasValidationErrors = true;
      }

      // Validate ProductsTab (index 3)
      if (productsTabRef.current) {
        const isValid = productsTabRef.current.validate();
        if (!isValid) hasValidationErrors = true;
      }

      // Validate NotesTab (index 4)
      if (notesTabRef.current) {
        const isValid = notesTabRef.current.validate();
        if (!isValid) hasValidationErrors = true;
      }

      // Validate ClinicalNotesTab (index 5)
      if (clinicalNotesTabRef.current) {
        const isValid = clinicalNotesTabRef.current.validate();
        if (!isValid) hasValidationErrors = true;
      }

      // Validate PharmacyprioritiesTab (index 6)
      if (pharmacyPrioritiesTabRef.current) {
        const isValid = pharmacyPrioritiesTabRef.current.validate();
        if (!isValid) hasValidationErrors = true;
      }

      if (hasValidationErrors) {
        toast.error('Please fix validation errors in all tabs before submitting', { duration: 3000 });
        return; // Stop here, don't call API
      }

      if (!hasPharmacyPriorityChanges) {
        toast.error('No changes detected', { duration: 3000 });
        return;
      }

      try {
        await pharmacyPrioritiesTabRef.current?.updatePriorities();
        toast.success('Settings updated successfully', { duration: 4000 });
        onClose();
      } catch (error) {
        console.error('Failed to update pharmacy priorities:', error);
        // Error toast is already shown in the component
      }
      return;
    }

    // For all other tabs, validate all tabs
    let hasValidationErrors = false;

    // Validate BasicInfoTab (index 0)
    if (basicInfoTabRef.current) {
      const isValid = basicInfoTabRef.current.validate();
      if (!isValid) hasValidationErrors = true;
    }

    // Validate ShippingTab (index 2)
    if (shippingTabRef.current) {
      const isValid = shippingTabRef.current.validate();
      if (!isValid) hasValidationErrors = true;
    }

    // Validate ProductsTab (index 3)
    if (productsTabRef.current) {
      const isValid = productsTabRef.current.validate();
      if (!isValid) hasValidationErrors = true;
    }

    // Validate NotesTab (index 4)
    if (notesTabRef.current) {
      const isValid = notesTabRef.current.validate();
      if (!isValid) hasValidationErrors = true;
    }

    // Validate ClinicalNotesTab (index 5)
    if (clinicalNotesTabRef.current) {
      const isValid = clinicalNotesTabRef.current.validate();
      if (!isValid) hasValidationErrors = true;
    }

    if (hasValidationErrors) {
      toast.error('Please fix validation errors in all tabs before submitting', { duration: 3000 });
      return; // Stop here, don't call API
    }

    const changes = getChangedFields(originalData, formData);

    if (!changes) {
      toast.error('No changes detected', { duration: 3000 });
      return;
    }

    // Filter out invalid shipping services before sending
    if (changes.shippingServices && Array.isArray(changes.shippingServices)) {
      const sanitizedServices = (changes.shippingServices as Array<{ id: string | number; name: string }>).map(
        (service) => ({
          ...service,
          id: service.id?.toString?.().trim() ?? '',
          name: service.name?.trim() ?? '',
        })
      );

      changes.shippingServices = sanitizedServices.filter(
        (service) => service.id.length > 0 && /^\d+$/.test(service.id) && service.name.length > 0
      );
    }

    try {
      await updatePharmacy({
        pharmacyId: pharmacy.id,
        data: changes,
      }).unwrap();

      toast.success('Pharmacy updated successfully', { duration: 4000 });
      onClose();
    } catch (error: unknown) {
      console.error('Failed to update pharmacy:', error);
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data: { message?: string } }).data?.message
          : 'Failed to update pharmacy';
      toast.error(errorMessage || 'Failed to update pharmacy', { duration: 4000 });
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirmation(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowCloseConfirmation(false);
  };

  const handlePharmacyOrderChange = (hasChanges: boolean) => {
    setHasPharmacyPriorityChanges(hasChanges);
  };

  const tabItems = ['Basic Info', 'States', 'Shipping', 'Products', 'Notes', 'Clinical Notes', 'Pharmacy Priorities'];

  return (
    <>
      <Modal show={true} onHide={handleClose} size='xl' centered scrollable backdrop='static' keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            Edit{' '}
            {pharmacy.name
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}{' '}
            Pharmacy
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className='tw-min-h-[70vh]'>
          {/* Tabs */}
          <div className='tw-mb-8'>
            <Tabs
              className='tw-whitespace-nowrap tw-overflow-x-auto'
              items={tabItems}
              activeIndex={activeTabIndex}
              setActiveIndex={setActiveTabIndex}
            />
          </div>

          {/* Tab Content - Render all tabs but hide inactive ones */}
          <div style={{ display: activeTabIndex === 0 ? 'block' : 'none' }}>
            <BasicInfoTab
              ref={basicInfoTabRef}
              formData={{
                practiceId: formData.practiceId,
                practiceName: formData.practiceName,
                vendorId: formData.vendorId,
                locationId: formData.locationId,
                apiNetworkId: formData.apiNetworkId,
                apiNetworkName: formData.apiNetworkName,
                headers: formData.headers,
                type: formData.type,
              }}
              onChange={handleFieldChange}
            />
          </div>

          <div style={{ display: activeTabIndex === 1 ? 'block' : 'none' }}>
            <StatesTab forbiddenStates={formData.forbiddenStates || []} onChange={handleFieldChange} />
          </div>

          <div style={{ display: activeTabIndex === 2 ? 'block' : 'none' }}>
            <ShippingTab
              ref={shippingTabRef}
              shippingServices={formData.shippingServices || []}
              onChange={handleFieldChange}
            />
          </div>

          <div style={{ display: activeTabIndex === 3 ? 'block' : 'none' }}>
            <ProductsTab
              ref={productsTabRef}
              formData={{
                quantity: formData.quantity,
                medicineCategories: formData.medicineCategories,
                supplyDays: formData.supplyDays,
                dosage: formData.dosage as Record<string, number[]>,
                products: formData.products,
              }}
              onChange={handleFieldChange}
            />
          </div>

          <div style={{ display: activeTabIndex === 4 ? 'block' : 'none' }}>
            <NotesTab
              ref={notesTabRef}
              notes={formData.notes || []}
              supplyDays={formData.supplyDays}
              medicineCategories={formData.medicineCategories}
              dosage={formData.dosage}
              onChange={handleFieldChange}
            />
          </div>

          <div style={{ display: activeTabIndex === 5 ? 'block' : 'none' }}>
            <ClinicalNotesTab
              ref={clinicalNotesTabRef}
              clinicalNotes={formData.clinicalNotes || {}}
              medicineCategories={formData.medicineCategories}
              onChange={handleFieldChange}
            />
          </div>

          <div style={{ display: activeTabIndex === 6 ? 'block' : 'none' }}>
            <PharmacyprioritiesTab ref={pharmacyPrioritiesTabRef} onPharmacyOrderChange={handlePharmacyOrderChange} />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <button className='btn btn-outline-secondary' onClick={handleSubmit} disabled={!hasChanges || isLoading}>
            {isLoading && <Spinner size='sm' className='me-2' />}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Close Confirmation Modal */}
      <ConfirmationModal
        show={showCloseConfirmation}
        onHide={handleCancelClose}
        onConfirm={handleConfirmClose}
        title='Unsaved Changes'
        message='You have unsaved changes. Are you sure you want to close without saving?'
        confirmLabel='Yes, Close'
        cancelLabel='Cancel'
      />
    </>
  );
};
