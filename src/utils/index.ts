import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { UserRole, RiskLevel, FindingSeverity, AuditStatus } from "../types";

// Class name utility
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Date utilities
export const formatDate = (
  date: string | Date,
  formatStr: string = "MMM dd, yyyy",
) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, formatStr) : "Invalid Date";
};

export const formatDateTime = (date: string | Date) => {
  return formatDate(date, "MMM dd, yyyy HH:mm");
};

export const formatRelativeTime = (date: string | Date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isValid(dateObj)
    ? formatDistanceToNow(dateObj, { addSuffix: true })
    : "Invalid Date";
};

export const isDateOverdue = (date: string | Date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isValid(dateObj) && dateObj < new Date();
};

// String utilities
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

export const generateCode = (prefix: string = "", length: number = 6) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// User role utilities
export const getUserRoleLabel = (role: UserRole): string => {
  const roleLabels: Record<UserRole, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    cro: "Chief Risk Officer",
    supervisor_auditor: "Supervisor Auditor",
    auditor: "Auditor",
    reviewer: "Reviewer",
    viewer: "Viewer",
    business_unit_manager: "Business Unit Manager",
    business_unit_user: "Business Unit User",
  };
  return roleLabels[role] || role;
};

export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    super_admin: "bg-purple-100 text-purple-800",
    admin: "bg-blue-100 text-blue-800",
    cro: "bg-indigo-100 text-indigo-800",
    supervisor_auditor: "bg-green-100 text-green-800",
    auditor: "bg-yellow-100 text-yellow-800",
    reviewer: "bg-orange-100 text-orange-800",
    viewer: "bg-gray-100 text-gray-800",
    business_unit_manager: "bg-teal-100 text-teal-800",
    business_unit_user: "bg-cyan-100 text-cyan-800",
  };
  return roleColors[role] || "bg-gray-100 text-gray-800";
};

// Status utilities
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Audit statuses
    draft: "bg-gray-100 text-gray-800",
    planning: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    testing: "bg-orange-100 text-orange-800",
    reporting: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",

    // Finding statuses
    open: "bg-red-100 text-red-800",
    finding_in_progress: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
    deferred: "bg-purple-100 text-purple-800",

    // Control effectiveness
    not_tested: "bg-gray-100 text-gray-800",
    effective: "bg-green-100 text-green-800",
    partially_effective: "bg-yellow-100 text-yellow-800",
    ineffective: "bg-red-100 text-red-800",

    // Risk statuses
    identified: "bg-blue-100 text-blue-800",
    assessed: "bg-yellow-100 text-yellow-800",
    mitigated: "bg-green-100 text-green-800",
    accepted: "bg-gray-100 text-gray-800",
    transferred: "bg-purple-100 text-purple-800",

    // Approval statuses
    pending_approval: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    revision_required: "bg-orange-100 text-orange-800",
  };

  return statusColors[status] || "bg-gray-100 text-gray-800";
};

export const getSeverityColor = (
  severity: FindingSeverity | RiskLevel,
): string => {
  const severityColors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };
  return severityColors[severity] || "bg-gray-100 text-gray-800";
};

// Risk calculation utilities
export const calculateRiskScore = (
  probability: number,
  impact: number,
): number => {
  return probability * impact;
};

export const getRiskLevel = (score: number): RiskLevel => {
  if (score <= 6) return "low";
  if (score <= 12) return "medium";
  if (score <= 20) return "high";
  return "critical";
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  return imageExtensions.includes(getFileExtension(filename).toLowerCase());
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// Array utilities
export const groupBy = <T, K extends keyof any>(
  list: T[],
  getKey: (item: T) => K,
) => {
  return list.reduce(
    (previous, currentItem) => {
      const group = getKey(currentItem);
      if (!previous[group]) previous[group] = [];
      previous[group].push(currentItem);
      return previous;
    },
    {} as Record<K, T[]>,
  );
};

export const sortBy = <T>(
  array: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc",
) => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T, K>(array: T[], getKey: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = getKey(item);
    return seen.has(key) ? false : seen.add(key);
  });
};

// Number utilities
export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (num: number, decimals: number = 1): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100);
};

// URL utilities
export const createQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v.toString()));
      } else {
        searchParams.set(key, value.toString());
      }
    }
  });

  return searchParams.toString();
};

// Local storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to remove from localStorage:", error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  },
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Deep copy utility
export const deepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Color utilities for charts
export const getChartColors = (count: number): string[] => {
  const colors = [
    "#3B82F6", // blue
    "#10B981", // emerald
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // violet
    "#06B6D4", // cyan
    "#84CC16", // lime
    "#F97316", // orange
    "#EC4899", // pink
    "#6B7280", // gray
  ];

  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

// Export constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];
