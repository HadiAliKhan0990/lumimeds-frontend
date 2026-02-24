interface Props {
  title: string;
  subTitle: string;
}

export const EmptyState = ({ subTitle, title }: Props) => (
  <div className='h-100 w-100 d-flex flex-column align-items-center justify-content-center text-center text-muted flex-grow-1'>
    <p className='text-4xl'>{title}</p>
    <span className='text-base'>{subTitle}</span>
  </div>
);
