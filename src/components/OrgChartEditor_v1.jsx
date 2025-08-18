import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, List, ListItem, ListItemText, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { mockOrgChartData } from '../mock/data';

const OrgChartEditor_v1 = () => {
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(mockOrgChartData)));
  const [selectedNodeId, setSelectedNodeId] = useState('director');
  const [expandedItems, setExpandedItems] = useState(['director']);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);

  // Build tree structure dynamically from formData
  const buildTree = () => {
    return [
      {
        id: 'director',
        label: formData.director.title.en || 'Director',
        children: [],
      },
      ...formData.offices.map((office, officeIndex) => ({
        id: `office-${officeIndex}`,
        label: office.officeName.en || `Office ${officeIndex + 1}`,
        children: office.deputies.map((deputy, depIndex) => ({
          id: `deputy-${officeIndex}-${depIndex}`,
          label: deputy.branchTitle.en || `Deputy ${depIndex + 1}`,
          children: deputy.assistants.map((assistant, assIndex) => ({
            id: `assistant-${officeIndex}-${depIndex}-${assIndex}`,
            label: assistant.branchTitle.en || `Assistant ${assIndex + 1}`,
            children: [],
          })),
        })),
      })),
    ];
  };

  const treeData = buildTree();

  // Find node data and path by id
  const findNodeById = (id) => {
    if (id === 'director') return { path: ['director'], data: formData.director };

    const [, officeIndexStr, depIndexStr, assIndexStr] = id.split('-');
    const officeIndex = parseInt(officeIndexStr, 10);

    if (!depIndexStr) return { path: ['offices', officeIndex], data: formData.offices[officeIndex] };

    const depIndex = parseInt(depIndexStr, 10);
    if (!assIndexStr) return { path: ['offices', officeIndex, 'deputies', depIndex], data: formData.offices[officeIndex].deputies[depIndex] };

    const assIndex = parseInt(assIndexStr, 10);
    return { path: ['offices', officeIndex, 'deputies', depIndex, 'assistants', assIndex], data: formData.offices[officeIndex].deputies[depIndex].assistants[assIndex] };
  };

  // Update field by path
  const handleChange = (path, field, lang, value) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]][field][lang] = value;
      return newData;
    });
  };

  // Update responsibility by path
  const handleRespChange = (path, respIndex, lang, value) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      current[respIndex][lang] = value;
      return newData;
    });
  };

  // Add responsibility
  const addResponsibility = (path) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      current.push({ en: '', tc: '', sc: '' });
      return newData;
    });
  };

  // Remove responsibility with confirmation
  const removeResponsibility = (path, respIndex) => {
    setConfirmMessage('Are you sure you want to remove this responsibility?');
    setConfirmCallback(() => () => {
      setFormData((prev) => {
        const newData = JSON.parse(JSON.stringify(prev));
        let current = newData;
        for (const key of path) {
          current = current[key];
        }
        current.splice(respIndex, 1);
        return newData;
      });
    });
    setConfirmOpen(true);
  };

  // Add node at level
  const addNode = (level, parentPath) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of parentPath) {
        current = current[key];
      }
      const newIndex = current.length;
      if (level === 'office') {
        current.push({
          officeName: { en: '', tc: '', sc: '' },
          deputies: [],
        });
        setSelectedNodeId(`office-${newIndex}`);
      } else if (level === 'deputy') {
        const officeIndex = parentPath[1];
        current.push({
          branchTitle: { en: '', tc: '', sc: '' },
          personName: { en: '', tc: '', sc: '' },
          responsibilities: [],
          assistants: [],
        });
        setSelectedNodeId(`deputy-${officeIndex}-${newIndex}`);
      } else if (level === 'assistant') {
        const officeIndex = parentPath[1];
        const depIndex = parentPath[3];
        current.push({
          branchTitle: { en: '', tc: '', sc: '' },
          personName: { en: '', tc: '', sc: '' },
          responsibilities: [],
        });
        setSelectedNodeId(`assistant-${officeIndex}-${depIndex}-${newIndex}`);
      }
      return newData;
    });
  };

  // Remove node with confirmation
  const removeNode = (path) => {
    setConfirmMessage('Are you sure you want to remove this item? This action cannot be undone.');
    setConfirmCallback(() => () => {
      setFormData((prev) => {
        const newData = JSON.parse(JSON.stringify(prev));
        let current = newData;
        for (let i = 0; i < path.length - 2; i++) { // Go to parent array
          current = current[path[i]];
        }
        const arrayKey = path[path.length - 2];
        const index = path[path.length - 1];
        current[arrayKey].splice(index, 1);
        return newData;
      });
      setSelectedNodeId('director'); // Reset selection
    });
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (confirmCallback) confirmCallback();
    setConfirmOpen(false);
  };

  const handleCancel = () => setConfirmOpen(false);

  // Render tree recursively
  const renderTree = (nodes) => nodes.map((node) => (
    <TreeItem key={node.id} itemId={node.id} label={node.label}>
      {node.children && renderTree(node.children)}
    </TreeItem>
  ));

  // Render edit form based on selected node
  const renderEditForm = () => {
    const { path, data } = findNodeById(selectedNodeId);
    const isDirector = selectedNodeId === 'director';
    const isOffice = selectedNodeId.startsWith('office-') && !selectedNodeId.includes('deputy');
    const isDeputy = selectedNodeId.startsWith('deputy-');
    const isAssistant = selectedNodeId.startsWith('assistant-');

    return (
      <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{isDirector ? 'Edit Director' : isOffice ? 'Edit Office' : isDeputy ? 'Edit Deputy' : 'Edit Assistant'}</Typography>

        {/* Title/Office Name/Branch Title */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={4}><TextField label="EN" fullWidth value={(isDirector ? data.title.en : isOffice ? data.officeName.en : data.branchTitle.en) || ''} onChange={(e) => handleChange(path, isDirector ? 'title' : isOffice ? 'officeName' : 'branchTitle', 'en', e.target.value)} /></Grid>
          <Grid size={4}><TextField label="TC" fullWidth value={(isDirector ? data.title.tc : isOffice ? data.officeName.tc : data.branchTitle.tc) || ''} onChange={(e) => handleChange(path, isDirector ? 'title' : isOffice ? 'officeName' : 'branchTitle', 'tc', e.target.value)} /></Grid>
          <Grid size={4}><TextField label="SC" fullWidth value={(isDirector ? data.title.sc : isOffice ? data.officeName.sc : data.branchTitle.sc) || ''} onChange={(e) => handleChange(path, isDirector ? 'title' : isOffice ? 'officeName' : 'branchTitle', 'sc', e.target.value)} /></Grid>
        </Grid>

        {/* Person Name (not for offices or director in tree label, but editable) */}
        {!isOffice && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={4}><TextField label="Person Name (EN)" fullWidth value={data.name?.en || data.personName?.en || ''} onChange={(e) => handleChange(path, isDirector ? 'name' : 'personName', 'en', e.target.value)} /></Grid>
            <Grid size={4}><TextField label="Person Name (TC)" fullWidth value={data.name?.tc || data.personName?.tc || ''} onChange={(e) => handleChange(path, isDirector ? 'name' : 'personName', 'tc', e.target.value)} /></Grid>
            <Grid size={4}><TextField label="Person Name (SC)" fullWidth value={data.name?.sc || data.personName?.sc || ''} onChange={(e) => handleChange(path, isDirector ? 'name' : 'personName', 'sc', e.target.value)} /></Grid>
          </Grid>
        )}

        {/* Responsibilities (for deputies and assistants) */}
        {(!isDirector && !isOffice) && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Responsibilities</Typography>
            <List>
              {data.responsibilities.map((resp, respIndex) => (
                <ListItem key={respIndex} secondaryAction={<IconButton edge="end" color="error" onClick={() => removeResponsibility([...path, 'responsibilities'], respIndex)}><RemoveIcon /></IconButton>}>
                  <Grid container spacing={2}>
                    <Grid size={4}><TextField multiline fullWidth value={resp.en} onChange={(e) => handleRespChange([...path, 'responsibilities'], respIndex, 'en', e.target.value)} /></Grid>
                    <Grid size={4}><TextField multiline fullWidth value={resp.tc} onChange={(e) => handleRespChange([...path, 'responsibilities'], respIndex, 'tc', e.target.value)} /></Grid>
                    <Grid size={4}><TextField multiline fullWidth value={resp.sc} onChange={(e) => handleRespChange([...path, 'responsibilities'], respIndex, 'sc', e.target.value)} /></Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
            <Button startIcon={<AddIcon />} onClick={() => addResponsibility([...path, 'responsibilities'])}>Add Responsibility</Button>
          </>
        )}

        {/* Add/Remove buttons based on level */}
        <Box sx={{ mt: 2 }}>
          {!isDirector && <Button variant="outlined" color="error" startIcon={<RemoveIcon />} onClick={() => removeNode(path)} sx={{ mr: 1 }}>Remove {isOffice ? 'Office' : isDeputy ? 'Deputy' : 'Assistant'}</Button>}
          {isOffice && <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addNode('deputy', path.concat('deputies'))}>Add Deputy</Button>}
          {isDeputy && <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addNode('assistant', path.concat('assistants'))}>Add Assistant</Button>}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Tree View Sidebar */}
      <Box sx={{ width: 300, borderRight: '1px solid #e0e0e0', p: 2, overflowY: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Organisation Hierarchy</Typography>
        <SimpleTreeView
          expandedItems={expandedItems}
          onExpandedItemsChange={(event, itemIds) => setExpandedItems(itemIds)}
          selectedItems={selectedNodeId}
          onSelectedItemsChange={(event, itemId) => setSelectedNodeId(itemId)}
          slots={{ expandIcon: ChevronRightIcon, collapseIcon: ExpandMoreIcon }}
        >
          {renderTree(treeData)}
        </SimpleTreeView>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addNode('office', ['offices'])}>Add Office</Button>
        </Box>
      </Box>

      {/* Edit Panel */}
      <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
        {selectedNodeId ? renderEditForm() : <Typography>Select a node to edit</Typography>}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent><DialogContentText>{confirmMessage}</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} color="error">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrgChartEditor_v1;