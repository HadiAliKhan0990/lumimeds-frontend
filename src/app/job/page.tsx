import { JOB_JOTFORM_SCRIPT_SRC } from '@/constants';
import Script from 'next/script';
import React from 'react';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Careers at LumiMeds – Join Our Team in Revolutionizing Weight Loss',
    description:
      'Looking to make a difference? Explore career opportunities at LumiMeds and be part of a team dedicated to personalized weight loss solutions.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/job',
    },
    openGraph: {
      title: 'Careers at LumiMeds – Join Our Team in Revolutionizing Weight Loss',
      description:
        'Looking to make a difference? Explore career opportunities at LumiMeds and be part of a team dedicated to personalized weight loss solutions.',
      type: 'website',
      url: 'https://www.lumimeds.com/job',
    },
  };
}

const JobPage = () => {
  return (
    <section className='p-5 section bg-white wow animate__fadeIn'>
      <div className='container'>
        <div className='row justify-content-center'>
          <Script type='text/javascript' id='jotform-script' src={JOB_JOTFORM_SCRIPT_SRC} />
        </div>
      </div>
    </section>
  );
};

export default JobPage;
