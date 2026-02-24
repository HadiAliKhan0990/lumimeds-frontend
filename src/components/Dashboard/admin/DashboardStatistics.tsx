'use client';

import { Card } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { capitalizeFirst, generateRandomColors, sumArray } from '@/lib/helper';
import { AgeStates, GenderStates } from '@/store/slices/dashboardSlice';
import { DoughnutChart } from '@/components/elements';

export default function DashboardStatistics() {
  const { stats } = useSelector((state: RootState) => state.dashboard);

  const PRODUCT_LABELS = stats?.productStats?.products.map((item) => item.productName) || [];

  const PRODUCT_DATASET = [
    {
      data: stats?.productStats?.products.map((item) => item.patientCount) || [],
      backgroundColor: generateRandomColors(PRODUCT_LABELS),
      borderWidth: 2,
      borderColor: '#fff',
    },
  ];

  const genderStats = stats?.genderStats || {};
  const genderKeys = Object.keys(genderStats).filter((k) => k != 'total');

  const GENDER_LABELS = genderKeys.map((title) => capitalizeFirst(title)) || [];
  const GENDER_DATASET = [
    {
      data: genderKeys.map((key) => genderStats[key as keyof GenderStates] || 0) || [],
      backgroundColor: ['#2A9D90', '#E76E50', '#979797'],
      borderWidth: 2,
      borderColor: '#fff',
    },
  ];

  const ageStats = stats?.ageStats;
  const ageStatsKeys = ageStats ? Object.keys(ageStats).filter((k) => k != 'total') : [];

  const AGE_LABELS = [
    '18-22 years',
    '23-29 years',
    '30-39 years',
    '40-49 years',
    '50-59 years',
    '60-64 years',
    '65+ years',
  ];
  const AGE_DATASET = [
    {
      data: ageStatsKeys.map((key) => ageStats?.[key as keyof AgeStates] || 0) || [],
      backgroundColor: ['#4CAAD8', '#E28DD7', '#AB82FD', '#FF6B6B', '#4ECDC4', '#F4A261', '#E63946'],
      borderWidth: 2,
      borderColor: '#fff',
    },
  ];

  return (
    <>
      <div className='d-lg-none'>
        <p className='text-base fw-bold'>General Analytics</p>
        <Swiper
          className='chart-slider border-0'
          modules={[Pagination]}
          slidesPerView={1}
          pagination={{ clickable: true }}
        >
          <SwiperSlide>
            {stats && (
              <Card body className='rounded-12 border-light shadow-sm w-100 h-100'>
                <p className='chart-title fw-medium'>POPULAR PRODUCTS</p>
                <div className='w-75 mx-auto'>
                  <DoughnutChart
                    labels={PRODUCT_LABELS}
                    datasets={PRODUCT_DATASET}
                    total={`${sumArray(stats?.productStats?.products.map((item) => item.patientCount))}`}
                  />
                </div>
                <div className='d-flex flex-column gap-2 mt-4'>
                  {PRODUCT_LABELS.map((title, i) => (
                    <div key={i} className='d-flex align-items-center gap-2'>
                      <span
                        className='label-title-dot rounded-circle flex-shrink-0'
                        style={{ backgroundColor: PRODUCT_DATASET[0].backgroundColor[i] }}
                      />
                      <span className='text-xs flex-grow-1'>{title}</span>
                      <span className='fw-medium'>{PRODUCT_DATASET[0].data[i]}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {stats && (
              <Card body className='rounded-12 border-light shadow-sm h-100 w-100'>
                <p className='chart-title fw-medium'>GENDER</p>
                <div className='w-75 mx-auto'>
                  <DoughnutChart
                    labels={GENDER_LABELS}
                    datasets={GENDER_DATASET}
                    total={`${stats?.genderStats?.total || 0}`}
                  />
                </div>
                <div className='d-flex flex-column gap-2 mt-4'>
                  {GENDER_LABELS.map((title, i) => (
                    <div key={i} className='d-flex align-items-center gap-2'>
                      <span
                        className='label-title-dot rounded-circle flex-shrink-0'
                        style={{ backgroundColor: GENDER_DATASET[0].backgroundColor[i] }}
                      />
                      <span className='text-xs flex-grow-1'>{title}</span>
                      <span className='fw-medium'>{GENDER_DATASET[0].data[i]}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {stats && (
              <Card body className='rounded-12 border-light shadow-sm h-100 w-100'>
                <p className='chart-title fw-medium'>AGE</p>
                <div className='w-75 mx-auto'>
                  <DoughnutChart labels={AGE_LABELS} datasets={AGE_DATASET} total={`${stats?.ageStats?.total || 0}`} />
                </div>
                <div className='d-flex flex-column gap-2 mt-4'>
                  {AGE_LABELS.map((title, i) => (
                    <div key={i} className='d-flex align-items-center gap-2'>
                      <span
                        className='label-title-dot rounded-circle flex-shrink-0'
                        style={{ backgroundColor: AGE_DATASET[0].backgroundColor[i] }}
                      />
                      <span className='text-xs flex-grow-1'>{title}</span>
                      <span className='fw-medium'>{AGE_DATASET[0].data[i]}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </SwiperSlide>
        </Swiper>
      </div>
      <Card body className='rounded-12 d-none d-lg-block border-light analytics-card-lg'>
        <p className='text-base fw-bold'>General Analytics</p>
        {stats && (
          <div className='row'>
            <div className='col-md-6 col-lg-4'>
              <div className='row align-items-start'>
                <p className='chart-title col-12 fw-medium'>POPULAR PRODUCTS</p>

                <div className='col-6'>
                  <DoughnutChart
                    datasets={PRODUCT_DATASET}
                    total={`${sumArray(stats?.productStats?.products.map((item) => item.patientCount))}`}
                  />
                </div>

                <div className='col-6'>
                  <div className='d-flex flex-column gap-2 mt-4'>
                    {PRODUCT_LABELS.map((title, i) => (
                      <div key={i} className='d-flex align-items-center gap-2'>
                        <span
                          className='label-title-dot rounded-circle flex-shrink-0'
                          style={{ backgroundColor: PRODUCT_DATASET[0].backgroundColor[i] }}
                        />
                        <span className='text-xs'>{`${title} - ${PRODUCT_DATASET[0].data[i]}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className='col-md-6 col-lg-4'>
              <div className='row'>
                <p className='chart-title col-12 fw-medium'>GENDER</p>

                <div className='col-6'>
                  <DoughnutChart datasets={GENDER_DATASET} total={`${stats?.genderStats?.total || 0}`} />
                </div>

                <div className='col-6'>
                  <div className='d-flex flex-column gap-2 mt-4'>
                    {GENDER_LABELS.map((title, i) => (
                      <div key={i} className='d-flex align-items-center gap-2'>
                        <span
                          className='label-title-dot rounded-circle flex-shrink-0'
                          style={{ backgroundColor: GENDER_DATASET[0].backgroundColor[i] }}
                        />
                        <span className='text-xs'>{`${title} - ${GENDER_DATASET[0].data[i]}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className='col-md-6 col-lg-4'>
              <div className='row'>
                <p className='chart-title col-12 fw-medium'>AGE</p>

                <div className='col-6'>
                  <DoughnutChart datasets={AGE_DATASET} total={`${stats?.ageStats?.total || 0}`} />
                </div>

                <div className='col-6'>
                  <div className='d-flex flex-column gap-2 mt-4'>
                    {AGE_LABELS.map((title, i) => (
                      <div key={i} className='d-flex align-items-center gap-2'>
                        <span
                          className='label-title-dot rounded-circle flex-shrink-0'
                          style={{ backgroundColor: AGE_DATASET[0].backgroundColor[i] }}
                        />
                        <span className='text-xs'>{`${title} - ${AGE_DATASET[0].data[i]}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
