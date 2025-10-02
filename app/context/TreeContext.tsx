'use client';

import { createContext, useContext, useState } from 'react';
import { Node } from '../types/node';
import { API_ENDPOINTS } from '../config/api';

interface TreeContextType {
  roots: Node[];
  fetchTree: () => Promise<void>;
  loading: boolean;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export function TreeProvider({ children }: { children: React.ReactNode }) {
  const [roots, setRoots] = useState<Node[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchTree() {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.TREE);
      if (!res.ok) throw new Error('Failed to fetch tree');
      const data: Node[] = await res.json();
      setRoots(data);
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TreeContext.Provider value={{ roots, fetchTree, loading }}>
      {children}
    </TreeContext.Provider>
  );
}

export function useTree() {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
}