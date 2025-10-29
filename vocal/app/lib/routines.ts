import { supabase } from './supabase';
import { 
  Routine, 
  RoutineExercise, 
  CreateRoutineData, 
  UpdateRoutineData,
  CreateRoutineExerciseData,
  UpdateRoutineExerciseData,
  RoutineWithExercises,
  Exercise
} from './types';

export class RoutineService {
  // ==============================================
  // OPERACIONES CRUD PARA RUTINAS
  // ==============================================

  static async getAllRoutines(): Promise<Routine[]> {
    try {
      const { data, error } = await supabase
        .from('routine')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching routines:', error);
      throw error;
    }
  }

  static async getRoutineById(id: string): Promise<Routine | null> {
    try {
      const { data, error } = await supabase
        .from('routine')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching routine:', error);
      throw error;
    }
  }

  static async getRoutineWithExercises(id: string): Promise<RoutineWithExercises | null> {
    try {
      // Paso 1: obtener la rutina base
      const { data: routine, error: routineErr } = await supabase
        .from('routine')
        .select('*')
        .eq('id', id)
        .single();

      if (routineErr) {
        throw routineErr;
      }
      if (!routine) return null;

      // Paso 2: obtener ejercicios de la rutina (filas puras)
      const { data: routineExercises, error: reErr } = await supabase
        .from('routine_exercise')
        .select('*')
        .eq('routine_id', id)
        .order('order_index', { ascending: true });

      if (reErr) {
        throw reErr;
      }

      // Paso 3: cargar detalles de ejercicios por ids y anexarlos manualmente
      const exerciseIds = Array.from(
        new Set((routineExercises || []).map((re) => re.exercise_id))
      );

      let exercisesById: Record<string, Exercise> = {};
      if (exerciseIds.length > 0) {
        const { data: exercises, error: exErr } = await supabase
          .from('exercise')
          .select('*')
          .in('id', exerciseIds);
        if (exErr) {
          throw exErr;
        }
        exercisesById = (exercises || []).reduce((acc: Record<string, Exercise>, ex: any) => {
          acc[ex.id] = ex as Exercise;
          return acc;
        }, {});
      }

      const routineExercisesWithDetails = (routineExercises || []).map((re: any) => ({
        ...re,
        exercise: exercisesById[re.exercise_id]
      }));

      const result: RoutineWithExercises = {
        ...(routine as any),
        routine_exercises: routineExercisesWithDetails
      };

      return result;
    } catch (error) {
      console.error('Error fetching routine with exercises:', error);
      throw error;
    }
  }

  static async createRoutine(routineData: CreateRoutineData): Promise<Routine> {
    try {
      const { data, error } = await supabase
        .from('routine')
        .insert([routineData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating routine:', error);
      throw error;
    }
  }

  static async updateRoutine(routineData: UpdateRoutineData): Promise<Routine> {
    try {
      const { id, ...updateData } = routineData;
      const { data, error } = await supabase
        .from('routine')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating routine:', error);
      throw error;
    }
  }

  static async deleteRoutine(id: string): Promise<void> {
    try {
      // Primero eliminar todos los ejercicios de la rutina
      await this.deleteAllRoutineExercises(id);

      // Luego eliminar la rutina
      const { error } = await supabase
        .from('routine')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  }

  // ==============================================
  // OPERACIONES PARA EJERCICIOS DE RUTINA
  // ==============================================

  static async getRoutineExercises(routineId: string): Promise<RoutineExercise[]> {
    try {
      const { data, error } = await supabase
        .from('routine_exercise')
        .select(`
          *,
          exercise (*)
        `)
        .eq('routine_id', routineId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching routine exercises:', error);
      throw error;
    }
  }

  static async addExerciseToRoutine(exerciseData: CreateRoutineExerciseData): Promise<RoutineExercise> {
    try {
      // Obtener el próximo order_index disponible para esta rutina para evitar conflictos únicos
      const { data: maxRow, error: maxErr } = await supabase
        .from('routine_exercise')
        .select('order_index')
        .eq('routine_id', exerciseData.routine_id)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxErr) throw maxErr;

      let candidateIndex = (maxRow?.order_index ?? 0) + 1; // si no hay filas, empezamos en 1

      // Intentar insertar y, en caso de colisión por índice duplicado, reintentar con siguiente índice
      const maxAttempts = 5;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const { data, error } = await supabase
          .from('routine_exercise')
          .insert([{ ...exerciseData, order_index: candidateIndex }])
          .select(`
            *,
            exercise (*)
          `)
          .single();

        if (!error) {
          return data as RoutineExercise;
        }

        // Manejo flexible de conflictos únicos: 23505 (postgres) o 409 (http) o mensaje
        const errAny = error as any;
        const isUniqueViolation = errAny?.code === '23505' || errAny?.status === 409 ||
          (typeof errAny?.message === 'string' && errAny.message.toLowerCase().includes('duplicate'));

        if (!isUniqueViolation && attempt === 1) {
          // Podría ser un error vacío ({}) en navegadores. En ese caso, asumimos conflicto y reintentamos.
          candidateIndex += 1;
          continue;
        }

        if (!isUniqueViolation) {
          throw error;
        }

        // Incrementar y volver a intentar
        candidateIndex += 1;
      }

      throw new Error('No fue posible asignar un order_index único después de varios intentos');
    } catch (error) {
      console.error('Error adding exercise to routine:', error);
      throw error;
    }
  }

  static async updateRoutineExercise(exerciseData: UpdateRoutineExerciseData): Promise<RoutineExercise> {
    try {
      const { id, ...updateData } = exerciseData;
      const { data, error } = await supabase
        .from('routine_exercise')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          exercise (*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating routine exercise:', error);
      throw error;
    }
  }

  static async removeExerciseFromRoutine(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('routine_exercise')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing exercise from routine:', error);
      throw error;
    }
  }

  static async deleteAllRoutineExercises(routineId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('routine_exercise')
        .delete()
        .eq('routine_id', routineId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting all routine exercises:', error);
      throw error;
    }
  }

  static async reorderRoutineExercises(routineId: string, exercises: { id: string; order_index: number }[]): Promise<void> {
    try {
      const updates = exercises.map(exercise => 
        supabase
          .from('routine_exercise')
          .update({ order_index: exercise.order_index })
          .eq('id', exercise.id)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Error reordering routine exercises:', error);
      throw error;
    }
  }

  // ==============================================
  // MÉTODOS DE UTILIDAD
  // ==============================================

  static async getAvailableExercises(): Promise<Exercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercise')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available exercises:', error);
      throw error;
    }
  }

  static async duplicateRoutine(routineId: string, newName: string): Promise<Routine> {
    try {
      // Obtener la rutina original con sus ejercicios
      const originalRoutine = await this.getRoutineWithExercises(routineId);
      if (!originalRoutine) {
        throw new Error('Routine not found');
      }

      // Crear nueva rutina
      const newRoutine = await this.createRoutine({
        name: newName,
        description: originalRoutine.description
      });

      // Copiar ejercicios
      if (originalRoutine.routine_exercises && originalRoutine.routine_exercises.length > 0) {
        const exerciseData = originalRoutine.routine_exercises.map(re => ({
          routine_id: newRoutine.id,
          exercise_id: re.exercise_id,
          order_index: re.order_index,
          sets: re.sets,
          reps: re.reps,
          duration: re.duration,
          rest_time: re.rest_time,
          notes: re.notes
        }));

        for (const exercise of exerciseData) {
          await this.addExerciseToRoutine(exercise);
        }
      }

      return newRoutine;
    } catch (error) {
      console.error('Error duplicating routine:', error);
      throw error;
    }
  }
}
