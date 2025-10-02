export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  TREE: `${API_BASE_URL}/api/tree`,
  NODES: `${API_BASE_URL}/api/nodes`,
} as const;
