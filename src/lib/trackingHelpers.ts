/**
 * Tracking Helper Functions
 * 
 * Helper functions to determine product and survey categories for tracking
 */

import { ProductType } from '@/store/slices/productTypeSlice';

export type ProductCategory = 'longevity' | 'weight_loss';
export type SurveyCategory = 'longevity' | 'weight_loss';

/**
 * Determine product category from ProductType
 * Uses product.category field, falls back to URL pathname if product not available
 */
export function getProductCategory(product: ProductType | null | undefined): ProductCategory {
  // If product has category field, use it
  if (product?.category) {
    const categoryLower = product.category.toLowerCase();
    
    // NAD+ products have 'nad' or 'longevity_nad' in category
    if (categoryLower.includes('nad') || categoryLower.includes('longevity_nad')) {
      return 'longevity';
    }
    
    // All other products are weight_loss (GLP-1, GLP-1/GIP, Olympia)
    return 'weight_loss';
  }
  
  // Fallback: Check URL pathname
  if (typeof window !== 'undefined' && window.location.pathname?.includes('longevity')) {
    return 'longevity';
  }
  
  // Default to weight_loss
  return 'weight_loss';
}

