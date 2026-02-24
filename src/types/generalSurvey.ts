import { BillingAddress, ShippingAddress } from '@/store/slices/ordersApiSlice';

export type AddressData = {
  billingAddress?: BillingAddress;
  shippingAddress?: ShippingAddress;
  sameAsBilling: boolean;
  selectedOption?: string;
};
