import React, { useContext, useState, useEffect, useRef } from 'react';
import CustomAppBar from '../components/AppBar';
import FolderTree from '../components/FolderTree';
import CustomToolbar from '../components/Toolbar';
import FileTable from '../components/FileTable';
import ItemDetails from '../components/ItemDetails';
import Resizer from '../components/Resizer';
import { AppContext } from '../context/AppContext';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FolderIcon from '@mui/icons-material/Folder'; // For path input
import { Box } from '@mui/material'; // For themed background and footer

const SiteContent = () => {
  const { selectedFolder, setSelectedFolder, pathError, setPathError, selectedItem } = useContext(AppContext);
  const [pathInput, setPathInput] = useState('/');
  const [showDetails, setShowDetails] = useState(!!selectedItem); // Initially show if item selected

  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem('leftPanelWidth');
    return saved ? parseInt(saved, 10) : 450;
  });
  const [rightWidth, setRightWidth] = useState(() => {
    const saved = localStorage.getItem('rightPanelWidth');
    return saved ? parseInt(saved, 10) : 300;
  });
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('leftPanelWidth', leftWidth);
  }, [leftWidth]);

  useEffect(() => {
    localStorage.setItem('rightPanelWidth', rightWidth);
  }, [rightWidth]);

  useEffect(() => {
    let path = selectedFolder?.path || '/';
    if (path !== '/' && !path.endsWith('/')) {
      path += '/';
    }
    setPathInput(path);
    setPathError(false);
  }, [selectedFolder]);

  useEffect(() => {
    if (selectedItem) {
      setShowDetails(true); // Auto-show when an item is selected
    }
  }, [selectedItem]);

  const handlePathSubmit = (e) => {
    if (e.key === 'Enter') {
      let newPath = e.target.value.trim();
      if (!newPath.startsWith('/')) {
        setPathError(true);
        return;
      }
      setPathError(false);
      newPath = newPath.replace(/\/+/g, '/'); // Normalize multiple slashes
      if (newPath === '/') {
        setSelectedFolder(null);
        return;
      }
      // Ensure ends with '/'
      if (!newPath.endsWith('/')) {
        newPath += '/';
      }
      const levels = newPath.split('/').filter((p) => p);
      const name = levels[levels.length - 1] || '';
      setSelectedFolder({ id: null, name, path: newPath });
    }
  };

  const toggleDetails = () => setShowDetails((prev) => !prev);

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <CustomAppBar />
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <Box ref={leftPanelRef} sx={{ width: leftWidth, minWidth: 150, maxWidth: '50vw', overflow: 'hidden' }}>
          <FolderTree />
        </Box>
        <Resizer panelRef={leftPanelRef} setPanelWidth={setLeftWidth} isLeftPanel={true} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2 }}>
          <CustomToolbar showDetails={showDetails} toggleDetails={toggleDetails} />
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', pt: 1, pr: showDetails ? 2 : 0 }}>
              <TextField
                fullWidth
                label="Folder Path"
                variant="outlined"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                onKeyDown={handlePathSubmit}
                error={pathError}
                helperText={pathError ? 'Invalid path' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FolderIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                autoComplete="off" // Disable history suggestions
                sx={{ mb: 2, borderRadius: '8px' }} // Rounded and polished
              />
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <FileTable />
              </Box>
            </Box>
            {showDetails && (
              <>
                <Resizer panelRef={rightPanelRef} setPanelWidth={setRightWidth} isLeftPanel={false} />
                <Box ref={rightPanelRef} sx={{ width: rightWidth, minWidth: 200, maxWidth: '50vw', overflow: 'hidden' }}>
                  <ItemDetails />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SiteContent;
