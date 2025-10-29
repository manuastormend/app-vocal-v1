'use client';

import { useState, useEffect } from 'react';
import { Routine, Exercise, RoutineExercise, CreateRoutineExerciseData, UpdateRoutineExerciseData } from '../lib/types';
import { useRoutines } from '../hooks/useRoutines';

interface RoutineExerciseManagerProps {
  routine: Routine;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RoutineExerciseManager({ routine, onClose, onSuccess }: RoutineExerciseManagerProps) {
  const { 
    getRoutineWithExercises, 
    getAvailableExercises, 
    addExerciseToRoutine, 
    removeExerciseFromRoutine,
    reorderRoutineExercises 
  } = useRoutines();

  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [routine.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [routineData, exercisesData] = await Promise.all([
        getRoutineWithExercises(routine.id),
        getAvailableExercises()
      ]);

      if (routineData) {
        setRoutineExercises(routineData.routine_exercises || []);
      }
      setAvailableExercises(exercisesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async (exerciseId: string) => {
    try {
      setError(null);
      const nextOrderIndex = routineExercises.length;
      await addExerciseToRoutine(routine.id, exerciseId, nextOrderIndex);
      await loadData(); // Recargar datos
      setShowAddForm(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar ejercicio';
      setError(errorMessage);
    }
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ejercicio de la rutina?')) {
      try {
        setError(null);
        await removeExerciseFromRoutine(exerciseId);
        await loadData(); // Recargar datos
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar ejercicio';
        setError(errorMessage);
      }
    }
  };

  const handleMoveUp = async (exercise: RoutineExercise) => {
    const currentIndex = routineExercises.findIndex(e => e.id === exercise.id);
    if (currentIndex > 0) {
      const newOrder = [...routineExercises];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      
      // Actualizar order_index
      const updates = newOrder.map((ex, index) => ({
        id: ex.id,
        order_index: index
      }));

      try {
        await reorderRoutineExercises(routine.id, updates);
        await loadData();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al reordenar ejercicios';
        setError(errorMessage);
      }
    }
  };

  const handleMoveDown = async (exercise: RoutineExercise) => {
    const currentIndex = routineExercises.findIndex(e => e.id === exercise.id);
    if (currentIndex < routineExercises.length - 1) {
      const newOrder = [...routineExercises];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      
      // Actualizar order_index
      const updates = newOrder.map((ex, index) => ({
        id: ex.id,
        order_index: index
      }));

      try {
        await reorderRoutineExercises(routine.id, updates);
        await loadData();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al reordenar ejercicios';
        setError(errorMessage);
      }
    }
  };

  const getNextOrderIndex = () => {
    return routineExercises.length;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-6">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando ejercicios...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestionar Ejercicios - {routine.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {routineExercises.length} {routineExercises.length === 1 ? 'ejercicio' : 'ejercicios'} en la rutina
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Agregar Ejercicio</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Ejercicios */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {routineExercises.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay ejercicios</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Agrega ejercicios a esta rutina para comenzar.
                </p>
              </div>
            ) : (
              routineExercises
                .sort((a, b) => a.order_index - b.order_index)
                .map((routineExercise, index) => (
                  <div
                    key={routineExercise.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {routineExercise.exercise?.name || 'Ejercicio no encontrado'}
                        </h4>
                        {routineExercise.exercise?.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {routineExercise.exercise.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMoveUp(routineExercise)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mover hacia arriba"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleMoveDown(routineExercise)}
                        disabled={index === routineExercises.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mover hacia abajo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleRemoveExercise(routineExercise.id)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Eliminar ejercicio"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal para agregar ejercicio */}
      {showAddForm && (
        <SimpleAddExerciseModal
          availableExercises={availableExercises}
          onClose={() => setShowAddForm(false)}
          onAddExercise={handleAddExercise}
        />
      )}
    </div>
  );
}

// Modal simple para agregar ejercicio
interface SimpleAddExerciseModalProps {
  availableExercises: Exercise[];
  onClose: () => void;
  onAddExercise: (exerciseId: string) => void;
}

function SimpleAddExerciseModal({ availableExercises, onClose, onAddExercise }: SimpleAddExerciseModalProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedExerciseId) {
      setError('Selecciona un ejercicio');
      return;
    }

    onAddExercise(selectedExerciseId);
  };

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    if (error) setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Agregar Ejercicio a la Rutina
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Selecciona un ejercicio de la lista para agregarlo a la rutina:
              </p>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableExercises.map(exercise => (
                  <div
                    key={exercise.id}
                    onClick={() => handleExerciseSelect(exercise.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedExerciseId === exercise.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedExerciseId === exercise.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedExerciseId === exercise.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {exercise.name}
                        </h4>
                        {exercise.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {exercise.description}
                          </p>
                        )}
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          exercise.type === 'simple'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                          {exercise.type === 'simple' ? 'Simple' : 'Compuesto'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedExerciseId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                Agregar Ejercicio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
