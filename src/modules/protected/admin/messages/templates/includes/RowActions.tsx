import { Dropdown, DropdownItem } from '@/components/elements';
import { MessageTemplateType } from '@/store/slices/messageTemplatesApiSlice';
import { TfiMoreAlt } from 'react-icons/tfi';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Props {
  template: MessageTemplateType;
  onEdit: (template: MessageTemplateType) => void;
  onDelete: (template: MessageTemplateType) => void;
}

export const RowActions = ({ template, onEdit, onDelete }: Readonly<Props>) => {
  return (
    <Dropdown trigger={<TfiMoreAlt size={20} />} align='right'>
      <DropdownItem as='button' onClick={() => onEdit(template)}>
        <FiEdit2 size={16} className='me-2' />
        Edit Template
      </DropdownItem>
      <DropdownItem as='button' onClick={() => onDelete(template)} className='text-danger'>
        <FiTrash2 size={16} className='me-2' />
        Delete Template
      </DropdownItem>
    </Dropdown>
  );
};
