
/**
 * Calculates total ml: vial size × number of vials
 *
 * @param quantity - Vial size
 * @param vials - Number of vials, defaults to 1 if not provided
 * @returns Total ml as a number, or 0 if invalid
 */
export const calculateTotalMl = (
  quantity: number | string | undefined,
  vials?: number | string | null
): number => {
  if (!quantity) return 0;

  const vialSize = parseFloat(String(quantity)) || 0;
  const noOfVials = parseFloat(String(vials || '1')) || 1;

  return vialSize * noOfVials;
};

/**
 * Calculates total mg: concentration × total ml
 *
 * @param concentration - Product concentration
 * @param quantity - Vial size
 * @param vials - Number of vials, defaults to 1 if not provided
 * @returns Formatted total mg string (e.g., "100.00 mg") or empty string if invalid
 */
export const calculateTotalMg = (
  concentration: number | string | null | undefined,
  quantity: number | string | undefined,
  vials?: number | string | null
): string => {
  if (!quantity || !concentration) return '';

  const concentrationValue = parseFloat(String(concentration)) || 0;
  const totalMl = calculateTotalMl(quantity, vials);

  return `${(concentrationValue * totalMl).toFixed(2)}`;
};