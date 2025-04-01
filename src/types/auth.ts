export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthError {
  message: string;
  code?: string;
}