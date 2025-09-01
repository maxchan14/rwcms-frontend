import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { DataGridPro, useGridApiContext } from '@mui/x-data-grid-pro';

const MultilineEdit = (params) => {
  const { id, field, value } = params;
  const apiRef = useGridApiContext();

  const handleChange = (e) => {
    apiRef.current.setEditCellValue({ id, field, value: e.target.value });
  };

  return <TextField multiline minRows={2} fullWidth value={value || ''} onChange={handleChange} autoFocus />;
};

const ResponsibilitiesEditor = ({ data, path, onHandleChange, setFormData }) => {
  const [rows, setRows] = useState(data.responsibilities.map((r, i) => ({ ...r, id: i })));

  useEffect(() => {
    setRows(data.responsibilities.map((r, i) => ({ ...r, id: i })));
  }, [data.responsibilities]);

  const respPath = [...path, 'responsibilities'];

  const updateGlobalResponsibilities = (newResponsibilities) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < respPath.length - 1; i++) {
        current = current[respPath[i]];
      }
      current[respPath[respPath.length - 1]] = newResponsibilities;
      return newData;
    });
  };

  const handleAdd = () => {
    const newRow = { id: rows.length, en: '', tc: '', sc: '' };
    const newRows = [...rows, newRow];
    setRows(newRows);
    updateGlobalResponsibilities(newRows.map(({ id, ...rest }) => rest));
  };

  const handleRemove = (id) => {
    const newRows = rows.filter((r) => r.id !== id).map((r, i) => ({ ...r, id: i }));
    setRows(newRows);
    updateGlobalResponsibilities(newRows.map(({ id, ...rest }) => rest));
    // If you want confirmation, move this to parent and trigger dialog there
  };

  const processRowUpdate = (newRow) => {
    const updatedRows = rows.map((r) => (r.id === newRow.id ? newRow : r));
    setRows(updatedRows);
    updateGlobalResponsibilities(updatedRows.map(({ id, ...rest }) => rest));
    return newRow;
  };

  const handleRowOrderChange = (params) => {
    const { oldIndex, targetIndex } = params;
    const newRows = [...rows];
    const [movedRow] = newRows.splice(oldIndex, 1);
    newRows.splice(targetIndex, 0, movedRow);
    const reorderedRows = newRows.map((r, i) => ({ ...r, id: i }));
    setRows(reorderedRows);
    updateGlobalResponsibilities(reorderedRows.map(({ id, ...rest }) => rest));
  };

  const columns = [
    { field: 'en', headerName: 'EN', editable: true, flex: 1, sortable: false, renderEditCell: MultilineEdit, renderCell: (params) => <div style={{ whiteSpace: 'pre-wrap' }}>{params.value}</div> },
    { field: 'tc', headerName: 'TC', editable: true, flex: 1, sortable: false, renderEditCell: MultilineEdit, renderCell: (params) => <div style={{ whiteSpace: 'pre-wrap' }}>{params.value}</div> },
    { field: 'sc', headerName: 'SC', editable: true, flex: 1, sortable: false, renderEditCell: MultilineEdit, renderCell: (params) => <div style={{ whiteSpace: 'pre-wrap' }}>{params.value}</div> },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleRemove(params.row.id)}>
          <RemoveIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Responsibilities</Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Responsibility
        </Button>
      </Box>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          editMode="row"
          rowReordering
          onRowOrderChange={handleRowOrderChange}
          processRowUpdate={processRowUpdate}
          getRowHeight={() => 'auto'}
          disableColumnMenu={true}
          disableColumnResize={true}
          disableColumnReorder={true}
          sx={{
            '& .MuiDataGrid-cell': { py: 1, whiteSpace: 'normal' },
          }}
        />
      </Box>
    </>
  );
};

export default ResponsibilitiesEditor;