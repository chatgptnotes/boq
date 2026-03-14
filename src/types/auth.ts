export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

export interface AuthState {
  error: string | null
  loading: boolean
}
