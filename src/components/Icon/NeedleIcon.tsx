'use client';

import React from 'react';

interface Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function NeedleIcon({ size, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      {...props}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.442 27.83L17.8386 25.245L20.442 22.6417L23.027 25.245L25.612 22.6417L23.027 20.0567L25.612 17.4717L28.2153 20.0567L30.8003 17.4717L25.612 12.2834L12.6503 25.245L17.8386 30.4334L20.442 27.83ZM5.64697 34.8334L11.367 29.1317L7.48031 25.245L25.612 7.09504L29.517 11L32.0836 8.39671L29.517 5.79337L32.0836 3.20837L39.8753 11L37.2903 13.5667L34.687 11L32.0836 13.5667L35.9886 17.4717L17.8386 35.6034L13.952 31.7167L5.64697 40.04V34.8334Z"
        fill="currentColor"
      />
    </svg>
  );
} 