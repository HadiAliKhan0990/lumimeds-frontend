'use client';

import { LuArrowDownLeft } from 'react-icons/lu';
import { MdArrowOutward } from 'react-icons/md';
import { Card } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { SwiperOptions } from 'swiper/types';

export default function DashboardOverview() {
  const states = useSelector((state: RootState) => state.dashboard);

  const data = [
    {
      title: 'ACTIVE PATIENTS',
      total: states.stats?.activePatients?.total || 0,
      percentage: states.stats?.activePatients?.percentage || 0,
    },
    {
      title: 'Subscriptions Canceled',
      total: states.stats?.subscriptionCancellations?.total || 0,
      percentage: states.stats?.subscriptionCancellations?.percentage || 0,
    },
    {
      title: 'subscription renewal',
      total: states.stats?.subscriptionRenewals?.total || 0,
      percentage: states.stats?.subscriptionRenewals?.percentage || 0,
    },
    {
      title: 'Failed Renewals',
      total: states.stats?.failedRenewals?.total || 0,
      percentage: states.stats?.failedRenewals?.percentage || 0,
    },
    {
      title: 'New Orders',
      total: states.stats?.newOrders?.total || 0,
      percentage: states.stats?.newOrders?.percentage || 0,
    },
  ];

  const options: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 8,
    loop: true,
    effect: 'slide',
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      576: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 3,
      },
    },
    modules: [Pagination],
    pagination: { clickable: true },
  };

  return (
    <>
      <div className='d-xl-none'>
        <p className={'text-base fw-semibold'}>Overview</p>
        <Swiper {...options} className='dashboard-overview-card border-0'>
          {data.map((item, key) => (
            <SwiperSlide key={key} className='h-auto'>
              <Card body key={key} className='rounded-12 border-light h-100 w-100'>
                <div className={'d-flex align-items-center justify-content-between h-100 py-3 ps-2'}>
                  <div className='d-flex flex-column h-100'>
                    <span className='text-xs text-uppercase flex-grow-1 text-neutral-dark'>{item.title}</span>
                    <span className='fw-bold text-2xl'>{item.total}</span>
                  </div>
                  <span
                    className={
                      'px-2 growth rounded-1 d-flex text-nowrap align-items-center justify-content-center gap-2 ' +
                      (item.percentage >= 0 ? 'success' : 'danger')
                    }
                  >
                    {item.percentage >= 0 ? '+' : ''}
                    {item.percentage} %{item.percentage >= 0 ? <MdArrowOutward /> : <LuArrowDownLeft />}
                  </span>
                </div>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <Card body className='rounded-12 d-none d-xl-block border-light'>
        <p className={'text-base fw-semibold'}>Overview</p>
        <div className='row g-4'>
          {data.map((item, key) => (
            <div key={key} className='col dashboard-overview-card'>
              <div className={'d-flex align-items-center justify-content-between h-100 py-3 ps-2'}>
                <div className='d-flex flex-column h-100'>
                  <div className='text-xs text-uppercase flex-grow-1 text-neutral-dark'>{item.title}</div>
                  <div className='fw-bold text-2xl'>{item.total}</div>
                </div>
                <span
                  className={
                    'px-2 growth rounded-1 d-flex text-nowrap align-items-center justify-content-center gap-2 ' +
                    (item.percentage >= 0 ? 'success' : 'danger')
                  }
                >
                  {item.percentage >= 0 ? '+' : ''}
                  {item.percentage} %{item.percentage >= 0 ? <MdArrowOutward /> : <LuArrowDownLeft />}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
