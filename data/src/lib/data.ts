// Shared domain models for API + Dashboard

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Organization {
  id: string;
  name: string;
  /**
   * Optional parent for multi-org hierarchy (e.g. parent company).
   * Null or undefined means "root" organization.
   */
  parentId?: string | null;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
}

/**
 * Simple status enum for tasks.
 * You can expand this later (e.g. BLOCKED, ARCHIVED).
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;

  assigneeUserId?: string | null;
  createdByUserId: string;

  // ISO-8601 strings (e.g. new Date().toISOString())
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  userId: string;

  action: string;
  entityType: string;
  entityId: string;
  details?: string | null;

  createdAt: string; // ISO-8601
}
