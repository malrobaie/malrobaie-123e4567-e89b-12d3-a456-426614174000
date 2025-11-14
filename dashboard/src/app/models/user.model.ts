import { Role } from '@turbovets-task-manager/data';

export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  role: Role;
  organizationId: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

