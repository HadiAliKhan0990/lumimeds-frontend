import { fetcher } from '@/lib/fetcher';
import { ProductTypesResponse, ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductsListPayload } from '@/types/products';

export async function fetchProducts(payload: ProductsListPayload): Promise<ProductTypesResponseData> {
  try {
    const { data } = await fetcher<ProductTypesResponse>('/medications/product-list', {
      method: 'POST',
      data: payload,
    });
    return (
      data ?? {
        olympiaPlans: undefined,
        glp_1_gip_plans: undefined,
        glp_1_plans: undefined,
        nad_plans: undefined,
      }
    );
  } catch (error) {
    console.log('Failed to fetch products:', error);
    return {
      olympiaPlans: undefined,
      glp_1_gip_plans: undefined,
      glp_1_plans: undefined,
      nad_plans: undefined,
    };
  }
}
