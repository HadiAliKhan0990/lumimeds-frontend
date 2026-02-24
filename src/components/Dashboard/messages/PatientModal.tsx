'use client';

import { Offcanvas, OffcanvasProps } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { setPatient } from '@/store/slices/patientSlice';
import { useEffect, useState } from 'react';
import { useLazyGetPatientsQuery } from '@/store/slices/patientsApiSlice';
import PatientPopup from '../admin/users/Patients/includes/PatientPopup';
import PatientPopupAdmin from '../admin/users/Patients/includes/PatientPopupAdmin';
import { usePathname } from 'next/navigation';

export interface PatientModalProps extends OffcanvasProps {
  patientId?: string;
  patientName?: string;
  patientEmail?: string;
}

export const PatientModal = ({ patientId, patientName, patientEmail, ...props }: PatientModalProps) => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const [foundPatient, setFoundPatient] = useState<{
    id?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [triggerPatients, { data: patientsData, isFetching, isError }] = useLazyGetPatientsQuery();

  useEffect(() => {
    if (patientId || patientName || patientEmail) {
      setIsSearching(true);
      // Search for patient by name or email
      const searchQuery = patientName || patientEmail || '';
      if (searchQuery) {
        triggerPatients({
          search: searchQuery,
          meta: { page: 1, limit: 10 },
        });
      }
    }
  }, [patientId, patientName, patientEmail, triggerPatients]);

  useEffect(() => {
    if (patientsData?.data?.patients) {
      // Find the matching patient
      const patients = patientsData.data.patients;
      const matchedPatient = patients.find(
        (p: { id?: string | null; firstName?: string | null; lastName?: string | null; email?: string | null }) =>
          p.email === patientEmail || `${p.firstName} ${p.lastName}`.toLowerCase() === patientName?.toLowerCase()
      );

      if (matchedPatient) {
        setFoundPatient(matchedPatient);
        dispatch(setPatient(matchedPatient));
      }
      setIsSearching(false);
    }
  }, [patientsData, patientEmail, patientName, dispatch]);

  if (isError) {
    return (
      <Offcanvas {...props} className='patient_popup' scroll placement='end'>
        <Offcanvas.Header closeButton className='align-items-start' />
        <Offcanvas.Body className='d-flex flex-column gap-4 pt-2'>
          <div className='text-center py-4'>
            <p className='text-muted'>Failed to load patient details</p>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }

  return (
    <Offcanvas {...props} className='patient_popup' scroll placement='end'>
      <Offcanvas.Header closeButton className='align-items-start' />
      <Offcanvas.Body className='d-flex flex-column gap-4 pt-2'>
        {isSearching || isFetching ? (
          <div className='text-center py-4'>
            <div className='spinner-border' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
            <p className='text-muted mt-2'>Searching for patient...</p>
          </div>
        ) : foundPatient ? (
          isAdmin ? (
            <PatientPopupAdmin />
          ) : (
            <PatientPopup onHide={props.onHide} />
          )
        ) : (
          <div className='text-center py-4'>
            <p className='text-muted'>Patient not found</p>
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};
