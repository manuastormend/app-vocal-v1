import { supabase } from './supabase';
import { Exercise, CreateExerciseData, UpdateExerciseData, SimpleExercise, CompoundExercise, ExerciseWithDetails } from './types';

export class ExerciseService {
  // Obtener todos los ejercicios
  static async getAllExercises(): Promise<ExerciseWithDetails[]> {
    const { data, error } = await supabase
      .from('exercise')
      .select(`
        *,
        simple_exercise (
          duration,
          repetitions,
          movement,
          text
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener ejercicios: ${error.message}`);
    }

    // Procesar los datos para incluir los campos de simple_exercise
    const processedData = (data || []).map(exercise => {
      if (exercise.type === 'simple' && exercise.simple_exercise) {
        const simpleData = exercise.simple_exercise;
        return {
          ...exercise,
          duration: simpleData.duration,
          repetitions: simpleData.repetitions,
          movement: simpleData.movement,
          text: simpleData.text,
        };
      }
      return exercise;
    });
    return processedData;
  }

  // Obtener un ejercicio por ID
  static async getExerciseById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercise')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener ejercicio: ${error.message}`);
    }

    return data;
  }

  // Obtener ejercicio simple con detalles
  static async getSimpleExercise(id: string): Promise<SimpleExercise | null> {
    const { data, error } = await supabase
      .from('exercise')
      .select(`
        *,
        simple_exercise (
          duration,
          repetitions,
          movement,
          description,
          text
        )
      `)
      .eq('id', id)
      .eq('type', 'simple')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener ejercicio simple: ${error.message}`);
    }

    const simpleData = data.simple_exercise?.[0];
    return {
      ...data,
      duration: simpleData?.duration,
      repetitions: simpleData?.repetitions,
      movement: simpleData?.movement,
      text: simpleData?.text,
    } as SimpleExercise;
  }

  // Obtener ejercicio compuesto con componentes
  static async getCompoundExercise(id: string): Promise<CompoundExercise | null> {
    // 1) Obtener el ejercicio base (sin joins)
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('exercise')
      .select('*')
      .eq('id', id)
      .eq('type', 'compound')
      .single();

    if (exerciseError) {
      if ((exerciseError as any).code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener ejercicio compuesto: ${exerciseError.message}`);
    }

    // 2) Obtener los componentes (sin relaciones anidadas, para evitar errores de esquema)
    const { data: componentsRows, error: componentsError } = await supabase
      .from('compound_exercise_component')
      .select('id, child_exercise_id, quantity, order_index')
      .eq('parent_exercise_id', id)
      .order('order_index');

    if (componentsError) {
      throw new Error(`Error al obtener componentes: ${componentsError.message}`);
    }

    const components = componentsRows || [];

    // 3) Cargar los ejercicios hijos en una segunda consulta y mapearlos
    const childIds = Array.from(new Set(components.map(c => c.child_exercise_id))).filter(Boolean);
    let childMap: Record<string, Exercise> = {};
    if (childIds.length > 0) {
      const { data: childExercises, error: childError } = await supabase
        .from('exercise')
        .select('*')
        .in('id', childIds as string[]);

      if (childError) {
        throw new Error(`Error al obtener ejercicios hijos: ${childError.message}`);
      }

      childMap = (childExercises || []).reduce<Record<string, Exercise>>((acc, ex) => {
        acc[ex.id] = ex as Exercise;
        return acc;
      }, {});
    }

    const componentsWithChildren = components.map(c => ({
      id: c.id,
      parent_exercise_id: id,
      child_exercise_id: c.child_exercise_id,
      quantity: c.quantity,
      order_index: c.order_index,
      child_exercise: childMap[c.child_exercise_id] || undefined,
    }));

    return {
      ...(exerciseData as any),
      components: componentsWithChildren,
    } as CompoundExercise;
  }

  // Crear un nuevo ejercicio
  static async createExercise(exerciseData: CreateExerciseData): Promise<ExerciseWithDetails> {
    const { data, error } = await supabase
      .from('exercise')
      .insert([{
        name: exerciseData.name,
        type: exerciseData.type,
        description: exerciseData.description,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear ejercicio: ${error.message}`);
    }

    // Si es un ejercicio simple, crear los detalles adicionales
    if (exerciseData.type === 'simple' && (exerciseData.duration || exerciseData.repetitions || exerciseData.movement || exerciseData.text)) {
      await supabase
        .from('simple_exercise')
        .insert([{
          exercise_id: data.id,
          duration: exerciseData.duration,
          repetitions: exerciseData.repetitions,
          movement: exerciseData.movement,
          text: exerciseData.text,
        }]);
    }

    // Obtener el ejercicio completo con todos los detalles
    const exercises = await this.getAllExercises();
    const createdExercise = exercises.find(ex => ex.id === data.id);
    return createdExercise || data;
  }

  // Verificar si agregar un componente crearía una referencia circular
  private static async wouldCreateCircularReference(parentId: string, childId: string): Promise<boolean> {
    // Primero, verificar si el child es un ejercicio compuesto
    const childExercise = await this.getExerciseById(childId);
    if (!childExercise || childExercise.type !== 'compound') {
      // Si el child es un ejercicio simple, no puede crear una referencia circular
      return false;
    }

    // Obtener los componentes del child
    const childCompound = await this.getCompoundExercise(childId);
    if (!childCompound || !childCompound.components) {
      return false;
    }

    // Verificar si el parent está entre los componentes del child (referencia circular directa)
    const hasDirectReference = childCompound.components.some(comp => comp.child_exercise_id === parentId);
    if (hasDirectReference) {
      return true;
    }

    // Verificar referencias indirectas (recursivamente)
    for (const component of childCompound.components) {
      if (await this.wouldCreateCircularReference(parentId, component.child_exercise_id)) {
        return true;
      }
    }

    return false;
  }

  // Agregar componente a ejercicio compuesto
  static async addComponentToCompound(parentExerciseId: string, childExerciseId: string, quantity: number, orderIndex: number): Promise<void> {
    console.log('ExerciseService.addComponentToCompound - Iniciando...');
    console.log('parentExerciseId:', parentExerciseId);
    console.log('childExerciseId:', childExerciseId);
    console.log('quantity:', quantity);
    console.log('orderIndex:', orderIndex);
    
    // Validar que no se intente agregar el ejercicio a sí mismo
    if (parentExerciseId === childExerciseId) {
      throw new Error('No se puede agregar un ejercicio como componente de sí mismo');
    }
    
    // Validar que no se cree una referencia circular
    const wouldCreateCircular = await this.wouldCreateCircularReference(parentExerciseId, childExerciseId);
    if (wouldCreateCircular) {
      throw new Error('No se puede agregar este componente ya que crearía una referencia circular');
    }
    
    const { error } = await supabase
      .from('compound_exercise_component')
      .insert([{
        parent_exercise_id: parentExerciseId,
        child_exercise_id: childExerciseId,
        quantity: quantity,
        order_index: orderIndex,
      }]);

    if (error) {
      console.error('ExerciseService.addComponentToCompound - Error:', error);
      throw new Error(`Error al agregar componente: ${error.message}`);
    }
    
    console.log('ExerciseService.addComponentToCompound - Completado exitosamente');
  }

  // Actualizar componente de ejercicio compuesto
  static async updateComponent(componentId: string, quantity: number, orderIndex: number): Promise<void> {
    const { error } = await supabase
      .from('compound_exercise_component')
      .update({
        quantity: quantity,
        order_index: orderIndex,
      })
      .eq('id', componentId);

    if (error) {
      throw new Error(`Error al actualizar componente: ${error.message}`);
    }
  }

  // Eliminar componente de ejercicio compuesto
  static async removeComponent(componentId: string): Promise<void> {
    const { error } = await supabase
      .from('compound_exercise_component')
      .delete()
      .eq('id', componentId);

    if (error) {
      throw new Error(`Error al eliminar componente: ${error.message}`);
    }
  }

  // Intercambiar el orden de dos componentes de forma segura
  static async swapComponentOrder(
    component1Id: string,
    component1NewOrder: number,
    component2Id: string,
    component2NewOrder: number
  ): Promise<void> {
    // Primero, mover el primer componente a un índice temporal muy grande para evitar conflictos
    // Usamos un valor que sea extremadamente improbable que ya esté en uso
    const tempIndex = 999999;
    
    // Actualizar primer componente a índice temporal
    const { error: error1 } = await supabase
      .from('compound_exercise_component')
      .update({ order_index: tempIndex })
      .eq('id', component1Id);

    if (error1) {
      throw new Error(`Error al intercambiar componentes: ${error1.message}`);
    }

    // Mover el segundo componente a su nueva posición
    const { error: error2 } = await supabase
      .from('compound_exercise_component')
      .update({ order_index: component2NewOrder })
      .eq('id', component2Id);

    if (error2) {
      throw new Error(`Error al intercambiar componentes: ${error2.message}`);
    }

    // Finalmente, mover el primer componente a su nueva posición
    const { error: error3 } = await supabase
      .from('compound_exercise_component')
      .update({ order_index: component1NewOrder })
      .eq('id', component1Id);

    if (error3) {
      throw new Error(`Error al intercambiar componentes: ${error3.message}`);
    }
  }

  // Obtener ejercicios disponibles para usar como componentes (simples y compuestos)
  static async getExercisesForComponents(): Promise<ExerciseWithDetails[]> {
    const { data, error } = await supabase
      .from('exercise')
      .select(`
        *,
        simple_exercise (
          duration,
          repetitions,
          movement,
          text
        )
      `)
      .order('name');

    if (error) {
      throw new Error(`Error al obtener ejercicios: ${error.message}`);
    }

    // Procesar los datos para incluir los campos de simple_exercise
    const processedData = (data || []).map(exercise => {
      if (exercise.type === 'simple' && exercise.simple_exercise) {
        const simpleData = exercise.simple_exercise;
        return {
          ...exercise,
          duration: simpleData.duration,
          repetitions: simpleData.repetitions,
          movement: simpleData.movement,
          text: simpleData.text,
        };
      }
      return exercise;
    });

    return processedData;
  }

  // Actualizar un ejercicio
  static async updateExercise(updateData: UpdateExerciseData): Promise<ExerciseWithDetails> {
    const { id, ...exerciseData } = updateData;
    
    const { data, error } = await supabase
      .from('exercise')
      .update({
        name: exerciseData.name,
        type: exerciseData.type,
        description: exerciseData.description,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar ejercicio: ${error.message}`);
    }

    // Si es un ejercicio simple, actualizar los detalles adicionales
    if (exerciseData.type === 'simple' && (exerciseData.duration || exerciseData.repetitions || exerciseData.movement || exerciseData.text)) {
      await supabase
        .from('simple_exercise')
        .upsert([{
          exercise_id: id,
          duration: exerciseData.duration,
          repetitions: exerciseData.repetitions,
          movement: exerciseData.movement,
          text: exerciseData.text,
        }]);
    }

    // Obtener el ejercicio completo con todos los detalles
    const exercises = await this.getAllExercises();
    const updatedExercise = exercises.find(ex => ex.id === id);
    return updatedExercise || data;
  }

  // Eliminar un ejercicio
  static async deleteExercise(id: string): Promise<void> {
    const { error } = await supabase
      .from('exercise')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar ejercicio: ${error.message}`);
    }
  }

  // Buscar ejercicios por nombre
  static async searchExercises(query: string): Promise<ExerciseWithDetails[]> {
    const { data, error } = await supabase
      .from('exercise')
      .select(`
        *,
        simple_exercise (
          duration,
          repetitions,
          movement,
          text
        )
      `)
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) {
      throw new Error(`Error al buscar ejercicios: ${error.message}`);
    }

    // Procesar los datos para incluir los campos de simple_exercise
    const processedData = (data || []).map(exercise => {
      if (exercise.type === 'simple' && exercise.simple_exercise) {
        const simpleData = exercise.simple_exercise;
        return {
          ...exercise,
          duration: simpleData.duration,
          repetitions: simpleData.repetitions,
          movement: simpleData.movement,
          text: simpleData.text,
        };
      }
      return exercise;
    });

    return processedData;
  }
}
