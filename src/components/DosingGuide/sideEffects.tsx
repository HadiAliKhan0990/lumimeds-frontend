import { Column, Table } from '@/components/Dashboard/Table';
import Link from 'next/link';

interface SideEffectsProps {
  data: {
    title: string;
    introText: string;
    safetyInfoLink: string;
    question: string;
    options: Array<{
      type: string;
      title: string;
      description: string;
      subDescription?: string;
      action: string;
      note?: string;
    }>;
  };
}

export default function SideEffects({ data }: SideEffectsProps) {
  // Transform the options data into table format
  const tableData = data.options.map((option) => {
    // Create bullet points for the description column
    let descriptionText = option.description;
    if (option.subDescription) {
      const bulletPoints = option.subDescription
        .split(', ')
        .map((point) => `• ${point}`)
        .join('\n');
      descriptionText = `${option.description}\n${bulletPoints}`;
    }

    return {
      sideEffectType: option.description,
      description: descriptionText,
      nextStep: option.action,
    };
  });

  const columns: Column<(typeof tableData)[0]>[] = [
    {
      header: (
        <span style={{ fontSize: '10px', fontWeight: 400, whiteSpace: 'normal', wordBreak: 'break-word' }}>
          HOW WOULD YOU DESCRIBE YOUR SIDE EFFECTS?
        </span>
      ),
      accessor: 'description',
      className: 'text-start fw-bold tw-w-[50%] tw-p-3',
      renderCell: (row: (typeof tableData)[0]) => (
        <div
          style={{ whiteSpace: 'pre-line', fontSize: '10px', fontWeight: 400, fontFamily: 'Inter', color: '#6B7280' }}
        >
          {row.description}
        </div>
      ),
    },
    {
      header: (
        <span style={{ fontSize: '10px', fontWeight: 400, whiteSpace: 'normal', wordBreak: 'break-word' }}>
          NEXT STEP:
        </span>
      ),
      accessor: 'nextStep',
      className: 'text-start tw-w-[50%] tw-p-3',
      renderCell: (row: (typeof tableData)[0]) => (
        <div
          style={{ whiteSpace: 'pre-line', fontSize: '10px', fontWeight: 400, fontFamily: 'Inter', color: '#6B7280' }}
        >
          {row.nextStep}
        </div>
      ),
    },
  ];

  return (
    <div className='tw-flex tw-flex-col tw-gap-4 tw-mt-16'>
      <div className='tw-flex tw-gap-4'>
        <div className='tw-bg-gray-300 tw-p-0.5 tw-rounded-full' />
        <div className='tw-flex tw-flex-col tw-gap-0'>
          <div className='tw-flex tw-flex-col tw-gap-1'>
            <div className='tw-flex tw-items-center tw-gap-1.5'>
              <h1 className='tw-text-base tw-font-semibold tw-mb-0'>{data.title}</h1>
            </div>
            <div className='tw-text-xs tw-font-normal' style={{ whiteSpace: 'pre-line' }}>
              {data.introText}
            </div>
          </div>
          {/* Safety Info Link */}
          <div className=''>
            <span className='tw-text-xs tw-font-normal tw-text-black'>Read more about your medication here: </span>
            <Link
              href='/faqs'
              className='tw-text-xs tw-font-medium tw-text-[#3060FE] tw-no-underline hover:tw-underline tw-cursor-pointer'
            >
              Safety information for Compounded Semaglutide (GLP-1), Compounded Tirzepatide (GLP-1/GIP) injections. →
            </Link>
          </div>
        </div>
      </div>
      <div
        className='hide-scrollbar-side-effects'
        style={{
          borderRadius: '12px',
          overflow: 'auto',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        {tableData && tableData.length > 0 ? (
          <>
            <style
              dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar-side-effects {
                  scrollbar-width: thin;
                  scrollbar-color: transparent transparent;
                }
                .hide-scrollbar-side-effects:hover {
                  scrollbar-color: rgba(107, 114, 128, 0.5) transparent;
                }
                .hide-scrollbar-side-effects::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                .hide-scrollbar-side-effects::-webkit-scrollbar-track {
                  background: transparent;
                }
                .hide-scrollbar-side-effects::-webkit-scrollbar-thumb {
                  background-color: transparent;
                  border-radius: 4px;
                }
                .hide-scrollbar-side-effects:hover::-webkit-scrollbar-thumb {
                  background-color: rgba(107, 114, 128, 0.5);
                }
                .hide-scrollbar-side-effects::-webkit-scrollbar-thumb:hover {
                  background-color: rgba(107, 114, 128, 0.7);
                }
                .side-effects-table {
                  table-layout: fixed !important;
                  width: 100% !important;
                  border-collapse: separate !important;
                  border-spacing: 0 !important;
                }
                .side-effects-table th {
                  border-right: 1px solid #e5e7eb !important;
                  border-bottom: 1px solid #e5e7eb !important;
                  white-space: normal !important;
                  word-break: break-word !important;
                }
                .side-effects-table th:last-child {
                  border-right: none !important;
                }
                .side-effects-table td {
                  border-right: 1px solid #e5e7eb !important;
                  border-bottom: 1px solid #e5e7eb !important;
                }
                .side-effects-table td:last-child {
                  border-right: none !important;
                }
                .side-effects-table tbody tr:last-child td {
                  border-bottom: none !important;
                }
              `,
              }}
            />
            <Table
              data={tableData}
              columns={columns}
              tableClassName='side-effects-table'
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
