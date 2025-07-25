export interface Ability {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: {
    name: string;
    url: string;
  };
  names: Array<{
    name: string;
    language: {
      name: string;
    };
  }>;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: {
      name: string;
    };
  }>;
  effect_changes: Array<{
    version_group: {
      name: string;
    };
    effect_entries: Array<{
      effect: string;
      language: {
        name: string;
      };
    }>;
  }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
    };
    version_group: {
      name: string;
    };
  }>;
  pokemon: Array<{
    is_hidden: boolean;
    slot: number;
    pokemon: {
      name: string;
      url: string;
    };
  }>;
}

export interface AbilityListItem {
  name: string;
  url: string;
  id: number;
}

export interface AbilitiesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AbilityListItem[];
}