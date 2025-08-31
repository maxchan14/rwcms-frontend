import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { grey } from '@mui/material/colors';

const HierarchySidebar = ({ formData, selectedNodeId, setSelectedNodeId }) => {
  const buildTree = () => {
    // Tree building logic from original
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

  // Recursive component to render the hierarchy as nested lists
  const RenderHierarchy = ({ items, depth = 0 }) => (
    <List disablePadding sx={{ pl: depth }}>
      {items.map((item) => {
        const isSelected = selectedNodeId === item.id;
        return (
          <React.Fragment key={item.id}>
            <ListItem
              selected={isSelected}
              onClick={() => setSelectedNodeId(item.id)}
              button
              sx={{
                bgcolor: isSelected ? grey[300] : 'inherit',
                cursor: 'pointer',
              }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', mr: 1, }}>
                {item.id.startsWith('office-') ? <BusinessIcon /> : <PersonIcon />}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
            {item.children.length > 0 && <RenderHierarchy items={item.children} depth={4} />}
          </React.Fragment>
        );
      })}
    </List>
  );

  return (
    <Box sx={{ width: 420, borderRight: '1px solid #e0e0e0', p: 2, overflowY: 'auto' }}>
      <Typography variant="h6">Organization Hierarchy v1.3</Typography>
      <Box sx={{ mt: 2, mx: -2 }}>
        {treeData.length > 0 && RenderHierarchy({ items: treeData })}
      </Box>
    </Box>
  );
};

export default HierarchySidebar;