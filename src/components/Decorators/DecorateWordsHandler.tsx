import React, { useEffect, useState } from 'react'

export interface DecorateWordsHandlerProps {
    sentence: string;
    words: string[];
    WrapperTag?: React.ElementType;
    wrapperProps?: React.HTMLAttributes<HTMLElement>;
}

export const DecorateWordsHandler = ({
    sentence,
    words,
    WrapperTag = 'span',
    wrapperProps = {},
}: DecorateWordsHandlerProps) => {
    const [decoratedSentence, setDecoratedSentence] = useState<React.ReactNode[]>([]);

    useEffect(() => {

        // Function to wrap matching words in the sentence
        const decorateSentence = () => {
            const parts: React.ReactNode[] = [];
            let searchText = sentence?.toLowerCase();

            // Find all occurrences of matching words
            words.forEach((word) => {
                const regex = new RegExp(`\\b${word?.toLowerCase()}\\b`, 'gi');
                let match;
                const tempParts: React.ReactNode[] = [];
                let lastIndex = 0;

                while ((match = regex.exec(searchText)) !== null) {
                    // Add text before match
                    if (match.index > lastIndex) {
                        tempParts.push(searchText.substring(lastIndex, match.index));
                    }

                    // Add wrapped match
                    tempParts.push(
                        <WrapperTag key={`${word}-${match.index}`} {...wrapperProps}>
                            {match[0]}
                        </WrapperTag>
                    );

                    lastIndex = regex.lastIndex;
                }

                // Add remaining text
                if (lastIndex < searchText.length) {
                    tempParts.push(searchText.substring(lastIndex));
                }

                if (tempParts.length > 0) {
                    searchText = tempParts.join('');
                }
            });

            // If no matches found, return original sentence
            if (parts.length === 0) {
                // Split sentence by words and wrap matching ones
                const sentenceWords = sentence.split(/(\s+)/);

                return sentenceWords.map((part, index) => {
                    const matchedWord = words.find(
                        (word) => part.toLowerCase().trim() === word.toLowerCase().trim()
                    );

                    if (matchedWord) {
                        return (
                            <WrapperTag key={index} {...wrapperProps}>
                                {part}
                            </WrapperTag>
                        );
                    }

                    return <React.Fragment key={index}>{part}</React.Fragment>;
                });
            }

            return parts;
        };

        setDecoratedSentence(decorateSentence());
    }, [sentence, words])

    return <>{decoratedSentence}</>;
}