'use client';

import { Component } from 'react';
import { MdContentCopy, MdOutlineDragIndicator, MdCategory } from 'react-icons/md';
import { setSurveyQuestions } from '@/store/slices/surveyQuestionsSlice';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { PatientSurveyValidationType } from '@/lib/types';
import { QuestionType, TextInputType } from '@/lib/enums';
import { IoClose } from 'react-icons/io5';
import { ActionCreatorWithPayload, Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { uniqueId } from 'lodash';
import { Survey } from '@/store/slices/surveySlice';
import { MappingModal } from '@/components/Dashboard/forms/MappingModal';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Switch from 'react-switch';
import toast from 'react-hot-toast';
import { IoMdAdd } from 'react-icons/io';

interface ItemProps {
  anySelected: number;
  commonProps: {
    questions: SurveyQuestion[];
    dispatch: Dispatch<UnknownAction>;
    setSurveyQuestions: ActionCreatorWithPayload<SurveyQuestion[], 'surveyQuestions/setSurveyQuestions'>;
    setSurvey: ActionCreatorWithPayload<Survey, 'survey/setSurvey'>;
    survey: Survey;
  };
  dragHandleProps: {
    onMouseDown: () => void;
    onTouchStart: () => void;
  };
  item: SurveyQuestion;
  itemSelected: number;
}

type ItemState = SurveyQuestion & {
  showMappingModal?: boolean;
};

export class DraggableListItem extends Component<ItemProps, ItemState> {
  state: ItemState;

  constructor(props: ItemProps) {
    super(props);
    this.state = { ...this.props.item };
  }

  componentDidUpdate(prevProps: ItemProps) {
    const nextPosition = this.props.item.position ?? null;
    if (prevProps.item.position !== nextPosition && this.state.position !== nextPosition) {
      this.setState((prevState) => ({
        ...prevState,
        position: nextPosition ?? prevState.position ?? undefined,
      }));
    }
  }

  private SurveyChoices = () => {
    const question = this.state;
    switch (question.questionType) {
      case QuestionType.INPUT_BOX:
        return (
          <input
            type='text'
            name='description'
            placeholder='Enter Placeholder for input field'
            className='form-control form-control-lg shadow-none text-base'
            value={question.description ?? ''}
            onChange={(e) => {
              const updatedQuestion = {
                ...question,
                description: e.target.value,
              };
              this.setState(updatedQuestion);
              const { dispatch, setSurveyQuestions, setSurvey, survey } = this.props.commonProps;
              const newQuestions = this.props.commonProps.questions.map((question) => {
                if (question.id === this.state.id) {
                  return updatedQuestion;
                }
                return question;
              });
              dispatch(setSurvey({ ...survey, hasUnsavedChanges: true }));
              dispatch(setSurveyQuestions(newQuestions));
            }}
          />
        );
      case QuestionType.FILE_UPLOAD:
        return null;
      case QuestionType.MULTI_INBOX:
        const updateMultiInputs = (multiInputs: { placeholder: string; fieldType: string }[]) => {
          const { dispatch, setSurveyQuestions, setSurvey, survey } = this.props.commonProps;
          const updatedQuestion = { ...question, multiInputs };
          const newQuestions = this.props.commonProps.questions.map((q) => {
            if (q.id === question.id) {
              return updatedQuestion;
            }
            return q;
          });
          dispatch(setSurvey({ ...survey, hasUnsavedChanges: true }));
          dispatch(setSurveyQuestions(newQuestions));
          this.setState(updatedQuestion);
        };

        const handleRemoveInput = (index: number) => {
          const newInputs = question.multiInputs?.filter((_, i) => i !== index) ?? [];
          updateMultiInputs(newInputs);
        };

        const handlePlaceholderChange = (value: string, index: number) => {
          const newInputs =
            question.multiInputs?.map((input, i) => {
              if (i === index) {
                return { ...input, placeholder: value };
              }
              return input;
            }) ?? [];
          updateMultiInputs(newInputs);
        };

        const handleFieldTypeChange = (value: string, index: number) => {
          const newInputs =
            question.multiInputs?.map((input, i) => {
              if (i === index) {
                return { ...input, fieldType: value };
              }
              return input;
            }) ?? [];
          updateMultiInputs(newInputs);
        };

        const handleFieldNameChange = (value: string, index: number) => {
          const newInputs =
            question.multiInputs?.map((input, i) => {
              if (i === index) {
                return { ...input, fieldName: value };
              }
              return input;
            }) ?? [];
          updateMultiInputs(newInputs);
        };

        return (
          <div className='mt-2 gap-2 d-flex flex-column flex-grow-1'>
            {question.multiInputs?.map((input, index) => (
              <div key={`${question.id}-input-${index}`} className='d-flex align-items-start gap-2 flex-column'>
                <div className='d-flex align-items-center gap-2 flex-grow-1 w-100'>
                  <input
                    type='text'
                    value={input.fieldName ?? ''}
                    placeholder='Field Name (e.g., weight)'
                    className='form-control form-control-lg shadow-none text-base'
                    onChange={(e) => handleFieldNameChange(e.target.value, index)}
                    onKeyDown={(e) => {
                      if (e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                  />
                  <input
                    type='text'
                    value={input.placeholder}
                    placeholder='Placeholder (e.g., Enter your weight)'
                    className='form-control form-control-lg shadow-none text-base'
                    onChange={(e) => handlePlaceholderChange(e.target.value, index)}
                    onKeyDown={(e) => {
                      if (e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                  />
                  <select
                    className='form-select form-select-lg text-base shadow-none'
                    value={input.fieldType}
                    onChange={(e) => handleFieldTypeChange(e.target.value, index)}
                  >
                    <option value={TextInputType.TEXT}>Text</option>
                    <option value={TextInputType.NUMBER}>Number</option>
                    <option value={TextInputType.EMAIL}>Email</option>
                    <option value={TextInputType.DATE}>Date</option>
                    <option value={TextInputType.DATETIME}>Datetime</option>
                    <option value={TextInputType.PHONE}>Phone</option>
                  </select>
                  <button
                    type='button'
                    className='btn-transparent p-0 d-flex align-items-center gap-2'
                    onClick={() => handleRemoveInput(index)}
                  >
                    <IoClose size={18} />
                  </button>
                </div>
                {input.mapping?.field && (
                  <div className='tw-text-xs tw-text-gray-600 tw-px-2'>
                    Mapped to: {input.mapping.field}
                    {input.mapping.jsonKey && `.${input.mapping.jsonKey}`}
                  </div>
                )}
              </div>
            ))}

            <div className='d-flex align-items-center gap-2 flex-grow-1'>
              <button
                type='button'
                tabIndex={-1}
                className='btn-transparent p-0 d-flex align-items-center gap-2 tw-text-neutral-500'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newInputs = [
                    ...(question.multiInputs ?? []),
                    { placeholder: '', fieldType: TextInputType.TEXT, fieldName: '' },
                  ];
                  updateMultiInputs(newInputs);
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <IoMdAdd size={18} /> <span>Add Input Field</span>
              </button>
            </div>
          </div>
        );
      case QuestionType.MULTIPLE_CHOICE:
      default:
        const updateSurveyQuestions = (question: SurveyQuestion) => {
          const { dispatch, setSurveyQuestions } = this.props.commonProps;
          const newQuestions = this.props.commonProps.questions.map((q) => {
            if (q.id === question.id) {
              return question;
            }
            return q;
          });
          dispatch(setSurveyQuestions(newQuestions));
        };

        const handleRemoveOption = (index: number) => {
          const newOptions = question.options?.filter((_, i) => i !== index);
          const newQuestion = { ...question, options: newOptions };
          updateSurveyQuestions(newQuestion);
          this.setState(newQuestion);
        };

        const handleTextChange = (value: string, index: number) => {
          const newOptions = question.options?.map((option, i) => {
            if (i === index) {
              return value;
            }
            return option;
          });
          const newQuestion = { ...question, options: newOptions };
          updateSurveyQuestions(newQuestion);
          this.setState(newQuestion);
        };

        return (
          <div className='mt-2 gap-2 d-flex flex-column flex-grow-1'>
            {question.options?.map((option, index) => (
              <div key={`${question.id}-option-${index}`} className='d-flex align-items-center gap-2 flex-grow-1'>
                <div className='d-flex align-items-center gap-2'>
                  <div className='h-4 w-4 rounded-full border-2 border-black' />
                  <input
                    type='text'
                    value={option}
                    placeholder='Edit Text Here'
                    className='form-control form-control-lg shadow-none text-base'
                    onChange={(e) => handleTextChange(e.target.value, index)}
                    onKeyDown={(e) => {
                      if (e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                  />
                </div>
                <button
                  type='button'
                  className='btn-transparent p-0 d-flex align-items-center gap-2'
                  onClick={() => handleRemoveOption(index)}
                >
                  <IoClose size={18} />
                </button>
              </div>
            ))}

            <div className='d-flex align-items-center gap-2 flex-grow-1 justify-space-between'>
              <button
                type='button'
                tabIndex={-1}
                className='btn-transparent p-0 d-flex align-items-center gap-2'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.setState({
                    ...question,
                    options: [...(question.options ?? []), ''],
                  });
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className='tw-h-[15px] tw-w-[15px] tw-rounded-full tw-border-2 tw-border-[#868686]' />
                <p className='m-0 text-sm tw-text-neutral-500'>Add Option</p>
              </button>
            </div>
          </div>
        );
    }
  };

  render() {
    const scale = this.props.itemSelected * 0.05 + 1;
    const questionPosition = this.state.position ?? this.props.item.position ?? null;

    const copyQuestion = () => {
      const { dispatch, setSurveyQuestions, survey, setSurvey } = this.props.commonProps;
      const { id, ...rest } = this.state; // eslint-disable-line @typescript-eslint/no-unused-vars
      const newQuestions = [
        ...this.props.commonProps.questions,
        {
          ...rest,

          id: uniqueId(),
          position: this.props.commonProps.questions.length + 1,
          isNew: true,
        },
      ];
      dispatch(setSurvey({ ...survey, hasUnsavedChanges: true }));
      dispatch(setSurveyQuestions(newQuestions));
      toast.success('Question Copied and Added!');
    };

    const deleteQuestion = () => {
      const { dispatch, setSurveyQuestions, survey, setSurvey } = this.props.commonProps;

      const newQuestions = this.props.commonProps.questions
        .filter((q) => q.id !== this.state.id)
        .map((question, index) => ({
          ...question,
          position: index + 1,
        }));
      dispatch(setSurvey({ ...survey, hasUnsavedChanges: true }));
      dispatch(setSurveyQuestions(newQuestions));
      toast.success('Question Removed!');
    };

    const handleUpdateQuestion = (updatedQuestion: SurveyQuestion) => {
      const { dispatch, setSurveyQuestions, setSurvey, survey } = this.props.commonProps;

      // Exclude UI state properties from the question before storing in Redux
      // Type assertion needed because SurveyQuestion type doesn't include UI state properties
      const questionWithUIState = updatedQuestion as SurveyQuestion & {
        showMappingModal?: boolean;
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { showMappingModal, ...questionWithoutUIState } = questionWithUIState;

      const newQuestions = this.props.commonProps.questions.map((question) => {
        if (question.id === updatedQuestion.id) {
          return questionWithoutUIState;
        }
        return question;
      });

      // Update local state to reflect the changes, preserving UI state
      this.setState((prevState) => ({
        ...questionWithoutUIState,
        showMappingModal: prevState.showMappingModal,
      }));

      dispatch(setSurvey({ ...survey, hasUnsavedChanges: true }));
      dispatch(setSurveyQuestions(newQuestions));
    };

    return (
      <>
        <div
          style={{ transform: `scale(${scale})` }}
          className='gap-2 d-flex align-items-center flex-column overflow-hidden position-relative tw-p-3 drag_item'
        >
          <span
            className='position-absolute top-0 start-0 bg-primary text-white tw-text-sm fw-semibold tw-px-2 tw-py-1 tw-rounded-br'
            aria-label='Question position'
          >
            #{questionPosition ?? '-'}
          </span>
          {this.state.isDefault && <div className='position-absolute top-0 bottom-0 end-0 start-0 z-3 bg-disabled' />}
          <MdOutlineDragIndicator className='dragHandle tw-cursor-move' {...this.props.dragHandleProps} />
          <div className='tw-w-full'>
            <div className='d-flex flex-column flex-md-row w-100 tw-pt-3 tw-px-3 gap-2'>
              <div
                style={{
                  display: this.state.questionType === QuestionType.INPUT_BOX ? 'flex' : undefined,
                  justifyContent: this.state.questionType === QuestionType.INPUT_BOX ? 'space-between' : undefined,
                  alignItems: this.state.questionType === QuestionType.INPUT_BOX ? 'baseline' : undefined,
                  gap: this.state.questionType === QuestionType.INPUT_BOX ? '12px' : undefined,
                }}
                className='flex-column flex-sm-row tw-flex-grow'
              >
                <input
                  type='text'
                  name='title'
                  placeholder='Enter question title here'
                  className='form-control form-control-lg shadow-none text-base'
                  value={this.state.questionText ?? ''}
                  onChange={(e) => {
                    const updatedQuestion = {
                      ...this.state,
                      questionText: e.target.value,
                    };
                    this.setState(updatedQuestion);

                    const { dispatch, setSurveyQuestions, setSurvey, survey } = this.props.commonProps;
                    const newQuestions = this.props.commonProps.questions.map((question) => {
                      if (question.id === this.state.id) {
                        return updatedQuestion;
                      }
                      return question;
                    });
                    dispatch(setSurvey({ ...survey, hasUnsavedChanges: true }));
                    dispatch(setSurveyQuestions(newQuestions));
                  }}
                />
                <this.SurveyChoices />
              </div>
              <div className='d-flex align-items-start gap-2 flex-column flex-sm-row'>
                <select
                  className='form-select form-select-lg text-base shadow-none'
                  value={this.state.questionType ?? QuestionType.MULTIPLE_CHOICE}
                  onChange={(e) => {
                    const updatedQuestion = {
                      ...this.state,
                      questionType: e.target.value as QuestionType,
                      options: [],
                      // Set default input type when switching to INPUT_BOX
                      validation: e.target.value === QuestionType.INPUT_BOX ? TextInputType.TEXT : undefined,
                      // Initialize multiInputs when switching to MULTI_INBOX
                      multiInputs: e.target.value === QuestionType.MULTI_INBOX ? [] : undefined,
                    };
                    this.setState(updatedQuestion);

                    const { dispatch, setSurveyQuestions, setSurvey, survey } = this.props.commonProps;
                    const newQuestions = this.props.commonProps.questions.map((question) => {
                      if (question.id === this.state.id) {
                        return updatedQuestion;
                      }
                      return question;
                    });
                    dispatch(setSurvey({ ...survey, hasUnsavedChanges: true }));
                    dispatch(setSurveyQuestions(newQuestions));
                  }}
                >
                  <option value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</option>
                  <option value={QuestionType.CHECKBOXES}>Checkboxes</option>
                  <option value={QuestionType.INPUT_BOX}>Input Box</option>
                  <option value={QuestionType.DROPDOWN}>Dropdown</option>
                  <option value={QuestionType.FILE_UPLOAD}>File Upload</option>
                  <option value={QuestionType.MULTI_INBOX}>Multiple Inputs</option>
                </select>

                {/* Show the input type dropdown when INPUT_BOX is selected */}
                {this.state.questionType === QuestionType.INPUT_BOX && (
                  <select
                    className='form-select text-base form-select-lg shadow-none'
                    value={(this.state.validation as string) ?? TextInputType.TEXT}
                    onChange={(e) => {
                      const updatedQuestion = {
                        ...this.state,
                        validation: e.target.value as PatientSurveyValidationType,
                      };
                      this.setState(updatedQuestion);

                      const { dispatch, setSurveyQuestions, setSurvey, survey } = this.props.commonProps;
                      const newQuestions = this.props.commonProps.questions.map((question) => {
                        if (question.id === this.state.id) {
                          return updatedQuestion;
                        }
                        return question;
                      });
                      dispatch(setSurvey({ ...survey, hasUnsavedChanges: true }));
                      dispatch(setSurveyQuestions(newQuestions as SurveyQuestion[]));
                    }}
                  >
                    <option value={TextInputType.TEXT}>Text</option>
                    <option value={TextInputType.NUMBER}>Number</option>
                    <option value={TextInputType.EMAIL}>Email</option>
                    <option value={TextInputType.DATE}>Date</option>
                    <option value={TextInputType.DATETIME}>Datetime</option>
                    <option value={TextInputType.PHONE}>Phone</option>
                  </select>
                )}
              </div>
            </div>
            <div className='tw-w-full tw-px-3 tw-mt-4'>
              <div className='tw-flex tw-justify-end tw-items-center tw-gap-4 tw-border-t tw-border-neutral-200 tw-pt-4'>
                <div className='tw-flex tw-border-r tw-border-neutral-200 tw-pr-4 tw-gap-2'>
                  <button className='btn-transparent' type='button' onClick={copyQuestion}>
                    <MdContentCopy size={18} />
                  </button>
                  <button className='btn-transparent' type='button' onClick={deleteQuestion}>
                    <RiDeleteBin6Line size={18} />
                  </button>
                  <OverlayTrigger overlay={<Tooltip id='mapping-tooltip'>Mapping</Tooltip>} placement='top'>
                    <button
                      type='button'
                      className='btn-transparent tw-z-[3]'
                      onClick={() => this.setState((prevState) => ({ ...prevState, showMappingModal: true }))}
                    >
                      <MdCategory size={18} />
                    </button>
                  </OverlayTrigger>
                </div>
                <div className='tw-flex tw-items-center tw-gap-2 tw-pl-4'>
                  <p className='m-0 tw-text-[14px]'>Required</p>
                  <Switch
                    onColor='#3060fe'
                    checked={this.state.isRequired ?? false}
                    onChange={(checked) => {
                      const { dispatch, setSurvey, survey } = this.props.commonProps;
                      const updatedQuestion = { ...this.state, isRequired: checked };
                      this.setState(updatedQuestion);
                      const newQuestions = this.props.commonProps.questions.map((question) => {
                        if (question.id === this.state.id) {
                          return updatedQuestion;
                        }
                        return question;
                      });
                      dispatch(setSurvey({ ...survey, hasUnsavedChanges: true }));
                      dispatch(setSurveyQuestions(newQuestions));
                    }}
                  />
                </div>
                <div className='tw-flex tw-items-center tw-gap-2 tw-pl-4 tw-z-[3]'>
                  <p className='m-0 tw-text-[14px]'>Highlighted</p>
                  <Switch
                    onColor='#3060fe'
                    checked={this.state.isHighlighted ?? false}
                    onChange={(checked) => {
                      const { dispatch, setSurvey, survey } = this.props.commonProps;
                      const updatedQuestion = { ...this.state, isHighlighted: checked };
                      this.setState(updatedQuestion);
                      const newQuestions = this.props.commonProps.questions.map((question) => {
                        if (question.id === this.state.id) {
                          return updatedQuestion;
                        }
                        return question;
                      });
                      dispatch(setSurvey({ ...survey, hasUnsavedChanges: true }));
                      dispatch(setSurveyQuestions(newQuestions));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <MappingModal
          onUpdate={handleUpdateQuestion}
          question={this.state}
          isOpen={this.state.showMappingModal ?? false} // Type assertion needed because showMappingModal is optional
          onClose={() => this.setState((prevState) => ({ ...prevState, showMappingModal: false }))}
        />
      </>
    );
  }
}
