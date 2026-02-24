'use client';

import { ROUTES } from '@/constants';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useSelector } from 'react-redux';
import { shouldHideCalendlyFeature } from '@/helpers/featureFlags';
import { CircularProgress } from '@/components/elements';

export default function ChatOptions() {
  const { push } = useRouter();

  const [isCarePending, startCareTransition] = useTransition();
  const [isProviderPending, startProviderTransition] = useTransition();

  const patientProfile = useSelector((state: RootState) => state.patientProfile);
  const chatId = useSelector((state: RootState) => state.patientChat.chatId);
  const unreadCountData = useSelector((state: RootState) => state.patientChat.unreadCountData);
  const { careTeam, clinicalTeam, providers } = unreadCountData || {};
  const providerBreakdown = providers?.conversationsBreakdown || [];

  const hideCalendly = shouldHideCalendlyFeature(patientProfile?.email);

  const handleCardClick = (type: 'clinical' | 'care' | 'provider') => {
    if (type === 'clinical') {
      window.open('https://lumimeds.telepath.clinic/chat', '_blank');

      // if (clinicalTeam?.id) {
      //   const title = encodeURIComponent('Chat Support');
      //   startClinicalTransition(() => {
      //     push(`${ROUTES.PATIENT_MESSAGES}/${clinicalTeam.id}?title=${title}`);
      //   });
      // } else if (clinicalTeam?.clinicalTeamUrl) {
      //   window.open(clinicalTeam?.clinicalTeamUrl);
      // }
    } else if (type === 'care') {
      const title = encodeURIComponent('Admin Help');
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
  return (
    <div className='z-1000 p-2 px-lg-4 border-top d-flex align-items-center gap-2 gap-lg-3 fs-sm-14'>
      <strong className='fw-medium'>Send to</strong>
      <div className='d-flex align-items-center gap-1'>
        {hideCalendly && (
          <button
            // disabled={isClinicalPending || (!clinicalTeam?.clinicalTeamUrl && !clinicalTeam?.id)}
            disabled={!clinicalTeam?.clinicalTeamUrl && !clinicalTeam?.id}
            type='button'
            onClick={() => {
              if (clinicalTeam?.clinicalTeamUrl !== chatId) {
                handleCardClick('clinical');
              }
            }}
            className={
              'rounded-2 fw-semibold px-2 px-lg-3 py-1 ' +
              (clinicalTeam?.clinicalTeamUrl === chatId
                ? 'text-primary border border-primary bg-white'
                : 'text-muted bg-white')
            }
          >
            Medical/Clinical
          </button>
        )}
        <button
          disabled={isCarePending}
          type='button'
          onClick={() => {
            if (careTeam?.careTeamId !== chatId) {
              handleCardClick('care');
            }
          }}
          className={
            'rounded-2 fw-semibold px-2 px-lg-3 py-1 tw-flex tw-items-center tw-gap-2 ' +
            (careTeam?.careTeamId === chatId ? 'text-primary border border-primary bg-white' : 'text-muted bg-white')
          }
        >
          {isCarePending && <CircularProgress />}
          Care Team
        </button>
        <button
          disabled={isProviderPending || providerBreakdown.length === 0}
          type='button'
          onClick={() => {
            const isProviderChat = providerBreakdown.some((p) => p.providerUserId === chatId);
            if (!isProviderChat) {
              handleCardClick('provider');
            }
          }}
          className={
            'rounded-2 fw-semibold px-2 px-lg-3 py-1 tw-flex tw-items-center tw-gap-2 ' +
            (providerBreakdown.some((p) => p.providerUserId === chatId)
              ? 'text-primary border border-primary bg-white'
              : 'text-muted bg-white')
          }
        >
          {isProviderPending && <CircularProgress />}
          Provider
        </button>
      </div>
    </div>
  );
}
