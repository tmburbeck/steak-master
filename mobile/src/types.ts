export type Doneness = 'Rare' | 'Medium Rare' | 'Medium' | 'Medium Well' | 'Well Done';
export type Method = 'Cast iron' | 'Grill';
export type Stage = 'setup' | 'first-side' | 'flip' | 'second-side' | 'temperature' | 'rest' | 'complete';

export interface CookConfig {
  cut: string;
  thicknessInches: number;
  doneness: Doneness;
  method: Method;
}

export interface CookPlan {
  firstSideSeconds: number;
  secondSideSeconds: number;
  restSeconds: number;
  note: string;
}
