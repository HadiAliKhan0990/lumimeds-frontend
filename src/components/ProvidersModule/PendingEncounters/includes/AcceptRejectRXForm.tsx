'use client';
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import CreatableSelect from 'react-select/creatable';
import { AcceptRejectRxSchema } from '@/lib/schema/acceptRejectRx';
import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { TIRZEPATIDE_DOSAGE_LABELS } from '@/lib/constants';

import {
  updateField,
  updateNotesToPatient,
  updateNotesToStaff,
  setValidationErrors,
  initializeForm,
} from '@/store/slices/formDataSlice';
import { validatePrescriptionForm } from '@/lib/validation/prescriptionFormValidation';
import { toast } from 'react-hot-toast';
import { useLazyGetValiantPharmacyNotesQuery } from '@/store/slices/pharmaciesApiSlice';

// Interface for the API prescription instruction data
interface ApiPrescriptionInstruction {
  medication: string;
  dosage: number;
  route?: string;
  daysSupply?: number;
  directions?: string;
  notesToPatient?: string;
  notesToStaff?: string;
  dateWritten?: string;
}

// Import the correct types from react-select
import { SelectInstance, GroupBase } from 'react-select';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { OrderNotesContentPatient } from '@/components/Dashboard/admin/users/Patients/includes/OrderNotesContentPatient';

export interface AcceptRejectRXFormProps {
  onAccept?: (values: AcceptRejectRxSchema) => void;
  onReject?: (rejectionReason: string) => void;
  initialValues?: Partial<AcceptRejectRxSchema>;
  showActionButtons?: boolean;
  orderId?: string;
  productImage?: string;
  productName?: string;
  allowEdit?: boolean;
}

// const defaultInitialValues: AcceptRejectRxSchema = {
//   medication: 'injection-trizepatide-3months',
//   dosage: '2.2mg',
//   refills: '',
//   daysSupply: 30,
//   directions: '',
//   notes: '',
//   rejectionReason: '',
// };

export interface FormContentProps extends AcceptRejectRXFormProps {
  onReject?: (rejectionReason: string) => void;
  showActionButtons?: boolean;
  orderId?: string;
  productImage?: string;
  productName?: string;
  allowEdit?: boolean;
}

const FormContent = ({ showActionButtons = true, orderId, allowEdit = false }: FormContentProps) => {
  const dispatch = useDispatch();
  const [selectedMedication, setSelectedMedication] = useState('');
  const [dosageOptions, setDosageOptions] = useState<Array<{ value: string; label: string }>>([]);
  const dosageSelectRef =
    useRef<SelectInstance<{ value: string; label: string }, false, GroupBase<{ value: string; label: string }>>>(null);

  const isFormInitializedRef = useRef(false);
  
  // Lazy query for fetching pharmacy notes (only for longevity orders)
  const [getValiantPharmacyNotes] = useLazyGetValiantPharmacyNotesQuery();
  
  // Store pharmacy notes for route-based directions lookup
  const [valiantPharmacyNotes, setValiantPharmacyNotes] = useState<Array<{ route: 'im' | 'sq'; medication: string; category: string; notes: string[] }> | null>(null);

  const { windowWidth } = useWindowWidth();

  const isMobile = windowWidth <= 576;

  // Get form data from Redux store
  const formData = useSelector((state: RootState) => state.formData);
  const { medication, dosage, refills, daysSupply, directions, notes, route, errors } = formData;
  
  // Check if medication is NAD (case-insensitive)
  const isNadMedication = medication?.toLowerCase() === 'nad';
  
  const pathname = usePathname();
  // Check if we're on the approved route to make form readonly
  // But allow editing if allowEdit prop is true (e.g., from Change button)
  const isApprovedRoute = pathname.includes('/provider/approved') && !allowEdit;

  const orders = useSelector((state: RootState) => state.patientOrders?.data) ?? [];

  // Find the order for the current orderId
  const foundOrder = useMemo(() => {
    return orders.find((o) => o.id === orderId);
  }, [orders, orderId]);

  // NAD route type options - show both IM and SQ, but IM is disabled
  const nadRouteOptions = [
    { value: 'IM', label: 'IM', disabled: true },
    { value: 'SQ', label: 'SQ', disabled: false },
  ];

  // Field update handlers
  const handleFieldChange = (field: keyof typeof formData, value: string | number) => {
    // Don't allow changes on approved route
    if (isApprovedRoute) return;

    dispatch(updateField({ field, value }));

    // Clear the specific field error when user starts typing
    if (formData.errors[field]) {
      const updatedErrors = { ...formData.errors };
      delete updatedErrors[field];
      dispatch(setValidationErrors(updatedErrors));
    }

    // Validate form after each change
    const currentValues = { ...formData, [field]: value };
    const validation = validatePrescriptionForm(currentValues);
    
    // Don't show route error immediately when selecting NAD - let user select route first
    if (field === 'medication' && typeof value === 'string' && value.toLowerCase() === 'nad') {
      delete validation.errors.route;
    }
    
    dispatch(setValidationErrors(validation.errors));
  };

  const handleNotesToPatientChange = (value: string) => {
    // Don't allow changes on approved route
    if (isApprovedRoute) return;
    dispatch(updateNotesToPatient(value));
  };

  const handleNotesToStaffChange = (value: string) => {
    // Don't allow changes on approved route
    if (isApprovedRoute) return;
    dispatch(updateNotesToStaff(value));
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const extractMedicationFromProductName = (productName: string | null | undefined): string | null => {
    if (!productName) return null;

    const words = productName.trim().split(/\s+/);
    if (words.length >= 2) {
      const secondWord = words[1].toLowerCase();
      if (secondWord === 'semaglutide' || secondWord === 'tirzepatide') {
        return capitalizeFirstLetter(secondWord);
      }
    }
    return null;
  };

  // Removed automatic form clearing to prevent data loss during re-renders
  // Form data should only be cleared when user explicitly clicks action buttons

  useEffect(() => {
    isFormInitializedRef.current = false;
  }, [orderId]);

  useEffect(() => {
    const isApprovedRoute = window.location.pathname.includes('/provider/approved');

    if (
      !isFormInitializedRef.current &&
      isApprovedRoute &&
      foundOrder &&
      foundOrder.prescriptionInstructions &&
      foundOrder.prescriptionInstructions.length > 0
    ) {
      const prescriptionData = foundOrder.prescriptionInstructions[0] as ApiPrescriptionInstruction;

      // Prefill form fields with API data
      if (prescriptionData.medication) {
        dispatch(updateField({ field: 'medication', value: prescriptionData.medication }));
        setSelectedMedication(prescriptionData.medication);
      }

      if (prescriptionData.dosage) {
        dispatch(updateField({ field: 'dosage', value: prescriptionData.dosage.toString() }));
      }

      if (prescriptionData.route) {
        dispatch(updateField({ field: 'route', value: prescriptionData.route }));
      }

      if (prescriptionData.daysSupply) {
        dispatch(updateField({ field: 'daysSupply', value: prescriptionData.daysSupply }));
      }

      if (prescriptionData.directions) {
        dispatch(updateField({ field: 'directions', value: prescriptionData.directions }));
      }

      if (prescriptionData.notesToPatient) {
        dispatch(updateField({ field: 'notes', value: prescriptionData.notesToPatient }));
        dispatch(updateNotesToPatient(prescriptionData.notesToPatient));
      }

      if (prescriptionData.notesToStaff) {
        dispatch(updateNotesToStaff(prescriptionData.notesToStaff));
      }

      isFormInitializedRef.current = true;
    } else if (!isFormInitializedRef.current && !isApprovedRoute && foundOrder && !medication) {
      // Check if medicineType is longevity - auto-select NAD, SQ route, and first dosage
      if (foundOrder.medicineType === 'longevity') {
        dispatch(updateField({ field: 'medication', value: 'Nad' }));
        setSelectedMedication('Nad');
        dispatch(updateField({ field: 'route', value: 'SQ' }));

        // Get first dosage from nad.sq (SQ only for now)
        let selectedDosage = '';
        if (foundOrder.dosages) {
          const nadDosages = foundOrder.dosages['nad' as keyof typeof foundOrder.dosages] as { im?: number[]; sq?: number[] } | undefined;
          if (nadDosages?.sq && nadDosages.sq.length > 0) {
            const minDosage = Math.min(...nadDosages.sq);
            selectedDosage = minDosage.toString();
            dispatch(updateField({ field: 'dosage', value: selectedDosage }));
          }
        }

        // Set order supply: 30 for Monthly subscription, 90 otherwise for NAD
        const selectedDaysSupply = foundOrder.durationText === 'Monthly Subscription' ? 30 : 90;
        dispatch(updateField({ field: 'daysSupply', value: selectedDaysSupply }));

        // Fetch pharmacy notes for longevity orders (SQ only for now)
        getValiantPharmacyNotes({
          productName: 'nad',
          category: 'longevity',
          daysSupply: selectedDaysSupply,
          route: 'sq',
          dosage: selectedDosage,
        })
          .unwrap()
          .then((pharmacyNotesData) => {
            if (pharmacyNotesData?.length > 0) {
              setValiantPharmacyNotes(pharmacyNotesData);
              const notes = pharmacyNotesData[0]?.notes;
              if (notes?.length > 0) {
                dispatch(updateField({ field: 'directions', value: notes.join('\n') }));
              }
            }
          })
          .catch((error) => {
            console.error('Failed to fetch pharmacy notes:', error);
          });
      } else {
        const extractedMedication = extractMedicationFromProductName(foundOrder.requestedProductName);

        if (extractedMedication) {
          dispatch(updateField({ field: 'medication', value: extractedMedication }));
          setSelectedMedication(extractedMedication);

          if (foundOrder.dosages) {
            // Normalize medication key to lowercase for lookup (dosages keys are lowercase)
            const normalizedMedicationKey = extractedMedication.toLowerCase();
            const dosageArray = foundOrder.dosages[normalizedMedicationKey as keyof typeof foundOrder.dosages];
            if (dosageArray && Array.isArray(dosageArray) && dosageArray.length > 0) {
              const minDosage = Math.min(...dosageArray);
              dispatch(updateField({ field: 'dosage', value: minDosage.toString() }));
            }
          }
        }
      }

      isFormInitializedRef.current = true;
    }
  }, [foundOrder, dispatch, medication]);

  const medicationOptions = useMemo(() => {
    return foundOrder?.medications
      ? Object.entries(foundOrder.medications).map(([key, value]) => {
          const capitalizedLabel = capitalizeFirstLetter(String(value));
          return {
            value: key,
            label: capitalizedLabel,
          };
        })
      : [];
  }, [foundOrder?.medications]);

  // Initialize selectedMedication from form values
  useEffect(() => {
    if (medication && !selectedMedication) {
      setSelectedMedication(medication);
    }
  }, [medication, selectedMedication]);

  // Update dosage options when medication or route changes
  useEffect(() => {
    if (!selectedMedication || !foundOrder?.dosages) {
      setDosageOptions([]);
      return;
    }

    const normalizedMedicationKey = selectedMedication.toLowerCase();
    let dosageArray: number[] | undefined;

    // Handle NAD medication - dosages are nested by route (im/sq)
    if (normalizedMedicationKey === 'nad') {
      const nadDosages = foundOrder.dosages[normalizedMedicationKey as keyof typeof foundOrder.dosages] as { im?: number[]; sq?: number[] } | undefined;
      if (nadDosages && route) {
        const routeKey = route.toLowerCase() as 'im' | 'sq';
        dosageArray = nadDosages[routeKey];
      }
    } else {
      // For other medications, dosages is a direct array
      dosageArray = foundOrder.dosages[normalizedMedicationKey as keyof typeof foundOrder.dosages] as number[] | undefined;
    }

    if (dosageArray && Array.isArray(dosageArray) && dosageArray.length > 0) {
      // Check if medication is tirzepatide
      const isTirzepatide = normalizedMedicationKey === 'tirzepatide' || medication?.toLowerCase() === 'tirzepatide';

      const newDosageOptions = dosageArray.map((dosage: number) => {
        if (isTirzepatide && TIRZEPATIDE_DOSAGE_LABELS[dosage.toString()]) {
          return { value: dosage.toString(), label: `${TIRZEPATIDE_DOSAGE_LABELS[dosage.toString()]}mg /weekly` };
        }

        return {
          value: dosage.toString(),
          label: `${dosage}mg /weekly`,
        };
      });
      setDosageOptions(newDosageOptions);

      if (!dosage || dosage === '' || !dosageArray.includes(parseFloat(dosage))) {
        const minDosage = Math.min(...dosageArray);
        dispatch(updateField({ field: 'dosage', value: minDosage.toString() }));
      }
    } else {
      setDosageOptions([]);
      // Clear dosage when NAD is selected but no route is chosen yet
      if (normalizedMedicationKey === 'nad' && !route) {
        dispatch(updateField({ field: 'dosage', value: '' }));
      }
    }
  }, [selectedMedication, foundOrder?.dosages, dosage, route, medication, dispatch]);

  // Function to focus the dosage field
  const focusDosageField = useCallback(() => {
    if (!medication) {
      // Show message to user with icon
      toast.error('Please select a medication first to modify dosage', {
        icon: '❌',
      });
      return;
    }

    if (dosageSelectRef.current) {
      // Use the focus method from SelectInstance
      dosageSelectRef.current.focus();
    }
  }, [medication]);

  // Expose the focus function globally so it can be called from outside
  useEffect(() => {
    (window as { focusDosageField?: () => void }).focusDosageField = focusDosageField;
    return () => {
      delete (window as { focusDosageField?: () => void }).focusDosageField;
    };
  }, [focusDosageField]);

  // Fetch pharmacy notes when route or dosage changes (only for NAD medication)
  // Skip if prescriptionInstructions already has directions
  useEffect(() => {
    if (!isNadMedication || !route || !dosage) return;
    if (!isFormInitializedRef.current) return;

    const prescriptionInstruction = foundOrder?.prescriptionInstructions?.[0];
    
    // If prescriptionInstructions has directions, use those instead of API
    if (prescriptionInstruction?.directions) {
      dispatch(updateField({ field: 'directions', value: prescriptionInstruction.directions }));
      return;
    }

    // Get daysSupply from prescriptionInstructions or form state
    const apiDaysSupply = prescriptionInstruction?.daysSupply 
      ? Number(prescriptionInstruction.daysSupply) 
      : (daysSupply || 30);

    getValiantPharmacyNotes({
      productName: 'nad',
      category: 'longevity',
      daysSupply: apiDaysSupply,
      route: route.toLowerCase(),
      dosage: dosage,
    })
      .unwrap()
      .then((pharmacyNotesData) => {
        if (pharmacyNotesData?.length > 0) {
          setValiantPharmacyNotes(pharmacyNotesData);
          const notes = pharmacyNotesData[0]?.notes;
          if (notes?.length > 0) {
            dispatch(updateField({ field: 'directions', value: notes.join('\n') }));
          }
        }
      })
      .catch(console.error);
  }, [route, dosage, isNadMedication, daysSupply, foundOrder, dispatch, getValiantPharmacyNotes]);

  // const { windowWidth } = useWindowWidth();

  // const decideWidth = () => {
  //   if (isMobile) {
  //     return 'w-100';
  //   }
  //   if (isTablet) {
  //     return 'w-50';
  //   }
  //   if (isLargeScreen) {
  //     return 'w-35';
  //   }
  //   return 'w-50';
  // };

  // useEffect(() => {
  //   if (foundOrder) {
  //     setFieldValue('refills', foundOrder.refills);
  //     setFieldValue('daysSupply', foundOrder.daysSupply);
  //     setFieldValue('directions', foundOrder.directions);
  //     setFieldValue('notes', foundOrder.notes);
  //   }
  // }, [foundOrder]);

  // const handleReject = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   setShowRejectModal(true);
  // };

  // const handleConfirmReject = () => {
  //   onReject?.(rejectionReason);
  //   setShowRejectModal(false);
  //   setRejectionReason('');
  // };

  // const handleAccept = async (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   await submitForm();
  // };

  return (
    <div className='d-flex flex-column gap-3'>
      {/* <span className='fw-medium '>Selected Order</span>
      <div className='d-flex  flex-column gap-3'>
        <div className={`${decideWidth()}`}>
                <OrderCard productImage={''} productName={''} />
        </div>
        <div className='border border-c-light p-2 rounded-2'>
          <OrderNotesContent type='patient' />
        </div>
      </div>  */}

      <Form id='accept-reject-rx-form' className='border border-c-light rounded-2 tw-mt-4'>
        <div className='tw-p-2.5 lg:tw-p-4 tw-bg-[#F5F5F5]'>
          {showActionButtons && (
            <div className={'mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2'}>
              <span className='fw-bold fs-5'>Current Prescription</span>
            </div>
          )}

          {/* Form Fields Section */}
          <div className='tw-mt-4'>
            {/* Top Row - Medication Details */}
            <div className='mb-3 tw-flex tw-flex-col lg:tw-flex-row tw-text-xs'>
              <div className='lg:tw-w-2/3 tw-pr-4'>
                <div className='tw-flex tw-flex-col md:tw-flex-row md:tw-flex-wrap lg:tw-gap-6 xl:tw-gap-0 xl:tw-justify-between'>
                  <div>
                    <Form.Group>
                      <Form.Label className='fw-medium !tw-mb-1 !tw-text-sm'>Medication:</Form.Label>
                      <CreatableSelect
                        value={
                          medication
                            ? {
                                value: medication,
                                label: medicationOptions.find((opt) => opt.value === medication)?.label || capitalizeFirstLetter(medication),
                              }
                            : null
                        }
                        onChange={(selectedOption) => {
                          const value = selectedOption?.value || '';
                          handleFieldChange('medication', value);
                          setSelectedMedication(value);
                          
                          if (value.toLowerCase() === 'nad') {
                            // Use prescriptionInstructions values if available, else defaults (SQ only for now)
                            const instruction = foundOrder?.prescriptionInstructions?.[0];
                            const routeVal = instruction?.route ? String(instruction.route).toUpperCase() : 'SQ';
                            const daysSupplyVal = instruction?.daysSupply ? Number(instruction.daysSupply) : 30;
                            const dosageVal = instruction?.dosage ? String(instruction.dosage) : null;
                            const directionsVal = instruction?.directions || '';
                            
                            dispatch(updateField({ field: 'route', value: routeVal }));
                            dispatch(updateField({ field: 'daysSupply', value: daysSupplyVal }));
                            if (directionsVal) {
                              dispatch(updateField({ field: 'directions', value: directionsVal }));
                            }
                            
                            if (dosageVal) {
                              dispatch(updateField({ field: 'dosage', value: dosageVal }));
                            } else if (foundOrder?.dosages) {
                              const nadDosages = foundOrder.dosages['nad' as keyof typeof foundOrder.dosages] as { im?: number[]; sq?: number[] } | undefined;
                              const routeKey = routeVal.toLowerCase() as 'im' | 'sq';
                              if (nadDosages?.[routeKey]?.length) {
                                dispatch(updateField({ field: 'dosage', value: Math.min(...nadDosages[routeKey]).toString() }));
                              }
                            }
                          } else {
                            handleFieldChange('route', '');
                            dispatch(updateField({ field: 'directions', value: '' }));
                            dispatch(updateField({ field: 'daysSupply', value: '' }));
                          }
                        }}
                        onCreateOption={(inputValue) => {
                          const capitalizedValue = capitalizeFirstLetter(inputValue);
                          handleFieldChange('medication', capitalizedValue);
                          setSelectedMedication(capitalizedValue);
                          
                          if (capitalizedValue.toLowerCase() === 'nad') {
                            const instruction = foundOrder?.prescriptionInstructions?.[0];
                            const routeVal = instruction?.route ? String(instruction.route).toUpperCase() : 'SQ';
                            const daysSupplyVal = instruction?.daysSupply ? Number(instruction.daysSupply) : 30;
                            const dosageVal = instruction?.dosage ? String(instruction.dosage) : null;
                            const directionsVal = instruction?.directions || '';
                            
                            dispatch(updateField({ field: 'route', value: routeVal }));
                            dispatch(updateField({ field: 'daysSupply', value: daysSupplyVal }));
                            if (directionsVal) {
                              dispatch(updateField({ field: 'directions', value: directionsVal }));
                            }
                            
                            if (dosageVal) {
                              dispatch(updateField({ field: 'dosage', value: dosageVal }));
                            } else if (foundOrder?.dosages) {
                              const nadDosages = foundOrder.dosages['nad' as keyof typeof foundOrder.dosages] as { im?: number[]; sq?: number[] } | undefined;
                              const routeKey = routeVal.toLowerCase() as 'im' | 'sq';
                              if (nadDosages?.[routeKey]?.length) {
                                dispatch(updateField({ field: 'dosage', value: Math.min(...nadDosages[routeKey]).toString() }));
                              }
                            }
                          } else {
                            handleFieldChange('route', '');
                            dispatch(updateField({ field: 'directions', value: '' }));
                            dispatch(updateField({ field: 'daysSupply', value: '' }));
                          }
                        }}
                        onBlur={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue && inputValue.trim() !== '') {
                            const capitalizedValue = capitalizeFirstLetter(inputValue.trim());
                            handleFieldChange('medication', capitalizedValue);
                            setSelectedMedication(capitalizedValue);
                            
                            if (capitalizedValue.toLowerCase() === 'nad') {
                              const instruction = foundOrder?.prescriptionInstructions?.[0];
                              const routeVal = instruction?.route ? String(instruction.route).toUpperCase() : 'SQ'; // SQ only for now
                              const daysSupplyVal = instruction?.daysSupply ? Number(instruction.daysSupply) : 30;
                              const dosageVal = instruction?.dosage ? String(instruction.dosage) : null;
                              const directionsVal = instruction?.directions || '';
                              
                              dispatch(updateField({ field: 'route', value: routeVal }));
                              dispatch(updateField({ field: 'daysSupply', value: daysSupplyVal }));
                              if (directionsVal) {
                                dispatch(updateField({ field: 'directions', value: directionsVal }));
                              }
                              
                              if (dosageVal) {
                                dispatch(updateField({ field: 'dosage', value: dosageVal }));
                              } else if (foundOrder?.dosages) {
                                const nadDosages = foundOrder.dosages['nad' as keyof typeof foundOrder.dosages] as { im?: number[]; sq?: number[] } | undefined;
                                const routeKey = routeVal.toLowerCase() as 'im' | 'sq';
                                if (nadDosages?.[routeKey]?.length) {
                                  dispatch(updateField({ field: 'dosage', value: Math.min(...nadDosages[routeKey]).toString() }));
                                }
                              }
                            } else {
                              handleFieldChange('route', '');
                              dispatch(updateField({ field: 'directions', value: '' }));
                              dispatch(updateField({ field: 'daysSupply', value: '' }));
                            }
                          }
                        }}
                        options={medicationOptions}
                        placeholder='Select or type medication'
                        isClearable={!isApprovedRoute}
                        isDisabled={isApprovedRoute}
                        className={`text-sm ${errors.medication ? 'is-invalid' : ''}`}
                        styles={{
                          control: (base) => ({
                            ...base,
                            minWidth: isMobile ? '100%' : '270px',
                            width: '100%',
                          }),
                          singleValue: (base) => ({
                            ...base,
                            textTransform: 'capitalize',
                          }),
                          option: (base) => ({
                            ...base,
                            textTransform: 'capitalize',
                          }),
                        }}
                      />
                      {errors.medication && <div className='invalid-feedback d-block'>{errors.medication}</div>}
                    </Form.Group>
                  </div>
                  {/* Route Dropdown - only shows when NAD is selected */}
                  {isNadMedication && (
                    <div className='tw-mt-2 md:tw-mt-0 md:tw-mx-2 lg:tw-mx-0'>
                      <Form.Group>
                        <Form.Label className='fw-medium !tw-mb-1 !tw-text-sm'>Route:</Form.Label>
                        <Form.Select
                          value={route || ''}
                          onChange={(e) => {
                            const newRoute = e.target.value;
                            dispatch(updateField({ field: 'route', value: newRoute }));
                            
                            // Auto-select first dosage for NAD when route is selected
                            let newDosage = '';
                            if (newRoute && foundOrder?.dosages) {
                              const nadDosages = foundOrder.dosages['nad' as keyof typeof foundOrder.dosages] as { im?: number[]; sq?: number[] } | undefined;
                              if (nadDosages) {
                                const routeKey = newRoute.toLowerCase() as 'im' | 'sq';
                                const dosageArray = nadDosages[routeKey];
                                if (dosageArray && dosageArray.length > 0) {
                                  newDosage = Math.min(...dosageArray).toString();
                                }
                              }
                            }
                            dispatch(updateField({ field: 'dosage', value: newDosage }));
                            
                            // Update directions based on selected route (for longevity/NAD orders)
                            if (valiantPharmacyNotes && newRoute) {
                              const routeKey = newRoute.toLowerCase() as 'im' | 'sq';
                              const routeNotes = valiantPharmacyNotes.find((item) => item.route === routeKey);
                              if (routeNotes?.notes && routeNotes.notes.length > 0) {
                                const directionsText = routeNotes.notes.join('\n');
                                dispatch(updateField({ field: 'directions', value: directionsText }));
                              }
                            }
                            
                            // Validate with the new values
                            const currentValues = { ...formData, route: newRoute, dosage: newDosage };
                            const validation = validatePrescriptionForm(currentValues);
                            dispatch(setValidationErrors(validation.errors));
                          }}
                          disabled={isApprovedRoute}
                          className={`form-select tw-border tw-border-[#C1CBDE] ${
                            errors.route ? 'is-invalid' : ''
                          } ${isApprovedRoute ? 'tw-bg-gray-100' : ''}`}
                          style={{ 
                            minWidth: '100px',
                            cursor: isApprovedRoute ? 'not-allowed' : 'pointer' 
                          }}
                        >
                          <option value=''>Select</option>
                          {nadRouteOptions.map((option) => (
                            <option key={option.value} value={option.value} disabled={option.disabled}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.route && <div className='invalid-feedback d-block'>{errors.route}</div>}
                      </Form.Group>
                    </div>
                  )}
                  <div className='tw-mt-2 md:tw-mt-0 md:tw-mx-2 lg:tw-mx-0'>
                    <Form.Group>
                      <Form.Label className='fw-medium !tw-mb-1 !tw-text-sm'>{isNadMedication ? 'Start Dose:' : 'Dosage:'}</Form.Label>
                      <CreatableSelect
                        ref={dosageSelectRef}
                        value={
                          dosage
                            ? (() => {
                              if (medication?.toLowerCase() === 'tirzepatide' && TIRZEPATIDE_DOSAGE_LABELS[dosage.toString()]) {
                                return { value: dosage.toString(), label: TIRZEPATIDE_DOSAGE_LABELS[dosage.toString()] };
                              }

                                return { value: dosage, label: dosage };
                              })()
                            : null
                        }
                        onChange={(selectedOption) => {
                          const value = selectedOption?.value || '';
                          handleFieldChange('dosage', value);
                        }}
                        onCreateOption={(inputValue) => {
                          handleFieldChange('dosage', inputValue);
                        }}
                        onBlur={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue && inputValue.trim() !== '') {
                            handleFieldChange('dosage', inputValue.trim());
                          }
                        }}
                        options={dosageOptions}
                        placeholder={isNadMedication && !route ? 'Select route first' : 'Select or type dosage'}
                        isClearable={!isApprovedRoute}
                        isDisabled={isApprovedRoute || !medication || (isNadMedication && !route)}
                        openMenuOnFocus={!isApprovedRoute}
                        className={`text-sm tw-w-full ${errors.dosage ? 'is-invalid' : ''}`}
                        styles={{
                          control: (base) => ({
                            ...base,
                            minWidth: '201px',
                            width: '100%',
                          }),
                        }}
                      />
                      {errors.dosage && <div className='invalid-feedback d-block'>{errors.dosage}</div>}
                    </Form.Group>
                  </div>
                  <div className='tw-mt-2 md:tw-mt-0'>
                    <Form.Group>
                      <Form.Label className='fw-medium !tw-mb-1 !tw-text-sm'>Refills:</Form.Label>
                      <Form.Control
                        type='text'
                        name='refills'
                        value={refills || ''}
                        onChange={(e) => handleFieldChange('refills', e.target.value)}
                        readOnly={isApprovedRoute}
                        disabled={isApprovedRoute}
                        className={`form-control disabled tw-border tw-border-[#C1CBDE] lg:!tw-w-[80px] xl:!tw-w-[140px] ${
                          errors.refills ? 'is-invalid' : ''
                        } ${isApprovedRoute ? 'tw-bg-gray-100' : ''}`}
                        placeholder=''
                        style={{ cursor: isApprovedRoute ? 'not-allowed' : 'text' }}
                      />
                      {errors.refills && <div className='invalid-feedback d-block'>{errors.refills}</div>}
                    </Form.Group>
                  </div>
                  <div className='tw-mt-2 lg:tw-mt-0'>
                    <Form.Group>
                      <Form.Label className='fw-medium !tw-mb-1 !tw-text-sm'>Order Supply:</Form.Label>
                      <div className='d-flex tw-relative'>
                        <Form.Control
                          type='text'
                          name='daysSupply'
                          value={daysSupply || ''}
                          onChange={(e) => handleFieldChange('daysSupply', parseInt(e.target.value))}
                          readOnly={isApprovedRoute}
                          disabled={isApprovedRoute}
                          className={`form-control disabled lg:tw-w-[180px] tw-border tw-border-[#C1CBDE] ${
                            errors.daysSupply ? 'is-invalid' : ''
                          } ${isApprovedRoute ? 'tw-bg-gray-100' : ''}`}
                          placeholder=''
                          style={{ cursor: isApprovedRoute ? 'not-allowed' : 'text' }}
                        />
                        <span className='tw-absolute tw-text-xs tw-bg-[#EFF4FF] tw-top-1.5 tw-right-0 tw-mr-3 tw-p-1 tw-rounded-full tw-text-center'>
                          Days
                        </span>
                      </div>
                      {errors.daysSupply && <div className='invalid-feedback d-block'>{errors.daysSupply}</div>}
                    </Form.Group>
                  </div>
                </div>
                <div className='tw-flex tw-flex-col lg:tw-flex-row tw-gap-4 tw-mt-4'> 
                <div className='tw-w-full'>
                  <Form.Group>
                    <Form.Label className='fw-medium !tw-mb-1 !tw-text-sm'>Notes to Patient:</Form.Label>
                    <Form.Control
                      as='textarea'
                      name='notes'
                      rows={3}
                      value={notes || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        handleFieldChange('notes', e.target.value);
                        handleNotesToPatientChange(e.target.value);
                      }}
                      readOnly={isApprovedRoute}
                      disabled={isApprovedRoute}
                      className={`form-control tw-border tw-border-[#C1CBDE] ${errors.notes ? 'is-invalid' : ''} ${
                        isApprovedRoute ? 'tw-bg-gray-100' : ''
                      }`}
                      placeholder=''
                      style={{ cursor: isApprovedRoute ? 'not-allowed' : 'text' }}
                    />
                    {errors.notes && <div className='invalid-feedback d-block'>{errors.notes}</div>}
                  </Form.Group>
                </div>
                <div className='tw-w-full'>
                  <Form.Group>
                    <Form.Label className='fw-medium !tw-mb-1 !tw-text-sm'>Directions:</Form.Label>
                    <Form.Control
                      as='textarea'
                      name='directions'
                      rows={5}
                      value={directions || ''}
                      onChange={(e) => handleFieldChange('directions', e.target.value)}
                      readOnly={isApprovedRoute || !isNadMedication}
                      disabled={isApprovedRoute || !isNadMedication}
                      className={`form-control tw-border tw-border-[#C1CBDE] ${
                        errors.directions ? 'is-invalid' : ''
                      } ${isApprovedRoute || !isNadMedication ? 'tw-bg-gray-100' : ''}`}
                      placeholder=''
                      style={{ cursor: isApprovedRoute || !isNadMedication ? 'not-allowed' : 'text' }}
                    />
                    {errors.directions && <div className='invalid-feedback d-block'>{errors.directions}</div>}
                  </Form.Group>
                </div>
                </div>

                <div className='tw-mt-4'>
                  <Form.Group>
                    <Form.Label className='fw-medium !tw-mb-1 !tw-text-sm'>Staff Instructions:</Form.Label>
                    <Form.Control
                      as='textarea'
                      name='notesToStaff'
                      rows={3}
                      value={formData.notesToStaff || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        handleFieldChange('notesToStaff', e.target.value);
                        handleNotesToStaffChange(e.target.value);
                      }}
                      readOnly={isApprovedRoute}
                      disabled={isApprovedRoute}
                      className={`form-control tw-border tw-border-[#C1CBDE] ${errors.notesToStaff ? 'is-invalid' : ''} ${
                        isApprovedRoute ? 'tw-bg-gray-100' : ''
                      }`}
                      placeholder=''
                      style={{ cursor: isApprovedRoute ? 'not-allowed' : 'text' }}
                    />
                    {errors.notesToStaff && <div className='invalid-feedback d-block'>{errors.notesToStaff}</div>}
                  </Form.Group>
                </div>
              </div>
              {/* Right Column - Chart Notes (replacing Staff Instructions position) */}
              <div className='lg:tw-w-1/3 tw-mt-4 lg:tw-mt-0 tw-bg-white tw-rounded-xl tw-p-3 tw-border tw-border-gray-200 tw-text-sm'>
                <OrderNotesContentPatient type='patient' />
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export const AcceptRejectRXForm = ({
  onReject,
  initialValues,
  showActionButtons = true,
  orderId,
  allowEdit = false,
}: AcceptRejectRXFormProps) => {
  const dispatch = useDispatch();

  // Initialize form with values when component mounts
  useEffect(() => {
    if (initialValues) {
      dispatch(initializeForm(initialValues));
    }
  }, [dispatch, initialValues]);

  return (
    <FormContent onReject={onReject} showActionButtons={showActionButtons} orderId={orderId} allowEdit={allowEdit} />
  );
};
