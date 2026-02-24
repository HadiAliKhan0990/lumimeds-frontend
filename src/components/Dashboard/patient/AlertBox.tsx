'use client';

import { ReactNode } from 'react';
import { HiExclamation, HiOutlineClock } from 'react-icons/hi';

interface AlertBoxProps {
  currentDate?: string;
  currentTime?: string;
  title: string;
  description: string;
  actions: ReactNode;
}

export const AlertBox = ({ title, description, actions, currentDate, currentTime }: AlertBoxProps) => {
  return (
    <div className='alert-box'>
      <div className='alert-box__container'>
        <div className='alert-box__content'>
          <div className='alert-box__content-wrapper'>
            <div className='alert-box__header tw-gap-x-3 tw-flex-col tw-flex sm:tw-flex-row sm:tw-items-center'>
              <div className='sm:tw-flex-grow tw-flex tw-items-center tw-gap-1'>
                <HiExclamation size={26} className='tw-text-yellow-500 tw-flex-shrink-0' />
                <h6 className='tw-text-lg sm:tw-text-2xl tw-mb-0'>{title}</h6>
              </div>
              <div className='tw-flex tw-items-center tw-gap-1'>
                <HiOutlineClock color='#4b5563' />{' '}
                <span className='alert-box__actions-date tw-text-sm'>
                  {currentDate} at {currentTime}
                </span>
              </div>
            </div>
            <div>
              <p className='tw-text-gray-500'>{description}</p>
              {actions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
