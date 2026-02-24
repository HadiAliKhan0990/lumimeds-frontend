/**
 * Calculates BMI (Body Mass Index)
 * @param heightInInches - Height in inches
 * @param weightInPounds - Weight in pounds
 * @returns The calculated BMI value, rounded to one decimal place
 */
export function calculateBMI(heightInInches: number, weightInPounds: number): number {
  if (heightInInches <= 0 || weightInPounds <= 0) {
    return 0;
  }

  const bmi = (weightInPounds / heightInInches ** 2) * 703;
  return parseFloat(bmi.toFixed(1));
}

export function getBmi(value: string) {
  const [height = '', width = ''] = (value || '').split(',');
  const [feet = '', inches = ''] = height.split('-');

  const heightInInches = Number(feet) * 12 + Number(inches);
  const weight = Number(width);

  return calculateBMI(heightInInches, weight);
}
