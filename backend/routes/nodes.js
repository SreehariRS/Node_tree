const express = require('express');
const Node = require('../models/Node');

const router = express.Router();

async function buildTree() {
  try {
    const nodes = await Node.find();
    const nodeMap = new Map();
    nodes.forEach(n => nodeMap.set(n._id.toString(), { ...n.toObject(), children: [] }));

    nodeMap.forEach(node => {
      if (node.parent) {
        const parent = nodeMap.get(node.parent.toString());
        if (parent) parent.children.push(node);
      }
    });

    return Array.from(nodeMap.values()).filter(n => !n.parent);
  } catch (err) {
    throw new Error('Error building tree: ' + err.message);
  }
}

// delete 
async function deleteNodeAndChildren(id) {
  try {
    const toDelete = [id];
    const queue = [id];
    while (queue.length) {
      const current = queue.shift();
      const children = await Node.find({ parent: current });
      children.forEach(child => {
        toDelete.push(child._id);
        queue.push(child._id);
      });
    }
    await Node.deleteMany({ _id: { $in: toDelete } });
  } catch (err) {
    throw new Error('Error deleting node: ' + err.message);
  }
}

 router.get('/tree', async (req, res) => {
  try {
    const tree = await buildTree();
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Create 
router.post('/nodes', async (req, res) => {
  try {
    const { name, parent } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: name && !name.trim() ? 'Name cannot contain only spaces' : 'Name is required' 
      });
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }
    
    const node = new Node({ name: trimmedName, parent: parent || null });
    await node.save();
    res.status(201).json(node);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update  
router.put('/nodes/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: name && !name.trim() ? 'Name cannot contain only spaces' : 'Name is required' 
      });
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }
    
    const node = await Node.findByIdAndUpdate(
      req.params.id,
      { name: trimmedName },
      { new: true }
    );
    
    if (!node) return res.status(404).json({ error: 'Node not found' });
    
    res.json(node);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE 
router.delete('/nodes/:id', async (req, res) => {
  try {
    await deleteNodeAndChildren(req.params.id);
    res.json({ message: 'Node deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;