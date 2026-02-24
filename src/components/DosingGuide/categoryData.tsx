import { Column, Table } from '@/components/Dashboard/Table';

interface DosingTableRow {
  weeklyDosing?: string;
  injectionInstructions?: string;
  weeklyDosingStandard?: string;
  injectionInstructionsStandard?: string;
  monthlyInstructions?: string;
  threeMonthInstructions?: string;
}

interface CategoryDataProps {
  title: string;
  subtitle: string;
  data: DosingTableRow[];
  standardData?: DosingTableRow[];
  isFirst?: boolean;
  isCombinedTable?: boolean;
  slug?: string;
}

export default function CategoryData({
  title,
  subtitle,
  data,
  standardData,
  isFirst = false,
  isCombinedTable = false,
  slug = '',
}: CategoryDataProps) {
  // For combined tables (Northwest/1st Choice), use the complete title as category
  // For other tables, split category and group
  let category: string;
  let group: string;

  if (isCombinedTable) {
    // For Northwest/1st Choice - use complete title as category
    category = title;
    group = '';
  } else {
    // For other pages - split on the last occurrence of ' (' to separate category from group
    const lastOpenParen = title.lastIndexOf(' (');
    category = lastOpenParen !== -1 ? title.substring(0, lastOpenParen) : title;
    group = lastOpenParen !== -1 ? title.substring(lastOpenParen + 2) : '';
  }

  // If isCombinedTable is true, use 3-column layout for Northwest/1st Choice
  const columns: Column<DosingTableRow>[] = isCombinedTable
    ? [
        {
          header: <span style={{ fontSize: '10px', fontWeight: 400 }}>WEEKLY DOSING</span>,
          accessor: 'weeklyDosing',
          className: 'tw-w-[15%] tw-p-3',
          renderCell: (row: DosingTableRow) => (
            <div
              style={{ fontSize: '10px', fontWeight: 400, fontFamily: 'Inter', whiteSpace: 'nowrap', color: '#6B7280' }}
            >
              {row.weeklyDosing || '-'}
            </div>
          ),
        },
        {
          header: <span style={{ fontSize: '10px', fontWeight: 400 }}>MONTHLY</span>,
          accessor: 'monthlyInstructions',
          className: 'tw-w-[42.5%] tw-p-3',
          renderCell: (row: DosingTableRow) => (
            <div
              style={{
                whiteSpace: 'pre-line',
                fontSize: '10px',
                fontWeight: 400,
                fontFamily: 'Inter',
                color: '#6B7280',
              }}
            >
              {row.monthlyInstructions || '-'}
            </div>
          ),
        },
        {
          header: <span style={{ fontSize: '10px', fontWeight: 400 }}>3-MONTH SUPPLY</span>,
          accessor: 'threeMonthInstructions',
          className: 'tw-w-[42.5%] tw-p-3',
          renderCell: (row: DosingTableRow) => (
            <div
              style={{
                whiteSpace: 'pre-line',
                fontSize: '10px',
                fontWeight: 400,
                fontFamily: 'Inter',
                color: '#6B7280',
              }}
            >
              {row.threeMonthInstructions || '-'}
            </div>
          ),
        },
      ]
    : standardData
    ? [
        {
          header: <span style={{ fontSize: '10px', fontWeight: 400 }}>WEEKLY DOSING (CUSTOM)</span>,
          accessor: 'weeklyDosing',
          className: 'tw-w-[1%] tw-p-3',
          renderCell: (row: DosingTableRow) => (
            <div
              style={{ fontSize: '10px', fontWeight: 400, fontFamily: 'Inter', whiteSpace: 'nowrap', color: '#6B7280' }}
            >
              {row.weeklyDosing || '-'}
            </div>
          ),
        },
        {
          header: <span style={{ fontSize: '10px', fontWeight: 400 }}>SIG / INJECTION INSTRUCTIONS</span>,
          accessor: 'injectionInstructions',
          className: 'tw-w-[48%] tw-p-3',
          renderCell: (row: DosingTableRow) => (
            <div
              style={{
                whiteSpace: 'pre-line',
                fontSize: '10px',
                fontWeight: 400,
                fontFamily: 'Inter',
                color: '#6B7280',
              }}
            >
              {row.injectionInstructions || '-'}
            </div>
          ),
        },
        {
          header: <span style={{ fontSize: '10px', fontWeight: 400 }}>WEEKLY DOSING (STANDARD)</span>,
          accessor: 'weeklyDosingStandard',
          className: 'tw-w-[1%] tw-p-3',
          renderCell: (row: DosingTableRow) => (
            <div
              style={{ fontSize: '10px', fontWeight: 400, fontFamily: 'Inter', whiteSpace: 'nowrap', color: '#6B7280' }}
            >
              {row.weeklyDosingStandard || '-'}
            </div>
          ),
        },
        {
          header: <span style={{ fontSize: '10px', fontWeight: 400 }}>SIG / INJECTION INSTRUCTIONS</span>,
          accessor: 'injectionInstructionsStandard',
          className: 'tw-w-[48%] tw-p-3',
          renderCell: (row: DosingTableRow) => (
            <div
              style={{
                whiteSpace: 'pre-line',
                fontSize: '10px',
                fontWeight: 400,
                fontFamily: 'Inter',
                color: '#6B7280',
              }}
            >
              {row.injectionInstructionsStandard || '-'}
            </div>
          ),
        },
      ]
    : [
        {
          header: <span style={{ fontSize: '10px', fontWeight: 400 }}>WEEKLY DOSING</span>,
          accessor: 'weeklyDosing',
          className: 'tw-w-[1%] tw-p-3',
          renderCell: (row: DosingTableRow) => (
            <div
              style={{ fontSize: '10px', fontWeight: 400, fontFamily: 'Inter', whiteSpace: 'nowrap', color: '#6B7280' }}
            >
              {row.weeklyDosing || '-'}
            </div>
          ),
        },
        {
          header: <span style={{ fontSize: '10px', fontWeight: 400 }}>SIG / INJECTION INSTRUCTIONS</span>,
          accessor: 'injectionInstructions',
          className: 'tw-w-[100%] tw-p-3',
          renderCell: (row: DosingTableRow) => (
            <div
              style={{
                whiteSpace: 'pre-line',
                fontSize: '10px',
                fontWeight: 400,
                fontFamily: 'Inter',
                color: '#6B7280',
              }}
            >
              {row.injectionInstructions || '-'}
            </div>
          ),
        },
      ];

  return (
    <div className={`tw-flex tw-flex-col tw-gap-4 ${!isFirst ? 'tw-mt-16' : ''}`}>
      <div className='tw-flex tw-gap-4'>
        <div className='tw-bg-gray-300 tw-p-0.5 tw-rounded-full' />
        <div className='tw-flex tw-flex-col tw-gap-1'>
          <div className='tw-flex tw-items-center tw-gap-1.5'>
            <h1 className='tw-text-base tw-font-semibold tw-mb-0'>Dosing Guide for {category}</h1>
            {group && !isCombinedTable && (
              <span
                className={
                  standardData ? 'tw-text-base tw-font-semibold' : 'tw-text-xs tw-font-normal tw-text-gray-600'
                }
              >
                {slug === 'olympia' || slug === 'mfv' ? group.replace(')', '') : `(${group.replace(')', '')})`}
              </span>
            )}
          </div>
          <div className='tw-text-xs tw-font-normal' style={{ whiteSpace: 'pre-line' }}>
            {subtitle}
          </div>
        </div>
      </div>
      <div
        className='hide-scrollbar-table'
        style={{
          borderRadius: '12px',
          overflow: 'auto',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        {data && data.length > 0 ? (
          <>
            <style
              dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar-table {
                  scrollbar-width: thin;
                  scrollbar-color: transparent transparent;
                }
                .hide-scrollbar-table:hover {
                  scrollbar-color: rgba(107, 114, 128, 0.5) transparent;
                }
                .hide-scrollbar-table::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                .hide-scrollbar-table::-webkit-scrollbar-track {
                  background: transparent;
                }
                .hide-scrollbar-table::-webkit-scrollbar-thumb {
                  background-color: transparent;
                  border-radius: 4px;
                }
                .hide-scrollbar-table:hover::-webkit-scrollbar-thumb {
                  background-color: rgba(107, 114, 128, 0.5);
                }
                .hide-scrollbar-table::-webkit-scrollbar-thumb:hover {
                  background-color: rgba(107, 114, 128, 0.7);
                }
                .dosing-table {
                  border-collapse: separate !important;
                  border-spacing: 0 !important;
                  width: 100% !important;
                }
                .dosing-table th {
                  border-right: 1px solid #e5e7eb !important;
                  border-bottom: 1px solid #e5e7eb !important;
                }
                .dosing-table th:last-child {
                  border-right: none !important;
                }
                .dosing-table td {
                  border-right: 1px solid #e5e7eb !important;
                  border-bottom: 1px solid #e5e7eb !important;
                }
                .dosing-table td:last-child {
                  border-right: none !important;
                }
                .dosing-table tbody tr:last-child td {
                  border-bottom: none !important;
                }
              `,
              }}
            />
            <Table
              data={data}
              columns={columns}
              tableClassName='dosing-table'
              headerBgClassName='!tw-bg-[#F5F9FF]'
              bodyCellClassName='tw-p-3 tw-bg-white'
            />
          </>
        ) : (
          <div className='tw-text-center tw-py-8'>
            <p className='tw-text-gray-500'>No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
