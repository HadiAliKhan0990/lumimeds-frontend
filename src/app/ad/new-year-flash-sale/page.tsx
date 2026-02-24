import NewYearFlashSalePage from '@/components/Ads/NewYearFlashSale';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import couponsData from '@/data/coupons.json';

export const revalidate = 0;

// The main flash sale coupon to check for page availability
const FLASH_SALE_COUPON = 'LumiFlash100';

interface CouponData {
  startTimePST?: string;
  endTimePST?: string;
  applyMode?: string;
  sales?: string[];
  rules: Array<{
    patientType: string;
    products: Array<{ key: string; name: string }>;
  }>;
}

/**
 * Converts a PST/PDT datetime string to a UTC Date object
 * Input format: "YYYY-MM-DDTHH:mm:ss" interpreted as America/Los_Angeles timezone
 */
function parsePSTTime(pstTimeString: string): Date {
  const [datePart, timePart] = pstTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = (timePart || '00:00:00').split(':').map(Number);

  // Create date string in ISO format with explicit timezone
  // We need to determine if DST is active for this specific date in LA
  const tempDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // noon UTC
  
  // Format this date in LA timezone to check if DST is active
  const laFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  });
  const formatted = laFormatter.format(tempDate);
  const isDST = formatted.includes('PDT');
  
  // PST = UTC-8, PDT = UTC-7
  const offsetHours = isDST ? 7 : 8;
  
  // Convert PST/PDT time to UTC by adding the offset
  return new Date(Date.UTC(year, month - 1, day, hour + offsetHours, minute, second || 0));
}

/**
 * Checks if a coupon is currently active (within start and end time)
 * @param overrideTime - If true, bypasses time checks (for testing)
 */
function isCouponActive(coupon: CouponData, overrideTime = false): boolean {
  if (overrideTime) return true;

  const now = new Date();

  if (coupon.startTimePST) {
    const startTime = parsePSTTime(coupon.startTimePST);
    if (now < startTime) return false;
  }

  if (coupon.endTimePST) {
    const endTime = parsePSTTime(coupon.endTimePST);
    if (now > endTime) return false;
  }

  return true;
}

/**
 * Checks if the flash sale is active based on LumiFlash100 timing
 * @param overrideTime - If true, bypasses time checks (for testing)
 */
function isFlashSaleActive(overrideTime = false): boolean {
  const allCoupons = couponsData.coupons as Record<string, CouponData>;
  const coupon = allCoupons[FLASH_SALE_COUPON];
  
  return coupon ? isCouponActive(coupon, overrideTime) : false;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'New Year Flash Sale | LumiMeds',
    description: 'New Year Flash Sale - Special offers and discounts.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/ad/new-year-flash-sale',
    },
    openGraph: {
      title: 'New Year Flash Sale | LumiMeds',
      description: 'New Year Flash Sale - Special offers and discounts.',
      type: 'website',
      url: 'https://www.lumimeds.com/ad/new-year-flash-sale',
    },
  };
}

interface PageProps {
  searchParams: Promise<{
    overrideTime?: string;
  }>;
}

export default async function Page({ searchParams }: Readonly<PageProps>) {
  const { overrideTime } = await searchParams;
  const shouldOverride = overrideTime === 'true';

  // Check if the flash sale coupon is active - redirect to home if not
  if (!isFlashSaleActive(shouldOverride)) {
    redirect('/');
  }

  return <NewYearFlashSalePage />;
}
