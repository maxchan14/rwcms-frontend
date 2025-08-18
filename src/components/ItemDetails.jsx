import React, { useEffect, useState, useContext } from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import { getVersions, getAuditLogs } from '../api';
import { AppContext } from '../context/AppContext';
import { Box, Chip } from '@mui/material'; // Removed Fade to fix runtime error

const ItemDetails = () => {
  const { selectedItem, selectedFolder } = useContext(AppContext);
  const [details, setDetails] = useState({});
  const [versions, setVersions] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedItem) {
        // Item selected: use item details
        setDetails(selectedItem);
        const ver = await getVersions(selectedItem.id);
        const log = await getAuditLogs(selectedItem.id);
        setVersions(ver);
        setLogs(log);
      } else if (selectedFolder) {
        // No item, but folder: use folder details and audit logs
        setDetails({
          ...selectedFolder,
          type: 'folder',
          size: '-',
          modifiedBy: 'System', // Placeholder; can fetch if needed
          modifiedDate: 'Jul 30, 2025', // Updated to current date
          status: 'Folder',
        });
        setVersions([]); // No versions for folders
        const log = await getAuditLogs(selectedFolder.id); // Assume API supports folder IDs
        setLogs(log);
      } else {
        // Nothing selected: clear
        setDetails({});
        setVersions([]);
        setLogs([]);
      }
    };
    fetchData();
  }, [selectedItem, selectedFolder]);

  if (!details.name) return null; // Hide if no details

  const getIcon = (type) => {
    if (type === 'folder') return <FolderIcon fontSize="large" />;
    if (type === 'image') return <ImageIcon fontSize="large" />;
    if (type === 'description') return <DescriptionIcon fontSize="large" />;
    return <InsertDriveFile fontSize="large" />;
  };

  const getStatusColor = (status) => {
    if (status === 'Locked') return 'error';
    if (status === 'Published') return 'success';
    return 'default';
  };

  return (
    <Box sx={{ p: 2, backgroundColor: 'background.paper', boxShadow: 1, height: '100%', overflowY: 'auto' }}> {/* Card-like panel, no Fade, added overflowY for long content */}
      <Typography variant="h5" sx={{ mb: 2 }}>Details</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Preview</Typography>
      {getIcon(details.type)}
      <Typography color="text.secondary">(Preview not available)</Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Properties</Typography>
      <List disablePadding>
        <ListItem>
          <ListItemText primary="Name" secondary={details.name} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Size" secondary={details.size} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Modified" secondary={`${details.modifiedBy} • ${details.modifiedDate}`} />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Status" 
            secondary={<Chip label={details.status} color={getStatusColor(details.status)} size="small" />} 
            secondaryTypographyProps={{ component: 'div' }} // Fix for <div> in <p>
          />
          {details.status === 'Locked' && <LockIcon color="error" sx={{ ml: 1 }} />}
        </ListItem>
      </List>
      {details.type !== 'folder' && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Versions</Typography>
          <List disablePadding>
            {versions.map((v, index) => (
              <ListItem key={index}>
                <ListItemText primary={`${v.version} (${v.type})`} />
                <IconButton aria-label="download version"><DownloadIcon /></IconButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Audit Log</Typography>
      <List disablePadding>
        {logs.map((log, index) => (
          <ListItem key={index}>
            <ListItemText primary={log.event} secondary={log.timestamp} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ItemDetails;