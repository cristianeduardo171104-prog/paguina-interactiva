import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, CheckCircle2, AlertCircle, Sparkles, Eye, EyeOff, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
}

interface StoredAccount {
  username: string;
  name?: string;
  passwordHash: string;
  registeredAt: string;
}

const STORAGE_USERS_KEY = 'particles_app_users';
const STORAGE_CURRENT_USER = 'particles_current_user';

const safeHash = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(str);
  }
};

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  // Check if there are already registered users to decide default tab
  const [mode, setMode] = useState<'register' | 'login'>('register');
  
  // Registration Form State
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Notifications / Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_USERS_KEY);
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If accounts exist, start at register if requested, or user can toggle
          setMode('register');
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanUsername = regUsername.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (regPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      const users: StoredAccount[] = stored ? JSON.parse(stored) : [];

      // Check if username is already taken
      if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
        setError(`El usuario "${cleanUsername}" ya está registrado. Elige otro o inicia sesión.`);
        return;
      }

      // Save new user (safe base64 encoding for client-side storage)
      const newUser: StoredAccount = {
        username: cleanUsername,
        name: regName.trim() || cleanUsername,
        passwordHash: safeHash(regPassword),
        registeredAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

      // Feedback and transition to login
      setSuccessMsg(`¡Registro exitoso para "${cleanUsername}"! Ahora inicia sesión.`);
      setLoginUsername(cleanUsername);
      setLoginPassword('');
      setRegPassword('');
      setRegConfirmPassword('');
      setMode('login');
    } catch {
      setError('Error al guardar el usuario en el navegador.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanUsername = loginUsername.trim().toLowerCase();
    if (!cleanUsername || !loginPassword) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      const users: StoredAccount[] = stored ? JSON.parse(stored) : [];

      const account = users.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername &&
          (u.passwordHash === safeHash(loginPassword) || u.passwordHash === btoa(loginPassword))
      );

      if (!account) {
        setError('Usuario o contraseña incorrectos. Verifica tus datos o regístrate.');
        return;
      }

      const activeUser: User = {
        username: account.username,
        name: account.name || account.username,
        registeredAt: account.registeredAt,
      };

      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(activeUser));
      onLoginSuccess(activeUser);
    } catch {
      setError('Error al procesar el inicio de sesión.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xl">
      <div className="relative w-full max-w-md bg-neutral-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-white">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-3 shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
            Partículas 3D con Gestos
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Regístrate primero y luego inicia sesión con tus credenciales para acceder al simulador 3D.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-neutral-950/70 p-1 mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            1. Registrarse
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            2. Iniciar Sesión
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Nombre de Usuario
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  required
                  placeholder="Ej: cristian17"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-950/80 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-white placeholder-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Nombre Completo o Apodo (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Cristian Eduardo"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-950/80 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-white placeholder-neutral-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-sm bg-neutral-950/80 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-white placeholder-neutral-500"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  placeholder="Repite tu contraseña"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-950/80 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-white placeholder-neutral-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Registrar Cuenta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Usuario Registrado
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  required
                  placeholder="Tu usuario"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-950/80 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-white placeholder-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="Tu contraseña registrada"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-sm bg-neutral-950/80 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-white placeholder-neutral-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Iniciar Sesión</span>
              <LogIn className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer tip */}
        <div className="mt-5 text-center text-[11px] text-neutral-400">
          {mode === 'register' ? (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                Inicia sesión aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Aún no te has registrado?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                Crea tu cuenta primero
              </button>
            </p>
          )}
        </div>

        {/* Guest Access Option */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => {
              const guestUser: User = {
                username: 'invitado',
                name: 'Invitado',
                registeredAt: new Date().toISOString(),
              };
              try {
                localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(guestUser));
              } catch {
                // ignore
              }
              onLoginSuccess(guestUser);
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Continuar como Invitado (Sin Registro)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
