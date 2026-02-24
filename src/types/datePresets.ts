export type DatePresetKey = 'today' | 'yesterday' | 'last7Days' | 'last30Days' | 'thisMonth' | 'lastMonth' | 'custom';

export interface DatePresetOption {
  value: DatePresetKey;
  label: string;
  description?: string;
}

export interface DatePresetRange {
  startDate: string;
  endDate: string;
}
