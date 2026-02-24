import Image, { StaticImageData } from 'next/image';
import React from 'react';

interface Props {
  img: StaticImageData;
  title: React.ReactNode;
  description: string;
}

export default function BenefitCard({ img, title, description }: Props) {
  return (
    <div className='benefit_card' id='benefit_content'>
      <Image src={img} className='w-100 benefit_card_img object-fit-cover' alt='' />
      <div className='d-flex flex-column' style={{ rowGap: '24px' }}>
        {title}
        <p
          style={{
            margin: '0',
            fontFamily: "'Instrument Sans', system-ui",
            color: 'black',
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
