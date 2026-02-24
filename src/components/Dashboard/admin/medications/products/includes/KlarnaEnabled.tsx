import { createFormDataFromObjectSimple } from '@/lib/helper';
import { Error } from '@/lib/types';
import { useUpdateProductMutation } from '@/store/slices/medicationsApiSlice';
import { Product } from '@/store/slices/medicationsProductsSlice';
import { isAxiosError } from 'axios';
import { Form } from 'react-bootstrap';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  onRefetch?: () => void;
  isFetching?: boolean;
}

export const KlarnaEnabled = ({ product, onRefetch, isFetching }: Props) => {
  const [updateProduct, { isLoading }] = useUpdateProductMutation();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const payload = {
        isKlarnaEnabled: e.target.checked,
        categoryId: product.category?.id,
      };
      const data = createFormDataFromObjectSimple(payload);
      const { success, message } = await updateProduct({ id: product.id || '', data }).unwrap();
      if (success) {
        onRefetch?.();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data.message || 'Error while updating product!'
      );
    }
  };

  return (
    <Form.Check
      onClick={(e) => e.stopPropagation()}
      className='ps-0 status-toggle'
      type='switch'
      disabled={isLoading || isFetching}
      id='isKlarnaEnabled-switch'
      checked={product.metadata.isKlarnaEnabled}
      onChange={handleChange}
    />
  );
};
