'use client';

import { useState } from 'react';
import { useAuth } from '../context/authContext';
import { useExercises } from '../hooks/useExercises';
import { useRoutines } from '../hooks/useRoutines';
import { useAdmin } from '../hooks/useAdmin';
import ExerciseList from './ExerciseList';
import RoutineList from './RoutineList';
import UserManagement from './UserManagement';

export default function Home() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exercises' | 'routines' | 'users'>('dashboard');
  
  const {
    exercises,
    loading: exercisesLoading,
    error: exercisesError,
    createExercise,
    updateExercise,
    deleteExercise,
    searchExercises,
  } = useExercises();

  const {
    routines,
    loading: routinesLoading,
    error: routinesError,
  } = useRoutines();

  const handleCreateExercise = async (data: any) => {
    try {
      await createExercise(data);
    } catch (error) {
      console.error('Error al crear ejercicio:', error);
    }
  };

  const handleUpdateExercise = async (data: any) => {
    try {
      await updateExercise(data);
    } catch (error) {
      console.error('Error al actualizar ejercicio:', error);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    try {
      await deleteExercise(id);
    } catch (error) {
      console.error('Error al eliminar ejercicio:', error);
    }
  };

  const handleSearchExercises = (query: string) => {
    if (query.trim()) {
      searchExercises(query);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Vocal App
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </span>
              )}
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'exercises'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Ejercicios
            </button>
            <button
              onClick={() => setActiveTab('routines')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'routines'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Rutinas
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Usuarios
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Bienvenido/a a Vocal App
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Tu aplicación para gestionar ejercicios y rutinas de entrenamiento
            </p>
            
            {isAdmin && (
              <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-purple-800 dark:text-purple-200 font-medium">
                    Modo Administrador Activo
                  </span>
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  Tienes acceso completo a todas las funcionalidades del sistema
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {exercises.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Ejercicios creados
                </div>
              </div>
              
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {exercises.filter(e => e.type === 'simple').length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Ejercicios simples
                </div>
              </div>
              
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {exercises.filter(e => e.type === 'compound').length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Ejercicios compuestos
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {routines.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Rutinas creadas
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exercises' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Gestión de Ejercicios
            </h2>
            <ExerciseList
              exercises={exercises}
              loading={exercisesLoading}
              error={exercisesError}
              onCreateExercise={handleCreateExercise}
              onUpdateExercise={handleUpdateExercise}
              onDeleteExercise={handleDeleteExercise}
              onSearch={handleSearchExercises}
            />
          </div>
        )}

        {activeTab === 'routines' && (
          <RoutineList />
        )}

        {activeTab === 'users' && isAdmin && (
          <UserManagement />
        )}
      </main>
    </div>
  );
}
