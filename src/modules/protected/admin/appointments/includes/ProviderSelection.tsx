import ProviderDropdown from './ProviderDropdown';

interface Props {
  selectAll: boolean;
  setSelectAll: (v: boolean) => void;
  selectedRowsCount: number;
  assignTo?: string;
  setAssignTo: (v?: string) => void;
  onAssign: () => void;
  assignLoading: boolean;
}

export default function ProviderSelection({
  selectAll,
  setSelectAll,
  selectedRowsCount,
  assignTo,
  setAssignTo,
  onAssign,
  assignLoading,
}: Props) {
  return (
    <div className='d-flex flex-column flex-sm-row align-items-sm-center gap-3 mt-2'>
      <div className='d-flex align-items-center gap-2'>
        <input
          type='checkbox'
          id='selectAll'
          checked={selectAll}
          onChange={(e) => setSelectAll(e.target.checked)}
          className='mt-1 text-muted me-0 c_checkbox'
          style={{ transform: 'scale(1.1)' }}
        />
        <label htmlFor='selectAll' className='text-muted cursor-pointer text-sm'>
          Select All
        </label>
      </div>

      <div className='d-flex flex-column flex-sm-row align-items-sm-center gap-2'>
        <ProviderDropdown value={assignTo} onChange={setAssignTo} className='text-muted text-sm' />

        <button
          className='btn btn-sm ms-1'
          style={{
            padding: '6px 12px',
            backgroundColor: '#373739',
            borderColor: '#373739',
            color: 'white',
            whiteSpace: 'nowrap',
          }}
          onClick={selectedRowsCount === 0 || !assignTo || assignLoading ? undefined : onAssign}
        >
          {assignLoading ? 'Assigning...' : 'Assign'}
        </button>
      </div>
    </div>
  );
}
