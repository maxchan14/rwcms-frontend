import React, { useState, useContext } from 'react';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import AddIcon from '@mui/icons-material/Add'; // Icons for menu items
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import IconButton from '@mui/material/IconButton';
import { Grow } from '@mui/material'; // For menu animation
import { AppContext } from '../context/AppContext';

const CustomToolbar = ({ showDetails, toggleDetails }) => {
  const { currentUser, permissions } = useContext(AppContext);
  const [fileAnchorEl, setFileAnchorEl] = useState(null);
  const [viewAnchorEl, setViewAnchorEl] = useState(null);
  const [actionsAnchorEl, setActionsAnchorEl] = useState(null);

  // Find the #Workflow permissions object
  const workflowPerms = permissions.find((p) => p.path === '#Workflow')?.permissions || [];

  const isSiteAdmin = currentUser?.isSiteAdmin || false;

  const canCreateWorkflow = workflowPerms.includes('CreateWorkflows') || isSiteAdmin;
  const canAddToWorkflow = workflowPerms.includes('UpdateOwnWorkflows') || isSiteAdmin;

  const handleFileClick = (event) => setFileAnchorEl(event.currentTarget);
  const handleFileClose = () => setFileAnchorEl(null);

  const handleViewClick = (event) => setViewAnchorEl(event.currentTarget);
  const handleViewClose = () => setViewAnchorEl(null);

  const handleActionsClick = (event) => setActionsAnchorEl(event.currentTarget);
  const handleActionsClose = () => setActionsAnchorEl(null);

  return (
    <Toolbar variant="dense" sx={{ justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', mb: 2 }}> {/* Elevation and spacing */}
      <div>
        <Button endIcon={<ArrowDropDown />} onClick={handleFileClick}>File</Button>
        <Menu
          anchorEl={fileAnchorEl}
          open={Boolean(fileAnchorEl)}
          onClose={handleFileClose}
          TransitionComponent={Grow} // Grow animation
        >
          <MenuItem onClick={handleFileClose}><AddIcon sx={{ mr: 1 }} />New File</MenuItem>
          <MenuItem onClick={handleFileClose}><AddIcon sx={{ mr: 1 }} />New Folder</MenuItem>
          <MenuItem onClick={handleFileClose}>Mark as Delete</MenuItem>
          <MenuItem onClick={handleFileClose}>Download</MenuItem>
        </Menu>

        <Button endIcon={<ArrowDropDown />} onClick={handleViewClick}>View</Button>
        <Menu
          anchorEl={viewAnchorEl}
          open={Boolean(viewAnchorEl)}
          onClose={handleViewClose}
          TransitionComponent={Grow}
        >
          <MenuItem onClick={handleViewClose}><VisibilityIcon sx={{ mr: 1 }} />All Files</MenuItem>
          <MenuItem onClick={handleViewClose}><VisibilityIcon sx={{ mr: 1 }} />Modified Files</MenuItem>
          <MenuItem onClick={handleViewClose}><VisibilityIcon sx={{ mr: 1 }} />My Modified Files</MenuItem>
          <MenuItem onClick={handleViewClose}><VisibilityIcon sx={{ mr: 1 }} />Locked Files</MenuItem>
          <MenuItem onClick={handleViewClose}><VisibilityIcon sx={{ mr: 1 }} />My Locked Files</MenuItem>
          <MenuItem onClick={handleViewClose}><VisibilityIcon sx={{ mr: 1 }} />Show Deleted Files</MenuItem>
        </Menu>

        <Button endIcon={<ArrowDropDown />} onClick={handleActionsClick}>Actions</Button>
        <Menu
          anchorEl={actionsAnchorEl}
          open={Boolean(actionsAnchorEl)}
          onClose={handleActionsClose}
          TransitionComponent={Grow}
        >
          <MenuItem onClick={handleActionsClose}><LockOpenIcon sx={{ mr: 1 }} />Lock Files</MenuItem>
          <MenuItem onClick={handleActionsClose}><LockOpenIcon sx={{ mr: 1 }} />Unlock Files</MenuItem>
        </Menu>
      </div>
      <div>
        <Button variant="outlined" sx={{ mr: 1 }}>Import</Button>
        {canCreateWorkflow && <Button variant="outlined" sx={{ mr: 1 }}>Create Workflow</Button>}
        {canAddToWorkflow && <Button variant="outlined" sx={{ mr: 1 }}>Add to Workflow</Button>}
        <IconButton onClick={toggleDetails} color="inherit" aria-label="toggle details panel">
          {showDetails ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      </div>
    </Toolbar>
  );
};

export default CustomToolbar;