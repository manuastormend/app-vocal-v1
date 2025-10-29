import { supabase } from './supabase'
import { userService, User } from './user'

export interface AuthUser {
  id: string
  email: string
}

export const auth = {
  // Iniciar sesión
  async signIn(email: string, password: string) {
    // Verificar credenciales en la tabla User
    const user = await userService.verifyCredentials(email, password)
    
    if (!user) {
      throw new Error('Credenciales inválidas')
    }

    // Crear sesión en Supabase Auth (opcional, para mantener compatibilidad)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy_password' // No usamos la contraseña real aquí
    })
    
    if (error) {
      // Si falla la autenticación de Supabase, aún podemos proceder
      console.warn('Supabase auth falló, pero el usuario es válido:', error.message)
    }

    return {
      user: {
        id: user.id,
        email: user.email
      },
      session: data?.session
    }
  },

  // Registrarse
  async signUp(email: string, password: string) {
    // Verificar si el usuario ya existe
    const existingUser = await userService.getUserByEmail(email)
    
    if (existingUser) {
      throw new Error('El usuario ya existe')
    }

    // Crear usuario en la tabla User
    const newUser = await userService.createUser(email, password)

    // También crear en Supabase Auth para mantener compatibilidad
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'dummy_password' // No usamos la contraseña real aquí
      })
      
      if (error) {
        console.warn('Supabase auth falló, pero el usuario fue creado:', error.message)
      }
    } catch (error) {
      console.warn('Error en Supabase auth durante registro:', error)
    }

    return {
      user: {
        id: newUser.id,
        email: newUser.email
      }
    }
  },

  // Cerrar sesión
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Escuchar cambios de autenticación
  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  }
}
