/**
 * Calculate age from date of birth
 */
export const calculateAge = (dob: string): number => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Calculate time remaining until appointment
 */
export const getTimeRemaining = (startTime: string): string => {
  const now = new Date();
  const appointment = new Date(startTime);
  const diff = appointment.getTime() - now.getTime();
  
  if (diff < 0) {
    return 'Past due';
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `in ${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `in ${hours}h`;
  } else if (minutes > 0) {
    return `in ${minutes}mins`;
  } else {
    return 'Now';
  }
};

/**
 * Format date to display format (e.g., "Sep 15, 2:45 PM")
 */
export const formatAppointmentDateTime = (startTime: string): string => {
  const date = new Date(startTime);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const time = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `${month} ${day}, ${time}`;
};

/**
 * Format date only (e.g., "Sep 15")
 */
export const formatAppointmentDate = (startTime: string): string => {
  const date = new Date(startTime);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  
  return `${month} ${day}`;
};

/**
 * Format time only (e.g., "2:45 PM")
 */
export const formatAppointmentTime = (startTime: string): string => {
  const date = new Date(startTime);
  const time = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  return time;
};

/**
 * Format message timestamp (e.g., "12:30 PM")
 */
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

/**
 * Truncate message content for preview
 */
export const truncateMessage = (content: string, maxLength: number = 50): string => {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + '...';
};


/**
 * Get current month name for display
 */
export const getCurrentMonthName = (): string => {
  return new Date().toLocaleDateString('en-US', { month: 'long' });
};
