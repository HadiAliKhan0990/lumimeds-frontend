'use client';

import React from 'react';
import './styles.css';
const BookAppointmentCTA = () => (
  <section id='cta' className='container py-0 tw-my-[64px] tw-mx-auto mb-0'>
    <div className='fs-5 text-dark mb-5'>
      <p className='mb-5'>Have Questions?</p>
      <p className='text-center'>Book a free appointment with one<br className='d-md-none' /> of our experts.</p>
      {/* <link href='https://assets.calendly.com/assets/external/widget.css' rel='stylesheet' /> */}
      <button
        // onClick={() => {
        //   Calendly.initPopupWidget({
        //     url: "https://calendly.com/lumimeds/15min",
        //   });
        //   return false;
        // }}
        onClick={() => {
          window.open('https://calendly.com/lumimeds/15min', '_blank');
        }}
        className='btn btn-primary rounded-pill text-lg px-4 py-12 fw-medium'
      >
        Book An Appointment
      </button>
    </div>
  </section>
);

export default BookAppointmentCTA;
