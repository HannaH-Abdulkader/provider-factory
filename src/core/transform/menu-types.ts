export interface Restaurant {
  outletCode: number;
  name: string;
  city: string;
  address: string | null;
  latitude: number;
  longitude: number;
  rating: number;
  deliveryFeeAed: number;
  deliveryMinMinutes: number;
  deliveryMaxMinutes: number;
  minimumOrderAed: number;
  sourceId: string;
}

export interface MenuItem {
  itemId: number;
  restaurantOutletCode: number;
  categoryId: number;
  categoryName: string;
  name: string;
  priceAed: number;
  imageUrl: string | null;
  sourceId: string;
}