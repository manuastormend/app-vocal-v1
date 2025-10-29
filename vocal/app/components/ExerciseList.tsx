'use client';

import { useState, useEffect } from 'react';
import { Exercise, CreateExerciseData, UpdateExerciseData, CompoundExercise, ExerciseWithDetails } from '../lib/types';
import { ExerciseService } from '../lib/exercises';
import ExerciseForm from './ExerciseForm';

interface ExerciseListProps {
  exercises: ExerciseWithDetails[];
  loading: boolean;
  error: string | null;
  onCreateExercise: (data: CreateExerciseData) => Promise<void>;
  onUpdateExercise: (data: UpdateExerciseData) => Promise<void>;
  onDeleteExercise: (id: string) => Promise<void>;
  onSearch: (query: string) => void;
}

export default function ExerciseList({
  exercises,
  loading,
  error,
  onCreateExercise,
  onUpdateExercise,
  onDeleteExercise,
  onSearch,
}: ExerciseListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const [compoundDetails, setCompoundDetails] = useState<Map<string, CompoundExercise>>(new Map());

  const handleCreate = async (data: CreateExerciseData) => {
    await onCreateExercise(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: CreateExerciseData) => {
    if (editingExercise) {
      await onUpdateExercise({ ...data, id: editingExercise.id });
      setEditingExercise(null);
    }
  };

  const handleDelete = async (id: string) => {
    await onDeleteExercise(id);
    setShowDeleteConfirm(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const toggleExerciseExpansion = async (exerciseId: string) => {
    const isExpanded = expandedExercises.has(exerciseId);
    
    if (isExpanded) {
      // Contraer
      setExpandedExercises(prev => {
        const newSet = new Set(prev);
        newSet.delete(exerciseId);
        return newSet;
      });
    } else {
      // Expandir - cargar detalles del ejercicio compuesto
      try {
        const compoundExercise = await ExerciseService.getCompoundExercise(exerciseId);
        if (compoundExercise) {
          setCompoundDetails(prev => new Map(prev.set(exerciseId, compoundExercise)));
          setExpandedExercises(prev => new Set(prev).add(exerciseId));
        }
      } catch (error) {
        console.error('Error al cargar detalles del ejercicio compuesto:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando ejercicios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón de crear */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar ejercicios..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Nuevo Ejercicio
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Lista de ejercicios */}
      {exercises.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No se encontraron ejercicios' : 'No hay ejercicios'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer ejercicio para comenzar'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exercises.map((exercise) => {
            const isExpanded = expandedExercises.has(exercise.id);
            const exerciseCompoundDetails = isExpanded ? compoundDetails.get(exercise.id) : null;
            
            return (
              <div
                key={exercise.id}
                className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {exercise.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        exercise.type === 'simple'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {exercise.type === 'simple' ? 'Simple' : 'Compuesto'}
                      </span>
                    </div>
                    
                    {exercise.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {exercise.description}
                      </p>
                    )}

                    {/* Detalles de ejercicio compuesto */}
                    {exercise.type === 'compound' && (
                      <div className="mb-2">
                        <button
                          onClick={() => toggleExerciseExpansion(exercise.id)}
                          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          <svg 
                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {isExpanded ? 'Ocultar' : 'Ver'} componentes
                        </button>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Creado el {formatDate(exercise.created_at)}
                    </p>

                    {/* Componentes expandidos */}
                    {isExpanded && exerciseCompoundDetails && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Componentes:
                        </h4>
                        <div className="space-y-1">
                          {exerciseCompoundDetails.components
                            .sort((a, b) => a.order_index - b.order_index)
                            .map((component, index) => (
                              <div
                                key={component.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-gray-700 dark:text-gray-300">
                                  {index + 1}. {component.child_exercise?.name || 'Ejercicio no encontrado'}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  x{component.quantity}
                                </span>
                              </div>
                            ))}
                        </div>
                        {exerciseCompoundDetails.components.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No hay componentes agregados
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingExercise(exercise)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(exercise.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulario de creación/edición */}
      {showForm && (
        <ExerciseForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingExercise && (
        <ExerciseForm
          onSubmit={handleUpdate}
          onCancel={() => setEditingExercise(null)}
          initialData={editingExercise}
          isEditing={true}
        />
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que quieres eliminar este ejercicio? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
