import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExercises } from '../hooks/useExercises';
import { useRoutines } from '../hooks/useRoutines';

export default function Home() {
  const { exercises, loading: exercisesLoading, error: exercisesError, loadRandomExercises } = useExercises();
  const { routines, loading: routinesLoading, error: routinesError, loadRandomRoutines, load5MinuteRoutines } = useRoutines();
  const [fiveMinuteRoutines, setFiveMinuteRoutines] = useState<any[]>([]);
  const [loading5Min, setLoading5Min] = useState(false);

  // Cargar rutinas de 5 minutos al montar el componente
  useEffect(() => {
    const load5MinRoutines = async () => {
      try {
        setLoading5Min(true);
        const data = await load5MinuteRoutines();
        setFiveMinuteRoutines(data);
      } catch (error) {
        console.error('Error loading 5 minute routines:', error);
        setFiveMinuteRoutines([]);
      } finally {
        setLoading5Min(false);
      }
    };
    load5MinRoutines();
  }, [load5MinuteRoutines]);

  // Componente para el icono abstracto
  const AbstractIcon = () => (
    <View style={styles.abstractIcon}>
      {/* Triángulo */}
      <View style={styles.triangle} />
      {/* Cuadrado */}
      <View style={styles.square} />
      {/* Engranaje */}
      <View style={styles.gear}>
        <View style={styles.gearCenter} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.timeText}>9:30</Text>
        <View style={styles.statusIcons}>
          <View style={styles.batteryIcon} />
          <View style={styles.wifiIcon} />
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ejercicios de vocal</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Ejercicios Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ejercicios</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
          {exercisesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#9333EA" />
              <Text style={styles.loadingText}>Cargando ejercicios...</Text>
            </View>
          ) : exercisesError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error al cargar ejercicios</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {exercises.slice(0, 4).map((exercise) => (
                <TouchableOpacity key={exercise.id} style={styles.circularCard}>
                  <AbstractIcon />
                  <Text style={styles.cardLabel} numberOfLines={2}>
                    {exercise.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Rutinas de 5 minutos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rutinas de 5 minutos</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
          {loading5Min ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#9333EA" />
              <Text style={styles.loadingText}>Cargando rutinas...</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {fiveMinuteRoutines.length > 0 ? (
                fiveMinuteRoutines.slice(0, 4).map((routine) => (
                  <TouchableOpacity key={routine.id} style={styles.squareCard}>
                    <AbstractIcon />
                    <Text style={styles.cardLabel} numberOfLines={2}>
                      {routine.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                // Fallback si no hay rutinas de 5 minutos
                [1, 2, 3, 4].map((item) => (
                  <View key={item} style={styles.squareCard}>
                    <AbstractIcon />
                    <Text style={styles.cardLabel}>Rutina {item}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>

        {/* Rutinas Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rutinas</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
          {routinesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#9333EA" />
              <Text style={styles.loadingText}>Cargando rutinas...</Text>
            </View>
          ) : routinesError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error al cargar rutinas</Text>
            </View>
          ) : (
            <View style={styles.rutinasList}>
              {routines.length > 0 ? (
                routines.slice(0, 2).map((routine) => (
                  <TouchableOpacity key={routine.id} style={styles.rutinaCard}>
                    <View style={styles.rutinaIcon}>
                      <AbstractIcon />
                    </View>
                    <View style={styles.rutinaContent}>
                      <Text style={styles.rutinaTitle}>{routine.name}</Text>
                      <Text style={styles.rutinaDescription} numberOfLines={2}>
                        {routine.description || 'Description duis aute irure dolor in reprehenderit in voluptate velit.'}
                      </Text>
                      <View style={styles.rutinaInfo}>
                        <View style={styles.plusIcon}>
                          <Text style={styles.plusText}>+</Text>
                        </View>
                        <Text style={styles.rutinaTime}>Today • 23 min</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.playButton}>
                      <Text style={styles.playIcon}>▶</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                // Fallback si no hay rutinas
                ['Rutina 1', 'Rutina 2'].map((rutina, index) => (
                  <View key={index} style={styles.rutinaCard}>
                    <View style={styles.rutinaIcon}>
                      <AbstractIcon />
                    </View>
                    <View style={styles.rutinaContent}>
                      <Text style={styles.rutinaTitle}>{rutina}</Text>
                      <Text style={styles.rutinaDescription}>
                        Description duis aute irure dolor in reprehenderit in voluptate velit.
                      </Text>
                      <View style={styles.rutinaInfo}>
                        <View style={styles.plusIcon}>
                          <Text style={styles.plusText}>+</Text>
                        </View>
                        <Text style={styles.rutinaTime}>Today • 23 min</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.playButton}>
                      <Text style={styles.playIcon}>▶</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* Diseña tu rutina Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.designCard}>
            <Text style={styles.designTitle}>Diseña tu rutina</Text>
            <Text style={styles.designSubtitle}>CREA TU PROPIA RUTINA</Text>
            <Text style={styles.designButton}>Ir</Text>
          </TouchableOpacity>
        </View>

        {/* More like Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>More like Rutinas para mejorar la dicción</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {exercises.slice(0, 4).map((exercise) => (
              <TouchableOpacity key={exercise.id} style={styles.squareCard}>
                <AbstractIcon />
                <Text style={styles.cardLabel} numberOfLines={2}>
                  {exercise.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.loremText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore...
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryIcon: {
    width: 20,
    height: 10,
    backgroundColor: '#10b981',
    borderRadius: 3,
    marginRight: 6,
  },
  wifiIcon: {
    width: 6,
    height: 6,
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  arrow: {
    fontSize: 24,
    color: '#6366f1',
    fontWeight: '600',
  },
  horizontalScroll: {
    marginBottom: 12,
  },
  circularCard: {
    width: 88,
    height: 88,
    backgroundColor: '#ffffff',
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  squareCard: {
    width: 104,
    height: 104,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  abstractIcon: {
    width: 36,
    height: 36,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triangle: {
    position: 'absolute',
    top: -5,
    left: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#6366f1',
  },
  square: {
    width: 14,
    height: 14,
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  gear: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearCenter: {
    width: 5,
    height: 5,
    backgroundColor: '#6366f1',
    borderRadius: 2.5,
  },
  rutinasList: {
    gap: 16,
  },
  rutinaCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  rutinaIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  rutinaContent: {
    flex: 1,
  },
  rutinaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  rutinaDescription: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  rutinaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  plusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  rutinaTime: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  playButton: {
    width: 40,
    height: 40,
    backgroundColor: '#6366f1',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  playIcon: {
    fontSize: 18,
    color: '#ffffff',
    marginLeft: 2,
  },
  designCard: {
    backgroundColor: '#6366f1',
    borderRadius: 24,
    padding: 28,
    position: 'relative',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  designTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  designSubtitle: {
    fontSize: 15,
    color: '#e0e7ff',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  designButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loremText: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginTop: 20,
    fontWeight: '400',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    fontWeight: '500',
  },
});


