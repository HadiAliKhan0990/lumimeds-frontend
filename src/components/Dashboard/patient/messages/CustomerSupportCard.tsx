import { ReactNode } from 'react';
import { Card, CardProps, Spinner } from 'react-bootstrap';

interface Props extends CardProps {
  icon: ReactNode;
  listItems: string[];
  loading?: boolean;
  className?: string;
}

export const CustomerSupportCard = ({ icon, title, listItems, loading, className, ...props }: Props) => {
  return (
    <Card
      body
      className={`h-100 rounded-12 card-hover-border position-relative user-select-none overflow-hidden p-xl-2 tw-cursor-pointer ${className}`}
      {...props}
    >
      <Card.Title className='d-flex align-items-center mb-3'>
        <div className='d-flex align-items-center gap-3'>
          {icon}
          <strong>{title}</strong>
        </div>
      </Card.Title>
      <ul className='ps-4 m-0' style={{ listStyleType: 'disc' }}>
        {listItems.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      {loading && (
        <div className='d-flex bg-white z-1 align-items-center justify-content-center position-absolute top-0 end-0 bottom-0 start-0'>
          <Spinner className='size-75' />
        </div>
      )}
    </Card>
  );
};
