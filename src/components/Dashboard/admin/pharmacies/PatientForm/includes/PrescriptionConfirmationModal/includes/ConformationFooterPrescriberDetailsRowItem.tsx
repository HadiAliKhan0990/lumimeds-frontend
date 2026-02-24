interface Props {
  title: string;
  value: string;
}

export const ConformationFooterPrescriberDetailsRowItem = ({ title, value }: Props) => {
  return (
    <div>
      <span className='fw-semibold -tw-translate-y-2'>{title}:</span>
      <span className='fs-6 ml-1 -tw-translate-y-2'>{value}</span>
    </div>
  );
};
