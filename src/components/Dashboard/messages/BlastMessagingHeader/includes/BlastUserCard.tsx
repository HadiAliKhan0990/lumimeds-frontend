import { ChatUserType } from '@/services/chat/types';
import { AppDispatch, RootState } from '@/store';
import { setIsSelectedAll, addSelectedUser, removeSelectedUser } from '@/store/slices/blaseMessagingSlice';
import { ChangeEvent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatUSDate } from '@/helpers/dateFormatter';

interface Props {
  user: ChatUserType;
}

export const BlastUserCard = ({ user }: Readonly<Props>) => {
  const dispatch = useDispatch<AppDispatch>();

  const { selectedUserIds, isSelectedAll } = useSelector((state: RootState) => state.blaseMessaging);

  const handleSelectUser = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.checked) {
      dispatch(addSelectedUser(user));
    } else {
      dispatch(removeSelectedUser(user.id));
    }

    if (selectedUserIds.length === 1 && !e.currentTarget.checked) {
      dispatch(setIsSelectedAll(false));
    }
  };

  const isSelected = useMemo(
    () => selectedUserIds.includes(user.id) || isSelectedAll,
    [selectedUserIds, user.id, isSelectedAll]
  );

  return (
    <label className='tw-w-full tw-cursor-pointer tw-select-none animatedCheckboxContainer tw-rounded-lg tw-flex tw-items-center tw-gap-2'>
      <span className='tw-rounded-full tw-text-sm tw-font-medium tw-w-8 tw-h-8 tw-min-w-8 tw-min-h-8 tw-uppercase tw-bg-neutral-100 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0' style={{ aspectRatio: '1/1' }}>
        {user.firstName[0]}
      </span>
      <span className='tw-font-medium tw-text-sm tw-flex-grow'>
        <span className='tw-capitalize'>{[user.firstName, user.lastName].filter(Boolean).join(' ')}</span>
        {user.dob && (
          <>
            {' - '}
            {formatUSDate(user.dob)}
          </>
        )}
        {user.email && (
          <>
            {' - '}
            <span className='tw-normal-case'>{user.email}</span>
          </>
        )}
      </span>

      <input type='checkbox' hidden onChange={handleSelectUser} checked={isSelected} />
      <svg className='tw-overflow-visible tw-w-4 tw-h-4 tw-flex-shrink-0' viewBox='0 0 64 64'>
        <path
          d='M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16'
          pathLength='575.0541381835938'
          className='animatedCheckboxContainerPath tw-stroke-zinc-500'
        />
      </svg>
    </label>
  );
};
