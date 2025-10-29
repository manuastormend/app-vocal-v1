import bcrypt from 'bcryptjs';

export const passwordUtils = {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  },

  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Debe tener al menos 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Debe incluir una mayúscula');
    if (!/[a-z]/.test(password)) errors.push('Debe incluir una minúscula');
    if (!/\d/.test(password)) errors.push('Debe incluir un número');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Debe incluir un símbolo');
    return { isValid: errors.length === 0, errors };
  },
};


