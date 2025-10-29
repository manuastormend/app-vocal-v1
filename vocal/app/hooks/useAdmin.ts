'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminUser } from '../lib/admin';
import { AdminService } from '../lib/admin';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si el usuario actual es administrador
  const checkAdminStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const adminStatus = await AdminService.isCurrentUserAdmin();
      const userData = await AdminService.getCurrentUserInfo();
      
      setIsAdmin(adminStatus);
      setUserInfo(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar estado de administrador');
      setIsAdmin(false);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estado de administrador al montar el componente
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  // Obtener todos los usuarios (solo para administradores)
  const getAllUsers = useCallback(async (): Promise<AdminUser[]> => {
    if (!isAdmin) {
      throw new Error('No tienes permisos de administrador');
    }

    try {
      setError(null);
      return await AdminService.getAllUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener usuarios';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isAdmin]);

  // Actualizar usuario
  const updateUser = useCallback(async (userId: string, updates: Partial<AdminUser>): Promise<AdminUser> => {
    if (!isAdmin) {
      throw new Error('No tienes permisos de administrador');
    }

    try {
      setError(null);
      const updatedUser = await AdminService.updateUser(userId, updates);
      
      // Si estamos actualizando nuestro propio usuario, actualizar el estado local
      if (userInfo && userId === userInfo.id) {
        setUserInfo(updatedUser);
        setIsAdmin(updatedUser.is_admin);
      }
      
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isAdmin, userInfo]);

  // Eliminar usuario
  const deleteUser = useCallback(async (userId: string): Promise<void> => {
    if (!isAdmin) {
      throw new Error('No tienes permisos de administrador');
    }

    try {
      setError(null);
      await AdminService.deleteUser(userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isAdmin]);

  // Promover usuario a administrador
  const promoteToAdmin = useCallback(async (userId: string): Promise<AdminUser> => {
    return updateUser(userId, { is_admin: true });
  }, [updateUser]);

  // Degradar administrador a usuario normal
  const demoteFromAdmin = useCallback(async (userId: string): Promise<AdminUser> => {
    return updateUser(userId, { is_admin: false });
  }, [updateUser]);

  // Activar/desactivar usuario
  const toggleUserActive = useCallback(async (userId: string, isActive: boolean): Promise<AdminUser> => {
    return updateUser(userId, { is_active: isActive });
  }, [updateUser]);

  return {
    isAdmin,
    userInfo,
    loading,
    error,
    checkAdminStatus,
    getAllUsers,
    updateUser,
    deleteUser,
    promoteToAdmin,
    demoteFromAdmin,
    toggleUserActive,
  };
}
