export interface BodyMeasurement {
  id: string;
  memberId: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bodyFatPercentage?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
  bmi: number;
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
  notes?: string;
}

export interface ProgressGoal {
  id: string;
  memberId: string;
  targetWeightKg: number;
  targetBodyFatPercentage?: number;
  targetDate: string;
  achieved: boolean;
}
