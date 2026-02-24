import Image from 'next/image';

interface Props {
  todayCount: number;
}

export default function AppointmentsTitle({ todayCount }: Props) {
  return (
    <div className='d-flex flex-column flex-sm-row align-items-sm-center gap-2 mb-3'>
      <div className='d-flex align-items-center gap-2'>
        <Image src='/video.svg' alt='Video' width={25} height={25} className='text-muted' />
        <h5 className='m-0 fs-3'>Appointments (Sync)</h5>
      </div>
      <span className='text-muted md:tw-whitespace-nowrap'>({todayCount} Today)</span>
    </div>
  );
}
