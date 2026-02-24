import { Product } from '@/store/slices/medicationsProductsSlice';
import { Dropdown } from 'react-bootstrap';
import { MdMoreVert, MdReorder } from 'react-icons/md';
import { FiEdit } from 'react-icons/fi';

interface Props {
  onClickUpdatePriceAction: () => void;
  onClickPharmacyPriorityAction: () => void;
  product: Product;
}

export const ProductActions = ({ onClickUpdatePriceAction, onClickPharmacyPriorityAction, product }: Props) => {
  // const handleCopyCheckoutLink = async () => {
  //   await copyToClipboard(product.checkoutLink || '');
  //   toast.success('Checkout link copied to clipboard');
  // };

  const handleUpdatePrice = () => {
    onClickUpdatePriceAction();
  };

  const handlePharmacyPriority = () => {
    onClickPharmacyPriorityAction();
  };

  return (
    <Dropdown className='forms-options-dropdown' onClick={(e) => e.stopPropagation()}>
      <Dropdown.Toggle
        as='button'
        variant='light'
        className='tw-p-0 tw-flex tw-items-center tw-justify-center border tw-border-gray-300 tw-rounded tw-w-8 tw-h-8 tw-bg-transparent hover:tw-bg-gray-100 focus:tw-outline-none focus:tw-ring-0 tw-transition-all [&::after]:tw-hidden'
      >
        <MdMoreVert size={24} className='tw-text-gray-600' />
      </Dropdown.Toggle>
      <Dropdown.Menu className='tw-border tw-border-gray-200 tw-overflow-auto tw-shadow-lg tw-min-w-[180px]'>
        {product.checkoutLink && product.isActive && (
          <>
            {/* <Dropdown.Item
              as='button'
              onClick={handleCopyCheckoutLink}
              className='d-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm hover:tw-bg-gray-50 tw-transition-colors tw-cursor-pointer'
            >
              <MdContentCopy className='tw-w-4 tw-h-4' />
              <span>Copy Checkout Link</span>
            </Dropdown.Item> */}
            <Dropdown.Item
              as='button'
              onClick={handlePharmacyPriority}
              className='d-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm hover:tw-bg-gray-50 tw-transition-colors tw-cursor-pointer'
            >
              <MdReorder className='tw-w-4 tw-h-4' />
              <span>Pharmacy Priority</span>
            </Dropdown.Item>
          </>
        )}
        <Dropdown.Item
          as='button'
          onClick={handleUpdatePrice}
          className='d-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-text-sm hover:tw-bg-gray-50 tw-transition-colors tw-cursor-pointer'
        >
          <FiEdit className='tw-w-4 tw-h-4' />
          <span>Update Price</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
