import { TelepathNote } from '@/store/slices/telepathApiSlice';
import { Spinner } from 'react-bootstrap';
import { format } from 'date-fns';

interface ChartNotesDisplayProps {
  notes: TelepathNote[];
  searchTerm: string;
  isInitialLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}

interface ParsedChartNote {
  note: string;
  timestamp: string;
  createdBy: string;
}

export const ChartNotesDisplay = ({
  notes,
  searchTerm,
  isInitialLoading,
  isFetchingMore,
  hasMore,
  isError,
  error,
  onRetry,
}: ChartNotesDisplayProps) => {
  const parseChartNotes = (chartNotesString: string): ParsedChartNote[] => {
    if (!chartNotesString) return [];

    // Split by double newlines to get individual entries
    const entries = chartNotesString.split(/\r\n\r\n|\n\n/).filter((entry) => entry.trim());

    return entries
      .map((entry) => {
        const lines = entry.split(/\r\n|\n/).filter((line) => line.trim());

        if (lines.length === 0) return null;

        // First line is the note text
        const note = lines[0]?.trim() || '';

        // Second line contains timestamp and creator
        let timestamp = '';
        let createdBy = '';

        if (lines.length > 1) {
          const timestampLine = lines[1]?.trim() || '';
          // Parse format: "MM-DD-YYYY HH:MM AM/PM ( Created By - Name )"
          // Try to match the pattern with parentheses
          const matchWithParens = timestampLine.match(/^(.+?)\s*\(\s*Created By\s*-\s*(.+?)\s*\)$/);
          if (matchWithParens) {
            timestamp = matchWithParens[1]?.trim() || '';
            createdBy = matchWithParens[2]?.trim() || '';
          } else {
            // Fallback: try without parentheses
            const matchWithoutParens = timestampLine.match(/^(.+?)\s*Created By\s*-\s*(.+?)$/);
            if (matchWithoutParens) {
              timestamp = matchWithoutParens[1]?.trim() || '';
              createdBy = matchWithoutParens[2]?.trim() || '';
            } else {
              // Final fallback: use the whole line as timestamp
              timestamp = timestampLine;
            }
          }
        }

        return { note, timestamp, createdBy };
      })
      .filter((entry): entry is ParsedChartNote => entry !== null);
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim() || !text) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} style={{ backgroundColor: '#fef08a', padding: '2px 4px', borderRadius: '2px' }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const doesNoteMatchSearch = (parsedNote: ParsedChartNote, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      parsedNote.note.toLowerCase().includes(searchLower) ||
      parsedNote.timestamp.toLowerCase().includes(searchLower) ||
      parsedNote.createdBy.toLowerCase().includes(searchLower)
    );
  };

  if (isInitialLoading) {
    return (
      <div className='d-flex justify-content-center align-items-center py-5'>
        <Spinner className='border-2' />
      </div>
    );
  }

  if (isError) {
    const errorMessage =
      error &&
      typeof error === 'object' &&
      'data' in error &&
      error.data &&
      typeof error.data === 'object' &&
      'message' in error.data
        ? (error.data as { message?: string })?.message || 'Failed to load chart notes'
        : 'Failed to load chart notes';
    return (
      <div className='text-center py-5'>
        <p className='text-danger mb-2'>{errorMessage}</p>
        <button className='btn btn-sm btn-outline-primary' onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  // Filter notes that have chartNotes
  const notesWithChartNotes = notes.filter(
    (note) => note.chartNotes && typeof note.chartNotes === 'string' && note.chartNotes.trim()
  );

  // Process and filter notes based on search
  const processedNotes = notesWithChartNotes
    .map((note, noteIndex) => {
      const parsedNotes = parseChartNotes(note.chartNotes as string);

      // Filter parsed notes based on search term
      const filteredParsedNotes = searchTerm.trim()
        ? parsedNotes.filter((parsedNote) => doesNoteMatchSearch(parsedNote, searchTerm))
        : parsedNotes;

      // Only include if there are matching notes
      if (filteredParsedNotes.length === 0) return null;

      return {
        note,
        noteIndex,
        parsedNotes: filteredParsedNotes,
      };
    })
    .filter((item): item is { note: TelepathNote; noteIndex: number; parsedNotes: ParsedChartNote[] } => item !== null);

  if (processedNotes.length === 0) {
    return (
      <div className='text-center py-5'>
        <p className='text-muted mb-0'>No chart notes available at this time.</p>
      </div>
    );
  }

  return (
    <div className='d-flex flex-column gap-3'>
      <div className='d-flex flex-column gap-3' style={{ maxHeight: 'none' }}>
        {processedNotes.map(({ note, noteIndex, parsedNotes }) => (
          <div
            key={`${note.telepathOrderId || noteIndex}-${noteIndex}`}
            className='card tw-bg-white border rounded-3 p-3 tw-shadow-sm hover:tw-shadow-md tw-transition-shadow tw-duration-200'
          >
            <div className='d-flex justify-content-between align-items-start mb-3'>
              <div className='d-flex flex-column gap-1'>
                <div className='d-flex align-items-center gap-2'>
                  <span className='fw-semibold text-sm'>Telepath Order #{note.telepathOrderId || 'N/A'}</span>
                </div>
              </div>
              {note.orderCreatedAt && <span className='text-muted text-xs'>{formatDateTime(note.orderCreatedAt)}</span>}
            </div>

            <div className='d-flex flex-column gap-2'>
              {parsedNotes.map((parsedNote, idx) => (
                <div
                  key={idx}
                  className='card tw-bg-white border rounded-2 p-3'
                  style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                >
                  <div className='d-flex justify-content-between align-items-start mb-2'>
                    <div className='flex-grow-1' style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                      <p className='text-sm mb-0'>{highlightText(parsedNote.note, searchTerm)}</p>
                    </div>
                    {parsedNote.timestamp && (
                      <span className='text-xs text-muted fw-bold ms-3' style={{ whiteSpace: 'nowrap' }}>
                        {highlightText(parsedNote.timestamp, searchTerm)}
                      </span>
                    )}
                  </div>
                  {parsedNote.createdBy && (
                    <div className='mt-1'>
                      <span className='text-xs text-muted fst-italic'>
                        Created By: {highlightText(parsedNote.createdBy, searchTerm)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {isFetchingMore && (
        <div className='d-flex justify-content-center py-3'>
          <Spinner size='sm' className='border-2' />
        </div>
      )}
      {!hasMore && processedNotes.length > 0 && (
        <div className='text-center py-3'>
          <p className='text-muted text-xs mb-0'>No more chart notes to load</p>
        </div>
      )}
    </div>
  );
};
