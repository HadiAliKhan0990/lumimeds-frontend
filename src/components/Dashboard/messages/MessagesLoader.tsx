import { Spinner } from 'react-bootstrap';

interface Props {
  title: string;
  subTitle: string;
  className?: string;
}

export const MessagesLoader = ({ title, subTitle, className }: Readonly<Props>) => (
  <div
    className={`d-flex flex-column align-items-center justify-content-center h-100 w-100 text-center flex-grow-1 ${className}`}
  >
    <Spinner className='mb-3 border-2' />
    <div className='text-muted'>
      <p className='fs-5 mb-2'>{title}</p>
      <small className='text-secondary'>{subTitle}</small>
    </div>
  </div>
);
