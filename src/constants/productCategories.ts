import { ProductCategoryKeyType } from '@/types/products';

/**
 * Product category keys mapping for survey flows
 * Maps survey category (e.g., 'weight_loss', 'longevity') to their product fetch keys
 */
export const PRODUCT_CATEGORY_KEYS = {
  weight_loss: [
    { name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] },
    {
      name: 'glp_1_gip_plans',
      categories: ['weight_loss_glp_1_gip_injection_recurring', 'weight_loss_glp_1_gip_injection_one_time'],
      useDbPosition: true
    },
    {
      name: 'glp_1_plans',
      categories: ['weight_loss_glp_1_injection_recurring'],
      useDbPosition: true
    },
  ],
  longevity: [
    { name: 'nad_plans', categories: ['longevity_nad_injection_recurring'], useDbPosition: true },
  ],
} as const satisfies Record<string, ProductCategoryKeyType[]>;

/**
 * Valid survey category types
 */
export type SurveyCategory = keyof typeof PRODUCT_CATEGORY_KEYS;

/**
 * Check if a string is a valid survey category
 */
export function isValidSurveyCategory(category: string): category is SurveyCategory {
  return category in PRODUCT_CATEGORY_KEYS;
}

/**
 * Get product keys for a given survey category
 * @param category Survey category (e.g., 'weight_loss', 'longevity')
 * @returns Product keys configuration or undefined if category not found
 */
export function getProductKeysForCategory(category: string): ProductCategoryKeyType[] | undefined {
  if (isValidSurveyCategory(category)) {
    return PRODUCT_CATEGORY_KEYS[category] as ProductCategoryKeyType[];
  }
  return undefined;
}

