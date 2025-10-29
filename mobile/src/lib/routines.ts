import { supabase } from './supabase';

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
  exercise?: any;
}

export interface RoutineWithExercises extends Routine {
  routine_exercise: RoutineExercise[];
}

export class RoutineService {
  // Obtener todas las rutinas
  static async getAllRoutines(): Promise<Routine[]> {
    try {
      const { data, error } = await supabase
        .from('routine')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al cargar rutinas: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllRoutines:', error);
      throw error;
    }
  }

  // Obtener rutinas aleatorias
  static async getRandomRoutines(limit: number = 2): Promise<Routine[]> {
    try {
      // Primero obtenemos todas las rutinas y luego las mezclamos en el cliente
      const { data, error } = await supabase
        .from('routine')
        .select('*');

      if (error) {
        throw new Error(`Error al cargar rutinas aleatorias: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Mezclar array y tomar los primeros 'limit' elementos
      const shuffled = data.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error('Error in getRandomRoutines:', error);
      throw error;
    }
  }

  // Obtener rutinas de 5 minutos (asumiendo que tienen una duración específica)
  static async get5MinuteRoutines(): Promise<Routine[]> {
    try {
      const { data, error } = await supabase
        .from('routine')
        .select('*')
        .ilike('name', '%5%minuto%')
        .or('name.ilike.%5%min%')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al cargar rutinas de 5 minutos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in get5MinuteRoutines:', error);
      throw error;
    }
  }

  // Obtener rutina con ejercicios
  static async getRoutineWithExercises(routineId: string): Promise<RoutineWithExercises | null> {
    try {
      const { data, error } = await supabase
        .from('routine')
        .select(`
          *,
          routine_exercise (
            *,
            exercise (*)
          )
        `)
        .eq('id', routineId)
        .single();

      if (error) {
        throw new Error(`Error al cargar rutina con ejercicios: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getRoutineWithExercises:', error);
      throw error;
    }
  }

  // Buscar rutinas
  static async searchRoutines(query: string): Promise<Routine[]> {
    try {
      const { data, error } = await supabase
        .from('routine')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar rutinas: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchRoutines:', error);
      throw error;
    }
  }
}
