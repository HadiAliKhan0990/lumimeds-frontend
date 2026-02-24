interface Props {
  title: string;
  value: string;
  className?: string;
}

export const ScriptInfoItem = ({ title, value, className }: Props) => {
  return (
    <div className='row g-2'>
      <span className='fw-semibold col-lg-3'>{title}:</span>
      <span className={`fs-6 col-lg-9 text-capitalize ${className}`}>{value}</span>
    </div>
  );
};
