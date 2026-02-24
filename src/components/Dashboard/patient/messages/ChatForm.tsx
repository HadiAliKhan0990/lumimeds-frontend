'use client';

import SendIcon from '@/components/Icon/SendIcon';
import socket from '@/lib/socket';
import { validationSchema, MessageSchema } from '@/lib/schema/message';
import { RootState } from '@/store';
import { Dispatch, SetStateAction, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import { addPatientChatMessage } from '@/store/slices/patientChatSlice';
import { GrAttachment } from 'react-icons/gr';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { uploadChatFile } from '@/lib/fileUpload';
import { SelectedFile } from '@/components/Dashboard/SelectedFile';
import { ChatMessages } from '@/store/slices/chatSlice';

interface Props {
  attachment?: File;
  setAttachment: Dispatch<SetStateAction<File | undefined>>;
}

export default function ChatForm({ setAttachment, attachment }: Readonly<Props>) {
  const dispatch = useDispatch();

  const submitRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = useSelector((state: RootState) => state.patientProfile);
  const chatId = useSelector((state: RootState) => state.patientChat.chatId);
  const unreadCountData = useSelector((state: RootState) => state.patientChat.unreadCountData);

  const initialValues: MessageSchema = {
    content: '',
    receiverId: chatId ?? '',
    attachment,
  };

  const addPatientChatMessageHandler = useCallback(
    (res: ChatMessages) => {
      dispatch(addPatientChatMessage(res));
      // Scroll is now handled by ChatContent component
    },
    [dispatch]
  );

  const handleSendMessage = async (
    values: MessageSchema,
    { resetForm, setSubmitting }: FormikHelpers<MessageSchema>
  ) => {
    try {
      setSubmitting(true);
      let url = '';
      const { attachment, receiverId, content } = values;

      if (submitRef.current) submitRef.current.disabled = true;

      if (attachment) {
        url = await uploadChatFile({ file: attachment, senderId: profile?.user?.id || '' });
      }

      const payload = {
        receiverId,
        content: attachment ? url : content,
        metadata: {
          ...(unreadCountData?.clinicalTeam.id === chatId
            ? { telegraConversationId: 'pcv::44cf5a9e-8e40-4cfc-8566-38cab5f24ea2' }
            : {}),
          isAttachment: attachment ? true : false,
        },
      };

      socket.emit('sendMessage', payload, (res: ChatMessages) => {
        addPatientChatMessageHandler(res);
        resetForm({ values: { receiverId: values.receiverId, content: '', attachment: undefined } });
        setAttachment(undefined);
        if (submitRef.current) submitRef.current.disabled = false;
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSubmitting(false);
      });
    } catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<MessageSchema>['setFieldValue']
  ) => {
    setAttachment(undefined);
    const file = e.currentTarget?.files?.[0];
    setFieldValue('attachment', file || undefined);
  };

  const handlePaste = (event: React.ClipboardEvent, setFieldValue: FormikHelpers<MessageSchema>['setFieldValue']) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          setFieldValue('attachment', file);
          break;
        }
      }
    }
  };

  useEffect(() => {
    socket.on('newMessage', addPatientChatMessageHandler);

    return () => {
      socket.off('newMessage', addPatientChatMessageHandler);
    };
  }, [unreadCountData]);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSendMessage}
      enableReinitialize
      validateOnMount
    >
      {({ isValid, isSubmitting, setFieldValue, values, errors }) => (
        <Form className='flex-shrink-0 py-12 px-4 bg-pale-gray'>
          <div onPaste={(e) => handlePaste(e, setFieldValue)} className='d-flex align-items-center gap-3'>
            {values.attachment ? (
              <SelectedFile
                isLoading={isSubmitting}
                attachment={values.attachment}
                attachmentError={errors.attachment}
                onRemove={() => {
                  setFieldValue('attachment', undefined);
                  setAttachment(undefined);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              />
            ) : (
              <Field
                name='content'
                type='text'
                autoComplete='off'
                placeholder='Type your message'
                className='py-2 px-3 rounded bg-white'
              />
            )}

            <div className='d-flex align-items-center gap-3'>
              {!values.attachment && (
                <OverlayTrigger overlay={<Tooltip className='text-none text-xs'>Upload file up to 5mb</Tooltip>}>
                  <label htmlFor='attachment' className='cursor-pointer'>
                    <GrAttachment size={22} className='cursor-pointer' />
                    <input
                      ref={fileInputRef}
                      type='file'
                      hidden
                      id='attachment'
                      accept='.pdf,.jpg,.jpeg,.png,.gif'
                      onChange={(e) => handleFileChange(e, setFieldValue)}
                    />
                  </label>
                </OverlayTrigger>
              )}

              <button
                ref={submitRef}
                disabled={!isValid || isSubmitting}
                type='submit'
                className='btn-no-style d-flex align-items-center gap-1 disabled:tw-pointer-events-none disabled:tw-opacity-60'
              >
                {isSubmitting ? <Spinner size='sm' className='border-2' /> : <SendIcon size={24} />}
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
