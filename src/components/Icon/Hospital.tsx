interface Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Hospital({ size, ...props }: Props) {
  return (
    <svg width={size} height={size} {...props} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M18 14H14V18H10V14H6V10H10V6H14V10H18M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2ZM20 20H4V4H20V20Z'
        fill='currentColor'
      />
    </svg>
  );
}
