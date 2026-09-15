const ALLOWED_KEYS = new Set([
  'gem_theme_preference',
  'gym_current_user',
  'gym_jwt_token',
  'gym_selected_branch',
]);

/**
 * Prune any unauthorized keys from localStorage to keep storage clean
 */
export function pruneLocalStorage(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !ALLOWED_KEYS.has(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (error) {
    console.warn('Error pruning localStorage:', error);
  }
}

// Run prune on load
pruneLocalStorage();

export function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    if (!ALLOWED_KEYS.has(key)) {
      return defaultValue;
    }
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving item "${key}" from localStorage:`, error);
    return defaultValue;
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  try {
    if (!ALLOWED_KEYS.has(key)) {
      console.warn(`Blocked attempt to write non-whitelisted key "${key}" to localStorage.`);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item "${key}" in localStorage:`, error);
  }
}

export function removeStoredItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item "${key}" from localStorage:`, error);
  }
}
