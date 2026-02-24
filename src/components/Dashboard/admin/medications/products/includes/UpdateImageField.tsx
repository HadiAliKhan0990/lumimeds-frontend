'use client';

import { Button } from 'react-bootstrap';
import { useFormikContext } from 'formik';
import { FormValues } from '@/schemas/medicationProduct';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import { useCallback, useRef, useState } from 'react';
import { extractFileName, formatFileSize } from '@/lib/helper';
import { createImagePreviewUrl, revokeImagePreviewUrl } from '@/helpers/medicationProduct';
import { RiCloseLargeLine } from 'react-icons/ri';
import { Product } from '@/store/slices/medicationsProductsSlice';
import { ProductDropzone } from '@/components/Dashboard/ProductDropzone';
import AsyncImgLoader from '@/components/AsyncImgLoader';

interface Props {
  selectedProduct?: Product;
}

export const UpdateImageField = ({ selectedProduct }: Readonly<Props>) => {
  const imagePreviewUrlRef = useRef<string | null>(null);

  const [isReplacingImage, setIsReplacingImage] = useState(false);

  const { values, setFieldValue, isSubmitting } = useFormikContext<FormValues>();

  const handleImageRemove = useCallback(() => {
    if (imagePreviewUrlRef.current) {
      revokeImagePreviewUrl(imagePreviewUrlRef.current);
      imagePreviewUrlRef.current = null;
    }
    setFieldValue('image', undefined);
  }, [setFieldValue]);

  const handleStartImageReplace = useCallback(() => {
    setIsReplacingImage(true);
  }, []);

  const handleImageSelect = useCallback(
    (file: File) => {
      // Clean up previous preview URL
      if (imagePreviewUrlRef.current) {
        revokeImagePreviewUrl(imagePreviewUrlRef.current);
      }

      // Create new preview URL
      imagePreviewUrlRef.current = createImagePreviewUrl(file);
      setFieldValue('image', file);
      setIsReplacingImage(false);
    },
    [setFieldValue]
  );

  if (values.image) {
    return (
      <div className='product_image_card p-3 rounded-12 d-flex align-items-center gap-3'>
        <AsyncImage
          className='product_image async-image-contain'
          Transition={Blur}
          src={imagePreviewUrlRef.current || ''}
          loader={<AsyncImgLoader />}
          alt={`Preview of ${values.image.name}`}
        />
        <div className='flex-grow-1 d-flex flex-column text-xs gap-2'>
          <span className='fw-semibold' title={values.image.name}>
            {values.image.name}
          </span>
          <span>{formatFileSize(values.image.size)}</span>
        </div>
        <Button
          variant='link'
          size='sm'
          className='btn-no-style text-dark'
          onClick={handleImageRemove}
          aria-label='Remove image'
          disabled={isSubmitting}
        >
          <RiCloseLargeLine size={20} />
        </Button>
      </div>
    );
  }

  if (selectedProduct?.image && !isReplacingImage) {
    return (
      <div className='product_image_card p-3 rounded-12 d-flex align-items-center gap-3'>
        <AsyncImage
          className='product_image async-image-contain'
          Transition={Blur}
          src={selectedProduct.image}
          loader={<AsyncImgLoader />}
          alt='Current product image'
        />
        <div className='flex-grow-1 d-flex flex-column text-xs gap-2'>
          <span className='fw-semibold'>{extractFileName(selectedProduct.image)}</span>
        </div>
        <Button
          variant='link'
          size='sm'
          className='btn-no-style text-dark'
          onClick={handleStartImageReplace}
          aria-label='Replace image'
          disabled={isSubmitting}
        >
          <RiCloseLargeLine size={20} />
        </Button>
      </div>
    );
  }

  return (
    <div className='p-one'>
      <ProductDropzone onFilesAdded={handleImageSelect} disabled={isSubmitting} />
    </div>
  );
};
