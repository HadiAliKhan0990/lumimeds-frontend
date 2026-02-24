import { AlarmPlus } from '@/components/Icon/AlarmPlus';
import { CalendarMultipleCheck } from '@/components/Icon/CalendarMultipleCheck';
import { FaceAgent } from '@/components/Icon/FaceAgent';
import { ForumOutline } from '@/components/Icon/ForumOutline';
import { HospitalBoxOutline } from '@/components/Icon/HospitalBoxOutline';
import { MedicationOutline } from '@/components/Icon/MedicationOutline';
import { PaymentTerminal } from '@/components/Icon/PaymentTerminal';
import { TruckCheckOutline } from '@/components/Icon/TruckCheckOutline';

export const MONTH_TEXTS: Record<number, string> = {
  1: 'See and feel the difference in one month.',
  2: 'Set Yourself Up For Success',
  3: 'More Time = Greater Progress',
};

export const PLANS_ORDER = ['GLP-1 Injections', 'GLP-1/GIP Injections'];

export const PLAN_FEATURES = {
  '1 Month': ['1 vial x 12.5mg', 'One Time Purchase'],
  '2 Month': ['2 vial x 12.5mg', 'Full 2-Month Medication sent', 'Cost-effective, no recurring'],
  '3 Month': ['3 vial x 12.5mg', 'Full 3-Month Medication sent', 'More Savings, same flexibility'],
};

export const planDescMap: Record<string, string> = {
  Semaglutide: `Personalized GLP-1 therapy — made simple. Whether you're just getting started or managing a long-term dosing schedule, we offer flexible monthly and multi-month Semaglutide plans tailored to your health goals.`,
  Tirzepatide: `Support your weight management journey with flexible options tailored to your needs. Choose from our monthly or 3-month Tirzepatide plans, all backed by clinical care and delivered with convenience.`,
};

export const PLANS_BENEFITS = [
  {
    title: 'Free Refill Reminders',
    Icon: AlarmPlus,
  },
  {
    title: 'Care Team Access',
    Icon: FaceAgent,
  },
  {
    title: 'Telehealth inclusion',
    Icon: HospitalBoxOutline,
  },
  {
    title: 'Shipment tracking',
    Icon: TruckCheckOutline,
  },
];

export const ALL_PLANS_INCLUDE = [
  {
    title: 'Initial Telehealth Consult',
    Icon: PaymentTerminal,
  },
  {
    title: 'Real-Time Virtual Support',
    Icon: MedicationOutline,
  },
  {
    title: 'Prescription + Medication',
    Icon: ForumOutline,
  },
  {
    title: 'Remote Monthly Check-Ins',
    Icon: CalendarMultipleCheck,
  },
];


