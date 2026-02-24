'use client';

import { PatientSurvey } from '@/lib/types';
import { PatientPopupCard } from '@/components/Dashboard/admin/SurveyPopupCard';

interface SubmittedFormsTabProps {
  surveys: PatientSurvey[];
  onEditSurvey?: (survey: PatientSurvey) => void;
  onViewLogs?: (survey: PatientSurvey) => void;
}

export function SubmittedFormsTab({ surveys, onEditSurvey, onViewLogs }: SubmittedFormsTabProps) {
  if (!surveys || surveys.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p>No submitted forms</p>
      </div>
    );
  }

  return <PatientPopupCard surveys={surveys} onEditSurvey={onEditSurvey} onViewLogs={onViewLogs} />;
}

