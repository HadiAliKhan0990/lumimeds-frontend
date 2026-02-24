'use client';

import { useEffect, useState } from 'react';

export const useSubdomain = () => {
  const [subdomain, setSubdomain] = useState('');

  useEffect(() => {
    if (process) {
      const hostname = window.location.hostname;

      // Split hostname by dots
      const parts = hostname.split('.');

      // Handle localhost separately (e.g., subdomain.localhost)

      setSubdomain(parts[0]);
    }
  }, []);

  return subdomain;
};
