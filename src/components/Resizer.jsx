import React from 'react';
import Box from '@mui/material/Box';

const Resizer = ({ panelRef, setPanelWidth, isLeftPanel = true }) => {
  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelRef.current?.offsetWidth ?? 0;

    const handleMouseMove = (e) => {
      let delta = e.clientX - startX;
      if (!isLeftPanel) delta = -delta;
      const newWidth = Math.max(150, Math.min(600, startWidth + delta));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Box
      sx={{
        width: '5px',
        backgroundColor: 'divider',
        cursor: 'col-resize',
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: 'primary.main',
        },
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default Resizer;