'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@/constants';
import { MdOutlineKeyboardArrowLeft } from 'react-icons/md';
import { ConversationBreakdown, setPatientChatId } from '@/store/slices/patientChatSlice';
import { RootState } from '@/store';
import ProviderChatContent from '@/components/Dashboard/patient/messages/ProviderChatContent';
import Link from 'next/link';
import { formatProviderNameFromString } from '@/lib/utils/providerName';

interface Props {
  title?: string;
  type?: string;
}

export default function ProviderChat({ title }: Readonly<Props>) {
  const dispatch = useDispatch();

  const [selectedProvider, setSelectedProvider] = useState<ConversationBreakdown | null>(null);

  const conversationsBreakdown = useSelector(
    (state: RootState) => state.patientChat.unreadCountData?.providers?.conversationsBreakdown
  );

  useEffect(() => {
    if (conversationsBreakdown && conversationsBreakdown.length > 0 && !selectedProvider) {
      if (conversationsBreakdown) {
        setSelectedProvider(conversationsBreakdown[0]);
        if (conversationsBreakdown[0].providerUserId)
          dispatch(setPatientChatId(conversationsBreakdown[0].providerUserId));
      }
    }
  }, [conversationsBreakdown, selectedProvider, dispatch]);

  const handleProviderSelect = (provider: ConversationBreakdown) => {
    setSelectedProvider(provider);
    if (provider.providerUserId) dispatch(setPatientChatId(provider.providerUserId));
  };

  return (
    <>
      <div className='tw-flex tw-items-center tw-gap-2 md:tw-gap-3 tw-justify-between mb-1 md:mb-4'>
        <Link
          href={ROUTES.PATIENT_MESSAGES}
          className='d-inline-flex align-items-center cursor-pointer text-decoration-none'
          onClick={() => {
            dispatch(setPatientChatId(undefined));
          }}
        >
          <MdOutlineKeyboardArrowLeft color='blue' size={35} />
          <span className='fs-6 md:fs-3 text-dark fw-medium tw-text-nowrap'>{title || 'Provider Message'}</span>
        </Link>
        <div className='tw-max-w-40 md:tw-max-w-64 tw-w-full'>
          <select
            className='form-select'
            value={selectedProvider?.providerUserId || ''}
            onChange={(e) => {
              const next = conversationsBreakdown?.find((p) => String(p.providerUserId) === e.target.value);
              if (next) handleProviderSelect(next);
            }}
          >
            <option value='' disabled>
              Select Provider
            </option>
            {conversationsBreakdown?.map((p) => (
              <option key={p.providerUserId} value={p.providerUserId}>
                {formatProviderNameFromString(p.providerName)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='d-flex bg-white rounded-4 overflow-hidden chat-messages patient'>
        <ProviderChatContent selectedProvider={selectedProvider} />
      </div>
    </>
  );
}
