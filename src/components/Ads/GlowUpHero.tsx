import Link from 'next/link';
import React from 'react';
import GlowUpBg from '@/assets/glow-up-bg.jpg';
import './styles.css';

const GlowUpHero = () => {
  return (
    <section
      className='w-100 p-0 glow-up-bg glow-up-bg-responsive glow-up-hero glow-up-hero-with-overlay d-flex'
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${GlowUpBg.src})`,
      }}
    >
      <div className='container d-flex flex-grow-1'>
        <div className='d-flex flex-column justify-content-center align-items-center text-center text-white pt-5 glow-up-content flex-grow-1'>
          <p className='display-1 glow-up-title'>
            <span className='fw-bold'>Your Glow-Up</span> <span className='glow-up-subtitle'>Starts Here</span>
          </p>
          <Link href='/products/summary'>
            <button className='btn btn-light glow-up-btn'>GET STARTED</button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GlowUpHero;
