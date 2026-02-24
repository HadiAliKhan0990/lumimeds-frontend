import { ALL_PLANS_INCLUDE } from '@/constants/products';

export const AllPlansInclude = () => {
  return (
    <div className='d-flex flex-column justify-content-center gap-3 p-4'>
      <b className='m-0 fs-1 lh-1'>All Plans Include:</b>
      {ALL_PLANS_INCLUDE.map(({ title, Icon }) => (
        <div key={title} className='d-flex align-items-center gap-2'>
          <Icon size={20} />
          <span className='text-lg fw-bold'>{title}</span>
        </div>
      ))}
    </div>
  );
};
