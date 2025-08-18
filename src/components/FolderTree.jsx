import React, { useState, useContext, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import { getItems } from '../api';
import { AppContext } from '../context/AppContext';
import { Box } from '@mui/material';

const FolderTree = () => {
  const [folders, setFolders] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);
  const { selectedFolder, setSelectedFolder, pathError, setPathError } = useContext(AppContext);

  // Fetch folders for a given path
  const fetchFolders = async (path) => {
    const data = await getItems(path);
    const newFolders = data
      .filter((item) => item.isFolder)
      .map((item) => ({
        id: item.itemId.toString(), // Ensure ID is a string
        name: item.name,
        path: item.path.endsWith('/') ? item.path : `${item.path}/`, // Ensure ends with '/'
        children: [],
        isLoaded: false,
      }));
    return newFolders;
  };

  // Update tree with new children
  const updateTree = (nodes, targetId, updates) => {
    return nodes.map((node) => {
      if (node.id === targetId) {
        return { ...node, ...updates };
      }
      if (node.children.length > 0) {
        return {
          ...node,
          children: updateTree(node.children, targetId, updates),
        };
      }
      return node;
    });
  };

  // Expand folders to a target path
  const expandToPath = async (targetPath) => {
    setPathError(false);

    if (!targetPath || targetPath === '/') {
      if (folders.length === 0) {
        const data = await fetchFolders('/');
        setFolders(data);
      }
      setExpandedItems([]);
      setSelectedFolder(null);
      return true;
    }

    const levels = targetPath.split('/').filter((p) => p);
    let currentPath = '';  // Start without leading /
    let root = folders.length ? JSON.parse(JSON.stringify(folders)) : await fetchFolders('/');
    let current = root;
    let expandIds = [];
    let lastValidNode = null;

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      currentPath = currentPath ? `${currentPath}/${level}` : level;
      const nodePath = `/${currentPath}/`;  // Add leading / and trailing /

      const nodeIndex = current.findIndex((n) => n.name === level);
      if (nodeIndex === -1) {
        setPathError(true);
        return false; // Path invalid
      }

      const node = current[nodeIndex];
      expandIds.push(node.id);
      lastValidNode = node;

      // Load children if not loaded (for all levels, including the last)
      if (!node.isLoaded) {
        const newChildren = await fetchFolders(nodePath);
        current[nodeIndex] = {
          ...current[nodeIndex],
          children: newChildren,
          isLoaded: true,
        };
      }

      current = current[nodeIndex].children;
    }

    // Update state after successful path traversal (single setFolders call)
    setFolders(root);
    setExpandedItems(expandIds);

    // Set the selected folder to the deepest node
    if (lastValidNode) {
      const newSelected = { id: lastValidNode.id, name: lastValidNode.name, path: lastValidNode.path };
      if (
        !selectedFolder ||
        selectedFolder.id !== newSelected.id ||
        selectedFolder.name !== newSelected.name ||
        selectedFolder.path !== newSelected.path
      ) {
        setSelectedFolder(newSelected);
      }
    }

    return true; // Success
  };

  // Find node by ID
  const findNode = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const child = findNode(node.children, id);
      if (child) return child;
    }
    return null;
  };

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      const data = await fetchFolders('/');
      setFolders(data);
    };
    init();
  }, []);

  // React to selectedFolder changes
  useEffect(() => {
    if (selectedFolder?.path) {  // Trigger for all changes, not just path jumps
      const handleExpansion = async () => {
        const prevSelected = selectedFolder;
        const success = await expandToPath(selectedFolder.path);
        if (!success) {
          setPathError(true);
          setSelectedFolder(prevSelected); // Revert on failure
        }
      };
      handleExpansion();
    }
  }, [selectedFolder]);

  // Handle folder selection
  const handleSelect = (event, itemId) => {
    const node = findNode(folders, itemId); // Use string itemId directly
    if (node && node.id !== selectedFolder?.id) {
      setSelectedFolder({ id: node.id, name: node.name, path: node.path });
    }
  };

  // Handle folder expansion
  const handleExpand = async (event, itemIds) => {
    setExpandedItems(itemIds);
    const newIds = itemIds.filter((id) => !expandedItems.includes(id));
    for (const newId of newIds) {
      const node = findNode(folders, newId);
      if (node && !node.isLoaded) {
        const newChildren = await fetchFolders(node.path);
        setFolders((prev) => updateTree(prev, node.id, { children: newChildren, isLoaded: true }));
      }
    }
  };

  // Render tree nodes
  const renderTree = (node) => (
    <TreeItem
      key={node.id}
      itemId={node.id}
      label={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FolderIcon sx={{ marginRight: 1 }} />
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{node.name}</Typography>
        </div>
      }
      sx={{ transition: 'background-color 0.2s ease' }}
    >
      {node.children.map(renderTree)}
      {!node.isLoaded && node.children.length === 0 && (
        <TreeItem itemId={`placeholder-${node.id}`} label="" sx={{ display: 'none' }} />
      )}
    </TreeItem>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, backgroundColor: 'background.paper', borderRight: '1px solid #e0e0e0', height: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Folders</Typography>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <SimpleTreeView
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpand}
          selectedItems={selectedFolder?.id ?? null}
          onSelectedItemsChange={handleSelect}
          slots={{
            expandIcon: ChevronRightIcon,
            collapseIcon: ExpandMoreIcon,
          }}
          sx={{ transition: 'all 0.3s ease' }}
        >
          {folders.map(renderTree)}
        </SimpleTreeView>
      </Box>
    </Box>
  );
};

export default FolderTree;