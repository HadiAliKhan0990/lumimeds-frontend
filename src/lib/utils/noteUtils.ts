import { PatientNote } from '@/store/slices/patientNoteSlice';
import { CreatedByInfo } from '@/store/slices/orderSlice';

// Extended interface to include createdBy from API response
export interface PatientNoteWithCreatedBy extends PatientNote {
  createdByInfo?: CreatedByInfo;
  createdBy?: {
    id?: string;
    email?: string;
    role?: string;
    provider?: CreatedByInfo & { id?: string } | null;
    admin?: CreatedByInfo & { id?: string } | null;
  };
}

/**
 * Helper function to get creator name from note
 * Handles both API response formats:
 * 1. createdByInfo - direct firstName/lastName
 * 2. createdBy - nested admin/provider objects
 * Falls back to email if no name is available
 */
export const getCreatorName = (note: PatientNoteWithCreatedBy): string => {
  // First check createdByInfo (used in some endpoints)
  if (note.createdByInfo?.firstName || note.createdByInfo?.lastName) {
    return `${note.createdByInfo?.firstName || ''} ${note.createdByInfo?.lastName || ''}`.trim();
  }
  // Fallback to createdByInfo email if no name
  if (note.createdByInfo?.email) {
    return note.createdByInfo.email;
  }
  // Then check createdBy with nested admin/provider
  if (note.createdBy) {
    if (note.createdBy.admin?.firstName || note.createdBy.admin?.lastName) {
      return `${note.createdBy.admin?.firstName || ''} ${note.createdBy.admin?.lastName || ''}`.trim();
    }
    if (note.createdBy.provider?.firstName || note.createdBy.provider?.lastName) {
      return `${note.createdBy.provider?.firstName || ''} ${note.createdBy.provider?.lastName || ''}`.trim();
    }
    // Fallback to email if no name is available
    if (note.createdBy.email) {
      return note.createdBy.email;
    }
  }
  return '';
};

