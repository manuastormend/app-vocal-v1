-- Políticas de Row Level Security para la tabla 'user'

-- Habilitar RLS si no está habilitado
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view own data" ON public.user;
DROP POLICY IF EXISTS "Users can insert own data" ON public.user;
DROP POLICY IF EXISTS "Users can update own data" ON public.user;
DROP POLICY IF EXISTS "Allow public insert" ON public.user;
DROP POLICY IF EXISTS "Allow public select" ON public.user;
DROP POLICY IF EXISTS "Allow public update" ON public.user;

-- Política para permitir inserción pública (registro de nuevos usuarios)
CREATE POLICY "Allow public insert" ON public.user
    FOR INSERT 
    WITH CHECK (true);

-- Política para permitir lectura pública (para verificar usuarios existentes)
CREATE POLICY "Allow public select" ON public.user
    FOR SELECT 
    USING (true);

-- Política para permitir actualización pública (para actualizar contraseñas, etc.)
CREATE POLICY "Allow public update" ON public.user
    FOR UPDATE 
    USING (true);
