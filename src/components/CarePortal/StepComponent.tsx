'use client';

import Image, { StaticImageData } from 'next/image';
import './styles.css';

interface StepProps {
  step: {
    title: string;
    description?: string;
    details?: string[];
    cta?: {
      text?: string;
      href: string;
    };
    image?: {
      src: StaticImageData;
      alt: string;
      width: number;
      height: number;
    };
  };
  stepNo?: string;
}

export default function StepComponent({ step, stepNo }: StepProps) {
  const { title, description, details, cta, image } = step;
  return (
    <div className='card border-0 shadow-md rounded-12'>
      <div className='card-body p-4'>
        <div className='d-flex gap-4 mb-3 align-items-center'>
          {stepNo && <h4 className='text-primary text-xl fw-bold m-0'>{stepNo}</h4>}
          <h6 className='fw-normal text m-0'>{title}</h6>
        </div>

        {description && <p dangerouslySetInnerHTML={{ __html: description }} />}

        {details && (
          <ul>
            {details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        )}

        {cta && (
          <a href={cta.href} target='_blank' className='btn btn-primary rounded-pill py-2 px-4 care-portal-cta-btn'>
            {cta.text}
          </a>
        )}

        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className='h-auto w-100 border'
          />
        )}
      </div>
    </div>
  );
}
