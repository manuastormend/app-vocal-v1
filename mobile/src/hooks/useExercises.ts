import { useState, useEffect, useCallback } from 'react';
import { ExerciseService, ExerciseWithDetails } from '../lib/exercises';

export function useExercises() {
  const [exercises, setExercises] = useState<ExerciseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los ejercicios
  const loadExercises = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExerciseService.getAllExercises();
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar ejercicios aleatorios
  const loadRandomExercises = useCallback(async (limit: number = 4) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExerciseService.getRandomExercises(limit);
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ejercicios aleatorios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar ejercicios por tipo
  const loadExercisesByType = useCallback(async (type: 'simple' | 'compound') => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExerciseService.getExercisesByType(type);
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ejercicios por tipo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar ejercicios
  const searchExercises = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExerciseService.searchExercises(query);
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar ejercicios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar ejercicios al montar el componente
  useEffect(() => {
    loadRandomExercises(4);
  }, [loadRandomExercises]);

  return {
    exercises,
    loading,
    error,
    loadExercises,
    loadRandomExercises,
    loadExercisesByType,
    searchExercises,
  };
}
