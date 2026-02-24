declare module 'react-mentions' {
  import * as React from 'react';

  export interface SuggestionDataItem {
    id: string | number;
    display: string;
    [key: string]: unknown;
  }

  export interface MentionsInputProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    inputRef?: React.Ref<HTMLTextAreaElement>;
    className?: string;
    style?: Record<string, unknown>;
  }

  export const MentionsInput: React.FC<MentionsInputProps>;

  export interface MentionProps {
    trigger: string | RegExp;
    data:
      | SuggestionDataItem[]
      | ((query: string, callback: (items: SuggestionDataItem[]) => void) => void)
      | ((query: string) => Promise<SuggestionDataItem[]>);
    markup?: string;
    displayTransform?: (id: string | number, display: string) => string;
    className?: string;
    style?: Record<string, unknown>;
  }

  export const Mention: React.FC<MentionProps>;
}


