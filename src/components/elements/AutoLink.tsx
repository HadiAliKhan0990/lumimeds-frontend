import React from 'react';

interface AutoLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Common component for auto-detected links in chat messages
 * Reusable across all message rendering components to avoid duplication
 */
export const AutoLink: React.FC<AutoLinkProps> = ({ href, children, className = '', onClick }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`tw-text-primary tw-underline hover:tw-text-primary-dark tw-break-all tw-cursor-pointer ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
};

