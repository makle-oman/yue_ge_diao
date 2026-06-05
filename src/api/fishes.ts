import { http } from '@/utils/request';

export type FishCategory = 'fresh' | 'sea';
export type FishFilter = 'all' | 'common' | 'rare' | 'locked';
export type FishRarity = 'rare' | 'epic' | 'legendary';

export interface FishItem {
  name: string;
  category: FishCategory;
  common: boolean;
  rarity?: FishRarity;
  image?: string;
  unlocked: boolean;
  firstCatchAt: string | null;
  maxWeightG: number | null;
}

export interface FishStats {
  fresh: { done: number; total: number };
  sea: { done: number; total: number };
}

export function fetchFishLibrary(params: {
  category?: FishCategory;
  filter?: FishFilter;
} = {}): Promise<{ list: FishItem[]; stats: FishStats }> {
  return http.post('/fishes/library', params, { dedupe: true });
}

export function fetchFishProgress(): Promise<FishStats> {
  return http.post('/fishes/library-progress', {}, { dedupe: true });
}
