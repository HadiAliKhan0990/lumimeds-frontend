import React, { useRef, useEffect, forwardRef } from 'react'
import { Spinner } from 'react-bootstrap'


export interface TextAreaProps extends React.ComponentPropsWithoutRef<'textarea'> {
    label?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    containerClassName?: string;
    disableResize?: boolean;
    autoResize?: boolean;
    isLoading?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
    label,
    containerClassName = '',
    disableResize = false,
    autoResize = false,
    isLoading = false,
    ...props
}, forwardedRef) => {

    const { className, style, onChange, rows = 3 } = props
    const internalRef = useRef<HTMLTextAreaElement>(null)

    const handleResize = () => {
        const textarea = internalRef.current
        if (!textarea || !autoResize) return

        // Store current cursor position to restore it later
        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        // Reset height to calculate scrollHeight properly
        textarea.style.height = 'auto'

        // Calculate max height based on rows prop (use 3 as default if not provided)
        const maxRows = rows || 3
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight)
        const paddingTop = parseInt(window.getComputedStyle(textarea).paddingTop)
        const paddingBottom = parseInt(window.getComputedStyle(textarea).paddingBottom)
        const maxHeight = (lineHeight * maxRows) + paddingTop + paddingBottom

        // Calculate minimum height (single row)
        const minHeight = lineHeight + paddingTop + paddingBottom

        // Set height to scrollHeight, but constrain between min and max
        const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight))
        textarea.style.height = `${newHeight}px`

        // Add overflow if content exceeds max height
        if (textarea.scrollHeight > maxHeight) {
            textarea.style.overflowY = 'auto'
        } else {
            textarea.style.overflowY = 'hidden'
        }

        // Restore cursor position
        textarea.setSelectionRange(start, end)
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (autoResize) {
            handleResize()
        }
        onChange?.(e)
    }

    useEffect(() => {
        if (autoResize && internalRef.current) {

            // Only run on mount to set initial height
            handleResize()
        }
    }, [autoResize])

    // Ref callback to merge internal and forwarded refs
    const textareaRefCallback = (element: HTMLTextAreaElement | null) => {
        // Update internal ref
        internalRef.current = element

        // Update forwarded ref
        if (typeof forwardedRef === 'function') {
            forwardedRef(element)
        } else if (forwardedRef) {
            forwardedRef.current = element
        }

        // Handle auto-resize on mount
        if (element && autoResize) {
            requestAnimationFrame(() => {
                handleResize()
            })
        }
    }

    // Determine resize behavior
    const getResizeStyle = () => {
        if (disableResize) {
            return 'none'
        }
        if (autoResize) {
            return 'none' // Disable manual resize when auto-resizing
        }
        return 'vertical' // Default behavior
    }

    const textareaStyle = {
        ...style,
        resize: getResizeStyle() as 'none' | 'vertical',
        ...(autoResize && {
            overflowY: 'hidden' as const
        })
    }

    return (
        <div className={`${containerClassName} position-relative`}>
            {label && <label>{label}</label>}
            <textarea
                ref={textareaRefCallback}
                {...props}
                rows={autoResize ? 1 : rows} // Override rows to 1 when autoResize is enabled
                className={`form-control shadow-none ${className}`}
                style={textareaStyle}
                onChange={handleChange}
            />
            {isLoading && <div className='position-absolute  tw-bottom-1 tw-right-2'><Spinner size='sm' /></div>}
        </div>
    )
})

TextArea.displayName = 'TextArea';
