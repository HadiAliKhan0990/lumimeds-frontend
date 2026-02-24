'use client';

import Image from 'next/image';
import Logo from '@/assets/logo.png';
import DraggableList from 'react-draggable-list';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setSurveyQuestions } from '@/store/slices/surveyQuestionsSlice';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { useGetSurveyQuery, useLazyGetMappingModelsQuery } from '@/store/slices/surveysApiSlice';
import { setSurvey, Survey } from '@/store/slices/surveySlice';
import { DraggableListItem } from '@/components/Dashboard/forms/DraggableListItem';
import { setMappingModels } from '@/store/slices/formBuilderSlice';
import { toast } from 'react-hot-toast';

export default function FormBuilder() {
  const dispatch = useDispatch();

  const containerRef = useRef<HTMLDivElement>(null);

  const [survey, setSurveyState] = useState<Survey | null>(null);

  const surveySelector = useSelector((state: RootState) => state.survey);

  useGetSurveyQuery({ surveyId: survey?.id || '' }, { skip: !survey?.id });
  const [triggerGetMappingModels] = useLazyGetMappingModelsQuery();

  const questions = useSelector((state: RootState) => state.surveyQuestions);

  const onMoveEnd = (newList: readonly SurveyQuestion[]) => {
    dispatch(setSurvey({ ...survey, hasUnsavedChanges: true }));
    const newQuestions = [...newList].map((question, index) => {
      return {
        ...question,
        position: index + 1,
      };
    });
    dispatch(setSurveyQuestions(newQuestions));
  };

  async function fetchMappingModels() {
    try {
      const { success, data, message } = await triggerGetMappingModels().unwrap();
      if (success) {
        dispatch(setMappingModels(data?.models || []));
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchMappingModels();
  }, []);

  useEffect(() => {
    if (surveySelector.id) {
      setSurveyState(surveySelector);
    } else {
      const survey = JSON.parse(localStorage.getItem('lumimeds_savedSurvey') ?? '{}') as Survey;
      setSurveyState(survey);
    }
  }, [surveySelector]);

  return (
    <div className='p-3 p-md-4 bg-light'>
      <Image className='mb-4 mx-auto' src={Logo} alt='LumiMeds logo' width={160} />
      <div ref={containerRef}>
        <DraggableList
          padding={24}
          list={questions}
          commonProps={{ questions, dispatch, setSurveyQuestions, setSurvey, survey }}
          itemKey={'id'}
          template={DraggableListItem}
          onMoveEnd={onMoveEnd}
          container={() => containerRef.current!}
        />
      </div>
    </div>
  );
}
