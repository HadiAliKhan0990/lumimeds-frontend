'use client';

import Footer from '@/components/Footer';
import Modal from '@/components/Dashboard/modals';
import { PropsWithChildren, useEffect } from 'react';
import { Navbar } from '@/components/Dashboard/patient/Navbar';
import { usePathname } from 'next/navigation';
import { isPublicRoute } from '@/lib/helper';
import { ROUTES } from '@/constants';
import { PatientProfile, setPatientProfile } from '@/store/slices/patientProfileSlice';
import { useDispatch } from 'react-redux';
import { setGlobalPendingSurveysData } from '@/store/slices/patientSurveysSlice';
import { useLazyGetPendingSurveysQuery } from '@/store/slices/surveysApiSlice';
import { setUser } from '@/store/slices/userSlice';

interface Props extends PropsWithChildren {
  profile?: PatientProfile;
  accessToken?: string;
}

export default function PatientLayout({ children, profile, accessToken }: Readonly<Props>) {
  const pathname = usePathname();
  const dispatch = useDispatch();

  const [triggerGetPendingSurveys] = useLazyGetPendingSurveysQuery();

  async function fetchPendingSurveys() {
    try {
      const { surveys, meta } = await triggerGetPendingSurveys({ page: 1, limit: 999 }).unwrap();
      if (surveys && meta) {
        dispatch(setGlobalPendingSurveysData({ data: surveys, meta }));
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (profile) {
      dispatch(setPatientProfile(profile));
      dispatch(setUser({ ...profile, role: 'patient' }));
    }
  }, [dispatch, profile]);

  useEffect(() => {
    if (accessToken) {
      fetchPendingSurveys();
    }
  }, [dispatch, accessToken]);

  if (
    isPublicRoute(pathname) ||
    pathname.includes(ROUTES.PATIENT_SURVEY) ||
    pathname.includes(ROUTES.PATIENT_FIRST_LOGIN_UPDATE)
  ) {
    return children;
  }

  return (
    <div className='flex-grow-1 patient-dashboard bg-light'>
      <Navbar />
      <div
        className={
          'container ' + (pathname.startsWith(ROUTES.PATIENT_MESSAGES) ? 'pt-0 pb-3 pt-lg-3' : 'tw-pt-4 tw-pb-20')
        }
      >
        {children}
      </div>
      {!pathname.includes('/messages') && <Footer />}
      <Modal />
    </div>
  );
}
