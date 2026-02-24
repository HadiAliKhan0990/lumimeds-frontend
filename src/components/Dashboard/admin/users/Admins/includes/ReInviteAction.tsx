import toast from 'react-hot-toast';
import { Error, MetaPayload } from '@/lib/types';
import { AdminUserType, useResendAdminInviteMutation } from '@/store/slices/adminApiSlice';
import { isAxiosError } from 'axios';
import { Button, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Props {
  admin: AdminUserType;
  handleChange: (arg: MetaPayload) => void;
}

export const ReInviteAction = ({ admin, handleChange }: Readonly<Props>) => {
  const search = useSelector((state: RootState) => state.sort.search);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const meta = useSelector((state: RootState) => state.admins.meta);

  const [resendAdminInviteMutation, { isLoading }] = useResendAdminInviteMutation();

  const handleResendInvite = async (adminId: string, email: string) => {
    try {
      const { success, message, statusCode } = await resendAdminInviteMutation({ adminId, email }).unwrap();

      if (success) {
        toast.success(message);
      } else {
        toast.error(message);

        if (statusCode === 409 && message?.includes('already active')) {
          handleChange({ search, sortOrder, meta, sortStatus });
        }
      }
    } catch (error) {
      const { statusCode, message = 'Error while resending invite' } = isAxiosError(error)
        ? error.response?.data
        : (error as Error).data;

      if (statusCode === 409 && message?.includes('already active')) {
        handleChange({ search, sortOrder, meta, sortStatus });
      }

      toast.error(message);
    }
  };

  return (
    <Button
      variant='outline-primary'
      size='sm'
      className='d-flex align-items-center justify-content-center gap-2'
      onClick={() => {
        if (admin.status?.toLowerCase() === 'active') {
          toast.error('User is already active');
          return;
        }

        handleResendInvite(admin.id, admin.email);
      }}
      disabled={isLoading}
    >
      {isLoading && <Spinner size='sm' className='border-2' />}
      Re Invite
    </Button>
  );
};
