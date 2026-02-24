'use client';

import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Dropdown, Tab, Tabs } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa6';
import { RootState } from '@/store';
import { ModalType, setModal } from '@/store/slices/modalSlice';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { setMedicationType } from '@/store/slices/medicationSlice';
import { setSearch, setSearchString, setSortField, setSortOrder, setSortStatus } from '@/store/slices/sortSlice';
import { CreateProductCategoryModal } from '@/components/Dashboard/admin/medications/ProductTypes/includes/CreateProductCategoryModal';
import { CreateMedicationProductModal } from '@/components/Dashboard/admin/medications/products/includes/CreateMedicationProductModal';
import { CreateMedicineTypeModal } from '@/components/Dashboard/admin/medications/MedicineTypes/includes/CreateMedicineTypeModal';
import Products from '@/components/Dashboard/admin/medications/products';
import ProductTypes from '@/components/Dashboard/admin/medications/ProductTypes';
import MedicineTypes from '@/components/Dashboard/admin/medications/MedicineTypes';

export default function MedicationsPage() {
  const dispatch = useDispatch();

  const medicationType = useSelector((state: RootState) => state.medication.medicationType);

  const [show, setShow] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCreateProductCategoryModal, setShowCreateProductCategoryModal] = useState(false);

  // Handler for tab change with batched dispatches
  const handleTabSelect = useCallback(
    (eKey: string | null) => {
      dispatch(setSearch(''));
      dispatch(setSearchString(''));
      dispatch(setSortStatus(undefined));
      dispatch(setSortField(undefined));
      dispatch(setSortOrder(undefined));
      dispatch(setMedicationType(eKey || 'Products'));
    },
    [dispatch]
  );

  // Handler for opening modals
  const handleOpenModal = useCallback(
    (modalType: ModalType['modalType']) => {
      dispatch(setModal({ modalType }));
    },
    [dispatch]
  );

  // Handler for adding new product
  const handleAddNewProduct = useCallback(() => {
    setShowProductModal(true);
  }, [dispatch]);

  const mobileItems = useMemo(() => {
    switch (medicationType) {
      case 'Medications':
        return (
          <>
            <Dropdown.Item as='button' type='button' onClick={() => handleOpenModal('Manage Pharmacies')}>
              Manage Pharmacies
            </Dropdown.Item>
            <Dropdown.Item as='button' type='button' onClick={() => handleOpenModal('Manage Types')}>
              Manage Types
            </Dropdown.Item>
            <Dropdown.Item as='button' type='button' onClick={() => handleOpenModal('Add New Medication')}>
              Add New Medication
            </Dropdown.Item>
          </>
        );

      case 'Products':
        return (
          <Dropdown.Item as='button' onClick={handleAddNewProduct}>
            Add New Product
          </Dropdown.Item>
        );

      case 'Medicine Types':
        return (
          <Dropdown.Item as='button' onClick={() => setShow(true)}>
            Add Medicine Types
          </Dropdown.Item>
        );

      case 'Product Types':
        return (
          <Dropdown.Item as='button' onClick={() => setShowCreateProductCategoryModal(true)}>
            Add Product Type
          </Dropdown.Item>
        );

      default:
        return null;
    }
  }, [medicationType, handleOpenModal, handleAddNewProduct]);

  // Memoize desktop action buttons based on medicationType
  const desktopActions = useMemo(() => {
    switch (medicationType) {
      case 'Medications':
        return (
          <>
            <button
              onClick={() => handleOpenModal('Manage Pharmacies')}
              className='btn btn-light border border-secondary'
            >
              Manage Pharmacies
            </button>
            <button onClick={() => handleOpenModal('Manage Types')} className='btn btn-light border border-secondary'>
              Manage Types
            </button>
            <button
              onClick={() => handleOpenModal('Add New Medication')}
              className='btn btn-light border border-secondary d-flex align-items-center justify-content-center gap-2'
            >
              <FaPlus />
              <span>Add New Medication</span>
            </button>
          </>
        );

      case 'Products':
        return (
          <button
            onClick={handleAddNewProduct}
            className='btn btn-light border border-secondary d-flex align-items-center justify-content-center gap-2'
          >
            <FaPlus />
            Add New Product
          </button>
        );

      case 'Medicine Types':
        return (
          <button
            className='btn btn-light border-secondary d-flex align-items-center justify-content-center gap-2'
            type='button'
            onClick={() => setShow(true)}
          >
            <FaPlus />
            Add Medicine Types
          </button>
        );

      case 'Product Types':
        return (
          <button
            className='btn btn-light border-secondary d-flex align-items-center justify-content-center gap-2'
            type='button'
            onClick={() => setShowCreateProductCategoryModal(true)}
          >
            <FaPlus />
            Add Product Type
          </button>
        );

      default:
        return null;
    }
  }, [medicationType, handleOpenModal, handleAddNewProduct]);

  return (
    <>
      <MobileHeader title='Products & Medications' actions={mobileItems} className='mb-4 d-lg-none' />

      <div className='d-lg-flex d-none align-items-center justify-content-between mb-4'>
        <span className='text-2xl fw-semibold flex-grow-1'>Products & Medications</span>
        <div className='d-flex align-content-center gap-3'>{desktopActions}</div>
      </div>

      <Card body className='rounded-12 border-light zero-styles-mobile'>
        <Tabs className='underlined_tabs border-0 flex-row gap-0' onSelect={handleTabSelect} activeKey={medicationType}>
          {TABS.map(({ title, component }) => (
            <Tab className='mt-4' key={title} eventKey={title} title={title}>
              {component}
            </Tab>
          ))}
        </Tabs>
      </Card>

      {/* Modals */}

      <CreateMedicationProductModal show={showProductModal} onHide={() => setShowProductModal(false)} />
      <CreateProductCategoryModal
        show={showCreateProductCategoryModal}
        onHide={() => setShowCreateProductCategoryModal(false)}
      />
      <CreateMedicineTypeModal show={show} onHide={() => setShow(false)} />
    </>
  );
}

const TABS = [
  // { title: 'Medications', component: <Medications /> },
  { title: 'Products', component: <Products /> },
  { title: 'Product Types', component: <ProductTypes /> },
  { title: 'Medicine Types', component: <MedicineTypes /> },
] as const;
