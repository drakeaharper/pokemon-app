export interface BerryFirmness {
  name: string;
  url: string;
}

export interface BerryFlavor {
  flavor: {
    name: string;
    url: string;
  };
  potency: number;
}

export interface BerryNaturalGift {
  power: number;
  type: {
    name: string;
    url: string;
  };
}

export interface BerryItem {
  name: string;
  url: string;
}

export interface Berry {
  id: number;
  name: string;
  growth_time: number;
  max_harvest: number;
  natural_gift_power: number;
  size: number;
  smoothness: number;
  soil_dryness: number;
  firmness: BerryFirmness;
  flavors: BerryFlavor[];
  item: BerryItem;
  natural_gift_type: {
    name: string;
    url: string;
  };
}

export interface BerryListItem {
  name: string;
  url: string;
  id: number;
}

export interface BerryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BerryListItem[];
}