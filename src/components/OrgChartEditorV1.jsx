import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, List, ListItem, ListItemText, ListItemIcon, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { mockOrgChartData } from '../mock/data';

const OrgChartEditorV1 = () => {
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(mockOrgChartData)));
  const [selectedNodeId, setSelectedNodeId] = useState('director');
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
          label: deputy.title.en || `Deputy ${depIndex + 1}`,
          children: deputy.assistants.map((assistant, assIndex) => ({
            id: `assistant-${officeIndex}-${depIndex}-${assIndex}`,
            label: assistant.title.en || `Assistant ${assIndex + 1}`,
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

  // Add responsibility at specific index
  const addRespAt = (path, insertIndex) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      current.splice(insertIndex, 0, { en: '', tc: '', sc: '' });
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

  // Move responsibility up
  const moveRespUp = (path, index) => {
    if (index <= 0) return;
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      const temp = current[index - 1];
      current[index - 1] = current[index];
      current[index] = temp;
      return newData;
    });
  };

  // Move responsibility down
  const moveRespDown = (path, index) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      if (index >= current.length - 1) return prev;
      const temp = current[index + 1];
      current[index + 1] = current[index];
      current[index] = temp;
      return newData;
    });
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
          title: { en: '', tc: '', sc: '' },
          name: { en: '', tc: '', sc: '' },
          responsibilities: [],
          assistants: [],
        });
        setSelectedNodeId(`deputy-${officeIndex}-${newIndex}`);
      } else if (level === 'assistant') {
        const officeIndex = parentPath[1];
        const depIndex = parentPath[3];
        current.push({
          title: { en: '', tc: '', sc: '' },
          name: { en: '', tc: '', sc: '' },
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

  const moveNodeUp = (path) => {
    const index = path[path.length - 1];
    let parent = formData;
    const parentPathArr = path.slice(0, -1);
    for (const key of parentPathArr) {
      parent = parent[key];
    }
    if (index <= 0) return;
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let currentParent = newData;
      for (const key of parentPathArr) {
        currentParent = currentParent[key];
      }
      const temp = currentParent[index - 1];
      currentParent[index - 1] = currentParent[index];
      currentParent[index] = temp;
      return newData;
    });
    const newIndex = index - 1;
    let newId;
    if (path.length === 2) { // office
      newId = `office-${newIndex}`;
    } else if (path.length === 4) { // deputy
      newId = `deputy-${path[1]}-${newIndex}`;
    } else if (path.length === 6) { // assistant
      newId = `assistant-${path[1]}-${path[3]}-${newIndex}`;
    }
    setSelectedNodeId(newId);
  };

  const moveNodeDown = (path) => {
    const index = path[path.length - 1];
    let parent = formData;
    const parentPathArr = path.slice(0, -1);
    for (const key of parentPathArr) {
      parent = parent[key];
    }
    if (index >= parent.length - 1) return;
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let currentParent = newData;
      for (const key of parentPathArr) {
        currentParent = currentParent[key];
      }
      const temp = currentParent[index + 1];
      currentParent[index + 1] = currentParent[index];
      currentParent[index] = temp;
      return newData;
    });
    const newIndex = index + 1;
    let newId;
    if (path.length === 2) { // office
      newId = `office-${newIndex}`;
    } else if (path.length === 4) { // deputy
      newId = `deputy-${path[1]}-${newIndex}`;
    } else if (path.length === 6) { // assistant
      newId = `assistant-${path[1]}-${path[3]}-${newIndex}`;
    }
    setSelectedNodeId(newId);
  };

  const handleConfirm = () => {
    if (confirmCallback) confirmCallback();
    setConfirmOpen(false);
  };

  const handleCancel = () => setConfirmOpen(false);

  // Render edit form based on selected node
  const renderEditForm = () => {
    const { path, data } = findNodeById(selectedNodeId);
    const isDirector = selectedNodeId === 'director';
    const isOffice = selectedNodeId.startsWith('office-') && !selectedNodeId.includes('deputy');
    const isDeputy = selectedNodeId.startsWith('deputy-');
    const isAssistant = selectedNodeId.startsWith('assistant-');

    let canMoveUp = false;
    let canMoveDown = false;
    if (!isDirector) {
      const index = path[path.length - 1];
      let parentArray = formData;
      for (const key of path.slice(0, -1)) {
        parentArray = parentArray[key];
      }
      canMoveUp = index > 0;
      canMoveDown = index < parentArray.length - 1;
    }

    const respPath = [...path, 'responsibilities'];

    return (
      <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{isDirector ? 'Edit Director' : isOffice ? 'Edit Office' : isDeputy ? 'Edit Deputy' : 'Edit Assistant'}</Typography>

        {/* Office Name */}
        {isOffice && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={4}><TextField label="Title (EN)" fullWidth value={data.officeName.en || ''} onChange={(e) => handleChange(path, 'officeName', 'en', e.target.value)} /></Grid>
            <Grid size={4}><TextField label="Title (TC)" fullWidth value={data.officeName.tc || ''} onChange={(e) => handleChange(path, 'officeName', 'tc', e.target.value)} /></Grid>
            <Grid size={4}><TextField label="Title (SC)" fullWidth value={data.officeName.sc || ''} onChange={(e) => handleChange(path, 'officeName', 'sc', e.target.value)} /></Grid>
          </Grid>
        )}

        {/* Title/Branch Title */}
        {!isOffice && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={4}><TextField label="Title (EN)" fullWidth value={data.title.en || ''} onChange={(e) => handleChange(path, 'title', 'en', e.target.value)} /></Grid>
            <Grid size={4}><TextField label="Title (TC)" fullWidth value={data.title.tc || ''} onChange={(e) => handleChange(path, 'title', 'tc', e.target.value)} /></Grid>
            <Grid size={4}><TextField label="Title (SC)" fullWidth value={data.title.sc || ''} onChange={(e) => handleChange(path, 'title', 'sc', e.target.value)} /></Grid>
          </Grid>
        )}

        {/* Person Name (not for offices or director in tree label, but editable) */}
        {!isOffice && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={4}><TextField label="Name (EN)" fullWidth value={data.name?.en || ''} onChange={(e) => handleChange(path, 'name', 'en', e.target.value)} /></Grid>
            <Grid size={4}><TextField label="Name (TC)" fullWidth value={data.name?.tc || ''} onChange={(e) => handleChange(path, 'name', 'tc', e.target.value)} /></Grid>
            <Grid size={4}><TextField label="Name (SC)" fullWidth value={data.name?.sc || ''} onChange={(e) => handleChange(path, 'name', 'sc', e.target.value)} /></Grid>
          </Grid>
        )}

        {/* Responsibilities (for deputies and assistants) */}
        {(!isDirector && !isOffice) && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Responsibilities</Typography>
            <List disablePadding>
              {data.responsibilities.length === 0 ? (
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <IconButton onClick={() => addRespAt(respPath, 0)}><AddIcon /></IconButton>
                  </Box>
                </ListItem>
              ) : (
                data.responsibilities.map((resp, respIndex) => (
                  <ListItem key={respIndex}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <IconButton onClick={() => addRespAt(respPath, respIndex + 1)}><AddIcon /></IconButton>
                      <IconButton color="error" onClick={() => removeResponsibility(respPath, respIndex)}><RemoveIcon /></IconButton>
                      <IconButton disabled={respIndex === 0} onClick={() => moveRespUp(respPath, respIndex)}><ArrowUpwardIcon /></IconButton>
                      <IconButton disabled={respIndex === data.responsibilities.length - 1} onClick={() => moveRespDown(respPath, respIndex)}><ArrowDownwardIcon /></IconButton>
                    </Box>
                    <Grid container spacing={2} sx={{ flex: 1 }}>
                      <Grid size={4}>
                        <TextField
                          label="EN"
                          multiline
                          minRows={2}
                          fullWidth
                          value={resp.en}
                          onChange={(e) => handleRespChange(respPath, respIndex, 'en', e.target.value)}
                        />
                      </Grid>
                      <Grid size={4}>
                        <TextField
                          label="TC"
                          multiline
                          minRows={2}
                          fullWidth
                          value={resp.tc}
                          onChange={(e) => handleRespChange(respPath, respIndex, 'tc', e.target.value)}
                        />
                      </Grid>
                      <Grid size={4}>
                        <TextField
                          label="SC"
                          multiline
                          minRows={2}
                          fullWidth
                          value={resp.sc}
                          onChange={(e) => handleRespChange(respPath, respIndex, 'sc', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                ))
              )}
            </List>
          </>
        )}

        {/* Add/Remove buttons based on level */}
        <Box sx={{ mt: 2 }}>
          {!isDirector && (
            <>
              <Button variant="outlined" color="error" startIcon={<RemoveIcon />} onClick={() => removeNode(path)} sx={{ mr: 1 }}>Remove {isOffice ? 'Office' : isDeputy ? 'Deputy' : 'Assistant'}</Button>
              <Button variant="outlined" startIcon={<ArrowUpwardIcon />} onClick={() => moveNodeUp(path)} disabled={!canMoveUp} sx={{ mr: 1 }}>Move Up</Button>
              <Button variant="outlined" startIcon={<ArrowDownwardIcon />} onClick={() => moveNodeDown(path)} disabled={!canMoveDown} sx={{ mr: 1 }}>Move Down</Button>
            </>
          )}
          {isOffice && <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addNode('deputy', path.concat('deputies'))}>Add Deputy</Button>}
          {isDeputy && <Button variant="outlined" startIcon={<AddIcon />} onClick={() => addNode('assistant', path.concat('assistants'))}>Add Assistant</Button>}
        </Box>
      </Box>
    );
  };

  // Recursive component to render the hierarchy as nested lists
  const RenderHierarchy = ({ items, depth = 0 }) => (
    <List disablePadding sx={{ pl: depth }}>
      {items.map((item) => {
        const isUser = item.id === 'director' || item.id.startsWith('deputy-') || item.id.startsWith('assistant-');
        const isOffice = item.id.startsWith('office-');
        return (
          <React.Fragment key={item.id}>
            <ListItem
              button
              selected={selectedNodeId === item.id}
              onClick={() => setSelectedNodeId(item.id)}
              sx={{
                bgcolor: selectedNodeId === item.id ? 'action.selected' : 'inherit',
                cursor: 'pointer',
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                {isUser && <PersonIcon />}
                {isOffice && <BusinessIcon />}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
            {item.children && item.children.length > 0 && (
              <RenderHierarchy items={item.children} depth={4} />
            )}
          </React.Fragment>
        );
      })}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Hierarchy Sidebar */}
      <Box sx={{ width: 400, borderRight: '1px solid #e0e0e0', p: 2, overflowY: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Organisation Hierarchy</Typography>
        <RenderHierarchy items={treeData} />
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

export default OrgChartEditorV1;