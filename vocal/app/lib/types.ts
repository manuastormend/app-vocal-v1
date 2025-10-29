export type ExerciseType = 'simple' | 'compound';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  description?: string;
  created_at: string;
}

export interface SimpleExercise extends Exercise {
  type: 'simple';
  duration?: number;
  repetitions?: number;
  movement?: string;
  text?: string;
}

export interface CompoundExercise extends Exercise {
  type: 'compound';
  components: CompoundExerciseComponent[];
}

// Tipo unión para ejercicios que incluye todos los campos posibles
export type ExerciseWithDetails = SimpleExercise | CompoundExercise;

export interface CompoundExerciseComponent {
  id: string;
  parent_exercise_id: string;
  child_exercise_id: string;
  quantity: number;
  order_index: number;
  child_exercise?: Exercise;
}

export interface CreateCompoundComponentData {
  child_exercise_id: string;
  quantity: number;
  order_index: number;
}

export interface UpdateCompoundComponentData {
  id: string;
  quantity: number;
  order_index: number;
}

export interface CreateExerciseData {
  name: string;
  type: ExerciseType;
  description?: string;
  duration?: number;
  repetitions?: number;
  movement?: string;
  text?: string;
}

export interface UpdateExerciseData extends Partial<CreateExerciseData> {
  id: string;
}

// ==============================================
// TIPOS PARA RUTINAS
// ==============================================

export interface Routine {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  order_index: number;
  sets?: number;
  reps?: number;
  duration?: number;
  rest_time?: number;
  notes?: string;
  exercise?: Exercise;
}

export interface CreateRoutineData {
  name: string;
  description?: string;
}

export interface UpdateRoutineData extends Partial<CreateRoutineData> {
  id: string;
}

export interface CreateRoutineExerciseData {
  routine_id: string;
  exercise_id: string;
  order_index: number;
  sets?: number;
  reps?: number;
  duration?: number;
  rest_time?: number;
  notes?: string;
}

export interface UpdateRoutineExerciseData {
  id: string;
  order_index?: number;
  sets?: number;
  reps?: number;
  duration?: number;
  rest_time?: number;
  notes?: string;
}

export interface RoutineWithExercises extends Routine {
  routine_exercises: RoutineExercise[];
}