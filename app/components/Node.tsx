'use client';

import { useState } from 'react';
import { useTree } from '../context/TreeContext';
import { Node as NodeType } from '../types/node';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';
import { API_ENDPOINTS } from '../config/api';

interface NodeProps {
  node: NodeType;
  depth?: number;
}

export default function Node({ node, depth = 0 }: NodeProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(node.name);
  const [showAddInput, setShowAddInput] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    show: false,
    message: '',
    type: 'info'
  });
  const [nameError, setNameError] = useState<string>('');
  const { fetchTree } = useTree();

  function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    setToast({ show: true, message, type });
  }

  function validateName(name: string): boolean {
    const trimmedName = name.trim();
    
    
    if (!trimmedName || trimmedName.length === 0) {
      const errorMessage = name.length > 0 && !trimmedName 
        ? 'Name cannot contain only spaces' 
        : 'Name cannot be empty';
      setNameError(errorMessage);
      showToast(errorMessage, 'error');
      return false;
    }
    
     
    if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters long');
      showToast('Name must be at least 2 characters long', 'error');
      return false;
    }
    
     if (!/^[a-zA-Z0-9\s\-_\.]+$/.test(trimmedName)) {
      setNameError('Name contains invalid characters');
      showToast('Name contains invalid characters', 'error');
      return false;
    }
    
    setNameError('');
    return true;
  }

  async function addChild() {
    if (!validateName(newName)) return;
    
    try {
      const res = await fetch(API_ENDPOINTS.NODES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), parent: node._id }),
      });
      if (!res.ok) throw new Error('Failed to add child');
      setNewName('');
      setShowAddInput(false);
      setNameError('');
      showToast('Child node added successfully', 'success');
      fetchTree();
    } catch (err) {
      showToast('Error: ' + (err as Error).message, 'error');
    }
  }

  function toggleAddInput() {
    setShowAddInput(!showAddInput);
    if (!showAddInput) {
      // Clear the input when showing it
      setNewName('');
      setNameError('');
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`${API_ENDPOINTS.NODES}/${node._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      showToast('Node deleted successfully', 'success');
      fetchTree();
    } catch (err) {
      showToast('Error: ' + (err as Error).message, 'error');
    }
    setShowDeleteDialog(false);
  }

  async function handleEdit() {
    if (!validateName(editName)) {
      return;
    }
    
    try {
      const res = await fetch(`${API_ENDPOINTS.NODES}/${node._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setIsEditing(false);
      setNameError('');
      showToast('Node updated successfully', 'success');
      fetchTree();
    } catch (err) {
      showToast('Error: ' + (err as Error).message, 'error');
    }
  }

  function handleEditCancel() {
    setIsEditing(false);
    setEditName(node.name);
    setNameError('');
  }

  return (
    <li className="ml-4">
      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
            >
              {node.children && node.children.length > 0 ? (
  <span className="text-xl">
    {expanded ? '▾' : '▸'}
  </span>
) : (
  <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
)}
            </button>
            
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      setNameError('');
                    }}
                    onBlur={handleEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEdit();
                      if (e.key === 'Escape') handleEditCancel();
                    }}
                    className={`px-2 py-1 border rounded focus:outline-none focus:ring-1 w-full ${
                      nameError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    autoFocus
                  />
                  {nameError && (
                    <p className="text-xs text-red-600 mt-1">{nameError}</p>
                  )}
                </div>
                <button
                  onClick={handleEditCancel}
                  className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none"
                  title="Cancel edit"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span 
                  className="text-gray-800 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  {node.name}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-6 h-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                  title="Edit node name"
                >
                  <span className="material-icons text-sm">edit_note</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={toggleAddInput}
              className="w-8 h-8 text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center"
              title="Add child node"
            >
              <span className="material-icons text-xl">add</span>
            </button>
            <button 
              onClick={() => setShowDeleteDialog(true)}
              className="w-8 h-8 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center"
              title="Delete node"
            >
              <span className="material-icons text-xl">delete</span>
            </button>
          </div>
        </div>

        {showAddInput && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewName(e.target.value);
                  setNameError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addChild();
                  if (e.key === 'Escape') toggleAddInput();
                }}
                placeholder="Enter child node name"
                className={`flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 ${
                  nameError 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                autoFocus
              />
              <button
                onClick={addChild}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                Add
              </button>
              <button
                onClick={toggleAddInput}
                className="px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
            {nameError && (
              <p className="text-xs text-red-600 ml-3">{nameError}</p>
            )}
          </div>
        )}
      </div>

      {expanded && node.children && node.children.length > 0 && (
        <ul className="mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
          {node.children.map((child: NodeType) => (
            <Node key={child._id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}

      {/* Custom Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Node"
        message={`Are you sure you want to delete "${node.name}" and all its children? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Toast Notifications */}
      <Toast
        isOpen={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </li>
  );
}