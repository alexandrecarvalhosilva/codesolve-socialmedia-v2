import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { JWTPayload, Permission, ROLE_PERMISSIONS } from '../types/index.js';
import { UserRole } from '@prisma/client';

// ============================================================================
// PASSWORD HASHING
// ============================================================================

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// JWT TOKENS
// ============================================================================

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenExpiration(): Date {
  const expiresIn = env.JWT_EXPIRES_IN;
  const now = new Date();
  
  // Parse expiration string (e.g., '7d', '24h', '60m')
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    // Default to 7 days
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000);
    case 's':
      return new Date(now.getTime() + value * 1000);
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}

// ============================================================================
// PERMISSIONS
// ============================================================================

export function getUserPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = getUserPermissions(role);
  
  // SuperAdmin with system:full has all permissions
  if (permissions.includes('system:full')) {
    return true;
  }
  
  return permissions.includes(permission);
}

export function hasAnyPermission(role: UserRole, requiredPermissions: Permission[]): boolean {
  const permissions = getUserPermissions(role);
  
  // SuperAdmin with system:full has all permissions
  if (permissions.includes('system:full')) {
    return true;
  }
  
  return requiredPermissions.some(p => permissions.includes(p));
}

export function hasAllPermissions(role: UserRole, requiredPermissions: Permission[]): boolean {
  const permissions = getUserPermissions(role);
  
  // SuperAdmin with system:full has all permissions
  if (permissions.includes('system:full')) {
    return true;
  }
  
  return requiredPermissions.every(p => permissions.includes(p));
}

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 4,
  admin: 3,
  operador: 2,
  visualizador: 1,
};

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] || 0;
}

export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole);
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'superadmin';
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'superadmin';
}

// ============================================================================
// TENANT ACCESS
// ============================================================================

export function canAccessTenant(userRole: UserRole, userTenantId: string | null, targetTenantId: string): boolean {
  // SuperAdmin can access any tenant
  if (userRole === 'superadmin') {
    return true;
  }
  
  // Other users can only access their own tenant
  return userTenantId === targetTenantId;
}

export function canManageTenant(userRole: UserRole): boolean {
  return userRole === 'superadmin';
}
