'use client';

import { getCurrentChatSocket } from '@/lib/chatSocket';
import SendIcon from '@/components/Icon/SendIcon';
import TipTapEditor from '@/components/elements/TipTapEditor';
import TemplateSelectModal from '@/components/Dashboard/messages/TemplateSelectModal';
import { Field, Form, Formik, FormikHelpers, ErrorMessage, FormikProps } from 'formik';
import { validationSchema, MessageSchema } from '@/lib/schema/message';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addPatientChatMessage, ChatMessages } from '@/store/slices/chatSlice';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { uploadChatFile } from '@/lib/fileUpload';
import { OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import { SelectedFile } from '@/components/Dashboard/SelectedFile';
import { GrAttachment } from 'react-icons/gr';
import { providerSocket } from '@/lib/providerSocket';
import { usePathname } from 'next/navigation';
import { ALLOWED_VARIABLES } from '@/schemas/messageTemplate';
import { RiFileList3Line } from 'react-icons/ri';
import { IoCloseCircle } from 'react-icons/io5';
import toast from 'react-hot-toast';

interface Props {
  attachment?: File;
  setAttachment: Dispatch<SetStateAction<File | undefined>>;
  receiverId?: string; // Optional override for the receiver ID (used for admin chat)
  onMessageSent?: (msg: ChatMessages) => void; // Optional callback for custom message handling
}

export default function ChatForm({
  setAttachment,
  attachment,
  receiverId: receiverIdProp,
  onMessageSent,
}: Readonly<Props>) {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const submitRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formikHelpersRef = useRef<FormikProps<MessageSchema> | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isUsingTemplateEditor, setIsUsingTemplateEditor] = useState(false);

  const userId = useSelector((state: RootState) => state.chat.userId);

  // Use provided receiverId prop if available, otherwise fall back to Redux userId
  const effectiveReceiverId = receiverIdProp || userId || '';

  const initialValues: MessageSchema = {
    content: '',
    receiverId: effectiveReceiverId,
    attachment,
    templateId: undefined as string | undefined,
  };

  const isUserProvider = pathname.includes('/provider');
  const isUserAdmin = pathname.includes('/admin');

  const handleSubmit = async (values: MessageSchema, { resetForm, setSubmitting }: FormikHelpers<MessageSchema>) => {
    if (isSending) return;

    try {
      setIsSending(true);
      setSubmitting(true);
      let url = '';
      const { attachment, receiverId, content, templateId } = values;

      if (submitRef.current) submitRef.current.disabled = true;

      if (attachment) {
        url = await uploadChatFile({ file: attachment, senderId: userId || '' });
      }

      const payload = {
        receiverId,
        content: attachment ? url : content,
        metadata: {
          isAttachment: !!attachment,
          ...(templateId && { templateId }),
        },
      };

      const chatSocket = getCurrentChatSocket();
      const decidedSocket = isUserProvider ? providerSocket : chatSocket;

      if (!decidedSocket) {
        console.error('Socket not available. Please ensure ChatWrapper is properly initialized.');
        setIsSending(false);
        setSubmitting(false);
        return;
      }
      const resetFormState = () => {
        resetForm({
          values: {
            content: '',
            receiverId: effectiveReceiverId,
            attachment: undefined,
            templateId: undefined,
          },
        });
        setIsSending(false);
        setSubmitting(false);
        setIsUsingTemplateEditor(false);
        if (submitRef.current) submitRef.current.disabled = false;
        if (fileInputRef.current) fileInputRef.current.value = '';
        setAttachment(undefined);
      }; // Create a one-time error handler for this specific message
      const handleError = () => {
        toast.error('Failed to send message. Please try again.');
        resetFormState();
        decidedSocket.off('patient_chat_error', handleError);
      };
      decidedSocket.once('patient_chat_error', handleError);
      decidedSocket.emit('sendMessage', payload, async (msg: ChatMessages) => {
        decidedSocket.off('patient_chat_error', handleError);
        // Use custom handler if provided, otherwise default to patient chat
        if (onMessageSent) {
          onMessageSent(msg);
        } else {
          dispatch(addPatientChatMessage(msg));
        }
        resetFormState();
        const element =
          document.getElementById('patient_messageContent') || document.getElementById('admin_messageContent');
        setTimeout(() => {
          if (element) {
            element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
          }
        }, 300);
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSending(false);
      setSubmitting(false);
    }
  };

  const handleTemplateSelect = async (content: string, templateId: string) => {
    if (!formikHelpersRef.current) return;

    const { setFieldValue, setFieldError, validateForm } = formikHelpersRef.current;
    await setFieldValue('content', content);
    await setFieldValue('templateId', templateId);
    setFieldError('content', undefined);
    setIsUsingTemplateEditor(true);
    setShowTemplateModal(false);
    // Manually trigger validation to ensure form state updates
    setTimeout(() => {
      validateForm();
    }, 0);
  };

  const handleClearTemplate = async () => {
    if (!formikHelpersRef.current) return;

    const { setFieldValue } = formikHelpersRef.current;
    setFieldValue('content', '');
    setFieldValue('templateId', undefined);
    setIsUsingTemplateEditor(false);
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

  return (
    <>
      <Formik
        innerRef={formikHelpersRef}
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values, errors, isValid, isSubmitting, handleBlur, handleSubmit }) => (
          <Form className='flex-shrink-0 py-12 px-4 bg-pale-gray'>
            <div
              onPaste={(e) => handlePaste(e, setFieldValue)}
              className={`d-flex gap-3 w-100 position-relative ${
                isUsingTemplateEditor ? 'tw-flex-col' : 'align-items-center'
              }`}
            >
              {values.attachment ? (
                <SelectedFile
                  isLoading={isSubmitting}
                  attachment={values.attachment}
                  attachmentError={errors.attachment}
                  onRemove={() => {
                    setFieldValue('attachment', undefined);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    setAttachment(undefined);
                  }}
                />
              ) : isUsingTemplateEditor && isUserAdmin ? (
                <div className='tw-flex tw-flex-col tw-flex-grow tw-gap-2'>
                  <div className='tw-flex tw-items-center tw-gap-2 tw-bg-blue-50 tw-px-3 tw-py-2 tw-rounded'>
                    <span className='tw-text-sm tw-text-blue-800 tw-flex-grow'>
                      <strong>Template Mode:</strong> Edit the content below and send when ready
                    </span>
                    <button
                      type='button'
                      className='tw-text-blue-600 hover:tw-text-blue-800 tw-transition-colors !tw-p-0'
                      onClick={handleClearTemplate}
                      title='Clear template and return to normal input'
                    >
                      <IoCloseCircle size={20} />
                    </button>
                  </div>
                  <div className='tw-flex tw-gap-3 tw-items-start'>
                    {isUserAdmin && (
                      <OverlayTrigger overlay={<Tooltip className='text-none text-xs'>Use Message Template</Tooltip>}>
                        <button
                          type='button'
                          className='btn btn-outline-primary !tw-flex tw-items-center tw-justify-center !tw-w-10 !tw-h-10 tw-flex-shrink-0 p-0 tw-mt-1'
                          onClick={() => setShowTemplateModal(true)}
                        >
                          <RiFileList3Line size={20} />
                        </button>
                      </OverlayTrigger>
                    )}
                    <div className='tw-flex-grow'>
                      <div className='mb-2 tw-text-sm text-muted'>
                        Use &#123;&#123;variableName&#125;&#125; for dynamic content. Available variables:{' '}
                        {ALLOWED_VARIABLES.map((variable) => `{{${variable}}}`).join(', ')}
                      </div>
                      <TipTapEditor
                        content={values.content || ''}
                        onChange={(content) => setFieldValue('content', content)}
                        placeholder='Edit your message...'
                        name='content'
                        onBlur={handleBlur}
                        variables={ALLOWED_VARIABLES}
                      />
                      <ErrorMessage name='content' component='div' className='tw-text-red-500 tw-text-xs' />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {isUserAdmin && (
                    <OverlayTrigger overlay={<Tooltip className='text-none text-xs'>Use Message Template</Tooltip>}>
                      <button
                        type='button'
                        className='tw-flex tw-items-center tw-justify-center tw-w-10 tw-h-10 tw-flex-shrink-0 tw-p-0 tw-text-primary tw-border tw-border-primary tw-border-solid hover:tw-bg-primary/10 tw-transition-all'
                        onClick={() => setShowTemplateModal(true)}
                      >
                        <RiFileList3Line size={18} />
                      </button>
                    </OverlayTrigger>
                  )}
                  {isUserAdmin ? (
                    <div className='flex-grow-1'>
                      <TipTapEditor
                        content={values.content || ''}
                        onChange={(htmlContent) => {
                          // Store HTML content directly
                          setFieldValue('content', htmlContent);
                        }}
                        placeholder='Type your message'
                        showToolbar={false}
                        className='chat-input-editor'
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            // Submit form on Enter
                            handleSubmit();
                            return false; // Prevent default Enter behavior
                          }
                          return true; // Allow other keys
                        }}
                      />
                      <ErrorMessage name='content' component='div' className='tw-text-red-500 tw-text-xs tw-mt-1' />
                    </div>
                  ) : (
                    <Field
                      name='content'
                      type='text'
                      autoComplete='off'
                      placeholder='Type your message'
                      className='py-2 px-3 rounded bg-white flex-grow-1 focus:tw-border-primary'
                    />
                  )}
                </>
              )}

              <div className={`d-flex align-items-center gap-3 ${isUsingTemplateEditor ? 'tw-self-end' : ''}`}>
                {!values.attachment && !isUsingTemplateEditor && (
                  <OverlayTrigger overlay={<Tooltip className='text-none text-xs'>Upload file up to 5mb</Tooltip>}>
                    <label htmlFor='attachment' className='cursor-pointer'>
                      <GrAttachment size={22} className='cursor-pointer' />
                      <input
                        ref={fileInputRef}
                        type='file'
                        hidden
                        id='attachment'
                        accept='.pdf,.jpg,.jpeg,.png,.gif'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.currentTarget?.files?.[0];
                          setAttachment(file || undefined);
                          setFieldValue('attachment', file || undefined);
                          setTimeout(() => {
                            formikHelpersRef.current?.validateForm();
                          }, 0);
                        }}
                      />
                    </label>
                  </OverlayTrigger>
                )}

                <button
                  ref={submitRef}
                  disabled={!isValid || isSubmitting || isSending}
                  type='submit'
                  className={
                    'btn-no-style d-flex align-items-center gap-1 disabled:tw-pointer-events-none disabled:tw-opacity-60' +
                    (isValid ? '' : ' tw-text-neutral-400')
                  }
                >
                  {isSubmitting || isSending ? <Spinner size='sm' className='border-2' /> : <SendIcon size={24} />}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {/* Template Select Modal */}
      <TemplateSelectModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </>
  );
}
