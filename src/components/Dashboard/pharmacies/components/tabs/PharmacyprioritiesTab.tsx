import React, { useRef, useState } from 'react';
import { useGetPharmaciesListQuery, useUpdatePharmacyPrioritiesMutation } from '@/store/slices/pharmaciesApiSlice';
import { Spinner } from 'react-bootstrap';
import DraggableList from 'react-draggable-list';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';
import { DraggablePharmacyItem } from './DraggablePharmacyItem';
import toast from 'react-hot-toast';

const PharmacyprioritiesTab = React.forwardRef<
  {
    validate: () => boolean;
    getPharmacyOrder: () => string[];
    updatePriorities: () => Promise<void>;
  },
  {
    onPharmacyOrderChange?: (hasChanges: boolean) => void;
  }
>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: pharmacies, isLoading, error } = useGetPharmaciesListQuery();
  const [updatePharmacyPriorities] = useUpdatePharmacyPrioritiesMutation();
  const [pharmacyOrder, setPharmacyOrder] = useState<PublicPharmacy[]>([]);

  // Update local state when pharmacies data changes
  React.useEffect(() => {
    if (pharmacies) {
      setPharmacyOrder([...pharmacies]);
    }
  }, [pharmacies]);

  const onMoveEnd = (newList: readonly PublicPharmacy[]) => {
    const newOrder = [...newList];
    setPharmacyOrder(newOrder);

    // Check if the order has changed from the original
    const hasChanged = JSON.stringify(pharmacies?.map((p) => p.id)) !== JSON.stringify(newOrder.map((p) => p.id));

    // Notify parent component about changes
    if (props.onPharmacyOrderChange) {
      props.onPharmacyOrderChange(hasChanged);
    }
  };

  const getPharmacyOrder = () => {
    return pharmacyOrder.map((pharmacy) => pharmacy.id);
  };

  const updatePriorities = async () => {
    const pharmacyIds = getPharmacyOrder();
    try {
      await updatePharmacyPriorities(pharmacyIds).unwrap();
      // Removed toast.success - parent will handle success message
    } catch (error) {
      toast.error('Failed to update pharmacy priorities');
      throw error; // Re-throw so parent can handle it
    }
  };

  const validate = () => {
    return true; // No validation needed for priorities tab
  };

  // Expose methods to parent
  React.useImperativeHandle(ref, () => ({
    validate,
    getPharmacyOrder,
    updatePriorities,
  }));

  if (isLoading) {
    return (
      <div className='p-4 d-flex justify-content-center align-items-center' style={{ minHeight: '200px' }}>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Loading pharmacies...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4'>
        <div className='alert alert-danger'>Error loading pharmacies. Please try again.</div>
      </div>
    );
  }

  return (
    <div className='row'>
      <div className='col-12'>
        <label className='form-label fw-semibold'>Drag to Reorder Pharmacies</label>
        <div ref={containerRef} className='mt-3'>
          {pharmacyOrder.length > 0 ? (
            <DraggableList
              list={pharmacyOrder}
              commonProps={{
                pharmacies: pharmacyOrder,
                onPharmacyReorder: (newOrder: PublicPharmacy[]) => setPharmacyOrder(newOrder),
              }}
              itemKey={'id'}
              template={DraggablePharmacyItem}
              onMoveEnd={onMoveEnd}
              container={() => containerRef.current!}
            />
          ) : (
            <div className='text-center text-muted p-4'>No pharmacies found</div>
          )}
        </div>
      </div>
    </div>
  );
});

PharmacyprioritiesTab.displayName = 'PharmacyprioritiesTab';

export default PharmacyprioritiesTab;
