import React from 'react';

interface Props {
  name: string;
  content: string;
}

export default function TestimonialCard({ name, content }: Props) {
  return (
    <div className='testimonial_card'>
      <p className='text-2xl fw-bold'>{name}</p>
      <p>{content}</p>
    </div>
  );
}
