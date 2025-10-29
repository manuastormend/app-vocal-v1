import { useState, useEffect, useCallback } from 'react';
import { RoutineService, Routine, RoutineWithExercises } from '../lib/routines';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las rutinas
  const loadRoutines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RoutineService.getAllRoutines();
      setRoutines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar rutinas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar rutinas aleatorias
  const loadRandomRoutines = useCallback(async (limit: number = 2) => {
    try {
      setLoading(true);
      setError(null);
      const data = await RoutineService.getRandomRoutines(limit);
      setRoutines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar rutinas aleatorias');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar rutinas de 5 minutos
  const load5MinuteRoutines = useCallback(async (): Promise<Routine[]> => {
    try {
      setError(null);
      const data = await RoutineService.get5MinuteRoutines();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar rutinas de 5 minutos');
      throw err;
    }
  }, []);

  // Obtener rutina con ejercicios
  const getRoutineWithExercises = useCallback(async (routineId: string): Promise<RoutineWithExercises | null> => {
    try {
      setError(null);
      const data = await RoutineService.getRoutineWithExercises(routineId);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar rutina con ejercicios');
      throw err;
    }
  }, []);

  // Buscar rutinas
  const searchRoutines = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await RoutineService.searchRoutines(query);
      setRoutines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar rutinas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar rutinas al montar el componente
  useEffect(() => {
    loadRandomRoutines(2);
  }, [loadRandomRoutines]);

  return {
    routines,
    loading,
    error,
    loadRoutines,
    loadRandomRoutines,
    load5MinuteRoutines,
    getRoutineWithExercises,
    searchRoutines,
  };
}
