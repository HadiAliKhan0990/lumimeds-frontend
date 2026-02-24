import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { LicenseQuestionAnswer, ProviderSurveyFormValues } from '@/services/providerIntake/types';
import { FaPlus, FaFileCsv, FaTrash, FaDownload } from 'react-icons/fa6';
import { useMemo, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { mergeLicenses, parseLicenseCsv, parseLicenseExcel } from '@/lib/licensesCsv';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { LicenseQuestionCard } from '@/components/ProvidersModule/ProviderIntakeSurvey/includes/LicenseQuestionCard';
import { SingleValue } from 'react-select';
import toast from 'react-hot-toast';
import { useStates } from '@/hooks/useStates';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  name: string;
  question: SurveyQuestion;
}

export function LicenseQuestion({ name }: Readonly<Props>) {
  const { values, setFieldValue, errors, touched } = useFormikContext<ProviderSurveyFormValues>();
  const { stateNames } = useStates();

  const licenseAnswers = (values[name] as LicenseQuestionAnswer[]) || [];
  const fieldError = errors[name];
  const isTouched = touched[name];

  const itemErrors = Array.isArray(fieldError) ? (fieldError as Array<LicenseQuestionAnswer>) : [];

  const [appendToExisting, setAppendToExisting] = useState<boolean>(true);

  const stateOptions = useMemo(() => {
    // Handle edge case: stateNames might be undefined or empty
    const validStateNames = stateNames || [];
    const validLicenseAnswers = licenseAnswers || [];

    // Create a case-insensitive set of API state names for comparison
    const apiStateNamesLower = new Set(validStateNames.map((s) => s.toLowerCase().trim()));

    // Get all states from API
    const apiStates = validStateNames.map((state: string) => ({
      value: state,
      label: state,
    }));

    // Get states from uploaded licenses that aren't in the API list (case-insensitive comparison)
    const uploadedStatesMap = new Map<string, string>(); // Map<lowercase, original>
    validLicenseAnswers
      .map((license) => license?.state)
      .filter((state): state is string => Boolean(state && typeof state === 'string' && state.trim() !== ''))
      .map((state) => state.trim())
      .forEach((state) => {
        const stateLower = state.toLowerCase();
        // Check if state exists in API (case-insensitive)
        if (!apiStateNamesLower.has(stateLower)) {
          // Store original casing, but use lowercase as key for deduplication
          if (!uploadedStatesMap.has(stateLower)) {
            uploadedStatesMap.set(stateLower, state);
          }
        }
      });

    const uploadedStates = Array.from(uploadedStatesMap.values()).map((state) => ({
      value: state,
      label: state,
    }));

    // Combine API states and uploaded states
    return [...apiStates, ...uploadedStates];
  }, [stateNames, licenseAnswers]);

  const handleAddLicense = (arrayHelpers: FieldArrayRenderProps) => {
    arrayHelpers.unshift({
      state: '',
      expiryDate: null,
      licenseNumber: '',
    });
    document.getElementById(`license-0`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRemoveLicense = (arrayHelpers: FieldArrayRenderProps, index: number) => {
    arrayHelpers.remove(index);
  };

  const handleStateChange = (index: number, selectedOption: SingleValue<{ value: string; label: string }>) => {
    const newLicenses = [...licenseAnswers];
    const selectedState = selectedOption?.value || '';

    // Normalize state: if it matches an API state (case-insensitive), use API casing
    const matchingApiState = stateNames.find((apiState) => apiState.toLowerCase() === selectedState.toLowerCase());
    const normalizedState = matchingApiState || selectedState;

    newLicenses[index] = {
      ...newLicenses[index],
      state: normalizedState,
    };
    setFieldValue(name, newLicenses);
  };

  const handleDateChange = (index: number, expiryDate: Date | null) => {
    const newLicenses = [...licenseAnswers];
    newLicenses[index] = {
      ...newLicenses[index],
      expiryDate,
    };
    setFieldValue(name, newLicenses);
  };

  const handleLicenseNumberChange = (index: number, value: string) => {
    const newLicenses = [...licenseAnswers];
    newLicenses[index] = {
      ...newLicenses[index],
      licenseNumber: value,
    };
    setFieldValue(name, newLicenses);
  };

  function mergeAndDedupeLicenses(
    existing: LicenseQuestionAnswer[],
    incoming: LicenseQuestionAnswer[],
    shouldAppend: boolean
  ) {
    return mergeLicenses(existing, incoming, shouldAppend);
  }

  async function processCsvFile(
    file: File,
    input: HTMLInputElement | null | undefined,
    currentLicenseAnswers: LicenseQuestionAnswer[],
    currentAppendToExisting: boolean
  ) {
    const validTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      toast.error('Invalid file type. Please upload a CSV, XLSX, or XLS file.');
      if (input) input.value = '';
      return;
    }

    try {
      let parsed: LicenseQuestionAnswer[];

      // Determine file type and parse accordingly
      const isExcel =
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.xls') ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';

      if (isExcel) {
        // Parse Excel file
        const arrayBuffer = await file.arrayBuffer();
        parsed = parseLicenseExcel(arrayBuffer);
      } else {
        // Parse CSV file
        const text = await file.text();
        parsed = parseLicenseCsv(text);
      }

      const next = mergeAndDedupeLicenses(currentLicenseAnswers, parsed, currentAppendToExisting);
      setFieldValue(name, next);
      if (input) input.value = '';
    } catch (err) {
      const msg = (err as Error).message || 'Failed to process file.';
      toast.error(msg);
      if (input) input.value = '';
    }
  }

  const onDropAccepted = useCallback(
    async (files: File[]) => {
      const file = files?.[0];
      if (!file) return;
      // Use current values from formik context to avoid stale closure
      const currentValues = values[name] as LicenseQuestionAnswer[];
      const currentLicenseAnswers = currentValues || [];
      await processCsvFile(file, null, currentLicenseAnswers, appendToExisting);
    },
    [appendToExisting, name, values]
  );

  const onDropRejected = useCallback(() => {
    const msg = 'Invalid file type. Please upload a CSV, XLSX, or XLS file.';
    toast.error(msg);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    noClick: true,
    onDropAccepted: (files) => {
      void onDropAccepted(files);
    },
    onDropRejected,
  });

  const handleClearAll = () => {
    setFieldValue(name, []);
  };

  return (
    <FieldArray name={name}>
      {(arrayHelpers) => (
        <div>
          <div className='d-flex justify-content-between gap-2 flex-wrap align-items-center mb-4'>
            <h5 className='mb-0'>State Licenses Management</h5>
            <button
              type='button'
              onClick={() => handleAddLicense(arrayHelpers)}
              className='btn btn-primary text-capitalize d-flex align-items-center gap-2'
            >
              <FaPlus size={14} />
              Add new state license
            </button>
          </div>

          <div className='mb-3 row g-4'>
            <div className='col-xl-6'>
              <div className='alert alert-info tw-h-full'>
                <h6 className='mb-2'>📋 How to Add Your Licenses:</h6>
                <div className='mb-3'>
                  <strong>Option 1: Manual Entry</strong>
                  <ul className='mb-2 ps-3'>
                    <li>Click the {'"Add new state license"'} button above to add licenses one by one</li>
                  </ul>
                </div>
                <div>
                  <strong>Option 2: File Upload (for multiple licenses)</strong>
                  <ul className='mb-0 ps-3'>
                    <li>
                      <strong>Step 1:</strong> Download the XLSX template using the button below
                    </li>
                    <li>
                      <strong>Step 2:</strong> Fill in your license information in the template
                    </li>
                    <li>
                      <strong>Step 3:</strong> Upload the completed file (XLSX, XLS, or CSV) using the upload button
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className='col-xl-6'>
              <div className='alert alert-warning tw-h-full'>
                <h6 className='mb-2'>⚠️ Important File Requirements:</h6>
                <ul className='mb-0 ps-3'>
                  <li>
                    Supported formats: <strong>XLSX, XLS, CSV</strong>
                  </li>
                  <li>
                    Each state can only appear <strong>once</strong> in the file
                  </li>
                  <li>
                    Expiration dates should be in <strong>MM-DD-YYYY</strong> format (recommended)
                    <div className='mt-1'>
                      <small className='text-muted'>Example: 12-31-2024, 2-9-2026</small>
                    </div>
                  </li>
                  <li>License numbers are required (format will be validated by backend)</li>
                  <li>When appending to existing licenses, duplicate states will be rejected</li>
                </ul>
              </div>
            </div>

            <div className='d-flex align-items-center flex-wrap gap-3'>
              <a
                href={process.env.NEXT_PUBLIC_API_URL + '/providers/licenses/template'}
                target='_blank'
                rel='noopener noreferrer'
                className='btn btn-outline-primary d-inline-flex align-items-center gap-2'
              >
                <FaDownload />
                Download XLSX template
              </a>
              <button
                type='button'
                onClick={open}
                className='btn btn-outline-primary d-inline-flex align-items-center gap-2'
              >
                <FaFileCsv />
                Upload File (CSV, XLSX, XLS)
              </button>
              <div className='form-check d-flex align-items-center gap-2 flex-grow-1'>
                <input
                  className='form-check-input !tw-p-3'
                  type='checkbox'
                  id='appendToggle'
                  checked={appendToExisting}
                  onChange={(e) => setAppendToExisting(e.target.checked)}
                />
                <label htmlFor='appendToggle' className='form-check-label'>
                  Append to existing
                </label>
              </div>
              <button
                type='button'
                onClick={handleClearAll}
                className='btn btn-outline-danger d-inline-flex align-items-center gap-2'
              >
                <FaTrash />
                Clear all
              </button>
            </div>
          </div>

          <div
            {...getRootProps({
              className: 'border rounded-1 p-3 mb-3 bg-light text-muted text-center w-100',
            })}
          >
            <input {...getInputProps()} />
            {isDragActive
              ? 'Drop the file here...'
              : 'Drag and drop CSV, XLSX, or XLS file here, or use the button above. Dates should be in MM-DD-YYYY format (e.g., 12-31-2025 or 2-9-2026).'}
          </div>

          {fieldError && isTouched && (
            <div className='alert alert-danger'>
              {typeof fieldError === 'string'
                ? fieldError
                : 'Please complete all required fields (state, license number, and expiration date).'}
            </div>
          )}

          <div className='license-list'>
            <div className='d-flex justify-content-between align-items-center mb-2'>
              <small className='text-muted'>Total licenses: {licenseAnswers.length}</small>
            </div>
            <div className='tw-flex tw-flex-col tw-gap-y-5'>
              {licenseAnswers.map((license, index) => (
                <LicenseQuestionCard
                  key={index}
                  id={`license-${index}`}
                  license={license}
                  stateOptions={stateOptions}
                  handleDateChange={(date) => handleDateChange(index, date)}
                  handleRemoveLicense={() => handleRemoveLicense(arrayHelpers, index)}
                  licenseAnswers={licenseAnswers}
                  currentIndex={index}
                  handleStateChange={(value) => handleStateChange(index, value)}
                  handleLicenseNumberChange={(value) => handleLicenseNumberChange(index, value)}
                  stateError={itemErrors[index]?.state}
                  expiryDateError={itemErrors[index]?.expiryDate as unknown as string}
                  licenseNumberError={itemErrors[index]?.licenseNumber}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </FieldArray>
  );
}
