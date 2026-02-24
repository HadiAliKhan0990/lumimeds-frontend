import { IoClose } from 'react-icons/io5';
import { UsersDialog } from './includes/UsersDialog';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  setIsBlaseMessaging,
  setIsDialogOpen,
  setSelectedUsers,
  setIsSelectedAll,
  removeSelectedUser,
} from '@/store/slices/blaseMessagingSlice';
import { useWindowWidth } from '@/hooks/useWindowWidth';

export const BlastMessagingHeader = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { windowWidth } = useWindowWidth();

  const { isSelectedAll, selectedUsers, isDialogOpen } = useSelector((state: RootState) => state.blaseMessaging);

  const handleCancel = () => {
    dispatch(setIsBlaseMessaging(false));
    dispatch(setIsDialogOpen(false));
    dispatch(setIsSelectedAll(false));
    dispatch(setSelectedUsers([]));
  };

  const handleOpenDialog = () => {
    dispatch(setIsDialogOpen(true));
  };

  const handleRemoveUser = (userId: string) => {
    dispatch(removeSelectedUser(userId));

    // Auto-cancel if this is the last user and dialog is closed
    const remainingUsers = selectedUsers.filter((user) => user.id !== userId);
    if (!isSelectedAll && remainingUsers.length === 0 && !isDialogOpen) {
      handleCancel();
    }
  };

  const renderSelectedUsers = () => {
    if (isSelectedAll) {
      return (
        <div className='tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-primary tw-font-medium tw-rounded-md tw-bg-primary-light tw-px-2 tw-py-1'>
          <span>All Patients</span>
          <IoClose
            size={16}
            className='tw-cursor-pointer tw-text-red-500'
            onClick={() => {
              dispatch(setIsSelectedAll(false));
              dispatch(setSelectedUsers([]));

              // Auto-cancel if dialog is closed
              if (!isDialogOpen) {
                handleCancel();
              }
            }}
          />
        </div>
      );
    }

    if (selectedUsers.length > 0) {
      const maxVisible = windowWidth > 768 ? 7 : 3;
      const visibleUsers = selectedUsers.slice(0, maxVisible);
      const remainingCount = selectedUsers.length - maxVisible;

      return (
        <>
          {visibleUsers.map((user) => (
            <div
              key={user.id}
              className='tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-primary tw-font-medium tw-rounded-md tw-bg-primary-light tw-px-2 tw-py-1'
            >
              <span className='tw-capitalize'>
                {user.firstName} {user.lastName}
              </span>
              <IoClose
                size={16}
                className='tw-cursor-pointer tw-text-red-500'
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveUser(user.id);
                }}
              />
            </div>
          ))}
          {remainingCount > 0 && (
            <button
              onClick={handleOpenDialog}
              className='tw-flex tw-items-center tw-gap-1 tw-text-xs tw-font-medium tw-rounded-md tw-bg-neutral-200 tw-px-2 tw-py-1 hover:tw-bg-neutral-300 tw-transition-colors'
            >
              <span>+{remainingCount} more</span>
            </button>
          )}
        </>
      );
    }
  };

  return (
    <div className='tw-relative tw-flex tw-items-center tw-justify-between tw-gap-3 tw-p-3 md:tw-p-6 tw-border-b tw-border-black-alpha'>
      <div className='tw-flex-1'>
        <div className='tw-flex tw-items-center tw-gap-2 tw-mb-1'>
          <span className='tw-text-sm tw-text-neutral-700'>Role:</span>
          <div className='tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-primary tw-font-medium tw-rounded-md tw-bg-primary-light tw-px-2 tw-py-1'>
            <span>Patient</span>
            <IoClose size={16} className='tw-cursor-pointer tw-text-red-500' onClick={handleCancel} />
          </div>
        </div>
        <div className='tw-flex tw-gap-2 tw-items-start'>
          <span className='tw-text-sm tw-text-neutral-700 tw-flex-shrink-0 tw-mt-1'>To:</span>
          <div className='tw-flex tw-items-center tw-gap-2 tw-flex-wrap'>
            {renderSelectedUsers()}
            {(isSelectedAll || selectedUsers.length > 0) && (
              <button
                type='button'
                onClick={handleOpenDialog}
                className='tw-text-xs tw-text-primary tw-font-medium hover:tw-underline tw-p-0'
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
      <button type='button' className='btn btn-sm btn-outline-primary' onClick={handleCancel}>
        Cancel
      </button>
      <UsersDialog />
    </div>
  );
};
