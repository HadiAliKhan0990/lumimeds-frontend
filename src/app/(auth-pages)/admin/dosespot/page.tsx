'use client';

import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { Card } from 'react-bootstrap';
import DoseSpotJumpstart from '@/components/DoseSpot/DoseSpotJumpstart';

export default function DoseSpotPage() {
  return (
    <>
      <MobileHeader title='DoseSpot Jumpstart' className='mb-4 d-lg-none' />

      <div className='d-none d-lg-block mb-4'>
        <span className='text-2xl fw-semibold'>DoseSpot Jumpstart</span>
      </div>

      <Card body className='rounded-12 border-light zero-styles-mobile'>
        <DoseSpotJumpstart height='800px' />
      </Card>
    </>
  );
}

