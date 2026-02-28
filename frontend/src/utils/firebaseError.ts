interface FirebaseLikeError {
  code?: string;
  message?: string;
}

export function getFirebaseAuthErrorMessage(error: unknown, fallback: string): string {
  const firebaseError = error as FirebaseLikeError;
  const code = firebaseError?.code;

  if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
    return 'Credencial inválida no Firebase. Verifique email/senha e confirme se Email/Password está habilitado em Firebase Authentication.';
  }

  if (code === 'auth/unauthorized-domain') {
    return 'Domínio não autorizado no Firebase. Adicione seu domínio em Authentication > Settings > Authorized domains.';
  }

  if (code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'Email ou senha inválidos.';
  }

  return firebaseError?.message || fallback;
}
