'use client';

import productsCategories from '@/data/drugCategories.json';
import { findWordIgnoreCase } from '@/lib/helper';
import { PatientFormValues, DrugCrafterQuantitySize, PremierRxQuantitySize } from '@/lib/schema/pharmacyPatient';
import { OptionValue } from '@/lib/types';
import { DosageMapping, EnumRxType, PharmacyName, PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { useFormikContext } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { GroupBase, OptionsOrGroups } from 'react-select';
import { rxTypeIncludedPharmacyMap, DRUGS_DOSAGES } from '@/constants/pharmacy';
import { PharmacyClinicalNotes, PharmacyNotes, useLazyGetPharmacyNotesQuery } from '@/store/slices/pharmaciesApiSlice';
import { useSearchParams } from 'next/navigation';
import { formatUSDate } from '@/helpers/dateFormatter';

interface Props {
  products: PharmacyProduct[];
  shippingServices: Array<{ id: number; name: string }>;
  prodValOptKey?: keyof PharmacyProduct;
  dosageData?: {
    semaglutide: number[];
    tirzepatide: number[];
    nad: {
      im: number[];
      sq: number[];
    };
  } | null;
  supplyDays?: number[] | null;
  dosageMapping?: DosageMapping | null;
  onFetchPharmacyNotesSuccess?: (pharmacyNotes: PharmacyNotes) => void;
}

export const usePharmacyFieldsLogic = ({
                                         products,
                                         shippingServices,
                                         prodValOptKey = 'prodId',
                                         dosageData,
                                         dosageMapping,
                                         supplyDays,
                                         onFetchPharmacyNotesSuccess
                                       }: Props) => {
  const { values, setFieldValue } = useFormikContext<PatientFormValues>();

  const [showClinicalDifferenceStatement, setShowClinicalDifferenceStatement] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<PharmacyClinicalNotes[]>([]);

  const [choosenCategories, setChoosenCategories] = useState<PharmacyClinicalNotes[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<PharmacyProduct | null>(null);

  const [fetchPharmacyNotesCount, setFetchPharmacyNotesCount] = useState(0);

  const searchParams = useSearchParams();
  const pharmacyId = searchParams.get('pharmacyId');

  const [triggerGetPharmacyNotes, { data: pharmacyNotesData, isFetching: isFetchingPharmacyNotes }] =
    useLazyGetPharmacyNotesQuery();

  const PRODUCTS_OPTIONS: OptionsOrGroups<unknown, GroupBase<unknown>> = products.map((item) => ({
    label: item?.prodName,
    value: item[prodValOptKey]
  }));

  const SHIPPING_OPTIONS = shippingServices.map((service) => ({
    label: service.name,
    value: `${service.id}`
  }));

  const selectedPharmacyName = values?.selectedPharmacyName;

  const quantitySizesDrugCrafters = Object.values(DrugCrafterQuantitySize).map((item) => ({
    label: `${item} ${values?.quantityUnits ? values?.quantityUnits : ''}`,
    value: item
  }));

  const quantitySizesPremierRx = Object.values(PremierRxQuantitySize).map((item) => ({
    label: `${item} ${values?.quantityUnits ? values?.quantityUnits : ''}`,
    value: item
  }));

  const isDrugCraftersOrOlympiaSelected =
    selectedPharmacyName === 'drug crafters' || selectedPharmacyName === 'olympia';

  const isPremierRxSelected = selectedPharmacyName === 'premier rx' || selectedPharmacyName === 'cre8';
  const isAutoPopulatePharmacy = ['drug crafters', 'premier rx', 'cre8'].includes(selectedPharmacyName || '');

  function handleChangeDrug({ option, fieldName }: { option: unknown; fieldName: string }) {
    const { value } = option as OptionValue;

    setFieldValue(fieldName, value);
    const prod = products.find((item) => item[prodValOptKey] === value);

    setFieldValue('selectedProduct', prod);
    setSelectedProduct(prod || null);
  }

  const dosages = useMemo(() => {
    // Use API data if available, otherwise fallback to constants
    const dosageOptions = dosageData || DRUGS_DOSAGES;

    // Get concentration for product to calculate mL
    const concentration = selectedProduct?.concentration;
    const concentrationValue = parseFloat(String(concentration)) || 0;

    // Helper to format dosage label with mL and units
    const formatDosageLabel = (dos: number) => {
      const isValiant = selectedPharmacyName?.toLowerCase() === 'valiant';
      if (isValiant && concentrationValue > 0) {
        const mlValue = (dos / concentrationValue).toFixed(2);
        return `${dos} mg (${mlValue} mL / ${dos} units)`;
      }
      return `${dos} mg`;
    };

    if (selectedProduct?.prodName?.toLowerCase().includes('semaglutide')) {
      return dosageOptions.semaglutide.map((dos) => ({ label: formatDosageLabel(dos), value: dos }));
    } else if (selectedProduct?.prodName?.toLowerCase().includes('tirzepatide')) {
      return dosageOptions.tirzepatide.map((dos) => ({ label: formatDosageLabel(dos), value: dos }));
    } else if (selectedProduct?.prodName?.toLowerCase().includes('nad')) {
      // For NAD, filter by route (im or sq)
      const route = values.route || 'sq'; // Default to 'sq' if not set
      
      // IM route is disabled - don't show dosages for it
      if (route.toLowerCase() === 'im') {
        return [];
      }
      
      const nadDosages = typeof dosageOptions.nad === 'object' && 'sq' in dosageOptions.nad
        ? dosageOptions.nad[route as 'im' | 'sq']
        : [];

      return nadDosages.map((dos) => ({ label: formatDosageLabel(dos), value: dos }));
    }

    return [];
  }, [selectedProduct, dosageData, values, selectedPharmacyName]);

  const daysSupplyOptions = useMemo(() => {
    // Use API data if available, otherwise fallback to constants
    const options = supplyDays || [30, 60, 90];
    return options.map((days) => ({ label: `${days}`, value: days }));
  }, [supplyDays]);

  const prepareClinicalDifferenceStatement = () => {
    if (selectedPharmacyName) {
      const preparedNotes = choosenCategories
        .sort((a, b) => a.id - b.id)
        .map((item) => `• ${item.note}`)
        .join('\n');

      return preparedNotes;
    }

    return '';
  };

  const foundDrugName = (foundProduct: PharmacyProduct) => {
    const foundDrugName = findWordIgnoreCase(foundProduct?.prodName ?? '', ['semaglutide', 'tirzepatide', 'nad']);

    return foundDrugName;
  };

  const notesAutoAppendHandler = () => {
    const clinicalDifferenceStatement = prepareClinicalDifferenceStatement();

    const generalNotes = pharmacyNotesData?.generalNotes?.length
      ? pharmacyNotesData.generalNotes.map((note) => `• ${note}`).join('\n')
      : '';

    return {
      clinicalDifferenceStatement: clinicalDifferenceStatement || '',
      notes: generalNotes
    };
  };

  const configsOnDrugChange = (directionsKey?: string) => {
    const foundProduct = products.find((item) => item[prodValOptKey] === values.drugName);
    if (foundProduct) {
      const quantityUnits = foundProduct?.quantityUnits ?? '';
      if (selectedPharmacyName !== 'boothwyn') setFieldValue('quantityUnits', quantityUnits);
      setFieldValue('rxUnit', quantityUnits);
      setFieldValue('lfProductId', (foundProduct?.prodId || foundProduct?.externalProdId) ?? '');
      setFieldValue('drugForm', foundProduct?.form ?? '');
      setFieldValue('selectedProduct', foundProduct);
      setSelectedProduct(foundProduct);
      setChoosenCategories([]);
      setFieldValue('drugStrength', (dosageMapping?.dosage) ?? '');
      setShowClinicalDifferenceStatement(false);
      setFieldValue(directionsKey ?? 'directions', '');
      if (isAutoPopulatePharmacy) {
          // todo: It should be dynamic not hard coded
          setFieldValue('quantity', parseFloat(dosageMapping?.products[0]?.vial?.size ?? '0') ?? 0);
          setFieldValue('vials', parseFloat(dosageMapping?.products[0]?.qty ?? '0') ?? 0);
          setFieldValue('quantity2', parseFloat(dosageMapping?.products[1]?.vial?.size ?? '0') ?? 0);
          setFieldValue('vials2', parseFloat(dosageMapping?.products[1]?.qty ?? '0') ?? 0);
          setFieldValue('quantity3', parseFloat(dosageMapping?.products[2]?.vial?.size ?? '0') ?? 0);
          setFieldValue('vials3', parseFloat(dosageMapping?.products[2]?.qty ?? '0') ?? 0);
        const planCodeToDaysSupply = {
          one_month: 30,
          two_month: 60,
          three_month: 90
        } as const;
        type PlanCode = keyof typeof planCodeToDaysSupply;
        if (dosageMapping?.plan_code && dosageMapping.plan_code in planCodeToDaysSupply) {
          setFieldValue('daysSupply', planCodeToDaysSupply[dosageMapping.plan_code as PlanCode]);
        }
      }

      if (isDrugCraftersOrOlympiaSelected || isPremierRxSelected) setFieldValue('directions', 'Use as directed');
    }
  };

  const defaultConfigs = () => {
    if (
      selectedPharmacyName === 'axtell' ||
      selectedPharmacyName === 'script rx' ||
      selectedPharmacyName === 'valiant' ||
      (selectedPharmacyName == 'beaker' && shippingServices?.length)
    ) {
      const deliveryOption = shippingServices.find((service) => service?.name?.toLowerCase() === 'delivery') ?? null;

      setFieldValue('shippingService', deliveryOption ? { id: deliveryOption?.id, name: deliveryOption?.name } : null);
    }

    if (!isAutoPopulatePharmacy) {
      // if (selectedPharmacyName === 'drug crafters') setFieldValue('quantity', DrugCrafterQuantitySize.TWENTY_ML);
      if (selectedPharmacyName !== 'olympia') setFieldValue('quantity', 1);
      else setFieldValue('quantity', 0);
    }

    if (rxTypeIncludedPharmacyMap?.[selectedPharmacyName as PharmacyName]) setFieldValue('rxType', EnumRxType.NEW);

    setFieldValue('dateWritten', formatUSDate(new Date()));
  };

  useEffect(() => {
    if (fetchPharmacyNotesCount && selectedProduct) {
      const successCallback = (res: PharmacyNotes) => {
        const selectedCategories = res.clinicalNotes;

        setSelectedCategories(selectedCategories);

        const defaultCategory = selectedCategories.find((item) => item.is_default);

        if (defaultCategory) setChoosenCategories([defaultCategory]);

        onFetchPharmacyNotesSuccess?.({
          clinicalNotes: defaultCategory ? [defaultCategory] : [],
          generalNotes: res.generalNotes
        });
      };

      const foundProductName = foundDrugName(selectedProduct);

      const drugCategory = productsCategories?.[foundProductName?.toLowerCase() as keyof typeof productsCategories];

      const dosage = values.dosage || values.drugStrength || '';

      // Get route for NAD products
      const route = foundProductName?.toLowerCase() === 'nad'
        ? (values.route as 'im' | 'sq' | undefined)
        : undefined;

      // For DrugCrafter, pass isGlycine to filter clinical notes by glycine
      const isGlycine = selectedProduct?.prodName?.toLowerCase().includes('glycine') ? true : undefined;

      triggerGetPharmacyNotes({
        pharmacyId: pharmacyId ?? '',
        queryParams: {
          daysSupply: values.daysSupply,
          dosage: `${dosage}`,
          productName: foundProductName ?? '',
          doctorGroup: values.doctorGroup,
          category: drugCategory,
          ...(route && { route }),
          ...(isGlycine !== undefined && { isGlycine })
        }
      })
        .unwrap()
        .then(successCallback);
    }
  }, [
    fetchPharmacyNotesCount,
    pharmacyId,
    selectedProduct,
    values.dosage,
    values.drugStrength,
    values.daysSupply,
    values.doctorGroup,
    values.route
  ]);

  return {
    PRODUCTS_OPTIONS,
    SHIPPING_OPTIONS,
    dosages,
    daysSupplyOptions,
    quantitySizesDrugCrafters,
    quantitySizesPremierRx,
    selectedPharmacyName,
    handleChangeDrug,
    setSelectedProduct,
    selectedProduct,
    configsOnDrugChange,
    defaultConfigs,
    showClinicalDifferenceStatement,
    setShowClinicalDifferenceStatement,
    selectedCategories,
    setSelectedCategories,
    choosenCategories,
    setChoosenCategories,
    prepareClinicalDifferenceStatement,
    notesAutoAppendHandler,
    fetchPharmacyNotesCount,
    setFetchPharmacyNotesCount,
    pharmacyNotesData,
    isFetchingPharmacyNotes
  };
};
