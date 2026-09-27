import type { AuthUser, LoginRequestDto, RegisterRequestDto } from "../../types/auth";
import apiClient from "../client";

function normalizeAuthUser(u: Record<string, unknown>): AuthUser | null {
  const _id = (u._id ?? u.id) as unknown;
  if (!(typeof _id === 'string' || typeof _id === 'number')) return null;
  if (
    typeof u.phone !== 'string' ||
    typeof u.firstName !== 'string' ||
    typeof u.lastName !== 'string' ||
    typeof u.role !== 'string'
  ) {
    return null;
  }
  const modeluser = u.modeluser;
  if (
    modeluser !== 'therapist' &&
    modeluser !== 'patient' &&
    modeluser !== 'admin' &&
    modeluser !== 'secretary'
  ) {
    return null;
  }
  return { ...(u as unknown as AuthUser), _id } as AuthUser;
}

function extractUser(payload: unknown): AuthUser | null {
  if (payload && typeof payload === 'object') {
    const u = normalizeAuthUser(payload as Record<string, unknown>);
    if (u) return u;
  }
  if (!payload || typeof payload !== 'object') return null;
  const anyP = payload as Record<string, unknown>;
  const direct = anyP.user;
  if (direct && typeof direct === 'object') {
    const u = normalizeAuthUser(direct as Record<string, unknown>);
    if (u) return u;
  }
  const nested = (anyP.data as unknown) ?? null;
  if (nested && typeof nested === 'object') {
    const u = normalizeAuthUser(nested as Record<string, unknown>);
    if (u) return u;
  }
  return null;
}

export async function register(data: RegisterRequestDto): Promise<void> {
  await apiClient.post('/auth/admin/register', data);
}



export async function login(data: LoginRequestDto): Promise<AuthUser> {

  
  
  const res = await apiClient.post('/auth/admin/login', {
    phone: data.phone,
    password: data.password,
  });
  

  const fromLogin = extractUser(res.data);
  if (fromLogin) return fromLogin;
  return me();
}

/** POST /auth/therapist/logout */
export async function logout(): Promise<void> {
  try {
      await apiClient.post('/auth/admin/logout');
  } catch (error) {
      window.location.replace("/login")
    throw error
    
  }


}

/** POST /auth/therapist/refresh */
export async function refresh(): Promise<void> {
  await apiClient.post('/auth/admin/refresh');
}

/** GET /auth/therapist/me */
export async function me(): Promise<AuthUser> {
  const res = await apiClient.get<AuthUser>('/auth/admin/me');
  const u = res.data as unknown as Record<string, unknown>;
  const normalized = normalizeAuthUser(u);
  if (normalized) return normalized;
  // last resort: trust backend shape
  return res.data;
}