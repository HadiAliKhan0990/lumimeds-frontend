'use client';

import Image from 'next/image';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';
import toast from 'react-hot-toast';
import { ChangeEvent, useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useFormik, FormikProvider, Field, ErrorMessage, FormikHelpers, FormikConfig } from 'formik';
import {
  PatientFormValues,
  olympiaValidationSchema,
  axtellValidationSchema,
  scriptRxValidationSchema,
  drugsCraftersValidationSchema,
  beakerValidationSchema,
  valiantValidationSchema,
  premierRxValidationSchema,
  cre8ValidationSchema,
  boothwynValidationSchema,
  firstChoiceValidationSchema,
  optiroxValidationSchema,
  DrugCrafterQuantitySize
} from '@/lib/schema/pharmacyPatient';
import {
  AxtellProduct,
  BeakerProduct,
  DrugCraftersProduct,
  PremierRxProduct,
  OlympiaProduct,
  OptiroxProduct,
  BoothwynProduct,
  FirstChoiceProduct,
  PharmacyDataPayload,
  PharmacyProductPayload,
  useGetDoctorsListQuery,
  useLazyGetDoctorsListQuery,
  useLazyGetPharmaciesListQuery,
  useSendPatientDataToPharmacyInFormDataMutation,
  useSendPatientDataToPharmacyMutation,
  ValliantProduct,
  EnumPrescriberType,
  Cre8Product,
  useGetDosageMappingQuery
} from '@/store/slices/pharmaciesApiSlice';
import {
  PrescriptionConfirmationModal
} from '@/components/Dashboard/admin/pharmacies/PatientForm/includes/PrescriptionConfirmationModal';
import { SelectDatepicker } from 'react-select-datepicker';
import { Spinner } from 'react-bootstrap';
import { Error as ApiError, OptionValue } from '@/lib/types';
import {
  ExistingPatientsModal
} from '@/components/Dashboard/admin/pharmacies/PatientForm/includes/ExistingPatientsModal';
import { OlympiaPharmacyItem } from '@/components/Dashboard/admin/pharmacies/PatientForm/includes/OlympiaPharmacyItem';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AsyncPaginate, LoadOptions } from 'react-select-async-paginate';
import { useGetSingleOrderQuery } from '@/store/slices/ordersApiSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { genderAbbreviation, PHARMACIES_ROUTES, PROVIDER_DEFAULT_CITY, ROUTES, genderFullForm } from '@/constants';
import { PatientProfile } from '@/components/Dashboard/admin/pharmacies/PatientProfile';
import { EnumRxType, PharmacyName, PublicPharmacy, DosageMapping } from '@/store/slices/adminPharmaciesSlice';
import { AxtellPharmacyItem } from '@/components/Dashboard/admin/pharmacies/PatientForm/includes/AxtellPharmacyItem';
import { SortState, setPharmacyType } from '@/store/slices/sortSlice';
import {
  extractApiErrors,
  convertDateFormat,
  createFormDataFromObject,
  cleanPhoneNumber,
  capitalizeFirst,
  removePlusSign,
  formatUSPhoneWithoutPlusOne
} from '@/lib/helper';
import { isAxiosError } from 'axios';
import { ExistingUser, useLazyGetExistingPatientsQuery } from '@/store/slices/usersApiSlice';
import { useMinDate } from '@/hooks/useMinDate';
import { DrugsCrafterPharmacyItem } from './includes/DrugsCrafterPharmacyItem';
import { PremierRxPharmacyItem } from './includes/PremierRxPharmacyItem';
import { Cre8PharmacyItem } from './includes/Cre8PharmacyItem';
import { OptiroxPharmacyItem } from './includes/OptiroxPharmacyItem';
import { pharmacyFileRequiredMap, shippingServiceRequiredMap, SCRIPT_RX_DIAGNOSIS_DEFAULT } from '@/constants/pharmacy';
import { ValliantPharmacyItem } from './includes/ValliantpharmacyItem';
import { BeakerPharmacyItem } from './includes/BeakerPharmacyItem';
import { BoothwynPharmacyItem } from './includes/BoothwynPharmacyItem';
import { FirstChoicePharmacyItem } from './includes/FirstChoicePharmacyItem';
import { ScriptRxPharmacyItem } from './includes/ScriptRxPharmacyItem';
import { calculatePremierRxTotalMl } from './includes/PremierRxPharmacyItem';
import { calculateCre8TotalMl } from './includes/Cre8PharmacyItem';
import { formatCre8Vials } from './includes/cre8Utils';
import { TabPanel } from '@/components/elements';
import { formatUSDate, parseDateString } from '@/helpers/dateFormatter';
import { useStates } from '@/hooks/useStates';
import { PHARMACY_NAMES } from '@/lib/pharmacyConstants';

type Additional = { page?: number };

interface Props {
  pharmacyId?: string;
  orderId?: string;
  showExistingPatientsModal: boolean;
}

export default function PatientForm({ pharmacyId, orderId, showExistingPatientsModal }: Readonly<Props>) {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const { stateOptions, nameToCode } = useStates();

  const [drugForms, setDrugForms] = useState<{ label: string; value: string }[]>([]);

  const [getPharmaciesList, { isFetching: isFetchingPharmacies }] = useLazyGetPharmaciesListQuery();

  useGetDoctorsListQuery({ page: 1, limit: 10, orderId });

  const {
    data: orderData,
    isFetching,
    isSuccess
  } = useGetSingleOrderQuery(orderId ?? '', {
    skip: !orderId,
    refetchOnMountOrArgChange: true
  });

  const { order, patient } = orderData || {};

  const [getDoctorsList, { isFetching: isLazyFetching }] = useLazyGetDoctorsListQuery();

  const [triggerGetExistingPatients, { isFetching: isFetchingChatUsers }] = useLazyGetExistingPatientsQuery();

  const [mutateAsync, { isLoading: isSendingPatientDataToPharmacy }] = useSendPatientDataToPharmacyMutation();

  const [sendPatientDataToPharmacyInFormData, { isLoading: isSendingPatientDataToPharmacyInFormData }] =
    useSendPatientDataToPharmacyInFormDataMutation();

  const [isPending, startTransition] = useTransition();

  const { data = [] } = useSelector((state: RootState) => state.doctors);

  const isLoading = isSendingPatientDataToPharmacy || isSendingPatientDataToPharmacyInFormData;

  const [showModal, setShowModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PublicPharmacy | null>(null);
  const [dosageMapping, setDosageMapping] = useState<DosageMapping | null>(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showPatientsModal, setShowPatientsModal] = useState(false);
  const [users, setUsers] = useState<ExistingUser[]>([]);
  const [usersMeta, setUsersMeta] = useState<SortState['meta']>({ page: 1, limit: 30 });
  const [selectedUser, setSelectedUser] = useState<ExistingUser>();
  const [isSameBillingAddress, setIsSameBillingAddress] = useState(false);

  const selectedPharmacyName = selectedPharmacy?.name?.toLowerCase() as PharmacyName;

  const eighteenYearsAgo = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  }, []);

  const minDate = useMinDate(100);

  const loadDoctors: LoadOptions<OptionValue, GroupBase<OptionValue>, Additional> = async (
    _search,
    _loadedOptions,
    { page = 1 }: Additional = { page: 1 }
  ) => {
    const defaultOptions = {
      options: [],
      hasMore: true,
      additional: { page: Number(page) + 1 }
    };
    try {
      const limit = 10;
      const response = await getDoctorsList({ page, limit, orderId }).unwrap();

      if (response.doctors) {
        const { page: resPage = 1, totalPages = 1 } = response.meta || {};

        const options = response.doctors.map((d) => ({
          value: d.id,
          label: `${d.firstName} ${d.lastName}`
        }));

        const hasMore = resPage < totalPages;

        return {
          options,
          hasMore,
          additional: { page: Number(page) + 1 }
        };
      }

      return defaultOptions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error?.message : 'An unknown error occurred';
      toast.error(errorMessage);
      return defaultOptions;
    }
  };

  const defaultPrescriber = useMemo(() => {
    return data.find((item) => item.default);
  }, [data]);

  const defaultLastVisit = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
  }, []);

  const forbiddenStates = selectedPharmacy?.forbiddenStates ?? [];

  const forbiddenStatesMaps = new Map(forbiddenStates.map((item) => [item, item]));

  const lookForForbiddenStates = (shippingState: string) => {
    if (shippingState) {
      const isShippingInForbiddenStates = forbiddenStatesMaps.has(shippingState);

      if (isShippingInForbiddenStates)
        toast.error(
          `Patient's shipping/billing address is in a forbidden state. Kindly select a different shipping/billing address.`
        );

      return isShippingInForbiddenStates;
    }
  };

  const defaultShippingService: Record<PharmacyName, { id: string | number; name: string } | null> = {
    axtell: null,
    'script rx': null,
    olympia: { id: 'saturday', name: 'saturday' },
    optiorx: null,
    'drug crafters': null,
    'premier rx': null,
    cre8: null,
    beaker: null,
    valiant: null,
    boothwyn: null,
    'first choice': null
  };

  const defaultDateWrittenDef: Record<PharmacyName, string> = {
    axtell: formatUSDate(new Date()),
    'script rx': formatUSDate(new Date()),
    olympia: '',
    optiorx: formatUSDate(new Date()),
    'drug crafters': formatUSDate(new Date()),
    'premier rx': formatUSDate(new Date()),
    cre8: formatUSDate(new Date()),
    beaker: formatUSDate(new Date()),
    valiant: formatUSDate(new Date()),
    boothwyn: formatUSDate(new Date()),
    'first choice': formatUSDate(new Date())
  };

  const patientshipppingAddress2Setter = (value: string): string => (selectedPharmacyName !== 'optiorx' ? value : '');

  // const isPremierRxSelected = selectedPharmacyName === 'premier rx';

  const prescribedDosage: number | '' = useMemo(() => {
    const dosage = Number(order?.prescriptionInstructions?.[0]?.dosage);
    return selectedPharmacyName === PHARMACY_NAMES.CRE8 && dosage === 6.67
      ? 6.25
      : dosage || '';
  }, [selectedPharmacyName, order]);

  const initialValues: PatientFormValues = useMemo(
    () => ({
      selectedPharmacyName: selectedPharmacyName ?? null,
      firstName: orderId ? capitalizeFirst(patient?.firstName ?? '') : '',
      lastName: orderId ? capitalizeFirst(patient?.lastName ?? '') : '',
      dob: orderId && patient?.dob ? parseDateString(patient.dob) : null,
      gender: orderId
        ? (genderAbbreviation[(patient?.gender as 'male' | 'female') ?? 'male'] as PatientFormValues['gender']) ?? 'M'
        : 'M',
      patientPhone: patient?.phone ? formatUSPhoneWithoutPlusOne(removePlusSign(patient?.phone ?? '')) : '',
      email: orderId ? patient?.email ?? '' : '',
      allergies: orderId ? patient?.medicalHistory?.allergies || 'NKDA' : '',
      medications: orderId ? patient?.medicalHistory?.medications || 'none' : '',

      patientBillingStreet: orderId ? patient?.address?.billingAddress?.street ?? '' : '',
      patientBillingStreet2: orderId ? patient?.address?.billingAddress?.street2 ?? '' : '',
      patientBillingCity: orderId ? patient?.address?.billingAddress?.city ?? '' : '',
      patientBillingState: orderId ? patient?.address?.billingAddress?.state ?? '' : '',
      patientBillingZip: orderId ? patient?.address?.billingAddress?.zip ?? '' : '',

      patientShippingStreet: orderId ? patient?.address?.shippingAddress?.street ?? '' : '',
      patientShippingStreet2: orderId
        ? patientshipppingAddress2Setter(patient?.address?.shippingAddress?.street2 ?? '')
        : '',
      patientShippingCity: orderId ? patient?.address?.shippingAddress?.city ?? '' : '',
      patientShippingState: orderId ? patient?.address?.shippingAddress?.state ?? '' : '',
      patientShippingZip: orderId ? patient?.address?.shippingAddress?.zip ?? '' : '',

      prescriber: defaultPrescriber?.id ?? '',
      doctorFirstName: capitalizeFirst(defaultPrescriber?.firstName ?? '') ?? '',
      doctorLastName: capitalizeFirst(defaultPrescriber?.lastName ?? '') ?? '',
      doctorAddress: defaultPrescriber?.address ?? '',
      doctorPhone: defaultPrescriber?.phone
        ? formatUSPhoneWithoutPlusOne(removePlusSign(defaultPrescriber?.phone ?? ''))
        : '',
      doctorDea: defaultPrescriber?.deaNumber ?? '',
      doctorNpi: defaultPrescriber?.npi ?? '',
      doctorState: defaultPrescriber?.state ?? '',
      doctorStateLicense: defaultPrescriber?.licenseNumber ? String(defaultPrescriber?.licenseNumber) : '',
      doctorEmail: defaultPrescriber?.email ?? '',
      doctorSpi: defaultPrescriber?.spi ?? '',
      doctorZipCode: Number(defaultPrescriber?.zipCode ?? 0),
      doctorType: selectedPharmacyName === 'optiorx' ? EnumPrescriberType.OD : undefined,
      doctorGroup: defaultPrescriber?.group ?? undefined,
      qty: orderId ? order?.quantity ?? undefined : undefined,
      drugName: '',
      instructions: selectedPharmacyName === 'olympia' ? 'Use as directed' : '',
      refills: 0,
      lastVisit: selectedPharmacyName === 'olympia' ? defaultLastVisit : null,

      // Axtell specific fields
      rxType: null,
      drugStrength: '',
      drugForm: '',
      lfProductId: 0,
      quantity: orderId ? order?.quantity ?? undefined : undefined,
      quantityUnits: '',
      directions: selectedPharmacyName === 'optiorx' || selectedPharmacyName == 'olympia' ? '' : 'Use as directed',
      dateWritten: defaultDateWrittenDef?.[selectedPharmacyName] ?? '',
      daysSupply: selectedPharmacyName === 'olympia' ? 0 : 30,
      rxNumber: '',
      diagnosis: selectedPharmacyName === 'script rx' ? SCRIPT_RX_DIAGNOSIS_DEFAULT : undefined,

      // Olympia specific fields
      dosage: undefined,
      notes: undefined,

      pdfFile: null,
      shippingService: defaultShippingService[selectedPharmacyName] ?? null,

      vials: undefined,
      vialSize: '',

      orderType: undefined
    }),
    [selectedPharmacyName, orderId, patient, order, defaultPrescriber, defaultLastVisit]
  );

  const handleSubmit = async (values: PatientFormValues, { resetForm }: FormikHelpers<PatientFormValues>) => {
    try {
      if (lookForForbiddenStates(values.patientShippingState)) return;

      formik.setSubmitting(true);

      if (showModal && selectedPharmacy) {
        const datePrepareHandler = (date: Date | null | undefined) => {
          if (!date) return '';
          const d = new Date(date);

          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const dob = datePrepareHandler(values?.dob);

        const lastVisit = datePrepareHandler(values?.lastVisit);

        const rawDateValue = values?.dateWritten ?? '';
        const dateWrittenObj = rawDateValue ? new Date(rawDateValue) : null;

        if (dateWrittenObj && !isNaN(dateWrittenObj.getTime())) {
          dateWrittenObj.setHours(0, 0, 0, 0);
        }

        const usFormattedDateWritten =
          dateWrittenObj && !isNaN(dateWrittenObj.getTime()) ? formatUSDate(dateWrittenObj) : '';

        const formatedDateWritten = usFormattedDateWritten
          ? convertDateFormat({
            date: usFormattedDateWritten,
            fromFormat: 'MM/DD/YYYY',
            toFormat: 'YYYY-MM-DD'
          })
          : '';

        const url = PHARMACIES_ROUTES[selectedPharmacyName as keyof typeof PHARMACIES_ROUTES];

        const olympiaProduct: OlympiaProduct = {
          prodId: Number(values.selectedProduct?.prodId ?? '0'),
          prodName: values.selectedProduct?.prodName ?? '',
          qty: values.qty ?? 0,
          docNote: values.notes ?? '',
          sig: values.instructions ?? '',
          refills: values.refills ?? 0
        };

        const axtellProduct: AxtellProduct = {
          drugName: values?.selectedProduct?.prodName ?? '',
          drugStrength: values.drugStrength,
          refills: Number(values.refills ?? 0),
          dateWritten: formatedDateWritten,
          rxType: (values?.rxType?.toLowerCase() as EnumRxType) ?? '',
          drugForm: values.drugForm,
          lfProductId: values.lfProductId,
          quantity: String(values.quantity),
          quantityUnits: values.quantityUnits,
          directions: values.directions,
          daysSupply: values.daysSupply,
          docNotes: values?.instructions,
          ...(values.rxType === EnumRxType.REFILL && { rxNumber: values.rxNumber ?? '' }),
          ...(values.route && { route: values.route }) // Include route for Valiant (im or sq)
        };

        const scriptRxProduct: AxtellProduct = {
          ...axtellProduct,
          ...(values.diagnosis && { diagnosis: values.diagnosis })
        };

        const drugCraftersProduct: DrugCraftersProduct = {
          ...axtellProduct,
          vials: values.vials
            ? (values.vials as unknown as DrugCrafterQuantitySize)
            : DrugCrafterQuantitySize.TWENTY_ML
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { quantity: _, ...restAxtellProduct } = axtellProduct;

        // Format vials string: "No of Vials (1st) x Vial Size (1st), No of Vials (2nd) x Vial Size (2nd)"
        const formatPremierRxVials = (): string => {
          const parts: string[] = [];

          // First set: No of Vials (1st) x Vial Size (1st)
          if (values.quantity) {
            const vials1stValue = values.vials ? String(values.vials) : '';
            const noOfVials1st = vials1stValue && vials1stValue !== '' ? vials1stValue : '1';
            const vialSize1st = String(values.quantity);
            const units1st = values.quantityUnits || 'mL';
            parts.push(`${noOfVials1st} x ${vialSize1st}${units1st}`);
          }

          // Second set: No of Vials (2nd) x Vial Size (2nd)
          if (values.quantity2) {
            const vials2ndValue = values.vials2 ? String(values.vials2) : '';
            const noOfVials2nd = vials2ndValue && vials2ndValue !== '' ? vials2ndValue : '1';
            const vialSize2nd = String(values.quantity2);
            const units2nd = values.quantityUnits || 'mL';
            parts.push(`${noOfVials2nd} x ${vialSize2nd}${units2nd}`);
          }

          return parts.join(', ');
        };

        // Calculate total ml for quantity field
        const totalMl = values.quantity
          ? calculatePremierRxTotalMl(values.quantity, values.vials, values.quantity2, values.vials2)
          : 0;

        const premierRxProduct: PremierRxProduct = {
          ...restAxtellProduct,
          ...(values.quantity ? { vials: formatPremierRxVials() } : {}),
          ...(values.quantity ? { quantity: parseFloat(totalMl.toFixed(2)).toString() } : {}),
          ...(values.totalMg ? { totalMg: values.totalMg } : {})
        };

        // Calculate total ml for CRE8
        const cre8TotalMl = values.quantity
          ? calculateCre8TotalMl(
            values.quantity,
            values.vials,
            values.quantity2,
            values.vials2,
            values.quantity3,
            values.vials3
          )
          : 0;

        const cre8Product: Cre8Product = {
          ...restAxtellProduct,
          ...(values.quantity
            ? {
              vials: formatCre8Vials(
                values.quantity,
                values.vials,
                values.quantity2,
                values.vials2,
                values.quantity3,
                values.vials3,
                values.quantityUnits
              )
            }
            : {}),
          ...(values.quantity ? { quantity: parseFloat(cre8TotalMl.toFixed(2)).toString() } : {})
        };

        const optiorxProduct: OptiroxProduct = {
          rxQuantity: Number(values.quantity ?? 0),
          rxUnit: values.quantityUnits ?? '',
          refills: Number(values.refills ?? 0),
          directions: values?.directions ?? '',
          dateWritten: formatedDateWritten,
          item: values.selectedProduct?.prodName ?? '',
          daw: true,
          itemAlternateId: `${values.selectedProduct?.prodId ?? ''}`,
          drugStrength: values.drugStrength ?? ''
        };

        const valiantProduct: ValliantProduct = {
          ...axtellProduct
        };

        const beakerProduct: BeakerProduct = {
          ...axtellProduct
        };

        const boothwynProduct: BoothwynProduct = {
          drugName: values?.selectedProduct?.prodName ?? '',
          productId: `${values.selectedProduct?.prodId ?? ''}`,
          quantity: `${values.quantity ?? ''}`,
          quantityUnits: values.quantityUnits ?? '',
          directions: values.directions ?? '',
          notes: values.instructions ?? '',
          daysSupply: `${values.daysSupply ?? ''}`
        };

        const firstChoiceProduct: FirstChoiceProduct = {
          ...axtellProduct
        };

        const products: Record<
          PharmacyName,
          OlympiaProduct | AxtellProduct | DrugCraftersProduct | OptiroxProduct | BoothwynProduct | FirstChoiceProduct
        > = {
          olympia: olympiaProduct,
          axtell: axtellProduct,
          'script rx': scriptRxProduct,
          optiorx: optiorxProduct,
          'drug crafters': drugCraftersProduct,
          'premier rx': premierRxProduct,
          cre8: cre8Product,
          beaker: beakerProduct,
          valiant: valiantProduct,
          boothwyn: boothwynProduct,
          'first choice': firstChoiceProduct
        };

        if (url) {
          const payload: PharmacyDataPayload = {
            payload: {
              pharmacyId: selectedPharmacy?.id ?? '',
              ...((patient || selectedUser) && { patientId: selectedUser?.patientId ?? patient?.id ?? '' }),
              ...(order && { orderId: order.id ?? '' }),
              ...(shippingServiceRequiredMap?.[selectedPharmacyName as PharmacyName] && {
                shippingService:
                  selectedPharmacyName === 'olympia' || selectedPharmacyName === 'cre8'
                    ? values.shippingService?.name
                    : values.shippingService?.id ?? ''
              }),
              ...(pharmacyFileRequiredMap?.[selectedPharmacyName as PharmacyName] && { file: values.pdfFile }),
              ...(selectedPharmacyName === 'olympia' && { lastVisit: lastVisit ?? '' }),
              ...(selectedPharmacyName === 'boothwyn' && { orderType: (values?.orderType?.id as string) ?? '' }),
              ...(selectedPharmacyName === 'cre8' &&
                values.prescriptionId && { prescriptionId: values.prescriptionId }),
              patient: {
                allergies: values.allergies,
                medicationList: values.medications,
                firstName: values.firstName,
                lastName: values.lastName,
                dob,
                gender: selectedPharmacyName === 'optiorx' ? genderFullForm[values.gender] : values.gender,
                email: values.email,
                phone:
                  selectedPharmacyName === 'optiorx' ||
                  selectedPharmacyName === 'drug crafters' ||
                  selectedPharmacyName === 'premier rx' ||
                  selectedPharmacyName === 'cre8' ||
                  selectedPharmacyName === 'boothwyn'
                    ? removePlusSign(values.patientPhone)
                    : values.patientPhone,
                address: {
                  shippingAddress: {
                    street: values.patientShippingStreet,
                    ...(selectedPharmacyName !== 'optiorx' && { street2: values.patientShippingStreet2 }),
                    city: values.patientShippingCity,
                    state: nameToCode[values.patientShippingState] || values.patientShippingState,
                    zip: values.patientShippingZip
                  },
                  billingAddress: {
                    street: values.patientBillingStreet,
                    ...(selectedPharmacyName !== 'optiorx' && { street2: values.patientBillingStreet2 }),
                    city: values.patientBillingCity,
                    state: nameToCode[values.patientBillingState] || values.patientBillingState,
                    zip: values.patientBillingZip
                  }
                }
              },
              doctor: {
                firstName: values.doctorFirstName,
                lastName: values.doctorLastName,
                npi: values.doctorNpi ?? '',
                dea: values.doctorDea ?? '',
                phone:
                  selectedPharmacyName === 'drug crafters' ||
                  selectedPharmacyName === 'premier rx' ||
                  selectedPharmacyName === 'cre8' ||
                  selectedPharmacyName === 'boothwyn'
                    ? removePlusSign(values.doctorPhone)
                    : values.doctorPhone ?? '',
                email: values.doctorEmail,
                state: values.doctorState,
                stateLicense: `${values.doctorStateLicense ?? ''}`,
                fax: '',
                ...(selectedPharmacyName === 'optiorx' && {
                  city: PROVIDER_DEFAULT_CITY.split('_').join(' ').toLowerCase()
                }),
                ...(selectedPharmacyName === 'axtell' ||
                selectedPharmacyName === 'script rx' ||
                selectedPharmacyName === 'valiant' ||
                selectedPharmacyName === 'beaker' ||
                selectedPharmacyName === 'first choice'
                  ? { address1: values.doctorAddress, zip: `${values.doctorZipCode}` }
                  : selectedPharmacyName === 'drug crafters' ||
                  selectedPharmacyName === 'premier rx' ||
                  selectedPharmacyName === 'cre8' ||
                  selectedPharmacyName === 'boothwyn'
                    ? { zip: `${values.doctorZipCode}` }
                    : selectedPharmacyName === 'optiorx'
                      ? {
                        zip: `${values.doctorZipCode}`,
                        address: values.doctorAddress,
                        prescriberTypeText: values.doctorType
                      }
                      : {})
              },
              products: [
                {
                  ...(products?.[selectedPharmacyName] ?? {})
                }
              ] as PharmacyProductPayload
            },
            url
          };

          const apiHandler = async () => {
            if (pharmacyFileRequiredMap?.[selectedPharmacyName as PharmacyName]) {
              const { payload: payloadToSend } = payload;

              const { shippingService: shippingMethod, ...restPayLoad } = payloadToSend;

              const formData = createFormDataFromObject({
                ...restPayLoad,
                ...(selectedPharmacyName === 'drug crafters' ||
                selectedPharmacyName === 'optiorx' ||
                selectedPharmacyName === 'premier rx'
                  ? {}
                  : {
                    shippingMethod
                  }),
                patient: {
                  ...restPayLoad.patient,
                  phone: cleanPhoneNumber(restPayLoad?.patient?.phone ?? '')
                },
                doctor: {
                  ...restPayLoad.doctor,
                  phone: cleanPhoneNumber(restPayLoad?.doctor?.phone ?? '')
                }
              });

              return await sendPatientDataToPharmacyInFormData({ formData, url });
            }

            return await mutateAsync(payload);
          };

          const { error, data } = await apiHandler();
          if (error) {
            const { data } = error as ApiError;
            if (data.message.includes('{')) {
              toast.error(extractApiErrors(data.message)?.join(', ') || 'Error submitting prescription');
            } else {
              toast.error((error as ApiError).data.message);
            }
          } else {
            toast.success(data?.message ?? 'Prescription submitted successfully.');

            dispatch(setPharmacyType(selectedPharmacy?.id ?? ''));

            resetForm();
            setShowModal(false);
            startTransition(() => {
              // Preserve filter query params when redirecting back to Orders page
              const filterParams = new URLSearchParams();
              
              // Extract filter params from current URL (excluding pharmacyId and orderId)
              searchParams.forEach((value, key) => {
                if (key !== 'pharmacyId' && key !== 'orderId' && key !== 'showExistingPatientsModal') {
                  filterParams.append(key, value);
                }
              });
              
              const filterQueryString = filterParams.toString();
              const redirectUrl = filterQueryString 
                ? `${ROUTES.ADMIN_ORDERS}?${filterQueryString}`
                : ROUTES.ADMIN_ORDERS;
              
              push(redirectUrl);
            });
          }
        }
      } else {
        setShowModal(true);
      }
    } catch (error) {
      toast.error(isAxiosError(error) ? error.response?.data?.message : 'Error submitting prescription');
    } finally {
      formik.setSubmitting(false);
    }
  };

  const schema: Record<PharmacyName, FormikConfig<PatientFormValues>['validationSchema'] | undefined> = {
    axtell: axtellValidationSchema,
    'script rx': scriptRxValidationSchema,
    olympia: olympiaValidationSchema,
    'drug crafters': drugsCraftersValidationSchema,
    'premier rx': premierRxValidationSchema,
    cre8: cre8ValidationSchema,
    optiorx: optiroxValidationSchema,
    beaker: beakerValidationSchema,
    valiant: valiantValidationSchema,
    boothwyn: boothwynValidationSchema,
    'first choice': firstChoiceValidationSchema
  };

  const formik = useFormik({
    initialValues,
    validationSchema: schema[selectedPharmacyName],
    onSubmit: handleSubmit,
    enableReinitialize: !!orderId // Only reinitialize when orderId exists (editing order)
  });

  const {
    values,
    handleBlur,
    setFieldValue,
    isSubmitting,
    setFormikState,
    setTouched,
    validateForm,
    touched,
    errors,
    setFieldTouched
  } = formik;

  const handleChangeDate = useCallback(
    (date: Date | null, field: string) => {
      setFieldValue(field, date);
    },
    [setFieldValue]
  );

  function handlesameAsShippingAddress(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setFieldValue('patientShippingStreet', values.patientBillingStreet);
      setFieldValue('patientShippingStreet2', patientshipppingAddress2Setter(values.patientBillingStreet2));
      setFieldValue('patientShippingCity', values.patientBillingCity);
      setFieldValue('patientShippingState', values.patientBillingState);
      setFieldValue('patientShippingZip', values.patientBillingZip);
    } else {
      const shippingAddress = selectedUser ? selectedUser.address.shippingAddress : patient?.address?.shippingAddress;

      setFieldValue('patientShippingStreet', shippingAddress?.street ?? '');
      setFieldValue('patientShippingStreet2', patientshipppingAddress2Setter(shippingAddress?.street2 ?? ''));
      setFieldValue('patientShippingCity', shippingAddress?.city ?? '');
      setFieldValue('patientShippingState', shippingAddress?.state ?? '');
      setFieldValue('patientShippingZip', shippingAddress?.zip ?? '');
    }
    setTouched({});
    setIsSameBillingAddress(e.target.checked);
  }

  function handleChangePrescriber(option: unknown) {
    const { value } = option as OptionValue;
    setFieldValue('prescriber', value);

    const selectedDoctor = data.find((item) => item.id === value);
    setFieldValue('doctorFirstName', selectedDoctor?.firstName ?? '');
    setFieldValue('doctorLastName', selectedDoctor?.lastName ?? '');
    setFieldValue('doctorAddress', selectedDoctor?.address ?? '');
    setFieldValue('doctorDea', selectedDoctor?.deaNumber ?? '');
    setFieldValue('doctorNpi', selectedDoctor?.npi ?? '');
    setFieldValue('doctorState', selectedDoctor?.state ?? '');
    setFieldValue('doctorStateLicense', String(selectedDoctor?.licenseNumber ?? ''));
    setFieldValue('doctorEmail', selectedDoctor?.email ?? '');

    setFieldValue('doctorSpi', selectedDoctor?.spi ?? '');

    setFieldValue('doctorGroup', selectedDoctor?.group ?? undefined);

    setFieldValue('doctorZipCode', Number(selectedDoctor?.zipCode ?? 0));

    setFieldValue('doctorType', EnumPrescriberType.OD);

    setFieldValue(
      'doctorPhone',
      selectedDoctor?.phone ? formatUSPhoneWithoutPlusOne(removePlusSign(selectedDoctor?.phone ?? '')) : ''
    );

    setFieldTouched('prescriber', false);
    setFieldTouched('doctorFirstName', false);
    setFieldTouched('doctorLastName', false);
    setFieldTouched('doctorEmail', false);
    setFieldTouched('doctorPhone', false);
    setFieldTouched('doctorState', false);
    setFieldTouched('doctorStateLicense', false);
    setFieldTouched('doctorDea', false);
    setFieldTouched('doctorNpi', false);
    setFieldTouched('doctorSpi', false);
    setFieldTouched('doctorZipCode', false);
    setFieldTouched('doctorType', false);
    setFieldTouched('doctorGroup', false);
    setFieldTouched('doctorAddress', false);
  }

  async function handleClickSelectPatient() {
    try {
      const { page, limit, total, totalPages, patient } = await triggerGetExistingPatients({
        page: 1,
        limit: 30
      }).unwrap();

      setUsersMeta({ page, limit, total, totalPages });
      setUsers(patient || []);
      setShowPatientsModal(true);
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message || 'Error fetching existing patients'
          : (error as ApiError)?.data?.message || 'Error fetching existing patients'
      );
    }
  }

  function handleSelectPatient(patient: ExistingUser) {
    const {
      firstName,
      lastName,
      dob,
      address,
      gender,
      phoneNumber,
      email,
      medicalHistory: { allergies = 'NKDA', medications = 'none' }
    } = patient;

    setFormikState((state) => ({
      ...state,
      values: {
        ...state.values,
        firstName,
        lastName,
        gender: genderAbbreviation[gender as 'male' | 'female'] as PatientFormValues['gender'],
        patientPhone: phoneNumber ? formatUSPhoneWithoutPlusOne(removePlusSign(phoneNumber)) : '',
        email,
        dob: dob ? parseDateString(dob) : null,

        patientBillingStreet: address?.billingAddress?.street ?? '',
        patientBillingStreet2: address?.billingAddress?.street2 ?? '',
        patientBillingCity: address?.billingAddress?.city ?? '',
        patientBillingState: address?.billingAddress?.state ?? '',
        patientBillingZip: address?.billingAddress?.zip ?? '',

        patientShippingStreet: address?.shippingAddress?.street ?? '',
        patientShippingStreet2: address?.shippingAddress?.street2 ?? '',
        patientShippingCity: address?.shippingAddress?.city ?? '',
        patientShippingState: address?.shippingAddress?.state ?? '',
        patientShippingZip: address?.shippingAddress?.zip ?? '',
        allergies,
        medications
      }
    }));

    setSelectedUser(patient);
    setShowPatientsModal(false);
  }

  function handleValidation() {
    validateForm().then(() => {
      setTimeout(() => {
        // Find the first field that has an error and is touched
        for (const fieldName in errors) {
          if (errors[fieldName as keyof typeof errors] && touched[fieldName as keyof typeof touched]) {
            let fieldRef: HTMLElement | null = null;

            // Handle special cases for components that don't have name attributes
            if (fieldName === 'patientBillingState' || fieldName === 'patientShippingState') {
              fieldRef = document.querySelector<HTMLElement>(`[data-name="${fieldName}"]`);
            } else if (fieldName === 'prescriber') {
              fieldRef = document.querySelector<HTMLElement>('.async-paginate input');
            } else {
              fieldRef = document.querySelector<HTMLElement>(`[name="${fieldName}"]`);
            }

            if (fieldRef) {
              fieldRef.focus();
              toast.error(errors[fieldName as keyof typeof errors] ?? '');
              break;
            }
          }
        }
      }, 100);
    });
  }

  const pharmacySuccessCalbackHandler = (products: PublicPharmacy[]) => {
    const foundPharmacy = products.find((item) => item.id === pharmacyId);

    const maps: Record<string, string> = {};

    const foundPharmacyProducts = foundPharmacy?.products ?? [];

    foundPharmacyProducts?.forEach((item) => {
      if (item?.form) maps[item.form] = item.form;
    });

    const drugFormsPrepared = Object.values(maps).map((item) => ({ label: item, value: item }));

    setDrugForms(drugFormsPrepared ?? []);

    setSelectedPharmacy(foundPharmacy ?? null);

    setFieldValue('selectedPharmacyName', foundPharmacy?.name ?? '');
  };

  const prescriberDetails = useMemo(() => {
    return data.find((item) => item.id === values.prescriber);
  }, [values.prescriber]);

  const { data: dosageMappingData } = useGetDosageMappingQuery(
    {
      pharmacyId: selectedPharmacy?.id,
      medication: (order?.prescriptionInstructions?.[0]?.medication || '').toLowerCase(),
      planCode: ['', 'one_month', 'two_month', 'three_month'][order?.metaData?.intervalCount || 0],
      dosage: prescribedDosage
    },
    {
      skip:
        !orderId ||
        !isSuccess || // Wait for order query to succeed
        !order ||
        !selectedPharmacy?.id ||
        !order?.prescriptionInstructions?.[0]?.medication ||
        !prescribedDosage,
      refetchOnMountOrArgChange: true
    }
  );

  useEffect(() => {
    if (dosageMappingData?.data) {
      setDosageMapping(dosageMappingData.data);
    }
  }, [dosageMappingData]);

  const pharmacyItems = useMemo(
    () => ({
      olympia: (
        <OlympiaPharmacyItem
          products={selectedPharmacy?.products}
          shippingServices={selectedPharmacy?.shippingServices || []}
          dosageData={selectedPharmacy?.dosage}
          supplyDays={selectedPharmacy?.supplyDays}
          quantitites={selectedPharmacy?.quantity ?? []}
        />
      ),
      axtell: (
        <AxtellPharmacyItem
          products={selectedPharmacy?.products}
          drugForms={drugForms}
          shippingServices={selectedPharmacy?.shippingServices || []}
          dosageData={selectedPharmacy?.dosage}
          supplyDays={selectedPharmacy?.supplyDays}
          quantitites={selectedPharmacy?.quantity ?? []}
        />
      ),
      'script rx': (
        <ScriptRxPharmacyItem
          products={selectedPharmacy?.products}
          drugForms={drugForms}
          shippingServices={selectedPharmacy?.shippingServices || []}
          dosageData={selectedPharmacy?.dosage}
          supplyDays={selectedPharmacy?.supplyDays}
          quantitites={selectedPharmacy?.quantity ?? []}
        />
      ),
      'drug crafters': (
        <DrugsCrafterPharmacyItem
          products={selectedPharmacy?.pharmacyProducts}
          drugForms={drugForms}
          shippingServices={selectedPharmacy?.shippingServices || []}
          dosageData={selectedPharmacy?.dosage}
          supplyDays={selectedPharmacy?.supplyDays}
          quantitites={selectedPharmacy?.quantity ?? []}
          dosageMapping={dosageMapping}
        />
      ),
      'premier rx': (
        <PremierRxPharmacyItem
          products={selectedPharmacy?.pharmacyProducts}
          drugForms={drugForms}
          shippingServices={selectedPharmacy?.shippingServices || []}
          quantitites={selectedPharmacy?.quantity ?? []}
          dosageData={selectedPharmacy?.dosage}
          supplyDays={selectedPharmacy?.supplyDays}
          dosageMapping={dosageMapping}
        />
      ),
      cre8: (
        <Cre8PharmacyItem
          products={selectedPharmacy?.pharmacyProducts}
          drugForms={drugForms}
          shippingServices={selectedPharmacy?.shippingServices || []}
          quantitites={selectedPharmacy?.quantity ?? []}
          dosageData={selectedPharmacy?.dosage}
          supplyDays={selectedPharmacy?.supplyDays}
          dosageMapping={dosageMapping}
        />
      ),
      optiorx: (
        <OptiroxPharmacyItem
          products={selectedPharmacy?.products}
          shippingServices={selectedPharmacy?.shippingServices || []}
          dosageData={selectedPharmacy?.dosage}
          supplyDays={selectedPharmacy?.supplyDays}
          quantitites={selectedPharmacy?.quantity ?? []}
        />
      ),
      valiant: (
        <ValliantPharmacyItem
          drugForms={drugForms}
          products={selectedPharmacy?.products}
          shippingServices={selectedPharmacy?.shippingServices || []}
          dosageData={selectedPharmacy?.dosage}
          supplyDays={selectedPharmacy?.supplyDays}
          quantitites={selectedPharmacy?.quantity ?? []}
          order={orderData?.order}
          isOrderReady={isSuccess && !isFetching}
        />
      ),
      beaker: (
        <BeakerPharmacyItem
          drugForms={drugForms}
          products={selectedPharmacy?.products}
          shippingServices={selectedPharmacy?.shippingServices || []}
          dosageData={selectedPharmacy?.dosage}
          supplyDays={selectedPharmacy?.supplyDays}
          quantitites={selectedPharmacy?.quantity ?? []}
        />
      ),
      boothwyn: (
        <BoothwynPharmacyItem
          products={selectedPharmacy?.products}
          shippingServices={selectedPharmacy?.shippingServices || []}
          dosageData={selectedPharmacy?.dosage}
          supplyDays={selectedPharmacy?.supplyDays}
          quantitites={selectedPharmacy?.quantity ?? []}
        />
      ),
      'first choice': (
        <FirstChoicePharmacyItem
          products={selectedPharmacy?.products}
          drugForms={drugForms}
          shippingServices={selectedPharmacy?.shippingServices || []}
          dosageData={selectedPharmacy?.dosage}
          supplyDays={selectedPharmacy?.supplyDays}
          quantitites={selectedPharmacy?.quantity ?? []}
        />
      )
    }),
    [selectedPharmacy, drugForms, orderData, dosageMapping]
  );

  useEffect(() => {
    if (pharmacyId) {
      getPharmaciesList().unwrap().then(pharmacySuccessCalbackHandler);
    }
  }, [pharmacyId]);

  const patientProfileData = patient || selectedUser;

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <PrescriptionConfirmationModal
          onPdfGenerated={(pdfBlob) => setFieldValue('pdfFile', pdfBlob)}
          show={showModal}
          onHide={() => setShowModal(false)}
          values={values}
          isLoading={isLoading || isPending}
        />

        <ExistingPatientsModal
          show={showPatientsModal}
          setShow={setShowPatientsModal}
          setUsers={setUsers}
          users={users}
          setUsersMeta={setUsersMeta}
          usersMeta={usersMeta}
          onSelect={handleSelectPatient}
          pharmacyId={pharmacyId}
        />

        {patientProfileData && (
          <PatientProfile
            selectedPharmacyName={selectedPharmacyName}
            patient={patientProfileData}
            onClose={() => setShowPatientProfile(false)}
            open={showPatientProfile}
          />
        )}

        <div className="row gy-4 gy-md-0">
          {/* Patient Information */}

          <div className="col-12 position-relative">
            {patientProfileData && !showPatientProfile && (
              <button
                type="button"
                onClick={() => setShowPatientProfile(true)}
                className="patient-profile-sidebar-button position-absolute patient-profile-stick-button shadow"
              >
                Patient Profile
              </button>
            )}

            <div className="rounded-2 p-4 bg-cream-white">
              <div className="d-flex align-items-center gap-2 flex-wrap justify-content-between mb-3">
                <span className="fw-semibold">Patient Information</span>
                {showExistingPatientsModal && (
                  <button
                    disabled={isFetchingChatUsers}
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                    onClick={handleClickSelectPatient}
                  >
                    {isFetchingChatUsers && <Spinner size="sm" className="border-2" />}
                    Select Existing Patient
                  </button>
                )}
              </div>
              <div className="row gy-3">
                <div className="col-lg-6">
                  <label className="form-label">First Name</label>
                  <Field
                    id="firstName"
                    name="firstName"
                    placeholder="Enter first name"
                    className="form-control shadow-none"
                  />
                  <ErrorMessage name="firstName" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-6">
                  <label className="form-label">Last Name</label>
                  <Field
                    id="lastName"
                    name="lastName"
                    placeholder="Enter last name"
                    className="form-control shadow-none"
                  />
                  <ErrorMessage name="lastName" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-6">
                  <label className="form-label">Email</label>
                  <Field
                    id="email"
                    name="email"
                    placeholder="Enter email address"
                    className="form-control shadow-none"
                  />
                  <ErrorMessage name="email" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-6">
                  <label className="form-label">Phone</label>

                  <Field
                    id="patientPhone"
                    name="patientPhone"
                    placeholder="Enter phone number"
                    className="form-control shadow-none"
                    onBlur={handleBlur}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const formattedPhone = formatUSPhoneWithoutPlusOne(e.target.value);
                      setFieldValue('patientPhone', formattedPhone ?? '');
                      setFieldTouched('patientPhone', false);
                    }}
                  />

                  <ErrorMessage name="patientPhone" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-8">
                  <label className="form-label">Date of birth</label>
                  <SelectDatepicker
                    id="dob"
                    selectedDate={values.dob}
                    onDateChange={(date) => handleChangeDate(date, 'dob')}
                    hideLabels
                    maxDate={eighteenYearsAgo}
                    minDate={minDate}
                  />
                  <ErrorMessage name="dob" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-4">
                  <label className="form-label">Gender</label>
                  <Field id="gender" name="gender" className="form-select shadow-none" as="select">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </Field>
                  <ErrorMessage name="gender" className="invalid-feedback d-block" component={'div'} />
                </div>
              </div>
            </div>
          </div>

          {/* Patient Profile */}
          <div className="col-12">
            <div className="p-md-4">
              <p className="fw-semibold">Patient Profile</p>
              <div className="row gy-3">
                <div className="col-lg-5">
                  <label className="form-label">Allergies</label>
                  <Field
                    id="allergies"
                    name="allergies"
                    rows={4}
                    placeholder="Add allergies"
                    className="form-control shadow-none tw-resize-none"
                    as="textarea"
                  />
                  <ErrorMessage name="allergies" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-7">
                  <label className="form-label">Medications</label>
                  <Field
                    id="medications"
                    name="medications"
                    rows={4}
                    placeholder="Add medications"
                    className="form-control shadow-none tw-resize-none"
                    as="textarea"
                  />
                  <ErrorMessage name="medications" className="invalid-feedback d-block" component={'div'} />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="col-12">
            <div className="p-md-4">
              <p className="fw-semibold">Billing Address</p>
              <div className="row gy-3">
                <div className="col-12">
                  <label className="form-label">Address Line 1 (Primary address)</label>
                  <Field id="patientBillingStreet" name="patientBillingStreet" className="form-control shadow-none" />
                  <ErrorMessage name="patientBillingStreet" className="invalid-feedback d-block" component={'div'} />
                </div>
                {selectedPharmacyName !== 'optiorx' ? (
                  <div className="col-12">
                    <label className="form-label">Address Line 2 (Optional: building, floor, landmark, etc.)</label>
                    <Field
                      id="patientBillingStreet2"
                      name="patientBillingStreet2"
                      className="form-control shadow-none"
                    />
                    <ErrorMessage name="patientBillingStreet2" className="invalid-feedback d-block" component={'div'} />
                  </div>
                ) : null}

                <div className="col-12">
                  <label className="form-label">City</label>
                  <Field id="patientBillingCity" name="patientBillingCity" className="form-control shadow-none" />
                  <ErrorMessage name="patientBillingCity" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-6">
                  <label className="form-label">State</label>
                  <ReactSelect
                    id="patientBillingState"
                    name="patientBillingState"
                    onBlur={handleBlur}
                    options={stateOptions}
                    value={
                      values.patientBillingState
                        ? { value: values.patientBillingState, label: values.patientBillingState }
                        : null
                    }
                    onChange={(option) => {
                      const { value } = option as OptionValue;
                      setFieldValue('patientBillingState', value);
                    }}
                    isSearchable
                    placeholder={'Select State'}
                    styles={{
                      control: (baseStyles) => ({
                        ...baseStyles,
                        width: '100%',
                        borderRadius: '6px'
                      }),
                      singleValue: (baseStyles) => ({
                        ...baseStyles
                      }),
                      indicatorSeparator: () => ({
                        display: 'none'
                      })
                    }}
                    data-name="patientBillingState"
                  />
                  <ErrorMessage name="patientBillingState" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-6">
                  <label className="form-label">ZIP</label>
                  <Field id="patientBillingZip" name="patientBillingZip" className="form-control shadow-none" />
                  <ErrorMessage name="patientBillingZip" className="invalid-feedback d-block" component={'div'} />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="col-12">
            <div className="p-md-4">
              <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mb-3">
                <span className="fw-semibold">Shipping Address</span>
                <label htmlFor="same-address" className="d-flex align-items-center user-select-none gap-2">
                  <input
                    className={'c_checkbox'}
                    type="checkbox"
                    checked={isSameBillingAddress}
                    onChange={handlesameAsShippingAddress}
                    id="same-address"
                  />
                  <span className="text-sm">Same as Billing Address</span>
                </label>
              </div>
              <div className="row gy-3">
                <div className="col-12">
                  <label className="form-label">Address Line 1 (Primary address)</label>
                  <Field
                    disabled={isSameBillingAddress}
                    id="patientShippingStreet"
                    name="patientShippingStreet"
                    className="form-control shadow-none"
                  />
                  <ErrorMessage name="patientShippingStreet" className="invalid-feedback d-block" component={'div'} />
                </div>
                {selectedPharmacyName !== 'optiorx' ? (
                  <div className="col-12">
                    <label className="form-label">Address Line 2 (Optional: building, floor, landmark, etc.)</label>
                    <Field
                      disabled={isSameBillingAddress}
                      id="patientShippingStreet2"
                      name="patientShippingStreet2"
                      className="form-control shadow-none"
                    />
                    <ErrorMessage
                      name="patientShippingStreet2"
                      className="invalid-feedback d-block"
                      component={'div'}
                    />
                  </div>
                ) : null}

                <div className="col-12">
                  <label className="form-label">City</label>
                  <Field
                    disabled={isSameBillingAddress}
                    id="patientShippingCity"
                    name="patientShippingCity"
                    className="form-control shadow-none"
                  />
                  <ErrorMessage name="patientShippingCity" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-6">
                  <label className="form-label">State</label>
                  <ReactSelect
                    options={stateOptions}
                    value={
                      values.patientShippingState
                        ? { value: values.patientShippingState, label: values.patientShippingState }
                        : null
                    }
                    onChange={(option) => {
                      const { value } = option as OptionValue;
                      setFieldValue('patientShippingState', value);
                    }}
                    name="patientShippingState"
                    onBlur={handleBlur}
                    isSearchable
                    isDisabled={isSameBillingAddress}
                    placeholder={'Select State'}
                    classNames={{
                      control: () => 'w-100 rounded',
                      indicatorSeparator: () => 'd-none'
                    }}
                    data-name="patientShippingState"
                  />
                  <ErrorMessage name="patientShippingState" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-6">
                  <label className="form-label">ZIP</label>
                  <Field
                    disabled={isSameBillingAddress}
                    id="patientShippingZip"
                    name="patientShippingZip"
                    className="form-control shadow-none"
                  />
                  <ErrorMessage name="patientShippingZip" className="invalid-feedback d-block" component={'div'} />
                </div>
              </div>
            </div>
          </div>

          {/* Doctor */}
          <div className="col-12">
            <div className="p-md-4">
              <p className="text-lg fw-semibold">Prescriber</p>
              <div className="row g-4">
                <div className="col-12">
                  <AsyncPaginate
                    value={
                      values.prescriber
                        ? {
                          value: values.prescriber,
                          label: `${prescriberDetails?.firstName} ${prescriberDetails?.lastName}`
                        }
                        : null
                    }
                    isLoading={isLazyFetching}
                    loadOptions={loadDoctors}
                    onBlur={handleBlur}
                    additional={{ page: 1 }}
                    onChange={handleChangePrescriber}
                    isSearchable={false}
                    placeholder="Select Prescriber"
                    styles={{
                      control: (base) => ({ ...base, width: '100%', borderRadius: 6 }),
                      indicatorSeparator: () => ({ display: 'none' })
                    }}
                    className="async-paginate"
                  />
                  <ErrorMessage name="prescriber" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-4">
                  <label className="form-label">Prescriber First Name</label>
                  <Field
                    readOnly
                    disabled
                    id="doctorFirstName"
                    name="doctorFirstName"
                    className="form-control shadow-none"
                  />
                  <ErrorMessage name="doctorFirstName" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-4">
                  <label className="form-label">Prescriber Last Name</label>
                  <Field
                    readOnly
                    disabled
                    id="doctorLastName"
                    name="doctorLastName"
                    className="form-control shadow-none"
                  />
                  <ErrorMessage name="doctorLastName" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-4">
                  <label className="form-label">Prescriber Email Address</label>
                  <Field readOnly disabled id="doctorEmail" name="doctorEmail" className="form-control shadow-none" />
                  <ErrorMessage name="doctorEmail" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-4">
                  <label className="form-label">Prescriber Phone</label>

                  <Field
                    onBlur={handleBlur}
                    disabled
                    id="doctorPhone"
                    name="doctorPhone"
                    placeholder="Enter phone number"
                    className="form-control shadow-none"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const phone = e.target.value;

                      setFieldValue('doctorPhone', formatUSPhoneWithoutPlusOne(phone) ?? '');

                      setFieldTouched('doctorPhone', false);
                    }}
                  />

                  <ErrorMessage name="doctorPhone" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-4">
                  <label className="form-label">Prescriber Address</label>
                  <Field name="doctorAddress" className="form-control shadow-none" disabled readOnly />
                  <ErrorMessage name="doctorAddress" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-4">
                  <label className="form-label">Prescriber State</label>
                  <Field name="doctorState" className="form-control shadow-none" readOnly disabled />
                  <ErrorMessage name="doctorState" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-4">
                  <label className="form-label">Prescriber State License</label>
                  <Field name="doctorStateLicense" className="form-control shadow-none" readOnly disabled />
                  <ErrorMessage name="doctorStateLicense" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-4">
                  <label className="form-label">Prescriber DEA</label>
                  <Field id="doctorDea" name="doctorDea" className="form-control shadow-none" readOnly disabled />
                  <ErrorMessage name="doctorDea" className="invalid-feedback d-block" component={'div'} />
                </div>
                <div className="col-lg-4">
                  <label className="form-label">Prescriber NPI</label>
                  <Field id="doctorNpi" name="doctorNpi" className="form-control shadow-none" readOnly disabled />
                  <ErrorMessage name="doctorNpi" className="invalid-feedback d-block" component={'div'} />
                </div>

                {selectedPharmacyName === 'optiorx' && (
                  <div className="col-lg-4">
                    <label className="form-label">Prescriber Type</label>
                    <ReactSelect
                      options={
                        Object.values(EnumPrescriberType).map((type) => ({
                          label: type,
                          value: type
                        })) as OptionsOrGroups<unknown, GroupBase<unknown>>
                      }
                      value={values?.doctorType ? { label: values.doctorType, value: values.doctorType } : null}
                      onChange={(option) => {
                        const { value } = option as OptionValue;
                        setFieldValue('doctorType', value);
                      }}
                      onBlur={() => setFieldTouched('doctorType', true)}
                      classNames={{
                        control: () => 'w-100 rounded',
                        indicatorSeparator: () => 'd-none'
                      }}
                      name="doctorType"
                      isSearchable
                      placeholder={'Select Prescriber Type'}
                    />

                    {errors.doctorType && <div className="invalid-feedback d-block">{errors.doctorType}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Order */}

          {order && (
            // <div className='col-12'>
            //   <div className='p-md-4'>
            //     <p className='text-lg fw-semibold'>Select Order</p>

            //     <div className='row'>
            //       <div className='col-sm-8 col-md-6 col-lg-4 col-xl-3'>
            //         <OrderCard productImage={order?.productImage ?? ''} productName={order?.productName ?? ''} />
            //       </div>
            //     </div>
            //   </div>
            // </div>
            <div className="col-12">
              <p className="tw-text-lg tw-font-semibold md:tw-ml-6 tw-my-5">Select Order</p>
              <div className="tw-flex tw-items-center tw-gap-10 tw-flex-col md:tw-flex-row md:tw-ml-6">
                <div className="!tw-border !tw-border-solid !tw-border-[#C1CBDE] tw-rounded-lg tw-p-4 tw-pr-32">
                  <h3 className="tw-text-xl tw-font-bold tw-text-gray-900 tw-mb-4 tw-capitalize">
                    {order?.metaData?.category || 'Semaglutide'} Plans
                  </h3>

                  <div className="tw-flex tw-gap-3 tw-mb-4">
                    <span
                      className="tw-bg-gray-200 tw-text-gray-700 tw-font-semibold tw-border tw-border-gray-200 tw-px-3 tw-py-1 tw-rounded-md tw-text-xs">
                      {order?.metaData?.intervalCount && order?.metaData?.billingInterval
                        ? `${
                          ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][
                            order.metaData.intervalCount
                            ] || order.metaData.intervalCount
                        }-${
                          order.metaData.billingInterval.charAt(0).toUpperCase() +
                          order.metaData.billingInterval.slice(1)
                        } Plan`
                        : 'One-Month Plan'}
                    </span>
                    <span
                      className="tw-bg-blue-100 tw-border tw-border-solid tw-font-semibold tw-border-blue-400 tw-px-3 tw-py-1 tw-rounded-md tw-text-xs">
                      Ordered
                    </span>
                  </div>

                  <p className="tw-text-gray-500 tw-text-sm !tw-mb-0 tw-pb-14">
                    {order?.metaData?.planType === 'recurring' ? 'Auto-renewing subscription' : 'One-Month purchase'}
                  </p>
                </div>
                <div>
                  <Image src="/assets/svg/arrow-up.svg" alt="approved" width={55} height={55} />
                </div>
                <div className="!tw-border !tw-border-solid !tw-border-[#C1CBDE] tw-rounded-lg tw-p-4 tw-bg-[#F2F7FF]">
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <h3 className="tw-text-xl tw-font-bold tw-text-gray-900 tw-mb-4 tw-capitalize">
                      {order?.prescriptionInstructions?.[0]?.medication || ''} Plans
                    </h3>

                    <div
                      className="tw-bg-blue-400 tw-rounded-full tw-p-1 tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center">
                      <Image src="/assets/svg/double-tick.svg" alt="approved" width={20} height={20} />
                    </div>
                  </div>
                  {prescribedDosage !== undefined && (
                    <p className="tw-text-sm tw-mb-4">
                      Dosage: {prescribedDosage} mg
                      {order?.metaData?.medicineType === 'longevity' && order?.prescriptionInstructions?.[0]?.route && (
                        <span className="tw-ml-2">({order.prescriptionInstructions[0].route})</span>
                      )}
                    </p>
                  )}

                  <div className="tw-flex tw-gap-3 tw-mb-4">
                    <span
                      className="tw-bg-white tw-text-gray-700 tw-font-semibold tw-border tw-border-gray-200 tw-px-3 tw-py-1 tw-rounded-md tw-text-xs">
                      {order?.metaData?.intervalCount && order?.metaData?.billingInterval
                        ? `${
                          ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][
                            order.metaData.intervalCount
                            ] || order.metaData.intervalCount
                        }-${
                          order.metaData.billingInterval.charAt(0).toUpperCase() +
                          order.metaData.billingInterval.slice(1)
                        } Plan`
                        : 'One-Month Plan'}
                    </span>
                    <span
                      className="tw-bg-green-100 tw-border tw-border-solid tw-font-semibold tw-border-green-400 tw-px-3 tw-py-1 tw-rounded-md tw-text-xs">
                      Approved
                    </span>
                  </div>
                  <p className="tw-text-gray-500 tw-text-sm tw-max-w-80">
                    <span className="tw-font-bold">Notes for Staff:</span>{' '}
                    {order?.prescriptionInstructions?.[0]?.notesToStaff || ''}
                  </p>
                  <p className="tw-text-sm !tw-mb-0">
                    <span className="tw-font-semibold">Prescribed by</span>{' '}
                    {order?.provider ? `${order.provider.firstName} ${order.provider.lastName}` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* RxClaim */}

          {isFetchingPharmacies && (
            <div className="d-flex align-items-center justify-content-center">
              <Spinner className="border-2" />
            </div>
          )}

          {selectedPharmacy && (
            <div className="col-12">
              <div className="p-md-4">
                <div
                  className="tw-capitalize tw-text-primary tw-text-sm tw-font-bold tw-py-2 tw-px-4 tw-border-b-2 tw-inline-block tw-border-solid tw-border-primary">
                  {selectedPharmacy.name}
                </div>
                <p className="text-lg fw-semibold tw-mt-6">RXClaim Details</p>
                <div className="mt-4">
                  <TabPanel key={selectedPharmacyName} index={selectedPharmacyName} value={selectedPharmacyName}>
                    {pharmacyItems[selectedPharmacyName]}
                  </TabPanel>
                </div>
              </div>
            </div>
          )}

          <div className="text-end">
            <button
              type="submit"
              className="btn btn-primary px-3"
              disabled={isSubmitting || isFetching || isPending}
              onClick={handleValidation}
            >
              Review & Submit
            </button>
          </div>
        </div>
      </form>
    </FormikProvider>
  );
}
