import { supabase } from './supabase';

export interface Exercise {
  id: string;
  name: string;
  type: 'simple' | 'compound';
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
  components: any[];
}

export type ExerciseWithDetails = SimpleExercise | CompoundExercise;

export class ExerciseService {
  // Obtener todos los ejercicios
  static async getAllExercises(): Promise<ExerciseWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('exercise')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al cargar ejercicios: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllExercises:', error);
      throw error;
    }
  }

  // Obtener ejercicios aleatorios
  static async getRandomExercises(limit: number = 4): Promise<ExerciseWithDetails[]> {
    try {
      // Primero obtenemos todos los ejercicios y luego los mezclamos en el cliente
      const { data, error } = await supabase
        .from('exercise')
        .select('*');

      if (error) {
        throw new Error(`Error al cargar ejercicios aleatorios: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Mezclar array y tomar los primeros 'limit' elementos
      const shuffled = data.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error('Error in getRandomExercises:', error);
      throw error;
    }
  }

  // Obtener ejercicios por tipo
  static async getExercisesByType(type: 'simple' | 'compound'): Promise<ExerciseWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('exercise')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al cargar ejercicios por tipo: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getExercisesByType:', error);
      throw error;
    }
  }

  // Buscar ejercicios
  static async searchExercises(query: string): Promise<ExerciseWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('exercise')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar ejercicios: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchExercises:', error);
      throw error;
    }
  }
}
