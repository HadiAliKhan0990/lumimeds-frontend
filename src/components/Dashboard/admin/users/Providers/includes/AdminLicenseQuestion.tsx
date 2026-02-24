import toast from 'react-hot-toast';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { LicenseQuestionAnswer, ProviderSurveyFormValues } from '@/services/providerIntake/types';
import { FaPlus, FaFileCsv, FaDownload } from 'react-icons/fa6';
import { BsInfoCircle } from 'react-icons/bs';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { useMemo, useState, useRef } from 'react';
import { AdminLicenseQuestionCard } from './AdminLicenseQuestionCard';
import { SingleValue } from 'react-select';
import { mergeLicenses, parseLicenseCsv, parseLicenseExcel } from '@/lib/licensesCsv';
import { Tooltip } from '@/components/elements';

interface Props {
  name: string;
  question: SurveyQuestion;
}

type LicenseErrors = Array<{ state?: string; expiryDate?: string; licenseNumber?: string }>;

export function AdminLicenseQuestion({ name, question }: Readonly<Props>) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { values, setFieldValue, errors, touched } = useFormikContext<ProviderSurveyFormValues>();

  const licenseAnswers = (values[name] as LicenseQuestionAnswer[]) || [];
  const fieldError = errors[name];
  const isTouched = touched[name];

  const itemErrors = Array.isArray(fieldError) ? (fieldError as LicenseErrors) : [];

  const [appendToExisting, setAppendToExisting] = useState<boolean>(true);

  const stateOptions = useMemo(() => {
    // Handle edge case: question.options might be undefined or empty
    const validStateNames = question.options || [];
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
  }, [question.options, licenseAnswers]);

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
    const apiStateNames = question.options || [];
    const matchingApiState = apiStateNames.find((apiState) => apiState.toLowerCase() === selectedState.toLowerCase());
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

  const parseCsvText = (text: string) => {
    return parseLicenseCsv(text);
  };

  const parseExcelBuffer = (buffer: ArrayBuffer) => {
    return parseLicenseExcel(buffer);
  };

  const mergeAndDedupeLicenses = (
    existing: LicenseQuestionAnswer[],
    incoming: LicenseQuestionAnswer[],
    shouldAppend: boolean
  ) => {
    return mergeLicenses(existing, incoming, shouldAppend);
  };

  const processCsvFile = async (
    file: File,
    input: HTMLInputElement | null | undefined,
    currentLicenseAnswers: LicenseQuestionAnswer[],
    currentAppendToExisting: boolean
  ) => {
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

      const isExcel =
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.xls') ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';

      if (isExcel) {
        const arrayBuffer = await file.arrayBuffer();
        parsed = parseExcelBuffer(arrayBuffer);
      } else {
        const text = await file.text();
        parsed = parseCsvText(text);
      }

      const next = mergeAndDedupeLicenses(currentLicenseAnswers, parsed, currentAppendToExisting);
      setFieldValue(name, next);
      if (input) input.value = '';
      toast.success('Licenses imported successfully!');
    } catch (err) {
      const msg = (err as Error).message || 'Failed to process file.';
      toast.error(msg);
      if (input) input.value = '';
    }
  };

  // Dropzone setup (not currently used, but available for future drag & drop feature)
  // const onDropAccepted = useCallback(
  //   async (files: File[]) => {
  //     const file = files?.[0];
  //     if (file) await processCsvFile(file);
  //   },
  //   [licenseAnswers, appendToExisting, name, question.options]
  // );
  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   onDropAccepted,
  //   accept: {
  //     'text/csv': ['.csv'],
  //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  //     'application/vnd.ms-excel': ['.xls'],
  //   },
  //   multiple: false,
  // });

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use current values from formik context to avoid stale closure
      const currentValues = values[name] as LicenseQuestionAnswer[];
      const currentLicenseAnswers = currentValues || [];
      await processCsvFile(file, e.target, currentLicenseAnswers, appendToExisting);
    }
  };

  const handleDownloadTemplate = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const downloadUrl = `${baseUrl}/providers/licenses/template`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <FieldArray name={name}>
      {(arrayHelpers) => (
        <div>
          <div className='d-flex justify-content-between gap-2 flex-wrap align-items-center tw-mb-4'>
            <div className='d-flex align-items-center gap-2'>
              <h5 className='mb-0'>State Licenses Management</h5>
              <Tooltip
                content={
                  <div className='text-start tw-max-w-96'>
                    <strong>How to Add Licenses:</strong>
                    <br />
                    <strong>Option 1: Manual Entry</strong>
                    <br />
                    • Click &quot;Add new state license&quot; button to add one by one
                    <br />
                    <br />
                    <strong>Option 2: File Upload (Multiple Licenses)</strong>
                    <br />
                    • Step 1: Download XLSX template
                    <br />
                    • Step 2: Fill in license information
                    <br />
                    • Step 3: Upload file (XLSX, XLS, or CSV)
                    <br />
                    <br />
                    <strong>⚠️ Important Requirements:</strong>
                    <br />
                    • Supported formats: XLSX, XLS, CSV
                    <br />
                    • Each state can only appear once
                    <br />
                    • Dates should be in MM-DD-YYYY format (recommended)
                    <br />
                    • Example: 12-31-2024, 2-9-2026
                    <br />• License numbers are required (format validated by backend)
                  </div>
                }
                position='bottom'
              >
                <span className='d-flex align-items-center text-muted tw-cursor-help'>
                  <BsInfoCircle className='tw-size-4' />
                </span>
              </Tooltip>
            </div>
            <div className='d-flex gap-2 flex-wrap'>
              <button
                type='button'
                onClick={() => handleAddLicense(arrayHelpers)}
                className='btn btn-primary text-capitalize d-flex align-items-center gap-2'
              >
                <FaPlus size={14} />
                Add new state license
              </button>
              <button
                type='button'
                onClick={handleDownloadTemplate}
                className='btn btn-outline-primary d-flex align-items-center gap-2'
              >
                <FaDownload size={14} />
                Download Template
              </button>
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='btn btn-outline-primary d-flex align-items-center gap-2'
              >
                <FaFileCsv size={14} />
                Upload File
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type='file'
            accept='.csv,.xlsx,.xls'
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />

          {/* <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded p-4 mb-4 text-center cursor-pointer ${
              isDragActive ? 'border-primary bg-light' : 'border-secondary'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className='mb-0 text-primary'>Drop the file here...</p>
            ) : (
              <div>
                <FaFileCsv className='text-muted mb-2' size={32} />
                <p className='mb-0 text-muted'>Drag & drop a CSV/XLSX file here, or click "Upload File" button</p>
                <small className='text-muted'>File format: State, License, Expiration (MM-DD-YYYY)</small>
              </div>
            )}
          </div> */}

          {licenseAnswers.length > 0 && (
            <div className='mb-3'>
              <div className='form-check'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  id='appendToExisting'
                  checked={appendToExisting}
                  onChange={(e) => setAppendToExisting(e.target.checked)}
                />
                <label className='form-check-label' htmlFor='appendToExisting'>
                  Append to existing licenses (uncheck to replace all)
                </label>
              </div>
            </div>
          )}

          {licenseAnswers.length === 0 ? (
            <div className='alert alert-info'>
              <p className='mb-0'>No licenses added yet. Click &quot;Add new state license&quot; to get started.</p>
            </div>
          ) : (
            <div className='d-flex flex-column gap-3 license-cards-scrollable tw-overflow-y-auto tw-pr-2 tw-max-h-96'>
              {licenseAnswers.map((license, index) => {
                const itemError = itemErrors[index] || {};
                return (
                  <AdminLicenseQuestionCard
                    key={index}
                    id={`license-${index}`}
                    license={license}
                    handleRemoveLicense={() => handleRemoveLicense(arrayHelpers, index)}
                    handleStateChange={(selected) => handleStateChange(index, selected)}
                    handleDateChange={(date) => handleDateChange(index, date)}
                    handleLicenseNumberChange={(value) => handleLicenseNumberChange(index, value)}
                    stateOptions={stateOptions}
                    licenseAnswers={licenseAnswers}
                    currentIndex={index}
                    stateError={typeof itemError.state === 'string' ? itemError.state : undefined}
                    expiryDateError={typeof itemError.expiryDate === 'string' ? itemError.expiryDate : undefined}
                    licenseNumberError={
                      typeof itemError.licenseNumber === 'string' ? itemError.licenseNumber : undefined
                    }
                  />
                );
              })}
            </div>
          )}

          {isTouched && typeof fieldError === 'string' && (
            <div className='invalid-feedback d-block mt-2'>{fieldError}</div>
          )}
        </div>
      )}
    </FieldArray>
  );
}
