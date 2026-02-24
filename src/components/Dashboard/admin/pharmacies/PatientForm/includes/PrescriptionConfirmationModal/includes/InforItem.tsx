interface Props {
  title: string;
  value: string;
  className?: string;
}

export const InfoItem = ({ title, value, className }: Props) => {
  return (
    <div className='row'>
      <span className={`col-12  col-lg-5 fw-semibold`}>{title}:</span>
      <span className={`col-12  col-lg-7 fs-6 ${className}`}>{value}</span>
    </div>
  );
};
