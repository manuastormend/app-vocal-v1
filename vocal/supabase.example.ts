// ===========================================
// VOCAL WEB APP - CONFIGURACIÓN DE SUPABASE EJEMPLO
// ===========================================
// Copia este archivo como supabase.ts y reemplaza los valores con tus credenciales reales

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

// ===========================================
// INSTRUCCIONES:
// ===========================================
// 1. Crea un archivo .env.local en la raíz del proyecto vocal
// 2. Agrega las variables:
//    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
// 3. NUNCA subas el archivo .env.local a Git
// 4. El archivo .env.local ya está incluido en .gitignore
