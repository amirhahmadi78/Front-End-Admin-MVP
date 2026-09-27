import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import type { AuthUser, LoginFormData } from '../types/auth';


import { adminAuth } from '../api/auth/auth';
import { AlertSwal } from '../utils/errorSwal';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  function is401(err: unknown): boolean {
    return axios.isAxiosError(err) && err.response?.status === 401;
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        try {
          const u = await adminAuth.me();
          if (alive) setUser(u);
          return;
        } catch (err) {
          if (is401(err)) {
            try {
              await adminAuth.refresh();
              const u = await adminAuth.me();
              if (alive) setUser(u);
              return;
            } catch {
              // fall through to patient
            }
          }
        }

       

        if (alive) setUser(null);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
     const handler = () => {
    // اگر در صفحه لاگین هستیم، sessionExpired رو true نکن
    if (window.location.pathname === '/login') {
      return;
    }
    setSessionExpired(true);
  };
    window.addEventListener('auth:session-expired', handler as EventListener);
    return () => {
      window.removeEventListener('auth:session-expired', handler as EventListener);
    };
  }, []);



  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isAuthenticated: user?.firstName && user._id ? true : false,
      isLoading,
      login: async (data:LoginFormData) => {try {
         const u = await adminAuth.login({ phone: data.phone, password: data.password })
        setUser(u);
        return u;
      } catch (error) {
        AlertSwal.backEndError(error,"ورود نا موفق!")
        throw error
      }
       
      },
      logout: async () => {
        try {
        await adminAuth.logout();
       
        } finally {
          setUser(null);
        }
      },
    };
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {sessionExpired && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999,
            direction: 'rtl',
          }}
        >
          <div
            style={{
              width: 'min(520px, calc(100vw - 32px))',
              background: '#fff',
              borderRadius: 14,
              padding: 18,
              boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>نشست شما منقضی شد</div>
            <div style={{ marginTop: 8, fontSize: 14, color: '#374151', lineHeight: 1.8 }}>
              برای ادامه، لطفاً دوباره وارد شوید.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start', marginTop: 14 }}>
              <button
                type="button"
                onClick={() => {
                  setSessionExpired(false);
                  window.location.href = '/login';
                }}
                style={{
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 14px',
                  cursor: 'pointer',
                }}
              >
                ورود مجدد
              </button>
              <button
                type="button"
                onClick={() => setSessionExpired(false)}
                style={{
                  background: '#fff',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: '10px 14px',
                  cursor: 'pointer',
                }}
              >
                بعداً
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
