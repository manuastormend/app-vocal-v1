import { useState, useEffect, useCallback } from 'react';
import { Routine, RoutineWithExercises, CreateRoutineData, UpdateRoutineData, UpdateRoutineExerciseData, RoutineExercise } from '../lib/types';
import { RoutineService } from '../lib/routines';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==============================================
  // CARGAR RUTINAS
  // ==============================================

  const loadRoutines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RoutineService.getAllRoutines();
      setRoutines(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar rutinas';
      setError(errorMessage);
      console.error('Error loading routines:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==============================================
  // OPERACIONES CRUD
  // ==============================================

  const createRoutine = useCallback(async (routineData: CreateRoutineData): Promise<Routine> => {
    try {
      setError(null);
      const newRoutine = await RoutineService.createRoutine(routineData);
      setRoutines(prev => [newRoutine, ...prev]);
      return newRoutine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear rutina';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateRoutine = useCallback(async (routineData: UpdateRoutineData): Promise<Routine> => {
    try {
      setError(null);
      const updatedRoutine = await RoutineService.updateRoutine(routineData);
      setRoutines(prev => 
        prev.map(routine => 
          routine.id === updatedRoutine.id ? updatedRoutine : routine
        )
      );
      return updatedRoutine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar rutina';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteRoutine = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await RoutineService.deleteRoutine(id);
      setRoutines(prev => prev.filter(routine => routine.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar rutina';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const duplicateRoutine = useCallback(async (id: string, newName: string): Promise<Routine> => {
    try {
      setError(null);
      const duplicatedRoutine = await RoutineService.duplicateRoutine(id, newName);
      setRoutines(prev => [duplicatedRoutine, ...prev]);
      return duplicatedRoutine;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al duplicar rutina';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // ==============================================
  // OPERACIONES CON EJERCICIOS DE RUTINA
  // ==============================================

  const addExerciseToRoutine = useCallback(async (routineId: string, exerciseId: string, orderIndex: number) => {
    try {
      setError(null);
      await RoutineService.addExerciseToRoutine({
        routine_id: routineId,
        exercise_id: exerciseId,
        order_index: orderIndex
      });
      // Recargar rutinas para obtener los datos actualizados
      await loadRoutines();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar ejercicio a rutina';
      setError(errorMessage);
      throw err;
    }
  }, [loadRoutines]);

  const updateRoutineExercise = useCallback(async (exerciseData: UpdateRoutineExerciseData): Promise<RoutineExercise> => {
    try {
      setError(null);
      const updatedExercise = await RoutineService.updateRoutineExercise(exerciseData);
      // Recargar rutinas para obtener los datos actualizados
      await loadRoutines();
      return updatedExercise;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar ejercicio de rutina';
      setError(errorMessage);
      throw err;
    }
  }, [loadRoutines]);

  const removeExerciseFromRoutine = useCallback(async (routineExerciseId: string) => {
    try {
      setError(null);
      await RoutineService.removeExerciseFromRoutine(routineExerciseId);
      // Recargar rutinas para obtener los datos actualizados
      await loadRoutines();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al remover ejercicio de rutina';
      setError(errorMessage);
      throw err;
    }
  }, [loadRoutines]);

  const reorderRoutineExercises = useCallback(async (routineId: string, exercises: { id: string; order_index: number }[]) => {
    try {
      setError(null);
      await RoutineService.reorderRoutineExercises(routineId, exercises);
      // Recargar rutinas para obtener los datos actualizados
      await loadRoutines();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reordenar ejercicios';
      setError(errorMessage);
      throw err;
    }
  }, [loadRoutines]);

  // ==============================================
  // MÉTODOS DE UTILIDAD
  // ==============================================

  const getRoutineById = useCallback((id: string): Routine | undefined => {
    return routines.find(routine => routine.id === id);
  }, [routines]);

  const getRoutineWithExercises = useCallback(async (id: string): Promise<RoutineWithExercises | null> => {
    try {
      setError(null);
      const data = await RoutineService.getRoutineWithExercises(id);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar rutina con ejercicios';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getAvailableExercises = useCallback(async () => {
    try {
      setError(null);
      return await RoutineService.getAvailableExercises();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar ejercicios disponibles';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // ==============================================
  // EFECTOS
  // ==============================================

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  // ==============================================
  // RETORNO
  // ==============================================

  return {
    // Estado
    routines,
    loading,
    error,
    
    // Operaciones CRUD
    createRoutine,
    updateRoutine,
    deleteRoutine,
    duplicateRoutine,
    
    // Operaciones con ejercicios
    addExerciseToRoutine,
    updateRoutineExercise,
    removeExerciseFromRoutine,
    reorderRoutineExercises,
    
    // Utilidades
    getRoutineById,
    getRoutineWithExercises,
    getAvailableExercises,
    
    // Recargar
    loadRoutines
  };
}
