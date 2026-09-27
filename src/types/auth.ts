
export type AdminRole = "internalManager"|"admin"|"secretary"

export interface LoginFormData {
  phone: string;
  password: string;
  role: AdminRole;
  rememberMe: boolean;
}

export interface AuthUser {
  /** Primary user id used across frontend code. */
  _id: string | number;
  /** Backward-compat for some endpoints (optional). */
  id?: string | number;
  // مطابق بک‌اند: نوع مدل کاربر
  modeluser: 'admin' 

  // مطابق بک‌اند: نقش (برای درمانگر نقش حرفه‌ای مثل OT/SLP/...)
  role: AdminRole | string;

  firstName: string;
  lastName: string;
  phone: string;

  username?: string;
}

export type LoginRequestDto = {
  phone: string;
  password: string;
};

// برای فرم ثبت‌نام (منطبق با RegisterRequestDto بک‌اند)
export interface RegisterRequestDto {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
}

// فرم ثبت‌نام در فرانت (فیلدهای کمکی فقط برای UI)
export interface RegisterFormData extends RegisterRequestDto {
  confirmPassword: string;
  acceptTerms: boolean;
}
