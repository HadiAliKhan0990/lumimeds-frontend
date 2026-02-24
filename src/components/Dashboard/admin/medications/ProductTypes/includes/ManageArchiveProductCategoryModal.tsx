import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useManageArchiveProductCategoryMutation } from '@/store/slices/medicationsApiSlice';
import { ProductCategory } from '@/store/slices/productCategoriesSlice';
import { Error, MetaPayload, Response } from '@/lib/types';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';

interface Props {
  selectedCategory?: ProductCategory;
  showArchiveModal: boolean;
  setShowArchiveModal: (show: boolean) => void;
  handleProductCategories: (meta: MetaPayload) => Promise<void>;
  setSelectedCategory: (category: ProductCategory | undefined) => void;
}

export const ManageArchiveProductCategoryModal = ({
  selectedCategory,
  showArchiveModal,
  setShowArchiveModal,
  handleProductCategories,
  setSelectedCategory,
}: Props) => {
  const search = useSelector((state: RootState) => state.sort.search);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const sortFilter = useSelector((state: RootState) => state.sort.sortFilter);

  const [manageArchiveProductCategory, { isLoading }] = useManageArchiveProductCategoryMutation();

  const getArchiveModalTitle = () => {
    if (!selectedCategory) return '';
    return selectedCategory.isArchived ? 'Unarchive Product Type' : 'Archive Product Type';
  };

  const getArchiveButtonLabel = () => {
    if (!selectedCategory) return '';
    return selectedCategory.isArchived ? 'Unarchive' : 'Archive';
  };

  async function handleArchiveConfirm() {
    if (!selectedCategory) return;

    try {
      const { success, message }: Response = await manageArchiveProductCategory({
        id: selectedCategory.id,
        isArchived: !selectedCategory.isArchived,
      }).unwrap();

      if (success) {
        setShowArchiveModal(false);
        setSelectedCategory(undefined);

        await handleProductCategories({
          meta: { page: 1, limit: 30 },
          search,
          sortStatus,
          sortFilter,
        });
        toast.success(message);
      } else {
        toast.error(message);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        toast.error((error as Error).data.message || 'Failed to update archive status!');
      }
    }
  }

  const getArchiveModalContent = () => {
    if (!selectedCategory) return null;

    const isArchiving = !selectedCategory.isArchived;

    if (isArchiving) {
      return (
        <div className='text-start'>
          <div className='alert alert-warning mb-3'>
            <strong>⚠️ Important:</strong> Upon archiving this product type, all linked products will be impacted and no
            longer show on the website for new orders.
          </div>
          <p className='mb-2'>
            <strong>What happens to linked products?</strong>
          </p>
          <ul className='mb-3'>
            <li>Products will be hidden from new orders</li>
            <li>Existing orders and previous orders will maintain their links for stats and records</li>
            <li>{`Products will remain in the system but won't be visible to customers`}</li>
          </ul>
          <p className='mb-0'>
            <strong>Recommendation:</strong> If you want to keep the products visible, please update them with a new
            product type before archiving this category.
          </p>
        </div>
      );
    } else {
      return (
        <div className='text-start'>
          <div className='alert alert-warning mb-3'>
            <strong>ℹ️ Unarchiving:</strong>{' '}
            {`This will restore the product type, but all linked products will remain inactive and won't be available for new orders until they are reactivated.`}
          </div>
          <div>
            Are you sure you want to unarchive&nbsp;
            <strong className='text-capitalize'>
              {selectedCategory.category} {selectedCategory.medicineType} {selectedCategory.dosageType}
            </strong>
            ?
          </div>
        </div>
      );
    }
  };

  return (
    <ConfirmationModal
      show={showArchiveModal}
      onHide={() => {
        setShowArchiveModal(false);
        setSelectedCategory(undefined);
      }}
      onConfirm={handleArchiveConfirm}
      title={getArchiveModalTitle()}
      message={getArchiveModalContent()}
      confirmLabel={getArchiveButtonLabel()}
      cancelLabel='Cancel'
      loading={isLoading}
    />
  );
};
