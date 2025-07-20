import React from 'react';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  store_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAuthContext {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
}

// Create the context
export const AdminAuthContext = React.createContext<AdminAuthContext | null>(null);

// Hook to access the protected route context
export function useAdminAuth() {
  const context = React.useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth must be used within a ProtectedRoute');
  }

  return context;
}
