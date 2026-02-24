'use client';

import Script from 'next/script';
import HubSpotTracker from './HubSpotTracker';
import {
  isTrackingEnabled,
  META_PIXEL_ID,
  GOOGLE_ANALYTICS_ID,
  GOOGLE_ADS_ID,
  GTM_ID,
  REDDIT_PIXEL_ID,
  TIKTOK_PIXEL_ID,
  MICROSOFT_UET_ID,
  CALLRAIL_ID,
  HOTJAR_ID,
} from '@/constants/tracking';

export default function RootLayoutScripts() {
  const trackingEnabled = isTrackingEnabled();
  const metaPixelId = META_PIXEL_ID;
  const googleAnalyticsId = GOOGLE_ANALYTICS_ID;
  const googleAdsId = GOOGLE_ADS_ID;
  const gtmId = GTM_ID;
  const redditPixelId = REDDIT_PIXEL_ID;
  const tiktokPixelId = TIKTOK_PIXEL_ID;
  const microsoftUetId = MICROSOFT_UET_ID;
  const callrailId = CALLRAIL_ID;
  const hotjarId = HOTJAR_ID;

  return (
    <>
      {/* ——— HubSpot Tracking Code ——— */}
      {trackingEnabled && <HubSpotTracker />}

      {/* ——— Meta Pixel Code ——— */}
      {trackingEnabled && metaPixelId && (
        <>
          <Script id='fb-pixel' strategy='afterInteractive'>
            {`
          (function() {
            try {
              // Check if already initialized
              if (window.fbq) {
                window.fbPixelReady = true;
                return;
              }
              
              
              // Use the standard Facebook pixel code
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
              
              // Handle script load errors (e.g., ad blockers)
              t.onerror = function() {
                console.warn('Facebook Pixel script blocked or failed to load');
                window.fbPixelReady = false;
              };
              
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              
              // Wait for the script to load and then initialize
              var retryCount = 0;
              var maxRetries = 50; // 5 seconds max wait time
              var checkFbq = function() {
                if (window.fbq && window.fbq.loaded) {
                  window.fbq('init', '${metaPixelId}');
                  window.fbq('track', 'PageView');
                  window.fbPixelReady = true;
                } else if (retryCount < maxRetries) {
                  retryCount++;
                  setTimeout(checkFbq, 100);
                } else {
                  // Script failed to load (likely blocked by ad blocker)
                  console.warn('Facebook Pixel script did not load within timeout period');
                  window.fbPixelReady = false;
                }
              };
              
              // Start checking
              setTimeout(checkFbq, 100);
              
            } catch (err) {
              console.error('Facebook pixel initialization error:', err);
              window.fbPixelReady = false;
            }
          })();
        `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height='1'
              width='1'
              style={{ display: 'none' }}
              src='https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1'
              alt=''
            />
          </noscript>
        </>
      )}

      {/* ——— Google tag (gtag.js) ——— */}
      {trackingEnabled && googleAdsId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`} strategy='afterInteractive' />
          {googleAnalyticsId && (
            <Script id='google-analytics' strategy='afterInteractive'>
              {`
                try {
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${googleAnalyticsId}');
                } catch (err) {
                  console.error('Google Analytics init error:', err);
                }
              `}
            </Script>
          )}
          <Script id='gtag-config' strategy='afterInteractive'>
            {`
              try {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAdsId}');
              } catch (err) {
                console.error('Google Ads init error:', err);
              }
            `}
          </Script>
        </>
      )}

      {/* ——— Google Tag Manager ——— */}
      {trackingEnabled && gtmId && (
        <Script id='gtm-script' strategy='afterInteractive'>
          {`
            try {
              (function(w,d,s,l,i){
                w[l]=w[l]||[]; w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
                j.async=true; j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            } catch (err) {
              console.error('GTM init error:', err);
            }
          `}
        </Script>
      )}

      {/* ——— Reddit Pixel ——— */}
      {trackingEnabled && redditPixelId && (
        <Script id='reddit-pixel' strategy='afterInteractive'>
          {`
            try {
              !function(w,d){
                if(!w.rdt){
                  var p=w.rdt=function(){
                    p.sendEvent?
                      p.sendEvent.apply(p,arguments):
                      p.callQueue.push(arguments)
                  };
                  p.callQueue=[];
                  var t=d.createElement("script");
                  t.src="https://www.redditstatic.com/ads/pixel.js";
                  t.async=!0;
                  var s=d.getElementsByTagName("script")[0];
                  s.parentNode.insertBefore(t,s);
                }
              }(window,document);
              rdt('init','${redditPixelId}');
              rdt('track','PageVisit');
            } catch (err) {
              console.error('Reddit Pixel init error:', err);
            }
          `}
        </Script>
      )}

      {/* ——— TikTok Pixel ——— */}
      {trackingEnabled && tiktokPixelId && (
        <Script id='tiktok-pixel' strategy='afterInteractive'>
          {`
            try {
              !function (w, d, t) {
                w.ttq = w.ttq || [];
                w.ttq.push({
                  'ttq.load': '${tiktokPixelId}'
                });
                var s = d.createElement(t);
                s.src = 'https://analytics.tiktok.com/i18n/pixel/sdk.js?s=${tiktokPixelId}';
                s.async = true;
                var e = d.getElementsByTagName(t)[0];
                e.parentNode.insertBefore(s, e);
              }(window, document, 'script');
            } catch (err) {
              console.error('TikTok Pixel init error:', err);
            }
          `}
        </Script>
      )}

      {/* ——— Microsoft UET Tag ——— */}
      {trackingEnabled && microsoftUetId && (
        <>
          {/* Microsoft's Official UET Tag Code - Exact format for extension detection */}
          <Script
            id='microsoft-uet'
            strategy='afterInteractive'
            dangerouslySetInnerHTML={{
              __html: `
          (function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${microsoftUetId}"};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","https://bat.bing.com/bat.js","uetq");
          `,
            }}
          />

          {/* Initialize UET queue immediately for extension detection */}
          <Script id='microsoft-uet-init' strategy='afterInteractive'>
            {`
          (function(){
            window.uetq = window.uetq || [];
            // Ensure init is called for extension detection
            if (typeof window.uetq.push === 'function') {
              var hasInit = false;
              for (var i = 0; i < window.uetq.length; i += 2) {
                if (window.uetq[i] === 'init' && window.uetq[i + 1] === '${microsoftUetId}') {
                  hasInit = true;
                  break;
                }
              }
              if (!hasInit) {
                window.uetq.push('init', '${microsoftUetId}');
              }
              window.uetq.push('track', 'PageView');
            }
          })();
        `}
          </Script>

          {/* ——— Microsoft UET Consent Mode ——— */}
          <Script id='microsoft-uet-consent' strategy='afterInteractive'>
            {`
            try {
              // Initialize UET queue if not already done
              window.uetq = window.uetq || [];
              
              // Grant all consent by default - no consent banner required
              window.uetq.push('consent', 'default', {
                'ad_storage': 'granted',
                'analytics_storage': 'granted',
                'functionality_storage': 'granted',
                'personalization_storage': 'granted',
                'security_storage': 'granted'
              });
              
              // Explicitly update to granted to ensure tracking works
              window.uetq.push('consent', 'update', {
                'ad_storage': 'granted',
                'analytics_storage': 'granted',
                'functionality_storage': 'granted',
                'personalization_storage': 'granted',
                'security_storage': 'granted'
              });              
            } catch (err) {
              console.error('Microsoft UET consent init error:', err);
            }            
          `}
          </Script>
        </>
      )}

      {/* ——— Hotjar Tracking ——— */}
      {trackingEnabled && hotjarId && (
        <Script id='hotjar-tracking' strategy='afterInteractive'>
          {`
            try {
              const hotjarSiteId = '${hotjarId}';
              // Hotjar tracking code - Base initialization only
              // Detailed tracking is handled by HotjarTracker component
              (function (c, s, q, u, a, r, e) {
                c.hj=c.hj||function(){(c.hj.q=c.hj.q||[]).push(arguments)};
                c._hjSettings = { hjid: a };
                r = s.getElementsByTagName('head')[0];
                e = s.createElement('script');
                e.async = true;
                e.src = q + c._hjSettings.hjid + u;
                r.appendChild(e);
              })(window, document, 'https://static.hj.contentsquare.net/c/csq-', '.js', hotjarSiteId);
              
            } catch (err) {
              console.error('Hotjar tracking initialization error:', err);
            }
          `}
        </Script>
      )}

      {/* ——— CallRail Number Swapping ——— */}
      {trackingEnabled && callrailId && (
        <Script src={`//cdn.callrail.com/companies/${callrailId}/swap.js`} strategy='afterInteractive' />
      )}

      {/* GTM noscript fallback */}
      {trackingEnabled && gtmId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height='0'
            width='0'
            style={{ display: 'none', visibility: 'hidden' }}
            title='GTM'
          />
        </noscript>
      )}

      {/* Viewport height fix for mobile browsers (address bar, navigation bar) */}
      <Script id='viewport-height-fix' strategy='afterInteractive'>
        {`
          (function() {
            function setViewportHeight() {
              const vh = window.innerHeight * 0.01;
              document.documentElement.style.setProperty('--vh', vh + 'px');
            }
            
            setViewportHeight();
            window.addEventListener('resize', setViewportHeight);
            window.addEventListener('orientationchange', setViewportHeight);
          })();
        `}
      </Script>
    </>
  );
}
