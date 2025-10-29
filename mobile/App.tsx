/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View, Text, Pressable } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import Home from './src/screens/Home';
import Excercises from './src/screens/Excercises';
import Settings from './src/screens/Settings';
import Login from './src/screens/Login';
import { AuthProvider, useAuth } from './src/context/authContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AuthProvider>
        <AppContentOrLogin />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppContentOrLogin() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Login />;
  }
  return <AppContent />;
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [tab, setTab] = React.useState<'Home' | 'Excercises' | 'Settings'>('Home');

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {tab === 'Home' && <Home />}
        {tab === 'Excercises' && <Excercises />}
        {tab === 'Settings' && <Settings />}
      </View>

      <View
        style={[
          styles.tabBar,
          { paddingBottom: safeAreaInsets.bottom ? safeAreaInsets.bottom : 8 },
        ]}
      >
        <TabButton label="Home" active={tab === 'Home'} onPress={() => setTab('Home')} />
        <TabButton
          label="Excercises"
          active={tab === 'Excercises'}
          onPress={() => setTab('Excercises')}
        />
        <TabButton
          label="Settings"
          active={tab === 'Settings'}
          onPress={() => setTab('Settings')}
        />
      </View>
    </View>
  );
}

type TabButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function TabButton({ label, active, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        active ? styles.tabButtonActive : null,
        pressed ? styles.tabButtonPressed : null,
      ]}
    >
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f2f2f2',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d0d0d0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
  },
  tabButtonPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#000000',
    fontWeight: '700',
  },
});

export default App;
