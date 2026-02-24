import { DatePresetKey, DatePresetOption, DatePresetRange } from '@/types/datePresets';
import { subDays } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const referenceNow = () => new Date();

const US_TIMEZONE = 'America/New_York';

const getUsDateParts = (date: Date) => ({
  year: Number(formatInTimeZone(date, US_TIMEZONE, 'yyyy')),
  month: Number(formatInTimeZone(date, US_TIMEZONE, 'MM')),
  day: Number(formatInTimeZone(date, US_TIMEZONE, 'dd')),
});

const buildUsMiddayUtc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day, 12));

const formatUsMiddayIso = (date: Date) => formatInTimeZone(date, US_TIMEZONE, 'yyyy-MM-dd');

const getTodayMidday = (baseDate: Date) => {
  const { year, month, day } = getUsDateParts(baseDate);
  return buildUsMiddayUtc(year, month, day);
};

export const ADMIN_ORDER_DATE_PRESET_OPTIONS: DatePresetOption[] = [
  { value: 'today', label: 'Today', description: "Shows only today's orders" },
  { value: 'yesterday', label: 'Yesterday', description: 'Shows orders created yesterday' },
  { value: 'last7Days', label: 'Last 7 Days', description: 'From today −7 days → today' },
  { value: 'last30Days', label: 'Last 30 Days', description: 'From today −30 days → today' },
  { value: 'thisMonth', label: 'This Month', description: 'From 1st of current month → today' },
  { value: 'lastMonth', label: 'Last Month', description: 'Entire previous month' },
  { value: 'custom', label: 'Custom Range', description: 'Opens a date picker for manual range selection' },
];

const getTodayRange = (now: Date): DatePresetRange => {
  const todayMidday = getTodayMidday(now);
  const todayStr = formatUsMiddayIso(todayMidday);
  return { startDate: todayStr, endDate: todayStr };
};

const getYesterdayRange = (now: Date): DatePresetRange => {
  const todayMidday = getTodayMidday(now);
  const yesterdayMidday = subDays(todayMidday, 1);
  const yesterdayStr = formatUsMiddayIso(yesterdayMidday);
  return { startDate: yesterdayStr, endDate: yesterdayStr };
};

const getLastNDaysRange = (now: Date, days: number): DatePresetRange => {
  const safeDays = Math.max(1, days);
  const endMidday = getTodayMidday(now);
  const startMidday = subDays(endMidday, safeDays);
  return { startDate: formatUsMiddayIso(startMidday), endDate: formatUsMiddayIso(endMidday) };
};

const getThisMonthRange = (now: Date): DatePresetRange => {
  const { year, month } = getUsDateParts(now);
  const startMidday = buildUsMiddayUtc(year, month, 1);
  const endMidday = getTodayMidday(now);
  return { startDate: formatUsMiddayIso(startMidday), endDate: formatUsMiddayIso(endMidday) };
};

const getLastMonthRange = (now: Date): DatePresetRange => {
  const { year, month } = getUsDateParts(now);
  const currentMonthStartMidday = buildUsMiddayUtc(year, month, 1);
  const lastMonthEndMidday = subDays(currentMonthStartMidday, 1);
  const { year: lastYear, month: lastMonth } = getUsDateParts(lastMonthEndMidday);
  const lastMonthStartMidday = buildUsMiddayUtc(lastYear, lastMonth, 1);
  return { startDate: formatUsMiddayIso(lastMonthStartMidday), endDate: formatUsMiddayIso(lastMonthEndMidday) };
};

export const getDatePresetRange = (preset: DatePresetKey, baseDate: Date = referenceNow()): DatePresetRange | null => {
  switch (preset) {
    case 'today':
      return getTodayRange(baseDate);
    case 'yesterday':
      return getYesterdayRange(baseDate);
    case 'last7Days':
      return getLastNDaysRange(baseDate, 7);
    case 'last30Days':
      return getLastNDaysRange(baseDate, 30);
    case 'thisMonth':
      return getThisMonthRange(baseDate);
    case 'lastMonth':
      return getLastMonthRange(baseDate);
    case 'custom':
    default:
      return null;
  }
};

export const findMatchingDatePreset = (
  startDateInput?: string | null,
  endDateInput?: string | null,
  baseDate: Date = referenceNow(),
): DatePresetKey | null => {
  if (!startDateInput || !endDateInput) return null;

  for (const option of ADMIN_ORDER_DATE_PRESET_OPTIONS) {
    if (option.value === 'custom') continue;
    const range = getDatePresetRange(option.value, baseDate);
    if (!range) continue;

    if (range.startDate === startDateInput && range.endDate === endDateInput) {
      return option.value;
    }
  }

  return null;
};

export const isDatePresetKey = (value: string | null | undefined): value is DatePresetKey => {
  if (!value) return false;
  return ADMIN_ORDER_DATE_PRESET_OPTIONS.some((option) => option.value === value);
};

export const formatDateToUsRangeString = (date: Date): string => {
  return formatInTimeZone(date, US_TIMEZONE, 'yyyy-MM-dd');
};
