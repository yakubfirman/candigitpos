export type UserRole = 'admin' | 'super_admin' | 'kasir' | 'dapur';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    'admin': 'Administrator',
    'super_admin': 'Super Admin',
    'kasir': 'Kasir',
    'dapur': 'Dapur',
  };
  return labels[role];
}