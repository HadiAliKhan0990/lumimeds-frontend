import React, { useRef, useState } from 'react';
import { Modal, Spinner, Button } from 'react-bootstrap';
import { 
  useGetPharmaciesListQuery, 
  useUpdateProductPharmacyPrioritiesMutation,
  useGetProductPharmacyPrioritiesQuery 
} from '@/store/slices/pharmaciesApiSlice';
import DraggableList from 'react-draggable-list';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';
import { DraggablePharmacyItem } from './DraggablePharmacyItem';
import toast from 'react-hot-toast';

interface Props {
  show: boolean;
  onHide: () => void;
  productId: string;
  productName: string;
}

export const ProductPharmacyPriorityModal = ({ show, onHide, productId, productName }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: pharmacies, isLoading: isLoadingPharmacies, error: pharmaciesError } = useGetPharmaciesListQuery();
  const { data: productPriorities, isLoading: isLoadingPriorities } = useGetProductPharmacyPrioritiesQuery(productId, {
    skip: !productId,
  });
  const [updateProductPharmacyPriorities, { isLoading: isSaving }] = useUpdateProductPharmacyPrioritiesMutation();
  const [pharmacyOrder, setPharmacyOrder] = useState<PublicPharmacy[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialOrder, setInitialOrder] = useState<string[]>([]);

  // Update local state when pharmacies data and product priorities are loaded
  React.useEffect(() => {
    if (pharmacies && productPriorities?.data) {
      const savedPriorities = productPriorities.data.pharmacyPriorities;
      
      if (savedPriorities && savedPriorities.length > 0) {
        // Sort pharmacies based on saved priorities
        const sortedPharmacies = [...pharmacies].sort((a, b) => {
          const aIndex = savedPriorities.indexOf(a.id);
          const bIndex = savedPriorities.indexOf(b.id);
          
          // If both not in priority list, maintain original order
          if (aIndex === -1 && bIndex === -1) return 0;
          // If only a is not in priority list, put it last
          if (aIndex === -1) return 1;
          // If only b is not in priority list, put it last
          if (bIndex === -1) return -1;
          // Both in priority list, sort by index
          return aIndex - bIndex;
        });
        
        setPharmacyOrder(sortedPharmacies);
        setInitialOrder(savedPriorities);
      } else {
        // No saved priorities, use default order
        setPharmacyOrder([...pharmacies]);
        setInitialOrder(pharmacies.map(p => p.id));
      }
      
      setHasChanges(false);
    } else if (pharmacies && !isLoadingPriorities) {
      // Priorities loaded but none exist, use default order
      setPharmacyOrder([...pharmacies]);
      setInitialOrder(pharmacies.map(p => p.id));
      setHasChanges(false);
    }
  }, [pharmacies, productPriorities, isLoadingPriorities]);

  const isLoading = isLoadingPharmacies || isLoadingPriorities;

  const onMoveEnd = (newList: readonly PublicPharmacy[]) => {
    const newOrder = [...newList];
    setPharmacyOrder(newOrder);

    // Check if the order has changed from the initial saved order
    const newOrderIds = newOrder.map((p) => p.id);
    const hasChanged = JSON.stringify(initialOrder) !== JSON.stringify(newOrderIds);
    setHasChanges(hasChanged);
  };

  const handleSave = async () => {
    const pharmacyIds = pharmacyOrder.map((pharmacy) => pharmacy.id);
    try {
      await updateProductPharmacyPriorities({ productId, pharmacyPriorities: pharmacyIds }).unwrap();
      toast.success('Product pharmacy priorities updated successfully');
      setInitialOrder(pharmacyIds);
      setHasChanges(false);
      onHide();
    } catch {
      toast.error('Failed to update product pharmacy priorities');
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onHide();
        // Reset to initial saved order
        if (pharmacies && initialOrder.length > 0) {
          const sortedPharmacies = [...pharmacies].sort((a, b) => {
            const aIndex = initialOrder.indexOf(a.id);
            const bIndex = initialOrder.indexOf(b.id);
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          });
          setPharmacyOrder(sortedPharmacies);
          setHasChanges(false);
        }
      }
    } else {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size='lg' centered>
      <Modal.Header closeButton>
        <Modal.Title>Pharmacy Priority for {productName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className='p-4 d-flex justify-content-center align-items-center' style={{ minHeight: '200px' }}>
            <Spinner animation='border' role='status'>
              <span className='visually-hidden'>Loading pharmacies...</span>
            </Spinner>
          </div>
        ) : pharmaciesError ? (
          <div className='p-4'>
            <div className='alert alert-danger'>Error loading pharmacies. Please try again.</div>
          </div>
        ) : (
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
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant='primary' onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <>
              <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true' className='me-2' />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

