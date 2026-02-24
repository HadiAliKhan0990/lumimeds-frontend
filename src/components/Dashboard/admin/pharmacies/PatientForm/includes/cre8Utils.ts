/**
 * Formats vials display for CRE8: "1 x 2 ML, 3 x 4 ML, 5 x 6 ML"
 * 
 * @param quantity - Vial Size (1st)
 * @param vials - No of Vials (1st)
 * @param quantity2 - Vial Size (2nd), optional
 * @param vials2 - No of Vials (2nd), optional
 * @param quantity3 - Vial Size (3rd), optional
 * @param vials3 - No of Vials (3rd), optional
 * @param quantityUnits - Unit string (defaults to 'ML')
 * @returns Formatted string like "1 x 2 ML, 3 x 4 ML"
 */
export const formatCre8Vials = (
  quantity: number | string | undefined,
  vials: number | string | null | undefined,
  quantity2?: number | string | null,
  vials2?: number | string | null,
  quantity3?: number | string | null,
  vials3?: number | string | null,
  quantityUnits?: string
): string => {
  const parts: string[] = [];
  const units = quantityUnits || 'ML';

  // First set
  if (quantity) {
    const qty = parseFloat(String(quantity)) || 0;
    const vialsCount = vials && vials !== '' && vials !== '0' ? parseInt(String(vials)) : 1;
    if (vialsCount > 0 && qty > 0) {
      parts.push(`${vialsCount} x ${qty} ${units}`);
    }
  }

  // Second set
  if (quantity2) {
    const qty2 = parseFloat(String(quantity2)) || 0;
    const vialsCount2 = vials2 && vials2 !== '' && vials2 !== '0' ? parseInt(String(vials2)) : 1;
    if (vialsCount2 > 0 && qty2 > 0) {
      parts.push(`${vialsCount2} x ${qty2} ${units}`);
    }
  }

  // Third set
  if (quantity3) {
    const qty3 = parseFloat(String(quantity3)) || 0;
    const vialsCount3 = vials3 && vials3 !== '' && vials3 !== '0' ? parseInt(String(vials3)) : 1;
    if (vialsCount3 > 0 && qty3 > 0) {
      parts.push(`${vialsCount3} x ${qty3} ${units}`);
    }
  }

  return parts.join(', ');
};

/**
 * Generates a unique prescription ID for CRE8 pharmacy using timestamp-based number
 * Format: Date.now() + random 3-digit number (e.g., "1734567890123456")
 * This ensures uniqueness even if called at the same millisecond
 * 
 * @returns A unique prescription ID string
 */
export const generateCre8PrescriptionId = (): string => {
  return `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
};
