'use client';

import styles from '@/components/Dashboard/admin/pharmacies/PatientProfile/styles.module.scss';
import { SingleOrder } from '@/lib/types';
import { FiUser, FiX } from 'react-icons/fi';
import { getAge, formatUSPhoneWithoutPlusOne, removePlusSign } from '@/lib/helper';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useRef } from 'react';
import { ExistingUser } from '@/store/slices/usersApiSlice';
import { PharmacyName } from '@/store/slices/adminPharmaciesSlice';

interface PatientProfileProps {
  patient?: SingleOrder['patient'] | ExistingUser;
  open: boolean;
  onClose: () => void;
  selectedPharmacyName: PharmacyName | null;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({ patient, onClose, open }) => {
  const ref = useRef(null);

  const { firstName, lastName, dob, gender, phone, phoneNumber, bio } = patient || {};

  useOutsideClick({
    ref,
    handler: onClose,
  });


  return (
    <>
      {/* Mobile overlay */}
      {open && <div className={styles.mobileOverlay} onClick={onClose} />}

      <div ref={ref} className={`${styles.container} position-fixed end-0 ${open ? styles.open : ''}`}>
        {/* Sidebar */}
        <div className={`patient-profile-sidebar-button d-none d-md-block user-select-none shadow`}>
          Patient Profile
        </div>

        {/* Main Content */}
        <div className={`${styles.content} rounded-1 border-light card shadow`}>
          <div className='card-body'>
            {/* Header */}
            <div className='d-flex justify-content-between align-items-start mb-3'>
              <h5 className='fw-bold'>Patient Information</h5>
              <button type='button' className={`${styles.closeBtn} btn btn-link border-0 p-0`} onClick={onClose}>
                <FiX size={24} />
              </button>
            </div>

            {/* Name and Stats */}
            <div className='d-flex flex-wrap gap-2 mb-3 align-items-center'>
              <span className={`${styles.pillIcon} text-capitalize`}>
                <FiUser className='me-1' /> {firstName} {lastName}
              </span>
              <span className={`${styles.pill} text-capitalize`}>
                {getAge(dob)} Y , {gender}
              </span>
              <span className={`${styles.pill} ${styles.pillGreen}`}>BMI {bio?.bmi}</span>
              <span className={`${styles.pill} ${styles.pillOrange}`}>{bio?.weight}lbs</span>
            </div>

            {/* Medications */}
            <div className='mb-3 d-flex flex-wrap align-items-start'>
              <span className={`${styles.pillLabel} me-2`}>Medications</span>
              <span className={styles.pillValue}>{patient?.medicalHistory?.medications ?? 'none'}</span>
            </div>

            {/* Allergies */}
            <div className='mb-3 d-flex flex-wrap align-items-start'>
              <span className={`${styles.pillLabel} me-2`}>Allergies</span>
              <span className={styles.pillValue}>{patient?.medicalHistory?.allergies ?? 'none'}</span>
            </div>

            {/* Phone */}
            <div className='d-flex flex-wrap align-items-start'>
              <span className={`${styles.pillLabel} me-2`}>Phone</span>
              <span className={styles.pillValue}>{formatUSPhoneWithoutPlusOne(removePlusSign(phone || phoneNumber || ''))}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
