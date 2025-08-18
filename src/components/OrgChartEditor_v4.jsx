import React, { useState } from 'react';
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { mockOrgChartData } from '../mock/data';

const flattenData = (data, parentId = null) => {
  let rows = [];

  // Director
  rows.push({
    id: 'director',
    parentId: null,
    type: 'director',
    nameEn: data.director.name.en,
    nameTc: data.director.name.tc,
    nameSc: data.director.name.sc,
    titleEn: data.director.title.en,
    titleTc: data.director.title.tc,
    titleSc: data.director.title.sc,
    path: ['director'],
  });

  // Offices
  data.offices.forEach((office, officeIdx) => {
    const officeId = `office-${officeIdx}`;
    rows.push({
      id: officeId,
      parentId: 'director',
      type: 'office',
      nameEn: office.officeName.en,
      nameTc: office.officeName.tc,
      nameSc: office.officeName.sc,
      path: ['offices', officeIdx, 'officeName'],
    });

    // Deputies
    office.deputies.forEach((deputy, depIdx) => {
      const depId = `${officeId}-deputy-${depIdx}`;
      rows.push({
        id: depId,
        parentId: officeId,
        type: 'deputy',
        nameEn: deputy.personName.en,
        nameTc: deputy.personName.tc,
        nameSc: deputy.personName.sc,
        titleEn: deputy.branchTitle.en,
        titleTc: deputy.branchTitle.tc,
        titleSc: deputy.branchTitle.sc,
        path: ['offices', officeIdx, 'deputies', depIdx],
      });

      // Responsibilities (as children for simplicity)
      deputy.responsibilities.forEach((resp, respIdx) => {
        rows.push({
          id: `${depId}-resp-${respIdx}`,
          parentId: depId,
          type: 'responsibility',
          nameEn: resp.en,
          nameTc: resp.tc,
          nameSc: resp.sc,
          path: ['offices', officeIdx, 'deputies', depIdx, 'responsibilities', respIdx],
        });
      });

      // Assistants
      deputy.assistants.forEach((assistant, assIdx) => {
        const assId = `${depId}-assistant-${assIdx}`;
        rows.push({
          id: assId,
          parentId: depId,
          type: 'assistant',
          nameEn: assistant.personName.en,
          nameTc: assistant.personName.tc,
          nameSc: assistant.personName.sc,
          titleEn: assistant.branchTitle.en,
          titleTc: assistant.branchTitle.tc,
          titleSc: assistant.branchTitle.sc,
          path: ['offices', officeIdx, 'deputies', depIdx, 'assistants', assIdx],
        });

        // Assistant Responsibilities
        assistant.responsibilities.forEach((resp, respIdx) => {
          rows.push({
            id: `${assId}-resp-${respIdx}`,
            parentId: assId,
            type: 'responsibility',
            nameEn: resp.en,
            nameTc: resp.tc,
            nameSc: resp.sc,
            path: ['offices', officeIdx, 'deputies', depIdx, 'assistants', assIdx, 'responsibilities', respIdx],
          });
        });
      });
    });
  });

  return rows;
};

const OrgChartEditor_v4 = () => {
  const [data, setData] = useState(mockOrgChartData);
  const [rows, setRows] = useState(flattenData(mockOrgChartData));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);

  const handleConfirm = () => {
    if (confirmCallback) confirmCallback();
    setConfirmOpen(false);
  };

  const handleCancel = () => setConfirmOpen(false);

  const updateField = (path, field, lang, value) => {
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      if (lang) {
        current[path[path.length - 1]][lang] = value;
      } else {
        current[path[path.length - 1]] = value;
      }
      setRows(flattenData(newData));
      return newData;
    });
  };

  const addItem = (parentRow, type) => {
    if (!parentRow) return; // For adding top-level, e.g., office
    const { path, id: parentId } = parentRow;
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path.slice(0, -1)) {
        current = current[key];
      }
      const lastKey = path[path.length - 1];
      if (type === 'office') {
        newData.offices.push({
          officeName: { en: '', tc: '', sc: '' },
          deputies: [],
        });
      } else if (type === 'deputy' && parentRow.type === 'office') {
        current[lastKey].deputies.push({
          branchTitle: { en: '', tc: '', sc: '' },
          personName: { en: '', tc: '', sc: '' },
          responsibilities: [],
          assistants: [],
        });
      } else if (type === 'assistant' && parentRow.type === 'deputy') {
        current[lastKey].assistants.push({
          branchTitle: { en: '', tc: '', sc: '' },
          personName: { en: '', tc: '', sc: '' },
          responsibilities: [],
        });
      } else if (type === 'responsibility') {
        current[lastKey].responsibilities.push({ en: '', tc: '', sc: '' });
      }
      setRows(flattenData(newData));
      return newData;
    });
  };

  const removeItem = (row) => {
    const { path } = row;
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 2; i++) { // Up to grandparent
        current = current[path[i]];
      }
      const parentKey = path[path.length - 2];
      const idx = path[path.length - 1];
      current[parentKey].splice(idx, 1);
      setRows(flattenData(newData));
      return newData;
    });
  };

  const columns = [
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'nameEn', headerName: 'Name (EN)', width: 200, editable: true },
    { field: 'nameTc', headerName: 'Name (TC)', width: 200, editable: true },
    { field: 'nameSc', headerName: 'Name (SC)', width: 200, editable: true },
    { field: 'titleEn', headerName: 'Title (EN)', width: 200, editable: true },
    { field: 'titleTc', headerName: 'Title (TC)', width: 200, editable: true },
    { field: 'titleSc', headerName: 'Title (SC)', width: 200, editable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <>
          <Button size="small" onClick={() => addItem(params.row, getChildType(params.row.type))}>Add Child</Button>
          <Button size="small" color="error" onClick={() => {
            setConfirmMessage('Remove this item?');
            setConfirmCallback(() => () => removeItem(params.row));
            setConfirmOpen(true);
          }}>Remove</Button>
        </>
      ),
    },
  ];

  const getChildType = (parentType) => {
    switch (parentType) {
      case 'director': return 'office';
      case 'office': return 'deputy';
      case 'deputy': return 'assistant';
      case 'assistant': return 'responsibility';
      default: return 'responsibility';
    }
  };

  const processRowUpdate = (newRow) => {
    const { path, type } = newRow;
    if (type === 'responsibility') {
      updateField(path, null, 'en', newRow.nameEn);
      updateField(path, null, 'tc', newRow.nameTc);
      updateField(path, null, 'sc', newRow.nameSc);
    } else {
      updateField([...path, 'personName' || 'officeName' || 'name'], 'en', newRow.nameEn);
      updateField([...path, 'personName' || 'officeName' || 'name'], 'tc', newRow.nameTc);
      updateField([...path, 'personName' || 'officeName' || 'name'], 'sc', newRow.nameSc);
      updateField([...path, 'branchTitle' || 'title'], 'en', newRow.titleEn);
      updateField([...path, 'branchTitle' || 'title'], 'tc', newRow.titleTc);
      updateField([...path, 'branchTitle' || 'title'], 'sc', newRow.titleSc);
    }
    return newRow;
  };

  const getTreeDataPath = (row) => row.path.map((p) => (typeof p === 'number' ? `idx-${p}` : p)); // For tree rendering

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGridPro
        rows={rows}
        columns={columns}
        treeData
        getTreeDataPath={getTreeDataPath}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(error) => console.error(error)}
        slots={{ toolbar: GridToolbar }}
        initialState={{
          pinnedColumns: { left: ['__tree_data_group__', 'type'] },
        }}
      />
      <Button startIcon={<AddIcon />} onClick={() => addItem({ type: 'director', path: ['director'] }, 'office')}>
        Add Office
      </Button>
      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent><DialogContentText>{confirmMessage}</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} color="error">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrgChartEditor_v4;