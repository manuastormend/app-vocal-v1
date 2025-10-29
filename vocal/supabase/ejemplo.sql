BEGIN;

-- =======================================
-- 0) LISTA DE EJERCICIOS (instrucciones)
--    Todos tipo 'simple'
--    Campos válidos: exercise(id, name, type, description, created_at)
--                    simple_exercise(exercise_id, duration, repetitions, movement, text)
-- =======================================

WITH new_exercises(name, description, duration, repetitions, movement, text) AS (
  VALUES
    ('Respiración Diafragmática', 'Siéntate erguido. Inhala por la nariz 4s inflando el abdomen, sostiene 2s y exhala por la boca 6–8s. Evita elevar hombros. Repite manteniendo ritmo y relajación.', 120, 0, 'Respiración profunda', 'Inhala 4, sostén 2, exhala 6–8'),
    ('Sirenas Vocales', 'Con una vocal cómoda (u/o), desliza desde tu nota grave cómoda hasta la aguda y vuelve. Mantén volumen medio, sin forzar. Respira antes de cada pasada.', 0, 8, 'Deslizamiento continuo', 'Grave→Agudo→Grave en 1 respiración'),
    ('Trinos de Labios', 'Relaja labios y deja que vibren al soplar aire (brrr). Mantén flujo constante sin apretar mandíbula. Si cuesta, usa dedos en las comisuras.', 0, 10, 'Vibración de labios', 'Brrrr en tono medio'),
    ('Trinos de Lengua', 'Haz vibrar la lengua con “r” sostenida (rrrr). Evita tensión en cuello y mandíbula. Mantén aire constante.', 0, 10, 'Vibración de lengua', 'Rrrrr en tono medio'),
    ('Escalas Mayores', 'Canta la escala mayor 1–8–1 en una vocal (la/na). Usa piano o app de referencia. Sube medio tono cada repetición.', 0, 5, 'Ascendente y descendente', 'Do–Re–Mi–Fa–Sol–La–Si–Do–Si…'),
    ('Escalas Menores', 'Canta la escala menor natural 1–8–1 en vocal cómoda. Mantén apoyo y afinación. Sube medio tono progresivamente.', 0, 5, 'Ascendente y descendente', 'La–Si–Do–Re–Mi–Fa–Sol–La–Sol…'),
    ('Arpegios 1–3–5–8', 'Canta arpegios 1–3–5–8–5–3–1. Mantén igualdad de volumen entre notas. Usa respiraciones frecuentes.', 0, 6, 'Arpegios', '1–3–5–8–5–3–1'),
    ('Deslizamientos 3 Notas', 'Canta 1–2–3–2–1 en legato, haciendo un pequeño slide entre notas. Controla afinación sin golpear.', 0, 10, 'Slides cortos', '1–2–3–2–1 en una vocal'),
    ('Sostenidos Prolongados', 'Sostén una nota media 5–8s con volumen moderado. Enfócate en apoyo y estabilidad del tono. Descansa entre repeticiones.', 0, 6, 'Nota sostenida', 'Nota media estable 5–8s'),
    ('Consonantes Explosivas', 'Secuencias “Pa-Ta-Ka / Ba-Da-Ga” marcando ataque limpio y relajado. Mantén ritmo constante y claridad.', 0, 12, 'Articulación', 'Pa-Ta-Ka, Ba-Da-Ga en pulsos'),
    ('Registro de Pecho', 'Canta frases cortas en zona media-baja con resonancia torácica. Evita empujar aire. Mantén laringe estable.', 0, 6, 'Foco pecho', 'Vocal A/O cómoda'),
    ('Registro de Cabeza', 'Canta en zona media-alta con sensación ligera y enfocada en máscara superior. Evita nasalidad excesiva.', 0, 6, 'Foco cabeza', 'Vocal I/E ligera'),
    ('Mezcla de Registros', 'Desliza entre pecho y cabeza buscando transición suave (mix). No fuerces; reduce volumen al pasar por el puente.', 0, 6, 'Blend pecho-cabeza', 'Slides suaves a volumen bajo'),
    ('Articulación Rápida', 'Frases con sílabas rápidas (ta-ka-la-pa) a tempo. Mantén mandíbula suelta y lengua activa.', 0, 12, 'Dicción', 'Ta–ka–la–pa en negra/corchea'),
    ('Vibrato Controlado', 'Activa/desactiva vibrato por compases: empieza recto 2s y agrega vibrato suave 2s. No lo fuerces con mandíbula.', 0, 8, 'Vibrato', 'Recto→vibrato en ciclos'),
    ('Resonancia Nasal', 'Canta “M / N” largos con vibración en máscara (mejillas/nariz). Evita cerrar la garganta.', 0, 8, 'Enfoque en máscara', 'Mmmmm / Nnnnn'),
    ('Proyección Escénica', 'Lee/canta una frase proyectando hacia el fondo de la sala sin gritar. Usa apoyo abdominal y apertura cómoda.', 0, 6, 'Proyección', 'Texto claro a volumen medio'),
    ('Afinación con Piano', 'Imita notas del piano. Sostén 2–3s cada una. Corrige micro-ajustes escuchando batidos.', 0, 10, 'Afinación', 'Toma referencia y sostén'),
    ('Respiración Rítmica 4–4–8', 'Inhala 4, sostiene 4, exhala 8 con metrónomo. Mantén hombros relajados y espalda larga.', 90, 0, 'Respiración con metrónomo', '4–4–8 en 60–70 bpm'),
    ('Enlace de Vocales', 'Canta patrones con vocales A–E–I–O–U en legato. Mantén timbre homogéneo y soporte.', 0, 10, 'Legato vocales', 'A–E–I–O–U ascend/descend')
),

-- Inserta en exercise si no existe por nombre
ins_ex AS (
  INSERT INTO public.exercise (id, name, type, description, created_at)
  SELECT gen_random_uuid(), ne.name, 'simple', ne.description, now()
  FROM new_exercises ne
  WHERE NOT EXISTS (
    SELECT 1 FROM public.exercise e WHERE e.name = ne.name
  )
  RETURNING id, name
),

-- Obtener todos los exercise.id de los nombres (existentes + recién insertados)
all_ex AS (
  SELECT e.id, e.name
  FROM public.exercise e
  WHERE e.name IN (SELECT name FROM new_exercises)
)

-- Inserta detalles simples si no existen
INSERT INTO public.simple_exercise (exercise_id, duration, repetitions, movement, text)
SELECT ae.id, ne.duration, ne.repetitions, ne.movement, ne.text
FROM all_ex ae
JOIN new_exercises ne ON ne.name = ae.name
WHERE NOT EXISTS (
  SELECT 1 FROM public.simple_exercise se WHERE se.exercise_id = ae.id
);

-- =======================================
-- 1) RUTINAS (10)
-- routine(id, name, description, created_at)
-- =======================================
WITH new_routines(name, description) AS (
  VALUES
    ('Rutina Inicio Suave', 'Calentamiento básico y progresivo'),
    ('Rutina Vocal Pop', 'Mix, articulación y control de vibrato'),
    ('Rutina Clásica', 'Resonancia, cabeza y afinación'),
    ('Rutina Rápida 5min', 'Calentamiento exprés'),
    ('Rutina Respiración', 'Soporte respiratorio y control de aire'),
    ('Rutina Articulación', 'Claridad y velocidad de dicción'),
    ('Rutina Escénica', 'Proyección y presencia'),
    ('Rutina Afinación', 'Entrenamiento de afinación'),
    ('Rutina Mezcla', 'Transiciones pecho↔cabeza'),
    ('Rutina Intensiva', 'Trabajo completo e intenso')
),
ins_r AS (
  INSERT INTO public.routine (id, name, description, created_at)
  SELECT gen_random_uuid(), nr.name, nr.description, now()
  FROM new_routines nr
  WHERE NOT EXISTS (
    SELECT 1 FROM public.routine r WHERE r.name = nr.name
  )
  RETURNING id, name
)
SELECT 1;

-- =======================================
-- 2) RELACIONES RUTINA→EJERCICIO
-- routine_exercise(id, routine_id, exercise_id, order_index)
-- order_index comienza en 1
-- =======================================

-- Helper para insertar una lista ordenada por nombre de rutina
-- Uso repetido de patrón INSERT ... SELECT ... WHERE NOT EXISTS

-- Rutina Inicio Suave
INSERT INTO public.routine_exercise (id, routine_id, exercise_id, order_index)
SELECT gen_random_uuid(), r.id, e.id, x.ord
FROM public.routine r
JOIN LATERAL (VALUES
  ('Respiración Diafragmática', 1),
  ('Trinos de Labios', 2),
  ('Sirenas Vocales', 3),
  ('Arpegios 1–3–5–8', 4)
) AS x(name, ord) ON TRUE
JOIN public.exercise e ON e.name = x.name
WHERE r.name = 'Rutina Inicio Suave'
  AND NOT EXISTS (
    SELECT 1 FROM public.routine_exercise re
    WHERE re.routine_id = r.id AND re.order_index = x.ord
  );

-- Rutina Vocal Pop
INSERT INTO public.routine_exercise (id, routine_id, exercise_id, order_index)
SELECT gen_random_uuid(), r.id, e.id, x.ord
FROM public.routine r
JOIN LATERAL (VALUES
  ('Mezcla de Registros', 1),
  ('Articulación Rápida', 2),
  ('Escalas Mayores', 3),
  ('Vibrato Controlado', 4)
) AS x(name, ord) ON TRUE
JOIN public.exercise e ON e.name = x.name
WHERE r.name = 'Rutina Vocal Pop'
  AND NOT EXISTS (
    SELECT 1 FROM public.routine_exercise re
    WHERE re.routine_id = r.id AND re.order_index = x.ord
  );

-- Rutina Clásica
INSERT INTO public.routine_exercise (id, routine_id, exercise_id, order_index)
SELECT gen_random_uuid(), r.id, e.id, x.ord
FROM public.routine r
JOIN LATERAL (VALUES
  ('Registro de Cabeza', 1),
  ('Resonancia Nasal', 2),
  ('Escalas Menores', 3),
  ('Afinación con Piano', 4)
) AS x(name, ord) ON TRUE
JOIN public.exercise e ON e.name = x.name
WHERE r.name = 'Rutina Clásica'
  AND NOT EXISTS (
    SELECT 1 FROM public.routine_exercise re
    WHERE re.routine_id = r.id AND re.order_index = x.ord
  );

-- Rutina Rápida 5min
INSERT INTO public.routine_exercise (id, routine_id, exercise_id, order_index)
SELECT gen_random_uuid(), r.id, e.id, x.ord
FROM public.routine r
JOIN LATERAL (VALUES
  ('Respiración Rítmica 4–4–8', 1),
  ('Deslizamientos 3 Notas', 2),
  ('Trinos de Lengua', 3)
) AS x(name, ord) ON TRUE
JOIN public.exercise e ON e.name = x.name
WHERE r.name = 'Rutina Rápida 5min'
  AND NOT EXISTS (
    SELECT 1 FROM public.routine_exercise re
    WHERE re.routine_id = r.id AND re.order_index = x.ord
  );

-- Rutina Respiración
INSERT INTO public.routine_exercise (id, routine_id, exercise_id, order_index)
SELECT gen_random_uuid(), r.id, e.id, x.ord
FROM public.routine r
JOIN LATERAL (VALUES
  ('Respiración Diafragmática', 1),
  ('Sostenidos Prolongados', 2),
  ('Proyección Escénica', 3)
) AS x(name, ord) ON TRUE
JOIN public.exercise e ON e.name = x.name
WHERE r.name = 'Rutina Respiración'
  AND NOT EXISTS (
    SELECT 1 FROM public.routine_exercise re
    WHERE re.routine_id = r.id AND re.order_index = x.ord
  );

-- Rutina Articulación
INSERT INTO public.routine_exercise (id, routine_id, exercise_id, order_index)
SELECT gen_random_uuid(), r.id, e.id, x.ord
FROM public.routine r
JOIN LATERAL (VALUES
  ('Consonantes Explosivas', 1),
  ('Articulación Rápida', 2),
  ('Trinos de Lengua', 3)
) AS x(name, ord) ON TRUE
JOIN public.exercise e ON e.name = x.name
WHERE r.name = 'Rutina Articulación'
  AND NOT EXISTS (
    SELECT 1 FROM public.routine_exercise re
    WHERE re.routine_id = r.id AND re.order_index = x.ord
  );

-- Rutina Escénica
INSERT INTO public.routine_exercise (id, routine_id, exercise_id, order_index)
SELECT gen_random_uuid(), r.id, e.id, x.ord
FROM public.routine r
JOIN LATERAL (VALUES
  ('Proyección Escénica', 1),
  ('Resonancia Nasal', 2),
  ('Sostenidos Prolongados', 3)
) AS x(name, ord) ON TRUE
JOIN public.exercise e ON e.name = x.name
WHERE r.name = 'Rutina Escénica'
  AND NOT EXISTS (
    SELECT 1 FROM public.routine_exercise re
    WHERE re.routine_id = r.id AND re.order_index = x.ord
  );

-- Rutina Afinación
INSERT INTO public.routine_exercise (id, routine_id, exercise_id, order_index)
SELECT gen_random_uuid(), r.id, e.id, x.ord
FROM public.routine r
JOIN LATERAL (VALUES
  ('Afinación con Piano', 1),
  ('Escalas Mayores', 2),
  ('Escalas Menores', 3)
) AS x(name, ord) ON TRUE
JOIN public.exercise e ON e.name = x.name
WHERE r.name = 'Rutina Afinación'
  AND NOT EXISTS (
    SELECT 1 FROM public.routine_exercise re
    WHERE re.routine_id = r.id AND re.order_index = x.ord
  );

-- Rutina Mezcla
INSERT INTO public.routine_exercise (id, routine_id, exercise_id, order_index)
SELECT gen_random_uuid(), r.id, e.id, x.ord
FROM public.routine r
JOIN LATERAL (VALUES
  ('Registro de Pecho', 1),
  ('Registro de Cabeza', 2),
  ('Mezcla de Registros', 3)
) AS x(name, ord) ON TRUE
JOIN public.exercise e ON e.name = x.name
WHERE r.name = 'Rutina Mezcla'
  AND NOT EXISTS (
    SELECT 1 FROM public.routine_exercise re
    WHERE re.routine_id = r.id AND re.order_index = x.ord
  );

-- Rutina Intensiva
INSERT INTO public.routine_exercise (id, routine_id, exercise_id, order_index)
SELECT gen_random_uuid(), r.id, e.id, x.ord
FROM public.routine r
JOIN LATERAL (VALUES
  ('Calentamiento Rápido', 1),
  ('Consonantes Explosivas', 2),
  ('Sirenas Vocales', 3),
  ('Vibrato Controlado', 4),
  ('Arpegios 1–3–5–8', 5)
) AS x(name, ord) ON TRUE
JOIN public.exercise e ON e.name = x.name
WHERE r.name = 'Rutina Intensiva'
  AND NOT EXISTS (
    SELECT 1 FROM public.routine_exercise re
    WHERE re.routine_id = r.id AND re.order_index = x.ord
  );

COMMIT;