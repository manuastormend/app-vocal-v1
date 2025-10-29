import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/authContext';
import { passwordUtils } from '../lib/password';

export default function Login() {
  const { signIn, signUp, loading } = useAuth();
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [passwordErrors, setPasswordErrors] = React.useState<string[]>([]);

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (!isLogin && text) {
      const validation = passwordUtils.validatePasswordStrength(text);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setPasswordErrors([]);
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }
        const validation = passwordUtils.validatePasswordStrength(password);
        if (!validation.isValid) {
          setPasswordErrors(validation.errors);
          return;
        }
        await signUp(email.trim(), password);
        setError('Usuario registrado exitosamente. Ya puedes iniciar sesión.');
        setIsLogin(true);
      }
    } catch (e: any) {
      setError(e?.message || 'Error en la autenticación');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={handlePasswordChange}
        style={styles.input}
      />

      {!isLogin && (
        <TextInput
          placeholder="Confirmar contraseña"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />
      )}

      {!isLogin && passwordErrors.length > 0 && (
        <View style={styles.passwordErrors}>
          {passwordErrors.map((msg) => (
            <Text key={msg} style={styles.passwordError}>
              • {msg}
            </Text>
          ))}
        </View>
      )}

      <Pressable onPress={handleSubmit} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonLabel}>{isLogin ? 'Entrar' : 'Registrarme'}</Text>
        )}
      </Pressable>

      <Pressable onPress={() => setIsLogin((v) => !v)} style={styles.linkBtn}>
        <Text style={styles.linkText}>
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  error: {
    color: '#b00020',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#c9c9c9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  passwordErrors: {
    marginBottom: 12,
  },
  passwordError: {
    color: '#b00020',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});


