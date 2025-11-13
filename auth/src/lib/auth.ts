// Reusable RBAC helpers that can be used by both
// the NestJS backend and the Angular frontend.

import { Role } from '@turbovets-task-manager/data';

export interface AuthenticatedUserContext {
  userId: string;
  organizationId: string;
  role: Role;
}

/**
 * Role hierarchy:
 * OWNER > ADMIN > VIEWER
 */

export function isOwner(role: Role): boolean {
  return role === Role.OWNER;
}

export function isAdmin(role: Role): boolean {
  return role === Role.ADMIN;
}

export function isViewer(role: Role): boolean {
  return role === Role.VIEWER;
}

export function isAdminOrAbove(role: Role): boolean {
  return role === Role.OWNER || role === Role.ADMIN;
}

/**
 * Permissions
 */

export function canManageTasks(role: Role): boolean {
  return isAdminOrAbove(role);
}

export function canViewTasks(_role: Role): boolean {
  // All roles can view tasks.
  return true;
}

export function canViewAuditLogs(role: Role): boolean {
  // Only owner/admin should see audit logs.
  return isAdminOrAbove(role);
}

export function canManageUsers(role: Role): boolean {
  // Owner + Admin can manage org members.
  return isAdminOrAbove(role);
}

/**
 * This object references all functions so that strict
 * TypeScript settings (noUnusedLocals, etc.) don't mark
 * them as unused during library compilation, even if
 * no other project imports them yet.
 */
export const __authPermissionFns = {
  isOwner,
  isAdmin,
  isViewer,
  isAdminOrAbove,
  canManageTasks,
  canViewTasks,
  canViewAuditLogs,
  canManageUsers,
};
