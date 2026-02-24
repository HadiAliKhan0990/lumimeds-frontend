'use client';

import React from 'react';

interface Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function ArchiveArrowDown({ size, ...props }: Props) {
  return (
    <svg
      width={size}
      height={size}
      {...props}
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 16.543H3V8.29297H4.5V15.043H13.5V8.29297H15V16.543ZM2.25 3.04297H15.75V7.54297H2.25V3.04297ZM3.75 4.54297V6.04297H14.25V4.54297M7.875 9.04297V11.293H6L9 14.293L12 11.293H10.125V9.04297"
        fill="currentColor"
      />
    </svg>
  );
}
