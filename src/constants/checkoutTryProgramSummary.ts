import MedicationIcon from '@/components/Icon/MedicationIcon';
import { PatientPortalAcessIcon } from '@/components/Icon/PatientPortalAcessIcon';
import { InitialTeleHealtConsultIcon } from '@/components/Icon/InitialTeleHealtConsultIcon';
import { PriorityShippingIcon } from '@/components/Icon/PriorityShippingIcon';

export const PROGRAM_SUMMARY_ITEMS = [
  {
    id: 'telehealth-consult',
    icon: InitialTeleHealtConsultIcon,
    label: 'Initial Telehealth \nConsult - $0',
  },
  {
    id: 'physician-support',
    icon: PriorityShippingIcon,
    label: 'Priority shipping from \na U.S. pharmacy - $0',
  },
  {
    id: 'prescription-medication',
    icon: MedicationIcon,
    label: 'All 12 doses \nof medication - $399',
  },
  {
    id: 'monthly-checkins',
    icon: PatientPortalAcessIcon,
    label: 'Patient Portal \nAccess (Optional) - $0',
  },
];
