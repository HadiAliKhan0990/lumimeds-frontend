'use client';

import Link from 'next/link';
import socket from '@/lib/socket';
import { Row, Col, Alert } from 'react-bootstrap';
import { MdOutlineMessage, MdSupportAgent } from 'react-icons/md';
import { PiStethoscopeBold } from 'react-icons/pi';
import { FaArrowRight } from 'react-icons/fa6';
import { IoWarningOutline } from 'react-icons/io5';
import { CustomerSupportCard } from '@/components/Dashboard/patient/messages/CustomerSupportCard';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useEffect, useTransition } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetPatientUnreadCountQuery } from '@/store/slices/patientChatApiSlice';
import { shouldHideCalendlyFeature } from '@/helpers/featureFlags';
import { FaUserMd } from 'react-icons/fa';

export default function MessagesDashboard() {
  const { push } = useRouter();

  const [isCarePending, startCareTransition] = useTransition();

  const patientProfile = useSelector((state: RootState) => state.patientProfile);

  const [isProviderPending, startProviderTransition] = useTransition();

  const [triggerPatientUnreadCount] = useLazyGetPatientUnreadCountQuery();

  const { unreadCountData } = useSelector((state: RootState) => state.patientChat);
  const { careTeam, clinicalTeam, providers } = unreadCountData || {};

  const careCount = careTeam?.unreadCount ?? 0;
  const clinicalCount = clinicalTeam?.unreadCount ?? 0;
  const providerCount = providers?.unreadCount ?? 0;
  const conversationsBreakdown = providers?.conversationsBreakdown ?? [];

  const hideCalendly = shouldHideCalendlyFeature(patientProfile?.email);

  const handleCardClick = (type: 'clinical' | 'care' | 'provider') => {
    if (type === 'clinical') {
      // if (clinicalTeam?.id) {
      //   const title = encodeURIComponent('Chat Support');
      //   startClinicalTransition(() => {
      //     push(`${ROUTES.PATIENT_MESSAGES}/${clinicalTeam.id}?title=${title}`);
      //   });
      // } else
      window.open('https://lumimeds.telepath.clinic/chat', '_blank');
      // if (clinicalTeam?.clinicalTeamUrl) {
      // window.open(clinicalTeam?.clinicalTeamUrl);
      // }
    } else if (type === 'care' && careTeam?.careTeamId) {
      const title = encodeURIComponent('Billing/Admin Help');
      startCareTransition(() => {
        push(`${ROUTES.PATIENT_MESSAGES}/${careTeam?.careTeamId}?title=${title}`);
      });
    } else if (type === 'provider') {
      const title = encodeURIComponent('Provider Message');
      startProviderTransition(() => {
        push(`${ROUTES.PATIENT_MESSAGES}/provider?title=${title}&type=provider`);
      });
    }
  };

  const getViewLink = () => {
    const careTitle = encodeURIComponent('Chat Support');
    const clinicalTitle = encodeURIComponent('Billing/Admin Help');
    const providerTitle = encodeURIComponent('Provider Message');

    // Priority: provider > care > clinical
    if (providerCount > 0) {
      return `${ROUTES.PATIENT_MESSAGES}/provider?title=${providerTitle}&type=provider`;
    } else if (careCount > 0 && careTeam?.careTeamId) {
      return `${ROUTES.PATIENT_MESSAGES}/${careTeam.careTeamId}?title=${careTitle}`;
    } else if (clinicalCount > 0 && clinicalTeam?.id) {
      return `${ROUTES.PATIENT_MESSAGES}/${clinicalTeam.id}?title=${clinicalTitle}`;
    } else {
      return `${ROUTES.PATIENT_MESSAGES}/${careTeam?.careTeamId}?title=${careTitle}`;
    }
  };

  useEffect(() => {
    socket.on('newMessage', triggerPatientUnreadCount);

    return () => {
      socket.off('newMessage', triggerPatientUnreadCount);
    };
  }, [triggerPatientUnreadCount]);
  return (
    <>
      <h2 className='mb-3 text-4xl fw-medium'>Messages</h2>
      <Alert variant='light' className='d-flex justify-content-between align-items-center border-dark gap-2'>
        <MdOutlineMessage size={24} color='blue' />
        <span className='fs-5 fw-bold flex-grow-1 fs-sm-16'>
          {careCount + clinicalCount + providerCount === 0 ? (
            'You have no unread messages'
          ) : careCount > 0 && clinicalCount > 0 && providerCount > 0 ? (
            <span>
              You have unread messages from your <span className='text-primary'>Care Team</span> ({careCount}),{' '}
              <span className='text-primary'>Clinical Team</span> ({clinicalCount}), and{' '}
              <span className='text-primary'>Provider</span> ({providerCount})
            </span>
          ) : careCount > 0 && clinicalCount > 0 ? (
            <span>
              You have unread messages from both your <span className='text-primary'>Care Team</span> ({careCount}) and{' '}
              <span className='text-primary'>Clinical Team</span> ({clinicalCount})
            </span>
          ) : careCount > 0 && providerCount > 0 ? (
            <span>
              You have unread messages from your <span className='text-primary'>Care Team</span> ({careCount}) and{' '}
              <span className='text-primary'>Provider</span> ({providerCount})
            </span>
          ) : clinicalCount > 0 && providerCount > 0 ? (
            <span>
              You have unread messages from your <span className='text-primary'>Clinical Team</span> ({clinicalCount})
              and <span className='text-primary'>Provider</span> ({providerCount})
            </span>
          ) : careCount > 0 ? (
            <span>
              You have {careCount} unread message{careCount > 1 ? 's' : ''} from your{' '}
              <span className='text-primary'>Care Team</span>
            </span>
          ) : clinicalCount > 0 ? (
            <span>
              You have {clinicalCount} unread message{clinicalCount > 1 ? 's' : ''} from your{' '}
              <span className='text-primary'>Clinical Team</span>
            </span>
          ) : (
            <span>
              You have {providerCount} unread message{providerCount > 1 ? 's' : ''} from your{' '}
              <span className='text-primary'>Provider</span>
            </span>
          )}
        </span>
        {(careCount > 0 || clinicalCount > 0 || providerCount > 0) && (
          <Link href={getViewLink()} className='fw-bold text-nowrap'>
            View
          </Link>
        )}
      </Alert>

      <div className='mt-4 text-2xl fw-normal'>Ask our team</div>
      <p className='text-muted'>What do you need help with?</p>

      <Row className='justify-content-center mb-4 g-4'>
        {hideCalendly && (
          <Col md={6} lg={4}>
            <CustomerSupportCard
              // loading={isClinicalPending}
              onClick={() => handleCardClick('clinical')}
              title='Medical/Clinical'
              listItems={[
                'Side effects or my progress',
                'My prescription details',
                'Discuss a dosage adjustment with my provider',
                'How to administer my medication',
                'Report a medical concern',
              ]}
              icon={<PiStethoscopeBold size={50} className='text-primary' />}
            />
          </Col>
        )}

        <Col md={6} lg={4}>
          <CustomerSupportCard
            loading={isCarePending}
            onClick={() => handleCardClick('care')}
            title='Care Team'
            listItems={['Check my order status', 'Questions about a charge', 'Track my shipment', 'Request a refund']}
            icon={<MdSupportAgent size={50} className='text-primary' />}
          />
        </Col>

        <Col md={6} lg={4}>
          <CustomerSupportCard
            className={!conversationsBreakdown?.length ? 'tw-opacity-50 tw-pointer-events-none' : ''}
            loading={isProviderPending}
            onClick={() => handleCardClick('provider')}
            title='Provider'
            listItems={[
              'Send a message to my provider',
              'Ask about my treatment plan',
              'Request medication changes',
              'Schedule a follow-up consultation',
              'Discuss my health concerns',
            ]}
            icon={<FaUserMd size={50} className='text-primary' />}
          />
        </Col>
      </Row>

      <div className='mt-2 border rounded bg-white msg-help-text'>
        <div className='d-flex align-items-center'>
          Still have questions? Visit our&nbsp;
          <Link href={ROUTES.PATIENT_SUPPORT} className='text-decoration-none fw-medium me-1'>
            Help Center
          </Link>
          <FaArrowRight className='md:tw-mt-1' />
        </div>
      </div>

      <div className='text-muted tw-text-[10px] sm:tw-text-[14px] mt-3 text-center tw-flex tw-items-center tw-justify-center tw-gap-2'>
        <IoWarningOutline /> <span className='ms-1'>If you’re experiencing a medical emergency, please call</span>{' '}
        <strong className='text-decoration-underline'>911</strong>
        <span className='-tw-translate-x-1'>.</span>
      </div>
    </>
  );
}
