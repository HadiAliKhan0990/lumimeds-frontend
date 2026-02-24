import { HOW_IT_WORKS_CONTENT } from '@/components/Home/HowItWorks/includes/constants';
import { HTMLAttributes } from 'react';
import HowItWorksCard from '@/components/Home/HowItWorks/includes/HowItWorksCard';
import './styles.css';

export default function HowItWorks({ className }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={`bg-primary py-5 ${className}`}>
      <div className='container pt-5 pb-4'>
        <p className='text-center how-it-works-title mb-5 pb-3'>
          How it <span style={{ fontFamily: 'Instrument Serif', fontWeight: 400 }}>Works</span>
        </p>
        <div className='d-flex flex-column gap-4'>
          {HOW_IT_WORKS_CONTENT.map((content, i) => (
            <HowItWorksCard key={i} {...content} />
          ))}
        </div>
      </div>
    </div>
  );
}
