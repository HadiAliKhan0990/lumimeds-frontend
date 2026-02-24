import React from 'react';

export default function Page() {
  return (
    <>
      <h1 className='display-6 mb-5'>Refills</h1>
      <div className='alert alert-warning' role='alert'>
        Need a refill? Please submit your refill request by completing the Refill Request Form available{' '}
        <a href='https://form.jotform.com/250495873410156' target='_blank' rel='noopener noreferrer'>
          here.
        </a>
      </div>
    </>
  );
}
