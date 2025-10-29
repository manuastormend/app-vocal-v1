import { supabase } from './supabase';
import { passwordUtils } from './password';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
}

export const userService = {
  async createUser(email: string, password: string): Promise<User> {
    const validation = passwordUtils.validatePasswordStrength(password);
    if (!validation.isValid) {
      throw new Error(`Contraseña inválida: ${validation.errors.join(', ')}`);
    }

    const passwordHash = await passwordUtils.hashPassword(password);

    const { data, error } = await supabase
      .from('user')
      .insert({ email, password_hash: passwordHash, is_active: true })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }

    return data as User;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }

    return data as User | null;
  },

  async verifyCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await passwordUtils.verifyPassword(password, user.password_hash);
    if (!isValid) return null;

    return user;
  },
};


