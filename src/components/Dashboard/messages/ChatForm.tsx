'use client';

import SendIcon from '@/components/Icon/SendIcon';
import toast from 'react-hot-toast';
import TemplateSelectModal from './TemplateSelectModal';
import TipTapEditor from '@/components/elements/TipTapEditor';
import { connectChatSocket } from '@/lib/chatSocket';
import { getValidationSchema, MessageSchema } from '@/lib/schema/message';
import { ALLOWED_VARIABLES } from '@/schemas/messageTemplate';
import { RootState } from '@/store';
import {
  addMessage,
  ChatMessages,
  setPatientsConversations,
  setAdminConversations,
  setProvidersConversations,
  setPatientsConversationsMeta,
  setAdminConversationsMeta,
  setProvidersConversationsMeta,
} from '@/store/slices/chatSlice';
import { Dispatch, SetStateAction, useMemo, useRef, useState, useEffect } from 'react';
import { Form, FormikHelpers, useFormik, FormikProvider, ErrorMessage } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { GrAttachment } from 'react-icons/gr';
import { uploadChatFile } from '@/lib/fileUpload';
import { SelectedFile } from '@/components/Dashboard/SelectedFile';
import { useSendBlastMessageMutation, useLazyGetConversationsListQuery } from '@/store/slices/chatApiSlice';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { getChatUsers } from '@/services/chat';
import { PatientModal } from './PatientModal';
import { parseMentions } from '@/lib/mentionUtils';
import { formatUSDate } from '@/helpers/dateFormatter';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';
import { resetBlaseMessaging } from '@/store/slices/blaseMessagingSlice';
import { RiFileList3Line } from 'react-icons/ri';
import { IoCloseCircle } from 'react-icons/io5';
import { usePathname } from 'next/navigation';

interface ChatFormProps {
  removeSearchInput?: Dispatch<SetStateAction<string>>;
  attachment?: File;
  setAttachment: (ag?: File) => void;
  accessToken?: string;
}

export default function ChatForm({
  removeSearchInput,
  attachment,
  setAttachment,
  accessToken,
}: Readonly<ChatFormProps>) {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const submitRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mentionContainerRef = useRef<HTMLDivElement>(null);

  const [isMentionOpen, setIsMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [patients, setPatients] = useState<
    Array<{
      id?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      dob?: string | Date | null;
      email?: string | null;
    }>
  >([]);
  const [patientsMeta, setPatientsMeta] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
  });
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isUsingTemplateEditor, setIsUsingTemplateEditor] = useState(false);

  const {
    selectedConversation,
    newChatUser,
    selectedRole: role,
    conversationFilter,
    conversationsMeta,
  } = useSelector((state: RootState) => state.chat);
  const user = useSelector((state: RootState) => state.user);
  const { isBlaseMessaging, isSelectedAll, selectedUserIds, isSendEmail } = useSelector(
    (state: RootState) => state.blaseMessaging
  );

  // Use the accessToken prop passed from parent
  const getAccessToken = () => {
    return accessToken || '';
  };

  const [sendBlastMessage] = useSendBlastMessageMutation();
  const [triggerConversationsList] = useLazyGetConversationsListQuery();

  const initialValues: MessageSchema = {
    content: '',
    receiverId: newChatUser ? newChatUser?.id || '' : selectedConversation?.otherUser?.id || '',
    attachment,
  };

  const handleSendBlastMessage = async (
    values: MessageSchema,
    { resetForm, setSubmitting }: FormikHelpers<MessageSchema>
  ) => {
    if (isSending) return;

    try {
      setIsSending(true);
      setSubmitting(true);
      const { content, attachment, templateId } = values;

      if (submitRef.current) submitRef.current.disabled = true;

      // Validate selection
      if (!isSelectedAll && selectedUserIds.length === 0) {
        toast.error('Please select at least one patient');
        setIsSending(false);
        setSubmitting(false);
        if (submitRef.current) submitRef.current.disabled = false;
        return;
      }

      // Upload attachment if exists
      let attachmentUrl = '';
      if (attachment) {
        attachmentUrl = await uploadChatFile({ file: attachment, senderId: user.user?.id || '' });
      }

      // Send blast message
      const { success, message } = await sendBlastMessage({
        sendToAll: isSelectedAll,
        userIds: isSelectedAll ? [] : selectedUserIds,
        message: content || '',
        templateId,
        isSendEmail,
        ...(attachmentUrl && { attachment: attachmentUrl }),
      }).unwrap();

      if (success) {
        toast.success(message);

        // Refetch conversations from backend to get updated statuses
        // Backend automatically updates chat room statuses to 'resolved' when blast message is sent
        try {
          const meta = conversationsMeta[role as 'patient' | 'provider' | 'admin'];
          const { limit = 30, sortField, sortOrder, search } = meta || {};

          const data = await triggerConversationsList({
            page: 1, // Always fetch first page to get updated statuses
            limit,
            role,
            ...(search && { search }),
            ...(conversationFilter === 'Unread' && { unreadOnly: true }),
            ...(conversationFilter === 'Unresolved' && { unresolvedOnly: true }),
            ...(sortOrder && sortField && { sortOrder, sortField }),
          }).unwrap();

          // Update Redux state with fresh conversations data from backend
          if (role === 'patient') {
            dispatch(setPatientsConversations(data?.conversations));
            dispatch(setPatientsConversationsMeta({ ...data?.meta, sortOrder, sortField, search }));
          } else if (role === 'admin') {
            dispatch(setAdminConversations(data?.conversations));
            dispatch(setAdminConversationsMeta({ ...data?.meta, sortOrder, sortField, search }));
          } else if (role === 'provider') {
            dispatch(setProvidersConversations(data?.conversations));
            dispatch(setProvidersConversationsMeta({ ...data?.meta, sortOrder, sortField, search }));
          }
        } catch (error) {
          // Log error but don't block the success toast
          // The invalidateTags will still trigger automatic refetches in other components
          console.error('Error refetching conversations:', error);
        }

        resetForm();
        removeSearchInput?.('');
        setAttachment(undefined);
        setIsUsingTemplateEditor(false);
        dispatch(resetBlaseMessaging());
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data.message || 'Failed to send blast message. Please try again.'
      );
      console.error('Error sending blast message:', error);
    } finally {
      setIsSending(false);
      setSubmitting(false);
      if (submitRef.current) submitRef.current.disabled = false;
    }
  };

  const handleSendNormalMessage = async (
    values: MessageSchema,
    { resetForm, setSubmitting }: FormikHelpers<MessageSchema>
  ) => {
    if (isSending) return;

    try {
      setIsSending(true);
      setSubmitting(true);
      const { content, attachment, templateId } = values;

      if (submitRef.current) submitRef.current.disabled = true;

      // Always resolve the latest receiverId from store to avoid stale form state
      const currentReceiverId = newChatUser?.id || selectedConversation?.otherUser?.id || '';
      if (!currentReceiverId) {
        setIsSending(false);
        setSubmitting(false);
        if (submitRef.current) submitRef.current.disabled = false;
        return;
      }

      // Upload attachment if exists
      let url = '';
      if (attachment) {
        url = await uploadChatFile({ file: attachment, senderId: user.user?.id || '' });
      }

      // For admin portal with TipTapEditor, send HTML content as-is
      // For other portals, process mentions in plain text
      let finalContent = content || '';
      const isAdminPortal = pathname.includes('/admin');

      if (!isAdminPortal && content) {
        // For non-admin portals, convert HTML to plain text and process mentions
        const plainTextContent = htmlToPlainText(content);
        finalContent = convertPlainTextMentionsToStructured(plainTextContent);
      }
      // For admin portal, send HTML content as-is (mentions should already be in structured format within HTML)

      // Prepare payload
      const payload = {
        receiverId: currentReceiverId,
        content: attachment ? url : finalContent,
        metadata: {
          isAttachment: !!attachment,
          ...(templateId && { templateId }),
        },
      };

      // Send message via socket
      const token = getAccessToken();
      const chatSocket = connectChatSocket(token);

      const resetFormState = () => {
        resetForm();
        removeSearchInput?.('');
        setAttachment(undefined);
        setIsUsingTemplateEditor(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsSending(false);
        setSubmitting(false);
        if (submitRef.current) submitRef.current.disabled = false;
      };

      const scrollToBottom = () => {
        const element = document.getElementById('messageContent');
        if (element) {
          setTimeout(() => element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' }), 50);
        }
      };
      // Create a one-time error handler for this specific message
      const handleError = () => {
        toast.error('Failed to send message. Please try again.');
        resetFormState();
        chatSocket.off('patient_chat_error', handleError);
      };
      chatSocket.once('patient_chat_error', handleError);
      chatSocket.emit('sendMessage', payload, (res: ChatMessages) => {
        chatSocket.off('patient_chat_error', handleError);
        dispatch(addMessage(res));
        resetFormState();
        scrollToBottom();
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSending(false);
      setSubmitting(false);
      if (submitRef.current) submitRef.current.disabled = false;
    }
  };

  const handleSendMessage = async (values: MessageSchema, formikHelpers: FormikHelpers<MessageSchema>) => {
    if (isBlaseMessaging) {
      await handleSendBlastMessage(values, formikHelpers);
    } else {
      await handleSendNormalMessage(values, formikHelpers);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues,
    validationSchema: getValidationSchema(isBlaseMessaging),
    onSubmit: handleSendMessage,
  });

  const {
    isValid,
    isSubmitting,
    setFieldValue,
    values,
    errors,
    handleSubmit,
    handleBlur,
    setFieldError,
    validateForm,
  } = formik;

  // Convert HTML to plain text while preserving mentions
  const htmlToPlainText = (html: string): string => {
    if (!html) return '';
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    // Get text content, which will preserve @mentions as plain text
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Find @ mention position in HTML and replace it while preserving HTML structure
  const insertMentionInHtml = (html: string, mentionQuery: string, mentionText: string): string => {
    if (!html) return mentionText;

    // Create a temporary div to work with HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Get all text nodes and find the one containing @mentionQuery
    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null);

    let textNode: Node | null = null;
    let nodeValue = '';
    let foundNode: Node | null = null;

    // Find the text node containing @mentionQuery (find the last @ in the entire HTML)
    const allTextNodes: Array<{ node: Node; text: string; index: number }> = [];
    while ((textNode = walker.nextNode())) {
      const text = textNode.textContent || '';
      allTextNodes.push({ node: textNode, text, index: 0 });
    }

    // Find the last @ symbol across all text nodes
    let lastAtGlobalIndex = -1;
    let lastAtNodeIndex = -1;
    let cumulativeLength = 0;

    for (let i = 0; i < allTextNodes.length; i++) {
      const { text } = allTextNodes[i];
      const localIndex = text.lastIndexOf('@');
      if (localIndex !== -1) {
        const globalIndex = cumulativeLength + localIndex;
        if (globalIndex > lastAtGlobalIndex) {
          lastAtGlobalIndex = globalIndex;
          lastAtNodeIndex = i;
        }
      }
      cumulativeLength += text.length;
    }

    if (lastAtNodeIndex !== -1) {
      foundNode = allTextNodes[lastAtNodeIndex].node;
      nodeValue = allTextNodes[lastAtNodeIndex].text;
    }

    if (foundNode && nodeValue) {
      const lastAtIndex = nodeValue.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        const beforeAt = nodeValue.substring(0, lastAtIndex);
        const afterAt = nodeValue.substring(lastAtIndex + 1);

        let remainingText = '';
        if (afterAt.startsWith(mentionQuery)) {
          remainingText = afterAt.substring(mentionQuery.length);
        } else {
          const queryIndex = afterAt.indexOf(mentionQuery);
          if (queryIndex !== -1) {
            remainingText = afterAt.substring(queryIndex + mentionQuery.length);
          }
        }

        // Replace the text node content - this preserves all HTML structure
        foundNode.textContent = beforeAt + mentionText + (remainingText ? ' ' + remainingText : '');

        // Return the modified HTML with all structure preserved
        return tempDiv.innerHTML;
      }
    }

    // Fallback: if we can't find it in HTML, append mention at the end
    return html + mentionText;
  };

  // Convert structured format to display format for input field
  const getDisplayValue = (structuredValue: string) => {
    const parsedContent = parseMentions(structuredValue);
    if (parsedContent.length === 0) return structuredValue;

    return parsedContent
      .map((part) => {
        if (part.type === 'mention') {
          return `@${part.patientName}`;
        }
        return part.content;
      })
      .join('');
  };

  // Convert HTML content to display format (for mentions detection)
  const getDisplayValueFromHtml = (htmlValue: string) => {
    // First check if it's already structured format (contains {})
    if (htmlValue.includes('{') && htmlValue.includes('}')) {
      return getDisplayValue(htmlValue);
    }
    // Otherwise, it's HTML, convert to plain text
    return htmlToPlainText(htmlValue);
  };

  const displayValue = getDisplayValueFromHtml(values.content || '');

  const handlePaste = (event: React.ClipboardEvent) => {
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikHelpers<MessageSchema>['setFieldValue']
  ) => {
    const file = e.currentTarget?.files?.[0];
    setAttachment(file || undefined);
    setFieldValue('attachment', file || undefined);
    setTimeout(() => {
      validateForm();
    }, 0);
  };

  const fetchPatients = async (query: string, page: number = 1, append: boolean = false) => {
    try {
      setIsLoadingPatients(true);

      const { users, meta } = await getChatUsers('patient', page, 20, query || null);

      if (append) {
        setPatients((prev) => [...prev, ...users]);
      } else {
        if (users.length > 0) {
          setPatients(users);
        }
      }

      if (meta) {
        setPatientsMeta({
          page: meta.page || page,
          totalPages: meta.totalPages || 1,
          hasNextPage: (meta.page || page) < (meta.totalPages || 1),
        });
      }
    } catch {
      // Don't clear patients array on error to preserve existing data for mentions
      // This ensures mentions continue to work even if API calls fail
    } finally {
      setIsLoadingPatients(false);
    }
  };

  // Helper function to check if query is a complete patient name
  const isCompletePatientName = (query: string) => {
    return patients.some((patient) => {
      const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim().toLowerCase();
      return fullName === query.toLowerCase();
    });
  };

  // Function to convert plain text mentions to structured format
  const convertPlainTextMentionsToStructured = (content: string) => {
    if (!content || !content.includes('@')) return content;

    let structuredContent = content;

    // Find all @mentions in the content - look for plain text @mentions that need conversion
    const mentionRegex = /@([A-Za-z]+(?:\s+[A-Za-z]+)*?)(?=\s|$|@|\{)/g;
    let match;
    const allMatches = [];

    // First, collect all matches
    while ((match = mentionRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const name = match[1].trim();

      // Skip if this mention is already in structured format
      if (fullMatch.includes('{') && fullMatch.includes('}')) {
        continue;
      }

      // Only process if this is a plain text mention that needs conversion
      // Check if the mention is followed by structured format or is at the end
      const afterMention = content.substring(match.index + fullMatch.length);
      const isFollowedByStructured = afterMention.trim().startsWith('{');

      if (!isFollowedByStructured) {
        allMatches.push({
          fullMatch: fullMatch,
          name: name,
          index: match.index,
        });
      }
    }

    // Process each mention in reverse order to avoid index issues
    for (let i = allMatches.length - 1; i >= 0; i--) {
      const mention = allMatches[i];
      const { fullMatch, name } = mention;

      // Find matching patient in the patients array
      const matchingPatient = patients.find((patient) => {
        const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
        const isMatch = fullName.toLowerCase() === name.toLowerCase();

        return isMatch;
      });

      if (matchingPatient && matchingPatient.id) {
        // Replace plain text mention with structured format
        const structuredMention = `{${matchingPatient.id}}{${name}}`;

        structuredContent = structuredContent.replace(fullMatch, structuredMention);
      }
      // Note: We don't fetch patients here anymore - let the mention detection useEffect handle it
      // This prevents unnecessary API calls when converting mentions
    }

    return structuredContent;
  };

  const handleSelectPatient = (patient: {
    id?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }) => {
    const name = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
    const patientId = patient.id || '';
    const current = values.content || '';
    const isAdminPortal = pathname.includes('/admin');

    if (isAdminPortal) {
      // For admin portal with TipTapEditor (HTML content)
      // Work with HTML directly to preserve formatting (line breaks, etc.)
      const mentionText = `{${patientId}}{${name}}`;
      const updatedHtml = insertMentionInHtml(current, mentionQuery, mentionText);

      // Store HTML with structured mentions - preserves all formatting
      formik.setFieldValue('content', updatedHtml);
    } else {
      // For other portals (plain text input)
      const lastAtIndex = current.lastIndexOf('@');

      if (lastAtIndex !== -1) {
        const beforeAt = current.substring(0, lastAtIndex);
        const afterAt = current.substring(lastAtIndex + 1);

        let remainingText = '';
        if (afterAt.startsWith(mentionQuery)) {
          remainingText = afterAt.substring(mentionQuery.length);
        } else {
          const queryIndex = afterAt.indexOf(mentionQuery);
          if (queryIndex !== -1) {
            remainingText = afterAt.substring(queryIndex + mentionQuery.length);
          }
        }

        // Store structured format: {patientId}{patientName} message content
        const mentionText = `{${patientId}}{${name}}`;
        const newContent = beforeAt + mentionText + (remainingText ? ' ' + remainingText : '');
        formik.setFieldValue('content', newContent);
      }

      // Keep input focused and add space after mention
      setTimeout(() => {
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
          // Move cursor to end of input
          const length = inputElement.value.length;
          inputElement.setSelectionRange(length, length);
        }
      }, 100);
    }

    setIsMentionOpen(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (
      element.scrollTop + element.clientHeight >= element.scrollHeight - 10 &&
      !isLoadingPatients &&
      patientsMeta.hasNextPage
    ) {
      const nextPage = patientsMeta.page + 1;
      fetchPatients(mentionQuery, nextPage, true);
    }
  };

  const handleTemplateSelect = async (content: string, templateId: string) => {
    await setFieldValue('content', content);
    await setFieldValue('templateId', templateId);
    setFieldError('content', undefined);
    setIsUsingTemplateEditor(true);
    // Manually trigger validation to ensure form state updates
    setTimeout(() => {
      validateForm();
    }, 0);
  };

  const handleClearTemplate = async () => {
    setFieldValue('content', '');
    setFieldValue('templateId', undefined);
    setIsUsingTemplateEditor(false);
  };

  const renderFormContent = () => {
    if (values.attachment) {
      return (
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
      );
    } else if (isUsingTemplateEditor && showTemplateButton) {
      return (
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
            {showTemplateButton && (
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
      );
    } else {
      return (
        <>
          {showTemplateButton && (
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
          {pathname.includes('/admin') ? (
            <div className='flex-grow-1'>
              <TipTapEditor
                content={values.content || ''}
                onChange={(htmlContent) => {
                  // Store HTML content directly
                  setFieldValue('content', htmlContent);
                }}
                placeholder='Type a message'
                showToolbar={false}
                className='chat-input-editor'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleSubmit();
                    return false; // Prevent default Enter behavior
                  }
                  return true; // Allow other keys
                }}
              />
            </div>
          ) : (
            <input
              type='text'
              value={displayValue}
              onChange={(e) => {
                // When user types, we need to handle the conversion carefully
                const newDisplayValue = e.target.value;

                // If no @ symbols, just store as plain text
                if (!newDisplayValue.includes('@')) {
                  setFieldValue('content', newDisplayValue);
                  return;
                }

                // If user is editing mentions, we need to preserve existing structured format
                // and only update the non-mention parts
                const currentStructured = values.content || '';
                const currentDisplay = displayValue;

                // If user is just adding text after existing mentions, preserve structured format
                if (newDisplayValue.startsWith(currentDisplay)) {
                  // User is adding text after existing mentions
                  const addedText = newDisplayValue.substring(currentDisplay.length);
                  setFieldValue('content', currentStructured + addedText);
                } else {
                  // User is editing mentions, convert plain text mentions to structured format
                  const structuredContent = convertPlainTextMentionsToStructured(newDisplayValue);
                  setFieldValue('content', structuredContent);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              autoComplete='off'
              placeholder='Type a message'
              className='py-2 px-3 rounded flex-grow-1 bg-white focus:tw-border-primary'
            />
          )}
        </>
      );
    }
  };

  const showTemplateButton = useMemo(() => {
    return pathname.includes('/admin') && role === 'patient';
  }, [pathname, role]);

  // Load patients data on component mount and when role changes
  useEffect(() => {
    const isProviderRole = role === 'provider';
    const isAdminRole = role === 'admin';
    const isProviderPortal = window.location.pathname.includes('/provider');
    const isAdminPortal = window.location.pathname.includes('/admin');

    // Load patients for Provider tab in admin portal OR Admin tab in provider portal (but not Patient tabs)
    const shouldLoadPatients = (isProviderRole && isAdminPortal) || (isAdminRole && isProviderPortal);

    // Only fetch if we should load patients, patients array is empty, and we're not already loading
    if (shouldLoadPatients && patients.length === 0 && !isLoadingPatients) {
      fetchPatients('', 1, false);
    }
  }, [role, patients.length, isLoadingPatients]);

  // Watch for changes in the input value to detect @ mentions
  useEffect(() => {
    // Enable mention feature for:
    // 1. Provider role (Provider tab in admin portal) - admin chatting with providers
    // 2. Admin role (Admin tab in provider portal) - provider chatting with admin
    // Disable for:
    // - Patient tab in admin portal (selectedRole === 'patient' in admin portal)
    // - Patient tab in provider portal (selectedRole === 'patient' in provider portal)
    const isProviderRole = role === 'provider';
    const isAdminRole = role === 'admin';
    const isPatientRole = role === 'patient';
    const isProviderPortal = window.location.pathname.includes('/provider');
    const isAdminPortal = window.location.pathname.includes('/admin');

    // Disable for Patient tab in admin portal
    if (isPatientRole && isAdminPortal) {
      setIsMentionOpen(false);
      return;
    }

    // Disable for Patient tab in provider portal
    if (isPatientRole && isProviderPortal) {
      setIsMentionOpen(false);
      return;
    }

    // Enable for Provider tab in admin portal OR Admin tab in provider portal
    if (!isProviderRole && !isAdminRole) {
      setIsMentionOpen(false);
      return;
    }

    const content = displayValue || '';
    const lastAtIndex = content.lastIndexOf('@');

    // Cleanup function for timeout
    let timeoutId: NodeJS.Timeout | null = null;

    if (lastAtIndex !== -1) {
      const query = content.substring(lastAtIndex + 1);

      // Only process if query doesn't contain spaces (partial mention)
      if (!query.includes(' ') && query.length > 0) {
        // Check if this is a new mention by ensuring the @ is not part of an existing mention
        const beforeAt = content.substring(0, lastAtIndex);

        // Check if the @ is immediately after a complete mention (like "@John Doe @")
        const endsWithCompleteMention = patients.some((patient) => {
          const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
          return beforeAt.endsWith(`@${fullName}`);
        });

        // Only open dropdown and fetch if:
        // 1. The @ is not part of an existing mention
        // 2. Query is not a complete patient name
        // 3. The @ is not immediately after a complete mention
        // 4. Query has actually changed (to prevent duplicate calls)
        if (!endsWithCompleteMention && !isCompletePatientName(query) && query !== mentionQuery) {
          setMentionQuery(query);
          setIsMentionOpen(true);
          // Reset pagination when starting new search
          setPatientsMeta({ page: 1, totalPages: 1, hasNextPage: false });
          // Add debounce to prevent too many API calls
          timeoutId = setTimeout(() => {
            fetchPatients(query, 1, false);
          }, 300);
        } else if (isCompletePatientName(query) || endsWithCompleteMention) {
          // Close dropdown if query matches a complete patient name
          setIsMentionOpen(false);
        }
      } else if (query.length === 0) {
        // If user just typed @ without any text, don't open the dropdown yet
        setIsMentionOpen(false);
      }
    } else {
      // If no @ symbol found, close the mention dropdown
      setIsMentionOpen(false);
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [displayValue, role, mentionQuery]);

  return (
    <FormikProvider value={formik}>
      <Form className='flex-shrink-0 py-12 px-4 bg-pale-gray'>
        <div
          onPaste={handlePaste}
          className={`d-flex gap-3 w-100 position-relative ${
            isUsingTemplateEditor ? 'tw-flex-col' : 'align-items-center'
          }`}
          ref={mentionContainerRef}
        >
          {renderFormContent()}

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
                    onChange={(e) => handleFileChange(e, setFieldValue)}
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
      {isMentionOpen && (
        <div
          className='position-fixed bg-white border border-primary rounded-12 p-12 d-flex flex-column tw-top-auto tw-bottom-[120px] tw-left-1/2 tw--translate-x-1/2 tw-z-[9999] tw-max-h-72 tw-overflow-y-auto tw-min-w-[300px] tw-max-w-[400px]'
          onScroll={handleScroll}
        >
          <label className='form-label fw-medium text-capitalize mb-2'>Patients</label>
          {patients && patients.length > 0 ? (
            <>
              {patients.map((patient) => (
                <button
                  key={patient.id || Math.random().toString(36)}
                  className='btn-transparent d-flex align-items-center border-0 w-100 text-start py-2 tw-px-3'
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div
                    className='mr-4 bg-secondary rounded-circle tw-w-[25px] tw-h-[25px] tw-min-w-[25px] tw-min-h-[25px] tw-flex-shrink-0'
                    style={{ aspectRatio: '1/1' }}
                  >
                    {patient.firstName?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <span className='text-sm'>
                    <span className='text-capitalize'>
                      {[patient.firstName, patient.lastName].filter(Boolean).join(' ')}
                    </span>
                    {patient.dob && (
                      <>
                        {' - '}
                        {formatUSDate(patient.dob)}
                      </>
                    )}
                    {patient.email && (
                      <>
                        {' - '}
                        <span className='tw-normal-case'>{patient.email}</span>
                      </>
                    )}
                  </span>
                </button>
              ))}
              {isLoadingPatients && (
                <div className='text-center p-2'>
                  <Spinner className='border-2' />
                </div>
              )}
            </>
          ) : (
            <div className='text-center p-4 text-muted text-sm'>
              {isLoadingPatients ? 'Loading...' : 'No matching patients found.'}
            </div>
          )}
        </div>
      )}

      {/* Patient Modal */}
      <PatientModal
        show={showPatientModal}
        onHide={() => {
          setShowPatientModal(false);
          setSelectedPatientId(null);
        }}
        patientId={selectedPatientId || undefined}
      />

      {/* Template Select Modal */}
      <TemplateSelectModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </FormikProvider>
  );
}
