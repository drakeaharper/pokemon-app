export interface ItemName {
  name: string;
  language: {
    name: string;
    url: string;
  };
}

export interface ItemCategory {
  name: string;
  url: string;
}

export interface ItemAttribute {
  name: string;
  url: string;
}

export interface ItemEffectEntry {
  effect: string;
  short_effect: string;
  language: {
    name: string;
    url: string;
  };
}

export interface ItemFlavorTextEntry {
  text: string;
  version_group: {
    name: string;
    url: string;
  };
  language: {
    name: string;
    url: string;
  };
}

export interface ItemGameIndex {
  game_index: number;
  generation: {
    name: string;
    url: string;
  };
}

export interface ItemSprites {
  default: string | null;
}

export interface Item {
  id: number;
  name: string;
  cost: number | null;
  fling_power: number | null;
  fling_effect: {
    name: string;
    url: string;
  } | null;
  attributes: ItemAttribute[];
  category: ItemCategory;
  effect_entries: ItemEffectEntry[];
  flavor_text_entries: ItemFlavorTextEntry[];
  game_indices: ItemGameIndex[];
  names: ItemName[];
  sprites: ItemSprites;
  held_by_pokemon: any[]; // Usually empty, keeping as any[] for flexibility
  baby_trigger_for: any; // Null for most items
  machines: any[]; // TM/HM related, keeping as any[] for flexibility
}

export interface ItemListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

export interface ItemCategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

// Helper interface for search functionality
export interface ItemSearchResult {
  id: number;
  name: string;
  category: string;
}