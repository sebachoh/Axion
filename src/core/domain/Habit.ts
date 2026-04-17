export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: 'done' | 'skipped' | 'none';
}

export interface DashboardSummary {
  habits: Habit[];
  monthlyProgress: number;
}
