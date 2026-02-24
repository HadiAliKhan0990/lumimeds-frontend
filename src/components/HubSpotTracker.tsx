'use client';

import Script from 'next/script';
import { useEffect } from 'react';

// TypeScript declarations for HubSpot tracking
declare global {
  interface Window {
    _hsq: {
      push: (args: unknown[]) => void;
    };
  }
}

interface HubSpotTrackerProps {
  portalId?: string;
}

export default function HubSpotTracker({ portalId }: Readonly<HubSpotTrackerProps>) {
  // Use the environment variable or fallback to hardcoded value
  const hubspotPortalId = portalId || process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || '244175540';

  useEffect(() => {
    // Initialize HubSpot tracking queue if not already present
    if (typeof window !== 'undefined' && !window._hsq) {
      window._hsq = { push: () => {} };
    }
  }, []);

  if (!hubspotPortalId) {
    console.warn('HubSpot Portal ID not provided. Please set NEXT_PUBLIC_HUBSPOT_PORTAL_ID environment variable.');
    return null;
  }

  return (
    <Script
      id='hubspot-tracking'
      strategy='afterInteractive'
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Check if HubSpot is already initialized
              if (window._hsq && window._hsq.length > 0) {
                return;
              }
              
              // Initialize HubSpot tracking
              (function(d,s,i,r) {
                if (d.getElementById(i)){return;}
                var n=d.createElement(s),e=d.getElementsByTagName(s)[0];
                n.id=i;n.src='//js.hs-scripts.com/'+r+'.js';
                e.parentNode.insertBefore(n, e);
              }(document,"script","hs-script-loader", '${hubspotPortalId}'));
            } catch (err) {
              console.error('HubSpot tracking initialization error:', err);
            }
          })();
        `,
      }}
    />
  );
}

// Helper functions for HubSpot tracking
export const hubspotTrack = {
  // Track page views
  trackPageView: (path?: string) => {
    if (typeof window !== 'undefined' && window._hsq) {
      window._hsq.push(['trackPageView', path || window.location.pathname]);
    }
  },

  // Track custom events
  trackEvent: (eventName: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window._hsq) {
      window._hsq.push([
        'trackEvent',
        {
          id: eventName,
          value: properties,
        },
      ]);
    }
  },

  // Identify users
  identify: (email: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window._hsq) {
      window._hsq.push([
        'identify',
        {
          email: email,
          ...properties,
        },
      ]);
    }
  },

  // Track form submissions
  trackFormSubmission: (formId: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window._hsq) {
      window._hsq.push([
        'trackEvent',
        {
          id: 'form_submission',
          value: {
            form_id: formId,
            ...properties,
          },
        },
      ]);
    }
  },
};
