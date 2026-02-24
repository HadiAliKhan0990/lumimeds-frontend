import { AppointmentsIcon } from '@/components/Icon/AppointmentsIcon';
import ApprovedIcon from '@/components/Icon/ApprovedIcon';
import { CalendarPlusIcon } from '@/components/Icon/CalendarPlusIcon';
import { ChatIcon } from '@/components/Icon/ChatIcon';
import { CurrencyIcon } from '@/components/Icon/CurrencyIcon';
import { FormIcon } from '@/components/Icon/FormIcon';
import { HospitalIcon } from '@/components/Icon/HospitalIcon';
import { InjectionBoldIcon } from '@/components/Icon/InjectionBoldIcon';
import { NotesClipboardIcon } from '@/components/Icon/NotesClipboardIcon';
import { UserFeedbackIcon } from '@/components/Icon/UserFeedbackIcon';
import { VisitsIcon } from '@/components/Icon/VisitsIcon';
import { ROUTES } from '@/constants';
import { AiOutlineBars } from 'react-icons/ai';
import { BiSolidChat } from 'react-icons/bi';
import { CiBellOn } from 'react-icons/ci';
import { FaUsers } from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { VscAccount } from 'react-icons/vsc';
import { MdLogout } from 'react-icons/md';
import { DashboardIcon } from '@/components/Icon/DashboardIcon';

export const ADMIN_SIDEBAR_ITEMS = [
  {
    icon: <DashboardIcon size={24} />,
    title: 'Dashboard',
    route: ROUTES.ADMIN_HOME,
  },
  {
    icon: <CurrencyIcon size={24} />,
    title: 'Orders',
    route: ROUTES.ADMIN_ORDERS,
  },
  {
    icon: <UserFeedbackIcon size={24} />,
    title: 'Users',
    route: ROUTES.ADMIN_USERS,
  },
  {
    icon: <ChatIcon size={24} />,
    title: 'Messages',
    route: ROUTES.ADMIN_MESSAGES,
  },
  {
    icon: <FormIcon size={24} />,
    title: 'Forms',
    route: ROUTES.ADMIN_FORMS_SURVEYS,
  },
  {
    icon: <CalendarPlusIcon size={24} />,
    title: 'Appointments',
    route: ROUTES.ADMIN_APPOINTMENTS,
  },
  {
    icon: <NotesClipboardIcon size={24} />,
    title: 'Submissions',
    route: ROUTES.ADMIN_FORM_SUBMISSIONS,
  },

  {
    icon: <HospitalIcon size={24} />,
    title: 'Pharmacy',
    route: ROUTES.ADMIN_PHARMACY,
  },
  {
    icon: <InjectionBoldIcon size={24} />,
    title: 'Medications',
    route: ROUTES.ADMIN_MEDICATIONS,
  },
  {
    icon: <HiOutlineDocumentText size={24} />,
    title: 'Logs',
    route: ROUTES.ADMIN_LOGS,
  },
  {
    icon: <AiOutlineBars />,
    title: 'Settings',
    route: ROUTES.ADMIN_ACCOUNT,
  },
  {
    icon: <MdLogout size={24} />,
    title: 'Logout',
    route: '#logout',
    isLogout: true,
  },

  // {
  // 	icon: <FaVideo />,
  // 	title: "Video Calls",
  // 	route: ROUTES.ADMIN_VIDEO_CALLS,
  // },
  // {
  // 	icon: <BiBasket />,
  // 	title: "Sales",
  // 	route: ROUTES.ADMIN_SALES,
  // },
  // {
  // 	icon: <AiOutlineBars />,
  // 	title: "Legend",
  // 	route: ROUTES.ADMIN_LEGEND,
  // },
  // {
  // 	icon: <RiAccountPinCircleFill />,
  // 	title: "Account",
  // 	route: ROUTES.ADMIN_ACCOUNT,
  // },
];

export const DOCTOR_SIDEBAR_ITEMS = [
  {
    icon: <DashboardIcon size={24} />,
    title: 'Dashboard',
    route: ROUTES.PROVIDER_HOME,
  },
  {
    icon: <VisitsIcon size={'1em'} />,
    title: 'Pending',
    route: ROUTES.PROVIDER_PENDING_ENCOUNTERS,
  },
  // {
  //   icon: <VisitsIcon size={'1em'} />,
  //   title: 'Visits',
  //   route: ROUTES.DOCTOR_VISIT,
  // },
  // {
  //   icon: <LiaStethoscopeSolid />,
  //   title: 'Prescription',
  //   route: ROUTES.DOCTOR_PRESCRIPTION,
  // },
  // {
  //   icon: <LiaStethoscopeSolid />,
  //   title: 'Medications',
  //   route: ROUTES.DOCTOR_PRESCRIPTION,
  // },
  // {
  //   icon: <LiaStethoscopeSolid />,
  //   title: 'Diagnosis',
  //   route: ROUTES.DOCTOR_PRESCRIPTION,
  // },
  {
    icon: <AppointmentsIcon size={24} />,
    title: 'Appointments',
    route: ROUTES.PROVIDER_APPOINTMENTS,
  },
  {
    icon: <ApprovedIcon size={24} />,
    title: 'Approved',
    route: ROUTES.PROVIDER_APPROVED,
  },
  {
    icon: <FaUsers size={24} />,
    title: 'Patients',
    route: ROUTES.PROVIDER_VIEW_ALL_PATIENTS,
  },
  {
    icon: <BiSolidChat />,
    title: 'Chat',
    route: ROUTES.PROVIDER_MESSAGES,
  },
  {
    icon: <CiBellOn />,
    title: 'Notifications',
    route: ROUTES.PROVIDER_NOTIFICATIONS,
  },
  {
    icon: <VscAccount size={24} />,
    title: 'Profile',
    route: ROUTES.PROVIDER_PROFILE,
  },
  {
    icon: <MdLogout size={24} />,
    title: 'Logout',
    route: '#logout',
    isLogout: true,
  },
];

export const CHAT_ROLES = {
  provider: ['Patient', 'Admin'],
  patient: ['Provider', 'Admin'],
  admin: ['Patient', 'Provider'],
};

export const PATIENT_CHAT_STATUS = ['resolved', 'unresolved', 'unread'];
