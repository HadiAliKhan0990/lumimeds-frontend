'use client';

import { Formik, Form, FormikProps, FormikHelpers } from 'formik';
import { accountSchema, AccountSchema } from '@/lib/schema/account';
import { useUpdatePatientProfileMutation } from '@/store/slices/userApiSlice';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createFormDataFromObjectSimple, formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { GrEdit } from 'react-icons/gr';
import { Blur } from 'transitions-kit';
import { AsyncImage } from 'loadable-image';
import { client } from '@/lib/baseQuery';
import { Error } from '@/lib/types';
import { AccountViewForm } from '@/components/Dashboard/patient/account/includes/AccountTab/includes/AccountViewForm';
import { AccountEditForm } from '@/components/Dashboard/patient/account/includes/AccountTab/includes/AccountEditForm';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { isAxiosError } from 'axios';
import ImageCropModal from '@/components/Dashboard/patient/account/includes/AccountTab/includes/ImageCropModal';
import toast from 'react-hot-toast';

interface Props {
  setIsEditing: (s: boolean) => void;
  isEditing: boolean;
}

const urlCache = new Map<string, { url: string; expiresAt: number }>();

export function AccountTab({ setIsEditing, isEditing }: Readonly<Props>) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const formikRef = useRef<FormikProps<AccountSchema>>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showLocalImage, setShowLocalImage] = useState(false);
  const [imageCacheBuster, setImageCacheBuster] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const profile = useSelector((state: RootState) => state.patientProfile);

  const [updateUserMutation, { isLoading: isPending }] = useUpdatePatientProfileMutation();

  const fetchFileUrl = useCallback(
    async (force = false) => {
      const fileKey = profile?.profileImage;
      if (!fileKey) return;

      if (!force) {
        const cached = urlCache.get(fileKey);
        if (cached && Date.now() < cached.expiresAt) {
          setUrl(cached.url);
          return;
        }
      }

      if (isLoading) return;

      setIsLoading(true);

      try {
        const { data } = await client.get(`/surveys/file-url?key=${fileKey}`);
        if (!mountedRef.current) return;

        if (data.data?.url) {
          const newUrl = data.data.url;
          const expiresAt = Date.now() + 30 * 1000; // 30 seconds expiry
          urlCache.set(fileKey, { url: newUrl, expiresAt });
          setUrl(newUrl);

          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) fetchFileUrl(true);
          }, 25 * 1000); // Refresh 25 seconds before expiration (5 seconds early)
        }
      } catch (error) {
        console.error('Error fetching file URL:', error);
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [profile?.profileImage, isLoading]
  );

  const handleFileError = useCallback(() => {
    if (url) {
      const fileKey = profile?.profileImage;
      if (fileKey) {
        urlCache.delete(fileKey);
        fetchFileUrl(true);
      }
    }
  }, [url, profile?.profileImage, fetchFileUrl]);

  const initialValues: AccountSchema = {
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    email: profile?.email ?? '',
    phoneNumber: profile?.phoneNumber ? formatUSPhoneWithoutPlusOne(profile?.phoneNumber) : '',
    password: profile?.user?.password ? '********' : '',

    street: profile?.shippingAddress?.street ?? '',
    street2: profile?.shippingAddress?.street2 ?? '',
    zip: profile?.shippingAddress?.zip ?? '',
    city: profile?.shippingAddress?.city ?? '',
    state: profile?.shippingAddress?.state ?? '',
    region: 'United States',
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setTempImageUrl(URL.createObjectURL(file));
      setShowCropModal(true);
    }
    // Reset the input value so selecting the same file again will trigger onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], 'profile-picture.jpg', { type: 'image/jpeg' });
    setSelectedImage(croppedFile);
    setImagePreview(URL.createObjectURL(croppedBlob));
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
  };

  const handleSubmit = async (values: AccountSchema, { setSubmitting }: FormikHelpers<AccountSchema>) => {
    try {
      setSubmitting(true);

      const formik = formikRef.current;
      if (!formik) return;

      const { firstName, lastName, city, email, password, phoneNumber, region, state, street2, street, zip } = values;

      const shippingAddressJson = {
        firstName,
        lastName,
        street,
        street2,
        city,
        region,
        state,
        zip,
      };

      const profilePayload = { firstName, lastName, email, password, phoneNumber };

      // Get dirty fields by comparing with initial values
      const dirtyKeys = (Object.keys(profilePayload) as Array<keyof typeof profilePayload>).filter((key) => {
        return profilePayload[key] !== formik.initialValues[key];
      });

      const shippingDirtyKeys = (Object.keys(shippingAddressJson) as Array<keyof typeof shippingAddressJson>).filter(
        (key) => {
          return shippingAddressJson[key] !== formik.initialValues[key];
        }
      );

      if (shippingDirtyKeys.length === 0 && dirtyKeys.length === 0 && !selectedImage) {
        toast.error(
          "It looks like you haven't made any changes yet. Please update at least one field before clicking 'Save'."
        );
        return;
      }

      const { ...rawPayload } = Object.fromEntries(
        dirtyKeys.map((key) => [key, profilePayload[key]]).filter(([, value]) => value != null)
      );

      const payload = {
        ...rawPayload,
        ...(rawPayload.phoneNumber ? { phoneNumber: rawPayload.phoneNumber.replace(/\D/g, '') } : {}),
        ...(shippingDirtyKeys.length > 0 && { shippingAddressJson: JSON.stringify(shippingAddressJson) }),
        ...(selectedImage && { image: selectedImage }),
      };

      const formData = createFormDataFromObjectSimple(payload);

      const { success, message } = await updateUserMutation(formData).unwrap();

      if (success) {
        if (selectedImage) {
          setShowLocalImage(true);
          setImageCacheBuster(`?t=${Date.now()}`);
        }
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }

        if (tempImageUrl) {
          URL.revokeObjectURL(tempImageUrl);
        }

        router.refresh();
        setSelectedImage(null);
        setImagePreview(null);
        setTempImageUrl(null);
        formik.resetForm();
        setIsEditing(false);
      } else {
        toast.error(message);
      }
    } catch (err) {
      let message = 'An error occurred while saving.';
      if (isAxiosError(err)) {
        message = err.message;
      }
      toast.error((err as Error).data.message || message);
    } finally {
      setSubmitting(false);
    }
  };

  function handleClickCancel() {
    if (formikRef.current) {
      formikRef.current.resetForm({
        values: {
          firstName: profile?.firstName ?? '',
          lastName: profile?.lastName ?? '',
          email: profile?.email ?? '',
          phoneNumber: profile?.phoneNumber ? formatUSPhoneWithoutPlusOne(profile?.phoneNumber) : '',
          password: profile?.user?.password ? '********' : '',
        },
      });
    }
    setIsEditing(false);
  }

  // When the API returns a new image URL, stop showing the local image
  useEffect(() => {
    if (url && showLocalImage) {
      setShowLocalImage(false);
      setImageCacheBuster('');
    }
  }, [url]);

  // Reset states when switching between edit and view modes
  useEffect(() => {
    if (!isEditing) {
      setSelectedImage(null);
      setImagePreview(null);
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }
    }
  }, [isEditing, tempImageUrl]);

  // Clean up preview URL when image changes or component unmounts
  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setImagePreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImagePreview(null);
    }
  }, [selectedImage]);

  useEffect(() => {
    mountedRef.current = true;
    if (profile?.profileImage && !url) fetchFileUrl();
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [profile?.profileImage, url, fetchFileUrl]);

  return (
    <>
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={accountSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting }) => (
          <Form>
            {/* Profile Picture Field */}
            <div className='row mb-4'>
              <div className='col-12'>
                <div className='profile-picture-label text-grey'>Profile Picture</div>
                <div className='profile-avatar-container position-relative'>
                  <div className='profile-avatar-circle position-relative'>
                    {isLoading || (profile?.profileImage && !url) ? (
                      <div className='placeholder-glow profile-avatar-image overflow-hidden'>
                        <span className='placeholder h-100 col-12' />
                      </div>
                    ) : imagePreview && (isEditing || showLocalImage) ? (
                      <AsyncImage
                        Transition={Blur}
                        loader={
                          <div className='placeholder-glow w-100 h-100'>
                            <span className='placeholder h-100 col-12' />
                          </div>
                        }
                        src={imagePreview}
                        alt='Uploaded file'
                        className='profile-avatar-image'
                      />
                    ) : url ? (
                      <AsyncImage
                        onError={handleFileError}
                        Transition={Blur}
                        loader={
                          <div className='placeholder-glow w-100 h-100'>
                            <span className='placeholder h-100 col-12' />
                          </div>
                        }
                        src={url + imageCacheBuster}
                        alt='Uploaded file'
                        className='profile-avatar-image'
                      />
                    ) : profile?.firstName && profile?.lastName ? (
                      <span className='profile-avatar-initials'>
                        {`${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase()}
                      </span>
                    ) : (
                      <span className='profile-avatar-fallback'>
                        <svg width='32' height='32' viewBox='0 0 42 49' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <circle cx='21' cy='24.5' r='21' fill='#BDBDBD' />
                          <path
                            d='M10.8293 33.3345L11.2237 38.6591C11.4396 41.5726 13.655 44.1172 16.7715 44.4318C17.9636 44.5521 19.4675 44.6624 20.9998 44.6624C22.5323 44.6624 24.036 44.5521 25.2281 44.4318C28.3446 44.1172 30.5601 41.5726 30.7759 38.6591L31.1703 33.3347C32.5886 33.6182 33.9014 33.9602 35.0805 34.3533C36.9107 34.9633 38.5072 35.7251 39.6791 36.6486C40.8329 37.5579 41.7974 38.8122 41.7974 40.3961C41.7974 41.98 40.8329 43.2343 39.6791 44.1436C38.5072 45.0671 36.9107 45.8288 35.0805 46.4389C31.4031 47.6647 26.4248 48.3954 20.9993 48.3954C15.5737 48.3954 10.5954 47.6647 6.91811 46.4389C5.08789 45.8288 3.49132 45.0671 2.31945 44.1436C1.16563 43.2343 0.201172 41.98 0.201172 40.3961C0.201172 38.8122 1.16563 37.5579 2.31945 36.6486C3.49132 35.7251 5.08789 34.9633 6.91811 34.3533C8.09741 33.9601 9.41058 33.618 10.8293 33.3345Z'
                            fill='white'
                          />
                          <path
                            d='M21.003 14.797C24.8318 14.797 27.9357 11.6932 27.9357 7.86434C27.9357 4.03552 24.8318 0.931641 21.003 0.931641C17.1742 0.931641 14.0703 4.03552 14.0703 7.86434C14.0703 11.6932 17.1742 14.797 21.003 14.797Z'
                            fill='white'
                          />
                          <path
                            d='M20.9969 16.3979C18.0291 16.3979 15.8576 16.4837 14.3774 16.5763C12.6163 16.6866 11.0513 17.6979 10.3135 19.3274C9.58969 20.9258 8.68897 23.2762 8.12646 26.0549C7.70165 28.1534 9.32891 29.9688 11.3946 30.0585C11.9554 30.0829 12.5803 30.1076 13.2626 30.131L13.8798 38.4619C14.0066 40.1735 15.2936 41.6026 17.0362 41.7785C17.3794 41.8131 17.7468 41.8466 18.1312 41.8765C19.0274 41.946 19.781 41.2537 19.825 40.3734L20.1452 33.9697C20.1594 33.6859 20.3936 33.4631 20.6779 33.4631H21.3151C21.5993 33.4631 21.8336 33.6859 21.8478 33.9697L22.168 40.3735C22.2119 41.2537 22.9655 41.946 23.8617 41.8765C24.2463 41.8466 24.6138 41.8131 24.9573 41.7785C26.6998 41.6026 27.9868 40.1735 28.1137 38.4619L28.7307 30.131C29.4128 30.1076 30.0378 30.0829 30.5983 30.0585C32.6641 29.9688 34.2913 28.1534 33.8665 26.0549C33.304 23.276 32.4032 20.9255 31.6795 19.3273C30.9417 17.6978 29.3767 16.6866 27.6158 16.5763C26.1357 16.4837 23.9645 16.3979 20.9969 16.3979Z'
                            fill='white'
                          />
                        </svg>
                      </span>
                    )}
                    {isEditing && (
                      <>
                        <input
                          ref={fileInputRef}
                          type='file'
                          accept='image/*'
                          id='profile-upload-input'
                          hidden
                          onChange={handleImageSelect}
                        />
                        <label
                          htmlFor='profile-upload-input'
                          className='profile-avatar-edit-icon'
                          title='Upload profile picture'
                        >
                          <GrEdit size={22} />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {isEditing ? (
              <AccountEditForm
                isLoading={isSubmitting || isLoading || isPending}
                handleClickCancelAction={handleClickCancel}
              />
            ) : (
              <AccountViewForm setIsEditing={setIsEditing} />
            )}
          </Form>
        )}
      </Formik>

      {/* Crop Modal */}

      <ImageCropModal
        show={showCropModal && !!tempImageUrl}
        onHide={() => {
          setShowCropModal(false);
          setTempImageUrl(null);
          // Reset the input value when modal closes
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        imageUrl={tempImageUrl ?? ''}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}
