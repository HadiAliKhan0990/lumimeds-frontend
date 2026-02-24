'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface DoseSpotSSOResponse {
  ssoUrl: string;
}

interface DoseSpotJumpstartProps {
  className?: string;
  height?: string;
}

/**
 * DoseSpot Jumpstart UI Component
 * 
 * Fetches SSO URL from the backend and renders DoseSpot UI in an iframe.
 * 
 * @param className - Optional CSS class name for the container
 * @param height - Optional iframe height (default: 800px)
 */
export default function DoseSpotJumpstart({ className = '', height = '800px' }: DoseSpotJumpstartProps) {
  const [ssoUrl, setSsoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSSOUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get<DoseSpotSSOResponse>(`${process.env.NEXT_PUBLIC_API_URL || ''}/dosespot/sso-url`);
        
        if (response.data?.ssoUrl) {
          setSsoUrl(response.data.ssoUrl);
        } else {
          throw new Error('SSO URL not found in response');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch DoseSpot SSO URL';
        console.error('Error fetching DoseSpot SSO URL:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSSOUrl();
  }, []);

  if (isLoading) {
    return (
      <div className={`d-flex align-items-center justify-content-center ${className}`} style={{ minHeight: height }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading DoseSpot...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`d-flex align-items-center justify-content-center ${className}`} style={{ minHeight: height }}>
        <div className="text-center">
          <p className="text-danger">Error loading DoseSpot: {error}</p>
          <p className="text-muted small">Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  if (!ssoUrl) {
    return (
      <div className={`d-flex align-items-center justify-content-center ${className}`} style={{ minHeight: height }}>
        <div className="text-center">
          <p className="text-muted">No SSO URL available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <iframe
        src={ssoUrl}
        style={{ width: '100%', height: '800px', border: 'none' }}
        title="DoseSpot UI"
      />
    </div>
  );
}

