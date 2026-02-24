/**
 * Position type for tooltip placement
 */
export type TooltipPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * Result of tooltip position calculation
 */
export interface TooltipPositionResult {
  top: number;
  left: number;
  finalPosition: TooltipPosition;
}

/**
 * Calculates the optimal position for a tooltip relative to its trigger element
 * Automatically adjusts position to keep tooltip within viewport bounds
 *
 * @param {DOMRect} triggerRect - The bounding rectangle of the trigger element
 * @param {DOMRect} tooltipRect - The bounding rectangle of the tooltip element
 * @param {TooltipPosition} preferredPosition - The preferred position for the tooltip
 * @returns {TooltipPositionResult} The calculated position with coordinates and final position
 *
 * @example
 * const triggerRect = triggerElement.getBoundingClientRect();
 * const tooltipRect = tooltipElement.getBoundingClientRect();
 * const { top, left, finalPosition } = calculateTooltipPosition(triggerRect, tooltipRect, 'top');
 */
export function calculateTooltipPosition(
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  preferredPosition: TooltipPosition
): TooltipPositionResult {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 8; // Padding from viewport edges
  const arrowOffset = 12; // Space for arrow

  let top = 0;
  let left = 0;
  let finalPosition = preferredPosition;

  // Calculate initial position based on preferred position
  const isTopPosition = preferredPosition.includes('top');
  const isBottomPosition = preferredPosition.includes('bottom');
  const isLeftPosition = preferredPosition === 'left';
  const isRightPosition = preferredPosition === 'right';

  if (isTopPosition) {
    // Position above trigger
    top = triggerRect.top - tooltipRect.height - arrowOffset;
    left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

    // If doesn't fit on top, flip to bottom
    if (top < padding) {
      top = triggerRect.bottom + arrowOffset;
      finalPosition = preferredPosition.replace('top', 'bottom') as TooltipPosition;
    }
  } else if (isBottomPosition) {
    // Position below trigger
    top = triggerRect.bottom + arrowOffset;
    left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

    // If doesn't fit on bottom, flip to top
    if (top + tooltipRect.height > viewportHeight - padding) {
      top = triggerRect.top - tooltipRect.height - arrowOffset;
      finalPosition = preferredPosition.replace('bottom', 'top') as TooltipPosition;
    }
  } else if (isLeftPosition) {
    // Position to the left of trigger
    top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
    left = triggerRect.left - tooltipRect.width - arrowOffset;

    // If doesn't fit on left, flip to right
    if (left < padding) {
      left = triggerRect.right + arrowOffset;
      finalPosition = 'right';
    }
  } else if (isRightPosition) {
    // Position to the right of trigger
    top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
    left = triggerRect.right + arrowOffset;

    // If doesn't fit on right, flip to left
    if (left + tooltipRect.width > viewportWidth - padding) {
      left = triggerRect.left - tooltipRect.width - arrowOffset;
      finalPosition = 'left';
    }
  }

  // Constrain to viewport bounds to prevent overflow
  left = Math.max(padding, Math.min(left, viewportWidth - tooltipRect.width - padding));
  top = Math.max(padding, Math.min(top, viewportHeight - tooltipRect.height - padding));

  return { top, left, finalPosition };
}
