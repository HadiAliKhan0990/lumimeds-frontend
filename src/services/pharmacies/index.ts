import drugCraftersData from '@/data/dosingGuide.json';

export interface Pharmacy {
  id: string;
  name: string;
  instructions: string[];
  slug?: string;
}

export interface PharmaciesInstructionsResponse {
  data: {
    instructions?: string[];
    pharmacy?: Pharmacy;
    pharmacies?: Pharmacy[]; // If API returns array of pharmacies
  };
}

/**
 * Server-side function to fetch pharmacies instructions data
 * Following the same pattern as fetchProducts
 */
export async function fetchPharmaciesInstructions(): Promise<PharmaciesInstructionsResponse> {
  try {
    // For now, return the Drug Crafters JSON data
    // Later you can modify this to conditionally return different data based on route
    return drugCraftersData as PharmaciesInstructionsResponse;
  } catch (error) {
    console.log('Failed to fetch pharmacies instructions:', error);
    throw error;
  }
}

