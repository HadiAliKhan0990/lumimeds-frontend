import React from 'react';
import { IoNotificationsOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';

export interface NotificationIconButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  iconProps?: React.SVGProps<SVGSVGElement>;
}

export const NotificationIconButton = ({ className, iconProps, ...props }: NotificationIconButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(ROUTES.PROVIDER_NOTIFICATIONS);
  };

  return (
    <button className={`cursor-pointer rounded-1 bg-white border p-2 ${className}`} onClick={handleClick} {...props}>
      <IoNotificationsOutline size={20} {...iconProps} />
    </button>
  );
};
