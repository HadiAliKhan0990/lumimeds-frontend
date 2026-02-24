'use client';
import StateCard from './state-card';
import type { StateItem } from '../../../../../store/slices/licensedStatesSlice';
import { useSelector } from 'react-redux';
import { selectLicensedStates, selectSearch, selectLoading } from '../../../../../store/slices/licensedStatesSlice';
import Loading from '@/components/Dashboard/Loading';

type Props = {
  setEditing: (state: StateItem) => void;
};

export default function StateList({ setEditing }: Props) {
  const states = useSelector(selectLicensedStates);
  const search = useSelector(selectSearch);
  const loading = useSelector(selectLoading);

  const filtered = states.filter((s: StateItem) => s.name.toLowerCase().includes(search.toLowerCase()));

  // Show loading state when loading and no states yet
  if (loading && states.length === 0) {
    return (
      <div className='d-flex justify-content-center align-items-center py-5'>
        <Loading size={50} />
      </div>
    );
  }

  // Show empty state when no states found
  if (!loading && filtered.length === 0) {
    return (
      <div className='d-flex justify-content-center align-items-center py-5'>
        <div className='text-center'>
          <div className='text-muted mb-2'>
            {search ? 'No states found matching your search.' : 'No licensed states found.'}
          </div>
          {!search && <div className='text-muted small'>Click &quot;Add More States&quot; to get started.</div>}
        </div>
      </div>
    );
  }

  return (
    <div className='row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5'>
      {filtered.map((state: StateItem, index: number) => (
        <div key={`state-${state.id}-${index}`} className='col'>
          <StateCard {...state} onEdit={setEditing} />
        </div>
      ))}
    </div>
  );
}
