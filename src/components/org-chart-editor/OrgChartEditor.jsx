import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import HierarchySidebar from './HierarchySidebar';
import EditFormPanel from './EditFormPanel';
import ConfirmationDialog from './ConfirmationDialog';
import { mockOrgChartData } from '../../mock/data'; // Adjust path as needed
import { findNodeById, handleChange, addNode, removeNode, moveNodeUp, moveNodeDown } from './orgChartUtils';

const OrgChartEditor = () => {
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(mockOrgChartData)));
  const [selectedNodeId, setSelectedNodeId] = useState('director');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);

  const handleConfirm = () => {
    if (confirmCallback) confirmCallback();
    setConfirmOpen(false);
  };

  const handleCancel = () => setConfirmOpen(false);

  // Handlers now use utils
  const onAddNode = (level, parentPath) => addNode(formData, setFormData, setSelectedNodeId, level, parentPath);
  const onRemoveNode = (path) => {
    setConfirmMessage('Are you sure you want to remove this item? This action cannot be undone.');
    setConfirmCallback(() => () => removeNode(formData, setFormData, setSelectedNodeId, path));
    setConfirmOpen(true);
  };
  const onMoveNodeUp = (path) => moveNodeUp(formData, setFormData, setSelectedNodeId, path);
  const onMoveNodeDown = (path) => moveNodeDown(formData, setFormData, setSelectedNodeId, path);
  const onHandleChange = (path, field, lang, value) => handleChange(formData, setFormData, path, field, lang, value);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <HierarchySidebar
        formData={formData}
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
      />
      <Box sx={{ flex: 1, p: 2 }}>
        {selectedNodeId ? (
          <EditFormPanel
            selectedNodeId={selectedNodeId}
            formData={formData}
            setFormData={setFormData}
            onHandleChange={onHandleChange}
            onAddNode={onAddNode}
            onRemoveNode={onRemoveNode}
            onMoveNodeUp={onMoveNodeUp}
            onMoveNodeDown={onMoveNodeDown}
          />
        ) : (
          <Typography>Select a node to edit</Typography>
        )}
      </Box>
      <ConfirmationDialog
        open={confirmOpen}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Box>
  );
};

export default OrgChartEditor;