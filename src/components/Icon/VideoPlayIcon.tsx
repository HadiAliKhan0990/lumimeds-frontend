import React from 'react';

interface VideoPlayIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const VideoPlayIcon: React.FC<VideoPlayIconProps> = ({ size, width, height, ...props }) => (
  <svg
    width={width ?? size}
    height={height ?? size}
    viewBox='0 0 24 25'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M2 8.29008C2 5.13008 3.05 4.08008 6.21 4.08008H12.53C15.69 4.08008 16.74 5.13008 16.74 8.29008V16.7101C16.74 19.8701 15.69 20.9201 12.53 20.9201H6.21C3.05 20.9201 2 18.8201 2 16.7101V12.6201'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M19.5202 17.6001L16.7402 15.6501V9.34013L19.5202 7.39013C20.8802 6.44013 22.0002 7.02013 22.0002 8.69013V16.3101C22.0002 17.9801 20.8802 18.5601 19.5202 17.6001Z'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M13 10C13 9.17 12.33 8.5 11.5 8.5C10.67 8.5 10 9.17 10 10C10 10.83 10.67 11.5 11.5 11.5'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

export default VideoPlayIcon;
