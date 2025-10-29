'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ExerciseWithDetails, CompoundExerciseComponent, CreateCompoundComponentData } from '../lib/types';
import { ExerciseService } from '../lib/exercises';

interface CompoundExerciseBuilderProps {
  exerciseId: string;
  components: CompoundExerciseComponent[];
  onComponentsChange: (components: CompoundExerciseComponent[]) => void;
}

export default function CompoundExerciseBuilder({
  exerciseId,
  components,
  onComponentsChange,
}: CompoundExerciseBuilderProps) {
  const [availableExercises, setAvailableExercises] = useState<ExerciseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComponent, setNewComponent] = useState<CreateCompoundComponentData>({
    child_exercise_id: '',
    quantity: 1,
    order_index: components.length + 1,
  });

  // Ref para mantener la función actualizada
  const onComponentsChangeRef = useRef(onComponentsChange);
  useEffect(() => {
    onComponentsChangeRef.current = onComponentsChange;
  }, [onComponentsChange]);

  // Cargar ejercicios disponibles (simples y compuestos) excluyendo el ejercicio actual
  useEffect(() => {
    const loadAvailableExercises = async () => {
      try {
        setLoading(true);
        const exercises = await ExerciseService.getExercisesForComponents();
        // Filtrar el ejercicio actual para evitar autoreferencias
        const filteredExercises = exercises.filter(ex => ex.id !== exerciseId);
        setAvailableExercises(filteredExercises);
      } catch (error) {
        console.error('Error al cargar ejercicios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableExercises();
  }, [exerciseId]);

  const reloadComponents = useCallback(async () => {
    try {
      const updatedExercise = await ExerciseService.getCompoundExercise(exerciseId);
      if (updatedExercise) {
        onComponentsChangeRef.current(updatedExercise.components);
      }
    } catch (error) {
      console.error('Error al recargar componentes:', error);
    }
  }, [exerciseId]);

  const handleAddComponent = useCallback(async () => {
    if (!newComponent.child_exercise_id || newComponent.quantity <= 0) {
      return;
    }

    try {
      await ExerciseService.addComponentToCompound(
        exerciseId,
        newComponent.child_exercise_id,
        newComponent.quantity,
        newComponent.order_index
      );

      // Recargar componentes
      await reloadComponents();

      // Reset form (mantener formulario abierto)
      setNewComponent({
        child_exercise_id: '',
        quantity: 1,
        order_index: components.length + 2,
      });
    } catch (error) {
      console.error('Error al agregar componente:', error);
    }
  }, [exerciseId, newComponent, components.length, reloadComponents]);

  const handleUpdateComponent = useCallback(async (componentId: string, quantity: number, orderIndex: number) => {
    try {
      await ExerciseService.updateComponent(componentId, quantity, orderIndex);
      
      // Recargar componentes
      await reloadComponents();
    } catch (error) {
      console.error('Error al actualizar componente:', error);
    }
  }, [reloadComponents]);

  const handleRemoveComponent = useCallback(async (componentId: string) => {
    try {
      await ExerciseService.removeComponent(componentId);
      
      // Recargar componentes
      await reloadComponents();
    } catch (error) {
      console.error('Error al eliminar componente:', error);
    }
  }, [reloadComponents]);

  const moveComponent = useCallback(async (componentId: string, direction: 'up' | 'down') => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    const currentIndex = component.order_index;
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Verificar límites
    if (newIndex < 1 || newIndex > components.length) return;

    // Intercambiar con el componente en la nueva posición de forma segura
    const targetComponent = components.find(c => c.order_index === newIndex);
    if (targetComponent) {
      try {
        await ExerciseService.swapComponentOrder(
          componentId,
          newIndex,
          targetComponent.id,
          currentIndex
        );
        
        // Recargar componentes después del intercambio
        await reloadComponents();
      } catch (error) {
        console.error('Error al mover componente:', error);
      }
    }
  }, [components, reloadComponents]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando ejercicios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Lista de componentes */}
      <div className="space-y-2">
        {components
          .sort((a, b) => a.order_index - b.order_index)
          .map((component, index) => (
            <div
              key={component.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                  {component.order_index}.
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {component.child_exercise?.name || 'Ejercicio no encontrado'}
                    </p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      component.child_exercise?.type === 'simple'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {component.child_exercise?.type === 'simple' ? 'Simple' : 'Compuesto'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cantidad: {component.quantity}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Controles de cantidad */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUpdateComponent(component.id, Math.max(1, component.quantity - 1), component.order_index);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[2rem] text-center">
                    {component.quantity}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUpdateComponent(component.id, component.quantity + 1, component.order_index);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Controles de orden */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      moveComponent(component.id, 'up');
                    }}
                    disabled={component.order_index === 1}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      moveComponent(component.id, 'down');
                    }}
                    disabled={component.order_index === components.length}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveComponent(component.id);
                  }}
                  className="p-1 text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

        {components.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No hay componentes agregados</p>
            <p className="text-sm">Agrega ejercicios simples o compuestos para crear tu rutina</p>
          </div>
        )}
      </div>

      {/* Formulario para agregar componente */}
      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Agregar Componente
        </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ejercicio
              </label>
              <select
                value={newComponent.child_exercise_id}
                onChange={(e) => setNewComponent(prev => ({ ...prev, child_exercise_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
              >
                <option value="">Seleccionar ejercicio...</option>
                {availableExercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name} ({exercise.type === 'simple' ? 'Simple' : 'Compuesto'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={newComponent.quantity}
                onChange={(e) => setNewComponent(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleAddComponent}
              disabled={!newComponent.child_exercise_id}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
    </div>
  );
}
