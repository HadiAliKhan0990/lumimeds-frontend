'use client';

import {  formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { useStates } from '@/hooks/useStates';

interface Props {
  setIsEditing: (ag: boolean) => void;
}

export const AccountViewForm = ({ setIsEditing }: Props) => {
  const profile = useSelector((state: RootState) => state.patientProfile);
  const { nameToCode } = useStates();

  return (
    <div className='row'>
      <div className='col-md-6'>
        <div className='form-value-underline' style={{ minHeight: 38, marginBottom: 16 }}>
          <div className='text-grey mb-1'>First Name</div>
          <span className='text-lg'>{profile?.firstName}</span>
        </div>
      </div>
      <div className='col-md-6'>
        <div className='form-value-underline' style={{ minHeight: 38, marginBottom: 16 }}>
          <div className='text-grey mb-1'>Last Name</div>
          <span className='text-lg'>{profile?.lastName}</span>
        </div>
      </div>
      <div className='col-md-6'>
        <div className='form-value-underline' style={{ minHeight: 38, marginBottom: 16 }}>
          <div className='text-grey mb-1'>Email Address</div>
          <span className='text-lg'>{profile?.email}</span>
        </div>
      </div>
      <div className='col-md-6'>
        <div className='form-value-underline' style={{ minHeight: 38, marginBottom: 16 }}>
          <div className='text-grey mb-1'>Phone Number</div>
          <span className='text-lg'>{profile?.phoneNumber ? formatUSPhoneWithoutPlusOne(profile.phoneNumber) : ''}</span>
        </div>
      </div>
      <div className='col-12'>
        <div className='form-value-underline' style={{ minHeight: 38, marginBottom: 16 }}>
          <div className='text-grey mb-1'>Shipping Address</div>
          {profile?.shippingAddress && (
            <span className='text-lg'>
              {profile.shippingAddress.street}
              <br />
              {profile.shippingAddress.street2 && (
                <>
                  {profile.shippingAddress.street2}
                  <br />
                </>
              )}
              {profile.shippingAddress.city},{' '}
              {nameToCode[profile?.shippingAddress?.state || ''] ?? profile.shippingAddress.state}{' '}
              {profile.shippingAddress.zip}
            </span>
          )}
        </div>
      </div>
      <div className='col-12 pt-3'>
        <button
          disabled={!profile?.id}
          onClick={() => setIsEditing(true)}
          type='button'
          className='btn btn-primary rounded-pill px-4 py-2 fw-bold'
        >
          Edit Profile
        </button>
      </div>
      <div className='col-12 mt-4 text-grey DM-Sans'>
        Profile last updated:{' '}
        {new Date(profile.updatedAt || '').toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>
    </div>
  );
};
