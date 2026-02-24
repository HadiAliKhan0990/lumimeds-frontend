'use client';

import { formatFieldName, renderFieldValue } from '@/helpers/surveyResponses';
import { JSONRendererProps } from '@/types/surveyResponsesList';

export function JSONRenderer({ data, variant = 'patient' }: Readonly<JSONRendererProps>) {
  if (variant === 'admin') {
    return <JSONRendererAdmin data={data} />;
  }
  return <JSONRendererPatient data={data} />;
}

// Admin variant - renders as table
function JSONRendererAdmin({ data }: Readonly<{ data: object }>) {
  const keys = Object.keys(data);

  return (
    <div className='tw-space-y-3 mt-2'>
      {keys.map((key) => (
        <div key={key} className='table-responsive'>
          <h5>{formatFieldName(key)}</h5>
          <table className='table table-centered table-borderless text-center position-relative c_datatable'>
            <thead className='table-light'>
              <tr>
                {data[key as keyof typeof data] &&
                  typeof data[key as keyof typeof data] === 'object' &&
                  Object.keys(data[key as keyof typeof data]).length > 0 &&
                  Object.keys(data[key as keyof typeof data]).map((nestedKey) => (
                    <th key={nestedKey} className='text-nowrap text-uppercase tw-font-normal tw-text-sm tw-p-3'>
                      {formatFieldName(nestedKey)}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {data[key as keyof typeof data] &&
                  typeof data[key as keyof typeof data] === 'object' &&
                  Object.keys(data[key as keyof typeof data]).length > 0 &&
                  Object.keys(data[key as keyof typeof data]).map((nestedKey) => (
                    <td key={nestedKey} className='text-nowrap text-uppercase tw-font-normal tw-text-sm tw-p-3'>
                      {renderFieldValue(data[key as keyof typeof data][nestedKey as keyof typeof data])}
                    </td>
                  ))}
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// Patient variant - renders as form fields
function JSONRendererPatient({ data }: Readonly<{ data: object }>) {
  const renderJSONFields = (obj: unknown, parentKey = ''): React.ReactElement[] => {
    if (!obj || typeof obj !== 'object') {
      return [];
    }

    const entries = Object.entries(obj);

    return entries.map(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      const isNestedObject = value && typeof value === 'object' && !Array.isArray(value);

      // If it's a nested object, render its fields recursively
      if (isNestedObject && Object.keys(value).length > 0) {
        return (
          <div key={fullKey} className='tw-space-y-3'>
            <div className='tw-flex tw-items-center tw-gap-2'>
              <div className='tw-flex-shrink-0 tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full'></div>
              <h4 className='tw-text-sm tw-font-bold tw-text-gray-700 tw-uppercase tw-tracking-wide'>
                {formatFieldName(key)}
              </h4>
            </div>
            <div className='tw-pl-4 tw-space-y-3'>{renderJSONFields(value, fullKey)}</div>
          </div>
        );
      }

      // Regular field
      return (
        <div key={fullKey}>
          <div className='tw-mb-2'>
            <label className='tw-block tw-text-sm tw-font-semibold tw-text-gray-700'>{formatFieldName(key)}</label>
          </div>
          <div className='tw-bg-gray-50 tw-rounded tw-px-3 tw-py-2 tw-border tw-border-gray-200'>
            <p className='tw-text-sm tw-text-gray-900 tw-break-words tw-whitespace-pre-wrap'>
              {renderFieldValue(value)}
            </p>
          </div>
        </div>
      );
    });
  };

  return <div className='tw-space-y-3 tw-max-h-96 tw-overflow-y-auto tw-pr-2'>{renderJSONFields(data)}</div>;
}