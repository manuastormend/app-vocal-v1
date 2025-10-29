-- Políticas RLS con privilegios de administrador
-- Los usuarios con is_admin = true tienen acceso completo a todas las tablas

-- ==============================================
-- FUNCIÓN HELPER PARA VERIFICAR ADMIN
-- ==============================================

-- Función para verificar si el usuario actual es administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.user WHERE id = auth.uid()),
    false
  );
$$;

-- ==============================================
-- TABLA: user
-- ==============================================

-- Habilitar RLS
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow public insert" ON public.user;
DROP POLICY IF EXISTS "Allow public select" ON public.user;
DROP POLICY IF EXISTS "Allow public update" ON public.user;
DROP POLICY IF EXISTS "Users can view own data" ON public.user;
DROP POLICY IF EXISTS "Users can insert own data" ON public.user;
DROP POLICY IF EXISTS "Users can update own data" ON public.user;
DROP POLICY IF EXISTS "Users can delete own data" ON public.user;
DROP POLICY IF EXISTS "Admin full access" ON public.user;

-- Políticas para usuarios normales (solo sus propios datos)
CREATE POLICY "Users can view own data" ON public.user
    FOR SELECT 
    USING (id = auth.uid());

CREATE POLICY "Users can insert own data" ON public.user
    FOR INSERT 
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own data" ON public.user
    FOR UPDATE 
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete own data" ON public.user
    FOR DELETE 
    USING (id = auth.uid());

-- Políticas para administradores (acceso completo)
CREATE POLICY "Admin full access" ON public.user
    FOR ALL 
    USING (is_admin())
    WITH CHECK (is_admin());

-- ==============================================
-- TABLA: exercise
-- ==============================================

-- Habilitar RLS
ALTER TABLE public.exercise ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view exercises" ON public.exercise;
DROP POLICY IF EXISTS "Users can insert exercises" ON public.exercise;
DROP POLICY IF EXISTS "Users can update exercises" ON public.exercise;
DROP POLICY IF EXISTS "Users can delete exercises" ON public.exercise;
DROP POLICY IF EXISTS "Admin full access" ON public.exercise;

-- Políticas para usuarios normales (acceso completo a ejercicios)
CREATE POLICY "Users can view exercises" ON public.exercise
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert exercises" ON public.exercise
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can update exercises" ON public.exercise
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete exercises" ON public.exercise
    FOR DELETE 
    USING (true);

-- Políticas para administradores (acceso completo - redundante pero explícito)
CREATE POLICY "Admin full access" ON public.exercise
    FOR ALL 
    USING (is_admin())
    WITH CHECK (is_admin());

-- ==============================================
-- TABLA: simple_exercise
-- ==============================================

-- Habilitar RLS
ALTER TABLE public.simple_exercise ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view simple exercises" ON public.simple_exercise;
DROP POLICY IF EXISTS "Users can insert simple exercises" ON public.simple_exercise;
DROP POLICY IF EXISTS "Users can update simple exercises" ON public.simple_exercise;
DROP POLICY IF EXISTS "Users can delete simple exercises" ON public.simple_exercise;
DROP POLICY IF EXISTS "Admin full access" ON public.simple_exercise;

-- Políticas para usuarios normales
CREATE POLICY "Users can view simple exercises" ON public.simple_exercise
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert simple exercises" ON public.simple_exercise
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can update simple exercises" ON public.simple_exercise
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete simple exercises" ON public.simple_exercise
    FOR DELETE 
    USING (true);

-- Políticas para administradores
CREATE POLICY "Admin full access" ON public.simple_exercise
    FOR ALL 
    USING (is_admin())
    WITH CHECK (is_admin());

-- ==============================================
-- TABLA: compound_exercise_component
-- ==============================================

-- Habilitar RLS
ALTER TABLE public.compound_exercise_component ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view components" ON public.compound_exercise_component;
DROP POLICY IF EXISTS "Users can insert components" ON public.compound_exercise_component;
DROP POLICY IF EXISTS "Users can update components" ON public.compound_exercise_component;
DROP POLICY IF EXISTS "Users can delete components" ON public.compound_exercise_component;
DROP POLICY IF EXISTS "Admin full access" ON public.compound_exercise_component;

-- Políticas para usuarios normales
CREATE POLICY "Users can view components" ON public.compound_exercise_component
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert components" ON public.compound_exercise_component
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can update components" ON public.compound_exercise_component
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete components" ON public.compound_exercise_component
    FOR DELETE 
    USING (true);

-- Políticas para administradores
CREATE POLICY "Admin full access" ON public.compound_exercise_component
    FOR ALL 
    USING (is_admin())
    WITH CHECK (is_admin());

-- ==============================================
-- TABLA: routine
-- ==============================================

-- Habilitar RLS
ALTER TABLE public.routine ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view routines" ON public.routine;
DROP POLICY IF EXISTS "Users can insert routines" ON public.routine;
DROP POLICY IF EXISTS "Users can update routines" ON public.routine;
DROP POLICY IF EXISTS "Users can delete routines" ON public.routine;
DROP POLICY IF EXISTS "Admin full access" ON public.routine;

-- Políticas para usuarios normales
CREATE POLICY "Users can view routines" ON public.routine
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert routines" ON public.routine
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can update routines" ON public.routine
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete routines" ON public.routine
    FOR DELETE 
    USING (true);

-- Políticas para administradores
CREATE POLICY "Admin full access" ON public.routine
    FOR ALL 
    USING (is_admin())
    WITH CHECK (is_admin());

-- ==============================================
-- TABLA: routine_exercise
-- ==============================================

-- Habilitar RLS
ALTER TABLE public.routine_exercise ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view routine exercises" ON public.routine_exercise;
DROP POLICY IF EXISTS "Users can insert routine exercises" ON public.routine_exercise;
DROP POLICY IF EXISTS "Users can update routine exercises" ON public.routine_exercise;
DROP POLICY IF EXISTS "Users can delete routine exercises" ON public.routine_exercise;
DROP POLICY IF EXISTS "Admin full access" ON public.routine_exercise;

-- Políticas para usuarios normales
CREATE POLICY "Users can view routine exercises" ON public.routine_exercise
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert routine exercises" ON public.routine_exercise
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can update routine exercises" ON public.routine_exercise
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete routine exercises" ON public.routine_exercise
    FOR DELETE 
    USING (true);

-- Políticas para administradores
CREATE POLICY "Admin full access" ON public.routine_exercise
    FOR ALL 
    USING (is_admin())
    WITH CHECK (is_admin());

-- ==============================================
-- TABLA: activity_log
-- ==============================================

-- Habilitar RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_log;
DROP POLICY IF EXISTS "Users can insert own activity" ON public.activity_log;
DROP POLICY IF EXISTS "Users can update own activity" ON public.activity_log;
DROP POLICY IF EXISTS "Users can delete own activity" ON public.activity_log;
DROP POLICY IF EXISTS "Admin full access" ON public.activity_log;

-- Políticas para usuarios normales (solo sus propias actividades)
CREATE POLICY "Users can view own activity" ON public.activity_log
    FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activity" ON public.activity_log
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own activity" ON public.activity_log
    FOR UPDATE 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own activity" ON public.activity_log
    FOR DELETE 
    USING (user_id = auth.uid());

-- Políticas para administradores (acceso completo a todas las actividades)
CREATE POLICY "Admin full access" ON public.activity_log
    FOR ALL 
    USING (is_admin())
    WITH CHECK (is_admin());

-- ==============================================
-- VERIFICACIÓN DE POLÍTICAS
-- ==============================================

-- Verificar que todas las tablas tienen RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('user', 'exercise', 'simple_exercise', 'compound_exercise_component', 'routine', 'routine_exercise', 'activity_log')
ORDER BY tablename;

-- Verificar políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
