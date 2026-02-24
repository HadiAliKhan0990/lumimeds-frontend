export const OrderPlaceholder = () => (
  <div className='row g-3 w-100 placeholder-glow'>
    <div className='d-flex gap-3 col-9'>
      <div className='border rounded-2 w-50px h-50px placeholder flex-shrink-0' />
      <div className='d-flex flex-column gap-2 justify-content-center col-12'>
        <div className='placeholder placeholder-xs col-6'></div>
        <div className='placeholder placeholder-xs col-4'></div>
        <div className='placeholder placeholder-xs col-5'></div>
      </div>
    </div>
    <div className='placeholder align-self-start col-3'></div>
  </div>
);
