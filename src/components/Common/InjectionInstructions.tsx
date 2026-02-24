'use client';

import { AiFillFilePdf } from 'react-icons/ai';
import { Tooltip } from '@/components/elements/Tooltip';

export default function InjectionInstructionsCard() {
  return (
    <Tooltip
      content='Step-by-step guide to safely administer your injections with proper technique, injection site selection, and
    best practices for optimal results.'
    >
      <a
        href='/docs/injections.pdf?v=2'
        target='_blank'
        rel='noopener noreferrer'
        title='LumiMeds - Injection Instructions'
        className='tw-px-1 tw-py-0.5 tw-inline-flex tw-items-center tw-justify-center tw-gap-1 tw-bg-transparent hover:tw-bg-blue-700 active:tw-bg-primary tw-border tw-border-primary tw-text-primary hover:tw-text-white  tw-font-medium tw-rounded-md tw-transition-all tw-duration-200 tw-no-underline tw-shadow-sm hover:tw-shadow-md tw-text-sm'
      >
        <AiFillFilePdf className='tw-size-4 tw-flex-shrink-0' />
        <span className='tw-whitespace-nowrap'>View Instructions</span>
      </a>
    </Tooltip>
  );
}
