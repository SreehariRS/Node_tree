'use client';

import { useEffect, useState } from 'react';
import Node from './components/Node';
import { useTree } from './context/TreeContext';
import { Node as NodeType } from './types/node';
import Toast from './components/Toast';
import { API_ENDPOINTS } from './config/api';

export default function Home() {
  const { roots, fetchTree, loading } = useTree();
  const [newRootName, setNewRootName] = useState<string>('');
  const [showAddRootInput, setShowAddRootInput] = useState<boolean>(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    show: false,
    message: '',
    type: 'info'
  });
  const [nameError, setNameError] = useState<string>('');

  useEffect(() => {
    fetchTree();
  }, []);

  function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    setToast({ show: true, message, type });
  }

  function validateName(name: string): boolean {
    const trimmedName = name.trim();
    
    // Check if name is empty or contains only spaces
    if (!trimmedName || trimmedName.length === 0) {
      const errorMessage = name.length > 0 && !trimmedName 
        ? 'Name cannot contain only spaces' 
        : 'Name cannot be empty';
      setNameError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
    
    // Check minimum length
    if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters long');
      showToast('Name must be at least 2 characters long', 'error');
      return false;
    }
    
    // Check for valid characters
    if (!/^[a-zA-Z0-9\s\-_\.]+$/.test(trimmedName)) {
      setNameError('Name contains invalid characters');
      showToast('Name contains invalid characters', 'error');
      return false;
    }
    
    setNameError('');
    return true;
  }

  async function addRoot() {
    if (!validateName(newRootName)) return;
    
    try {
      const res = await fetch(API_ENDPOINTS.NODES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRootName.trim() }),
      });
      if (!res.ok) throw new Error('Failed to add root');
      setNewRootName('');
      setShowAddRootInput(false);
      setNameError('');
      showToast('Root node added successfully', 'success');
      fetchTree();
    } catch (err) {
      showToast('Error: ' + (err as Error).message, 'error');
    }
  }

  function toggleAddRootInput() {
    setShowAddRootInput(!showAddRootInput);
    if (!showAddRootInput) {
      // Clear the input when showing it
      setNewRootName('');
      setNameError('');
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Node Tree Manager</h1>
          <p className="text-gray-600">Create and manage your hierarchical node structure</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {!showAddRootInput ? (
            <div className="flex justify-center">
              <button 
                onClick={toggleAddRootInput}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
              >
                <span>+</span>
                Add Root Node
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newRootName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setNewRootName(e.target.value);
                    setNameError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addRoot();
                    if (e.key === 'Escape') toggleAddRootInput();
                  }}
                  placeholder="Enter root node name"
                  className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    nameError 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  autoFocus
                />
                <button 
                  onClick={addRoot}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Add
                </button>
                <button 
                  onClick={toggleAddRootInput}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
              {nameError && (
                <p className="text-sm text-red-600 ml-3">{nameError}</p>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading tree structure...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tree Structure</h2>
            {roots.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No nodes yet. Create your first root node!</p>
            ) : (
              <ul className="space-y-2">
                {roots.map((root: NodeType) => (
                  <Node key={root._id} node={root} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <Toast
        isOpen={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </main>
  );
}