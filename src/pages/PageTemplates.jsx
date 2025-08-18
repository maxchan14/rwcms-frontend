import React, { useContext, useState, useEffect, useRef } from 'react';
import CustomAppBar from '../components/AppBar';
import { AppContext } from '../context/AppContext';
import Resizer from '../components/Resizer';
import { Box, List, ListItemButton, ListItemText, ListItemIcon, Typography, Divider } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import OrgChartEditor from '../components/OrgChartEditor';
import OrgChartEditor_v1 from '../components/OrgChartEditor_v1';
import OrgChartEditor_v2 from '../components/OrgChartEditor_v2';
import OrgChartEditor_v3 from '../components/OrgChartEditor_v3';
import OrgChartEditor_v4 from '../components/OrgChartEditor_v4';
import OrgChartEditor_v5 from '../components/OrgChartEditor_v5';
import OrgChartEditor_v6 from '../components/OrgChartEditor_v6';
import ItemDetails from '../components/ItemDetails';

const PageTemplates = () => {
  const { selectedItem, setSelectedItem } = useContext(AppContext);
  const [templates, setTemplates] = useState([
    { id: 'org-chart-original', name: 'Org Chart Template (Original)' },
    { id: 'org-chart-v1', name: 'Org Chart Template (v1: Tree View Sidebar)' },
    { id: 'org-chart-v2', name: 'Org Chart Template (v2: Accordion Wizard)' },
    { id: 'org-chart-v3', name: 'Org Chart Template (v3: Tabbed Multi-View)' },
    { id: 'org-chart-v4', name: 'Org Chart Template (v4: Grid/Table)' },
    { id: 'org-chart-v5', name: 'Org Chart Template (v5: Card Dashboard)' },
    { id: 'org-chart-v6', name: 'Org Chart Template (Enhance Original)' },
    // Can add more templates in the future
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem('templateLeftPanelWidth');
    return saved ? parseInt(saved, 10) : 250;
  });
  const [rightWidth, setRightWidth] = useState(() => {
    const saved = localStorage.getItem('templateRightPanelWidth');
    return saved ? parseInt(saved, 10) : 300;
  });
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('templateLeftPanelWidth', leftWidth);
  }, [leftWidth]);

  useEffect(() => {
    localStorage.setItem('templateRightPanelWidth', rightWidth);
  }, [rightWidth]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Simulate selecting an item for details; in real, fetch details
    setSelectedItem({ ...template, type: 'template', status: 'Draft' }); // Mock for now
  };

  const renderEditor = () => {
    switch (selectedTemplate?.id) {
      case 'org-chart-original':
        return <OrgChartEditor />;
      case 'org-chart-v1':
        return <OrgChartEditor_v1 />;
      case 'org-chart-v2':
        return <OrgChartEditor_v2 />;
      case 'org-chart-v3':
        return <OrgChartEditor_v3 />;
      case 'org-chart-v4':
        return <OrgChartEditor_v4 />;
      case 'org-chart-v5':
        return <OrgChartEditor_v5 />;
      case 'org-chart-v6':
        return <OrgChartEditor_v6 />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <CustomAppBar />
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <Box ref={leftPanelRef} sx={{ width: leftWidth, minWidth: 150, maxWidth: '30vw', overflowY: 'auto', p: 2, borderRight: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Page Templates</Typography>
          <List>
            {templates.map((template) => (
              <ListItemButton
                key={template.id}
                selected={selectedTemplate?.id === template.id}
                onClick={() => handleTemplateSelect(template)}
              >
                <ListItemIcon><DescriptionIcon /></ListItemIcon>
                <ListItemText primary={template.name} />
              </ListItemButton>
            ))}
          </List>
        </Box>
        <Resizer panelRef={leftPanelRef} setPanelWidth={setLeftWidth} isLeftPanel={true} />
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {selectedTemplate ? (
            <>
              {renderEditor()}
            </>
          ) : (
            <Typography variant="h6">Select a template from the left sidebar</Typography>
          )}
        </Box>
        {selectedItem && (
          <>
            <Resizer panelRef={rightPanelRef} setPanelWidth={setRightWidth} isLeftPanel={false} />
            <Box ref={rightPanelRef} sx={{ width: rightWidth, minWidth: 200, maxWidth: '30vw', overflow: 'hidden' }}>
              <ItemDetails /> {/* Reusing; customize if needed for templates */}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default PageTemplates;