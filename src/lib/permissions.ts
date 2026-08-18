import type { LangCode } from "../data/types";
import type { User } from "../context/AppContext";

export type Role = "guest" | "user" | "admin";

// Derive role from a user object
export function getRole(user: User | null): Role {
  if (!user) return "guest";
  if (user.isAdmin) return "admin";
  if (user.id === "guest") return "guest";
  return "user";
}

export interface Capabilities {
  // learning
  canAccessLearningPath: boolean;
  canPostInCommunity: boolean;
  // A1 courses always open; higher levels need a real account
  canAccessCourseLevel: (level: string) => boolean;
  // admin
  canManageUsers: boolean;
  // account lifecycle
  canDeleteOwnAccount: boolean;
}

export function getCapabilities(role: Role): Capabilities {
  switch (role) {
    case "admin":
      return {
        canAccessLearningPath: true,
        canPostInCommunity: true,
        canAccessCourseLevel: () => true,
        canManageUsers: true,
        canDeleteOwnAccount: false, // admin protected
      };
    case "user":
      return {
        canAccessLearningPath: true,
        canPostInCommunity: true,
        canAccessCourseLevel: () => true,
        canManageUsers: false,
        canDeleteOwnAccount: true,
      };
    case "guest":
    default:
      return {
        canAccessLearningPath: false,
        canPostInCommunity: false,
        // guest can only access A1 (entry level) courses
        canAccessCourseLevel: (level) => level === "A1",
        canManageUsers: false,
        canDeleteOwnAccount: false, // guest protected
      };
  }
}

export function capsFor(user: User | null): Capabilities {
  return getCapabilities(getRole(user));
}

export const ROLE_LABELS: Record<Role, string> = {
  guest: "游客",
  user: "普通用户",
  admin: "管理员",
};

// Languages the guest is allowed to peek at
export const GUEST_LANGS: LangCode[] = ["en", "ja", "ko"];
