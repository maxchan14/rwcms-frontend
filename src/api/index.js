import {
  mockItemDetails,
  mockVersions,
  mockAuditLogs,
} from '../mock/data';

const API_BASE = 'https://10.77.142.67:7137/';

const cache = new Map();  // For completed fetches
const pending = new Map();  // For in-flight promises
const TTL_MS = 10000;  // 10 seconds

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now >= entry.expiresAt) {
      cache.delete(key);
    }
  }
}, 60000);  // Every 60 seconds, clear expired cache

export const getItems = async (path = '/') => {
  let normalizedPath = path.replace(/\/+/g, '/');
  if (normalizedPath !== '/' && !normalizedPath.endsWith('/')) {
    normalizedPath += '/';
  }
  const key = normalizedPath;  // Use as cache key (with trailing '/')

  const entry = cache.get(key);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  } else if (entry) {
    // Expired: Clean up proactively
    cache.delete(key);
  }

  if (pending.has(key)) {
    return pending.get(key);
  }

  const promise = fetch(`${API_BASE}api/v1/items?path=${encodeURIComponent(normalizedPath)}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      cache.set(key, {
        data,
        expiresAt: Date.now() + TTL_MS,
      });
      pending.delete(key);
      return data;
    })
    .catch((error) => {
      pending.delete(key);
      console.error(error);
      return [];
    });

  pending.set(key, promise);
  return promise;
};

export const getItemDetails = async (itemId) => {
  // For now, keep as mock; no single item API provided
  return new Promise((resolve) => setTimeout(() => resolve(mockItemDetails), 500));
};

export const getVersions = async (itemId) => {
  return new Promise((resolve) => setTimeout(() => resolve(mockVersions), 500));
};

export const getAuditLogs = async (itemId) => {
  return new Promise((resolve) => setTimeout(() => resolve(mockAuditLogs), 500));
};

export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE}api/v1/users/current-user`);
    if (!response.ok) {
      throw new Error(`Failed to fetch current user: ${response.statusText}`);
    }
    const data = await response.json();
    return data; // Return full user object
  } catch (error) {
    console.error(error);
    return { username: 'Guest', isSiteAdmin: false }; // Fallback with isSiteAdmin
  }
};

export const getCurrentPermissions = async () => {
  try {
    const response = await fetch(`${API_BASE}api/v1/users/current-user-permissions`);
    if (!response.ok) {
      throw new Error(`Failed to fetch current user permissions: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(error);
    return []; // Fallback empty array if fetch fails
  }
};