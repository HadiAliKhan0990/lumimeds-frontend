import { ProductCategory } from '@/store/slices/productCategoriesSlice';

interface Props {
  category: ProductCategory;
  handleArchive: (category: ProductCategory) => void;
}

export const ManageArchiveProductCategory = ({ category, handleArchive }: Readonly<Props>) => {
  const isArchived = category.isArchived;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleArchive(category);
      }}
      className={`btn btn-sm text-nowrap ${isArchived ? 'btn-primary' : 'btn-outline-primary'}`}
      title={isArchived ? 'Click to unarchive this product type' : 'Click to archive this product type'}
    >
      {isArchived ? 'Unarchive' : 'Archive'}
    </button>
  );
};
