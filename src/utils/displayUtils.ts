// Utility functions for displaying user and business unit information

/**
 * Formats a user's full name from first and last name
 * @param user - User object with first_name and last_name
 * @returns Formatted full name or fallback text
 */
export const formatUserName = (user?: {
  first_name?: string;
  last_name?: string;
  email?: string;
}): string => {
  if (!user) return "Not assigned";

  const firstName = user.first_name?.trim();
  const lastName = user.last_name?.trim();

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else if (user.email) {
    return user.email;
  }

  return "Unknown User";
};

/**
 * Formats a user's name with email for detailed display
 * @param user - User object with first_name, last_name, and email
 * @returns Formatted name with email
 */
export const formatUserNameWithEmail = (user?: {
  first_name?: string;
  last_name?: string;
  email?: string;
}): string => {
  if (!user) return "Not assigned";

  const name = formatUserName(user);
  if (user.email && name !== user.email) {
    return `${name} (${user.email})`;
  }

  return name;
};

/**
 * Gets user initials for avatar display
 * @param user - User object with first_name and last_name
 * @returns User initials (max 2 characters)
 */
export const getUserInitials = (user?: {
  first_name?: string;
  last_name?: string;
  email?: string;
}): string => {
  if (!user) return "NA";

  const firstName = user.first_name?.trim();
  const lastName = user.last_name?.trim();

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  } else if (lastName) {
    return lastName.substring(0, 2).toUpperCase();
  } else if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }

  return "??";
};

/**
 * Formats business unit name with code
 * @param businessUnit - Business unit object with name and code
 * @returns Formatted business unit display name
 */
export const formatBusinessUnitName = (businessUnit?: {
  name?: string;
  code?: string;
}): string => {
  if (!businessUnit) return "Not assigned";

  const name = businessUnit.name?.trim();
  const code = businessUnit.code?.trim();

  if (name && code) {
    return `${name} (${code})`;
  } else if (name) {
    return name;
  } else if (code) {
    return code;
  }

  return "Unknown Business Unit";
};

/**
 * Formats a list of users as a comma-separated string
 * @param users - Array of user objects
 * @param maxDisplay - Maximum number of users to display before showing "and X more"
 * @returns Formatted user list string
 */
export const formatUserList = (
  users?: Array<{
    first_name?: string;
    last_name?: string;
    email?: string;
  }>,
  maxDisplay: number = 3
): string => {
  if (!users || users.length === 0) return "No users assigned";

  const userNames = users.map(formatUserName);

  if (userNames.length <= maxDisplay) {
    return userNames.join(", ");
  }

  const displayNames = userNames.slice(0, maxDisplay);
  const remaining = userNames.length - maxDisplay;

  return `${displayNames.join(", ")} and ${remaining} more`;
};

/**
 * Gets a user's display name for various contexts
 * @param user - User object
 * @param context - Display context ('full', 'short', 'email')
 * @returns Formatted name based on context
 */
export const getUserDisplayName = (
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  },
  context: 'full' | 'short' | 'email' = 'full'
): string => {
  if (!user) return "Not assigned";

  switch (context) {
    case 'full':
      return formatUserNameWithEmail(user);
    case 'short':
      return formatUserName(user);
    case 'email':
      return user.email || formatUserName(user);
    default:
      return formatUserName(user);
  }
};

/**
 * Generates a random color for user avatars based on user ID or name
 * @param identifier - User ID or name for consistent color generation
 * @returns CSS color class or hex color
 */
export const getUserAvatarColor = (identifier?: string): string => {
  if (!identifier) return 'bg-gray-500';

  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];

  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Checks if a user object has valid name information
 * @param user - User object to validate
 * @returns True if user has first_name, last_name, or email
 */
export const hasValidUserInfo = (user?: {
  first_name?: string;
  last_name?: string;
  email?: string;
}): boolean => {
  if (!user) return false;

  return !!(
    user.first_name?.trim() ||
    user.last_name?.trim() ||
    user.email?.trim()
  );
};

/**
 * Formats user role for display
 * @param role - User role string
 * @returns Formatted role name
 */
export const formatUserRole = (role?: string): string => {
  if (!role) return "No role assigned";

  // Convert snake_case or kebab-case to Title Case
  return role
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Creates a user mention string for comments or notifications
 * @param user - User object
 * @returns Mention string (e.g., "@John Smith")
 */
export const createUserMention = (user?: {
  first_name?: string;
  last_name?: string;
  email?: string;
}): string => {
  if (!user) return "@unknown";

  const name = formatUserName(user);
  return `@${name}`;
};

/**
 * Formats file size in bytes to human readable format
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  if (!dateString) return 'Unknown date';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Formats a date and time string
 * @param dateString - ISO date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'Unknown date';

  try {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Gets relative time string (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  if (!dateString) return 'Unknown time';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    return 'Invalid date';
  }
};
