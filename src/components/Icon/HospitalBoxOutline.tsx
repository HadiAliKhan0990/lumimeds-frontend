import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function HospitalBoxOutline({ size, ...props }: Readonly<Props>) {
  return (
    <svg {...props} width={size} height={size} viewBox='0 0 65 64' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M48.8756 37.333H38.209V47.9997H27.5423V37.333H16.8757V26.6663H27.5423V15.9997H38.209V26.6663H48.8756M54.209 5.33301H11.5423C8.60898 5.33301 6.20898 7.73301 6.20898 10.6663V53.333C6.20898 56.2663 8.60898 58.6663 11.5423 58.6663H54.209C57.1423 58.6663 59.5423 56.2663 59.5423 53.333V10.6663C59.5423 7.73301 57.1423 5.33301 54.209 5.33301ZM54.209 53.333H11.5423V10.6663H54.209V53.333Z'
        fill='currentColor'
      />
    </svg>
  );
}
