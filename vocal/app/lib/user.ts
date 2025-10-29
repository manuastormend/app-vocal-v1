import { supabase } from './supabase';
import { passwordUtils } from './password';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const userService = {
  // Crear un nuevo usuario en la tabla User
  async createUser(email: string, password: string): Promise<User> {
    // Validar fortaleza de contraseña
    const passwordValidation = passwordUtils.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Contraseña inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Encriptar contraseña
    const passwordHash = await passwordUtils.hashPassword(password);

    // Insertar usuario en la tabla User
    const { data, error } = await supabase
      .from('user')
      .insert({
        email,
        password_hash: passwordHash,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }

    return data;
  },

  // Buscar usuario por email
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Usuario no encontrado
      }
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }

    return data;
  },

  // Verificar credenciales de login
  async verifyCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return null;
    }

    const isValidPassword = await passwordUtils.verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }

    return user;
  },

  // Actualizar contraseña de usuario
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    // Validar fortaleza de contraseña
    const passwordValidation = passwordUtils.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Contraseña inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Encriptar nueva contraseña
    const passwordHash = await passwordUtils.hashPassword(newPassword);

    const { error } = await supabase
      .from('user')
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  },

  // Desactivar usuario
  async deactivateUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Error al desactivar usuario: ${error.message}`);
    }
  }
};
