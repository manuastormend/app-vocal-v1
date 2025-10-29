'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CreateExerciseData, ExerciseType, CompoundExerciseComponent, Exercise } from '../lib/types';
import CompoundExerciseBuilder from './CompoundExerciseBuilder';
import { ExerciseService } from '../lib/exercises';

interface ExerciseFormProps {
  onSubmit: (data: CreateExerciseData) => Promise<Exercise | void>;
  onCancel: () => void;
  initialData?: Partial<CreateExerciseData> & { id?: string };
  isEditing?: boolean;
}

export default function ExerciseForm({ onSubmit, onCancel, initialData, isEditing = false }: ExerciseFormProps) {
  const [formData, setFormData] = useState<CreateExerciseData>(() => {
    const simpleData = (initialData as any)?.simple_exercise || {};
    return {
      name: initialData?.name || '',
      type: initialData?.type || 'simple',
      description: initialData?.description || '',
      duration: simpleData.duration,
      repetitions: simpleData.repetitions,
      movement: simpleData.movement || '',
      text: simpleData.text || '',
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [components, setComponents] = useState<CompoundExerciseComponent[]>([]);
  const [showComponentBuilder, setShowComponentBuilder] = useState(false);
  const componentsLoadedRef = useRef(false);

  // Función memoizada para actualizar componentes
  const handleComponentsChange = useCallback((newComponents: CompoundExerciseComponent[]) => {
    setComponents(newComponents);
  }, []);

  // Actualizar formData cuando cambie initialData
  useEffect(() => {
    if (initialData) {
      // Extraer datos de simple_exercise si existe
      const simpleData = (initialData as any).simple_exercise || {};
      
      const newFormData = {
        name: initialData.name || '',
        type: initialData.type || 'simple',
        description: initialData.description || '',
        duration: simpleData.duration,
        repetitions: simpleData.repetitions,
        movement: simpleData.movement || '',
        text: simpleData.text || '',
      };
      setFormData(newFormData);
    }
  }, [initialData]);

  // Cargar componentes si es un ejercicio compuesto en edición
  useEffect(() => {
    if (isEditing && initialData?.id && formData.type === 'compound' && !componentsLoadedRef.current) {
      const loadComponents = async () => {
        try {
          const exercise = await ExerciseService.getCompoundExercise(initialData.id!);
          if (exercise) {
            setComponents(exercise.components);
            setExerciseId(exercise.id);
            componentsLoadedRef.current = true;
          }
        } catch (error) {
          console.error('Error al cargar componentes:', error);
        }
      };
      loadComponents();
    }
  }, [isEditing, initialData?.id, formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await onSubmit(formData);
      
      // Si es un ejercicio compuesto y no estamos editando, mostrar el builder
      if (formData.type === 'compound' && !isEditing && result) {
        setExerciseId(result.id);
        setShowComponentBuilder(true);
      }
    } catch (error) {
      console.error('Error al guardar ejercicio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateExerciseData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
          {isEditing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as ExerciseType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
            >
              <option value="simple">Simple</option>
              <option value="compound">Compuesto</option>
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
            />
          </div>

          {/* Campos específicos para ejercicios simples */}
          {formData.type === 'simple' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duración (seg)
                  </label>
                  <input
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) => handleInputChange('duration', e.target.value ? Number(e.target.value) : undefined)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Repeticiones
                  </label>
                  <input
                    type="number"
                    value={formData.repetitions || ''}
                    onChange={(e) => handleInputChange('repetitions', e.target.value ? Number(e.target.value) : undefined)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Movimiento
                </label>
                <input
                  type="text"
                  value={formData.movement || ''}
                  onChange={(e) => handleInputChange('movement', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Texto adicional
                </label>
                <textarea
                  value={formData.text || ''}
                  onChange={(e) => handleInputChange('text', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
                />
              </div>
            </>
          )}

          {/* Gestión de componentes para ejercicios compuestos */}
          {formData.type === 'compound' && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Componentes del Ejercicio
              </h3>

              {exerciseId && (
                <CompoundExerciseBuilder
                  exerciseId={exerciseId}
                  components={components}
                  onComponentsChange={handleComponentsChange}
                />
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
