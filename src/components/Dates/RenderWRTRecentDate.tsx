import { format, differenceInMinutes } from 'date-fns';
import React from 'react';

interface RenderWRTRecentDateProps extends React.ComponentPropsWithoutRef<'span'> {
  date: string | Date; // Accept both ISO string or Date object
}

const RenderWRTRecentDate: React.FC<RenderWRTRecentDateProps> = ({ date, ...restProps }) => {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Calculate the difference in minutes
  const diffInMinutes = differenceInMinutes(now, dateObject);
  
  // If the difference is less than 60 minutes (1 hour) and positive
  if (diffInMinutes >= 0 && diffInMinutes <= 60) {
    const isDiffZero = diffInMinutes === 0;

    const isDiffOneHour = diffInMinutes === 60;

    const label = diffInMinutes !== 1 ? 'mins' : 'min';
    const timeStr = {
      0: 'Just now',
      60: '1 hour ago',
      
    }
    return <span {...restProps}>{isDiffZero || isDiffOneHour ? timeStr[diffInMinutes as keyof typeof timeStr] : `${diffInMinutes} ${label} ago`}</span>;
  }
  
  // Otherwise return formatted time in HH:MM AM/PM format
  return <span {...restProps}>{format(dateObject, 'hh:mm a')}</span>;
};

export { RenderWRTRecentDate };
