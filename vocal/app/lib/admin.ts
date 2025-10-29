import { supabase } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  is_admin: boolean;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

export class AdminService {
  // Verificar si el usuario actual es administrador
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('user')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error al verificar admin:', error);
        return false;
      }

      return data?.is_admin || false;
    } catch (error) {
      console.error('Error al verificar admin:', error);
      return false;
    }
  }

  // Obtener información completa del usuario actual (incluyendo is_admin)
  static async getCurrentUserInfo(): Promise<AdminUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error al obtener info del usuario:', error);
        return null;
      }

      return data as AdminUser;
    } catch (error) {
      console.error('Error al obtener info del usuario:', error);
      return null;
    }
  }

  // Obtener todos los usuarios (solo para administradores)
  static async getAllUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener usuarios: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  // Actualizar usuario (solo para administradores)
  static async updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    try {
      const { data, error } = await supabase
        .from('user')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar usuario: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Eliminar usuario (solo para administradores)
  static async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user')
        .delete()
        .eq('id', userId);

      if (error) {
        throw new Error(`Error al eliminar usuario: ${error.message}`);
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // Promover usuario a administrador
  static async promoteToAdmin(userId: string): Promise<AdminUser> {
    return this.updateUser(userId, { is_admin: true });
  }

  // Degradar administrador a usuario normal
  static async demoteFromAdmin(userId: string): Promise<AdminUser> {
    return this.updateUser(userId, { is_admin: false });
  }

  // Activar/desactivar usuario
  static async toggleUserActive(userId: string, isActive: boolean): Promise<AdminUser> {
    return this.updateUser(userId, { is_active: isActive });
  }
}
