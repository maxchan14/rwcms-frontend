import React from 'react';
import { Box, Typography, Grid, Button, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ResponsibilitiesEditor from './ResponsibilitiesEditor';
import { findNodeById } from './orgChartUtils';

const EditFormPanel = ({ selectedNodeId, formData, setFormData, onHandleChange, onAddNode, onRemoveNode, onMoveNodeUp, onMoveNodeDown }) => {
  const { path, data } = findNodeById(selectedNodeId, formData);
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

  return (
    <Box sx={{ p: 2, backgroundColor: 'white', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {isDirector ? 'Edit Director' : isOffice ? 'Edit Office' : isDeputy ? 'Edit Deputy' : 'Edit Assistant'}
      </Typography>

      {/* Office Name */}
      {isOffice && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={4}><TextField label="Title (EN)" fullWidth value={data.officeName.en || ''} onChange={(e) => onHandleChange(path, 'officeName', 'en', e.target.value)} /></Grid>
          <Grid size={4}><TextField label="Title (TC)" fullWidth value={data.officeName.tc || ''} onChange={(e) => onHandleChange(path, 'officeName', 'tc', e.target.value)} /></Grid>
          <Grid size={4}><TextField label="Title (SC)" fullWidth value={data.officeName.sc || ''} onChange={(e) => onHandleChange(path, 'officeName', 'sc', e.target.value)} /></Grid>
        </Grid>
      )}

      {/* Title/Branch Title */}
      {!isOffice && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={4}><TextField label="Title (EN)" fullWidth value={data.title.en || ''} onChange={(e) => onHandleChange(path, 'title', 'en', e.target.value)} /></Grid>
          <Grid size={4}><TextField label="Title (TC)" fullWidth value={data.title.tc || ''} onChange={(e) => onHandleChange(path, 'title', 'tc', e.target.value)} /></Grid>
          <Grid size={4}><TextField label="Title (SC)" fullWidth value={data.title.sc || ''} onChange={(e) => onHandleChange(path, 'title', 'sc', e.target.value)} /></Grid>
        </Grid>
      )}

      {/* Person Name */}
      {!isOffice && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={4}><TextField label="Name (EN)" fullWidth value={data.name?.en || ''} onChange={(e) => onHandleChange(path, 'name', 'en', e.target.value)} /></Grid>
          <Grid size={4}><TextField label="Name (TC)" fullWidth value={data.name?.tc || ''} onChange={(e) => onHandleChange(path, 'name', 'tc', e.target.value)} /></Grid>
          <Grid size={4}><TextField label="Name (SC)" fullWidth value={data.name?.sc || ''} onChange={(e) => onHandleChange(path, 'name', 'sc', e.target.value)} /></Grid>
        </Grid>
      )}

      {/* Responsibilities */}
      {(!isDirector && !isOffice) && (
        <ResponsibilitiesEditor
          data={data}
          path={path}
          onHandleChange={onHandleChange}
          setFormData={setFormData}
        />
      )}

      {/* Actions */}
      <Box sx={{ mt: 2 }}>
        {!isDirector && (
          <>
            <Button variant="outlined" color="error" startIcon={<RemoveIcon />} onClick={() => onRemoveNode(path)} sx={{ mr: 1 }}>Remove</Button>
            <Button variant="outlined" startIcon={<ArrowUpwardIcon />} onClick={() => onMoveNodeUp(path)} disabled={!canMoveUp} sx={{ mr: 1 }}>Up</Button>
            <Button variant="outlined" startIcon={<ArrowDownwardIcon />} onClick={() => onMoveNodeDown(path)} disabled={!canMoveDown} sx={{ mr: 1 }}>Down</Button>
          </>
        )}
        {isDirector && <Button variant="outlined" startIcon={<AddIcon />} onClick={() => onAddNode('office', ['offices'])}>Add Office</Button>}
        {isOffice && <Button variant="outlined" startIcon={<AddIcon />} onClick={() => onAddNode('deputy', path.concat('deputies'))}>Add Deputy</Button>}
        {isDeputy && <Button variant="outlined" startIcon={<AddIcon />} onClick={() => onAddNode('assistant', path.concat('assistants'))}>Add Assistant</Button>}
      </Box>
    </Box>
  );
};

export default EditFormPanel;