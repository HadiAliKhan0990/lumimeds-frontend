import {withSentryConfig} from '@sentry/nextjs';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Gets allowed S3 hostnames from environment variable with fallback
 * @returns Array of allowed S3 hostnames
 */
function getAllowedS3Hostnames() {
  const envHostnames = process.env.NEXT_PUBLIC_ALLOWED_S3_HOSTNAMES;

  if (envHostnames) {
    // Parse comma-separated list and trim whitespace
    const hostnames = envHostnames
      .split(',')
      .map((host) => host.trim())
      .filter((host) => host.length > 0);

    if (hostnames.length > 0) {
      return hostnames;
    }
  }

  // Fallback to default hostnames if env var not set or empty
  return [];
}

// Build remote patterns dynamically from environment variable
const s3Hostnames = getAllowedS3Hostnames();
const remotePatterns = s3Hostnames.map((hostname) => ({
  protocol: 'https' as const,
  hostname,
  pathname: '/**' as const,
}));

const nextConfig: NextConfig = {
  // Disable source maps in production to reduce build size (Amplify)
  productionBrowserSourceMaps: false,
  
  images: {
    remotePatterns,
  },
  sassOptions: {
    quietDeps: true,
    includePaths: ['./src'],
  },
  async redirects() {
    return [
      { source: '/privacypolicy', destination: '/privacy-policy', permanent: true },
      { source: '/termsofuse', destination: '/terms-of-use', permanent: true },
      { source: '/memberterms', destination: '/terms-and-conditions', permanent: true },
      { source: '/products/glp_1_plans', destination: '/products/glp-1-plans', permanent: true },
      { source: '/products/glp_1_gip_plans', destination: '/products/glp-1-gip-plans', permanent: true },
      { source: '/products/nad_plans', destination: '/products/nad-plans', permanent: true },
      // 404 redirects
      { source: '/products/tzpt/summary', destination: '/products/glp-1-gip-plans', permanent: true },
      { source: '/products/0a6f022f-615d-4bda-b3fb-82d54e532c32', destination: '/products', permanent: true },
      { source: '/products/sglt-sublingual', destination: '/products/glp-1-plans', permanent: true },
      { source: '/products/sglt-sublingual/', destination: '/products/glp-1-plans', permanent: true },
      { source: '/statenotices', destination: '/products', permanent: true },
      { source: '/products/tzpt-sublingual', destination: '/products', permanent: true },
      { source: '/products/tzpt-sublingual/', destination: '/products', permanent: true },
      { source: '/newsletter', destination: '/', permanent: true },
      { source: '/newsletter/', destination: '/', permanent: true },
      { source: '/job.php', destination: '/job', permanent: true },
      { source: '/order', destination: '/products', permanent: true },
      { source: '/products/sglt-b12', destination: '/products', permanent: true },
      { source: '/products/sglt-b12/', destination: '/products', permanent: true },
      { source: '/ad/black-friday-sale', destination: '/', permanent: true },
      { source: '/ad/cyber-monday-sale', destination: '/', permanent: true },
      { source: '/ad/weight-loss-thanksgiving', destination: '/', permanent: true },
    ];
  },
};
export default withSentryConfig(withNextIntl(nextConfig), {
 // For all available options, see:
 // https://www.npmjs.com/package/@sentry/webpack-plugin#options

 org: "lumimeds-bw",

 project: "lumimeds-frontend",

 // Only print logs for uploading source maps in CI
 silent: !process.env.CI,

 // For all available options, see:
 // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

 // Upload a larger set of source maps for prettier stack traces (increases build time)
 widenClientFileUpload: true,

 // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
 // This can increase your server load as well as your hosting bill.
 // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
 // side errors will fail.
 // tunnelRoute: "/monitoring",

 // Automatically tree-shake Sentry logger statements to reduce bundle size
 disableLogger: true,

 // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
 // See the following for more information:
 // https://docs.sentry.io/product/crons/
 // https://vercel.com/docs/cron-jobs
 automaticVercelMonitors: true,
});