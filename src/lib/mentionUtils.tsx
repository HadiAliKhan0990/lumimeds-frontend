import React from 'react';

interface ParsedMention {
  type: 'text' | 'mention';
  content: string;
  patientName?: string;
  patientId?: string;
}

/**
 * Parses message content to identify structured mentions {patientId}{patientName} and convert them to clickable links
 * @param content - The message content string
 * @param patients - Array of patients to match against (optional, for fallback)
 * @returns Array of parsed content parts
 */
export const parseMentions = (content: string): ParsedMention[] => {
  if (!content) return [];

  const parts: ParsedMention[] = [];
  let lastIndex = 0;

  // Regex to match {patientId}{patientName} format
  const mentionRegex = /\{([^}]+)\}\{([^}]+)\}/g;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const [fullMatch, patientId, patientName] = match;
    const matchIndex = match.index;

    // Add text before the mention
    if (matchIndex > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, matchIndex),
      });
    }

    // Add the mention - always parse structured mentions even if patients data is temporarily unavailable
    parts.push({
      type: 'mention',
      content: fullMatch,
      patientName: patientName,
      patientId: patientId,
    });

    lastIndex = matchIndex + fullMatch.length;
  }

  // Add remaining text after the last mention
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex),
    });
  }

  return parts;
};

/**
 * Renders parsed content with clickable mentions
 * @param parsedContent - Array of parsed content parts
 * @param className - CSS class for styling
 * @param onPatientClick - Optional click handler for patient mentions
 * @returns JSX elements
 */
export const renderMentions = (
  parsedContent: ParsedMention[],
  className?: string,
  onPatientClick?: (patientId: string, patientName?: string, patientEmail?: string) => void
) => {
  return parsedContent.map((part, index) => {
    if (part.type === 'mention' && part.patientId) {
      return (
        <span
          key={index}
          className={`text-primary text-decoration-none fw-medium cursor-pointer ${className || ''}`}
          style={{
            color: '#007bff',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
          onClick={() => {
            onPatientClick?.(part.patientId!, part.patientName, undefined);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          @{part.patientName}
        </span>
      );
    }

    return (
      <span key={index} className={className}>
        {part.content}
      </span>
    );
  });
};
