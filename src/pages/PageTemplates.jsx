import React, { useContext, useState, useEffect } from 'react';
import CustomAppBar from '../components/AppBar';
import { AppContext } from '../context/AppContext';
import { Box, List, ListItemButton, ListItemText, ListItemIcon, Typography, Tooltip, IconButton, Drawer, Toolbar } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import OrgChartEditorV0 from '../components/OrgChartEditorV0';
import OrgChartEditorV1 from '../components/OrgChartEditorV1';
import OrgChartEditorTreeView from '../components/OrgChartEditorTreeView';
import OrgChartEditor from '../components/org-chart-editor/OrgChartEditor';
import OrgChartEditorV2 from '../components/OrgChartEditorV2';
import OrgChartEditorV3 from '../components/OrgChartEditorV3';
import OrgChartEditorV4 from '../components/OrgChartEditorV4';
import OrgChartEditorV5 from '../components/OrgChartEditorV5';
import OrgChartEditorV6 from '../components/OrgChartEditorV6';
import ItemDetails from '../components/ItemDetails';

const PageTemplates = () => {
  const { selectedItem, setSelectedItem } = useContext(AppContext);
  const [templates, setTemplates] = useState([
    { id: 'org-chart-original', name: 'Org Chart Template (Original)' },
    { id: 'org-chart-v1', name: 'Org Chart Template (v1: Tree View Sidebar)' },
    { id: 'org-chart-v1-2', name: 'Org Chart Template (v1-2: Tree View Sidebar)' },
    { id: 'org-chart-v1-3', name: 'Org Chart Template (v1-3: Tree View Sidebar)' },
    { id: 'org-chart-v2', name: 'Org Chart Template (v2: Accordion Wizard)' },
    { id: 'org-chart-v3', name: 'Org Chart Template (v3: Tabbed Multi-View)' },
    { id: 'org-chart-v4', name: 'Org Chart Template (v4: Grid/Table)' },
    { id: 'org-chart-v5', name: 'Org Chart Template (v5: Card Dashboard)' },
    { id: 'org-chart-v6', name: 'Org Chart Template (Enhance Original)' },
    // Can add more templates in the future
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [leftSidebarMode, setLeftSidebarMode] = useState('full'); // 'full' or 'minimized'

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Simulate selecting an item for details; in real, fetch details
    setSelectedItem({ ...template, type: 'template', status: 'Draft' }); // Mock for now
    if (leftSidebarMode === 'full') {
      setLeftSidebarMode('minimized'); // Auto-minimize on selection
    }
  };

  const toggleLeftSidebar = () => {
    setLeftSidebarMode(leftSidebarMode === 'full' ? 'minimized' : 'full');
  };

  const renderEditor = () => {
    switch (selectedTemplate?.id) {
      case 'org-chart-original':
        return <OrgChartEditorV0 />;
      case 'org-chart-v1':
        return <OrgChartEditorV1 />;
      case 'org-chart-v1-2':
        return <OrgChartEditorTreeView />;
      case 'org-chart-v1-3':
        return <OrgChartEditor />;
      case 'org-chart-v2':
        return <OrgChartEditorV2 />;
      case 'org-chart-v3':
        return <OrgChartEditorV3 />;
      case 'org-chart-v4':
        return <OrgChartEditorV4 />;
      case 'org-chart-v5':
        return <OrgChartEditorV5 />;
      case 'org-chart-v6':
        return <OrgChartEditorV6 />;
      default:
        return null;
    }
  };

  const sidebarWidth = leftSidebarMode === 'full' ? 420 : 60;
  const isSidebarMinimized = leftSidebarMode === 'minimized';

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <CustomAppBar />
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <Drawer
          variant="permanent" // Always visible; use "temporary" for overlay
          sx={{
            width: sidebarWidth,
            flexShrink: 0, // Prevent shrinking
            '& .MuiDrawer-paper': {
              width: sidebarWidth,
              boxSizing: 'border-box',
              transition: 'width 0.3s ease', // Smooth expand/collapse
              overflowX: 'hidden', // Prevent horizontal overflow
              top: '64px', // Start below the AppBar (adjust if AppBar height differs)
              height: 'calc(100vh - 64px)', // Fill remaining height below AppBar
            },
          }}
        >
          <Box
            sx={{
              height: '100%',
              overflowY: 'auto',
              p: isSidebarMinimized ? 1.5 : 2,
              borderRight: '1px solid #e0e0e0',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: leftSidebarMode === 'full' ? 2 : 0 }}>
              {leftSidebarMode === 'full' && <Typography variant="h6">Page Templates</Typography>}
              <IconButton onClick={toggleLeftSidebar} aria-label="toggle left sidebar" size="small">
                {leftSidebarMode === 'full' ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
            </Box>
            {leftSidebarMode === 'full' && (
              <List>
                {templates.map((template) => (
                  <Tooltip key={template.id} title={isSidebarMinimized ? template.name : ''} placement="right">
                    <ListItemButton
                      selected={selectedTemplate?.id === template.id}
                      onClick={() => handleTemplateSelect(template)}
                      sx={{ justifyContent: isSidebarMinimized ? 'center' : 'initial', px: 2, mx: -2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 'auto', pr: 1 }}><DescriptionIcon /></ListItemIcon>
                      {!isSidebarMinimized && <ListItemText primary={template.name} />}
                    </ListItemButton>
                  </Tooltip>
                ))}
              </List>
            )}
          </Box>
        </Drawer>
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            minWidth: '1020px', // Example: Inner sidebar 420 + form ~600; adjust to your needs. This forces horizontal scroll if viewport < this + outer width
          }}
        >
          {selectedTemplate ? (
            <>
              {renderEditor()}
            </>
          ) : (
            <Typography variant="h6" sx={{ p: 2 }}>Select a template from the left sidebar</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PageTemplates;