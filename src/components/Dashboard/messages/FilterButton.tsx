import { RootState } from '@/store';
import { ConversationFilter } from '@/store/slices/chatSlice';
import { ButtonHTMLAttributes, useMemo } from 'react';
import { useSelector } from 'react-redux';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  index: number;
  handleFilterConversations: (filter: ConversationFilter) => void;
}

export const FilterButton = ({ title, index, handleFilterConversations }: Props) => {
  const { conversationFilter, conversationsMeta, selectedRole } = useSelector((state: RootState) => state.chat);

  const meta = useMemo(() => {
    if (selectedRole === 'admin') return conversationsMeta.admin;
    if (selectedRole === 'patient') return conversationsMeta.patient;
    return conversationsMeta.provider;
  }, [selectedRole, conversationsMeta]);

  const { stats } = meta || {};
  const counts = [stats?.totalConversations || 0, stats?.unreadConversations || 0, stats?.unresolvedConversations || 0];

  return (
    <button
      className={`chat-tab rounded h-100 px-3 d-flex align-items-center gap-1 justify-content-center text-nowrap ${
        conversationFilter === title ? 'selected-all' : ''
      }`}
      onClick={() => handleFilterConversations(title as ConversationFilter)}
    >
      {title}
      {counts[index] > 0 && (
        <span className='user-msg-notification bg-danger d-flex align-items-center justify-content-center text-white text-nowrap rounded'>
          {counts[index]}
        </span>
      )}
    </button>
  );
};
