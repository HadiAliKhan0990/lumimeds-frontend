import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
  circleFill?: string;
  checkmarkStroke?: string;
}

export const SuccessCircleCheck = ({ 
  size = 36, 
  width, 
  height, 
  circleFill = 'rgba(25,135,84,0.15)',
  checkmarkStroke = '#198754',
  ...props 
}: Readonly<Props>) => {
  return (
    <svg {...props} width={size ?? width} height={size ?? height} viewBox='0 0 24 24' fill='none'>
      <circle cx='12' cy='12' r='10' fill={circleFill} />
      <path
        d='M16.5 9.5L10.75 15.25L7.5 12'
        stroke={checkmarkStroke}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};
