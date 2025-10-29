'use client';

import { useState, useEffect } from 'react';
import { AdminUser } from '../lib/admin';
import { useAdmin } from '../hooks/useAdmin';

export default function UserManagement() {
  const { isAdmin, loading: adminLoading, getAllUsers, updateUser, deleteUser, promoteToAdmin, demoteFromAdmin, toggleUserActive } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Manejar actualización de usuario
  const handleUpdateUser = async (userId: string, updates: Partial<AdminUser>) => {
    try {
      const updatedUser = await updateUser(userId, updates);
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user));
      setEditingUser(null);
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
    }
  };

  // Manejar eliminación de usuario
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
    }
  };

  // Manejar promoción a administrador
  const handlePromoteToAdmin = async (userId: string) => {
    try {
      const updatedUser = await promoteToAdmin(userId);
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user));
    } catch (err) {
      console.error('Error al promover usuario:', err);
    }
  };

  // Manejar degradación de administrador
  const handleDemoteFromAdmin = async (userId: string) => {
    try {
      const updatedUser = await demoteFromAdmin(userId);
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user));
    } catch (err) {
      console.error('Error al degradar usuario:', err);
    }
  };

  // Manejar activación/desactivación de usuario
  const handleToggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      const updatedUser = await toggleUserActive(userId, isActive);
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user));
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Si no es administrador, no mostrar nada
  if (!isAdmin) {
    return null;
  }

  if (adminLoading || loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Usuarios
        </h2>
        <button
          onClick={loadUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_admin
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {user.is_admin ? 'Administrador' : 'Usuario'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {/* Toggle Admin */}
                      <button
                        onClick={() => user.is_admin ? handleDemoteFromAdmin(user.id) : handlePromoteToAdmin(user.id)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          user.is_admin
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800'
                            : 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800'
                        }`}
                      >
                        {user.is_admin ? 'Degradar' : 'Promover'}
                      </button>

                      {/* Toggle Active */}
                      <button
                        onClick={() => handleToggleUserActive(user.id, !user.is_active)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          user.is_active
                            ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                            : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                        }`}
                      >
                        {user.is_active ? 'Desactivar' : 'Activar'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setShowDeleteConfirm(user.id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
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
