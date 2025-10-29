-- Solución simple: Deshabilitar RLS completamente
-- Esto permitirá todas las operaciones en la tabla 'user'

ALTER TABLE public.user DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'RLS HABILITADO' 
        ELSE 'RLS DESHABILITADO' 
    END as status
FROM pg_tables 
WHERE tablename = 'user' AND schemaname = 'public';
