import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import FolderOpenIcon from '@mui/icons-material/FolderOpen'; // Placeholder logo icon
import { AppContext } from '../context/AppContext';
import { Fade } from '@mui/material'; // For menu animation

const CustomAppBar = () => {
  const { currentUser } = useContext(AppContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" elevation={1}> {/* Sticky with subtle shadow */}
      <Toolbar>
        <FolderOpenIcon sx={{ mr: 1, color: 'white' }} /> {/* Branding icon */}
        <Typography variant="h6" sx={{ marginRight: 2, fontWeight: 'bold' }}>
          rWCMS
        </Typography>
        <Link to="/" style={{ color: 'white', marginRight: 16, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          Site Content
        </Link>
        <Link to="/workflow" style={{ color: 'white', marginRight: 16, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          Workflow
        </Link>
        <Link to="/system-permissions" style={{ color: 'white', marginRight: 16, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          System Permissions
        </Link>
        <Link to="/page-templates" style={{ color: 'white', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          Page Templates
        </Link>
        <Typography variant="body1" sx={{ marginLeft: 'auto' }}>
          {currentUser?.username || 'Guest'}
        </Typography>
        <IconButton color="inherit" onClick={handleClick} aria-label="user menu">
          <ArrowDropDown />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          TransitionComponent={Fade} // Subtle fade animation
        >
          <MenuItem>Profile</MenuItem>
          <MenuItem>Settings</MenuItem>
          <MenuItem>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;