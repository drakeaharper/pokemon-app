export interface Move {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number;
  priority: number;
  type: {
    name: string;
  };
  damage_class: {
    name: string;
  };
  effect_entries: Array<{
    effect: string;
    language: {
      name: string;
    };
  }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
    };
  }>;
  generation: {
    name: string;
  };
  target: {
    name: string;
  };
  contest_type?: {
    name: string;
  };
  learned_by_pokemon: Array<{
    name: string;
    url: string;
  }>;
}

export interface MoveListItem {
  name: string;
  url: string;
  id: number;
}

export interface MovesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MoveListItem[];
}