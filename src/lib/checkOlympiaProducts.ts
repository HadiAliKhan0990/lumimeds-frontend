import { fetchProducts } from '@/services/products';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

/**
 * Checks if Olympia products are available
 * @returns Promise<boolean> - true if Olympia products exist, false otherwise
 */
export async function checkOlympiaProductsAvailable(): Promise<boolean> {
  try {
    const data: ProductTypesResponseData = await fetchProducts({
      keys: [{ name: 'olympiaPlans', categories: ['weight_loss_glp_1_503b_injection_one_time'] }],
    });

    // Check if olympiaPlans exists and has products
    const olympiaPlans = data?.olympiaPlans;
    if (!olympiaPlans || !olympiaPlans.products || olympiaPlans.products.length === 0) {
      return false;
    }

    // Check if any products have active prices
    const hasActiveProducts = olympiaPlans.products.some(product => 
      product.prices && product.prices.length > 0 && product.prices.some(price => price.isActive)
    );

    return hasActiveProducts;
  } catch (error) {
    console.error('Error checking Olympia products:', error);
    return false;
  }
}

/**
 * Checks if any products are available from the given data
 * @param data - ProductTypesResponseData to check
 * @returns boolean - true if any products exist with active prices, false otherwise
 */
export function hasAnyActiveProducts(data: ProductTypesResponseData): boolean {
  try {
    // Check all product categories
    const productCategories = ['olympiaPlans', 'glp_1_gip_plans', 'glp_1_plans'] as const;
    
    for (const category of productCategories) {
      const categoryData = data?.[category];
      if (categoryData?.products && categoryData.products.length > 0) {
        const hasActiveProducts = categoryData.products.some(product => 
          product.prices && product.prices.length > 0 && product.prices.some(price => price.isActive)
        );
        if (hasActiveProducts) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking active products:', error);
    return false;
  }
}
