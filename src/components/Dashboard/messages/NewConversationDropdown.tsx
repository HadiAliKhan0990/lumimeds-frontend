import { Dropdown, DropdownItem } from '@/components/elements/Dropdown';
import { AppDispatch } from '@/store';
import { setIsBlaseMessaging } from '@/store/slices/blaseMessagingSlice';
import { setIsNewMessage } from '@/store/slices/chatSlice';
import { useState } from 'react';
import { LuSquarePen } from 'react-icons/lu';
import { MdOutlineMoreHoriz, MdCampaign } from 'react-icons/md';
import { useDispatch } from 'react-redux';

interface Props {
  handleRoleSelection: () => Promise<void>;
  handleNewMessage: () => Promise<void>;
}

export const NewConversationDropdown = ({ handleRoleSelection, handleNewMessage }: Readonly<Props>) => {
  const dispatch = useDispatch<AppDispatch>();

  const [isOpen, setIsOpen] = useState(false);

  const handleClickNewMessage = () => {
    handleRoleSelection();
    handleNewMessage();
    dispatch(setIsBlaseMessaging(false));
    setIsOpen(false);
  };

  const handleClickBlastMessage = () => {
    dispatch(setIsBlaseMessaging(true));
    dispatch(setIsNewMessage(false));
    setIsOpen(false);
  };

  return (
    <Dropdown
      className='tw-h-full tw-flex-shrink-0'
      triggerClassName='tw-h-[38px] tw-w-[38px] tw-text-neutral-600 tw-flex-shrink-0 tw-border tw-border-light-grey-medium tw-border-solid'
      trigger={<MdOutlineMoreHoriz className='tw-flex-shrink-0 tw-w-7 tw-h-7' />}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <DropdownItem onClick={handleClickNewMessage}>
        <LuSquarePen size={20} />
        <span>Start a new conversation</span>
      </DropdownItem>
      <DropdownItem onClick={handleClickBlastMessage}>
        <MdCampaign size={20} />
        <span>Send blast messages</span>
      </DropdownItem>
    </Dropdown>
  );
};
