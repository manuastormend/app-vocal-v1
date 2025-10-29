'use client';

import { useState } from 'react';
import { Routine, RoutineWithExercises } from '../lib/types';
import { useRoutines } from '../hooks/useRoutines';
import RoutineForm from './RoutineForm';
import RoutineExerciseManager from './RoutineExerciseManager';

export default function RoutineList() {
  const { 
    routines, 
    loading, 
    error, 
    deleteRoutine, 
    duplicateRoutine,
    getRoutineWithExercises 
  } = useRoutines();
  
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | undefined>(undefined);
  const [showExerciseManager, setShowExerciseManager] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | undefined>(undefined);
  const [expandedRoutines, setExpandedRoutines] = useState<Set<string>>(new Set());
  const [routineDetails, setRoutineDetails] = useState<Map<string, RoutineWithExercises>>(new Map());

  const handleCreateRoutine = () => {
    setEditingRoutine(undefined);
    setShowForm(true);
  };

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine);
    setShowForm(true);
  };

  const handleDeleteRoutine = async (routine: Routine) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la rutina "${routine.name}"?`)) {
      try {
        await deleteRoutine(routine.id);
      } catch (error) {
        console.error('Error deleting routine:', error);
      }
    }
  };

  const handleDuplicateRoutine = async (routine: Routine) => {
    const newName = `${routine.name} (Copia)`;
    try {
      await duplicateRoutine(routine.id, newName);
    } catch (error) {
      console.error('Error duplicating routine:', error);
    }
  };

  const handleManageExercises = async (routine: Routine) => {
    setSelectedRoutine(routine);
    setShowExerciseManager(true);
  };

  const toggleRoutineExpansion = async (routineId: string) => {
    const newExpanded = new Set(expandedRoutines);
    
    if (newExpanded.has(routineId)) {
      newExpanded.delete(routineId);
    } else {
      newExpanded.add(routineId);
      
      // Cargar detalles de la rutina si no están cargados
      if (!routineDetails.has(routineId)) {
        try {
          const details = await getRoutineWithExercises(routineId);
          if (details) {
            setRoutineDetails(prev => new Map(prev).set(routineId, details));
          }
        } catch (error) {
          console.error('Error loading routine details:', error);
        }
      }
    }
    
    setExpandedRoutines(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando rutinas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rutinas</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {routines.length} {routines.length === 1 ? 'rutina' : 'rutinas'} encontradas
          </p>
        </div>
        <button
          onClick={handleCreateRoutine}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nueva Rutina</span>
        </button>
      </div>

      {/* Lista de Rutinas */}
      {routines.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay rutinas</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comienza creando tu primera rutina de ejercicios.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreateRoutine}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Crear Rutina
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {routines.map((routine) => {
            const isExpanded = expandedRoutines.has(routine.id);
            const details = routineDetails.get(routine.id);
            const exerciseCount = details?.routine_exercises?.length || 0;

            return (
              <div
                key={routine.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {/* Header de la Rutina */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {routine.name}
                      </h3>
                      {routine.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {routine.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Creada: {formatDate(routine.created_at)}</span>
                        <span>{exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleManageExercises(routine)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Gestionar ejercicios"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDuplicateRoutine(routine)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                        title="Duplicar rutina"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleEditRoutine(routine)}
                        className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors"
                        title="Editar rutina"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRoutine(routine)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Eliminar rutina"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Botón para expandir/contraer */}
                  {exerciseCount > 0 && (
                    <button
                      onClick={() => toggleRoutineExpansion(routine.id)}
                      className="mt-3 flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {isExpanded ? 'Ocultar ejercicios' : 'Ver ejercicios'}
                      <svg 
                        className={`ml-1 w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Lista de Ejercicios (Expandida) */}
                {isExpanded && details && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="p-4">
                      {details.routine_exercises && details.routine_exercises.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Ejercicios ({details.routine_exercises.length})
                          </h4>
                          {details.routine_exercises
                            .sort((a, b) => a.order_index - b.order_index)
                            .map((routineExercise, index) => (
                            <div
                              key={routineExercise.id}
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  {index + 1}.
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {routineExercise.exercise?.name || 'Ejercicio no encontrado'}
                                  </p>
                                  {routineExercise.exercise?.description && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                      {routineExercise.exercise.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No hay ejercicios en esta rutina
                          </p>
                          <button
                            onClick={() => handleManageExercises(routine)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Agregar ejercicios
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      {showForm && (
        <RoutineForm
          routine={editingRoutine}
          onClose={() => {
            setShowForm(false);
            setEditingRoutine(undefined);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingRoutine(undefined);
          }}
        />
      )}

      {showExerciseManager && selectedRoutine && (
        <RoutineExerciseManager
          routine={selectedRoutine}
          onClose={() => {
            setShowExerciseManager(false);
            setSelectedRoutine(undefined);
          }}
          onSuccess={() => {
            setShowExerciseManager(false);
            setSelectedRoutine(undefined);
            // Limpiar detalles en caché para recargar
            if (selectedRoutine) {
              setRoutineDetails(prev => {
                const newMap = new Map(prev);
                newMap.delete(selectedRoutine.id);
                return newMap;
              });
            }
          }}
        />
      )}
    </div>
  );
}
