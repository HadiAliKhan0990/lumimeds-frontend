import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function MedicationOutline({ size, ...props }: Readonly<Props>) {
  return (
    <svg {...props} width={size} height={size} viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M8.7513 12.5H6.66797V10H8.7513V7.91667H11.2513V10H13.3346V12.5H11.2513V14.5833H8.7513V12.5ZM15.8346 6.66667V15.8333C15.8346 16.75 15.0846 17.5 14.168 17.5H5.83464C4.91797 17.5 4.16797 16.75 4.16797 15.8333V6.66667C4.16797 5.75 4.91797 5 5.83464 5H14.168C15.0846 5 15.8346 5.75 15.8346 6.66667ZM14.168 6.66667H5.83464V15.8333H14.168V6.66667ZM15.0013 2.5H5.0013V4.16667H15.0013V2.5Z'
        fill='currentColor'
      />
    </svg>
  );
}
