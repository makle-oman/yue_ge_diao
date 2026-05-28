import { http } from '@/utils/request';

export type WeatherName = '晴' | '多云' | '阴' | '小雨' | '阵雨';
export type PressureTrend = 'up' | 'stable' | 'down';
export type FishingIndexLevel = 'excellent' | 'good' | 'normal' | 'bad';

export interface WeatherCurrent {
  weather: WeatherName;
  temperature: number;
  pressure: number;
  pressureTrend: PressureTrend;
  windDirection: string;
  windScale: number;
  humidity: number;
  precipitation: number;
  visibility: number;
  moonPhase: string;
  updatedAt: string;
  source: 'mock';
}

export interface FishingIndex {
  score: number;
  level: FishingIndexLevel;
  advice: string;
  factors: string[];
  current: WeatherCurrent;
}

export function fetchFishingIndex(params: {
  lat: number;
  lng: number;
  date?: string;
}): Promise<FishingIndex> {
  return http.post('/weather/index', params, { skipAuth: true, showErrorToast: false });
}

export function fetchCurrentWeather(params: {
  lat: number;
  lng: number;
  date?: string;
}): Promise<WeatherCurrent> {
  return http.post('/weather/current', params, { skipAuth: true, showErrorToast: false });
}

export function formatWeatherLine(index: FishingIndex): string {
  const c = index.current;
  return `${c.weather} ${c.temperature}°C · 气压 ${c.pressure}hPa · 宜钓 ${index.score}`;
}
