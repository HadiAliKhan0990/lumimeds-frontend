'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeLandingPage, trackPageView, trackButtonClick, trackSurveyAbandoned } from '@/helpers/hotjarTracking';

/**
 * HotjarTracker Component
 *
 * This component handles Hotjar tracking initialization and automatic
 * page view tracking using the centralized tracking helper.
 *
 * It should be placed in the root layout to track all pages.
 */
export default function HotjarTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef(pathname);

  // Initialize landing page on mount
  useEffect(() => {
    try {
      // Initialize landing page (only sets on first visit)
      initializeLandingPage();
    } catch (error) {
      console.error('Hotjar initialization error (non-critical):', error);
    }
  }, []);

  // Track when user is leaving the website or page
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        // Track abandonment if user is on a survey page
        if (pathname.includes('/survey') || pathname.includes('/general-survey') || pathname.includes('/intake-form')) {
          // Get current step from localStorage if available
          const surveyProgress = localStorage.getItem('surveyProgress');
          let currentStep = 0;

          try {
            if (surveyProgress) {
              currentStep = parseInt(surveyProgress, 10) || 0;
            }
          } catch (error) {
            console.error('Error parsing survey progress:', error);
          }

          trackSurveyAbandoned('patient_intake_survey', currentStep, 'User left page', undefined, {
            pathname,
            exitType: 'beforeunload',
          });
        }
      } catch (error) {
        console.error('Hotjar tracking error (non-critical):', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  // Track when user navigates away from survey pages (route change)
  useEffect(() => {
    try {
      const prevPath = lastPathRef.current;
      const isSurveyPage = (path: string) =>
        path.includes('/survey') || path.includes('/general-survey') || path.includes('/intake-form');

      // If user was on a survey page and navigated to a non-survey page
      if (isSurveyPage(prevPath) && !isSurveyPage(pathname)) {
        // Get current step from localStorage if available
        const surveyProgress = localStorage.getItem('surveyProgress');
        let currentStep = 0;

        try {
          if (surveyProgress) {
            currentStep = parseInt(surveyProgress, 10) || 0;
          }
        } catch (error) {
          console.error('Error parsing survey progress:', error);
        }

        trackSurveyAbandoned('patient_intake_survey', currentStep, 'User navigated away', undefined, {
          fromPath: prevPath,
          toPath: pathname,
          exitType: 'navigation',
        });
      }

      lastPathRef.current = pathname;
    } catch (error) {
      console.error('Hotjar tracking error (non-critical):', error);
      lastPathRef.current = pathname; // Still update the ref even if tracking fails
    }
  }, [pathname]);

  // Track page views when pathname or search params change
  useEffect(() => {
    // Wait a bit to ensure Hotjar is loaded
    const timeoutId = setTimeout(() => {
      try {
        trackPageView();
      } catch (error) {
        console.error('Hotjar page view tracking error (non-critical):', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams]);

  // Set up button click tracking
  useEffect(() => {
    /**
     * Track Get Started Button clicks
     */
    function setupButtonTracking() {
      // Track buttons with data-tracking-id attribute for Get Started tracking
      const trackedButtons = document.querySelectorAll(
        '[data-tracking-id^="get-started-"], [data-tracking-id^="survey-"], [data-tracking-id^="product-"]'
      );

      trackedButtons.forEach((button) => {
        const trackingId = button.getAttribute('data-tracking-id');

        // Only attach if not already tracked (prevent duplicate listeners)
        if (trackingId && !button.hasAttribute('data-tracking-attached')) {
          button.setAttribute('data-tracking-attached', 'true');

          button.addEventListener('click', () => {
            try {
              const buttonText =
                (button as HTMLElement).textContent?.trim() || (button as HTMLInputElement).value || '';

              // Get destination from href or data attribute
              const destination = button.getAttribute('href') || button.getAttribute('data-destination') || undefined;

              trackButtonClick({
                buttonId: trackingId,
                buttonText,
                destination,
              });
            } catch (error) {
              console.error('Hotjar button click tracking error (non-critical):', error);
            }
          });
        }
      });
    }

    // Initialize tracking when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupButtonTracking);
    } else {
      setupButtonTracking();
    }

    // Re-track buttons for dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          setupButtonTracking();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      document.removeEventListener('DOMContentLoaded', setupButtonTracking);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
