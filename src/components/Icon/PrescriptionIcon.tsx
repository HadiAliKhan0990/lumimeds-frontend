import React from 'react';

interface PrescriptionIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const PrescriptionIcon: React.FC<PrescriptionIconProps> = ({ size, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox='0 0 12 16'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M4.7491 10.1992H2.66577V7.69916H4.7491V5.61582H7.2491V7.69916H9.33244V10.1992H7.2491V12.2825H4.7491V10.1992ZM11.8324 4.36582V13.5325C11.8324 14.4492 11.0824 15.1992 10.1658 15.1992H1.83244C0.915771 15.1992 0.165771 14.4492 0.165771 13.5325V4.36582C0.165771 3.44916 0.915771 2.69916 1.83244 2.69916H10.1658C11.0824 2.69916 11.8324 3.44916 11.8324 4.36582ZM10.1658 4.36582H1.83244V13.5325H10.1658V4.36582ZM10.9991 0.199158H0.999105V1.86582H10.9991V0.199158Z'
      fill={props.fill || 'white'}
    />
  </svg>
);

export default PrescriptionIcon;
