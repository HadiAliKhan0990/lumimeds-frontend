import { useEffect, useState, useMemo } from 'react';

interface Props {
  value?: string;
  handleChange: (raw: string) => void;
  handleBlur: () => void;
}

/**
 * Parses height value in format "feet-inches" (e.g., "5-10")
 * Returns { feet, inches } with defaults if parsing fails
 */
const parseHeightValue = (value: string | undefined): { feet: string; inches: string } => {
  if (!value || typeof value !== 'string') {
    return { feet: '0', inches: '0' };
  }

  const parts = value.split('-');
  if (parts.length !== 2) {
    return { feet: '0', inches: '0' };
  }

  const [feetStr, inchesStr] = parts;
  const feetNum = Number.parseInt(feetStr, 10);
  const inchesNum = Number.parseInt(inchesStr, 10);

  // Validate and clamp values
  const feet = Number.isNaN(feetNum) || feetNum < 0 || feetNum > 8 ? '0' : String(feetNum);
  const inches = Number.isNaN(inchesNum) || inchesNum < 0 || inchesNum > 11 ? '0' : String(inchesNum);

  return { feet, inches };
};

export const HeightQuestion = ({ value, handleChange, handleBlur }: Readonly<Props>) => {
  const parsed = useMemo(() => parseHeightValue(value), [value]);
  const [feet, setFeet] = useState<string>(parsed.feet);
  const [inches, setInches] = useState<string>(parsed.inches);

  // Sync local state when value prop changes (e.g., from external updates)
  useEffect(() => {
    const newParsed = parseHeightValue(value);
    setFeet(newParsed.feet);
    setInches(newParsed.inches);
  }, [value]);

  /**
   * Handles changes to feet or inches dropdown
   */
  const handleHeightChange = (newValue: string, part: 'feet' | 'inches') => {
    let newFeet = feet;
    let newInches = inches;

    if (part === 'feet') {
      const feetNum = Number.parseInt(newValue, 10);
      // Validate feet: 0-8
      if (!Number.isNaN(feetNum) && feetNum >= 0 && feetNum <= 8) {
        newFeet = newValue;
        setFeet(newFeet);
      } else {
        // Invalid value, don't update
        return;
      }
    } else if (part === 'inches') {
      const inchesNum = Number.parseInt(newValue, 10);
      // Validate inches: 0-11
      if (!Number.isNaN(inchesNum) && inchesNum >= 0 && inchesNum <= 11) {
        newInches = newValue;
        setInches(newInches);
      } else {
        // Invalid value, don't update
        return;
      }
    }

    // Format: "feet-inches" (e.g., "5-10")
    const formattedValue = `${newFeet}-${newInches}`;
    handleChange(formattedValue);
  };

  return (
    <div className='tw-flex tw-flex-row tw-gap-2 md:tw-gap-4'>
      <div className='tw-w-1/2 tw-text-left'>
        <label htmlFor='height-feet-input' className='tw-block tw-mb-2 tw-font-medium'>
          Feet
        </label>
        <select
          id='height-feet-input'
          className='form-select dark-input border-black rounded-1'
          value={feet}
          onChange={(e) => handleHeightChange(e.target.value, 'feet')}
          onBlur={handleBlur}
          aria-label='Select feet'
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((f) => (
            <option key={f} value={String(f)}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className='tw-w-1/2 tw-text-left'>
        <label htmlFor='height-inches-input' className='tw-block tw-mb-2 tw-font-medium'>
          Inches
        </label>
        <select
          id='height-inches-input'
          className='form-select dark-input border-black rounded-1'
          value={inches}
          onChange={(e) => handleHeightChange(e.target.value, 'inches')}
          onBlur={handleBlur}
          aria-label='Select inches'
        >
          {Array.from({ length: 12 }, (_, i) => i).map((inch) => (
            <option key={inch} value={String(inch)}>
              {inch}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
