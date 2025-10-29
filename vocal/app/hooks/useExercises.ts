'use client';

import { useState, useEffect, useCallback } from 'react';
import { Exercise, CreateExerciseData, UpdateExerciseData, ExerciseWithDetails } from '../lib/types';
import { ExerciseService } from '../lib/exercises';

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

  // Crear un nuevo ejercicio
  const createExercise = useCallback(async (exerciseData: CreateExerciseData) => {
    try {
      setError(null);
      const newExercise = await ExerciseService.createExercise(exerciseData);
      setExercises(prev => [newExercise, ...prev]);
      return newExercise;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear ejercicio';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Actualizar un ejercicio
  const updateExercise = useCallback(async (updateData: UpdateExerciseData) => {
    try {
      setError(null);
      const updatedExercise = await ExerciseService.updateExercise(updateData);
      setExercises(prev => 
        prev.map(exercise => 
          exercise.id === updatedExercise.id ? updatedExercise : exercise
        )
      );
      return updatedExercise;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar ejercicio';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Eliminar un ejercicio
  const deleteExercise = useCallback(async (id: string) => {
    try {
      setError(null);
      await ExerciseService.deleteExercise(id);
      setExercises(prev => prev.filter(exercise => exercise.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar ejercicio';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Buscar ejercicios
  const searchExercises = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await ExerciseService.searchExercises(query);
      setExercises(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar ejercicios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar ejercicios al montar el componente
  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  return {
    exercises,
    loading,
    error,
    loadExercises,
    createExercise,
    updateExercise,
    deleteExercise,
    searchExercises,
  };
}
